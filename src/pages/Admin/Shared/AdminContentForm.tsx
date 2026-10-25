import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type DragEvent,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react"
import { useLocation, useNavigate, useParams, Link } from "react-router-dom"
import {
  ArrowLeft,
  ArrowUpRight,
  Bold,
  Check,
  ChevronDown,
  CircleAlert,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  MapPin,
  Quote,
  Redo2,
  Underline,
  Undo2,
  Upload,
  X,
} from "lucide-react"
import AdminShell from "../../../admin/AdminShell"
import { categoryConfigs, provinces, regions } from "../../../admin/categoryConfig"
import {
  createContent,
  getContentBySlug,
  getContents,
  slugify,
  updateContent,
} from "../../../admin/contentRepository"
import {
  categoryDetailFields,
  categoryIntro,
  provinceAbbreviations,
  type DetailFieldConfig,
} from "../../../admin/formConfig"
import type {
  CategoryDetailValues,
  CategoryKey,
  ContentFormData,
  ContentFormDraft,
  ContentItem,
  SavedMedia,
} from "../../../admin/types"
import { ContentCard } from "./AdminCategoryPage"
import styles from "./AdminContentForm.module.css"

const maxImageBytes = 10 * 1024 * 1024
const maxAudioBytes = 25 * 1024 * 1024
const cultureCategoryOrder: CategoryKey[] = [
  "lagu-daerah",
  "tarian",
  "alat-musik",
  "senjata-tradisional",
  "pakaian-adat",
  "rumah-adat",
  "makanan",
]

type FormErrors = Record<string, string>
type ToastData = {
  title: string
  body: string
}
type LinkedStory = {
  category: CategoryKey
  title: string
  count: number
}
type ToastProps = {
  data: ToastData
  onClose: () => void
}
type MapPinData = {
  name: string
  x: number
  y: number
}
type LocationState = { formToast?: ToastData } | null
type FieldMeta = {
  id: string
  "aria-invalid"?: boolean
  "aria-describedby"?: string
}

function defaultDetails(category: CategoryKey): CategoryDetailValues {
  return Object.fromEntries(
    categoryDetailFields[category].map((item) => [
      item.name,
      item.type === "chips" ? [] : "",
    ]),
  )
}

function sampleDetails(category: CategoryKey): CategoryDetailValues {
  const samples: Partial<Record<CategoryKey, CategoryDetailValues>> = {
    "lagu-daerah": {
      creator: "Anonim / tidak diketahui",
      language: "Aceh",
      theme: "Alam",
      lyrics:
        "Tambahkan lirik setelah status hak cipta dan sumber terverifikasi.",
      translation: "Tambahkan terjemahan setelah sumber lirik terverifikasi.",
      copyright: "",
    },
    tarian: {
      danceType: "Hiburan",
      dancerCount: "Berkelompok; jumlah menyesuaikan pertunjukan",
      duration: "Sekitar 10–15 menit, sesuai penyajian",
      costume: "Busana Gayo bersulam; tanpa properti tangan",
      accompaniment: "Tepukan dada, tepukan tangan, dan syair",
      movementMeaning:
        "Gerak yang serempak menyampaikan kebersamaan, disiplin, dan saling percaya.",
    },
    "alat-musik": {
      instrumentType: "",
      material: "Bambu, kayu, dan pengikat sesuai tradisi setempat",
      playingMethod: "Jelaskan cara memainkan dan menghasilkan bunyi.",
    },
    "senjata-tradisional": {
      weaponType: "Pusaka upacara",
      material: "Besi, baja, dan bahan pembentuk pamor",
      craft: "Tempa lipat",
      maker: "Empu atau komunitas perajin",
      symbolicMeaning:
        "Pusaka keluarga, perlengkapan upacara, dan lambang identitas.",
      preservation: "Terjaga",
    },
    "pakaian-adat": {
      garmentType: "Atasan",
      wearer: "Perempuan",
      fabric: "Kain tenun; teknik menyesuaikan daerah",
      colors: "Warna cerah dan motif tenun setempat",
      occasion: "Pernikahan, upacara adat, dan pertunjukan budaya",
      meaning: "Jelaskan identitas, makna, dan kelengkapan busana.",
    },
    "rumah-adat": {
      roofShape: "Atap khas daerah setempat",
      buildingMaterial: "Kayu, bambu, dan ijuk; bahan menyesuaikan daerah",
      structure: "Rumah panggung",
      rooms:
        "Jelaskan bagian rumah serta fungsi ruang keluarga dan ruang bersama.",
      philosophy: "Jelaskan hubungan bentuk rumah dengan alam dan adat.",
      occupant: "Keluarga besar atau komunitas setempat",
    },
    makanan: {
      foodType: "Hidangan utama",
      ingredients: ["Daging sapi", "Santan", "Cabai", "Rempah"],
      cookingMethod: "Dimasak lama",
      taste: ["Gurih", "Pedas"],
      servingTime: "Jamuan keluarga, hari raya, dan upacara adat",
      steps:
        "Haluskan cabai, bawang, dan bumbu rempah.\nMasak santan bersama bumbu hingga harum.\nMasukkan daging dan aduk perlahan.\nMasak hingga bumbu meresap.",
    },
  }
  return { ...defaultDetails(category), ...samples[category] }
}

function toDraft(category: CategoryKey, item?: ContentItem): ContentFormDraft {
  const config = categoryConfigs[category]
  const seed = config.seeds[0]
  const provinceSeed = config.kind === "province"
  const sourceItem = item
  const blankProvinceForm = provinceSeed && !sourceItem
  const saved = sourceItem?.formData
  const title = sourceItem?.title ?? (provinceSeed ? "" : (seed?.title ?? ""))
  const province =
    sourceItem?.kind === "content"
      ? sourceItem.province
      : provinceSeed
        ? ""
        : (seed?.province ?? "")
  const selectedRegion =
    sourceItem?.region ??
    (provinceSeed ? regions[0] : (seed?.region ?? regions[0]))
  const capital =
    sourceItem?.kind === "province"
      ? sourceItem.capital
      : provinceSeed
        ? ""
        : (seed?.capital ?? "")
  const savedDetails = saved?.details ?? sampleDetails(category)
  return {
    title,
    slug: sourceItem?.slug ?? slugify(title),
    region: selectedRegion,
    province: provinceSeed ? title : province,
    capital,
    shortDescription:
      sourceItem?.description ??
      (provinceSeed ? "" : (seed?.description ?? "")),
    status: sourceItem?.status ?? "Draf",
    scheduleDate: saved?.publishDate ?? "2026-10-10",
    scheduleTime: saved?.publishTime ?? "14:00",
    photoCredit: saved?.photoCredit ?? "",
    coverUrl: saved?.coverUrl ?? "",
    coverFileName: saved?.coverFileName ?? "",
    coverFileSize: saved?.coverFileSize ?? 0,
    gallery: saved?.gallery ?? [],
    audioUrl: saved?.audioUrl ?? "",
    audioFileName: saved?.audioFileName ?? "",
    youtubeUrl: saved?.youtubeUrl ?? "",
    fullDescription:
      saved?.fullDescription ??
      (blankProvinceForm
        ? ""
        : `${sourceItem?.description ?? seed?.description ?? "Cerita budaya yang diwariskan lintas generasi."}\n\nLengkapi konteks, sumber rujukan, dan pengetahuan komunitas agar cerita ini dapat dipahami dengan utuh.`),
    source:
      saved?.source ??
      "Sumber rujukan: Badan Pengembangan dan Pembinaan Bahasa · Verifikasi sebelum terbit.",
    tags:
      saved?.tags ??
      (provinceSeed ? [] : [province, config.title].filter(Boolean)),
    showInHome: saved?.showInHome ?? true,
    featured: saved?.featured ?? false,
    details: savedDetails,
    languages:
      saved?.languages ??
      (provinceSeed ? [] : ["Bahasa dan komunitas setempat"]),
    bannerTitle:
      saved?.bannerTitle ??
      (provinceSeed ? "" : "Flores: tenun, kampung, dan ingatan leluhur"),
    bannerParagraph:
      saved?.bannerParagraph ??
      (provinceSeed
        ? ""
        : "Temui jejak tenun dan tradisi kampung yang hidup dari generasi ke generasi."),
    bannerImageUrl: saved?.bannerImageUrl ?? "",
    summaryTitle:
      saved?.summaryTitle ?? (provinceSeed ? "" : "Tenun Ikat Flores"),
    summaryDescription:
      saved?.summaryDescription ??
      (provinceSeed
        ? ""
        : "Motif, warna, dan ingatan yang dirawat melalui keterampilan menenun di Flores."),
    summaryTags: saved?.summaryTags ?? [],
    latitude: saved?.latitude ?? (provinceSeed ? -0.5 : -10.1772),
    longitude: saved?.longitude ?? (provinceSeed ? 102 : 123.607),
    showOnMap: saved?.showOnMap ?? true,
    highlight: saved?.highlight ?? false,
  }
}

