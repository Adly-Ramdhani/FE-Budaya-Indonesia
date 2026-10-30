import { useEffect, useState, type FormEvent } from "react"
import { useNavigate, useParams } from "react-router-dom"
import "../../styles/musik.admin.css"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import EditeTarian from "../../../components/Admin/Tarian/EditeTarian"
import { resolveTarianImage } from "../../../components/Admin/Tarian/tarianImage"
import type { Province } from "../../../components/Admin/Tarian/TarianView"
import styles from "../../AdminDashboard.module.css"
import { getApiBaseUrl } from "../../../api"

const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)

function getApiUrl(path: string): string {
  return API_URL ? `${API_URL}${path}` : path
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
    throw new Error("Format data tarian tidak valid.")
  }
  return record as Record<string, unknown>
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

export default function EditTarianPage() {
  const { danceId } = useParams<{ danceId: string }>()
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("draft")
  const [currentImage, setCurrentImage] = useState<string>()
  const [image, setImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    if (!danceId) return
    const controller = new AbortController()

    async function loadData() {
      setLoading(true)
      setError(null)
      setProvincesError(null)
      try {
        const [danceResult, provinceResult] = await Promise.allSettled([
          fetch(getApiUrl(`/v1/dances/${danceId}`), {
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

        if (danceResult.status === "rejected") throw danceResult.reason
        const danceResponse = danceResult.value
        if (!danceResponse.ok) {
          throw new Error(`Gagal memuat tarian (HTTP ${danceResponse.status}).`)
        }

        const dance = getRecord(await danceResponse.json())
        let availableProvinces: Province[] = []
        if (provinceResult.status === "rejected") {
          setProvincesError(
            provinceResult.reason instanceof Error
              ? provinceResult.reason.message
              : "Gagal memuat daftar provinsi.",
          )
        } else if (!provinceResult.value.ok) {
          setProvincesError(`HTTP ${provinceResult.value.status}`)
        } else {
          try {
            availableProvinces = getRecords(
              await provinceResult.value.json(),
            ).flatMap((record) => {
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
            })
          } catch (cause) {
            setProvincesError(
              cause instanceof Error
                ? cause.message
                : "Format data provinsi tidak valid.",
            )
          }
        }
        const province =
          dance.province && typeof dance.province === "object"
            ? (dance.province as Record<string, unknown>)
            : null
        const danceProvinceId = dance.province_id ?? province?.id
        const selectedProvince = availableProvinces.find(
          (item) => String(item.id) === String(danceProvinceId),
        )
        if (
          !selectedProvince &&
          (typeof danceProvinceId === "string" ||
            typeof danceProvinceId === "number")
        ) {
          availableProvinces.unshift({
            id: danceProvinceId,
            name:
              typeof province?.name === "string"
                ? province.name
                : "Provinsi saat ini",
            islandId: String(province?.island_id ?? ""),
          })
        }
        const danceName =
          typeof dance.name === "string"
            ? dance.name
            : typeof dance.title === "string"
              ? dance.title
              : ""
        const danceDescription =
          typeof dance.description === "string" ? dance.description : ""
        const danceStatus =
          typeof dance.status === "string" ? dance.status.toLowerCase() : "draft"
        const rawImage = dance.image_url ?? dance.image

        setProvinces(availableProvinces)
        setName(danceName)
        setProvinceId(danceProvinceId == null ? "" : String(danceProvinceId))
        setDescription(danceDescription)
        setStatus(danceStatus === "published" ? "published" : "draft")
        setCurrentImage(resolveTarianImage(rawImage, API_URL))
        setProvinces(availableProvinces)
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return
        const message =
          cause instanceof Error ? cause.message : "Gagal memuat data tarian."
        console.error("Gagal memuat tarian untuk diedit:", cause)
        setError(message)
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
          setProvincesLoading(false)
        }
      }
    }

    void loadData()
    return () => controller.abort()
  }, [danceId])

  async function saveChanges(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!danceId || saving) return

    setError(null)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("_method", "PUT")
      formData.append("name", name.trim())
      formData.append("province_id", provinceId)
      formData.append("description", description.trim())
      formData.append("status", status)
      if (image) formData.append("image", image)

      const token = getAuthToken()
      const response = await fetch(getApiUrl(`/v1/dances/${danceId}`), {
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
      navigate("/admin/tarian", { replace: true })
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal memperbarui tarian:", cause)
      setError(`Gagal menyimpan perubahan: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem="Tarian"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(label) => {
          if (label === "Dashboard") navigate("/dashboard")
          else if (label === "Tarian") navigate("/admin/tarian")
          else if (label === "Lagu Daerah") navigate("/admin/musik")
          else if (label === "Alat Musik") navigate("/admin/alat-musik")
          else if (label === "Senjata Tradisional") navigate("/admin/senjata")
          else if (label === "Rumah Adat") navigate("/admin/rumah-adat")
        }}
      />
      <main className={styles.main}>
        <AdminTopbar
          title="Tarian"
          search={search}
          searchPlaceholder="Cari tarian..."
          onSearchChange={setSearch}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        {loading ? (
          <section className="content">
            <p role="status">Memuat informasi tarian...</p>
          </section>
        ) : error && !name ? (
          <section className="content">
            <div className="page-heading">
              <div>
                <p>Koleksi Budaya / Pengelolaan Konten</p>
                <h2>Tarian tidak dapat dimuat</h2>
                <span role="alert">{error}</span>
              </div>
            </div>
            <button
              className="add-button tarian-add-button"
              onClick={() => navigate("/admin/tarian")}
            >
              Kembali ke daftar tarian
            </button>
          </section>
        ) : (
          <EditeTarian
            provinces={provinces}
            provincesLoading={provincesLoading}
            provincesError={provincesError}
            name={name}
            provinceId={provinceId}
            description={description}
            status={status}
            image={image}
            currentImage={currentImage}
            saving={saving}
            error={error}
            onNameChange={setName}
            onProvinceChange={setProvinceId}
            onDescriptionChange={setDescription}
            onStatusChange={setStatus}
            onImageChange={setImage}
            onCancel={() => navigate("/admin/tarian")}
            onSubmit={saveChanges}
          />
        )}
        <footer>
          <span>© 2026 Purwa Nusantara · Merawat cerita bersama.</span>
          <span>Data Tarian Nusantara</span>
        </footer>
      </main>
    </div>
  )
}
