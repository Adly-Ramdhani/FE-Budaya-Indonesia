import { useEffect, useMemo, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import "../styles/musik.admin.css";
import Icon from "../../components/Admin/AdminIcon"
import MusikView from "../../components/Admin/MusikView"
import Rumahadat from "../../components/Admin/Rumahadat"
import type { Instrument, Island, Province } from "../../components/Admin/types"

const rawApiUrl = import.meta.env.VITE_API_URL || ""
const API_URL = rawApiUrl.trim().replace(/\/$/, "")

const menuGroups = [
  {
    title: "",
    items: ["Dashboard"],
  },
  {
    title: "Koleksi Budaya",
    items: [
      "Lagu Daerah",
      "Tarian",
      "Alat Musik",
      "Senjata Tradisional",
      "Pakaian Adat",
      "Rumah Adat",
      "Makanan",
      "Daerah & Provinsi",
    ],
  },
  {
    title: "Pengelolaan",
    items: ["Media Library", "Pengguna Admin", "Pengaturan"],
  },
]

function formatProvince(name?: string): string {
  if (!name) return "Nusantara"
  return name
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ")
}

function normalizeProvinceName(name: string): string {
  return name.trim().toLocaleLowerCase("id-ID")
}

function getRegionByProvince(provinceName: string): string {
  const p = provinceName.toLowerCase()
  if (
    p.includes("aceh") ||
    p.includes("sumat") ||
    p.includes("riau") ||
    p.includes("jambi") ||
    p.includes("bengkulu") ||
    p.includes("lampung") ||
    p.includes("bangka")
  ) {
    return "Sumatra"
  }
  if (
    p.includes("jawa") ||
    p.includes("jakarta") ||
    p.includes("banten") ||
    p.includes("yogyakarta")
  ) {
    return "Jawa"
  }
  if (p.includes("bali") || p.includes("nusa tenggara")) {
    return "Bali & Nusa Tenggara"
  }
  if (p.includes("kalimantan")) {
    return "Kalimantan"
  }
  if (p.includes("sulawesi") || p.includes("gorontalo")) {
    return "Sulawesi"
  }
  if (p.includes("maluku")) {
    return "Maluku"
  }
  if (p.includes("papua")) {
    return "Papua"
  }
  return "Nusantara"
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return "Baru saja"
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })
  } catch {
    return dateStr
  }
}

function resolveAudioUrl(url?: string): string {
  if (!url) return ""
  let resolved = url.trim()
  if (API_URL) {
    resolved = resolved.replace(/^http:\/\/(127\.0\.0\.1|localhost):8000/, API_URL)
  }
  if (resolved.startsWith("http://") && typeof window !== "undefined" && window.location.protocol === "https:") {
    resolved = resolved.replace(/^http:\/\//, "https://")
  }
  return resolved
}

function getApiList<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[]
  if (
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    Array.isArray(payload.data)
  ) {
    return payload.data as T[]
  }
  throw new Error("Format data API tidak valid")
}

function getApiUrl(path: string): string {
  return API_URL ? `${API_URL}${path}` : path
}

