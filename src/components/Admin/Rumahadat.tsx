import { useEffect, useMemo, useState } from "react"
import AdminIcon from "./AdminIcon"

export type TraditionalHouse = {
  id: string | number
  name: string
  province: string
  island: string
  description: string
  image?: string
}

type ApiProvince = {
  name?: string
  island?: {
    name?: string
  }
}

type ApiTraditionalHouse = {
  id?: string | number
  name?: string
  description?: string
  image_url?: string
  province?: ApiProvince | null
}

type RumahadatProps = {
  apiUrl: string
  query: string
  onQueryChange: (query: string) => void
  onAction: (message: string) => void
  onDeleteHouse: (house: TraditionalHouse) => Promise<boolean>
}

function resolveImage(image?: string, apiUrl?: string): string | undefined {
  if (!image) return undefined
  if (/^https?:\/\/(127\.0\.0\.1|localhost)(:\d+)?\//i.test(image)) {
    const imagePath = new URL(image).pathname
    return apiUrl ? `${apiUrl}${imagePath}` : image
  }
  if (/^https?:\/\//i.test(image)) {
    return image.replace(/^http:\/\//i, "https://")
  }
  if (image.startsWith("/")) return `${apiUrl}${image}`
  return image
}

function getHouseList(payload: unknown): ApiTraditionalHouse[] {
  if (Array.isArray(payload)) return payload as ApiTraditionalHouse[]
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as ApiTraditionalHouse[]
  }
  throw new Error("Format data API rumah adat tidak valid")
}

function HouseImage({ src, alt }: { src?: string; alt: string }) {
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
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Gagal memuat gambar"
        console.error(`Gagal memuat gambar rumah adat "${alt}":`, err)
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
      {loading ? "Memuat gambar..." : error ? "Gambar gagal dimuat" : "Gambar tidak tersedia"}
    </div>
  )
}

function HouseCard({
  house,
  onPreview,
  onAction,
  onDelete,
}: {
  house: TraditionalHouse
  onPreview: (house: TraditionalHouse) => void
  onAction: (message: string) => void
  onDelete: (house: TraditionalHouse) => void
}) {
  return (
    <article className="instrument-card">
      <HouseImage src={house.image} alt={house.name} />
      <div className="card-content">
        <div className="card-meta">
          <span>{house.province || "Nusantara"}</span>
          {house.island && <span className="status">{house.island}</span>}
        </div>
        <h3>{house.name}</h3>
        <p className="card-description">{house.description}</p>
        <button className="preview-link" onClick={() => onPreview(house)}>
          Lihat pratinjau <AdminIcon name="arrow" />
        </button>
      </div>
      <div className="card-actions">
        <button onClick={() => onAction(`${house.name} siap diedit`)}>
          <AdminIcon name="edit" /> Edit
        </button>
        <button className="danger" onClick={() => onDelete(house)}>
          <AdminIcon name="trash" /> Hapus
        </button>
      </div>
    </article>
  )
}

