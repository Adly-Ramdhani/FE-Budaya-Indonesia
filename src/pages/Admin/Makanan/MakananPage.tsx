import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
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
const FOOD_ENDPOINT = "/v1/foods"

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

  if (!records) throw new Error("Format data API makanan tidak valid.")
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

function getVideoUrl(value: unknown): string | undefined {
  const text = getText(value).trim()
  if (!text) return undefined

  try {
    const url = new URL(
      /^[a-z][a-z\d+.-]*:\/\//i.test(text) ? text : `https://${text}`,
    )
    return url.protocol === "http:" || url.protocol === "https:"
      ? url.toString()
      : undefined
  } catch {
    return undefined
  }
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

function getAuthToken(): string | null {
  return localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")
}

function mapFood(
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
        : `food-${index}`,
    name: getText(record.name ?? record.title) || "Makanan tanpa nama",
    provinceId: getText(record.province_id ?? province?.id),
    islandId: getText(record.island_id ?? island?.id ?? province?.island_id),
    province: getText(province?.name ?? record.province) || "Nusantara",
    description: getText(record.description) || "Belum ada deskripsi.",
    status: getText(record.status) || "draft",
    image: resolveTarianImage(record.image_url ?? record.image, API_URL),
    ingredients: getText(record.ingredients),
    videoUrl: getVideoUrl(record.video_url ?? record.videoUrl),
    videoCopyright: getText(record.video_copyright),
  }
}

