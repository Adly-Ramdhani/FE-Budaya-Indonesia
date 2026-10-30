import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminSidebar } from "../../../components/Admin/AdminChrome"
import { resolveTarianImage } from "../../../components/Admin/Tarian/tarianImage"
import styles from "../../AdminDashboard.module.css"
import "../../styles/musik.admin.css"
import { getApiBaseUrl } from "../../../api"

type Instrument = {
  id: number | string
  name: string
  province: string
  provinceId: string
  islandId: string
  status: string
  description: string
  updated: string
  image?: string
  videoUrl?: string
}

type Island = {
  id: string
  name: string
}

type Province = {
  id: string
  name: string
  islandId: string
}

type IconName = "book" | "grid" | "search" | "bell" | "chevron" | "plus" | "list" | "edit" | "trash" | "arrow" | "logout" | "menu" | "close"

const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)

function getApiUrl(path: string): string {
  return API_URL ? `${API_URL}${path}` : path
}

function getRecords(payload: unknown): Record<string, unknown>[] {
  const records = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ? payload.data
      : null

  if (!records) throw new Error("Format data API tidak valid.")
  return records.filter(
    (record): record is Record<string, unknown> =>
      Boolean(record) && typeof record === "object" && !Array.isArray(record),
  )
}

function getText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function getYoutubeEmbedUrl(value?: string): string | undefined {
  if (!value) return undefined

  try {
    const url = new URL(value)
    const host = url.hostname.toLowerCase()
    let videoId = ""

    if (host === "youtu.be") {
      videoId = url.pathname.split("/").filter(Boolean)[0] ?? ""
    } else if (
      host === "youtube.com" ||
      host === "www.youtube.com" ||
      host === "m.youtube.com"
    ) {
      videoId =
        url.searchParams.get("v") ??
        url.pathname.match(/^\/(?:embed|shorts)\/([^/]+)/)?.[1] ??
        ""
    }

    return /^[\w-]{11}$/.test(videoId)
      ? `https://www.youtube-nocookie.com/embed/${videoId}`
      : undefined
  } catch {
    return undefined
  }
}