function toSavedFormData(draft: ContentFormDraft): ContentFormData {
  return {
    fullDescription: draft.fullDescription,
    source: draft.source,
    photoCredit: draft.photoCredit,
    coverUrl: draft.coverUrl,
    coverFileName: draft.coverFileName,
    coverFileSize: draft.coverFileSize,
    gallery: [...draft.gallery],
    tags: [...draft.tags],
    showInHome: draft.showInHome,
    featured: draft.featured,
    details: { ...draft.details },
    audioUrl: draft.audioUrl,
    audioFileName: draft.audioFileName,
    youtubeUrl: draft.youtubeUrl,
    publishDate: draft.scheduleDate,
    publishTime: draft.scheduleTime,
    languages: [...draft.languages],
    bannerTitle: draft.bannerTitle,
    bannerParagraph: draft.bannerParagraph,
    bannerImageUrl: draft.bannerImageUrl,
    summaryTitle: draft.summaryTitle,
    summaryDescription: draft.summaryDescription,
    summaryTags: [...draft.summaryTags],
    latitude: draft.latitude,
    longitude: draft.longitude,
    showOnMap: draft.showOnMap,
    highlight: draft.highlight,
  }
}

export default function AdminContentForm({
  category,
  mode,
}: {
  category: CategoryKey
  mode: "create" | "edit"
}) {
  const { slug } = useParams()
  return (
    <FormPage
      key={`${category}-${mode}-${slug ?? "new"}`}
      category={category}
      slug={slug}
      mode={mode}
    />
  )
}

function FormPage({
  category,
  slug,
  mode,
}: {
  category: CategoryKey
  slug?: string
  mode: "create" | "edit"
}) {
  const config = categoryConfigs[category]
  const isProvince = category === "daerah-provinsi"
  const existing =
    mode === "edit" && slug ? getContentBySlug(category, slug) : undefined
  const location = useLocation()
  const navigate = useNavigate()
  const initial = useMemo(
    () => toDraft(category, existing),
    [category, existing],
  )
  const [values, setValues] = useState<ContentFormDraft>(initial)
  const [baseline, setBaseline] = useState<ContentFormDraft>(initial)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSaving, setIsSaving] = useState(false)
  const [toast, setToast] = useState<ToastData | null>(
    (location.state as LocationState)?.formToast ?? null,
  )
  const [confirmLeave, setConfirmLeave] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState("")
  const [galleryError, setGalleryError] = useState("")
  const [audioError, setAudioError] = useState("")
  const [publishAttempted, setPublishAttempted] = useState(false)
  const changed = JSON.stringify(values) !== JSON.stringify(baseline)
  const isNew = mode === "create"
  const title = isProvince
    ? `${isNew ? "Tambah" : "Edit"} Daerah`
    : `${isNew ? "Tambah" : "Edit"} Konten`
  const intro = categoryIntro[category]
  const provinceOptions = provinces.filter(
    (item) => item.region === values.region,
  )
  const storyBreakdown = useMemo(() => {
    const contents = cultureCategoryOrder.map((key) => ({
      category: key,
      title: categoryConfigs[key].title,
      count: isNew
        ? 0
        : getContents(key).filter(
            (item) => item.kind === "content" && item.province === values.title,
          ).length,
    }))
    return contents
  }, [isNew, values.title])
  const linkedStoryCount = storyBreakdown.reduce(
    (total, row) => total + row.count,
    0,
  )
  const provinceShort = provinceAbbreviations[values.title] ?? values.title

  useEffect(() => {
    if (!toast) return
    const timer = window.setTimeout(() => setToast(null), 5000)
    return () => window.clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!changed) return
    const beforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    const onDocumentClick = (event: MouseEvent) => {
      const target = event.target
      if (!(target instanceof Element)) return
      const anchor = target.closest<HTMLAnchorElement>("a[href]")
      if (!anchor || anchor.target || anchor.hasAttribute("download")) return
      const destination = new URL(anchor.href, window.location.href)
      if (
        destination.origin !== window.location.origin ||
        destination.href === window.location.href
      )
        return
      event.preventDefault()
      event.stopImmediatePropagation()
      setConfirmLeave(
        `${destination.pathname}${destination.search}${destination.hash}`,
      )
    }
    window.addEventListener("beforeunload", beforeUnload)
    document.addEventListener("click", onDocumentClick, true)
    return () => {
      window.removeEventListener("beforeunload", beforeUnload)
      document.removeEventListener("click", onDocumentClick, true)
    }
  }, [changed])

  const setValue = useCallback(
    <K extends keyof ContentFormDraft>(key: K, value: ContentFormDraft[K]) => {
      setValues((current) => ({ ...current, [key]: value }))
      setErrors((current) => {
        if (!current[String(key)]) return current
        const next = { ...current }
        delete next[String(key)]
        return next
      })
    },
    [],
  )

  const updateDetails = (name: string, value: string | string[]) => {
    setValues((current) => ({
      ...current,
      details: { ...current.details, [name]: value },
    }))
    setErrors((current) => {
      if (!current[name]) return current
      const next = { ...current }
      delete next[name]
      return next
    })
  }

  useEffect(() => {
    if (isNew) setValue("slug", slugify(values.title))
  }, [isNew, values.title, setValue])

  const selectProvince = (name: string) => {
    const selected = provinces.find((item) => item.name === name)
    if (!selected) return
    setValues((current) => ({
      ...current,
      province: name,
      region: selected.region,
    }))
    setErrors((current) => {
      const next = { ...current }
      delete next.province
      delete next.region
      return next
    })
  }

  const onRegionChange = (region: string) => {
    setValues((current) => {
      const provinceStillMatches = provinces.some(
        (item) => item.name === current.province && item.region === region,
      )
      const firstProvince = provinces.find((item) => item.region === region)
      return {
        ...current,
        region,
        province: provinceStillMatches
          ? current.province
          : (firstProvince?.name ?? ""),
      }
    })
    setErrors((current) => {
      const next = { ...current }
      delete next.region
      delete next.province
      return next
    })
  }

  const acceptCover = (file: File | undefined, provinceBanner = false) => {
    if (!file) return
    if (!file.type.match(/^image\/(jpeg|png)$/)) {
      setPhotoError("Pilih foto dengan format JPG atau PNG.")
      return
    }
    if (file.size > maxImageBytes) {
      setPhotoError("Ukuran foto maksimal 10 MB.")
      return
    }
    setPhotoError("")
    const url = URL.createObjectURL(file)
    if (provinceBanner) {
      if (values.bannerImageUrl.startsWith("blob:"))
        URL.revokeObjectURL(values.bannerImageUrl)
      setValue("bannerImageUrl", url)
      setValue("coverFileName", file.name)
      setValue("coverFileSize", file.size)
    } else {
      if (values.coverUrl.startsWith("blob:"))
        URL.revokeObjectURL(values.coverUrl)
      setValue("coverUrl", url)
      setValue("coverFileName", file.name)
      setValue("coverFileSize", file.size)
      setErrors((current) => {
        const next = { ...current }
        delete next.coverUrl
        return next
      })
    }
  }

  const onGalleryFiles = (files: FileList | null) => {
    if (!files?.length) return
    const accepted: SavedMedia[] = []
    for (const file of Array.from(files)) {
      if (!file.type.match(/^image\/(jpeg|png)$/)) {
        setGalleryError("Galeri hanya menerima foto JPG atau PNG.")
        continue
      }
      if (file.size > maxImageBytes) {
        setGalleryError("Setiap foto galeri maksimal 10 MB.")
        continue
      }
      accepted.push({
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      })
    }
    const available = 10 - values.gallery.length
    if (accepted.length > available) {
      accepted.slice(available).forEach((item) => URL.revokeObjectURL(item.url))
      accepted.splice(available)
      setGalleryError("Galeri dapat memuat maksimal 10 foto.")
    } else if (accepted.length) setGalleryError("")
    if (accepted.length) setValue("gallery", [...values.gallery, ...accepted])
  }

  const onAudioFile = (file: File | undefined) => {
    if (!file) return
    if (!file.type.match(/^audio\/(mpeg|wav|x-wav)$/)) {
      setAudioError("Pilih audio dengan format MP3 atau WAV.")
      return
    }
    if (file.size > maxAudioBytes) {
      setAudioError("Ukuran audio maksimal 25 MB.")
      return
    }
    setAudioError("")
    if (values.audioUrl.startsWith("blob:"))
      URL.revokeObjectURL(values.audioUrl)
    setValue("audioUrl", URL.createObjectURL(file))
    setValue("audioFileName", file.name)
  }

  const validate = (publishing: boolean): FormErrors => {
    const next: FormErrors = {}
    if (!values.title.trim())
      next.title = isProvince
        ? "Nama provinsi wajib diisi."
        : "Judul konten wajib diisi."
    if (!values.region) next.region = "Wilayah wajib dipilih."
    if (!isProvince && !values.province)
      next.province = "Provinsi wajib dipilih."
    if (!values.shortDescription.trim())
      next.shortDescription = "Deskripsi singkat wajib diisi."
    if (values.shortDescription.length > 160)
      next.shortDescription = "Deskripsi singkat maksimal 160 karakter."
    if (!values.fullDescription.trim())
      next.fullDescription = "Deskripsi lengkap wajib diisi."
    if (publishing && !isProvince && !values.coverUrl)
      next.coverUrl = "Foto cover wajib ditambahkan sebelum konten diterbitkan."
    if (publishing && !isProvince && !values.photoCredit.trim())
      next.photoCredit = "Kredit foto wajib diisi sebelum konten diterbitkan."
    if (publishing && isProvince) {
      if (!values.bannerTitle.trim())
        next.bannerTitle =
          "Judul banner wajib diisi sebelum daerah diterbitkan."
      if (values.latitude < -11 || values.latitude > 6)
        next.latitude = "Latitude harus berada di antara −11 dan 6."
      if (values.longitude < 95 || values.longitude > 141)
        next.longitude = "Longitude harus berada di antara 95 dan 141."
    }
    if (
      category === "lagu-daerah" &&
      values.details.copyright === "Berhak cipta, tautkan sumber" &&
      String(values.details.lyrics ?? "").trim()
    ) {
      next.lyrics =
        "Untuk lagu berhak cipta, hapus lirik penuh dan tautkan sumber resminya."
    }
    if (
      category === "lagu-daerah" &&
      values.youtubeUrl &&
      !isYouTubeUrl(values.youtubeUrl)
    ) {
      next.youtubeUrl = "Masukkan tautan YouTube yang valid."
    }
    return next
  }

  const submit = (publishing: boolean) => {
    if (isSaving) return
    setPublishAttempted(publishing)
    const nextErrors = publishing
      ? validate(true)
      : !values.title.trim()
        ? { title: "Judul konten wajib diisi." }
        : {}
    setErrors(nextErrors)
    if (Object.keys(nextErrors).length) {
      window.requestAnimationFrame(() => {
        document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      })
      return
    }
    setIsSaving(true)
    const draft: ContentFormDraft = {
      ...values,
      status: publishing ? "Terbit" : "Draf",
    }
    window.setTimeout(() => {
      const saved =
        mode === "create"
          ? createContent(category, draft)
          : slug
            ? updateContent(category, slug, draft)
            : undefined
      setIsSaving(false)
      if (!saved) return
      const savedDraft = { ...draft, slug: saved.slug }
      setValues(savedDraft)
      setBaseline(savedDraft)
      const toastData = {
        title:
          mode === "create"
            ? "Konten berhasil ditambahkan"
            : "Perubahan berhasil disimpan",
        body: `${saved.title} tersimpan dalam koleksi ${config.title}.`,
      }
      if (mode === "create") {
        navigate(`/admin/${category}/${saved.slug}/edit`, {
          state: { formToast: toastData },
        })
      } else setToast(toastData)
    }, 180)
  }

  const cancel = () => {
    const destination = `/admin/${category}`
    if (changed) setConfirmLeave(destination)
    else navigate(destination)
  }

  if (mode === "edit" && !existing) {
    return (
      <AdminShell title={config.title}>
        <NotFoundState
          title="Konten tidak ditemukan"
          backTo={`/admin/${category}`}
        />
      </AdminShell>
    )
  }

  const previewItem = makePreviewItem(category, values)
  const subtitle = isNew
    ? intro
    : `Perbarui informasi ${values.title || config.singular} dan simpan perubahan ke koleksi ${config.title}.`
  const label = isProvince
    ? `Daerah & Provinsi / ${isNew ? "Tambah" : "Edit"} Daerah`
    : `Koleksi Budaya / Tambah & Edit Konten`

  return (
    <AdminShell title={config.title}>
      <div className={styles.formPage}>
        <div className={styles.breadcrumb}>
          <Link to={`/admin/${category}`}>
            <ArrowLeft size={14} /> {config.title}
          </Link>
          <span>/</span>
          <span>
            {isProvince
              ? `${isNew ? "Tambah" : "Edit"} daerah`
              : `${isNew ? "Tambah" : "Edit"} konten`}
          </span>
        </div>
        <header className={styles.pageHeader}>
          <div>
            <span className={styles.eyebrow}>{label}</span>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <Link
            className={styles.previewLink}
            to={config.previewPath}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight size={15} />
            Lihat pratinjau
          </Link>
        </header>

        <div className={styles.formLayout}>
          <aside className={styles.sideColumn}>
            <PublishPanel
              values={values}
              setValue={setValue}
              isSaving={isSaving}
              isProvince={isProvince}
              onSaveDraft={() => submit(false)}
              onPublish={() => submit(true)}
              onCancel={cancel}
            />
            <ThumbnailPreview
              category={category}
              values={values}
              item={previewItem}
              linkedStoryCount={linkedStoryCount}
              provinceShort={provinceShort}
            />
          </aside>

          <div className={styles.formColumn}>
            {isProvince ? (
              <ProvinceFormSections
                values={values}
                errors={errors}
                setValue={setValue}
                onRegionChange={onRegionChange}
                onCover={acceptCover}
                storyBreakdown={storyBreakdown}
                linkedStoryCount={linkedStoryCount}
                provinceShort={provinceShort}
                updateDetails={updateDetails}
              />
            ) : (
              <CultureFormSections
                category={category}
                values={values}
                errors={errors}
                provinceOptions={provinceOptions}
                setValue={setValue}
                updateDetails={updateDetails}
                onRegionChange={onRegionChange}
                onProvinceSelect={selectProvince}
                isNew={isNew}
                onCover={acceptCover}
                onGallery={onGalleryFiles}
                onAudio={onAudioFile}
                photoError={photoError}
                galleryError={galleryError}
                audioError={audioError}
                setPhotoCreditError={(message) =>
                  setErrors((current) => ({ ...current, photoCredit: message }))
                }
              />
            )}
          </div>
        </div>

        <footer className={styles.footer}>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data ilustratif · 10 Oktober 2026</span>
        </footer>
      </div>
      {toast && <Toast data={toast} onClose={() => setToast(null)} />}
      {confirmLeave && (
        <ConfirmLeaveDialog
          onStay={() => setConfirmLeave(null)}
          onLeave={() => {
            const destination = confirmLeave
            setConfirmLeave(null)
            navigate(destination)
          }}
        />
      )}
      {publishAttempted && Object.keys(errors).length > 0 && (
        <span className={styles.srOnly} role="status">
          Periksa kembali isian yang ditandai sebelum menerbitkan.
        </span>
      )}
    </AdminShell>
  )
}

