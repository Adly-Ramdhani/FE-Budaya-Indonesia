import { useMemo, useState, type FormEvent } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  ArrowDownRight,
  ArrowRight,
  Bell,
  BookOpen,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Diamond,
  Drum,
  House,
  LogOut,
  MapPinned,
  Menu,
  Music2,
  Plus,
  Search,
  Shirt,
  Swords,
  Utensils,
  Users,
  X,
  PersonStanding,
  ImagePlus,
  Settings,
} from "lucide-react"
import styles from "./AdminDashboard.module.css"

type ContentItem = {
  id: number
  title: string
  description: string
  category: string
  province: string
  status: "Terbit" | "Draf"
  date: string
  image: string
}

const categories = [
  { label: "Lagu Daerah", count: 128, change: 8, icon: Music2 },
  { label: "Tarian", count: 96, change: 6, icon: PersonStanding },
  { label: "Alat Musik", count: 74, change: 4, icon: Drum },
  { label: "Senjata Tradisional", count: 52, change: 3, icon: Swords },
  { label: "Pakaian Adat", count: 86, change: 5, icon: Shirt },
  { label: "Rumah Adat", count: 64, change: 4, icon: House },
  { label: "Makanan", count: 120, change: 9, icon: Utensils },
]

const initialItems: ContentItem[] = [
  {
    id: 1,
    title: "Bolelebo",
    description: "Lagu rakyat dari tanah Timor",
    category: "Lagu Daerah",
    province: "Nusa Tenggara Timur",
    status: "Terbit",
    date: "10 Okt 2026",
    image: "/assets/0552e.png",
  },
  {
    id: 2,
    title: "Tari Saman",
    description: "Gerak dan kebersamaan masyarakat Gayo",
    category: "Tarian",
    province: "Aceh",
    status: "Terbit",
    date: "10 Okt 2026",
    image: "/assets/0f23d.png",
  },
  {
    id: 3,
    title: "Sasando",
    description: "Dawai yang bernyanyi dari Pulau Rote",
    category: "Alat Musik",
    province: "Nusa Tenggara Timur",
    status: "Draf",
    date: "09 Okt 2026",
    image: "/assets/2489a.png",
  },
  {
    id: 4,
    title: "Keris Jawa",
    description: "Warisan tempa dan makna simbolik",
    category: "Senjata Tradisional",
    province: "Jawa Tengah",
    status: "Terbit",
    date: "09 Okt 2026",
    image: "/assets/37149.png",
  },
  {
    id: 5,
    title: "Tenun Ikat Flores",
    description: "Motif dan ingatan dalam setiap benang",
    category: "Pakaian Adat",
    province: "Nusa Tenggara Timur",
    status: "Draf",
    date: "08 Okt 2026",
    image: "/assets/3a211.png",
  },
  {
    id: 6,
    title: "Rumah Tongkonan",
    description: "Rumah leluhur masyarakat Toraja",
    category: "Rumah Adat",
    province: "Sulawesi Selatan",
    status: "Terbit",
    date: "08 Okt 2026",
    image: "/assets/76c15.png",
  },
  {
    id: 7,
    title: "Rendang Minangkabau",
    description: "Rasa yang dirawat lintas generasi",
    category: "Makanan",
    province: "Sumatra Barat",
    status: "Terbit",
    date: "07 Okt 2026",
    image: "/assets/7e922.png",
  },
]

const regions = [
  { label: "Sumatra", value: 148 },
  { label: "Jawa", value: 182 },
  { label: "Bali & Nusa Tenggara", value: 96 },
  { label: "Kalimantan", value: 62 },
  { label: "Sulawesi", value: 78 },
  { label: "Maluku & Papua", value: 54 },
]

const sidebarGroups = [
  {
    heading: "Koleksi budaya",
    items: [
      ...categories.map(({ label, icon }, index) => ({
        label,
        icon,
        href: [
          "lagu-daerah",
          "tarian",
          "alat-musik",
          "senjata-tradisional",
          "pakaian-adat",
          "rumah-adat",
          "makanan",
        ][index],
      })),
      { label: "Daerah & Provinsi", icon: MapPinned, href: "daerah-provinsi" },
    ],
  },
  {
    heading: "Pengelolaan",
    items: [
      { label: "Media Library", icon: ImagePlus, href: "media-library" },
      { label: "Pengguna Admin", icon: Users, href: "pengguna-admin" },
      { label: "Pengaturan", icon: Settings, href: "pengaturan" },
    ],
  },
]

