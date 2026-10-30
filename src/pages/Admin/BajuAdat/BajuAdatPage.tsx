import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
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
const ATTIRE_ENDPOINT = "/v1/traditional-attires"

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

  if (!records) throw new Error("Format data API pakaian adat tidak valid.")
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

function mapAttire(
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
        : `attire-${index}`,
    name: getText(record.name ?? record.title) || "Pakaian adat tanpa nama",
    provinceId: getText(record.province_id ?? province?.id),
    islandId: getText(record.island_id ?? island?.id ?? province?.island_id),
    province: getText(province?.name ?? record.province) || "Nusantara",
    description: getText(record.description) || "Belum ada deskripsi.",
    status: getText(record.status) || "draft",
    image: resolveTarianImage(record.image_url ?? record.image, API_URL),
  }
}

export default function BajuAdatPage() {
  const navigate = useNavigate()
  const [attires, setAttires] = useState<TraditionalWeapon[]>([])
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
  const [formOpen, setFormOpen] = useState(false)
  const [formAttire, setFormAttire] = useState<TraditionalWeapon | null>(null)
  const [formName, setFormName] = useState("")
  const [formProvinceId, setFormProvinceId] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formImage, setFormImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadAttires = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(getApiUrl(ATTIRE_ENDPOINT), {
        signal,
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
      if (!response.ok) {
        throw new Error(
          `Gagal memuat pakaian adat (HTTP ${response.status}).`,
        )
      }
      setAttires(getRecords(await response.json()).map(mapAttire))
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return
      const message =
        cause instanceof Error
          ? cause.message
          : "Gagal memuat data pakaian adat."
      console.error("Gagal mengambil data pakaian adat:", cause)
      setError(message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadAttires(controller.signal)
    return () => controller.abort()
  }, [loadAttires])

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

  const filteredAttires = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    return attires.filter((attire) => {
      const matchingProvince = provinces.find(
        (item) => String(item.id) === String(attire.provinceId),
      )
      const searchableText =
        `${attire.name} ${attire.province} ${attire.description}`.toLocaleLowerCase(
          "id-ID",
        )
      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (!filterIslandId ||
          String(attire.islandId) === String(filterIslandId) ||
          String(matchingProvince?.islandId) === String(filterIslandId)) &&
        (!filterProvinceId ||
          String(attire.provinceId) === String(filterProvinceId)) &&
        (status === "Semua status" ||
          attire.status.toLocaleLowerCase("id-ID") ===
            status.toLocaleLowerCase("id-ID"))
      )
    })
  }, [attires, filterIslandId, filterProvinceId, provinces, query, status])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  function openForm(attire?: TraditionalWeapon) {
    setFormOpen(true)
    setFormAttire(attire ?? null)
    setFormName(attire?.name ?? "")
    setFormProvinceId(attire?.provinceId ?? "")
    setFormDescription(
      attire?.description === "Belum ada deskripsi."
        ? ""
        : attire?.description ?? "",
    )
    setFormImage(null)
    setFormError(null)
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formProvinceId) {
      setFormError("Provinsi wajib dipilih.")
      return
    }

    const formData = new FormData()
    formData.set("province_id", formProvinceId)
    formData.set("name", formName.trim())
    formData.set("description", formDescription.trim())
    if (formImage) formData.set("image", formImage)
    if (formAttire) formData.set("_method", "PUT")

    const token = getAuthToken()
    setSaving(true)
    setFormError(null)
    try {
      const response = await fetch(
        getApiUrl(
          formAttire
            ? `${ATTIRE_ENDPOINT}/${formAttire.id}`
            : ATTIRE_ENDPOINT,
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
      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => ({}))
        const errors =
          payload &&
          typeof payload === "object" &&
          "errors" in payload &&
          payload.errors &&
          typeof payload.errors === "object"
            ? Object.values(payload.errors as Record<string, unknown>)
                .flatMap((messages) =>
                  Array.isArray(messages) ? messages : [messages],
                )
                .find((message): message is string => typeof message === "string")
            : undefined
        const message =
          payload &&
          typeof payload === "object" &&
          "message" in payload &&
          typeof payload.message === "string"
            ? payload.message
            : errors ?? `HTTP ${response.status}`
        throw new Error(message)
      }

      const wasEditing = Boolean(formAttire)
      setFormOpen(false)
      setFormAttire(null)
      await loadAttires()
      notify(
        wasEditing
          ? "Pakaian adat berhasil diperbarui."
          : "Pakaian adat berhasil ditambahkan.",
      )
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menyimpan pakaian adat:", cause)
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteAttire(attire: TraditionalWeapon) {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus pakaian adat "${attire.name}"?`,
      )
    ) {
      return
    }

    const token = getAuthToken()
    try {
      const response = await fetch(
        getApiUrl(`${ATTIRE_ENDPOINT}/${attire.id}`),
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
      setAttires((current) =>
        current.filter((item) => String(item.id) !== String(attire.id)),
      )
      notify(`Pakaian adat "${attire.name}" berhasil dihapus.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menghapus pakaian adat:", cause)
      notify(`Gagal menghapus pakaian adat: ${message}`)
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem="Pakaian Adat"
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
          title="Pakaian Adat"
          search={query}
          searchPlaceholder="Cari pakaian adat atau daerah..."
          onSearchChange={setQuery}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        <SenjataView
          contentTitle="Pakaian Adat Nusantara"
          itemLabel="pakaian adat"
          endpointLabel={ATTIRE_ENDPOINT}
          weapons={filteredAttires}
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
          onAdd={() => openForm()}
          onPreview={setPreviewWeapon}
          onEdit={openForm}
          onDelete={(attire) => void deleteAttire(attire)}
        />
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Pakaian Adat Nusantara</span>
        </footer>
        {formOpen && (
          <div
            className="modal-backdrop"
            onMouseDown={() => {
              if (!saving) setFormOpen(false)
            }}
          >
            <form
              className="modal"
              onSubmit={submitForm}
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-heading">
                <div>
                  <p>Pengelolaan Pakaian Adat</p>
                  <h3>{formAttire ? "Perbarui pakaian adat" : "Tambah pakaian adat"}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  aria-label="Tutup form"
                  disabled={saving}
                >
                  <AdminIcon name="close" />
                </button>
              </div>
              {formError && (
                <p role="alert" style={{ color: "#af4632" }}>
                  {formError}
                </p>
              )}
              <label>
                Provinsi
                <select
                  value={formProvinceId}
                  onChange={(event) => setFormProvinceId(event.target.value)}
                  required
                  disabled={saving}
                >
                  <option value="">Pilih provinsi</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.id}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Nama pakaian adat
                <input
                  value={formName}
                  onChange={(event) => setFormName(event.target.value)}
                  required
                  disabled={saving}
                />
              </label>
              <label>
                Deskripsi
                <textarea
                  value={formDescription}
                  onChange={(event) => setFormDescription(event.target.value)}
                  required
                  disabled={saving}
                  rows={4}
                />
              </label>
              <label>
                Gambar {formAttire ? "(opsional)" : ""}
                <input
                  type="file"
                  accept="image/*"
                  required={!formAttire}
                  onChange={(event) =>
                    setFormImage(event.target.files?.[0] ?? null)
                  }
                  disabled={saving}
                />
              </label>
              <div className="card-actions">
                <button
                  type="button"
                  onClick={() => setFormOpen(false)}
                  disabled={saving}
                >
                  Batal
                </button>
                <button type="submit" disabled={saving}>
                  {saving
                    ? "Menyimpan..."
                    : formAttire
                      ? "Simpan perubahan"
                      : "Tambah pakaian"}
                </button>
              </div>
            </form>
          </div>
        )}
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
                  <p>{previewWeapon.province} · Pakaian Adat</p>
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
