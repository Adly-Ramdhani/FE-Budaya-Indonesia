import { useCallback, useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { AdminSidebar, AdminTopbar } from "../../../components/Admin/AdminChrome"
import AdminIcon from "../../../components/Admin/AdminIcon"
import SenjataView, {
  type Island,
  type Province,
  type TraditionalWeapon,
  WeaponImage,
} from "../../../components/Admin/Senjata/SenjataView"
import { resolveTarianImage } from "../../../components/Admin/Tarian/tarianImage"
import styles from "../../AdminDashboard.module.css"
import "../../styles/musik.admin.css"
import { getApiBaseUrl } from "../../../api"

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

  if (!records) throw new Error("Format data API senjata tradisional tidak valid.")
  return records.filter(
    (record): record is Record<string, unknown> =>
      Boolean(record) && typeof record === "object" && !Array.isArray(record),
  )
}

function getText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value)
  }
  if (value && typeof value === "object" && "name" in value) {
    return getText(value.name)
  }
  return ""
}

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function mapWeapon(
  record: Record<string, unknown>,
  index: number,
): TraditionalWeapon {
  const province =
    record.province && typeof record.province === "object"
      ? (record.province as Record<string, unknown>)
      : null
  const island =
    record.island && typeof record.island === "object"
      ? (record.island as Record<string, unknown>)
      : null

  return {
    id:
      typeof record.id === "string" || typeof record.id === "number"
        ? record.id
        : `weapon-${index}`,
    name: getText(record.name ?? record.title) || "Senjata tanpa nama",
    provinceId: getText(record.province_id ?? province?.id),
    islandId: getText(record.island_id ?? island?.id ?? province?.island_id),
    province: getText(province?.name ?? record.province) || "Nusantara",
    description: getText(record.description) || "Belum ada deskripsi.",
    status: getText(record.status) || "draft",
    image: resolveTarianImage(record.image_url ?? record.image, API_URL),
  }
}

export default function SenjataPage() {
  const navigate = useNavigate()
  const [weapons, setWeapons] = useState<TraditionalWeapon[]>([])
  const [islands, setIslands] = useState<Island[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [query, setQuery] = useState("")
  const [filterIslandId, setFilterIslandId] = useState("")
  const [filterProvinceId, setFilterProvinceId] = useState("")
  const [status, setStatus] = useState("Semua status")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [islandsLoading, setIslandsLoading] = useState(true)
  const [islandsError, setIslandsError] = useState<string | null>(null)
  const [provincesError, setProvincesError] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [previewWeapon, setPreviewWeapon] =
    useState<TraditionalWeapon | null>(null)

  const loadWeapons = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(getApiUrl("/v1/traditional-weapons"), {
        signal,
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
      if (!response.ok) {
        throw new Error(
          `Gagal memuat senjata tradisional (HTTP ${response.status}).`,
        )
      }
      setWeapons(getRecords(await response.json()).map(mapWeapon))
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return
      const message =
        cause instanceof Error
          ? cause.message
          : "Gagal memuat data senjata tradisional."
      console.error("Gagal mengambil data senjata tradisional:", cause)
      setError(message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadWeapons(controller.signal)
    return () => controller.abort()
  }, [loadWeapons])

  useEffect(() => {
    const controller = new AbortController()

    async function loadLocations() {
      const headers = {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      }
      const [islandResult, provinceResult] = await Promise.allSettled([
        fetch(getApiUrl("/v1/islands"), {
          signal: controller.signal,
          headers,
        }),
        fetch(getApiUrl("/v1/provinces"), {
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
          console.error("Gagal mengambil daftar pulau:", cause)
          setIslandsError(message)
        }
      } else {
        const message =
          islandResult.reason instanceof Error
            ? islandResult.reason.message
            : "Gagal memuat daftar pulau."
        console.error("Gagal mengambil daftar pulau:", islandResult.reason)
        setIslandsError(message)
      }
      setIslandsLoading(false)

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
        }
      } else {
        const message =
          provinceResult.reason instanceof Error
            ? provinceResult.reason.message
            : "Gagal memuat daftar provinsi."
        console.error("Gagal mengambil daftar provinsi:", provinceResult.reason)
        setProvincesError(message)
      }
    }

    void loadLocations()
    return () => controller.abort()
  }, [])

  const filteredProvinces = useMemo(
    () =>
      provinces.filter(
        (item) => String(item.islandId) === String(filterIslandId),
      ),
    [filterIslandId, provinces],
  )

  const filteredWeapons = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    return weapons.filter((weapon) => {
      const matchingProvince = provinces.find(
        (item) => String(item.id) === String(weapon.provinceId),
      )
      const searchableText =
        `${weapon.name} ${weapon.province} ${weapon.description}`.toLocaleLowerCase(
          "id-ID",
        )
      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (!filterIslandId ||
          String(weapon.islandId) === String(filterIslandId) ||
          String(matchingProvince?.islandId) === String(filterIslandId)) &&
        (!filterProvinceId ||
          String(weapon.provinceId) === String(filterProvinceId)) &&
        (status === "Semua status" ||
          weapon.status.toLocaleLowerCase("id-ID") ===
            status.toLocaleLowerCase("id-ID"))
      )
    })
  }, [filterIslandId, filterProvinceId, provinces, query, status, weapons])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  async function deleteWeapon(weapon: TraditionalWeapon) {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus senjata "${weapon.name}"?`,
      )
    ) {
      return
    }

    const token = getAuthToken()
    try {
      const response = await fetch(
        getApiUrl(`/v1/traditional-weapons/${weapon.id}`),
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
      setWeapons((current) =>
        current.filter((item) => String(item.id) !== String(weapon.id)),
      )
      notify(`Senjata "${weapon.name}" berhasil dihapus.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menghapus senjata tradisional:", cause)
      notify(`Gagal menghapus senjata: ${message}`)
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem="Senjata Tradisional"
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
          title="Senjata Tradisional"
          search={query}
          searchPlaceholder="Cari senjata atau daerah..."
          onSearchChange={setQuery}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <SenjataView
          weapons={filteredWeapons}
          islands={islands}
          provinces={filteredProvinces}
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
          onResetFilters={() => {
            setQuery("")
            setFilterIslandId("")
            setFilterProvinceId("")
            setStatus("Semua status")
          }}
          onAdd={() =>
            notify("Halaman tambah senjata tradisional belum tersedia.")
          }
          onPreview={setPreviewWeapon}
          onEdit={() =>
            notify("Halaman edit senjata tradisional belum tersedia.")
          }
          onDelete={(weapon) => void deleteWeapon(weapon)}
        />
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Senjata Tradisional Nusantara</span>
        </footer>
        {previewWeapon && (
          <div
            className="modal-backdrop"
            onMouseDown={() => setPreviewWeapon(null)}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="weapon-preview-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-heading">
                <div>
                  <p>{previewWeapon.province} · Senjata Tradisional</p>
                  <h3 id="weapon-preview-title">{previewWeapon.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewWeapon(null)}
                  aria-label="Tutup pratinjau"
                >
                  <AdminIcon name="close" />
                </button>
              </div>
              {previewWeapon.image && (
                <div className="house-preview-image">
                  <WeaponImage
                    src={previewWeapon.image}
                    alt={previewWeapon.name}
                  />
                </div>
              )}
              <p className="house-preview-description">
                {previewWeapon.description || "Deskripsi belum tersedia."}
              </p>
            </div>
          </div>
        )}
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
