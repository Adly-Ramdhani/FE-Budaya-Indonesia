import AdminIcon from "./AdminIcon"
import type { Instrument, Island, Province } from "./types"

type MusikViewProps = {
  apiUrl: string
  apiError: string | null
  filterIslandId: string
  filterProvinces: Province[]
  filterProvincesError: string | null
  filterProvincesLoading: boolean
  filtered: Instrument[]
  islands: Island[]
  islandsError: string | null
  islandsLoading: boolean
  loading: boolean
  onAddSong: () => void
  onDeleteSong: (song: Instrument) => void
  onFilterIslandChange: (islandId: string) => void
  onPreviewSong: (song: Instrument) => void
  onQueryChange: (query: string) => void
  onRegionChange: (region: string) => void
  onResetFilters: () => void
  onStatusChange: (status: string) => void
  onViewChange: (view: "grid" | "list") => void
  onProvinceChange: (province: string) => void
  onAction: (message: string) => void
  province: string
  query: string
  region: string
  status: string
  view: "grid" | "list"
}

function formatProvince(name: string): string {
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function InstrumentCard({
  instrument,
  view,
  onPreview,
  onAction,
  onDelete,
}: {
  instrument: Instrument
  view: "grid" | "list"
  onPreview: (instrument: Instrument) => void
  onAction: (message: string) => void
  onDelete: (instrument: Instrument) => void
}) {
  return (
    <article
      className={`instrument-card ${view === "list" ? "list-card" : ""}`}
    >
      <div className="card-content">
        <div className="card-meta">
          <span>{instrument.province}</span>
          <span
            className={`status ${instrument.status === "Draf" ? "draft" : ""}`}
          >
            <i />
            {instrument.status}
          </span>
        </div>
        <h3>{instrument.name}</h3>
        <p className="card-description">{instrument.description}</p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "8px 14px",
            fontSize: "11px",
            color: "#6e756f",
            marginTop: "6px",
          }}
        >
          {instrument.composer && (
            <span>
              <b>Pencipta:</b> {instrument.composer}
            </span>
          )}
          {instrument.language && (
            <span>
              <b>Bahasa:</b> {instrument.language}
            </span>
          )}
        </div>
        <p className="updated">Diperbarui {instrument.updated}</p>
        <button className="preview-link" onClick={() => onPreview(instrument)}>
          Lihat pratinjau <AdminIcon name="arrow" />
        </button>
      </div>
      <div className="card-actions">
        <button onClick={() => onAction(`${instrument.name} siap diedit`)}>
          <AdminIcon name="edit" /> Edit
        </button>
        <button className="danger" onClick={() => onDelete(instrument)}>
          <AdminIcon name="trash" /> Hapus
        </button>
      </div>
    </article>
  )
}

export default function MusikView({
  apiUrl,
  apiError,
  filterIslandId,
  filterProvinces,
  filterProvincesError,
  filterProvincesLoading,
  filtered,
  islands,
  islandsError,
  islandsLoading,
  loading,
  onAddSong,
  onDeleteSong,
  onFilterIslandChange,
  onPreviewSong,
  onQueryChange,
  onRegionChange,
  onResetFilters,
  onStatusChange,
  onViewChange,
  onProvinceChange,
  onAction,
  province,
  query,
  region,
  status,
  view,
}: MusikViewProps) {
  return (
    <main className="content">
      <section className="page-heading">
        <div>
          <p>Koleksi Budaya / Pengelolaan Konten</p>
          <h2>Lagu Daerah & Musik Nusantara</h2>
          <span>Rawat cerita di balik nada, melodi, dan harmoni Nusantara.</span>
        </div>
        <button className="add-button" onClick={onAddSong}>
          <AdminIcon name="plus" /> Tambah Lagu Daerah
        </button>
      </section>

      <section className="filters">
        <label className="search-field">
          <span>Cari lagu daerah</span>
          <div>
            <AdminIcon name="search" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Cari judul lagu, lirik, pencipta, atau daerah..."
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
            disabled={
              !filterIslandId ||
              filterProvincesLoading ||
              Boolean(filterProvincesError)
            }
          >
            <option value="Semua provinsi">
              {!filterIslandId
                ? "Pilih pulau terlebih dahulu"
                : filterProvincesLoading
                  ? "Memuat provinsi..."
                  : "Semua provinsi"}
            </option>
            {filterProvinces.map((item) => (
              <option key={item.id} value={formatProvince(item.name)}>
                {formatProvince(item.name)}
              </option>
            ))}
          </select>
          {filterProvincesError && (
            <span role="alert" style={{ color: "#af4632" }}>
              Gagal memuat provinsi: {filterProvincesError}
            </span>
          )}
        </label>
        <label>
          <span>Status</span>
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option>Semua status</option>
            <option>Terbit</option>
            <option>Draf</option>
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

      <section className="result-bar">
        <b>{filtered.length} lagu</b>
        <span>
          {loading
            ? "Menghubungkan ke API..."
            : apiError
              ? `Offline (${apiError})`
              : "Sinkronisasi API aktif"}
        </span>
        <span>Urutan: Terakhir diperbarui</span>
      </section>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "#6e756f",
          }}
        >
          <p
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "#1f4230",
              marginBottom: 8,
            }}
          >
            Sedang memuat data lagu dari server API...
          </p>
          <span style={{ fontSize: 13, color: "#8a918b" }}>
            Mengambil koleksi dari {apiUrl || "/api/songs"}
          </span>
        </div>
      ) : filtered.length ? (
        <section className={`instrument-grid ${view === "list" ? "list-view" : ""}`}>
          {filtered.map((song) => (
            <InstrumentCard
              key={song.id}
              instrument={song}
              view={view}
              onPreview={onPreviewSong}
              onAction={onAction}
              onDelete={onDeleteSong}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <AdminIcon name="search" />
          <h3>
            {apiError ? "Gagal memuat data dari server" : "Konten tidak ditemukan"}
          </h3>
          <p>
            {apiError
              ? `Koneksi API bermasalah (${apiError}). Pastikan backend Laravel / ngrok sedang aktif.`
              : "Belum ada data lagu di database atau tidak ada yang sesuai filter."}
          </p>
          <button onClick={onResetFilters}>Atur ulang filter</button>
        </section>
      )}

      <section className="pagination-wrap">
        <p>Menampilkan 1–{filtered.length} lagu daerah</p>
        <div className="pagination">
          <button aria-label="Halaman sebelumnya">‹</button>
          <button className="active">1</button>
          <button aria-label="Halaman berikutnya">›</button>
        </div>
      </section>
    </main>
  )
}