function isYouTubeUrl(value: string) {
  try {
    const url = new URL(value)
    return (
      [
        "youtube.com",
        "www.youtube.com",
        "m.youtube.com",
        "youtu.be",
        "www.youtu.be",
      ].includes(url.hostname) &&
      (url.hostname.endsWith("youtu.be") ||
        url.pathname === "/watch" ||
        url.pathname.startsWith("/embed/"))
    )
  } catch {
    return false
  }
}

function makePreviewItem(
  category: CategoryKey,
  values: ContentFormDraft,
): ContentItem {
  const config = categoryConfigs[category]
  const common = {
    id: `preview-${category}`,
    slug: values.slug || slugify(values.title),
    title: values.title || config.seeds[0]?.title || config.title,
    region: values.region,
    description: values.shortDescription,
    status: values.status,
    updatedAt: new Date().toISOString().slice(0, 10),
    dummy: false,
    formData: toSavedFormData(values),
  }
  if (config.kind === "province")
    return {
      ...common,
      kind: "province",
      capital: values.capital,
      storyCount: 0,
    }
  return { ...common, kind: "content", province: values.province }
}

function NotFoundState({
  title,
  backTo = "/dashboard",
}: {
  title: string
  backTo?: string
}) {
  return (
    <section className={styles.notFound}>
      <CircleAlert size={28} />
      <h1>{title}</h1>
      <p>Data yang diminta tidak tersedia di koleksi simulasi ini.</p>
      <Link to={backTo}>
        <ArrowLeft size={15} />
        Kembali ke daftar
      </Link>
    </section>
  )
}

function FormSection({
  title,
  subtitle,
  children,
}: {
  title: string
  subtitle: string
  children: ReactNode
}) {
  return (
    <section className={styles.section}>
      <header className={styles.sectionHeader}>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </header>
      {children}
    </section>
  )
}

