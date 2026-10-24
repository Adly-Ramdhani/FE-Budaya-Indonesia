import { useEffect, useMemo, useRef, useState } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import "../styles/musik.admin.css";
import Icon from "../../components/Admin/AdminIcon"
import { AdminSidebar, AdminTopbar } from "../../components/Admin/AdminChrome"
import MusikView from "../../components/Admin/ Musik/MusikView"
import CreateMusik from "../../components/Admin/ Musik/CreateMusik"
import EditeMusik from "../../components/Admin/ Musik/EditeMusik"
import Rumahadat, {
  type TraditionalHouse,
} from "../../components/Admin/Rumahadat"
import type { Instrument, Island, Province } from "../../components/Admin/types"
import styles from "../AdminDashboard.module.css"

const rawApiUrl = import.meta.env.VITE_API_URL || ""
const API_URL = rawApiUrl.trim().replace(/\/$/, "")

const API_HEADERS = {
  Accept: "application/json",
  "ngrok-skip-browser-warning": "true",
}

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

function getAuthToken(): string | null {
  return (
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
  )
}

async function fetchProvincesByIsland(
  islandId: string,
  signal: AbortSignal,
): Promise<Province[]> {
  const params = new URLSearchParams({ island_id: islandId })
  const res = await fetch(getApiUrl(`/api/provinces?${params.toString()}`), {
    signal,
    headers: API_HEADERS,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)
  return getApiList<Province>(await res.json())
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
  const { songId } = useParams<{ songId: string }>()
  const isHousePage = location.pathname === "/admin/rumah-adat"
  const isCreateSongPage = location.pathname === "/admin/musik/tambah"
  const isEditSongPage = Boolean(songId)
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
  const [previewItem, setPreviewItem] = useState<Instrument | null>(null)
  const [toast, setToast] = useState("")
  const [saving, setSaving] = useState(false)
  const [editSong, setEditSong] = useState<Instrument | null>(null)
  const [editLoading, setEditLoading] = useState(false)
  const [editError, setEditError] = useState<string | null>(null)
  const pendingProvinceId = useRef("")

  const [newTitle, setNewTitle] = useState("")
  const [newIslandId, setNewIslandId] = useState("")
  const [newProvinceId, setNewProvinceId] = useState("")
  const [newComposer, setNewComposer] = useState("")
  const [newLanguage, setNewLanguage] = useState("")
  const [newDescription, setNewDescription] = useState("")
  const [newLyrics, setNewLyrics] = useState("")
  const [newAudio, setNewAudio] = useState<File | null>(null)
  const newIslandIdRef = useRef(newIslandId)
  newIslandIdRef.current = newIslandId

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  const resetForm = () => {
    setNewTitle("")
    setNewIslandId("")
    setNewProvinceId("")
    setNewComposer("")
    setNewLanguage("")
    setNewDescription("")
    setNewLyrics("")
    setNewAudio(null)
  }

  useEffect(() => {
    if (!songId) {
      setEditSong(null)
      setEditError(null)
      setEditLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadSongForEdit() {
      setEditLoading(true)
      setEditError(null)
      try {
        const response = await fetch(getApiUrl(`/api/songs/${songId}`), {
          signal: controller.signal,
          headers: API_HEADERS,
        })
        if (!response.ok) {
          throw new Error(`Gagal memuat lagu (HTTP ${response.status})`)
        }

        const payload: unknown = await response.json()
        const songData =
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          payload.data &&
          typeof payload.data === "object"
            ? payload.data
            : payload
        if (!songData || typeof songData !== "object" || Array.isArray(songData)) {
          throw new Error("Format data lagu tidak valid.")
        }

        const song = songData as Record<string, unknown>
        const provinceData =
          song.province && typeof song.province === "object"
            ? (song.province as Record<string, unknown>)
            : null
        const islandData =
          provinceData?.island && typeof provinceData.island === "object"
            ? (provinceData.island as Record<string, unknown>)
            : null
        const provinceId = song.province_id ?? provinceData?.id
        const islandId = provinceData?.island_id ?? islandData?.id
        const provinceName =
          typeof provinceData?.name === "string" ? provinceData.name : ""
        const title =
          typeof song.title === "string"
            ? song.title
            : typeof song.name === "string"
              ? song.name
              : ""
        const audio = song.audio_url ?? song.audio
        const audioUrl = typeof audio === "string" ? resolveAudioUrl(audio) : undefined

        setNewTitle(title)
        const resolvedIslandId = islandId == null ? "" : String(islandId)
        pendingProvinceId.current =
          resolvedIslandId && resolvedIslandId !== newIslandIdRef.current
            ? provinceId == null
              ? ""
              : String(provinceId)
            : ""
        setNewIslandId(resolvedIslandId)
        setNewProvinceId(provinceId == null ? "" : String(provinceId))
        setNewComposer(typeof song.composer === "string" ? song.composer : "")
        setNewLanguage(typeof song.language === "string" ? song.language : "")
        setNewDescription(
          typeof song.description === "string" ? song.description : "",
        )
        setNewLyrics(typeof song.lyrics === "string" ? song.lyrics : "")
        setNewAudio(null)
        setEditSong({
          id: typeof song.id === "string" || typeof song.id === "number" ? song.id : songId,
          name: title,
          province_id: provinceId == null ? undefined : String(provinceId),
          province: formatProvince(provinceName),
          region: getRegionByProvince(provinceName),
          status: typeof song.status === "string" ? song.status : "draft",
          composer: typeof song.composer === "string" ? song.composer : "",
          language: typeof song.language === "string" ? song.language : "",
          description: typeof song.description === "string" ? song.description : "",
          lyrics: typeof song.lyrics === "string" ? song.lyrics : "",
          audio: audioUrl,
          audio_url: audioUrl,
          updated: formatDate(
            typeof song.updated_at === "string"
              ? song.updated_at
              : typeof song.created_at === "string"
                ? song.created_at
                : undefined,
          ),
        })
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return
        const message =
          error instanceof Error ? error.message : "Gagal memuat data lagu."
        console.error("Gagal memuat lagu untuk diedit:", error)
        setEditError(message)
      } finally {
        if (!controller.signal.aborted) setEditLoading(false)
      }
    }

    void loadSongForEdit()
    return () => controller.abort()
  }, [songId])

  // Daftar pulau
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
          headers: API_HEADERS,
        })
        if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`)

        setIslands(getApiList<Island>(await res.json()))
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

  // Provinsi untuk form tambah lagu
  useEffect(() => {
    setProvinces([])
    setNewProvinceId("")
    setProvincesError(null)

    if (!newIslandId) {
      setProvincesLoading(false)
      return
    }

    const controller = new AbortController()
    setProvincesLoading(true)

    fetchProvincesByIsland(newIslandId, controller.signal)
      .then((loadedProvinces) => {
        setProvinces(loadedProvinces)
        const pendingId = pendingProvinceId.current
        if (
          pendingId &&
          loadedProvinces.some(
            (item) => String(item.id) === String(pendingId),
          )
        ) {
          setNewProvinceId(pendingId)
          pendingProvinceId.current = ""
        }
      })
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return
        console.error("Gagal mengambil provinsi dari API:", err)
        setProvincesError(
          err instanceof Error ? err.message : "Gagal memuat daftar provinsi",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setProvincesLoading(false)
      })

    return () => controller.abort()
  }, [newIslandId])

  // Provinsi untuk filter daftar
  useEffect(() => {
    setFilterProvinces([])
    setProvince("Semua provinsi")
    setFilterProvincesError(null)

    if (!filterIslandId) {
      setFilterProvincesLoading(false)
      return
    }

    const controller = new AbortController()
    setFilterProvincesLoading(true)

    fetchProvincesByIsland(filterIslandId, controller.signal)
      .then(setFilterProvinces)
      .catch((err) => {
        if (err instanceof Error && err.name === "AbortError") return
        console.error("Gagal mengambil provinsi filter dari API:", err)
        setFilterProvincesError(
          err instanceof Error ? err.message : "Gagal memuat daftar provinsi",
        )
      })
      .finally(() => {
        if (!controller.signal.aborted) setFilterProvincesLoading(false)
      })

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
        const res = await fetch(getApiUrl("/api/songs"), {
          signal: controller.signal,
          headers: API_HEADERS,
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
              province_id: item.province_id,
              province: provinceName,
              region: getRegionByProvince(provinceName),
              status: item.status ?? "draft",
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
        if (!controller.signal.aborted) setLoading(false)
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

  // Simpan lagu baru ke backend: POST /api/songs
  const addSong = async (event: React.FormEvent) => {
    event.preventDefault()
    if (saving) return
    if (!newTitle.trim() || !newProvinceId) return

    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const songStatus =
      submitter instanceof HTMLButtonElement && submitter.value === "published"
        ? "published"
        : "draft"

    const formData = new FormData()
    formData.append("province_id", newProvinceId)
    formData.append("title", newTitle.trim())
    formData.append("status", songStatus)
    if (newComposer.trim()) formData.append("composer", newComposer.trim())
    if (newLanguage.trim()) formData.append("language", newLanguage.trim())
    if (newDescription.trim()) formData.append("description", newDescription.trim())
    if (newLyrics.trim()) formData.append("lyrics", newLyrics.trim())
    if (newAudio) formData.append("audio", newAudio)

    const token = getAuthToken()

    setSaving(true)
    try {
      const res = await fetch(getApiUrl("/api/songs"), {
        method: "POST",
        // jangan set Content-Type, browser mengaturnya otomatis untuk FormData
        headers: {
          ...API_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })

      const json = await res.json().catch(() => ({}))

      if (!res.ok) {
        const firstError =
          json?.data && typeof json.data === "object"
            ? (Object.values(json.data).flat()[0] as string | undefined)
            : undefined
        throw new Error(firstError || json.message || `HTTP ${res.status}`)
      }

      // pakai data dari server (id asli, audio_url asli), bukan Date.now()
      const saved = json.data
      const provinceName = formatProvince(
        saved.province?.name ??
          provinces.find((p) => String(p.id) === String(newProvinceId))?.name,
      )
      const audioUrl = saved.audio_url
        ? resolveAudioUrl(saved.audio_url)
        : undefined

      const newItem: Instrument = {
        id: saved.id,
        name: saved.title,
        province_id: saved.province_id,
        province: provinceName,
        region: getRegionByProvince(provinceName),
        status: saved.status ?? songStatus,
        composer: saved.composer ?? "Traditional",
        language: saved.language ?? "",
        description:
          saved.description ??
          "Warisan melodi tradisional dan cerita Nusantara.",
        lyrics: saved.lyrics ?? "",
        audio: audioUrl,
        audio_url: audioUrl,
        updated: formatDate(saved.updated_at ?? saved.created_at),
      }

      setItems((current) => [newItem, ...current])
      resetForm()
      navigate("/admin/musik", { replace: true })
      notify(
        `Lagu "${newItem.name}" berhasil disimpan sebagai ${songStatus === "draft" ? "draf" : "published"}`,
      )
    } catch (err) {
      console.error("Gagal menyimpan lagu:", err)
      notify(
        `Gagal menyimpan lagu: ${err instanceof Error ? err.message : "kesalahan tidak diketahui"}`,
      )
    } finally {
      setSaving(false)
    }
  }

  const updateSong = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (saving || !songId || !editSong || !newTitle.trim() || !newProvinceId) {
      return
    }

    const submitter = (event.nativeEvent as SubmitEvent).submitter
    const songStatus =
      submitter instanceof HTMLButtonElement && submitter.value === "published"
        ? "published"
        : submitter instanceof HTMLButtonElement && submitter.value === "draft"
          ? "draft"
          : editSong.status
    const formData = new FormData()
    formData.append("_method", "PUT")
    formData.append("province_id", newProvinceId)
    formData.append("title", newTitle.trim())
    formData.append("status", songStatus)
    if (newComposer.trim()) formData.append("composer", newComposer.trim())
    if (newLanguage.trim()) formData.append("language", newLanguage.trim())
    if (newDescription.trim()) formData.append("description", newDescription.trim())
    if (newLyrics.trim()) formData.append("lyrics", newLyrics.trim())
    if (newAudio) formData.append("audio", newAudio)

    const token = getAuthToken()
    setSaving(true)
    try {
      const response = await fetch(getApiUrl(`/api/songs/${songId}`), {
        method: "POST",
        headers: {
          ...API_HEADERS,
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })
      const payload: unknown = await response.json().catch(() => ({}))
      if (!response.ok) {
        const responseData =
          payload && typeof payload === "object" && "data" in payload
            ? payload.data
            : null
        const errors =
          responseData && typeof responseData === "object"
            ? Object.values(responseData).flat()
            : []
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? payload.message
            : undefined
        throw new Error(
          (typeof errors[0] === "string" ? errors[0] : undefined) ??
            (typeof message === "string" ? message : undefined) ??
            `HTTP ${response.status}`,
        )
      }

      const savedData =
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        payload.data &&
        typeof payload.data === "object"
          ? (payload.data as Record<string, unknown>)
          : {}
      const savedProvince =
        savedData.province && typeof savedData.province === "object"
          ? (savedData.province as Record<string, unknown>)
          : null
      const savedAudio = savedData.audio_url ?? savedData.audio
      const audioUrl =
        typeof savedAudio === "string" ? resolveAudioUrl(savedAudio) : editSong.audio
      const savedProvinceId = savedData.province_id ?? newProvinceId
      const provinceName =
        typeof savedProvince?.name === "string"
          ? savedProvince.name
          : provinces.find((item) => String(item.id) === String(savedProvinceId))
              ?.name ?? editSong.province
      const updatedSong: Instrument = {
        ...editSong,
        id:
          typeof savedData.id === "string" || typeof savedData.id === "number"
            ? savedData.id
            : editSong.id,
        name:
          typeof savedData.title === "string"
            ? savedData.title
            : newTitle.trim(),
        province_id: String(savedProvinceId),
        province: formatProvince(provinceName),
        region: getRegionByProvince(provinceName),
        status:
          typeof savedData.status === "string" ? savedData.status : songStatus,
        composer:
          typeof savedData.composer === "string"
            ? savedData.composer
            : newComposer.trim(),
        language:
          typeof savedData.language === "string"
            ? savedData.language
            : newLanguage.trim(),
        description:
          typeof savedData.description === "string"
            ? savedData.description
            : newDescription.trim(),
        lyrics:
          typeof savedData.lyrics === "string"
            ? savedData.lyrics
            : newLyrics.trim(),
        audio: audioUrl,
        audio_url: audioUrl,
        updated: formatDate(
          typeof savedData.updated_at === "string"
            ? savedData.updated_at
            : new Date().toISOString(),
        ),
      }

      setItems((current) =>
        current.map((item) => (String(item.id) === songId ? updatedSong : item)),
      )
      setEditSong(updatedSong)
      setNewAudio(null)
      navigate("/admin/musik", { replace: true })
      notify(`Lagu "${updatedSong.name}" berhasil diperbarui`)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Kesalahan tidak diketahui"
      console.error("Gagal memperbarui lagu:", error)
      notify(`Gagal memperbarui lagu: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteSong = async (selected: Instrument) => {
    const confirmed = window.confirm(
      `Apakah Anda yakin ingin menghapus lagu "${selected.name}"?`,
    )
    if (!confirmed) return

    notify(`Menghapus "${selected.name}" dari server...`)

    try {
      const token = getAuthToken()

      const res = await fetch(getApiUrl(`/api/songs/${selected.id}`), {
        method: "DELETE",
        headers: {
          ...API_HEADERS,
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

  const handleDeleteHouse = async (selected: TraditionalHouse) => {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus rumah adat "${selected.name}"?`,
      )
    ) {
      return false
    }

    try {
      const token = getAuthToken()
      const response = await fetch(
        getApiUrl(`/api/traditional-houses/${selected.id}`),
        {
          method: "DELETE",
          headers: {
            ...API_HEADERS,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
        },
      )

      if (!response.ok) {
        const errorData: unknown = await response.json().catch(() => ({}))
        const message =
          errorData &&
          typeof errorData === "object" &&
          "message" in errorData &&
          typeof errorData.message === "string"
            ? errorData.message
            : `Gagal menghapus rumah adat (HTTP ${response.status})`
        throw new Error(message)
      }

      notify(`Rumah adat "${selected.name}" berhasil dihapus dari database`)
      return true
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Gagal menghapus rumah adat"
      console.error("Gagal menghapus rumah adat dari API:", err)
      notify(`Gagal menghapus rumah adat: ${message}`)
      return false
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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

      <main className={styles.main}>
        <AdminTopbar
          title={isHousePage ? "Rumah Adat" : "Lagu Daerah"}
          search={query}
          searchPlaceholder={
            isHousePage
              ? "Cari rumah adat atau daerah..."
              : "Cari lagu, lirik, atau daerah..."
          }
          onSearchChange={setQuery}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        {isHousePage ? (
          <Rumahadat
            apiUrl={API_URL}
            query={query}
            onQueryChange={setQuery}
            onAction={notify}
            onDeleteHouse={handleDeleteHouse}
          />
        ) : isEditSongPage ? (
          editLoading ? (
            <section className="content">
              <p role="status">Memuat informasi lagu...</p>
            </section>
          ) : editError || !editSong ? (
            <section className="content">
              <div className="page-heading">
                <div>
                  <p>Koleksi Budaya / Pengelolaan Konten</p>
                  <h2>Lagu tidak dapat dimuat</h2>
                  <span role="alert">
                    {editError ?? "Data lagu tidak ditemukan."}
                  </span>
                </div>
              </div>
              <button
                className="add-button"
                style={{ display: "inline-flex", marginTop: 24 }}
                onClick={() => navigate("/admin/musik")}
              >
                Kembali ke daftar lagu
              </button>
            </section>
          ) : (
            <EditeMusik
              islands={islands}
              islandsError={islandsError}
              islandsLoading={islandsLoading}
              provinces={provinces}
              provincesError={provincesError}
              provincesLoading={provincesLoading}
              title={newTitle}
              islandId={newIslandId}
              provinceId={newProvinceId}
              composer={newComposer}
              language={newLanguage}
              description={newDescription}
              lyrics={newLyrics}
              audio={newAudio}
              saving={saving}
              onTitleChange={setNewTitle}
              onIslandChange={setNewIslandId}
              onProvinceChange={setNewProvinceId}
              onComposerChange={setNewComposer}
              onLanguageChange={setNewLanguage}
              onDescriptionChange={setNewDescription}
              onLyricsChange={setNewLyrics}
              onAudioChange={setNewAudio}
              onCancel={() => navigate("/admin/musik")}
              onSubmit={updateSong}
            />
          )
        ) : isCreateSongPage ? (
          <CreateMusik
            islands={islands}
            islandsError={islandsError}
            islandsLoading={islandsLoading}
            provinces={provinces}
            provincesError={provincesError}
            provincesLoading={provincesLoading}
            title={newTitle}
            islandId={newIslandId}
            provinceId={newProvinceId}
            composer={newComposer}
            language={newLanguage}
            description={newDescription}
            lyrics={newLyrics}
            audio={newAudio}
            saving={saving}
            onTitleChange={setNewTitle}
            onIslandChange={setNewIslandId}
            onProvinceChange={setNewProvinceId}
            onComposerChange={setNewComposer}
            onLanguageChange={setNewLanguage}
            onDescriptionChange={setNewDescription}
            onLyricsChange={setNewLyrics}
            onAudioChange={setNewAudio}
            onCancel={() => navigate("/admin/musik")}
            onSubmit={addSong}
          />
        ) : (
          <MusikView
            apiUrl={getApiUrl("/api/songs")}
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
            onAddSong={() => navigate("/admin/musik/tambah")}
            onEditSong={(song) => navigate(`/admin/musik/${song.id}/edit`)}
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
      </main>

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
     
      {toast && (
        <div className="toast">
          <i />
          {toast}
        </div>
      )}
    </div>
  )
}