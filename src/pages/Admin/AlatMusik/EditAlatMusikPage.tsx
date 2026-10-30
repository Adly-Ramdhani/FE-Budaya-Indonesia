import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../styles/musik.admin.css"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import EditAlatMusik from "../../../components/Admin/AlatMusik/EditAlatMusik"
import { resolveTarianImage } from "../../../components/Admin/Tarian/tarianImage"
import styles from "../../AdminDashboard.module.css"
import { getApiBaseUrl } from "../../../api"

type Island = {
  id: string | number
  name: string
}

type Province = {
  id: string | number
  name: string
  islandId: string
}

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

function getRecord(payload: unknown): Record<string, unknown> {
  const record =
    payload &&
    typeof payload === "object" &&
    "data" in payload &&
    payload.data &&
    typeof payload.data === "object" &&
    !Array.isArray(payload.data)
      ? payload.data
      : payload

  if (!record || typeof record !== "object" || Array.isArray(record)) {
    throw new Error("Format data alat musik tidak valid.")
  }
  return record as Record<string, unknown>
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function getText(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value)
    : ""
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

export default function EditAlatMusikPage() {
  const { instrumentId } = useParams<{ instrumentId: string }>()
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
  const [currentImage, setCurrentImage] = useState<string>()
  const [pageLoading, setPageLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!instrumentId) {
      setError("ID alat musik tidak ditemukan.")
      setPageLoading(false)
      return
    }

    const controller = new AbortController()

    async function loadData() {
      setPageLoading(true)
      setError(null)
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      }

      const [instrumentResult, islandsResult, provincesResult] =
        await Promise.allSettled([
          fetch(getApiUrl(`/v1/musical-instruments/${instrumentId}`), {
            signal: controller.signal,
            headers,
          }),
          fetch(getApiUrl("/v1/islands"), { signal: controller.signal, headers }),
          fetch(getApiUrl("/v1/provinces"), {
            signal: controller.signal,
            headers,
          }),
        ])

      if (controller.signal.aborted) return

      try {
        if (instrumentResult.status === "rejected") {
          throw instrumentResult.reason
        }
        if (!instrumentResult.value.ok) {
          throw new Error(
            `Gagal memuat alat musik (HTTP ${instrumentResult.value.status}).`,
          )
        }

        const record = getRecord(await instrumentResult.value.json())
        const province =
          record.province && typeof record.province === "object"
            ? (record.province as Record<string, unknown>)
            : null
        const island =
          record.island && typeof record.island === "object"
            ? (record.island as Record<string, unknown>)
            : province?.island && typeof province.island === "object"
              ? (province.island as Record<string, unknown>)
              : null
        const currentProvinceId = record.province_id ?? province?.id
        const currentIslandId =
          record.island_id ?? island?.id ?? province?.island_id
        const rawImage = record.image_url ?? record.image
        const rawStatus = getText(record.status).toLowerCase()

        setName(getText(record.name ?? record.title))
        setIslandId(getText(currentIslandId))
        setProvinceId(getText(currentProvinceId))
        setDescription(getText(record.description))
        setVideoUrl(getText(record.video_url))
        setStatus(
          rawStatus === "published" || rawStatus === "terbit"
            ? "published"
            : "draft",
        )
        setCurrentImage(resolveTarianImage(rawImage, API_URL))
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return
        const message =
          cause instanceof Error ? cause.message : "Gagal memuat data alat musik."
        console.error("Gagal memuat alat musik untuk diedit:", cause)
        setError(message)
      }

      if (islandsResult.status === "fulfilled") {
        try {
          if (!islandsResult.value.ok) {
            throw new Error(`HTTP ${islandsResult.value.status}`)
          }
          setIslands(
            getRecords(await islandsResult.value.json()).flatMap((record) =>
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
          console.error("Gagal mengambil daftar pulau untuk alat musik:", cause)
          setIslandsError(message)
        } finally {
          if (!controller.signal.aborted) setIslandsLoading(false)
        }
      } else {
        const message =
          islandsResult.reason instanceof Error
            ? islandsResult.reason.message
            : "Gagal memuat daftar pulau."
        console.error("Gagal mengambil daftar pulau untuk alat musik:", islandsResult.reason)
        setIslandsError(message)
        setIslandsLoading(false)
      }

      if (provincesResult.status === "fulfilled") {
        try {
          if (!provincesResult.value.ok) {
            throw new Error(`HTTP ${provincesResult.value.status}`)
          }
          setProvinces(
            getRecords(await provincesResult.value.json()).flatMap((record) => {
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
          console.error("Gagal mengambil daftar provinsi untuk alat musik:", cause)
          setProvincesError(message)
        } finally {
          if (!controller.signal.aborted) setProvincesLoading(false)
        }
      } else {
        const message =
          provincesResult.reason instanceof Error
            ? provincesResult.reason.message
            : "Gagal memuat daftar provinsi."
        console.error(
          "Gagal mengambil daftar provinsi untuk alat musik:",
          provincesResult.reason,
        )
        setProvincesError(message)
        setProvincesLoading(false)
      }

      if (!controller.signal.aborted) setPageLoading(false)
    }

    void loadData()
    return () => controller.abort()
  }, [instrumentId])

  async function saveInstrument(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!instrumentId || saving) return

    setError(null)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("island_id", islandId)
      formData.append("province_id", provinceId)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      formData.append("video_url", videoUrl.trim())
      formData.append("status", status)
      if (image) formData.append("image", image)

      const token = getAuthToken()
      const response = await fetch(
        getApiUrl(`/v1/musical-instruments/${instrumentId}`),
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: formData,
        },
      )
      const payload: unknown = await response.json().catch(() => ({}))
      if (!response.ok) {
        throw new Error(getErrorMessage(payload, response.status))
      }
      navigate("/admin/alat-musik", { replace: true })
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal memperbarui alat musik:", cause)
      setError(`Gagal menyimpan perubahan: ${message}`)
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
          else if (label === "Senjata Tradisional") navigate("/admin/senjata")
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
        {pageLoading ? (
          <section className="content">
            <p role="status">Memuat informasi alat musik...</p>
          </section>
        ) : error && !name ? (
          <section className="content">
            <div className="page-heading">
              <div>
                <p>Koleksi Budaya / Pengelolaan Konten</p>
                <h2>Alat musik tidak dapat dimuat</h2>
                <span role="alert">{error}</span>
              </div>
            </div>
            <button
              className="add-button tarian-add-button"
              onClick={() => navigate("/admin/alat-musik")}
            >
              Kembali ke daftar alat musik
            </button>
          </section>
        ) : (
          <EditAlatMusik
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
            currentImage={currentImage}
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
        )}
        <footer>
          <span>© 2026 Purwa Nusantara · Merawat cerita bersama.</span>
          <span>Data Alat Musik Nusantara</span>
        </footer>
      </main>
    </div>
  )
}
