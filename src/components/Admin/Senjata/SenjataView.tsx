import { useEffect, useState } from "react"
import AdminIcon from "../AdminIcon"

export type TraditionalWeapon = {
  id: string | number
  name: string
  provinceId: string
  islandId: string
  province: string
  description: string
  status: string
  image?: string
}

export type Island = {
  id: string | number
  name: string
}

export type Province = {
  id: string | number
  name: string
  islandId: string
}

type SenjataViewProps = {
  weapons: TraditionalWeapon[]
  islands: Island[]
  provinces: Province[]
  filterIslandId: string
  province: string
  query: string
  status: string
  view: "grid" | "list"
  loading: boolean
  error: string | null
  islandsLoading: boolean
  islandsError: string | null
  provincesError: string | null
  onQueryChange: (query: string) => void
  onFilterIslandChange: (islandId: string) => void
  onProvinceChange: (provinceId: string) => void
  onStatusChange: (status: string) => void
  onViewChange: (view: "grid" | "list") => void
  onResetFilters: () => void
  onAdd: () => void
  onPreview: (weapon: TraditionalWeapon) => void
  onEdit: (weapon: TraditionalWeapon) => void
  onDelete: (weapon: TraditionalWeapon) => void
}

export function WeaponImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  return (
    <div
      className="house-image-placeholder"
      role={!src || failed ? "img" : undefined}
      aria-label={!src || failed ? `${alt}: Gambar tidak tersedia` : undefined}
    >
      {src && !failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => {
            console.error(`Gagal memuat gambar senjata tradisional "${alt}".`)
            setFailed(true)
          }}
        />
      ) : (
        "Gambar tidak tersedia"
      )}
    </div>
  )
}

export default function SenjataView({
  weapons,
  islands,
  provinces,
  filterIslandId,
  province,
  query,
  status,
  view,
  loading,
  error,
  islandsLoading,
  islandsError,
  provincesError,
  onQueryChange,
  onFilterIslandChange,
  onProvinceChange,
  onStatusChange,
  onViewChange,
  onResetFilters,
  onAdd,
  onPreview,
  onEdit,
  onDelete,
}: SenjataViewProps) {
  return (
    <>
      <section className="content">
        <section className="page-heading">
          <div>
            <p>Koleksi Budaya / Pengelolaan Konten</p>
            <h2>Senjata Tradisional Nusantara</h2>
            <span>
              Jelajahi keragaman senjata dan cerita sejarah dari seluruh Indonesia.
            </span>
          </div>
          <button className="add-button senjata-add-button" onClick={onAdd}>
            <AdminIcon name="plus" /> Tambah Senjata
          </button>
        </section>

        <section className="filters">
          <label className="search-field">
            <span>Cari senjata</span>
            <div>
              <AdminIcon name="search" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari nama senjata, deskripsi, atau daerah..."
              />
            </div>
          </label>
          <label>
            <span>Pulau</span>
            <select
              value={filterIslandId}
              onChange={(event) => onFilterIslandChange(event.target.value)}
              disabled={islandsLoading || Boolean(islandsError)}
            >
              <option value="">
                {islandsLoading ? "Memuat pulau..." : "Semua pulau"}
              </option>
              {islands.map((island) => (
                <option key={island.id} value={island.id}>
                  {island.name}
                </option>
              ))}
            </select>
            {islandsError && (
              <span role="alert" style={{ color: "#af4632" }}>
                Gagal memuat pulau: {islandsError}
              </span>
            )}
          </label>
          <label>
            <span>Provinsi</span>
            <select
              value={province}
              onChange={(event) => onProvinceChange(event.target.value)}
              disabled={!filterIslandId || Boolean(provincesError)}
            >
              <option value="">
                {!filterIslandId
                  ? "Pilih pulau terlebih dahulu"
                  : "Semua provinsi"}
              </option>
              {provinces.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {provincesError && (
              <span role="alert" style={{ color: "#af4632" }}>
                Gagal memuat provinsi: {provincesError}
              </span>
            )}
          </label>
          <label>
            <span>Status</span>
            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
            >
              <option value="Semua status">Semua status</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <div className="view-filter">
            <span>Tampilan</span>
            <div>
              <button
                className={view === "grid" ? "active" : ""}
                onClick={() => onViewChange("grid")}
                aria-label="Tampilan grid"
              >
                <AdminIcon name="grid" />
              </button>
              <button
                className={view === "list" ? "active" : ""}
                onClick={() => onViewChange("list")}
                aria-label="Tampilan daftar"
              >
                <AdminIcon name="list" />
              </button>
            </div>
          </div>
        </section>

        <section className="result-bar" aria-live="polite">
          <b>
            {loading ? "Memuat senjata..." : `${weapons.length} senjata`}
          </b>
          <span>
            {error
              ? `API bermasalah (${error})`
              : "Data dari API /api/traditional-weapons"}
          </span>
          <span>Urutan: Terakhir diperbarui</span>
        </section>

        {loading ? (
          <div className="empty-state" role="status">
            <p>Sedang memuat data senjata tradisional dari server...</p>
          </div>
        ) : error ? (
          <section className="empty-state" role="alert">
            <h3>Gagal memuat data senjata tradisional</h3>
            <p>{error}</p>
          </section>
        ) : weapons.length ? (
          <section
            className={`instrument-grid ${view === "list" ? "list-view" : ""}`}
          >
            {weapons.map((weapon) => (
              <article
                className={`instrument-card ${view === "list" ? "list-card" : ""}`}
                key={weapon.id}
              >
                <WeaponImage src={weapon.image} alt={weapon.name} />
                <div className="card-content">
                  <div className="card-meta">
                    <span>{weapon.province}</span>
                    <span
                      className={`status ${weapon.status.toLocaleLowerCase("id-ID") === "draft" ? "draft" : ""}`}
                    >
                      <i />
                      {weapon.status}
                    </span>
                  </div>
                  <h3>{weapon.name}</h3>
                  <p className="card-description">{weapon.description}</p>
                  <button
                    className="preview-link"
                    type="button"
                    onClick={() => onPreview(weapon)}
                  >
                    Lihat pratinjau <AdminIcon name="arrow" />
                  </button>
                </div>
                <div className="card-actions">
                  <button type="button" onClick={() => onEdit(weapon)}>
                    <AdminIcon name="edit" /> Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(weapon)}
                  >
                    <AdminIcon name="trash" /> Hapus
                  </button>
                </div>
              </article>
            ))}
          </section>
        ) : (
          <section className="empty-state">
            <AdminIcon name="search" />
            <h3>
              {query || province || filterIslandId || status !== "Semua status"
                ? "Senjata tidak ditemukan"
                : "Belum ada data senjata tradisional"}
            </h3>
            <p>
              {query || province || filterIslandId || status !== "Semua status"
                ? "Coba ubah atau atur ulang filter."
                : "Belum ada data yang tersedia dari API /api/traditional-weapons."}
            </p>
            {(query || province || filterIslandId || status !== "Semua status") && (
              <button type="button" onClick={onResetFilters}>
                Atur ulang filter
              </button>
            )}
          </section>
        )}
      </section>
    </>
  )
}
