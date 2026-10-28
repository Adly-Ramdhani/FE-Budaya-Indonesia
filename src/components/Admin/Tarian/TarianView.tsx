import { useEffect, useState } from "react"
import AdminIcon from "../AdminIcon"

export type Dance = {
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

type TarianViewProps = {
  dances: Dance[]
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
  onEdit: (dance: Dance) => void
  onDelete: (dance: Dance) => void
}

export function DanceImage({ src, alt }: { src?: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string>()
  const [loading, setLoading] = useState(Boolean(src))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!src) {
      setBlobUrl(undefined)
      setLoading(false)
      setError(null)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | undefined
    setBlobUrl(undefined)
    setLoading(true)
    setError(null)

    fetch(src, {
      signal: controller.signal,
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch((cause: unknown) => {
        if (cause instanceof Error && cause.name === "AbortError") return
        const message =
          cause instanceof Error ? cause.message : "Gagal memuat gambar"
        console.error(`Gagal memuat gambar tarian "${alt}":`, cause)
        setError(message)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false)
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, alt])

  if (blobUrl) return <img src={blobUrl} alt={alt} loading="lazy" />

  return (
    <div
      className="house-image-placeholder"
      role={error ? "img" : undefined}
      aria-label={error ? `${alt}: ${error}` : undefined}
    >
      {loading
        ? "Memuat gambar..."
        : error
          ? "Gambar gagal dimuat"
          : "Gambar tidak tersedia"}
    </div>
  )
}

export default function TarianView({
  dances,
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
  onEdit,
  onDelete,
}: TarianViewProps) {
  return (
    <>
      <section className="content">
        <section className="page-heading">
          <div>
            <p>Koleksi Budaya / Pengelolaan Konten</p>
            <h2>Tarian Nusantara</h2>
            <span>
              Jelajahi ragam gerak dan cerita tari dari seluruh Indonesia.
            </span>
          </div>
          <button className="add-button tarian-add-button" onClick={onAdd}>
            <AdminIcon name="plus" /> Tambah Tarian
          </button>
        </section>

        <section className="filters">
          <label className="search-field">
            <span>Cari tarian</span>
            <div>
              <AdminIcon name="search" />
              <input
                value={query}
                onChange={(event) => onQueryChange(event.target.value)}
                placeholder="Cari nama tarian, deskripsi, atau daerah..."
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
          <b>{loading ? "Memuat tarian..." : `${dances.length} tarian`}</b>
          <span>
            {error ? `API bermasalah (${error})` : "Data dari API /v1/dances"}
          </span>
          <span>Urutan: Terakhir diperbarui</span>
        </section>

        {loading ? (
          <div className="empty-state" role="status">
            <p>Sedang memuat data tarian dari server...</p>
          </div>
        ) : error ? (
          <section className="empty-state" role="alert">
            <h3>Gagal memuat data tarian</h3>
            <p>{error}</p>
          </section>
        ) : dances.length ? (
          <section
            className={`instrument-grid ${view === "list" ? "list-view" : ""}`}
          >
            {dances.map((dance) => (
              <article
                className={`instrument-card ${view === "list" ? "list-card" : ""}`}
                key={dance.id}
              >
                <DanceImage src={dance.image} alt={dance.name} />
                <div className="card-content">
                  <div className="card-meta">
                    <span>{dance.province}</span>
                    <span
                      className={`status ${dance.status.toLocaleLowerCase("id-ID") === "draft" ? "draft" : ""}`}
                    >
                      <i />
                      {dance.status}
                    </span>
                  </div>
                  <h3>{dance.name}</h3>
                  <p className="card-description">{dance.description}</p>
                </div>
                <div className="card-actions">
                  <button type="button" onClick={() => onEdit(dance)}>
                    <AdminIcon name="edit" /> Edit
                  </button>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => onDelete(dance)}
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
                ? "Tarian tidak ditemukan"
                : "Belum ada data tarian"}
            </h3>
            <p>
              {query || province || filterIslandId || status !== "Semua status"
                ? "Coba ubah atau atur ulang filter."
                : "Belum ada data yang tersedia dari API /v1/dances."}
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