function Field({
  name,
  label,
  required,
  helper,
  error,
  children,
}: {
  name: string
  label: string
  required?: boolean
  helper?: string
  error?: string
  children: (meta: FieldMeta) => ReactNode
}) {
  const id = `field-${name.replace(/[^a-zA-Z0-9_-]/g, "-")}`
  const descriptions = [
    helper ? `${id}-helper` : "",
    error ? `${id}-error` : "",
  ].filter(Boolean)
  const meta: FieldMeta = {
    id,
    ...(error ? { "aria-invalid": true } : {}),
    ...(descriptions.length
      ? { "aria-describedby": descriptions.join(" ") }
      : {}),
  }
  return (
    <div className={styles.field}>
      <label htmlFor={id}>
        {label}
        {required && <b> *</b>}
      </label>
      {children(meta)}
      {helper && (
        <small id={`${id}-helper`} className={styles.helper}>
          {helper}
        </small>
      )}
      {error && (
        <small id={`${id}-error`} className={styles.error}>
          {error}
        </small>
      )}
    </div>
  )
}

type SetDraftValue = <K extends keyof ContentFormDraft,>(
  key: K,
  value: ContentFormDraft[K],
) => void

function CultureFormSections({
  category,
  values,
  errors,
  provinceOptions,
  setValue,
  updateDetails,
  onRegionChange,
  onProvinceSelect,
  isNew,
  onCover,
  onGallery,
  onAudio,
  photoError,
  galleryError,
  audioError,
  setPhotoCreditError,
}: {
  category: CategoryKey
  values: ContentFormDraft
  errors: FormErrors
  provinceOptions: typeof provinces
  setValue: SetDraftValue
  updateDetails: (name: string, value: string | string[]) => void
  onRegionChange: (region: string) => void
  onProvinceSelect: (province: string) => void
  isNew: boolean
  onCover: (file: File | undefined, provinceBanner?: boolean) => void
  onGallery: (files: FileList | null) => void
  onAudio: (file: File | undefined) => void
  photoError: string
  galleryError: string
  audioError: string
  setPhotoCreditError: (message: string) => void
}) {
  const config = categoryConfigs[category]
  return (
    <>
      <FormSection
        title="Informasi Utama"
        subtitle="Lengkapi identitas dan cerita budaya. Tanda * menandai isian wajib."
      >
        <div className={styles.twoColumns}>
          <Field name="title" label="Judul" required error={errors.title}>
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                value={values.title}
                onChange={(event) => setValue("title", event.target.value)}
                placeholder="Masukkan judul cerita"
              />
            )}
          </Field>
          <Field
            name="slug"
            label="Slug (auto)"
            helper={`budayaindonesia.id/${category}/${values.slug}`}
          >
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                value={values.slug}
                readOnly={!isNew}
              />
            )}
          </Field>
        </div>
        <Field
          name="category"
          label="Kategori"
          required
          helper="Pilihan: Lagu · Tarian · Alat Musik · Senjata Tradisional · Pakaian Adat · Rumah Adat · Makanan"
        >
          {(meta) => (
            <div className={styles.selectWrap}>
              <select
                {...meta}
                id={meta.id}
                value={category}
                disabled
                aria-label="Kategori terkunci"
              >
                <option value={category}>{config.title}</option>
              </select>
              <ChevronDown size={15} />
            </div>
          )}
        </Field>
        <div className={styles.twoColumns}>
          <Field name="region" label="Wilayah" required error={errors.region}>
            {(meta) => (
              <div className={styles.selectWrap}>
                <select
                  {...meta}
                  id={meta.id}
                  value={values.region}
                  onChange={(event) => onRegionChange(event.target.value)}
                >
                  <option value="">Pilih wilayah</option>
                  {regions.map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            )}
          </Field>
          <Field
            name="province"
            label="Provinsi"
            required
            error={errors.province}
          >
            {(meta) => (
              <div className={styles.selectWrap}>
                <select
                  {...meta}
                  id={meta.id}
                  value={values.province}
                  onChange={(event) => onProvinceSelect(event.target.value)}
                >
                  <option value="">Pilih provinsi</option>
                  {provinceOptions.map((province) => (
                    <option key={province.name}>{province.name}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            )}
          </Field>
        </div>
        <Field
          name="shortDescription"
          label="Deskripsi singkat"
          required
          error={errors.shortDescription}
        >
          {(meta) => (
            <textarea
              {...meta}
              id={meta.id}
              rows={3}
              maxLength={160}
              value={values.shortDescription}
              onChange={(event) =>
                setValue("shortDescription", event.target.value)
              }
              placeholder="Ringkas cerita ini dalam beberapa kalimat."
            />
          )}
        </Field>
        <div className={styles.characterCount}>
          {values.shortDescription.length} / 160 karakter
        </div>
        <Field
          name="fullDescription"
          label="Deskripsi lengkap"
          required
          error={errors.fullDescription}
        >
          {(meta) => (
            <RichTextField
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              invalid={meta["aria-invalid"]}
              value={values.fullDescription}
              onChange={(value) => setValue("fullDescription", value)}
              source={values.source}
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Media"
        subtitle="Gunakan dokumentasi yang jelas dan sertakan kredit pemilik foto."
      >
        <div className={styles.mediaCoverRow}>
          <Field
            name="coverUrl"
            label="Foto cover"
            required
            error={errors.coverUrl || photoError}
            helper="JPG atau PNG · maksimal 10 MB · disarankan rasio 16:9"
          >
            {(meta) => (
              <ImageDropzone
                id={meta.id}
                describedBy={meta["aria-describedby"]}
                invalid={meta["aria-invalid"]}
                url={values.coverUrl}
                name={values.coverFileName}
                size={values.coverFileSize}
                label="Tarik & lepaskan foto cover"
                buttonLabel={values.coverUrl ? "Ganti foto" : "Pilih foto"}
                onSelect={(file) => onCover(file)}
              />
            )}
          </Field>
        </div>
        <div className={styles.subsectionHeading}>
          <b>Galeri foto</b>
          <span>{values.gallery.length} foto · maksimal 10 foto</span>
        </div>
        <GalleryField
          items={values.gallery}
          error={galleryError}
          onChoose={onGallery}
          onRemove={(id) => {
            const item = values.gallery.find((media) => media.id === id)
            if (item?.url.startsWith("blob:")) URL.revokeObjectURL(item.url)
            setValue(
              "gallery",
              values.gallery.filter((media) => media.id !== id),
            )
          }}
        />
        <Field
          name="photoCredit"
          label="Kredit foto"
          required
          error={errors.photoCredit}
          helper="Sebutkan pemilik atau sumber dokumentasi foto."
        >
          {(meta) => (
            <input
              {...meta}
              id={meta.id}
              value={values.photoCredit}
              onChange={(event) => {
                setValue("photoCredit", event.target.value)
                setPhotoCreditError("")
              }}
              placeholder="Contoh: Dokumentasi komunitas budaya ..."
            />
          )}
        </Field>
        <AudioPanel
          enabled={category === "lagu-daerah"}
          fileName={values.audioFileName}
          audioUrl={values.audioUrl}
          youtubeUrl={values.youtubeUrl}
          onAudio={onAudio}
          onYouTubeChange={(value) => setValue("youtubeUrl", value)}
          error={audioError || errors.youtubeUrl}
        />
      </FormSection>

      <FormSection
        title="Detail khusus kategori"
        subtitle={`${config.title} · Isian menyesuaikan kategori konten yang dipilih.`}
      >
        <div className={styles.detailGrid}>
          {categoryDetailFields[category].map((field) => (
            <DetailField
              key={field.name}
              field={field}
              value={
                values.details[field.name] ?? (field.type === "chips" ? [] : "")
              }
              error={errors[field.name]}
              onChange={(value) => updateDetails(field.name, value)}
            />
          ))}
        </div>
        {category === "lagu-daerah" &&
          values.details.copyright === "Berhak cipta, tautkan sumber" &&
          String(values.details.lyrics ?? "").trim() && (
            <p className={styles.copyrightNotice}>
              <CircleAlert size={15} /> Lirik penuh tidak dapat diterbitkan
              untuk lagu berhak cipta. Hapus lirik dan sertakan tautan sumber
              resmi.
            </p>
          )}
      </FormSection>

      <FormSection
        title="Lokasi"
        subtitle="Pilih provinsi pada peta. Lokasi mengikuti asal budaya, bukan lokasi penulis."
      >
        <IndonesiaMap
          selectedProvince={values.province}
          onSelectProvince={onProvinceSelect}
        />
        <div className={styles.mapFooter}>
          <b>
            {values.province || "Provinsi belum dipilih"} ·{" "}
            {values.region || "Wilayah belum dipilih"}
          </b>
          <span>Tersinkron dengan Provinsi</span>
        </div>
      </FormSection>

      <FormSection
        title="Tag & penayangan"
        subtitle="Bantu pengunjung menemukan cerita yang saling terhubung."
      >
        <Field
          name="tags"
          label="Tag"
          helper="Tekan Enter untuk menambahkan tag baru."
        >
          {(meta) => (
            <ChipInput
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              value={values.tags}
              onChange={(tags) => setValue("tags", tags)}
              placeholder="Tambah tag..."
            />
          )}
        </Field>
        <div className={styles.switchList}>
          <ToggleRow
            title="Tampilkan di Beranda"
            helper={`Konten muncul dalam koleksi ${config.title} di halaman utama.`}
            checked={values.showInHome}
            onChange={(checked) => setValue("showInHome", checked)}
          />
          <ToggleRow
            title="Unggulan"
            helper="Tandai sebagai pilihan redaksi untuk sorotan budaya."
            checked={values.featured}
            onChange={(checked) => setValue("featured", checked)}
          />
        </div>
      </FormSection>
    </>
  )
}

function ProvinceFormSections({
  values,
  errors,
  setValue,
  onRegionChange,
  onCover,
  storyBreakdown,
  linkedStoryCount,
  provinceShort,
  updateDetails,
}: {
  values: ContentFormDraft
  errors: FormErrors
  setValue: SetDraftValue
  onRegionChange: (region: string) => void
  onCover: (file: File | undefined, provinceBanner?: boolean) => void
  storyBreakdown: LinkedStory[]
  linkedStoryCount: number
  provinceShort: string
  updateDetails: (name: string, value: string | string[]) => void
}) {
  return (
    <>
      <FormSection
        title="Informasi Daerah"
        subtitle="Lengkapi identitas provinsi dan cerita daerah. Tanda * menandai isian wajib."
      >
        <div className={styles.twoColumns}>
          <Field
            name="title"
            label="Nama provinsi"
            required
            error={errors.title}
          >
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                value={values.title}
                onChange={(event) => setValue("title", event.target.value)}
                placeholder="Nama provinsi"
              />
            )}
          </Field>
          <Field
            name="slug"
            label="Slug (auto)"
            helper="Dibuat otomatis dari nama provinsi."
          >
            {(meta) => (
              <input {...meta} id={meta.id} value={values.slug} readOnly />
            )}
          </Field>
        </div>
        <div className={styles.twoColumns}>
          <Field
            name="region"
            label="Wilayah/pulau"
            required
            error={errors.region}
            helper="Pilihan: Sumatra · Jawa · Bali & Nusa Tenggara · Kalimantan · Sulawesi · Maluku & Papua"
          >
            {(meta) => (
              <div className={styles.selectWrap}>
                <select
                  {...meta}
                  id={meta.id}
                  value={values.region}
                  onChange={(event) => onRegionChange(event.target.value)}
                >
                  {regions.map((region) => (
                    <option key={region}>{region}</option>
                  ))}
                </select>
                <ChevronDown size={15} />
              </div>
            )}
          </Field>
          <Field name="capital" label="Ibu kota">
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                value={values.capital}
                onChange={(event) => setValue("capital", event.target.value)}
                placeholder="Nama ibu kota"
              />
            )}
          </Field>
        </div>
        <Field
          name="languages"
          label="Bahasa & suku utama"
          helper="Contoh komunitas dan bahasa; bukan daftar lengkap."
        >
          {(meta) => (
            <ChipInput
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              value={values.languages}
              onChange={(items) => setValue("languages", items)}
              placeholder="Tambah bahasa atau komunitas..."
            />
          )}
        </Field>
        <Field
          name="shortDescription"
          label="Deskripsi singkat"
          required
          error={errors.shortDescription}
        >
          {(meta) => (
            <textarea
              {...meta}
              id={meta.id}
              rows={3}
              maxLength={160}
              value={values.shortDescription}
              onChange={(event) =>
                setValue("shortDescription", event.target.value)
              }
              placeholder="Ringkasan cerita daerah."
            />
          )}
        </Field>
        <div className={styles.characterCount}>
          {values.shortDescription.length} / 160 karakter
        </div>
        <Field
          name="fullDescription"
          label="Deskripsi lengkap"
          required
          error={errors.fullDescription}
        >
          {(meta) => (
            <RichTextField
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              invalid={meta["aria-invalid"]}
              value={values.fullDescription}
              onChange={(value) => setValue("fullDescription", value)}
              source={values.source}
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Sorotan Beranda"
        subtitle="Susun banner dan kartu ringkasan untuk mengenalkan daerah."
      >
        <Field
          name="bannerTitle"
          label="Judul banner"
          required
          error={errors.bannerTitle}
        >
          {(meta) => (
            <input
              {...meta}
              id={meta.id}
              value={values.bannerTitle}
              onChange={(event) => setValue("bannerTitle", event.target.value)}
              placeholder="Judul sorotan daerah"
            />
          )}
        </Field>
        <Field name="bannerParagraph" label="Paragraf banner">
          {(meta) => (
            <textarea
              {...meta}
              id={meta.id}
              rows={3}
              value={values.bannerParagraph}
              onChange={(event) =>
                setValue("bannerParagraph", event.target.value)
              }
              placeholder="Perkenalkan cerita daerah ini."
            />
          )}
        </Field>
        <Field
          name="bannerImage"
          label="Foto banner"
          helper="JPG atau PNG · maksimal 10 MB · disarankan rasio 16:9"
        >
          {(meta) => (
            <ImageDropzone
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              invalid={meta["aria-invalid"]}
              url={values.bannerImageUrl}
              name={values.coverFileName}
              size={values.coverFileSize}
              label="Tarik & lepaskan foto banner"
              buttonLabel={
                values.bannerImageUrl ? "Ganti gambar" : "Pilih gambar"
              }
              onSelect={(file) => onCover(file, true)}
              large
            />
          )}
        </Field>
        <small className={styles.helper}>
          {values.bannerImageUrl
            ? `Kredit pemilik: ${values.photoCredit || "belum tersedia"}`
            : "Kredit pemilik foto belum tersedia."}
        </small>
        <Field
          name="buttonText"
          label="Teks tombol (otomatis · read-only)"
          helper={`Dihitung otomatis dari ${linkedStoryCount} cerita terhubung. Tidak dapat disunting.`}
        >
          {(meta) => (
            <input
              {...meta}
              id={meta.id}
              value={`Jelajahi ${linkedStoryCount} cerita dari ${provinceShort} →`}
              readOnly
            />
          )}
        </Field>
        <div className={styles.twoColumns}>
          <Field name="summaryTitle" label="Judul kartu ringkasan">
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                value={values.summaryTitle}
                onChange={(event) =>
                  setValue("summaryTitle", event.target.value)
                }
              />
            )}
          </Field>
          <Field name="summaryDescription" label="Deskripsi kartu ringkasan">
            {(meta) => (
              <textarea
                {...meta}
                id={meta.id}
                rows={2}
                value={values.summaryDescription}
                onChange={(event) =>
                  setValue("summaryDescription", event.target.value)
                }
              />
            )}
          </Field>
        </div>
        <Field name="summaryTags" label="Tag kartu">
          {(meta) => (
            <ChipInput
              id={meta.id}
              describedBy={meta["aria-describedby"]}
              value={values.summaryTags}
              onChange={(items) => setValue("summaryTags", items)}
              placeholder="Tambah tag..."
            />
          )}
        </Field>
      </FormSection>

      <FormSection
        title="Cerita Terhubung"
        subtitle={`${linkedStoryCount} cerita terhubung · ringkasan otomatis, hanya-baca.`}
      >
        <div className={styles.linkedStories}>
          {storyBreakdown.map((row) => (
            <div key={row.category}>
              <span>{row.title}</span>
              <b>{row.count} cerita</b>
            </div>
          ))}
        </div>
        <Link
          className={styles.inlineLink}
          to={`/admin/lagu-daerah?provinsi=${encodeURIComponent(values.title)}`}
        >
          Lihat semua <ArrowUpRight size={14} />
        </Link>
      </FormSection>

      <FormSection
        title="Lokasi"
        subtitle="Klik peta untuk menaruh titik provinsi."
      >
        <IndonesiaMap
          latitude={values.latitude}
          longitude={values.longitude}
          placementMode
          onCoordinateChange={(latitude, longitude) => {
            setValue("latitude", latitude)
            setValue("longitude", longitude)
          }}
        />
        <div className={styles.mapFooter}>
          <b>
            {values.title || "Provinsi"} · {values.region}
          </b>
          <span>Mode penempatan titik</span>
        </div>
        <div className={styles.twoColumns}>
          <Field name="latitude" label="Latitude" error={errors.latitude}>
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                type="number"
                step="0.0001"
                min="-11"
                max="6"
                value={values.latitude}
                onChange={(event) =>
                  setValue("latitude", Number(event.target.value))
                }
              />
            )}
          </Field>
          <Field name="longitude" label="Longitude" error={errors.longitude}>
            {(meta) => (
              <input
                {...meta}
                id={meta.id}
                type="number"
                step="0.0001"
                min="95"
                max="141"
                value={values.longitude}
                onChange={(event) =>
                  setValue("longitude", Number(event.target.value))
                }
              />
            )}
          </Field>
        </div>
        <small className={styles.helper}>
          Titik ini tampil di Jelajahi Peta beranda.
        </small>
        <div className={styles.switchList}>
          <ToggleRow
            title="Tampilkan di Peta Beranda"
            helper="Provinsi tampil sebagai titik pada peta halaman utama."
            checked={values.showOnMap}
            onChange={(checked) => setValue("showOnMap", checked)}
          />
          <ToggleRow
            title="Jadikan sorotan utama"
            helper="Tampilkan banner daerah sebagai sorotan utama."
            checked={values.highlight}
            onChange={(checked) => setValue("highlight", checked)}
          />
        </div>
      </FormSection>
    </>
  )
}

