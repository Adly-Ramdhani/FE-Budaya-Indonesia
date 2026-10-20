import { useEffect, useMemo, useRef, useState } from "react"
import { useParams, useSearchParams, Link } from "react-router-dom"
import {
  ArrowDownWideNarrow,
  ArrowUpRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CirclePlus,
  Grid2X2,
  List,
  MapPin,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react"
import AdminShell from "../admin/AdminShell"
import {
  categoryConfigs,
  isCategoryKey,
  provinces,
  regions,
} from "../admin/categoryConfig"
import { deleteContent, getContents } from "../admin/contentRepository"
import type { ContentItem, ContentStatus } from "../admin/types"
import styles from "./AdminCategoryPage.module.css"

const PAGE_SIZE = 6
const queryDefaults = {
  q: "",
  wilayah: "",
  provinsi: "",
  status: "",
  view: "grid",
  sort: "terbaru",
  page: "1",
}
const dateLabel = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${value}T12:00:00`))

export default function AdminCategoryPage() {
  const { category } = useParams()
  if (!isCategoryKey(category))
    return (
      <AdminShell title="Koleksi Budaya">
        <div className={styles.notFound}>Kategori tidak ditemukan.</div>
      </AdminShell>
    )
  return <CategoryManager key={category} category={category} />
}

function CategoryManager({
  category,
}: {
  category: keyof typeof categoryConfigs
}) {
  const config = categoryConfigs[category]
  const [searchParams, setSearchParams] = useSearchParams()
  const [items, setItems] = useState(() => getContents(category))
  const [pendingDelete, setPendingDelete] = useState<ContentItem | null>(null)
  const [draftQuery, setDraftQuery] = useState(searchParams.get("q") ?? "")
  const dialogRef = useRef<HTMLDivElement>(null)
  const deleteCancelRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const next = new URLSearchParams(searchParams)
    for (const [key, value] of Object.entries(queryDefaults))
      if (!next.has(key)) next.set(key, value)
    if (next.toString() !== searchParams.toString())
      setSearchParams(next, { replace: true })
  }, [searchParams, setSearchParams])
  useEffect(() => setDraftQuery(searchParams.get("q") ?? ""), [searchParams])
  useEffect(() => {
    if (!pendingDelete) return
    deleteCancelRef.current?.focus()
    const onKey = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") setPendingDelete(null)
      if (event.key === "Tab" && dialogRef.current) {
        const elements = Array.from(
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button:not([disabled]),a[href],input,select,[tabindex]:not([tabindex="-1"])',
          ),
        )
        const first = elements[0],
          last = elements[elements.length - 1]
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault()
          last?.focus()
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault()
          first?.focus()
        }
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [pendingDelete])

  const value = (key: string) => searchParams.get(key) ?? ""
  const update = (key: string, val: string, resetPage = true) => {
    const next = new URLSearchParams(searchParams)
    next.set(key, val)
    if (resetPage && key !== "page") next.set("page", "1")
    setSearchParams(next, { replace: true })
  }
  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (draftQuery !== value("q")) update("q", draftQuery)
    }, 250)
    return () => window.clearTimeout(timer)
  }, [draftQuery])

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const term = value("q").trim().toLocaleLowerCase("id-ID")
        const province = item.kind === "content" ? item.province : ""
        return (
          (!term ||
            `${item.title} ${item.description} ${province} ${item.region}`
              .toLocaleLowerCase("id-ID")
              .includes(term)) &&
          (!value("wilayah") || item.region === value("wilayah")) &&
          (!value("provinsi") || province === value("provinsi")) &&
          (!value("status") || item.status === value("status"))
        )
      }),
    [items, searchParams],
  )
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, Number(value("page")) || 1), pageCount)
  const sorted = [...filtered].sort((a, b) => {
    if (value("sort") === "terlama")
      return a.updatedAt.localeCompare(b.updatedAt)
    if (value("sort") === "nama") return a.title.localeCompare(b.title, "id-ID")
    return b.updatedAt.localeCompare(a.updatedAt)
  })
  const currentItems = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const activeFilters = Boolean(
    value("q") || value("wilayah") || value("provinsi") || value("status"),
  )
  const provinceOptions = provinces.filter(
    (item) => !value("wilayah") || item.region === value("wilayah"),
  )
  const published = items.filter((item) => item.status === "Terbit").length
  const drafts = items.length - published

  const deleteItem = () => {
    if (!pendingDelete) return
    deleteContent(category, pendingDelete.slug)
    const remainingCount = filtered.filter(
      (item) => item.id !== pendingDelete.id,
    ).length
    const nextPageCount = Math.max(1, Math.ceil(remainingCount / PAGE_SIZE))
    if (page > nextPageCount) update("page", String(nextPageCount), false)
    setItems((current) =>
      current.filter((item) => item.id !== pendingDelete.id),
    )
    setPendingDelete(null)
  }
  const clearFilters = () => {
    setDraftQuery("")
    setSearchParams({ ...queryDefaults }, { replace: true })
  }
  const pagination = () => {
    if (pageCount <= 5)
      return Array.from({ length: pageCount }, (_, i) => i + 1)
    const start = Math.min(Math.max(1, page - 1), pageCount - 4)
    return [...Array.from({ length: 3 }, (_, i) => start + i), -1, pageCount]
  }

  return (
    <AdminShell title={config.title}>
      <div className={styles.pageHead}>
        <div>
          <div className={styles.eyebrow}>
            Koleksi Budaya <span>/</span> {config.title}
          </div>
          <h1>{config.title}</h1>
          <p>{config.subtitle}</p>
        </div>
        <div className={styles.headActions}>
          <small>Sabtu, 10 Oktober 2026</small>
          <Link to={`/admin/${category}/baru`} className={styles.primary}>
            <CirclePlus size={17} />
            {config.addLabel}
          </Link>
        </div>
      </div>

      <section className={styles.metrics} aria-label="Ringkasan konten">
        <Metric
          label={`Total ${config.plural}`}
          number={items.length}
          note="Semua konten dalam kategori"
        />
        <Metric
          label="Terbit"
          number={published}
          note="Tampil untuk pengunjung"
          status="published"
        />
        <Metric
          label="Draf"
          number={drafts}
          note="Belum tampil untuk pengunjung"
          status="draft"
        />
      </section>

      <section className={styles.filterPanel} aria-label="Filter daftar">
        <label className={styles.searchField}>
          <Search size={17} />
          <span className="sr-only">{config.searchLabel}</span>
          <input
            value={draftQuery}
            onChange={(event) => setDraftQuery(event.target.value)}
            placeholder={config.searchPlaceholder}
          />
        </label>
        <Select
          label="Wilayah"
          value={value("wilayah")}
          onChange={(val) => {
            const next = new URLSearchParams(searchParams)
            next.set("wilayah", val)
            if (
              value("provinsi") &&
              !provinces.some(
                (p) =>
                  p.name === value("provinsi") && (!val || p.region === val),
              )
            )
              next.set("provinsi", "")
            next.set("page", "1")
            setSearchParams(next, { replace: true })
          }}
          options={regions.map((name) => [name, name])}
        />
        {config.kind !== "province" && (
          <Select
            label="Provinsi"
            value={value("provinsi")}
            onChange={(val) => update("provinsi", val)}
            options={provinceOptions.map((item) => [item.name, item.name])}
          />
        )}
        <Select
          label="Status"
          value={value("status")}
          onChange={(val) => update("status", val)}
          options={[
            ["Terbit", "Terbit"],
            ["Draf", "Draf"],
          ]}
        />
        <label className={styles.sortButton}>
          <ArrowDownWideNarrow size={16} />
          <span className="sr-only">Urutkan</span>
          <select
            aria-label="Urutkan konten"
            value={value("sort")}
            onChange={(event) => update("sort", event.target.value)}
          >
            <option value="terbaru">Terbaru</option>
            <option value="terlama">Terlama</option>
            <option value="nama">Nama A–Z</option>
          </select>
          <ChevronDown size={14} />
        </label>
      </section>

      <div className={styles.resultsBar}>
        <div>
          <b>{filtered.length}</b> konten ditemukan <span>·</span>{" "}
          {filtered.filter((item) => item.status === "Terbit").length} terbit{" "}
          <span>·</span>{" "}
          {filtered.filter((item) => item.status === "Draf").length} draf
        </div>
        <div
          className={styles.viewSwitch}
          role="group"
          aria-label="Tampilan daftar"
        >
          <button
            className={value("view") !== "list" ? styles.viewActive : ""}
            aria-label="Tampilan kartu"
            aria-pressed={value("view") !== "list"}
            onClick={() => update("view", "grid", false)}
          >
            <Grid2X2 size={17} />
          </button>
          <button
            className={value("view") === "list" ? styles.viewActive : ""}
            aria-label="Tampilan tabel"
            aria-pressed={value("view") === "list"}
            onClick={() => update("view", "list", false)}
          >
            <List size={18} />
          </button>
        </div>
      </div>

      {currentItems.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>
            <config.icon size={24} />
          </div>
          <h2>
            {activeFilters
              ? "Konten tidak ditemukan"
              : `Belum ada ${config.plural}`}
          </h2>
          <p>
            {activeFilters
              ? "Coba ubah kata kunci atau filter yang digunakan."
              : "Mulai isi koleksi budaya dengan menambahkan konten pertama."}
          </p>
          <div>
            {activeFilters && (
              <button onClick={clearFilters} className={styles.secondary}>
                Hapus filter
              </button>
            )}
            <Link className={styles.primary} to={`/admin/${category}/baru`}>
              <CirclePlus size={16} />
              {config.addLabel}
            </Link>
          </div>
        </div>
      ) : value("view") === "list" ? (
        <ContentTable
          items={currentItems}
          category={category}
          onDelete={setPendingDelete}
        />
      ) : (
        <div className={styles.grid}>
          {currentItems.map((item) => (
            <ContentCard
              key={item.id}
              item={item}
              category={category}
              onDelete={setPendingDelete}
            />
          ))}
        </div>
      )}

      <footer className={styles.pagination}>
        <span>
          Menampilkan {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0}–
          {Math.min(page * PAGE_SIZE, filtered.length)} dari {filtered.length}{" "}
          konten
        </span>
        <div className={styles.pages}>
          <button
            disabled={page <= 1}
            aria-label="Halaman sebelumnya"
            onClick={() => update("page", String(page - 1), false)}
          >
            <ChevronLeft size={16} />
          </button>
          {pagination().map((number, index) =>
            number === -1 ? (
              <span key={`ellipsis-${index}`}>…</span>
            ) : (
              <button
                key={number}
                aria-current={page === number ? "page" : undefined}
                className={page === number ? styles.pageCurrent : ""}
                onClick={() => update("page", String(number), false)}
              >
                {number}
              </button>
            ),
          )}
          <button
            disabled={page >= pageCount}
            aria-label="Halaman berikutnya"
            onClick={() => update("page", String(page + 1), false)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </footer>

      {pendingDelete && (
        <div
          className={styles.modalScrim}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setPendingDelete(null)
          }}
        >
          <div
            className={styles.dialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            ref={dialogRef}
          >
            <button
              className={styles.modalClose}
              aria-label="Tutup dialog"
              onClick={() => setPendingDelete(null)}
            >
              <X size={17} />
            </button>
            <div className={styles.warningIcon}>
              <Trash2 size={20} />
            </div>
            <span className={styles.eyebrow}>Hapus konten</span>
            <h2 id="delete-title">Hapus “{pendingDelete.title}”?</h2>
            <p>
              Konten ini akan dihapus dari daftar simulasi lokal. Tindakan ini
              tidak dapat dibatalkan.
            </p>
            <div className={styles.dialogActions}>
              <button
                ref={deleteCancelRef}
                className={styles.secondary}
                onClick={() => setPendingDelete(null)}
              >
                Batal
              </button>
              <button className={styles.danger} onClick={deleteItem}>
                <Trash2 size={15} />
                Hapus konten
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={styles.pageFoot}>
        <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
        <span>Data simulasi · 10 Oktober 2026</span>
      </div>
    </AdminShell>
  )
}

function Metric({
  label,
  number,
  note,
  status,
}: {
  label: string
  number: number
  note: string
  status?: "published" | "draft"
}) {
  return (
    <article className={styles.metric}>
      <span className={styles.metricIcon}>
        {status === "published" ? "●" : status === "draft" ? "◷" : "▧"}
      </span>
      <span className={styles.metricLabel}>{label}</span>
      <strong>{number}</strong>
      <small>{note}</small>
    </article>
  )
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: string[][]
}) {
  return (
    <label className={styles.filterSelect}>
      <span>{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Semua {label.toLocaleLowerCase("id-ID")}</option>
        {options.map(([text, val]) => (
          <option key={val} value={val}>
            {text}
          </option>
        ))}
      </select>
    </label>
  )
}

function Status({ status }: { status: ContentStatus }) {
  return (
    <span
      className={`${styles.status} ${
        status === "Terbit" ? styles.published : styles.draft
      }`}
    >
      <i />
      {status}
    </span>
  )
}

export function ContentCard({
  item,
  category,
  onDelete,
  previewMode = false,
}: {
  item: ContentItem
  category: string
  onDelete: (item: ContentItem) => void
  previewMode?: boolean
}) {
  const config = categoryConfigs[(category as keyof typeof categoryConfigs)]
  const [imageFailed, setImageFailed] = useState(false)
  return (
    <article className={styles.card}>
      <div className={styles.cardImage}>
        {!imageFailed ? (
          <img
            src={
              item.formData?.coverUrl || `/images/${category}/${item.slug}.jpg`
            }
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div className={styles.imageFallback}>
            <config.icon size={36} />
            <span>Budaya Indonesia</span>
          </div>
        )}
        <span className={styles.imageStatus}>
          <Status status={item.status} />
        </span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.cardCategory}>
          {config.title}
          {item.dummy && <span className={styles.dummy}>Data dummy</span>}
        </div>
        <h2>{item.title}</h2>
        <p>{item.description}</p>
        <div className={styles.location}>
          <MapPin size={14} />
          <span>{item.kind === "content" ? item.province : item.region}</span>
          {item.kind === "content" ? (
            <>
              <span>·</span>
              <span>{item.region}</span>
            </>
          ) : (
            <>
              <span>·</span>
              <span>{item.capital}</span>
            </>
          )}
        </div>
        {item.kind === "province" && (
          <div className={styles.storyCount}>
            {item.storyCount} cerita budaya
          </div>
        )}
        <div className={styles.cardMeta}>
          Diperbarui {dateLabel(item.updatedAt)}
        </div>
        {!previewMode && (
          <div className={styles.cardActions}>
            <Link
              to={`/admin/${category}/${item.slug}/edit`}
              className={styles.edit}
            >
              <Pencil size={14} />
              Edit konten
            </Link>
            <button
              aria-label={`Hapus ${item.title}`}
              onClick={() => onDelete(item)}
            >
              <Trash2 size={15} />
            </button>
            <Link
              aria-label={`Lihat ${item.title}`}
              to={config.previewPath}
              className={styles.preview}
            >
              <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </article>
  )
}

function ContentTable({
  items,
  category,
  onDelete,
}: {
  items: ContentItem[]
  category: string
  onDelete: (item: ContentItem) => void
}) {
  const isProvince = category === "daerah-provinsi"
  return (
    <div className={styles.tableWrap}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nama konten</th>
            {isProvince ? (
              <>
                <th>Wilayah</th>
                <th>Ibu kota</th>
                <th>Cerita budaya</th>
              </>
            ) : (
              <>
                <th>Provinsi</th>
                <th>Wilayah</th>
              </>
            )}
            <th>Status</th>
            <th>Diperbarui</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>
                <div className={styles.tableTitle}>
                  <span>{item.title}</span>
                  {item.dummy && <small>Dummy</small>}
                  <small>{item.description}</small>
                </div>
              </td>
              {isProvince && item.kind === "province" ? (
                <>
                  <td>{item.region}</td>
                  <td>{item.capital}</td>
                  <td>{item.storyCount}</td>
                </>
              ) : item.kind === "content" ? (
                <>
                  <td>{item.province}</td>
                  <td>{item.region}</td>
                </>
              ) : (
                <>
                  <td>—</td>
                  <td>{item.region}</td>
                </>
              )}
              <td>
                <Status status={item.status} />
              </td>
              <td>{dateLabel(item.updatedAt)}</td>
              <td>
                <div className={styles.tableActions}>
                  <Link
                    to={`/admin/${category}/${item.slug}/edit`}
                    aria-label={`Edit ${item.title}`}
                  >
                    <Pencil size={15} />
                  </Link>
                  <button
                    aria-label={`Hapus ${item.title}`}
                    onClick={() => onDelete(item)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
