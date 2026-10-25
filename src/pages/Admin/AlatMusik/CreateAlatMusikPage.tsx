import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/musik.admin.css"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import CreateAlatMusik from "../../../components/Admin/AlatMusik/CreateAlatMusik"
import styles from "../../AdminDashboard.module.css"

type Province = {
  id: string | number
  name: string
  islandId: string
}

type Island = {
  id: string | number
  name: string
}

const API_URL = (import.meta.env.VITE_API_URL || "").trim().replace(/\/$/, "")

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

  if (!records) throw new Error("Format data provinsi tidak valid.")
  return records.filter(
    (record): record is Record<string, unknown> =>
      Boolean(record) && typeof record === "object" && !Array.isArray(record),
  )
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function getErrorMessage(payload: unknown, status: number): string {
  if (payload && typeof payload === "object") {
    const details =
      "errors" in payload
        ? payload.errors
        : "data" in payload
          ? payload.data
          : null
    const firstError =
      details && typeof details === "object"
        ? Object.values(details)
            .flat()
            .find((value): value is string => typeof value === "string")
        : undefined
    if (firstError) return firstError
    if ("message" in payload && typeof payload.message === "string") {
      return payload.message
    }
  }
  return `HTTP ${status}`
}

export default function CreateAlatMusikPage() {
  const navigate = useNavigate()
  const [islands, setIslands] = useState<Island[]>([])
  const [islandsLoading, setIslandsLoading] = useState(true)
  const [islandsError, setIslandsError] = useState<string | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [islandId, setIslandId] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [description, setDescription] = useState("")
  const [videoUrl, setVideoUrl] = useState("")
  const [status, setStatus] = useState("draft")
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function loadLocations() {
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      }
      const [islandResult, provinceResult] = await Promise.allSettled([
        fetch(getApiUrl("/api/islands"), { signal: controller.signal, headers }),
        fetch(getApiUrl("/api/provinces"), {
          signal: controller.signal,
          headers,
        }),
      ])

      if (controller.signal.aborted) return

      if (islandResult.status === "fulfilled") {
        try {
          if (!islandResult.value.ok) {
            throw new Error(`HTTP ${islandResult.value.status}`)
          }
          setIslands(
            getRecords(await islandResult.value.json()).flatMap((record) =>
              (typeof record.id === "string" ||
                typeof record.id === "number") &&
              typeof record.name === "string"
                ? [{ id: record.id, name: record.name }]
                : [],
            ),
          )
        } catch (cause) {
          if (cause instanceof Error && cause.name === "AbortError") return
          const message =
            cause instanceof Error ? cause.message : "Gagal memuat daftar pulau."
          console.error("Gagal mengambil daftar pulau alat musik:", cause)
          setIslandsError(message)
        } finally {
          if (!controller.signal.aborted) setIslandsLoading(false)
        }
      } else {
        const message =
          islandResult.reason instanceof Error
            ? islandResult.reason.message
            : "Gagal memuat daftar pulau."
        console.error("Gagal mengambil daftar pulau alat musik:", islandResult.reason)
        setIslandsError(message)
        setIslandsLoading(false)
      }

      if (provinceResult.status === "fulfilled") {
        try {
          if (!provinceResult.value.ok) {
            throw new Error(`HTTP ${provinceResult.value.status}`)
          }
          setProvinces(
            getRecords(await provinceResult.value.json()).flatMap((record) => {
              const island =
                record.island && typeof record.island === "object"
                  ? (record.island as Record<string, unknown>)
                  : null
              return (typeof record.id === "string" ||
                typeof record.id === "number") &&
                typeof record.name === "string"
                ? [
                    {
                      id: record.id,
                      name: record.name,
                      islandId: String(record.island_id ?? island?.id ?? ""),
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
          console.error("Gagal mengambil daftar provinsi alat musik:", cause)
          setProvincesError(message)
        } finally {
          if (!controller.signal.aborted) setProvincesLoading(false)
        }
      } else {
        const message =
          provinceResult.reason instanceof Error
            ? provinceResult.reason.message
            : "Gagal memuat daftar provinsi."
        console.error(
          "Gagal mengambil daftar provinsi alat musik:",
          provinceResult.reason,
        )
        setProvincesError(message)
        setProvincesLoading(false)
      }
    }

    void loadLocations()
    return () => controller.abort()
  }, [])

  async function saveInstrument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("island_id", islandId)
      formData.append("province_id", provinceId)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      formData.append("video_url", videoUrl.trim())
      formData.append("status", status)
      if (image) formData.append("image", image)

      const token = getAuthToken()
      const response = await fetch(getApiUrl("/api/musical-instruments"), {
        method: "POST",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: formData,
      })
      const payload: unknown = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, response.status))
      }
      navigate("/admin/alat-musik", { replace: true })
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menambahkan alat musik:", cause)
      setError(`Gagal menyimpan alat musik: ${message}`)
    } finally {
      setSaving(false)
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
          else if (label === "Rumah Adat") navigate("/admin/rumah-adat")
        }}
      />
      <main className={styles.main}>
        <AdminTopbar
          title="Alat Musik"
          search={search}
          searchPlaceholder="Cari alat musik..."
          onSearchChange={setSearch}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <CreateAlatMusik
          islands={islands}
          islandsLoading={islandsLoading}
          islandsError={islandsError}
          provinces={provinces}
          provincesLoading={provincesLoading}
          provincesError={provincesError}
          name={name}
          islandId={islandId}
          provinceId={provinceId}
          description={description}
          videoUrl={videoUrl}
          status={status}
          image={image}
          saving={saving}
          error={error}
          onIslandChange={(value) => {
            setIslandId(value)
            setProvinceId("")
          }}
          onNameChange={setName}
          onProvinceChange={setProvinceId}
          onDescriptionChange={setDescription}
          onVideoUrlChange={setVideoUrl}
          onStatusChange={setStatus}
          onImageChange={setImage}
          onCancel={() => navigate("/admin/alat-musik")}
          onSubmit={saveInstrument}
        />
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Alat Musik Nusantara</span>
        </footer>
      </main>
    </div>
  )
}