function PublishPanel({
  values,
  setValue,
  isSaving,
  isProvince,
  onSaveDraft,
  onPublish,
  onCancel,
}: {
  values: ContentFormDraft
  setValue: SetDraftValue
  isSaving: boolean
  isProvince: boolean
  onSaveDraft: () => void
  onPublish: () => void
  onCancel: () => void
}) {
  return (
    <section className={styles.publishPanel}>
      <header>
        <h2>Publikasi</h2>
        <p>Atur kapan cerita dapat dibaca pengunjung.</p>
      </header>
      <Field name="status" label="Status">
        {(meta) => (
          <div className={styles.selectWrap}>
            <select
              {...meta}
              id={meta.id}
              value={values.status}
              onChange={(event) =>
                setValue(
                  "status",
                  event.target.value as ContentFormDraft["status"],
                )
              }
            >
              <option value="Draf">Draft</option>
              <option value="Terbit">Published</option>
            </select>
            <ChevronDown size={15} />
          </div>
        )}
      </Field>
      <div className={styles.twoColumns}>
        <Field name="publishDate" label="Jadwal publish">
          {(meta) => (
            <input
              {...meta}
              id={meta.id}
              type="date"
              value={values.scheduleDate}
              onChange={(event) => setValue("scheduleDate", event.target.value)}
            />
          )}
        </Field>
        <Field name="publishTime" label="Waktu (WIB)">
          {(meta) => (
            <input
              {...meta}
              id={meta.id}
              type="time"
              value={values.scheduleTime}
              onChange={(event) => setValue("scheduleTime", event.target.value)}
            />
          )}
        </Field>
      </div>
      <small className={styles.helper}>
        Kosongkan jadwal untuk memublikasikan konten segera.
      </small>
      <div className={styles.publishActions}>
        <button
          className={styles.secondaryButton}
          type="button"
          disabled={isSaving}
          onClick={onSaveDraft}
        >
          {isSaving ? (
            <>
              <span className={styles.spinner} /> Menyimpan...
            </>
          ) : (
            "Simpan Draft"
          )}
        </button>
        <button
          className={styles.primaryButton}
          type="button"
          disabled={isSaving}
          onClick={onPublish}
        >
          {isSaving ? (
            <>
              <span className={styles.spinner} /> Menyimpan...
            </>
          ) : (
            <>
              <Check size={15} /> Publikasikan
            </>
          )}
        </button>
        <button
          className={styles.textButton}
          type="button"
          disabled={isSaving}
          onClick={onCancel}
        >
          Batal
        </button>
      </div>
      <p className={styles.publishNote}>
        Pastikan asal budaya, sumber rujukan,{" "}
        {isProvince ? "dan lokasi" : "dan kredit foto"} sudah lengkap.
      </p>
    </section>
  )
}

