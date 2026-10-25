import { useEffect } from "react"
import { ArrowUpRight, MapPin, Music2, X } from "lucide-react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import AdminShell from "../../../admin/AdminShell"
import { categoryConfigs, isCategoryKey } from "../../../admin/categoryConfig"
import { getContentBySlug } from "../../../admin/contentRepository"
import { categoryDetailFields } from "../../../admin/formConfig"
import type { CategoryKey, ContentItem } from "../../../admin/types"
import { getSongLanguage, getSongLyrics } from "../../LaguPage"
import styles from "./AdminContentDetailPage.module.css"

type ReturnState = { from?: string } | null

export default function AdminContentDetailPage() {
  const { category: routeCategory, slug } = useParams()
  const category = isCategoryKey(routeCategory) ? routeCategory : undefined
  const item = category && slug ? getContentBySlug(category, slug) : undefined
  const config = category ? categoryConfigs[category] : undefined
  const location = useLocation()
  const navigate = useNavigate()
  const backTo =
    (location.state as ReturnState)?.from ??
    (category ? `/admin/${category}` : "/dashboard")

  const close = () => navigate(backTo)

  useEffect(() => {
    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    window.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [backTo])

  if (!category || !config || !item) {
    return (
      <AdminShell title={config?.title ?? "Konten"}>
        <div className={styles.notFound}>
          <h1>Konten tidak ditemukan</h1>
          <p>Item yang dipilih tidak tersedia di koleksi ini.</p>
          <button type="button" onClick={close}>
            Kembali ke daftar
          </button>
        </div>
      </AdminShell>
    )
  }

  return (
    <AdminShell title={config.title}>
      <div
        className={styles.overlay}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) close()
        }}
      >
        <ContentDetailDialog item={item} category={category} onClose={close} />
      </div>
    </AdminShell>
  )
}

function ContentDetailDialog({
  item,
  category,
  onClose,
}: {
  item: ContentItem
  category: CategoryKey
  onClose: () => void
}) {
  const config = categoryConfigs[category]
  const details = item.formData?.details ?? {}
  const isSong = category === "lagu-daerah"
  const language = String(
    details.language ?? (isSong ? getSongLanguage(item.title) : ""),
  )
  const languageLabel = language
    ? /^bahasa\b/i.test(language)
      ? language
      : `Bahasa ${language}`
    : "Bahasa daerah"
  const lyrics =
    String(details.lyrics ?? "") || (isSong ? getSongLyrics(item.title) : "")
  const cover = item.formData?.coverUrl
  const kicker = isSong
    ? `${
        item.kind === "content" ? item.province : item.region
      } · ${languageLabel}`
    : `${config.title} · ${
        item.kind === "content" ? item.province : item.region
      }`

  return (
    <section
      className={styles.dialog}
      role="dialog"
      aria-modal="true"
      aria-labelledby="content-detail-title"
    >
      <button
        className={styles.closeIcon}
        type="button"
        autoFocus
        aria-label="Tutup detail"
        onClick={onClose}
      >
        <X size={21} />
      </button>
      <header className={styles.header}>
        <span className={styles.kicker}>{kicker}</span>
        <h1 id="content-detail-title">{item.title}</h1>
        <p>{item.formData?.fullDescription || item.description}</p>
      </header>

      {cover && (
        <img className={styles.cover} src={cover} alt={`Foto ${item.title}`} />
      )}

      <div className={styles.location}>
        <MapPin size={15} />
        <span>{item.kind === "content" ? item.province : item.region}</span>
        <span>·</span>
        <span>{item.region}</span>
      </div>

      {isSong ? (
        <section className={styles.songSection} aria-label="Detail lagu">
          <div className={styles.songMeta}>
            <Music2 size={16} />
            <span>{language || "Bahasa daerah belum diisi"}</span>
          </div>
          <h2>Lirik Lagu:</h2>
          {lyrics ? (
            <pre className={styles.lyrics}>{lyrics}</pre>
          ) : (
            <div className={styles.emptyAudio}>
              Lirik belum tersedia untuk lagu ini.
            </div>
          )}
          {item.formData?.audioUrl ? (
            <audio
              className={styles.audio}
              controls
              src={item.formData.audioUrl}
            >
              Browser tidak mendukung pemutar audio.
            </audio>
          ) : item.formData?.youtubeUrl ? (
            <a
              className={styles.audioLink}
              href={item.formData.youtubeUrl}
              target="_blank"
              rel="noreferrer"
            >
              Dengarkan lagu <ArrowUpRight size={14} />
            </a>
          ) : (
            <div className={styles.emptyAudio}>
              Audio melodi belum tersedia untuk lagu ini.
            </div>
          )}
        </section>
      ) : category === "daerah-provinsi" ? (
        <section className={styles.provinceSummary}>
          <span>Ibu kota</span>
          <b>{item.kind === "province" ? item.capital : "—"}</b>
          <span>Cerita budaya</span>
          <b>{item.kind === "province" ? item.storyCount : 0} cerita</b>
          {item.formData?.languages?.length ? (
            <>
              <span>Bahasa & suku</span>
              <b>{item.formData.languages.join(", ")}</b>
            </>
          ) : null}
        </section>
      ) : (
        <DetailFields item={item} category={category} />
      )}

      {item.formData?.source && (
        <p className={styles.source}>
          Sumber rujukan:{" "}
          {item.formData.source.replace(/^Sumber rujukan:\s*/i, "")}
        </p>
      )}
      <footer className={styles.footer}>
        <button type="button" onClick={onClose}>
          Tutup
        </button>
      </footer>
    </section>
  )
}

function DetailFields({
  item,
  category,
}: {
  item: ContentItem
  category: CategoryKey
}) {
  const detailValues = item.formData?.details ?? {}
  const fields = categoryDetailFields[category]
    .filter((field) => field.name !== "lyrics" && field.name !== "translation")
    .map((field) => ({ label: field.label, value: detailValues[field.name] }))
    .filter(({ value }) =>
      Array.isArray(value) ? value.length > 0 : Boolean(value),
    )
  if (!fields.length)
    return <p className={styles.noDetails}>Detail kategori belum diisi.</p>
  return (
    <dl className={styles.detailsList}>
      {fields.map(({ label, value }) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{Array.isArray(value) ? value.join(", ") : String(value)}</dd>
        </div>
      ))}
    </dl>
  )
}