function mapInstrument(
  record: Record<string, unknown>,
  index: number,
): Instrument {
  const province =
    record.province && typeof record.province === "object"
      ? (record.province as Record<string, unknown>)
      : null
  const island =
    record.island && typeof record.island === "object"
      ? (record.island as Record<string, unknown>)
      : null
  const image = getText(record.image_url ?? record.image).trim()
  const updatedAt = getText(record.updated_at ?? record.created_at)
  const updatedDate = updatedAt ? new Date(updatedAt) : null
  const status = getText(record.status).toLowerCase()

  return {
    id:
      typeof record.id === "string" || typeof record.id === "number"
        ? record.id
        : `instrument-${index}`,
    name: getText(record.name ?? record.title) || "Alat musik tanpa nama",
    province: getText(province?.name ?? record.province) || "Nusantara",
    provinceId: getText(record.province_id ?? province?.id),
    islandId: getText(record.island_id ?? island?.id ?? province?.island_id),
    status:
      status === "published" || status === "terbit" ? "Terbit" : "Draf",
    description: getText(record.description) || "Belum ada deskripsi.",
    videoUrl: getText(record.video_url).trim() || undefined,
    updated:
      updatedDate && !Number.isNaN(updatedDate.getTime())
        ? new Intl.DateTimeFormat("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }).format(updatedDate)
        : "Belum diperbarui",
    image: resolveTarianImage(image, API_URL),
  }
}

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    book: (
      <>
        <path d="M4 5.3c2.7-.8 5.3-.3 8 1.5v12c-2.7-1.8-5.3-2.3-8-1.5v-12Z" />
        <path d="M20 5.3c-2.7-.8-5.3-.3-8 1.5v12c2.7-1.8 5.3-2.3 8-1.5v-12Z" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    search: (
      <path d="m20 20-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Zm-8 11h4" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    edit: <path d="m14 5 5 5M4 20l3.5-.7L19 7.8 16.2 5 4.7 16.5 4 20Z" />,
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    logout: <path d="M10 5H4v14h6m5-4 4-4-4-4m4 4H9" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function InstrumentCard({
  instrument,
  view,
  onAction,
  onPreview,
  onEdit,
  onDelete,
  deleting,
}: {
  instrument: Instrument
  view: "grid" | "list"
  onAction: (message: string) => void
  onPreview: (instrument: Instrument) => void
  onEdit: (instrument: Instrument) => void
  onDelete: (instrument: Instrument) => void
  deleting: boolean
}) {
  return (
    <article
      className={`instrument-card ${view === "list" ? "list-card" : ""}`}
    >
      <InstrumentImage
        src={instrument.image}
        alt={`Alat musik ${instrument.name}`}
      />
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
        <p className="updated">Diperbarui {instrument.updated}</p>
        <button
          className="preview-link"
          onClick={() => onPreview(instrument)}
        >
          Lihat pratinjau <Icon name="arrow" />
        </button>
      </div>
      <div className="card-actions">
        <button onClick={() => onEdit(instrument)}>
          <Icon name="edit" /> Edit
        </button>
        <button
          className="danger"
          onClick={() => onDelete(instrument)}
          disabled={deleting}
        >
          <Icon name="trash" /> {deleting ? "Menghapus..." : "Hapus"}
        </button>
      </div>
    </article>
  )
}

function InstrumentImage({ src, alt }: { src?: string; alt: string }) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  if (!src || failed) {
    return (
      <div className="house-image-placeholder" role={failed ? "img" : undefined}>
        {failed ? "Gambar gagal dimuat" : "Gambar tidak tersedia"}
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => {
        console.error(`Gagal memuat gambar alat musik "${alt}" dari ${src}`)
        setFailed(true)
      }}
    />
  )
}

export default function MusikPage() {
  const navigate = useNavigate()
  const [items, setItems] = useState<Instrument[]>([])
  const [itemsLoading, setItemsLoading] = useState(true)
  const [itemsError, setItemsError] = useState<string | null>(null)
  const [islands, setIslands] = useState<Island[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [islandsLoading, setIslandsLoading] = useState(true)
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [islandsError, setIslandsError] = useState<string | null>(null)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [islandId, setIslandId] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [status, setStatus] = useState("Semua status")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [previewItem, setPreviewItem] = useState<Instrument | null>(null)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    const controller = new AbortController()

    async function loadInstruments() {
      setItemsLoading(true)
      setItemsError(null)
      try {
        const response = await fetch(getApiUrl("/v1/musical-instruments"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) {
          throw new Error(`Gagal memuat alat musik (HTTP ${response.status}).`)
        }
        setItems(getRecords(await response.json()).map(mapInstrument))
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return
        const message =
          cause instanceof Error
            ? cause.message
            : "Gagal memuat data alat musik."
        console.error("Gagal mengambil data alat musik:", cause)
        setItemsError(message)
      } finally {
        if (!controller.signal.aborted) setItemsLoading(false)
      }
    }

    void loadInstruments()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function loadLocations() {
      const [islandResult, provinceResult] = await Promise.allSettled([
        fetch(getApiUrl("/v1/islands"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }),
        fetch(getApiUrl("/v1/provinces"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        }),
      ])

      if (controller.signal.aborted) return

      if (islandResult.status === "rejected") {
        const message =
          islandResult.reason instanceof Error
            ? islandResult.reason.message
            : "Gagal memuat daftar pulau."
        console.error("Gagal mengambil daftar pulau:", islandResult.reason)
        setIslandsError(message)
        setIslandsLoading(false)
      } else {
        try {
          if (!islandResult.value.ok) {
            throw new Error(`HTTP ${islandResult.value.status}`)
          }
          const records = getRecords(await islandResult.value.json())
          setIslands(
            records.flatMap((record) =>
              (typeof record.id === "string" ||
                typeof record.id === "number") &&
              typeof record.name === "string"
                ? [{ id: String(record.id), name: record.name }]
                : [],
            ),
          )
        } catch (cause) {
          if (cause instanceof Error && cause.name === "AbortError") return
          const message =
            cause instanceof Error ? cause.message : "Gagal memuat daftar pulau."
          console.error("Gagal mengambil daftar pulau:", cause)
          setIslandsError(message)
        } finally {
          if (!controller.signal.aborted) setIslandsLoading(false)
        }
      }

      if (provinceResult.status === "rejected") {
        const message =
          provinceResult.reason instanceof Error
            ? provinceResult.reason.message
            : "Gagal memuat daftar provinsi."
        console.error("Gagal mengambil daftar provinsi:", provinceResult.reason)
        setProvincesError(message)
        setProvincesLoading(false)
      } else {
        try {
          if (!provinceResult.value.ok) {
            throw new Error(`HTTP ${provinceResult.value.status}`)
          }
          const records = getRecords(await provinceResult.value.json())
          setProvinces(
            records.flatMap((record) => {
              const island =
                record.island && typeof record.island === "object"
                  ? (record.island as Record<string, unknown>)
                  : null
              return (typeof record.id === "string" ||
                typeof record.id === "number") &&
                typeof record.name === "string"
                ? [
                    {
                      id: String(record.id),
                      name: record.name,
                      islandId: getText(record.island_id ?? island?.id),
                    },
                  ]
                : []
            }),
          )
        } catch (cause) {
          if (cause instanceof Error && cause.name === "AbortError") return
          const message =
            cause instanceof Error
              ? cause.message
              : "Gagal memuat daftar provinsi."
          console.error("Gagal mengambil daftar provinsi:", cause)
          setProvincesError(message)
        } finally {
          if (!controller.signal.aborted) setProvincesLoading(false)
        }
      }
    }

    void loadLocations()
    return () => controller.abort()
  }, [])

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  const filteredProvinces = useMemo(
    () =>
      islandId
        ? provinces.filter((item) => item.islandId === islandId)
        : provinces,
    [islandId, provinces],
  )

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const text =
          `${item.name} ${item.description} ${item.province}`.toLowerCase()
        const matchingProvince = provinces.find(
          (candidate) => candidate.name === item.province,
        )
        return (
          text.includes(query.toLowerCase()) &&
          (!islandId || matchingProvince?.islandId === islandId) &&
          (!provinceId || matchingProvince?.id === provinceId) &&
          (status === "Semua status" || item.status === status)
        )
      }),
    [islandId, items, provinceId, provinces, query, status],
  )

  async function deleteInstrument(instrument: Instrument) {
    if (deletingIds.has(String(instrument.id))) return
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus alat musik "${instrument.name}"?`,
      )
    ) {
      return
    }

    setDeletingIds((current) => new Set(current).add(String(instrument.id)))
    try {
      const token = getAuthToken()
      const response = await fetch(
        getApiUrl(`/v1/musical-instruments/${instrument.id}`),
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => ({}))
        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : `HTTP ${response.status}`
        throw new Error(message)
      }

      setItems((current) =>
        current.filter((item) => String(item.id) !== String(instrument.id)),
      )
      notify(`Alat musik "${instrument.name}" berhasil dihapus.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menghapus alat musik:", cause)
      notify(`Gagal menghapus alat musik: ${message}`)
    } finally {
      setDeletingIds((current) => {
        const next = new Set(current)
        next.delete(String(instrument.id))
        return next
      })
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem="Alat Musik"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(label) => {
          if (label === "Dashboard") navigate("/dashboard")
          else if (label === "Lagu Daerah") navigate("/admin/musik")
          else if (label === "Tarian") navigate("/admin/tarian")
          else if (label === "Alat Musik") navigate("/admin/alat-musik")
          else if (label === "Senjata Tradisional") navigate("/admin/senjata")
          else if (label === "Rumah Adat") navigate("/admin/rumah-adat")
          else notify(`Menu ${label} belum tersedia.`)
        }}
      />

      <div className={styles.main}>
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Icon name="menu" />
            </button>
            <h1>Alat Musik</h1>
            <span>Ruang redaksi</span>
          </div>
          <div className="topbar-tools">
            <label className="header-search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari konten..."
              />
            </label>
            <button
              className="bell-button"
              onClick={() => notify("Tidak ada notifikasi baru")}
              aria-label="Notifikasi"
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="profile-wrap">
              <button
                className="profile-button"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="avatar">RP</span>
                <span className="profile-name">Rani Pratiwi</span>
                <Icon name="chevron" />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <button onClick={() => notify("Profil dibuka")}>
                    Profil saya
                  </button>
                  <button onClick={() => notify("Pengaturan dibuka")}>
                    Pengaturan
                  </button>
                  <button onClick={() => notify("Anda telah keluar")}>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <section className="page-heading">
            <div>
              <p>Koleksi Budaya / Pengelolaan Konten</p>
              <h2>Alat Musik</h2>
              <span>Rawat cerita di balik bunyi dan harmoni Nusantara.</span>
            </div>
            <button
              className="add-button"
              onClick={() => navigate("/admin/alat-musik/tambah")}
            >
              <Icon name="plus" /> Tambah Alat Musik
            </button>
          </section>

          <section className="filters">
            <label className="search-field">
              <span>Cari alat musik</span>
              <div>
                <Icon name="search" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama atau deskripsi..."
                />
              </div>
            </label>
            <label>
              <span>Wilayah</span>
              <select
                value={islandId}
                onChange={(event) => {
                  setIslandId(event.target.value)
                  setProvinceId("")
                }}
                disabled={islandsLoading || Boolean(islandsError)}
              >
                <option value="">
                  {islandsLoading
                    ? "Memuat wilayah..."
                    : islandsError
                      ? "Wilayah gagal dimuat"
                      : "Semua wilayah"}
                </option>
                {islands.map((island) => (
                  <option key={island.id} value={island.id}>
                    {island.name}
                  </option>
                ))}
              </select>
              {islandsError && (
                <span className="create-song-error" role="alert">
                  Gagal memuat wilayah: {islandsError}
                </span>
              )}
            </label>
            <label>
              <span>Provinsi</span>
              <select
                value={provinceId}
                onChange={(event) => setProvinceId(event.target.value)}
                disabled={provincesLoading || Boolean(provincesError)}
              >
                <option value="">
                  {provincesLoading
                    ? "Memuat provinsi..."
                    : provincesError
                      ? "Provinsi gagal dimuat"
                      : "Semua provinsi"}
                </option>
                {filteredProvinces.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              {provincesError && (
                <span className="create-song-error" role="alert">
                  Gagal memuat provinsi: {provincesError}
                </span>
              )}
            </label>
            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
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
                  onClick={() => setView("grid")}
                  aria-label="Tampilan grid"
                >
                  <Icon name="grid" />
                </button>
                <button
                  className={view === "list" ? "active" : ""}
                  onClick={() => setView("list")}
                  aria-label="Tampilan daftar"
                >
                  <Icon name="list" />
                </button>
              </div>
            </div>
          </section>

          <section className="result-bar">
            <b>{filtered.length} alat musik</b>
            <span>
              {items.filter((item) => item.status === "Terbit").length} terbit ·{" "}
              {items.filter((item) => item.status === "Draf").length} draf
            </span>
            <span>Urutan: Terakhir diperbarui</span>
          </section>

          {itemsLoading ? (
            <section className="empty-state" role="status">
              <p>Memuat data alat musik...</p>
            </section>
          ) : itemsError ? (
            <section className="empty-state" role="alert">
              <h3>Data alat musik gagal dimuat</h3>
              <p>{itemsError}</p>
            </section>
          ) : filtered.length ? (
            <section
              className={`instrument-grid ${
                view === "list" ? "list-view" : ""
              }`}
            >
              {filtered.map((instrument) => (
                <InstrumentCard
                  key={instrument.id}
                  instrument={instrument}
                  view={view}
                  onAction={notify}
                  onPreview={setPreviewItem}
                  onEdit={(selected) =>
                    navigate(`/admin/alat-musik/${selected.id}/edit`)
                  }
                  onDelete={deleteInstrument}
                  deleting={deletingIds.has(String(instrument.id))}
                />
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <Icon name="search" />
              <h3>Konten tidak ditemukan</h3>
              <p>
                {items.length
                  ? "Coba ubah kata kunci atau filter yang digunakan."
                  : "Belum ada data alat musik."}
              </p>
              <button
                onClick={() => {
                  setQuery("")
                  setIslandId("")
                  setProvinceId("")
                  setStatus("Semua status")
                }}
              >
                Atur ulang filter
              </button>
            </section>
          )}

          {!itemsLoading && !itemsError && (
            <section className="pagination-wrap">
              <p>Menampilkan {filtered.length} dari {items.length} alat musik</p>
            </section>
          )}
        </main>

        {previewItem && (
          <div
            className="modal-backdrop"
            onMouseDown={() => setPreviewItem(null)}
          >
            <div
              className="modal instrument-preview-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="instrument-preview-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-heading">
                <div>
                  <p>{previewItem.province} · Alat Musik</p>
                  <h3 id="instrument-preview-title">{previewItem.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewItem(null)}
                  aria-label="Tutup pratinjau"
                >
                  <Icon name="close" />
                </button>
              </div>

              {previewItem.image && (
                <div className="house-preview-image">
                  <InstrumentImage
                    src={previewItem.image}
                    alt={`Gambar ${previewItem.name}`}
                  />
                </div>
              )}

              <div className="instrument-preview-meta">
                <span
                  className={`status ${previewItem.status === "Draf" ? "draft" : ""}`}
                >
                  <i />
                  {previewItem.status}
                </span>
                <span>Diperbarui {previewItem.updated}</span>
              </div>

              <p className="house-preview-description">
                {previewItem.description}
              </p>

              {previewItem.videoUrl && (
                <section className="instrument-preview-video">
                  <h4>Video pertunjukan</h4>
                  {getYoutubeEmbedUrl(previewItem.videoUrl) ? (
                    <iframe
                      src={getYoutubeEmbedUrl(previewItem.videoUrl)}
                      title={`Video pertunjukan ${previewItem.name}`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <a
                      href={previewItem.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka video pertunjukan
                    </a>
                  )}
                </section>
              )}

              <div className="modal-actions">
                <button type="button" onClick={() => setPreviewItem(null)}>
                  Tutup pratinjau
                </button>
              </div>
            </div>
          </div>
        )}

        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data dari API alat musik</span>
        </footer>
      </div>



      {toast && (
        <div className="toast">
          <i />
          {toast}
        </div>
      )}
    </div>
  )
}