export default function MakananAdminPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { foodId } = useParams<{ foodId: string }>()
  const isCreateFoodPage = location.pathname.endsWith("/tambah")
  const isFoodFormPage = isCreateFoodPage || Boolean(foodId)
  const [foods, setFoods] = useState<TraditionalWeapon[]>([])
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
  const [previewFood, setPreviewFood] =
    useState<TraditionalWeapon | null>(null)
  const [formFood, setFormFood] = useState<TraditionalWeapon | null>(null)
  const [formName, setFormName] = useState("")
  const [formProvinceId, setFormProvinceId] = useState("")
  const [formIslandId, setFormIslandId] = useState("")
  const [formDescription, setFormDescription] = useState("")
  const [formIngredients, setFormIngredients] = useState("")
  const [formVideoUrl, setFormVideoUrl] = useState("")
  const [formVideoCopyright, setFormVideoCopyright] = useState("")
  const [formImage, setFormImage] = useState<File | null>(null)
  const [saving, setSaving] = useState(false)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const loadFoods = useCallback(async (signal?: AbortSignal) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(getApiUrl(FOOD_ENDPOINT), {
        signal,
        headers: {
          Accept: "application/json",
          "ngrok-skip-browser-warning": "true",
        },
      })
      if (!response.ok) {
        throw new Error(
          `Gagal memuat makanan (HTTP ${response.status}).`,
        )
      }
      setFoods(getRecords(await response.json()).map(mapFood))
    } catch (cause) {
      if (cause instanceof Error && cause.name === "AbortError") return
      const message =
        cause instanceof Error
          ? cause.message
          : "Gagal memuat data makanan."
      console.error("Gagal mengambil data makanan:", cause)
      setError(message)
    } finally {
      if (!signal?.aborted) setLoading(false)
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    void loadFoods(controller.signal)
    return () => controller.abort()
  }, [loadFoods])

  useEffect(() => {
    if (!isFoodFormPage) return

    if (isCreateFoodPage) {
      setFormFood(null)
      setFormName("")
      setFormProvinceId("")
      setFormIslandId("")
      setFormDescription("")
      setFormIngredients("")
      setFormVideoUrl("")
      setFormVideoCopyright("")
      setFormImage(null)
      setFormError(null)
      return
    }

    const controller = new AbortController()
    async function loadFoodForEdit() {
      setFormLoading(true)
      setFormError(null)
      try {
        const response = await fetch(getApiUrl(`${FOOD_ENDPOINT}/${foodId}`), {
          signal: controller.signal,
          headers: {
            Accept: "application/json",
            "ngrok-skip-browser-warning": "true",
          },
        })
        if (!response.ok) {
          throw new Error(`Gagal memuat makanan (HTTP ${response.status}).`)
        }

        const payload: unknown = await response.json()
        const data =
          payload &&
          typeof payload === "object" &&
          "data" in payload &&
          payload.data &&
          typeof payload.data === "object" &&
          !Array.isArray(payload.data)
            ? payload.data
            : payload
        if (!data || typeof data !== "object" || Array.isArray(data)) {
          throw new Error("Format detail makanan tidak valid.")
        }

        const food = mapFood(data as Record<string, unknown>, 0)
        setFormFood(food)
        setFormName(food.name)
        setFormProvinceId(food.provinceId)
        setFormIslandId(food.islandId)
        setFormDescription(
          food.description === "Belum ada deskripsi." ? "" : food.description,
        )
        setFormIngredients(food.ingredients ?? "")
        setFormVideoUrl(food.videoUrl ?? "")
        setFormVideoCopyright(food.videoCopyright ?? "")
        setFormImage(null)
      } catch (cause) {
        if (cause instanceof Error && cause.name === "AbortError") return
        const message =
          cause instanceof Error ? cause.message : "Gagal memuat data makanan."
        console.error("Gagal mengambil detail makanan:", cause)
        setFormError(message)
      } finally {
        if (!controller.signal.aborted) setFormLoading(false)
      }
    }

    void loadFoodForEdit()
    return () => controller.abort()
  }, [foodId, isCreateFoodPage, isFoodFormPage])

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

  const filteredFoods = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("id-ID")
    return foods.filter((food) => {
      const matchingProvince = provinces.find(
        (item) => String(item.id) === String(food.provinceId),
      )
      const searchableText =
        `${food.name} ${food.province} ${food.description} ${food.ingredients ?? ""} ${food.videoCopyright ?? ""}`.toLocaleLowerCase(
          "id-ID",
        )
      return (
        (!normalizedQuery || searchableText.includes(normalizedQuery)) &&
        (!filterIslandId ||
          String(food.islandId) === String(filterIslandId) ||
          String(matchingProvince?.islandId) === String(filterIslandId)) &&
        (!filterProvinceId ||
          String(food.provinceId) === String(filterProvinceId)) &&
        (status === "Semua status" ||
          food.status.toLocaleLowerCase("id-ID") ===
            status.toLocaleLowerCase("id-ID"))
      )
    })
  }, [foods, filterIslandId, filterProvinceId, provinces, query, status])

  function notify(message: string) {
    setToast(message)
    window.setTimeout(() => setToast(""), 2800)
  }

  async function submitForm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formFood && !formImage) {
      setFormError("Gambar makanan wajib dipilih.")
      return
    }
    if (!formProvinceId) {
      setFormError("Provinsi wajib dipilih.")
      return
    }

    const formData = new FormData()
    formData.set("province_id", formProvinceId)
    formData.set("name", formName.trim())
    formData.set("description", formDescription.trim())
    formData.set("ingredients", formIngredients.trim())
    formData.set("video_url", formVideoUrl.trim())
    formData.set("video_copyright", formVideoCopyright.trim())
    if (formImage) formData.set("image", formImage)
    if (formFood) formData.set("_method", "PUT")

    const token = getAuthToken()
    setSaving(true)
    setFormError(null)
    try {
      const response = await fetch(
        getApiUrl(
          formFood ? `${FOOD_ENDPOINT}/${formFood.id}` : FOOD_ENDPOINT,
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

      const wasEditing = Boolean(formFood)
      setFormFood(null)
      await loadFoods()
      navigate("/admin/makanan")
      notify(
        wasEditing
          ? "Makanan berhasil diperbarui."
          : "Makanan berhasil ditambahkan.",
      )
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menyimpan makanan:", cause)
      setFormError(message)
    } finally {
      setSaving(false)
    }
  }

  async function deleteFood(food: TraditionalWeapon) {
    if (
      !window.confirm(
        `Apakah Anda yakin ingin menghapus makanan "${food.name}"?`,
      )
    ) {
      return
    }

    const token = getAuthToken()
    try {
      const response = await fetch(
        getApiUrl(`${FOOD_ENDPOINT}/${food.id}`),
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
      setFoods((current) =>
        current.filter((item) => String(item.id) !== String(food.id)),
      )
      notify(`Makanan "${food.name}" berhasil dihapus.`)
    } catch (cause) {
      const message =
        cause instanceof Error ? cause.message : "Kesalahan tidak diketahui."
      console.error("Gagal menghapus makanan:", cause)
      notify(`Gagal menghapus makanan: ${message}`)
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem="Makanan"
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onSelect={(label) => {
          if (label === "Dashboard") navigate("/dashboard")
          else if (label === "Tarian") navigate("/admin/tarian")
          else if (label === "Lagu Daerah") navigate("/admin/musik")
          else if (label === "Alat Musik") navigate("/admin/alat-musik")
          else if (label === "Senjata Tradisional") navigate("/admin/senjata")
          else if (label === "Makanan") navigate("/admin/makanan")
          else if (label === "Rumah Adat") navigate("/admin/rumah-adat")
        }}
      />

      <main className={styles.main}>
        <AdminTopbar
          title={
            isFoodFormPage
              ? foodId
                ? "Edit Makanan"
                : "Tambah Makanan"
              : "Makanan Nusantara"
          }
          search={query}
          searchPlaceholder="Cari makanan, bahan, atau daerah..."
          onSearchChange={setQuery}
          onOpenMenu={() => setSidebarOpen(true)}
        />
        {isFoodFormPage ? (
          <section className="content create-song-page">
            <div className="page-heading">
              <div>
                <p>Koleksi Budaya / Pengelolaan Konten</p>
                <h2>{foodId ? "Edit Makanan" : "Tambah Makanan"}</h2>
                <span>
                  {foodId
                    ? "Perbarui informasi makanan di koleksi Nusantara."
                    : "Lengkapi informasi makanan untuk menambahkannya ke koleksi."}
                </span>
              </div>
            </div>

            {formLoading ? (
              <section className="empty-state" role="status">
                Memuat data makanan...
              </section>
            ) : formError && foodId && !formFood ? (
              <section className="empty-state" role="alert">
                <h3>Data makanan tidak dapat dimuat</h3>
                <p>{formError}</p>
                <button
                  type="button"
                  className="add-button"
                  onClick={() => navigate("/admin/makanan")}
                >
                  Kembali ke daftar makanan
                </button>
              </section>
            ) : (
              <form className="modal create-song-form" onSubmit={submitForm}>
                <div className="modal-heading">
                  <div>
                    <p>Koleksi Budaya</p>
                    <h3>
                      {formFood
                        ? "Perbarui Informasi Makanan"
                        : "Informasi Makanan"}
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/makanan")}
                    aria-label="Kembali ke daftar makanan"
                    disabled={saving}
                  >
                    <AdminIcon name="close" />
                  </button>
                </div>

                {formError && (
                  <p className="create-song-error" role="alert">
                    {formError}
                  </p>
                )}

                <label>
                  Pulau asal
                  <select
                    value={formIslandId}
                    onChange={(event) => {
                      setFormIslandId(event.target.value)
                      setFormProvinceId("")
                    }}
                    required
                    disabled={islandsLoading || Boolean(islandsError) || saving}
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
                    <span className="create-song-error" role="alert">
                      Gagal memuat pulau: {islandsError}
                    </span>
                  )}
                </label>

                <label>
                  Provinsi asal
                  <select
                    value={formProvinceId}
                    onChange={(event) => setFormProvinceId(event.target.value)}
                    required
                    disabled={
                      !formIslandId ||
                      Boolean(provincesError) ||
                      saving
                    }
                  >
                    <option value="">
                      {!formIslandId
                        ? "Pilih pulau terlebih dahulu"
                        : provincesError
                          ? "Provinsi gagal dimuat"
                          : "Pilih provinsi"}
                    </option>
                    {provinces
                      .filter(
                        (province) =>
                          String(province.islandId) === String(formIslandId),
                      )
                      .map((province) => (
                        <option key={province.id} value={province.id}>
                          {province.name}
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
                  Nama makanan
                  <input
                    autoFocus
                    value={formName}
                    onChange={(event) => setFormName(event.target.value)}
                    placeholder="Contoh: Ayam betutu"
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Deskripsi
                  <textarea
                    value={formDescription}
                    onChange={(event) => setFormDescription(event.target.value)}
                    placeholder="Ceritakan asal-usul dan keunikan makanan..."
                    rows={4}
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Bahan
                  <textarea
                    value={formIngredients}
                    onChange={(event) => setFormIngredients(event.target.value)}
                    placeholder="Tuliskan bahan-bahan makanan..."
                    rows={5}
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  URL video resep
                  <input
                    type="url"
                    value={formVideoUrl}
                    onChange={(event) => setFormVideoUrl(event.target.value)}
                    placeholder="https://youtu.be/..."
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Hak cipta video
                  <input
                    value={formVideoCopyright}
                    onChange={(event) =>
                      setFormVideoCopyright(event.target.value)
                    }
                    placeholder="Nama pemilik/kreator video"
                    required
                    disabled={saving}
                  />
                </label>

                <label>
                  Gambar makanan {formFood ? "(opsional)" : ""}
                  <input
                    accept="image/*"
                    type="file"
                    required={!formFood}
                    onChange={(event) =>
                      setFormImage(event.target.files?.[0] ?? null)
                    }
                    disabled={saving}
                  />
                  {formImage && <span>{formImage.name}</span>}
                </label>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => navigate("/admin/makanan")}
                    disabled={saving}
                  >
                    Batal
                  </button>
                  <button className="save" type="submit" disabled={saving}>
                    {saving
                      ? "Menyimpan..."
                      : formFood
                        ? "Simpan perubahan"
                        : "Simpan makanan"}
                  </button>
                </div>
              </form>
            )}
          </section>
        ) : (
          <SenjataView
            contentTitle="Makanan Nusantara"
            itemLabel="makanan"
            endpointLabel={FOOD_ENDPOINT}
            showIngredients={false}
            weapons={filteredFoods}
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
            onAdd={() => navigate("/admin/makanan/tambah")}
            onPreview={setPreviewFood}
            onEdit={(food) => navigate(`/admin/makanan/${food.id}/edit`)}
            onDelete={(food) => void deleteFood(food)}
          />
        )}
        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data Makanan Nusantara</span>
        </footer>

        {!isFoodFormPage && previewFood && (
          <div
            className="modal-backdrop"
            onMouseDown={() => setPreviewFood(null)}
          >
            <div
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="food-preview-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="modal-heading">
                <div>
                  <p>{previewFood.province} · Makanan</p>
                  <h3 id="food-preview-title">{previewFood.name}</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewFood(null)}
                  aria-label="Tutup pratinjau"
                >
                  <AdminIcon name="close" />
                </button>
              </div>
              {previewFood.image && (
                <div className="house-preview-image">
                  <WeaponImage
                    src={previewFood.image}
                    alt={previewFood.name}
                  />
                </div>
              )}
              <p className="house-preview-description">
                {previewFood.description || "Deskripsi belum tersedia."}
              </p>
              {previewFood.ingredients && (
                <p className="house-preview-description">
                  <b>Bahan:</b> {previewFood.ingredients}
                </p>
              )}
              <section className="food-preview-video">
                <h4>Video resep</h4>
                {previewFood.videoUrl ? (
                  <>
                    {getYoutubeEmbedUrl(previewFood.videoUrl) && (
                      <iframe
                        src={getYoutubeEmbedUrl(previewFood.videoUrl)}
                        title={`Video resep ${previewFood.name}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        referrerPolicy="strict-origin-when-cross-origin"
                        allowFullScreen
                      />
                    )}
                    <a
                      href={previewFood.videoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Buka video resep
                    </a>
                    {previewFood.videoCopyright && (
                      <span> · {previewFood.videoCopyright}</span>
                    )}
                  </>
                ) : (
                  <p>Link video belum tersedia.</p>
                )}
              </section>
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