export default function AdminDashboard() {
  const location = useLocation()
  const [items, setItems] = useState(initialItems)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("Semua")
  const [period, setPeriod] = useState("Semua waktu")
  const [modal, setModal] = useState<"add" | "edit" | null>(null)
  const [editing, setEditing] = useState<ContentItem | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("Lagu Daerah")
  const [notice, setNotice] = useState("")
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [page, setPage] = useState(1)

  const visibleItems = useMemo(
    () =>
      items.filter((item) => {
        const matchesCategory =
          activeCategory === "Semua" || item.category === activeCategory
        const term = search.trim().toLocaleLowerCase("id")
        const matchesSearch =
          !term ||
          `${item.title} ${item.description} ${item.category} ${item.province}`
            .toLocaleLowerCase("id")
            .includes(term)
        return matchesCategory && matchesSearch
      }),
    [activeCategory, items, search],
  )

  function openForm(
    kind: "add" | "edit",
    item?: ContentItem,
    category?: string,
  ) {
    setModal(kind)
    setEditing(item ?? null)
    setFormTitle(item?.title ?? "")
    setFormCategory(item?.category ?? category ?? "Lagu Daerah")
  }

  function saveItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!formTitle.trim()) return
    if (modal === "edit" && editing) {
      setItems((current) =>
        current.map((item) =>
          item.id === editing.id
            ? { ...item, title: formTitle.trim(), category: formCategory }
            : item,
        ),
      )
      setNotice(`“${formTitle.trim()}” berhasil diperbarui.`)
    } else {
      const newItem: ContentItem = {
        id: Date.now(),
        title: formTitle.trim(),
        description: "Konten baru menunggu dilengkapi",
        category: formCategory,
        province: "Belum ditentukan",
        status: "Draf",
        date: "18 Okt 2026",
        image: "/assets/0552e.png",
      }
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
    } else if (categories.some((category) => category.label === label)) {
      setActiveCategory(label)
      setNotice("")
      document
        .getElementById("konten-terbaru")
        ?.scrollIntoView({ behavior: "smooth" })
    } else {
      setNotice(
        `Menu ${label} ditampilkan sebagai bagian dari rancangan antarmuka.`,
      )
    }
  }

  return (
    <div className={styles.shell}>
      <button
        className={`${styles.scrim} ${
          mobileNavOpen ? styles.scrimVisible : ""
        }`}
        aria-label="Tutup navigasi"
        onClick={() => setMobileNavOpen(false)}
      />
      <aside
        className={`${styles.sidebar} ${
          mobileNavOpen ? styles.sidebarOpen : ""
        }`}
      >
        <a
          href="/"
          className={styles.brand}
          aria-label="Budaya Indonesia, beranda"
        >
          <span className={styles.brandMark}>
            <Diamond size={23} strokeWidth={1.55} />
          </span>
          <span>Budaya Indonesia</span>
        </a>
        <div className={styles.sidebarLabel}>Panel admin</div>
        <button
          className={styles.collapseButton}
          aria-label="Tutup menu"
          onClick={() => setMobileNavOpen(false)}
        >
          <ChevronLeft size={17} />
        </button>
        <nav className={styles.navigation} aria-label="Navigasi admin">
          <Link
            to="/dashboard"
            className={`${styles.navItem} ${
              location.pathname === "/dashboard" ? styles.navActive : ""
            }`}
            onClick={() => setMobileNavOpen(false)}
          >
            <BookOpen size={17} />
            Dashboard
          </Link>
          {sidebarGroups.map((group) => (
            <div className={styles.navGroup} key={group.heading}>
              <p className={styles.groupLabel}>{group.heading}</p>
              {group.items.map(({ label, icon: Icon, href }) => (
                <Link
                  key={label}
                  to={`/admin/${href}`}
                  className={`${styles.navItem} ${
                    location.pathname === `/admin/${href}`
                      ? styles.navActive
                      : ""
                  }`}
                  onClick={() => setMobileNavOpen(false)}
                >
                  <Icon size={17} />
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
        <div className={styles.sidebarBottom}>
          <p className={styles.sidebarMotto}>
            Mengenal warisan,
            <br />
            menghargai keberagaman.
          </p>
          <div className={styles.sidebarUser}>
            <span className={styles.avatar}>RP</span>
            <span>
              <b>Rani Pratiwi</b>
              <small>Administrator</small>
            </span>
          </div>
          <a href="/login" className={styles.logout}>
            <LogOut size={16} />
            Logout
          </a>
        </div>
      </aside>

      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.mobileMenu}
            aria-label="Buka navigasi"
            onClick={() => setMobileNavOpen(true)}
          >
            <Menu size={21} />
          </button>
          <div className={styles.breadcrumb}>
            <span>Dashboard</span>
            <i /> <small>Ruang redaksi</small>
          </div>
          <label className={styles.searchBox}>
            <Search size={17} />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder="Cari konten..."
              aria-label="Cari konten"
            />
            <kbd>⌘ K</kbd>
          </label>
          <div className={styles.topActions}>
            <div className={styles.popoverWrap}>
              <button
                className={styles.iconButton}
                aria-label="Notifikasi"
                aria-expanded={notificationsOpen}
                onClick={() => {
                  setNotificationsOpen(!notificationsOpen)
                  setProfileOpen(false)
                }}
              >
                <Bell size={19} />
                <span className={styles.notificationDot} />
              </button>
              {notificationsOpen && (
                <div className={styles.popover}>
                  <b>Notifikasi</b>
                  <p>
                    <span className={styles.statusDot} />
                    Ada 2 konten draf yang menunggu ditinjau.
                  </p>
                  <button onClick={() => setNotificationsOpen(false)}>
                    Tutup
                  </button>
                </div>
              )}
            </div>
            <span className={styles.topDivider} />
            <div className={styles.popoverWrap}>
              <button
                className={styles.profileButton}
                aria-expanded={profileOpen}
                onClick={() => {
                  setProfileOpen(!profileOpen)
                  setNotificationsOpen(false)
                }}
              >
                <span className={styles.avatar}>RP</span>
                <span>Rani Pratiwi</span>
                <ChevronDown size={15} />
              </button>
              {profileOpen && (
                <div className={`${styles.popover} ${styles.profilePopover}`}>
                  <b>Rani Pratiwi</b>
                  <small>Administrator</small>
                  <a href="/login">
                    <LogOut size={15} />
                    Keluar
                  </a>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className={styles.content}>
          {notice && (
            <div role="status" className={styles.notice}>
              <Check size={16} />
              {notice}
              <button
                aria-label="Tutup pemberitahuan"
                onClick={() => setNotice("")}
              >
                <X size={15} />
              </button>
            </div>
          )}
          <section className={styles.welcome}>
            <div>
              <p className={styles.eyebrow}>Merawat warisan Nusantara</p>
              <h1>Halo, Admin</h1>
              <p className={styles.welcomeText}>
                Setiap konten yang Anda rawat membuka jalan untuk mengenal
                Indonesia.
              </p>
            </div>
            <div className={styles.welcomeAction}>
              <span>Sabtu, 10 Oktober 2026</span>
              <button
                className={styles.primaryButton}
                onClick={() => openForm("add")}
              >
                <Plus size={17} />
                Tambah Konten
              </button>
            </div>
          </section>

          <section
            className={styles.collection}
            aria-labelledby="collection-title"
          >
            <div className={styles.sectionHeading}>
              <h2 id="collection-title">Koleksi budaya</h2>
              <span>620 konten · 7 kategori · +39 bulan ini</span>
            </div>
            <div className={styles.statsGrid}>
              {categories.map(({ label, count, change, icon: Icon }) => (
                <button
                  className={styles.statCard}
                  key={label}
                  onClick={() => chooseMenu(label)}
                  aria-label={`Lihat ${label}, ${count} konten`}
                >
                  <Icon
                    className={styles.statIcon}
                    size={19}
                    strokeWidth={1.9}
                  />
                  <span className={styles.statLabel}>{label}</span>
                  <strong>{count}</strong>
                  <small>+{change} bulan ini</small>
                </button>
              ))}
            </div>
          </section>

          <div className={styles.insightGrid}>
            <section
              className={styles.chartPanel}
              aria-labelledby="region-title"
            >
              <div className={styles.panelHeader}>
                <div>
                  <h2 id="region-title">Konten per Wilayah</h2>
                  <p>Sebaran 620 konten di enam wilayah Nusantara.</p>
                </div>
                <label className={styles.selectWrap}>
                  <span className={styles.srOnly}>Periode grafik</span>
                  <select
                    value={period}
                    onChange={(event) => setPeriod(event.target.value)}
                  >
                    <option>Semua waktu</option>
                    <option>Tahun ini</option>
                    <option>Bulan ini</option>
                  </select>
                  <ChevronDown size={14} />
                </label>
              </div>
              <div
                className={styles.chart}
                role="img"
                aria-label="Grafik batang jumlah konten per wilayah"
              >
                <div className={styles.yAxis}>
                  <span>200</span>
                  <span>150</span>
                  <span>100</span>
                  <span>50</span>
                  <span>0</span>
                </div>
                <div className={styles.plot}>
                  {regions.map((region) => (
                    <div className={styles.barColumn} key={region.label}>
                      <strong
                        className={
                          region.label === "Jawa" ? styles.barValueAccent : ""
                        }
                      >
                        {region.value}
                      </strong>
                      <div
                        className={`${styles.bar} ${
                          region.label === "Jawa" ? styles.barAccent : ""
                        }`}
                        style={{ height: `${region.value * 0.75}px` }}
                      />
                      <span>{region.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <p className={styles.chartNote}>
                <span />
                Jawa memiliki koleksi terbanyak: 182 konten (29,4%).
              </p>
            </section>
            <section
              className={styles.quickPanel}
              aria-labelledby="quick-title"
            >
              <h2 id="quick-title">Aksi cepat</h2>
              <p>Mulai cerita baru dari kategori pilihan.</p>
              <div className={styles.quickGrid}>
                {[
                  ...categories,
                  { label: "Unggah Media", icon: ImagePlus },
                ].map(({ label, icon: Icon }) => (
                  <button
                    key={label}
                    onClick={() =>
                      openForm(
                        "add",
                        undefined,
                        label === "Unggah Media" ? "Lagu Daerah" : label,
                      )
                    }
                  >
                    <Icon size={15} />
                    {label === "Unggah Media"
                      ? "Unggah Media"
                      : `Tambah ${
                          label === "Lagu Daerah"
                            ? "Lagu"
                            : label === "Senjata Tradisional"
                              ? "Senjata"
                              : label === "Pakaian Adat"
                                ? "Pakaian"
                                : label
                        }`}
                  </button>
                ))}
              </div>
              <a
                className={styles.guideLink}
                href="#panduan"
                onClick={(event) => {
                  event.preventDefault()
                  setNotice(
                    "Panduan penulisan konten akan tersedia di ruang redaksi.",
                  )
                }}
              >
                <CircleHelp size={16} />
                Panduan penulisan konten <ArrowRight size={14} />
              </a>
            </section>
          </div>

          <section
            className={styles.tablePanel}
            id="konten-terbaru"
            aria-labelledby="latest-title"
          >
            <div className={styles.tableHeader}>
              <div>
                <h2 id="latest-title">Konten Terbaru</h2>
                <p>
                  {activeCategory === "Semua"
                    ? "Cerita yang baru ditambahkan dan diperbarui oleh tim redaksi."
                    : `Menampilkan koleksi ${activeCategory}.`}
                </p>
              </div>
              <button
                className={styles.allLink}
                onClick={() => {
                  setActiveCategory("Semua")
                  setSearch("")
                  setPage(1)
                }}
              >
                <ArrowDownRight size={16} />
                Lihat semua konten
              </button>
            </div>
            <div className={styles.tableScroll}>
              <table>
                <thead>
                  <tr>
                    <th>Judul konten</th>
                    <th>Kategori</th>
                    <th>Provinsi</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleItems.length ? (
                    visibleItems.slice((page - 1) * 7, page * 7).map((item) => (
                      <tr key={item.id}>
                        <td>
                          <div className={styles.titleCell}>
                            <img src={item.image} alt="" />
                            <span>
                              <b>{item.title}</b>
                              <small>{item.description}</small>
                            </span>
                          </div>
                        </td>
                        <td>{item.category}</td>
                        <td className={styles.mutedCell}>{item.province}</td>
                        <td>
                          <span
                            className={`${styles.status} ${
                              item.status === "Terbit"
                                ? styles.published
                                : styles.draft
                            }`}
                          >
                            <i />
                            {item.status}
                          </span>
                        </td>
                        <td className={styles.mutedCell}>{item.date}</td>
                        <td>
                          <div className={styles.rowActions}>
                            <button onClick={() => openForm("edit", item)}>
                              Edit
                            </button>
                            <button onClick={() => removeItem(item)}>
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6}>
                        <div className={styles.emptyState}>
                          <Search size={20} />
                          <b>Konten tidak ditemukan</b>
                          <span>Coba kata kunci atau kategori yang lain.</span>
                          <button
                            onClick={() => {
                              setSearch("")
                              setActiveCategory("Semua")
                            }}
                          >
                            Reset pencarian
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className={styles.tableFooter}>
              <span>
                Menampilkan{" "}
                {visibleItems.length
                  ? Math.min(visibleItems.length - (page - 1) * 7, 7)
                  : 0}{" "}
                konten terbaru dari 620 konten <em>· Data ilustratif</em>
              </span>
              <div className={styles.pagination}>
                <button
                  aria-label="Halaman sebelumnya"
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                >
                  <ChevronLeft size={15} />
                </button>
                <span>{page}</span>
                <button
                  aria-label="Halaman berikutnya"
                  onClick={() => setPage(page + 1)}
                  disabled={visibleItems.length <= page * 7}
                >
                  <ChevronRight size={15} />
                </button>
              </div>
              <small>
                <span className={styles.syncDot} />
                Diperbarui hari ini, 09.41 WIB
              </small>
            </div>
          </section>
          <footer className={styles.footer}>
            <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
            <span>Data ilustratif · 10 Oktober 2026</span>
          </footer>
        </div>
      </main>

      {modal && (
        <div
          className={styles.modalBackdrop}
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setModal(null)
          }}
        >
          <section
            className={styles.modal}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div className={styles.modalHeader}>
              <div>
                <span className={styles.modalKicker}>
                  {modal === "edit" ? "Perbarui koleksi" : "Ruang redaksi"}
                </span>
                <h2 id="modal-title">
                  {modal === "edit" ? "Edit konten" : "Tambah konten"}
                </h2>
              </div>
              <button
                className={styles.closeButton}
                aria-label="Tutup"
                onClick={() => setModal(null)}
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={saveItem}>
              <label className={styles.formLabel}>
                Judul konten
                <input
                  autoFocus
                  value={formTitle}
                  onChange={(event) => setFormTitle(event.target.value)}
                  placeholder="Contoh: Tari Piring"
                  required
                />
              </label>
              <label className={styles.formLabel}>
                Kategori
                <select
                  value={formCategory}
                  onChange={(event) => setFormCategory(event.target.value)}
                >
                  {categories.map((category) => (
                    <option key={category.label}>{category.label}</option>
                  ))}
                </select>
              </label>
              <div className={styles.formHint}>
                <ImagePlus size={17} />
                <span>
                  Data tersimpan lokal sebagai pratinjau antarmuka. Informasi
                  wilayah dan media dapat dilengkapi kemudian.
                </span>
              </div>
              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setModal(null)}
                >
                  Batal
                </button>
                <button className={styles.primaryButton} type="submit">
                  <Plus size={16} />
                  {modal === "edit"
                    ? "Simpan perubahan"
                    : "Simpan sebagai draf"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
