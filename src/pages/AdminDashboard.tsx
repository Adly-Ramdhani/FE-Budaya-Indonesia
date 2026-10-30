import { useEffect, useMemo, useState, type FormEvent } from "react"
import { useNavigate } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowRight,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Drum,
  House,
  Music2,
  Plus,
  Search,
  Shirt,
  Swords,
  Utensils,
  X,
  PersonStanding,
  ImagePlus,
} from "lucide-react"
import styles from "./AdminDashboard.module.css"
import { AdminSidebar, AdminTopbar } from "../components/Admin/AdminChrome"
import { getApiBaseUrl } from "../api"

type ContentItem = {
  id: string
  title: string
  description: string
  category: string
  province: string
  status: string
  date: string
  sortDate: number
  image: string
}

const categories = [
  { label: "Lagu Daerah", endpoint: "/v1/songs", icon: Music2 },
  { label: "Tarian", endpoint: "/v1/dances", icon: PersonStanding },
  { label: "Alat Musik", endpoint: "/v1/musical-instruments", icon: Drum },
  { label: "Senjata Tradisional", endpoint: "/v1/traditional-weapons", icon: Swords },
  { label: "Pakaian Adat", endpoint: "/v1/traditional-attires", icon: Shirt },
  { label: "Rumah Adat", endpoint: "/v1/traditional-houses", icon: House },
  { label: "Makanan", endpoint: "/v1/foods", icon: Utensils },
]

const islands = [
  "Sumatra",
  "Jawa",
  "Bali",
  "Nusa Tenggara",
  "Kalimantan",
  "Sulawesi",
  "Maluku",
  "Papua",
]

const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)

type CategoryCount = {
  count: number | null
  error: string | null
  loading: boolean
}

function getResponseCount(payload: unknown): number {
  if (Array.isArray(payload)) return payload.length
  if (!payload || typeof payload !== "object") {
    throw new Error("Format respons API tidak valid.")
  }

  const result = payload as {
    data?: unknown
    total?: unknown
    meta?: { total?: unknown }
  }
  const total = result.meta?.total ?? result.total
  if (typeof total === "number" && Number.isFinite(total)) return total
  if (Array.isArray(result.data)) return result.data.length
  throw new Error("Respons API tidak berisi jumlah atau daftar data.")
}

function getResponseItems(payload: unknown): Record<string, unknown>[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        "data" in payload &&
        Array.isArray(payload.data)
      ? payload.data
      : null

  if (!list) throw new Error("Respons API tidak berisi daftar konten.")
  return list.filter(
    (item): item is Record<string, unknown> =>
      Boolean(item) && typeof item === "object" && !Array.isArray(item),
  )
}

function getText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") return String(value)
  if (value && typeof value === "object" && "name" in value) {
    return getText(value.name)
  }
  return ""
}

function getIslandByProvince(provinceName: string): string | null {
  const province = provinceName.toLocaleLowerCase("id-ID")
  if (
    province.includes("aceh") ||
    province.includes("sumat") ||
    province.includes("riau") ||
    province.includes("jambi") ||
    province.includes("bengkulu") ||
    province.includes("lampung") ||
    province.includes("bangka")
  ) {
    return "Sumatra"
  }
  if (
    province.includes("jawa") ||
    province.includes("jakarta") ||
    province.includes("banten") ||
    province.includes("yogyakarta")
  ) {
    return "Jawa"
  }
  if (province.includes("bali")) return "Bali"
  if (province.includes("nusa tenggara")) return "Nusa Tenggara"
  if (province.includes("kalimantan")) return "Kalimantan"
  if (province.includes("sulawesi") || province.includes("gorontalo")) {
    return "Sulawesi"
  }
  if (province.includes("maluku")) return "Maluku"
  if (province.includes("papua")) return "Papua"
  return null
}

function formatItemDate(value: string): { label: string; timestamp: number } {
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) {
    return { label: value || "—", timestamp: 0 }
  }
  return {
    label: new Date(timestamp).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    timestamp,
  }
}