function ThumbnailPreview({
  category,
  values,
  item,
  linkedStoryCount,
  provinceShort,
}: {
  category: CategoryKey
  values: ContentFormDraft
  item: ContentItem
  linkedStoryCount: number
  provinceShort: string
}) {
  const isProvince = category === "daerah-provinsi"
  return (
    <section className={styles.previewPanel}>
      <h2>Pratinjau thumbnail</h2>
      {isProvince ? (
        <article className={styles.provincePreview}>
          <div className={styles.provincePreviewHead}>
            <span>{values.region || "Wilayah"}</span>
            <b>{values.title || "Nama provinsi"}</b>
          </div>
          {values.bannerImageUrl ? (
            <img
              className={styles.provincePreviewImage}
              src={values.bannerImageUrl}
              alt="Pratinjau foto banner daerah"
            />
          ) : (
            <div className={styles.provincePreviewImageFallback}>
              <ImagePlus size={25} />
              <span>Foto banner daerah</span>
            </div>
          )}
          <h3>{values.bannerTitle || "Judul sorotan daerah"}</h3>
          <p>
            {values.bannerParagraph ||
              "Paragraf pengantar daerah akan tampil di sini."}
          </p>
          <span className={styles.provincePreviewLink}>
            Jelajahi {linkedStoryCount} cerita dari {provinceShort}{" "}
            <ArrowUpRight size={13} />
          </span>
        </article>
      ) : (
        <ContentCard
          item={item}
          category={category}
          previewMode
          onDelete={() => {}}
        />
      )}
      <p className={styles.previewCaption}>
        {isProvince
          ? "Tampilan banner daerah pada halaman utama."
          : "Tampilan kartu pada koleksi budaya setelah dipublikasikan."}
      </p>
    </section>
  )
}

function Toast({ data, onClose }: ToastProps) {
  return (
    <div className={styles.toast} role="status" aria-live="polite">
      <span className={styles.toastIcon}>
        <Check size={16} />
      </span>
      <span>
        <b>{data.title}</b>
        <small>{data.body}</small>
      </span>
      <button type="button" aria-label="Tutup notifikasi" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  )
}

function ConfirmLeaveDialog({
  onStay,
  onLeave,
}: {
  onStay: () => void
  onLeave: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") onStay()
      if (event.key === "Tab" && dialogRef.current) {
        const controls = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled])",
          ),
        )
        const first = controls[0]
        const last = controls[controls.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onStay])
  return (
    <div className={styles.dialogScrim}>
      <section
        className={styles.leaveDialog}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="leave-title"
        aria-describedby="leave-copy"
        ref={dialogRef}
      >
        <span className={styles.dialogIcon}>
          <CircleAlert size={21} />
        </span>
        <h2 id="leave-title">Perubahan belum disimpan</h2>
        <p id="leave-copy">
          Kalau keluar sekarang, perubahan pada form ini akan hilang.
        </p>
        <div>
          <button
            className={styles.secondaryButton}
            type="button"
            onClick={onStay}
          >
            Lanjut mengedit
          </button>
          <button
            className={styles.primaryButton}
            type="button"
            onClick={onLeave}
          >
            Keluar tanpa menyimpan
          </button>
        </div>
      </section>
    </div>
  )
}

function ChipInput({
  id,
  describedBy,
  value,
  onChange,
  placeholder,
}: {
  id: string
  describedBy?: string
  value: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [text, setText] = useState("")
  const add = () => {
    const next = text.trim()
    if (
      !next ||
      value.some(
        (item) =>
          item.toLocaleLowerCase("id-ID") === next.toLocaleLowerCase("id-ID"),
      )
    ) {
      setText("")
      return
    }
    onChange([...value, next])
    setText("")
  }
  return (
    <div className={styles.chipEditor}>
      <div className={styles.chips}>
        {value.map((item, index) => (
          <span className={styles.chip} key={`${item}-${index}`}>
            {item}
            <button
              type="button"
              aria-label={`Hapus ${item}`}
              onClick={() =>
                onChange(value.filter((_, current) => current !== index))
              }
            >
              <X size={12} />
            </button>
          </span>
        ))}
        <input
          id={id}
          aria-describedby={describedBy}
          value={text}
          onChange={(event) => setText(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault()
              add()
            }
            if (event.key === "Backspace" && !text && value.length)
              onChange(value.slice(0, -1))
          }}
          placeholder={value.length ? "Tambah lainnya..." : placeholder}
        />
      </div>
      <button className={styles.chipAdd} type="button" onClick={add}>
        Tambah
      </button>
    </div>
  )
}

