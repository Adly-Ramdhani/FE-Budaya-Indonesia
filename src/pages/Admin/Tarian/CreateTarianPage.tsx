import { useEffect, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/musik.admin.css"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import CreateTarian from "../../../components/Admin/Tarian/Createtarian"
import type { Province } from "../../../components/Admin/Tarian/TarianView"
import styles from "../../AdminDashboard.module.css"

const rawApiUrl = import.meta.env.VITE_API_URL || ""
const API_URL = rawApiUrl.trim().replace(/\/$/, "")

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

export default function CreateTarianPage() {
  const navigate = useNavigate()
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesLoading, setProvincesLoading] = useState(true)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [name, setName] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [description, setDescription] = useState("")
  const [status, setStatus] = useState("draft")
  const [image, setImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [search, setSearch] = useState("")

  useEffect(() => {
    const controller = new AbortController()

    async function loadProvinces() {
      try {
        const response = await fetch(getApiUrl("/v1/provinces"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const payload: unknown = await response.json()
        setProvinces(
          getRecords(payload).flatMap((record) => {
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
          cause instanceof Error ? cause.message : "Gagal memuat daftar provinsi."
        console.error("Gagal mengambil daftar provinsi:", cause)
        setProvincesError(message)
      } finally {
        if (!controller.signal.aborted) setProvincesLoading(false)
      }
    }

    void loadProvinces()
    return () => controller.abort()
  }, [])

  async function saveDance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    setError(null)
    setSaving(true)
    try {
      const formData = new FormData()
      formData.append("name", name.trim())
      formData.append("province_id", provinceId)
      formData.append("description", description.trim())
      formData.append("status", status)
      if (image) formData.append("image", image)

      const token = getAuthToken()
      const response = await fetch(getApiUrl("/v1/dances"), {
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
        const details =
          payload && typeof payload === "object" && "errors" in payload
            ? payload.errors
            : payload && typeof payload === "object" && "data" in payload
              ? payload.data
              : null
        const firstError =
          details && typeof details === "object"
            ? Object.values(details)
                .flat()
                .find((value): value is string => typeof value === "string")
            : undefined
        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : undefined
        throw new Error(firstError ?? message ?? `HTTP ${response.status}`)
      }

      navigate("/admin/tarian", { replace: true })
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menambahkan tarian:", cause)
      setError(`Gagal menyimpan tarian: ${message}`)
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
        <CreateTarian
          provinces={provinces}
          provincesLoading={provincesLoading}
          provincesError={provincesError}
          name={name}
          provinceId={provinceId}
          description={description}
          status={status}
          image={image}
          saving={saving}
          error={error}
          onNameChange={setName}
          onProvinceChange={setProvinceId}
          onDescriptionChange={setDescription}
          onStatusChange={setStatus}
          onImageChange={setImage}
          onCancel={() => navigate("/admin/tarian")}
          onSubmit={saveDance}
        />
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Tarian Nusantara</span>
        </footer>
      </main>
    </div>
  )
}