function mapApiItem(
  item: Record<string, unknown>,
  category: string,
): ContentItem {
  const dateValue = getText(
    item.updated_at ?? item.updatedAt ?? item.created_at ?? item.date,
  )
  const date = formatItemDate(dateValue)
  const rawImage = getText(item.image_url ?? item.image)
  const image = rawImage.startsWith("http")
    ? rawImage.replace(/^http:\/\//, "https://")
    : rawImage.startsWith("/")
      ? `${API_URL}${rawImage}`
      : rawImage
  const status = getText(item.status)

  return {
    id: `${category}-${getText(item.id) || `${getText(item.title ?? item.name)}-${date.timestamp}`}`,
    title: getText(item.title ?? item.name) || "Tanpa judul",
    description: getText(item.description) || "—",
    category,
    province: getText(item.province) || "—",
    status:
      status.toLowerCase() === "published"
        ? "Terbit"
        : status.toLowerCase() === "draft"
          ? "Draf"
          : status || "—",
    date: date.label,
    sortDate: date.timestamp,
    image,
  }
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const [items, setItems] = useState<ContentItem[]>([])
  const [recentLoading, setRecentLoading] = useState(true)
  const [recentErrors, setRecentErrors] = useState<string[]>([])
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [period, setPeriod] = useState("Semua waktu")
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("Lagu Daerah")
  const [notice, setNotice] = useState("")
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [categoryCounts, setCategoryCounts] = useState<
    Record<string, CategoryCount>
  >(() =>
    Object.fromEntries(
      categories
        .filter((category) => category.endpoint)
        .map(({ label }) => [
          label,
          { count: null, error: null, loading: true },
        ]),
    ),
  )

  useEffect(() => {
    const controller = new AbortController()

    async function fetchCategoryData() {
      await Promise.all(
        categories
          .filter(
            (category): category is typeof category & { endpoint: string } =>
              Boolean(category.endpoint),
          )
          .map(async ({ endpoint, label }) => {
            try {
              const response = await fetch(
                API_URL ? `${API_URL}${endpoint}` : endpoint,
                {
                  signal: controller.signal,
                  headers: {
                    Accept: "application/json",
                    "ngrok-skip-browser-warning": "true",
                  },
                },
              )
              if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
              }

              const payload: unknown = await response.json()
              const count = getResponseCount(payload)
              const apiItems = getResponseItems(payload).map((item) =>
                mapApiItem(item, label),
              )
              setItems((current) => [
                ...current.filter((item) => item.category !== label),
                ...apiItems,
              ])
              setCategoryCounts((current) => ({
                ...current,
                [label]: { count, error: null, loading: false },
              }))
            } catch (error) {
              if (error instanceof Error && error.name === "AbortError") return
              setCategoryCounts((current) => ({
                ...current,
                [label]: {
                  count: null,
                  error:
                    error instanceof Error
                      ? error.message
                      : "Gagal memuat jumlah dari API.",
                  loading: false,
                },
              }))
              setRecentErrors((current) => [
                ...current,
                `${label}: ${error instanceof Error ? error.message : "Gagal memuat data."}`,
              ])
            }
          }),
      )
      if (!controller.signal.aborted) setRecentLoading(false)
    }

    void fetchCategoryData()
    return () => controller.abort()
  }, [])

  const visibleItems = useMemo(() => items.filter((item) => {
    const matchesCategory = activeCategory === "Semua" || item.category === activeCategory
    const term = search.trim().toLocaleLowerCase("id")
    const matchesSearch = !term || `${item.title} ${item.description} ${item.category} ${item.province}`.toLocaleLowerCase("id").includes(term)
    return matchesCategory && matchesSearch
  }).sort((a, b) => b.sortDate - a.sortDate), [activeCategory, items, search])
  const islandCounts = useMemo(() => {
    const counts = new Map(islands.map((island) => [island, 0]))
    items.forEach((item) => {
      const island = getIslandByProvince(item.province)
      if (island) counts.set(island, (counts.get(island) ?? 0) + 1)
    })
    return islands.map((label) => ({
      label,
      value: counts.get(label) ?? 0,
    }))
  }, [items])
  const totalIslandContent = islandCounts.reduce(
    (total, island) => total + island.value,
    0,
  )
  const largestIsland = islandCounts.reduce<(typeof islandCounts)[number] | null>(
    (largest, island) =>
      island.value > (largest?.value ?? 0) ? island : largest,
    null,
  )
  const maxIslandCount = Math.max(...islandCounts.map((island) => island.value))
  const chartScale = Math.max(4, Math.ceil(maxIslandCount / 4) * 4)

  function openForm(kind: "add" | "edit", item?: ContentItem, category?: string) {
    setModal(kind)
    setEditing(item ?? null)
    setFormTitle(item?.title ?? "")
    setFormCategory(item?.category ?? category ?? "Lagu Daerah")
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formTitle.trim()) return
    if (modal === "edit" && editing) {
      setItems((current) => current.map((item) => item.id === editing.id ? { ...item, title: formTitle.trim(), category: formCategory } : item))
      setNotice(`“${formTitle.trim()}” berhasil diperbarui.`)
    } else {
      const newItem: ContentItem = { id: String(Date.now()), title: formTitle.trim(), description: "Konten baru menunggu dilengkapi", category: formCategory, province: "Belum ditentukan", status: "Draf", date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }), sortDate: Date.now(), image: "/assets/0552e.png" }
      setItems((current) => [newItem, ...current])
      setActiveCategory("Semua")
      setPage(1)
      setNotice(`“${formTitle.trim()}” disimpan sebagai draf.`)
    }
    setModal(null)
  }

  function removeItem(item: ContentItem) {
    if (window.confirm(`Hapus “${item.title}” dari daftar konten demo?`)) {
      setItems((current) => current.filter((entry) => entry.id !== item.id))
      setPage(1)
      setNotice(`“${item.title}” dihapus dari daftar demo.`)
    }
  }

  function chooseMenu(label: string) {
    setMobileNavOpen(false)
    setPage(1)
    if (label === "Dashboard") {
      setActiveCategory("Semua")
      setNotice("")
    } else if (label === "Lagu Daerah") {
      navigate("/admin/musik")
    } else if (label === "Alat Musik") {
      navigate("/admin/alat-musik")
    } else if (categories.some((category) => category.label === label)) {
      setActiveCategory(label)
      setNotice("")
      document.getElementById("konten-terbaru")?.scrollIntoView({ behavior: "smooth" })
    } else {
      setNotice(`Menu ${label} ditampilkan sebagai bagian dari rancangan antarmuka.`)
    }
  }

  return (
    <div className={styles.shell}>
      <AdminSidebar
        activeItem={activeCategory === "Semua" ? "Dashboard" : activeCategory}
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onSelect={chooseMenu}
      />

      <main className={styles.main}>
        <AdminTopbar
          title="Dashboard"
          search={search}
          onSearchChange={(value) => {
            setSearch(value)
            setPage(1)
          }}
          onOpenMenu={() => setMobileNavOpen(true)}
        />

        <div className={styles.content}>
          {notice && <div role="status" className={styles.notice}><Check size={16} />{notice}<button aria-label="Tutup pemberitahuan" onClick={() => setNotice("")}><X size={15} /></button></div>}
          <section className={styles.welcome}>
            <div><p className={styles.eyebrow}>Merawat warisan Nusantara</p><h1>Halo, Admin</h1><p className={styles.welcomeText}>Setiap konten yang Anda rawat membuka jalan untuk mengenal Indonesia.</p></div>
            <div className={styles.welcomeAction}><span>Sabtu, 10 Oktober 2026</span><button className={styles.primaryButton} onClick={() => openForm("add")}><Plus size={17} />Tambah Konten</button></div>
          </section>

          <section className={styles.collection} aria-labelledby="collection-title">
            <div className={styles.sectionHeading}><h2 id="collection-title">Koleksi budaya</h2><span>Jumlah dihitung dari API yang tersedia</span></div>
            <div className={styles.statsGrid}>
              {categories.map(({ label, endpoint, icon: Icon }) => {
                const result = categoryCounts[label]
                const displayedCount = !endpoint
                  ? "—"
                  : result?.loading
                    ? "…"
                    : result?.error
                      ? "—"
                      : result?.count ?? "—"

                return (
                  <button
                    className={styles.statCard}
                    key={label}
                    onClick={() => chooseMenu(label)}
                    aria-label={`Lihat ${label}, ${displayedCount} konten`}
                  >
                    <Icon
                      className={styles.statIcon}
                      size={19}
                      strokeWidth={1.9}
                    />
                    <span className={styles.statLabel}>{label}</span>
                    <strong>{displayedCount}</strong>
                    {(result?.error || !endpoint) && (
                      <small>
                        {!endpoint
                          ? "API belum tersedia"
                          : `Gagal memuat: ${result.error}`}
                      </small>
                    )}
                  </button>
                )
              })}
            </div>
          </section>

          <div className={styles.insightGrid}>
            <section className={styles.chartPanel} aria-labelledby="island-title">
              <div className={styles.panelHeader}><div><h2 id="island-title">Konten per Pulau</h2><p>Sebaran {totalIslandContent} konten API berdasarkan provinsi.</p></div><label className={styles.selectWrap}><span className={styles.srOnly}>Periode grafik</span><select value={period} onChange={(event) => setPeriod(event.target.value)}><option>Semua waktu</option><option>Tahun ini</option><option>Bulan ini</option></select><ChevronDown size={14} /></label></div>
              <div className={styles.chart} role="img" aria-label="Grafik batang jumlah konten per pulau">
                <div className={styles.yAxis}>{[1, 0.75, 0.5, 0.25, 0].map((ratio) => <span key={ratio}>{Math.round(chartScale * ratio)}</span>)}</div>
                <div className={styles.plot}>{islandCounts.map((island) => {
                  const isLargest = island.value > 0 && island.value === largestIsland?.value
                  return <div className={styles.barColumn} key={island.label}><strong className={isLargest ? styles.barValueAccent : ""}>{island.value}</strong><div className={`${styles.bar} ${isLargest ? styles.barAccent : ""}`} style={{ height: `${island.value / chartScale * 150}px` }} /><span>{island.label}</span></div>
                })}</div>
              </div>
              <p className={styles.chartNote}><span />{largestIsland?.value ? `${largestIsland.label} memiliki koleksi terbanyak: ${largestIsland.value} konten (${(largestIsland.value / totalIslandContent * 100).toLocaleString("id-ID", { maximumFractionDigits: 1 })}%).` : "Belum ada konten dengan provinsi yang dapat dipetakan ke pulau."}</p>
            </section>
            <section className={styles.quickPanel} aria-labelledby="quick-title">
              <h2 id="quick-title">Aksi cepat</h2><p>Mulai cerita baru dari kategori pilihan.</p>
              <div className={styles.quickGrid}>{[...categories, { label: "Unggah Media", icon: ImagePlus }].map(({ label, icon: Icon }) => <button key={label} onClick={() => label === "Pakaian Adat" ? navigate("/admin/baju-adat") : label === "Makanan" ? navigate("/admin/makanan") : openForm("add", undefined, label === "Unggah Media" ? "Lagu Daerah" : label)}><Icon size={15} />{label === "Unggah Media" ? "Unggah Media" : `Tambah ${label === "Lagu Daerah" ? "Lagu" : label === "Senjata Tradisional" ? "Senjata" : label === "Pakaian Adat" ? "Pakaian" : label}`}</button>)}</div>
              <a className={styles.guideLink} href="#panduan" onClick={(event) => { event.preventDefault(); setNotice("Panduan penulisan konten akan tersedia di ruang redaksi.") }}><CircleHelp size={16} />Panduan penulisan konten <ArrowRight size={14} /></a>
            </section>
          </div>

          <section className={styles.tablePanel} id="konten-terbaru" aria-labelledby="latest-title">
            <div className={styles.tableHeader}><div><h2 id="latest-title">Konten Terbaru</h2><p>{activeCategory === "Semua" ? "Pembaruan terbaru dari database budaya." : `Menampilkan koleksi ${activeCategory} dari database.`}</p></div><button className={styles.allLink} onClick={() => { setActiveCategory("Semua"); setSearch(""); setPage(1) }}><ArrowDownRight size={16} />Lihat semua konten</button></div>
            {recentErrors.length > 0 && (
              <p className={styles.notice} role="alert">
                Sebagian data API gagal dimuat: {recentErrors.join(" · ")}
              </p>
            )}
            <div className={styles.tableScroll}><table><thead><tr><th>Judul konten</th><th>Kategori</th><th>Provinsi</th><th>Status</th><th>Tanggal</th><th>Aksi</th></tr></thead><tbody>
              {recentLoading && visibleItems.length === 0 ? (
                <tr><td colSpan={6}>Memuat konten dari database...</td></tr>
              ) : visibleItems.length ? visibleItems.slice((page - 1) * 7, page * 7).map((item) => <tr key={item.id}>
                <td><div className={styles.titleCell}>{item.image && <img src={item.image} alt="" />}<span><b>{item.title}</b><small>{item.description}</small></span></div></td><td>{item.category}</td><td className={styles.mutedCell}>{item.province}</td><td><span className={`${styles.status} ${item.status === "Terbit" ? styles.published : styles.draft}`}><i />{item.status}</span></td><td className={styles.mutedCell}>{item.date}</td><td><div className={styles.rowActions}><button onClick={() => openForm("edit", item)}>Edit</button><button onClick={() => removeItem(item)}>Hapus</button></div></td>
              </tr>) : <tr><td colSpan={6}><div className={styles.emptyState}><Search size={20} /><b>{recentErrors.length ? "Data database gagal dimuat" : "Konten tidak ditemukan"}</b><span>{recentErrors.length ? "Periksa koneksi API lalu coba lagi." : "Coba kata kunci atau kategori yang lain."}</span>{!recentErrors.length && <button onClick={() => { setSearch(""); setActiveCategory("Semua"); setPage(1) }}>Reset pencarian</button>}</div></td></tr>}
            </tbody></table></div>
            <div className={styles.tableFooter}><span>Menampilkan {visibleItems.length ? Math.min(visibleItems.length - (page - 1) * 7, 7) : 0} dari {visibleItems.length} konten API</span><div className={styles.pagination}><button aria-label="Halaman sebelumnya" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}><ChevronLeft size={15} /></button><span>{page}</span><button aria-label="Halaman berikutnya" onClick={() => setPage(page + 1)} disabled={visibleItems.length <= page * 7}><ChevronRight size={15} /></button></div><small><span className={styles.syncDot} />Data dari API</small></div>
          </section>
          <footer className={styles.footer}><span>© 2026 Purwa Nusantara · Merawat cerita bersama.</span><span>Konten terbaru dari API</span></footer>
        </div>
      </main>

      {modal && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setModal(null) }}><section className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className={styles.modalHeader}><div><span className={styles.modalKicker}>{modal === "edit" ? "Perbarui koleksi" : "Ruang redaksi"}</span><h2 id="modal-title">{modal === "edit" ? "Edit konten" : "Tambah konten"}</h2></div><button className={styles.closeButton} aria-label="Tutup" onClick={() => setModal(null)}><X size={18} /></button></div>
        <form onSubmit={saveItem}><label className={styles.formLabel}>Judul konten<input autoFocus value={formTitle} onChange={(event) => setFormTitle(event.target.value)} placeholder="Contoh: Tari Piring" required /></label><label className={styles.formLabel}>Kategori<select value={formCategory} onChange={(event) => setFormCategory(event.target.value)}>{categories.map((category) => <option key={category.label}>{category.label}</option>)}</select></label><div className={styles.formHint}><ImagePlus size={17} /><span>Data tersimpan lokal sebagai pratinjau antarmuka. Informasi wilayah dan media dapat dilengkapi kemudian.</span></div><div className={styles.modalActions}><button type="button" className={styles.cancelButton} onClick={() => setModal(null)}>Batal</button><button className={styles.primaryButton} type="submit"><Plus size={16} />{modal === "edit" ? "Simpan perubahan" : "Simpan sebagai draf"}</button></div></form>
      </section></div>}
    </div>
  )
}