function RichTextField({
  id,
  describedBy,
  invalid,
  value,
  onChange,
  source,
}: {
  id: string
  describedBy?: string
  invalid?: boolean
  value: string
  onChange: (value: string) => void
  source: string
}) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const history = useRef<string[]>([value])
  const historyIndex = useRef(0)
  const apply = (before: string, after = before) => {
    const input = textAreaRef.current
    if (!input) return
    const start = input.selectionStart,
      end = input.selectionEnd
    const selected = value.slice(start, end) || "teks"
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`
    history.current = [
      ...history.current.slice(0, historyIndex.current + 1),
      next,
    ]
    historyIndex.current = history.current.length - 1
    onChange(next)
    requestAnimationFrame(() => {
      input.focus()
      input.setSelectionRange(
        start + before.length,
        start + before.length + selected.length,
      )
    })
  }
  const moveHistory = (direction: -1 | 1) => {
    const target = Math.min(
      history.current.length - 1,
      Math.max(0, historyIndex.current + direction),
    )
    historyIndex.current = target
    onChange(history.current[target] ?? value)
  }
  const buttons = [
    { label: "Tebal", icon: <Bold size={14} />, action: () => apply("**") },
    { label: "Miring", icon: <Italic size={14} />, action: () => apply("*") },
    {
      label: "Garis bawah",
      icon: <Underline size={14} />,
      action: () => apply("__"),
    },
    {
      label: "Daftar berpoin",
      icon: <List size={14} />,
      action: () => apply("\n• ", ""),
    },
    {
      label: "Daftar bernomor",
      icon: <ListOrdered size={14} />,
      action: () => apply("\n1. ", ""),
    },
    {
      label: "Sisipkan tautan",
      icon: <Link2 size={14} />,
      action: () => apply("[", "](https://)"),
    },
    {
      label: "Kutipan",
      icon: <Quote size={14} />,
      action: () => apply("\n> ", ""),
    },
  ]
  return (
    <div
      className={`${styles.richEditor} ${invalid ? styles.invalidControl : ""}`}
    >
      <div
        className={styles.richToolbar}
        aria-label="Peralatan pemformatan teks"
      >
        <label className={styles.srOnly} htmlFor={`${id}-format`}>
          Format paragraf
        </label>
        <select
          id={`${id}-format`}
          aria-label="Format paragraf"
          defaultValue="paragraph"
          onChange={(event) => {
            if (event.target.value === "heading") apply("## ", "")
            else apply("\n\n", "")
          }}
        >
          <option value="paragraph">Paragraf</option>
          <option value="heading">Judul bagian</option>
        </select>
        {buttons.map((button) => (
          <button
            type="button"
            key={button.label}
            aria-label={button.label}
            title={button.label}
            onClick={button.action}
          >
            {button.icon}
          </button>
        ))}
        <span className={styles.toolbarSpacer} />
        <button
          type="button"
          aria-label="Urungkan"
          title="Urungkan"
          onClick={() => moveHistory(-1)}
        >
          <Undo2 size={14} />
        </button>
        <button
          type="button"
          aria-label="Ulangi"
          title="Ulangi"
          onClick={() => moveHistory(1)}
        >
          <Redo2 size={14} />
        </button>
      </div>
      <textarea
        ref={textAreaRef}
        id={id}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        rows={7}
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
          history.current = [
            ...history.current.slice(0, historyIndex.current + 1),
            event.target.value,
          ]
          historyIndex.current = history.current.length - 1
        }}
        placeholder="Ceritakan asal, makna, dan konteks budaya."
      />
      <small>
        <span>Sumber rujukan</span>
        <input aria-label="Sumber rujukan" value={source} readOnly />
      </small>
    </div>
  )
}

function formatBytes(size: number) {
  if (!size) return ""
  return size < 1024 * 1024
    ? `${Math.max(1, Math.round(size / 1024))} KB`
    : `${(size / (1024 * 1024)).toFixed(1)} MB`
}

function ImageDropzone({
  id,
  describedBy,
  invalid,
  url,
  name,
  size,
  label,
  buttonLabel,
  onSelect,
  large = false,
}: {
  id: string
  describedBy?: string
  invalid?: boolean
  url: string
  name: string
  size: number
  label: string
  buttonLabel: string
  onSelect: (file?: File) => void
  large?: boolean
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const choose = (files: FileList | null) => onSelect(files?.[0])
  return (
    <div
      className={`${styles.dropzone} ${large ? styles.dropzoneLarge : ""} ${
        dragging ? styles.dragging : ""
      } ${invalid ? styles.invalidControl : ""}`}
      onDragOver={(event) => {
        event.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event: DragEvent<HTMLDivElement>) => {
        event.preventDefault()
        setDragging(false)
        choose(event.dataTransfer.files)
      }}
    >
      {url ? (
        <img
          src={url}
          alt="Pratinjau unggahan"
          className={styles.dropPreview}
        />
      ) : (
        <span className={styles.dropIcon}>
          <ImagePlus size={20} />
        </span>
      )}
      <span className={styles.dropCopy}>
        <b>{url ? name : label}</b>
        <small>
          {url
            ? `${formatBytes(size)} · JPG/PNG`
            : "JPG atau PNG · maksimal 10 MB · rasio 16:9"}
        </small>
      </span>
      <input
        ref={inputRef}
        id={id}
        className={styles.fileInput}
        aria-describedby={describedBy}
        aria-invalid={invalid}
        type="file"
        accept="image/jpeg,image/png"
        onChange={(event) => {
          choose(event.target.files)
          event.currentTarget.value = ""
        }}
      />
      <button
        type="button"
        className={styles.uploadButton}
        onClick={() => inputRef.current?.click()}
      >
        <Upload size={14} />
        {buttonLabel}
      </button>
    </div>
  )
}

function GalleryField({
  items,
  error,
  onChoose,
  onRemove,
}: {
  items: SavedMedia[]
  error: string
  onChoose: (files: FileList | null) => void
  onRemove: (id: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div className={styles.galleryField}>
      <div className={styles.galleryGrid}>
        {items.map((item) => (
          <figure className={styles.galleryItem} key={item.id}>
            <img src={item.url} alt={item.name} />
            <figcaption title={item.name}>{item.name}</figcaption>
            <button
              type="button"
              aria-label={`Hapus foto ${item.name}`}
              onClick={() => onRemove(item.id)}
            >
              <X size={14} />
            </button>
          </figure>
        ))}
        {items.length < 10 && (
          <button
            className={styles.galleryAdd}
            type="button"
            onClick={() => inputRef.current?.click()}
          >
            <ImagePlus size={18} />
            <span>Tambah foto</span>
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept="image/jpeg,image/png"
        multiple
        aria-label="Pilih foto galeri"
        onChange={(event: ChangeEvent<HTMLInputElement>) => {
          onChoose(event.target.files)
          event.currentTarget.value = ""
        }}
      />
      {error && <small className={styles.error}>{error}</small>}
    </div>
  )
}

function AudioPanel({
  enabled,
  fileName,
  audioUrl,
  youtubeUrl,
  onAudio,
  onYouTubeChange,
  error,
}: {
  enabled: boolean
  fileName: string
  audioUrl: string
  youtubeUrl: string
  onAudio: (file?: File) => void
  onYouTubeChange: (value: string) => void
  error: string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  return (
    <div
      className={`${styles.audioPanel} ${!enabled ? styles.audioDisabled : ""}`}
    >
      <div className={styles.audioHeader}>
        <span>
          <b>Audio / YouTube</b>
          <small>
            {enabled
              ? "Aktif untuk Lagu Daerah"
              : "Media audio kategori ini tidak diperlukan"}
          </small>
        </span>
        <i>{enabled ? "Aktif" : "Tidak berlaku"}</i>
      </div>
      <div className={styles.audioFields}>
        <div>
          <input
            ref={inputRef}
            className={styles.fileInput}
            type="file"
            accept="audio/mpeg,audio/wav"
            aria-label="Pilih berkas audio"
            disabled={!enabled}
            onChange={(event) => {
              onAudio(event.target.files?.[0])
              event.currentTarget.value = ""
            }}
          />
          <button
            type="button"
            className={styles.uploadButton}
            disabled={!enabled}
            onClick={() => inputRef.current?.click()}
          >
            <Upload size={14} />
            {fileName || "Unggah audio"}
          </button>
          <small>{audioUrl ? fileName : "MP3 atau WAV · maksimal 25 MB"}</small>
        </div>
        <span>atau</span>
        <label>
          Link YouTube
          <input
            type="url"
            value={youtubeUrl}
            disabled={!enabled}
            aria-label="Link YouTube"
            aria-invalid={Boolean(error)}
            onChange={(event) => onYouTubeChange(event.target.value)}
            placeholder="https://youtube.com/..."
          />
        </label>
      </div>
      {error && <small className={styles.error}>{error}</small>}
    </div>
  )
}

function DetailField({
  field,
  value,
  error,
  onChange,
}: {
  field: DetailFieldConfig
  value: string | string[]
  error?: string
  onChange: (value: string | string[]) => void
}) {
  return (
    <div
      className={`${styles.detailField} ${
        field.fullWidth ? styles.fullWidth : ""
      }`}
    >
      <label htmlFor={`detail-${field.name}`}>{field.label}</label>
      {field.type === "select" ? (
        <div className={styles.selectWrap}>
          <select
            id={`detail-${field.name}`}
            value={String(value)}
            aria-invalid={Boolean(error)}
            onChange={(event) => onChange(event.target.value)}
          >
            <option value="">
              {field.placeholder ??
                `Pilih ${field.label.toLocaleLowerCase("id-ID")}`}
            </option>
            {field.options?.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <ChevronDown size={15} />
        </div>
      ) : field.type === "chips" ? (
        <ChipInput
          id={`detail-${field.name}`}
          value={Array.isArray(value) ? value : []}
          onChange={onChange}
          placeholder={
            field.placeholder ??
            `Tambah ${field.label.toLocaleLowerCase("id-ID")}`
          }
        />
      ) : (
        <textarea
          id={`detail-${field.name}`}
          aria-invalid={Boolean(error)}
          rows={field.type === "textarea" || field.type === "steps" ? 4 : 2}
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          placeholder={field.placeholder}
        />
      )}
      {field.suggestions && (
        <div className={styles.suggestions}>
          {field.suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => {
                const current = Array.isArray(value) ? value : []
                if (!current.includes(suggestion))
                  onChange([...current, suggestion])
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}
      {field.helper && <small className={styles.helper}>{field.helper}</small>}
      {error && <small className={styles.error}>{error}</small>}
    </div>
  )
}

function ToggleRow({
  title,
  helper,
  checked,
  onChange,
}: {
  title: string
  helper: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className={styles.toggleRow}>
      <span>
        <b>{title}</b>
        <small>{helper}</small>
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <i aria-hidden="true" />
    </label>
  )
}

const mapPins: MapPinData[] = [
  { name: "Aceh", x: 92, y: 96 },
  { name: "Sumatera Utara", x: 145, y: 126 },
  { name: "Sumatera Barat", x: 178, y: 170 },
  { name: "Riau", x: 204, y: 122 },
  { name: "Kepulauan Riau", x: 245, y: 118 },
  { name: "Jambi", x: 226, y: 190 },
  { name: "Sumatera Selatan", x: 250, y: 235 },
  { name: "Bengkulu", x: 207, y: 237 },
  { name: "Lampung", x: 277, y: 278 },
  { name: "Kepulauan Bangka Belitung", x: 282, y: 206 },
  { name: "Banten", x: 337, y: 291 },
  { name: "DKI Jakarta", x: 359, y: 290 },
  { name: "Jawa Barat", x: 381, y: 292 },
  { name: "Jawa Tengah", x: 421, y: 298 },
  { name: "DI Yogyakarta", x: 449, y: 302 },
  { name: "Jawa Timur", x: 479, y: 299 },
  { name: "Bali", x: 525, y: 310 },
  { name: "Nusa Tenggara Barat", x: 570, y: 315 },
  { name: "Nusa Tenggara Timur", x: 624, y: 318 },
  { name: "Kalimantan Barat", x: 369, y: 164 },
  { name: "Kalimantan Tengah", x: 418, y: 202 },
  { name: "Kalimantan Selatan", x: 447, y: 247 },
  { name: "Kalimantan Timur", x: 469, y: 173 },
  { name: "Kalimantan Utara", x: 451, y: 124 },
  { name: "Sulawesi Utara", x: 559, y: 152 },
  { name: "Gorontalo", x: 539, y: 192 },
  { name: "Sulawesi Tengah", x: 526, y: 218 },
  { name: "Sulawesi Barat", x: 506, y: 250 },
  { name: "Sulawesi Selatan", x: 542, y: 273 },
  { name: "Sulawesi Tenggara", x: 570, y: 250 },
  { name: "Maluku", x: 635, y: 225 },
  { name: "Maluku Utara", x: 620, y: 169 },
  { name: "Papua Barat Daya", x: 733, y: 210 },
  { name: "Papua Barat", x: 770, y: 181 },
  { name: "Papua Tengah", x: 829, y: 203 },
  { name: "Papua Pegunungan", x: 873, y: 188 },
  { name: "Papua", x: 917, y: 212 },
  { name: "Papua Selatan", x: 895, y: 263 },
]

function IndonesiaMap({
  selectedProvince,
  onSelectProvince,
  placementMode,
  latitude,
  longitude,
  onCoordinateChange,
}: {
  selectedProvince?: string
  onSelectProvince?: (province: string) => void
  placementMode?: boolean
  latitude?: number
  longitude?: number
  onCoordinateChange?: (latitude: number, longitude: number) => void
}) {
  const active = mapPins.find((pin) => pin.name === selectedProvince)
  const point =
    placementMode && latitude !== undefined && longitude !== undefined
      ? {
          x: 80 + ((longitude - 95) / 46) * 840,
          y: 46 + ((6 - latitude) / 17) * 250,
        }
      : undefined
  const mapClick = (event: ReactMouseEvent<SVGSVGElement>) => {
    if (!placementMode || !onCoordinateChange) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 1000
    const y = ((event.clientY - rect.top) / rect.height) * 330
    onCoordinateChange(
      Number((6 - ((y - 46) / 250) * 17).toFixed(4)),
      Number((95 + ((x - 80) / 840) * 46).toFixed(4)),
    )
  }
  return (
    <div
      className={`${styles.mapCanvas} ${
        placementMode ? styles.mapCanvasPin : ""
      }`}
    >
      <svg
        viewBox="0 0 1000 330"
        role="group"
        aria-label={
          placementMode
            ? "Peta untuk memilih koordinat provinsi"
            : "Peta Indonesia, pilih provinsi asal cerita"
        }
        onClick={mapClick}
      >
        <g className={styles.mapLand}>
          <path d="M65 77 112 55 153 75 175 103 164 132 190 149 175 179 200 204 191 231 223 256 218 279 187 268 174 239 150 222 142 193 117 179 128 146 99 128 89 103Z" />
          <path d="M211 99 251 88 267 103 254 123 228 123Z M237 160 284 149 305 171 293 196 262 203 240 185Z M258 223 298 213 320 235 309 261 281 273 259 251Z" />
          <path d="M327 275 361 267 385 274 400 283 388 292 358 292 340 289Z M390 280 429 278 448 286 445 295 413 298 393 292Z M443 286 476 285 497 291 492 299 462 300 445 295Z" />
          <path d="M335 117 374 101 413 111 430 140 421 170 445 190 435 220 408 230 389 207 360 199 344 173 323 157Z M409 205 445 191 463 205 463 230 445 244 422 232Z M420 103 457 90 483 104 481 131 462 149 438 138Z" />
          <path d="M498 142 515 128 530 139 523 164 541 180 535 198 516 205 508 230 493 236 489 216 501 196 492 177Z M524 204 544 193 556 205 550 229 566 240 558 257 540 247 532 229Z M547 141 566 130 581 140 574 156 559 159Z" />
          <path d="M609 177 627 164 644 171 638 192 622 200Z M626 217 645 205 657 219 648 236 631 238Z" />
          <path d="M700 170 729 158 750 166 766 156 804 159 823 172 854 166 874 177 909 170 940 186 924 205 949 219 930 237 895 230 876 249 847 239 829 258 801 247 779 230 750 228 730 212 704 207Z M748 215 781 214 793 230 778 244 754 236Z" />
        </g>
        {mapPins.map((pin) => (
          <g
            key={pin.name}
            className={
              pin.name === selectedProvince
                ? styles.mapPinActive
                : styles.mapPin
            }
          >
            {!placementMode && (
              <circle
                cx={pin.x}
                cy={pin.y}
                r={pin.name === selectedProvince ? 8 : 5}
                role="button"
                tabIndex={0}
                aria-label={`Pilih ${pin.name}`}
                onClick={(event) => {
                  event.stopPropagation()
                  onSelectProvince?.(pin.name)
                }}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault()
                    onSelectProvince?.(pin.name)
                  }
                }}
              >
                <title>{pin.name}</title>
              </circle>
            )}
          </g>
        ))}
        {active && !placementMode && (
          <g
            className={styles.mapTooltip}
            transform={`translate(${Math.min(active.x + 12, 795)} ${Math.max(active.y - 12, 25)})`}
          >
            <rect width="145" height="29" rx="8" />
            <text x="10" y="19">
              {active.name}
            </text>
          </g>
        )}
        {point && (
          <g
            className={styles.mapCoordinatePin}
            transform={`translate(${point.x} ${point.y})`}
          >
            <circle r="11" />
            <MapPin size={18} x={-9} y={-23} />
            <text x="14" y="4">
              Titik provinsi
            </text>
          </g>
        )}
        {placementMode && (
          <rect
            className={styles.mapClickSurface}
            x="0"
            y="0"
            width="1000"
            height="330"
          />
        )}
      </svg>
      {placementMode && (
        <div className={styles.mapHint}>
          <MapPin size={13} /> Klik area peta untuk memindahkan titik lokasi.
        </div>
      )}
    </div>
  )
}