function Sidebar({
  open,
  close,
  onSelect,
  activeItem,
}: {
  open: boolean
  close: () => void
  onSelect: (label: string) => void
  activeItem: string
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={close}
          aria-label="Tutup menu"
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <i />
            <i />
          </span>
          <span className="font-serif text-[19px]">Budaya Indonesia</span>
          <button
            className="ml-auto lg:hidden"
            onClick={close}
            aria-label="Tutup sidebar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="panel-label">
          <span>Panel Admin</span>
          <span className="panel-key">⌘</span>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group, index) => (
            <div className="nav-group" key={group.title || index}>
              {group.title && <p>{group.title}</p>}
              {group.items.map((item) => (
                <button
                  key={item}
                  className={`nav-item ${
                    item === activeItem ||
                    (activeItem === "Lagu Daerah" && item === "")
                      ? "active"
                      : ""
                  }`}
                  onClick={() => {
                    onSelect(item)
                    close()
                  }}
                >
                  <Icon
                    name={
                      item === "Dashboard"
                        ? "grid"
                        : item === "Lagu Daerah"
                          ? "music"
                          : "book"
                    }
                  />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="font-serif text-[17px] leading-6 text-[#d5dbd2]">
            Mengenal warisan,
            <br />
            menghargai keberagaman.
          </p>
          <div className="admin-mini">
            <span className="avatar dark">RP</span>
            <span>
              <b>Rani Pratiwi</b>
              <small>Administrator</small>
            </span>
          </div>
          <button
            className="nav-item logout"
            onClick={() => onSelect("Anda telah keluar")}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

const audioBlobCache = new Map<string, string>()

function NgrokAudio({
  src,
  autoLoad = false,
}: {
  src: string
  autoLoad?: boolean
}) {
  const [blobUrl, setBlobUrl] = useState<string | undefined>(() =>
    audioBlobCache.get(src),
  )
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  const load = () => {
    if (audioBlobCache.has(src)) {
      setBlobUrl(audioBlobCache.get(src))
      return
    }
    setLoading(true)
    setFailed(false)
    fetch(src, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        const url = URL.createObjectURL(blob)
        audioBlobCache.set(src, url)
        setBlobUrl(url)
      })
      .catch((err) => {
        console.error("Gagal load audio:", src, err)
        setFailed(true)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (autoLoad && !blobUrl) {
      load()
    }
  }, [src, autoLoad])

  if (blobUrl) {
    return <audio controls autoPlay src={blobUrl} style={{ width: "100%" }} />
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: 12,
          color: "#4a554d",
          padding: "6px 0",
        }}
      >
        <span
          style={{
            display: "inline-block",
            width: 14,
            height: 14,
            border: "2px solid #b84e36",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <span>Menyiapkan audio dari server...</span>
      </div>
    )
  }

  if (failed) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 10,
          fontSize: 12,
          color: "#b84e36",
        }}
      >
        <span>Gagal memuat audio.</span>
        <button
          type="button"
          onClick={load}
          style={{
            background: "#b84e36",
            color: "white",
            border: 0,
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 11,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Coba lagi
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={load}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#b84e36",
        color: "white",
        border: 0,
        borderRadius: 8,
        padding: "6px 14px",
        fontSize: 12,
        fontWeight: 600,
        cursor: "pointer",
      }}
    >
      <Icon name="music" />
      <span>Putar Audio</span>
    </button>
  )
}

export default function MusikPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isHousePage = location.pathname === "/admin/rumah-adat"
  const [items, setItems] = useState<Instrument[]>([])
  const [loading, setLoading] = useState(true)
  const [apiError, setApiError] = useState<string | null>(null)
  const [islands, setIslands] = useState<Island[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [filterProvinces, setFilterProvinces] = useState<Province[]>([])
  const [islandsLoading, setIslandsLoading] = useState(true)
  const [provincesLoading, setProvincesLoading] = useState(false)
  const [filterProvincesLoading, setFilterProvincesLoading] = useState(false)
  const [islandsError, setIslandsError] = useState<string | null>(null)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [filterProvincesError, setFilterProvincesError] = useState<string | null>(null)

  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Semua wilayah")
  const [filterIslandId, setFilterIslandId] = useState("")
  const [province, setProvince] = useState("Semua provinsi")
  const [status, setStatus] = useState("Semua status")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [previewItem, setPreviewItem] = useState<Instrument | null>(null)
  const [toast, setToast] = useState("")

  const [newTitle, setNewTitle] = useState("")
  const [newIslandId, setNewIslandId] = useState("")
  const [newProvince, setNewProvince] = useState("")
  const [newComposer, setNewComposer] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newLyrics, setNewLyrics] = useState("")

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  useEffect(() => {
    if (isHousePage) {
      setIslandsLoading(false)
      return
    }
    const controller = new AbortController()

    async function fetchIslands() {
      setIslandsLoading(true)
      try {
        const res = await fetch(getApiUrl("/api/islands"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        const list = getApiList<Island>(await res.json())
        setIslands(list)
        setIslandsError(null)
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Gagal memuat daftar pulau"
        console.error("Gagal mengambil pulau dari API:", err)
        setIslandsError(message)
      } finally {
        if (!controller.signal.aborted) setIslandsLoading(false)
      }
    }

    fetchIslands()
    return () => controller.abort()
  }, [isHousePage])

  useEffect(() => {
    setProvinces([])
    setNewProvince("")
    setProvincesError(null)

    if (!newIslandId) {
      setProvincesLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchProvinces() {
      setProvincesLoading(true)
      try {
        const query = new URLSearchParams({ island_id: newIslandId })
        const res = await fetch(
          getApiUrl(`/api/provinces?${query.toString()}`),
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        const list = getApiList<Province>(await res.json())
        setProvinces(list)
        setProvincesError(null)
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Gagal memuat daftar provinsi"
        console.error("Gagal mengambil provinsi dari API:", err)
        setProvincesError(message)
      } finally {
        if (!controller.signal.aborted) setProvincesLoading(false)
      }
    }

    fetchProvinces()
    return () => controller.abort()
  }, [newIslandId])

  useEffect(() => {
    setFilterProvinces([])
    setProvince("Semua provinsi")
    setFilterProvincesError(null)

    if (!filterIslandId) {
      setFilterProvincesLoading(false)
      return
    }

    const controller = new AbortController()

    async function fetchFilterProvinces() {
      setFilterProvincesLoading(true)
      try {
        const query = new URLSearchParams({ island_id: filterIslandId })
        const res = await fetch(
          getApiUrl(`/api/provinces?${query.toString()}`),
          {
            signal: controller.signal,
            headers: {
              Accept: "application/json",
              "ngrok-skip-browser-warning": "true",
            },
          },
        )
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        setFilterProvinces(getApiList<Province>(await res.json()))
        setFilterProvincesError(null)
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return
        const message =
          err instanceof Error ? err.message : "Gagal memuat daftar provinsi"
        console.error("Gagal mengambil provinsi filter dari API:", err)
        setFilterProvincesError(message)
      } finally {
        if (!controller.signal.aborted) setFilterProvincesLoading(false)
      }
    }

    fetchFilterProvinces()
    return () => controller.abort()
  }, [filterIslandId])

  // Mengambil data murni dari API: /api/songs
  useEffect(() => {
    if (isHousePage) {
      setLoading(false)
      return
    }
    const controller = new AbortController()

    async function fetchSongs() {
      setLoading(true)
      try {
        const url = API_URL ? `${API_URL}/api/songs` : "/api/songs"
        const res = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`)
        }

        const json = await res.json()
        const dataList = Array.isArray(json) ? json : json.data

        if (Array.isArray(dataList)) {
          const mapped: Instrument[] = dataList.map((item: any) => {
            const provinceName = formatProvince(
              item.province?.name ?? item.province ?? "Nusantara",
            )
            const title = item.title ?? item.name ?? "Lagu Daerah"

            const rawAudio = item.audio_url ?? item.audio
            const audioSrc = rawAudio
              ? resolveAudioUrl(rawAudio).replace(/^http:\/\//, "https://")
              : undefined

            return {
              id: item.id ?? Date.now(),
              name: title,
              province: provinceName,
              region: getRegionByProvince(provinceName),
              status: item.status ?? "Terbit",
              composer: item.composer ?? "Traditional",
              language: item.language ?? "",
              description:
                item.description ??
                "Warisan melodi tradisional dan cerita Nusantara.",
              lyrics: item.lyrics ?? "",
              audio: item.audio_url?.replace(/^http:\/\//, "https://") || audioSrc,
              audio_url: item.audio_url?.replace(/^http:\/\//, "https://") || audioSrc,
              updated: formatDate(item.updated_at ?? item.created_at),
            }
          })

          setItems(mapped)
          setApiError(null)
        }
      } catch (err: any) {
        if (err.name !== "AbortError") {
          console.warn("Gagal mengambil lagu dari API:", err)
          setApiError(err.message || "Gagal memuat API")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchSongs()

    return () => controller.abort()
  }, [isHousePage])

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const text =
          `${item.name} ${item.description} ${item.province} ${item.composer ?? ""} ${item.language ?? ""}`.toLowerCase()
        return (
          text.includes(query.toLowerCase()) &&
          (region === "Semua wilayah" || item.region === region) &&
          (province === "Semua provinsi" ||
            normalizeProvinceName(item.province) ===
              normalizeProvinceName(province)) &&
          (status === "Semua status" || item.status === status)
        )
      }),
    [items, province, query, region, status],
  )

  const addSong = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newTitle.trim()) return

    const newItem: Instrument = {
      id: Date.now(),
      name: newTitle.trim(),
      province: newProvince,
      region: getRegionByProvince(newProvince),
      status: "Draf",
      composer: newComposer.trim() || "Traditional",
      language: newLanguage.trim() || "",
      description:
        newDescription.trim() ||
        "Deskripsi lagu daerah baru siap dilengkapi oleh tim redaksi.",
      lyrics: newLyrics.trim(),
      updated: "Hari ini",
    }

    setItems((current) => [newItem, ...current])
    setNewTitle("")
    setNewComposer("")
    setNewLanguage("")
    setNewDescription("")
    setNewLyrics("")
    setModalOpen(false)
    notify(`Lagu "${newItem.name}" berhasil ditambahkan ke daftar draf`)
  }

  const handleDeleteSong = async (selected: Instrument) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lagu "${selected.name}"?`,
    )
    if (!confirmed) return

    notify(`Menghapus "${selected.name}" dari server...`)

    try {
      const url = API_URL
        ? `${API_URL}/api/songs/${selected.id}`
        : `/api/songs/${selected.id}`

      const token =
        localStorage.getItem("auth_token") ||
        sessionStorage.getItem("auth_token")

      const res = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}))
        throw new Error(
          errorData.message ||
            errorData.error ||
            `Gagal menghapus (HTTP ${res.status})`,
        )
      }

      setItems((current) => current.filter((item) => item.id !== selected.id))
      notify(`Lagu "${selected.name}" berhasil dihapus dari database`)
    } catch (err: any) {
      console.error("Gagal menghapus lagu dari API:", err)
      const isNetworkError =
        err.message?.includes("Failed to fetch") ||
        err.message?.includes("NetworkError") ||
        err.name === "TypeError"

      if (isNetworkError) {
        const removeLocal = window.confirm(
          `Tidak dapat terhubung ke server API (${err.message}). Hapus "${selected.name}" dari tampilan lokal saja?`,
        )
        if (removeLocal) {
          setItems((current) => current.filter((item) => item.id !== selected.id))
          notify(`Lagu "${selected.name}" dihapus dari tampilan lokal`)
          return
        }
      }

      notify(`Gagal menghapus lagu: ${err.message}`)
    }
  }

  return (
    <div className="admin-shell">
      <Sidebar
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
        activeItem={isHousePage ? "Rumah Adat" : "Lagu Daerah"}
        onSelect={(label) => {
          if (label === "Dashboard") {
            navigate("/dashboard")
            return
          }
          if (label === "Rumah Adat") {
            navigate("/admin/rumah-adat")
            return
          }
          if (label === "Lagu Daerah") {
            navigate("/admin/musik")
            return
          }
          notify(label)
        }}
      />

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Icon name="menu" />
            </button>
            <h1>{isHousePage ? "Rumah Adat" : "Lagu Daerah"}</h1>
            <span>Ruang redaksi</span>
          </div>
          <div className="topbar-tools">
            <label className="header-search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={
                  isHousePage
                    ? "Cari rumah adat atau daerah..."
                    : "Cari lagu, lirik, atau daerah..."
                }
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

        {isHousePage ? (
          <Rumahadat
            apiUrl={API_URL}
            query={query}
            onQueryChange={setQuery}
          />
        ) : (
          <MusikView
            apiUrl={API_URL ? `${API_URL}/api/songs` : "/api/songs"}
            apiError={apiError}
            filterIslandId={filterIslandId}
            filterProvinces={filterProvinces}
            filterProvincesError={filterProvincesError}
            filterProvincesLoading={filterProvincesLoading}
            filtered={filtered}
            islands={islands}
            islandsError={islandsError}
            islandsLoading={islandsLoading}
            loading={loading}
            onAddSong={() => setModalOpen(true)}
            onDeleteSong={handleDeleteSong}
            onFilterIslandChange={(islandId) => {
              setFilterIslandId(islandId)
              setProvince("Semua provinsi")
            }}
            onPreviewSong={setPreviewItem}
            onQueryChange={setQuery}
            onRegionChange={setRegion}
            onResetFilters={() => {
              setQuery("")
              setRegion("Semua wilayah")
              setFilterIslandId("")
              setProvince("Semua provinsi")
              setStatus("Semua status")
            }}
            onStatusChange={setStatus}
            onViewChange={setView}
            onProvinceChange={setProvince}
            onAction={notify}
            province={province}
            query={query}
            region={region}
            status={status}
            view={view}
          />
        )}

        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>
            {isHousePage
              ? "Data Rumah Adat Nusantara"
              : "Data Lagu Daerah · Dilengkapi lirik & audio"}
          </span>
        </footer>
      </div>

      {/* Modal Pratinjau Lagu (Audio & Lirik) */}
      {previewItem && (
        <div
          className="modal-backdrop"
          onMouseDown={() => setPreviewItem(null)}
        >
          <div
            className="modal"
            style={{ maxWidth: 540 }}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p>
                  {previewItem.region} · {previewItem.province}
                </p>
                <h3>{previewItem.name}</h3>
              </div>
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                aria-label="Tutup pratinjau"
              >
                <Icon name="close" />
              </button>
            </div>


              <div
                style={{
                  display: "flex",
                  gap: 15,
                  fontSize: 12,
                  color: "#666",
                  marginBottom: 10,
                }}
              >
                {previewItem.composer && (
                  <span>
                    <b>Pencipta:</b> {previewItem.composer}
                  </span>
                )}
                {previewItem.language && (
                  <span>
                    <b>Bahasa:</b> {previewItem.language}
                  </span>
                )}
                <span>
                  <b>Status:</b> {previewItem.status}
                </span>
              </div>

              <p
                style={{
                  fontSize: 13,
                  lineHeight: "1.6",
                  color: "#333",
                  marginBottom: 15,
                }}
              >
                {previewItem.description}
              </p>

              {(previewItem.audio || previewItem.audio_url) && (
                <div
                  style={{
                    background: "#f0ebd8",
                    padding: 12,
                    borderRadius: 8,
                    marginBottom: 15,
                  }}
                >
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#28372d",
                      marginBottom: 6,
                    }}
                  >
                    Dengarkan Audio:
                  </span>
                  <NgrokAudio
                    src={(previewItem.audio || previewItem.audio_url)!}
                    autoLoad
                  />
                </div>
              )}

              {previewItem.lyrics && (
                <div>
                  <span
                    style={{
                      display: "block",
                      fontSize: 12,
                      fontWeight: 600,
                      color: "#28372d",
                      marginBottom: 6,
                    }}
                  >
                    Lirik Lagu:
                  </span>
                  <div
                    style={{
                      maxHeight: 160,
                      overflowY: "auto",
                      whiteSpace: "pre-line",
                      padding: 12,
                      borderRadius: 8,
                      border: "1px solid #d9cebe",
                      background: "#fff",
                      fontSize: 12,
                      lineHeight: "1.6",
                      color: "#444",
                    }}
                  >
                    {previewItem.lyrics}
                  </div>
                </div>
              )}

            <div className="modal-actions" style={{ marginTop: 20 }}>
              <button type="button" onClick={() => setPreviewItem(null)}>
                Tutup Pratinjau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tambah Lagu Baru */}
      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <form
            className="modal"
            onSubmit={addSong}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p>Koleksi Budaya</p>
                <h3>Tambah Lagu Daerah</h3>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                aria-label="Tutup form"
              >
                <Icon name="close" />
              </button>
            </div>

            <label>
              Judul lagu
              <input
                autoFocus
                value={newTitle}
                onChange={(event) => setNewTitle(event.target.value)}
                placeholder="Contoh: Bungong Jeumpa"
                required
              />
            </label>

            <label>
              Pulau asal
              <select
                value={newIslandId}
                onChange={(event) => setNewIslandId(event.target.value)}
                required
                disabled={islandsLoading || Boolean(islandsError)}
              >
                <option value="">
                  {islandsLoading ? "Memuat pulau..." : "Pilih pulau"}
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
              Provinsi asal
              <select
                value={newProvince}
                onChange={(event) => setNewProvince(event.target.value)}
                required
                disabled={!newIslandId || provincesLoading || Boolean(provincesError)}
              >
                <option value="">
                  {!newIslandId
                    ? "Pilih pulau terlebih dahulu"
                    : provincesLoading
                      ? "Memuat provinsi..."
                      : "Pilih provinsi"}
                </option>
                {provinces.map((province) => (
                  <option key={province.id} value={province.name}>
                    {province.name}
                  </option>
                ))}
              </select>
              {provincesError && (
                <span role="alert" style={{ color: "#af4632" }}>
                  Gagal memuat provinsi: {provincesError}
                </span>
              )}
              {!provincesLoading &&
                !provincesError &&
                newIslandId &&
                provinces.length === 0 && (
                  <span>Tidak ada provinsi untuk pulau ini.</span>
                )}
            </label>

            <label>
              Pencipta lagu
              <input
                value={newComposer}
                onChange={(event) => setNewComposer(event.target.value)}
                placeholder="Contoh: Traditional / Abraham Abduh"
              />
            </label>

            <label>
              Bahasa daerah
              <input
                value={newLanguage}
                onChange={(event) => setNewLanguage(event.target.value)}
                placeholder="Contoh: Bahasa Aceh / Bahasa Sunda"
              />
            </label>

            <label>
              Deskripsi & Makna
              <textarea
                value={newDescription}
                onChange={(event) => setNewDescription(event.target.value)}
                placeholder="Tuliskan latar belakang, makna, atau cerita di balik lagu ini..."
                rows={3}
                style={{
                  width: "100%",
                  border: "1px solid #d9cebe",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              />
            </label>

            <label>
              Lirik lagu
              <textarea
                value={newLyrics}
                onChange={(event) => setNewLyrics(event.target.value)}
                placeholder="Masukkan lirik lagu..."
                rows={4}
                style={{
                  width: "100%",
                  border: "1px solid #d9cebe",
                  borderRadius: 8,
                  padding: 10,
                  fontSize: 12,
                  fontFamily: "inherit",
                }}
              />
            </label>

            <div className="modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button className="save" type="submit">
                Simpan sebagai draf
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast">
          <i />
          {toast}
        </div>
      )}
    </div>
  )
}