export default function Rumahadat({
  apiUrl,
  query,
  onQueryChange,
  onAction,
  onDeleteHouse,
}: RumahadatProps) {
  const [houses, setHouses] = useState<TraditionalHouse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [province, setProvince] = useState("Semua daerah")
  const [island, setIsland] = useState("Semua pulau")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [previewHouse, setPreviewHouse] = useState<TraditionalHouse | null>(
    null,
  )
  const [deletingHouseId, setDeletingHouseId] = useState<string | number | null>(
    null,
  )

  async function handleDeleteHouse(house: TraditionalHouse) {
    if (deletingHouseId !== null) return
    setDeletingHouseId(house.id)
    try {
      if (await onDeleteHouse(house)) {
        setHouses((current) => current.filter((item) => item.id !== house.id))
        if (previewHouse?.id === house.id) setPreviewHouse(null)
      }
    } finally {
      setDeletingHouseId(null)
    }
  }

  useEffect(() => {
    const controller = new AbortController()

    async function fetchHouses() {
      setLoading(true)
      try {
        const response = await fetch(`${apiUrl}/api/traditional-houses`, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)

        const records = getHouseList(await response.json())
        const mapped = records.map((item): TraditionalHouse => {
          return {
            id: item.id ?? item.name ?? "",
            name: item.name ?? "",
            province: item.province?.name ?? "",
            island: item.province?.island?.name ?? "",
            description: String(item.description ?? ""),
            image: resolveImage(item.image_url, apiUrl),
          }
        })

        setHouses(mapped)
        setError(null)
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Gagal memuat data rumah adat"
        console.error("Gagal mengambil rumah adat dari API:", err)
        setError(message)
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }

    fetchHouses()
    return () => controller.abort()
  }, [apiUrl])

  const islands = useMemo(
    () =>
      Array.from(new Set(houses.map((house) => house.island).filter(Boolean))),
    [houses],
  )
  const provinces = useMemo(
    () =>
      Array.from(
        new Set(houses.map((house) => house.province).filter(Boolean)),
      ),
    [houses],
  )
  const filteredHouses = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    return houses.filter((house) => {
      const searchable =
        `${house.name} ${house.province} ${house.island} ${house.description}`.toLocaleLowerCase(
          "id-ID",
        )
      return (
        searchable.includes(normalizedQuery) &&
        (province === "Semua daerah" || house.province === province) &&
        (island === "Semua pulau" || house.island === island)
      )
    })
  }, [houses, island, province, query])

  return (
    <main className="content">
      <section className="page-heading">
        <div>
          <p>Koleksi Budaya / Pengelolaan Konten</p>
          <h2>Rumah Adat Nusantara</h2>
          <span>Kelola koleksi rumah adat dari berbagai daerah Indonesia.</span>
        </div>
      </section>

      <section className="filters">
        <label className="search-field">
          <span>Cari rumah adat</span>
          <div>
            <AdminIcon name="search" />
            <input
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              placeholder="Cari rumah, daerah, kategori..."
            />
          </div>
        </label>
          <label>
          <span>Pulau</span>
          <select
            value={island}
            onChange={(event) => setIsland(event.target.value)}
          >
            <option>Semua pulau</option>
            {islands.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Daerah</span>
          <select
            value={province}
            onChange={(event) => setProvince(event.target.value)}
          >
            <option>Semua daerah</option>
            {provinces.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <div className="view-filter">
          <span>Tampilan</span>
          <div>
            <button
              className={view === "grid" ? "active" : ""}
              onClick={() => setView("grid")}
              aria-label="Tampilan grid"
            >
              <AdminIcon name="grid" />
            </button>
            <button
              className={view === "list" ? "active" : ""}
              onClick={() => setView("list")}
              aria-label="Tampilan daftar"
            >
              <AdminIcon name="list" />
            </button>
          </div>
        </div>
      </section>

      <section className="result-bar">
        <b>{filteredHouses.length} rumah adat</b>
        <span>
          {loading
            ? "Menghubungkan ke API..."
            : error
              ? `Offline (${error})`
              : "Sinkronisasi API aktif"}
        </span>
        <span>Data dari server</span>
      </section>

      {loading ? (
        <div className="empty-state">Sedang memuat data rumah adat...</div>
      ) : error ? (
        <section className="empty-state" role="alert">
          <h3>Gagal memuat data rumah adat</h3>
          <p>{error}</p>
        </section>
      ) : filteredHouses.length ? (
        <section
          className={`instrument-grid ${view === "list" ? "list-view" : ""}`}
        >
          {filteredHouses.map((house) => (
            <HouseCard
              key={house.id}
              house={house}
              onPreview={setPreviewHouse}
              onAction={onAction}
              onDelete={handleDeleteHouse}
            />
          ))}
        </section>
      ) : (
        <section className="empty-state">
          <AdminIcon name="search" />
          <h3>Konten tidak ditemukan</h3>
          <p>Belum ada rumah adat yang sesuai dengan filter.</p>
          <button
            onClick={() => {
              onQueryChange("")
              setProvince("Semua daerah")
              setIsland("Semua pulau")
            }}
          >
            Atur ulang filter
          </button>
        </section>
      )}

      <section className="pagination-wrap">
        <p>Menampilkan 1–{filteredHouses.length} rumah adat</p>
        <div className="pagination">
          <button aria-label="Halaman sebelumnya">‹</button>
          <button className="active">1</button>
          <button aria-label="Halaman berikutnya">›</button>
        </div>
      </section>

      {previewHouse && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setPreviewHouse(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p>
                  {previewHouse.island} · {previewHouse.province}
                </p>
                <h3>{previewHouse.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewHouse(null)}
                aria-label="Tutup pratinjau"
              >
                <AdminIcon name="close" />
              </button>
            </div>
            {previewHouse.image && (
              <div className="house-preview-image">
                <HouseImage src={previewHouse.image} alt={previewHouse.name} />
              </div>
            )}
            <p className="house-preview-description">
              {previewHouse.description || "Deskripsi belum tersedia."}
            </p>
          </div>
        </div>
      )}
    </main>
  )
}
