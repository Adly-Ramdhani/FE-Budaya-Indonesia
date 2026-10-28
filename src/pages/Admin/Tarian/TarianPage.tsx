import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import "../../styles/musik.admin.css"
import AdminIcon from "../../../components/Admin/AdminIcon"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import TarianView, {
  type Dance,
  type Island,
  type Province,
} from "../../../components/Admin/Tarian/TarianView"
import { resolveTarianImage } from "../../../components/Admin/Tarian/tarianImage"
import styles from "../../AdminDashboard.module.css"

const rawApiUrl = import.meta.env.VITE_API_URL || ""
const API_URL = rawApiUrl.trim().replace(/\/$/, "")

function getText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value)
  if (value && typeof value === "object" && "name" in value) {
    return getText(value.name)
  }
  return ""
}

function getDanceList(payload: unknown): Record<string, unknown>[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ? payload.data
      : null

  if (!list) throw new Error("Format data API tarian tidak valid.")
  return list.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item),
  )
}

function getApiUrl(path: string): string {
  return API_URL ? `${API_URL}${path}` : path
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function mapDance(item: Record<string, unknown>, index: number): Dance {
  const province =
    item.province && typeof item.province === "object"
      ? (item.province as Record<string, unknown>)
      : null
  const island =
    province?.island && typeof province.island === "object"
      ? (province.island as Record<string, unknown>)
      : null
  const id =
    typeof item.id === "string" || typeof item.id === "number"
      ? item.id
      : `dance-${index}`

  return {
    id,
    name: getText(item.name ?? item.title) || "Tarian tanpa nama",
    provinceId: getText(item.province_id ?? province?.id),
    islandId: getText(province?.island_id ?? island?.id),
    province: getText(province?.name ?? item.province) || "Nusantara",
    description: getText(item.description) || "Belum ada deskripsi.",
    status: getText(item.status) || "draft",
    image: resolveTarianImage(item.image_url ?? item.image, API_URL),
  }
}

export default function TarianPage() {
  const navigate = useNavigate()
  const [dances, setDances] = useState<Dance[]>([])
  const [islands, setIslands] = useState<Island[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [islandsError, setIslandsError] = useState<string | null>(null)
  const [islandsLoading, setIslandsLoading] = useState(true)
  const [query, setQuery] = useState("")
  const [filterIslandId, setFilterIslandId] = useState("")
  const [filterProvinceId, setFilterProvinceId] = useState("")
  const [status, setStatus] = useState("Semua status")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [formOpen, setFormOpen] = useState(false)
  const [editingDance, setEditingDance] = useState<Dance | null>(null)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")
  const [name, setName] = useState("")
  const [provinceId, setProvinceId] = useState("")
  const [description, setDescription] = useState("")
  const [danceStatus, setDanceStatus] = useState("draft")
  const [image, setImage] = useState<File | null>(null)

  const loadDances = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(getApiUrl("/v1/dances"), {
        signal,
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
      if (!response.ok) {
        throw new Error(`Gagal memuat tarian (HTTP ${response.status}).`)
      }

      const records = getDanceList(await response.json())
      setDances(records.map(mapDance))
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return
      const message =
        cause instanceof Error ? cause.message : "Gagal memuat data tarian."
      console.error("Gagal mengambil data tarian:", cause)
      setError(message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadDances(controller.signal)
    return () => controller.abort()
  }, [loadDances])

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
        const records = getDanceList(await response.json())
        setProvinces(
          records.flatMap((item) => {
            const island =
              item.island && typeof item.island === "object"
                ? (item.island as Record<string, unknown>)
                : null
            return (typeof item.id === "string" || typeof item.id === "number") &&
              typeof item.name === "string"
              ? [
                  {
                    id: item.id,
                    name: item.name,
                    islandId: getText(item.island_id ?? island?.id),
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
      }
    }
    void loadProvinces()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    async function loadIslands() {
      setIslandsLoading(true)
      try {
        const response = await fetch(getApiUrl("/v1/islands"), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        const records = getDanceList(await response.json())
        setIslands(
          records.flatMap((item) =>
            (typeof item.id === "string" || typeof item.id === "number") &&
            typeof item.name === "string"
              ? [{ id: item.id, name: item.name }]
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
    void loadIslands()
    return () => controller.abort()
  }, [])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  function resetForm() {
    setName("")
    setProvinceId("")
    setDescription("")
    setDanceStatus("draft")
    setImage(null)
    setEditingDance(null)
  }

  function openCreateForm() {
    navigate("/admin/tarian/tambah")
  }

  function openEditForm(dance: Dance) {
    navigate(`/admin/tarian/${dance.id}/edit`)
  }

  async function saveDance(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return

    const formData = new FormData()
    formData.append("name", name.trim())
    formData.append("province_id", provinceId)
    formData.append("description", description.trim())
    formData.append("status", danceStatus)
    if (image) formData.append("image", image)
    if (editingDance) formData.append("_method", "PUT")

    const token = getAuthToken()
    setSaving(true)
    try {
      const response = await fetch(
        getApiUrl(
          editingDance ? `/v1/dances/${editingDance.id}` : "/v1/dances",
        ),
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
        const details =
          payload && typeof payload === "object" && "errors" in payload
            ? payload.errors
            : payload && typeof payload === "object" && "data" in payload
              ? payload.data
              : null
        const firstError =
          details && typeof details === "object"
            ? Object.values(details).flat().find((value) => typeof value === "string")
            : undefined
        const message =
          payload && typeof payload === "object" && "message" in payload
            ? payload.message
            : undefined
        throw new Error(
          (typeof firstError === "string" ? firstError : undefined) ??
            (typeof message === "string" ? message : undefined) ??
            `HTTP ${response.status}`,
        )
      }

      const responseData =
        payload &&
        typeof payload === "object" &&
        "data" in payload &&
        payload.data &&
        typeof payload.data === "object" &&
        !Array.isArray(payload.data)
          ? (payload.data as Record<string, unknown>)
          : payload && typeof payload === "object" && !Array.isArray(payload)
            ? (payload as Record<string, unknown>)
            : {}
      const selectedProvince = provinces.find(
        (item) => String(item.id) === provinceId,
      )
      const updatedDance = {
        ...mapDance(
        {
          ...responseData,
          id: responseData.id ?? editingDance?.id,
          name: responseData.name ?? name.trim(),
          province_id: responseData.province_id ?? provinceId,
          province:
            responseData.province ??
            selectedProvince?.name ??
            editingDance?.province ??
            "Nusantara",
          description: responseData.description ?? description.trim(),
          status: responseData.status ?? danceStatus,
          image_url:
            responseData.image_url ?? responseData.image ?? editingDance?.image,
        },
        0,
        ),
        provinceId,
        islandId: selectedProvince?.islandId ?? editingDance?.islandId ?? "",
        province:
          selectedProvince?.name ??
          editingDance?.province ??
          "Nusantara",
      }

      if (editingDance) {
        setDances((current) =>
          current.map((item) =>
            String(item.id) === String(editingDance.id) ? updatedDance : item,
          ),
        )
      } else {
        setDances((current) => [updatedDance, ...current])
      }
      setFormOpen(false)
      resetForm()
      notify(
        editingDance
          ? `Tarian "${updatedDance.name}" berhasil diperbarui.`
          : `Tarian "${updatedDance.name}" berhasil ditambahkan.`,
      )
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menyimpan tarian:", cause)
      notify(`Gagal menyimpan tarian: ${message}`)
    } finally {
      setSaving(false)
    }
  }

  async function deleteDance(dance: Dance) {
    if (
      !window.confirm(`Apakah Anda yakin ingin menghapus tarian "${dance.name}"?`)
    ) {
      return
    }

    const token = getAuthToken()
    try {
      const response = await fetch(getApiUrl(`/v1/dances/${dance.id}`), {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      })
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

      setDances((current) =>
        current.filter((item) => String(item.id) !== String(dance.id)),
      )
      notify(`Tarian "${dance.name}" berhasil dihapus.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menghapus tarian:", cause)
      notify(`Gagal menghapus tarian: ${message}`)
    }
  }

  const filterProvinces = useMemo(
    () =>
      provinces.filter(
        (item) => String(item.islandId) === String(filterIslandId),
      ),
    [filterIslandId, provinces],
  )

  const filteredDances = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    return dances.filter((dance) => {
      const danceProvince = provinces.find(
        (item) => String(item.id) === String(dance.provinceId),
      )
      const matchesQuery =
        !normalizedQuery ||
        `${dance.name} ${dance.province} ${dance.description}`
          .toLocaleLowerCase("id-ID")
          .includes(normalizedQuery)
      const matchesIsland =
        !filterIslandId ||
        String(dance.islandId) === String(filterIslandId) ||
        String(danceProvince?.islandId) === String(filterIslandId)
      const matchesProvince =
        !filterProvinceId ||
        String(dance.provinceId) === String(filterProvinceId) ||
        (!dance.provinceId &&
          dance.province.toLocaleLowerCase("id-ID") ===
            provinces
              .find((item) => String(item.id) === String(filterProvinceId))
              ?.name.toLocaleLowerCase("id-ID"))
      const matchesStatus =
        status === "Semua status" ||
        dance.status.toLocaleLowerCase("id-ID") ===
          status.toLocaleLowerCase("id-ID")
      return matchesQuery && matchesIsland && matchesProvince && matchesStatus
    })
  }, [dances, filterIslandId, filterProvinceId, provinces, query, status])

  function resetFilters() {
    setQuery("")
    setFilterIslandId("")
    setFilterProvinceId("")
    setStatus("Semua status")
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
          search={query}
          searchPlaceholder="Cari nama tarian atau daerah..."
          onSearchChange={setQuery}
          onOpenMenu={() => setSidebarOpen(true)}
        />

        <TarianView
          dances={filteredDances}
          islands={islands}
          provinces={filterProvinces}
          filterIslandId={filterIslandId}
          province={filterProvinceId}
          query={query}
          status={status}
          view={view}
          loading={loading}
          error={error}
          islandsLoading={islandsLoading}
          islandsError={islandsError}
          provincesError={provincesError}
          onQueryChange={setQuery}
          onFilterIslandChange={(islandId) => {
            setFilterIslandId(islandId)
            setFilterProvinceId("")
          }}
          onProvinceChange={setFilterProvinceId}
          onStatusChange={setStatus}
          onViewChange={setView}
          onResetFilters={resetFilters}
          onAdd={openCreateForm}
          onEdit={openEditForm}
          onDelete={(dance) => void deleteDance(dance)}
        />
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Tarian Nusantara</span>
        </footer>
      </main>

      {toast && (
        <div className="toast" role="status">
          <i />
          {toast}
        </div>
      )}
    </div>
  )
}
