import { useMemo, useState } from "react"
import "../styles/musik.admin.css";

type Instrument = {
  id: number | string
  name: string
  province: string
  region: string
  status: string
  description: string
  updated: string
  image: string
}

type IconName = "book" | "grid" | "search" | "bell" | "chevron" | "plus" | "list" | "edit" | "trash" | "arrow" | "logout" | "menu" | "close"

const instruments: Instrument[] = [
  {
    id: 1,
    name: "Angklung",
    province: "Jawa Barat",
    region: "Jawa",
    status: "Terbit",
    description:
      "Bambu yang digoyangkan, nada yang berpadu. Harmoni lahir dari kebersamaan.",
    updated: "10 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1558299244-f4bb4dd735b2?auto=format&fit=crop&w=1000&q=88",
  },
  {
    id: 2,
    name: "Sasando",
    province: "Nusa Tenggara Timur",
    region: "Bali & Nusa Tenggara",
    status: "Draf",
    description:
      "Dawai dari Pulau Rote dengan resonator daun lontar. Bunyinya lembut dan berlapis.",
    updated: "09 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1670179716479-93dadc7a6093?auto=format&fit=crop&w=1000&q=88",
  },
  {
    id: 3,
    name: "Kolintang",
    province: "Sulawesi Utara",
    region: "Sulawesi",
    status: "Terbit",
    description:
      "Bilah kayu masyarakat Minahasa, dimainkan dalam ansambel melodi dan iringan.",
    updated: "08 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1752760023188-f8e277034cc3?auto=format&fit=crop&w=1000&q=88",
  },
  {
    id: 4,
    name: "Saluang",
    province: "Sumatra Barat",
    region: "Sumatra",
    status: "Terbit",
    description:
      "Seruling bambu Minangkabau yang mengiringi dendang dan cerita masyarakat.",
    updated: "07 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1761848022288-7ccce249d1f4?auto=format&fit=crop&w=1000&q=88",
  },
  {
    id: 5,
    name: "Tifa",
    province: "Papua",
    region: "Papua",
    status: "Draf",
    description:
      "Tabuhan yang menyatukan irama, tarian, dan upacara dalam kehidupan masyarakat.",
    updated: "06 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1752760023111-aed0c41f11f9?auto=format&fit=crop&w=1000&q=88",
  },
  {
    id: 6,
    name: "Gamelan",
    province: "Jawa Tengah",
    region: "Jawa",
    status: "Terbit",
    description:
      "Gong dan bilah logam berpadu dalam tradisi karawitan yang diwariskan lintas generasi.",
    updated: "05 Okt 2026",
    image:
      "https://images.unsplash.com/photo-1670179716382-42dfa4f0d5b4?auto=format&fit=crop&w=1000&q=88",
  },
]

const menuGroups = [
  {
    title: "",
    items: ["Dashboard"],
  },
  {
    title: "Koleksi Budaya",
    items: [
      "Lagu Daerah",
      "Tarian",
      "Alat Musik",
      "Senjata Tradisional",
      "Pakaian Adat",
      "Rumah Adat",
      "Makanan",
      "Daerah & Provinsi",
    ],
  },
  {
    title: "Pengelolaan",
    items: ["Media Library", "Pengguna Admin", "Pengaturan"],
  },
]

function Icon({ name, className = "" }: { name: IconName; className?: string }) {
  const paths: Record<IconName, React.ReactNode> = {
    book: (
      <>
        <path d="M4 5.3c2.7-.8 5.3-.3 8 1.5v12c-2.7-1.8-5.3-2.3-8-1.5v-12Z" />
        <path d="M20 5.3c-2.7-.8-5.3-.3-8 1.5v12c2.7-1.8 5.3-2.3 8-1.5v-12Z" />
      </>
    ),
    grid: (
      <>
        <rect x="4" y="4" width="6" height="6" rx="1" />
        <rect x="14" y="4" width="6" height="6" rx="1" />
        <rect x="4" y="14" width="6" height="6" rx="1" />
        <rect x="14" y="14" width="6" height="6" rx="1" />
      </>
    ),
    search: (
      <path d="m20 20-4.3-4.3m2.3-5.2a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z" />
    ),
    bell: <path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Zm-8 11h4" />,
    chevron: <path d="m8 10 4 4 4-4" />,
    plus: <path d="M12 5v14M5 12h14" />,
    list: <path d="M9 6h11M9 12h11M9 18h11M4 6h.01M4 12h.01M4 18h.01" />,
    edit: <path d="m14 5 5 5M4 20l3.5-.7L19 7.8 16.2 5 4.7 16.5 4 20Z" />,
    trash: <path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m4 4v5m4-5v5" />,
    arrow: <path d="M5 12h14m-5-5 5 5-5 5" />,
    logout: <path d="M10 5H4v14h6m5-4 4-4-4-4m4 4H9" />,
    menu: <path d="M4 7h16M4 12h16M4 17h16" />,
    close: <path d="m6 6 12 12M18 6 6 18" />,
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  )
}

function Sidebar({
  open,
  close,
  onSelect,
}: {
  open: boolean
  close: () => void
  onSelect: (label: string) => void
}) {
  return (
    <>
      {open && (
        <button
          className="sidebar-scrim"
          onClick={close}
          aria-label="Tutup menu"
        />
      )}
      <aside className={`sidebar ${open ? "is-open" : ""}`}>
        <div className="brand">
          <span className="brand-mark">
            <i />
            <i />
          </span>
          <span className="font-serif text-[19px]">Budaya Indonesia</span>
          <button
            className="ml-auto lg:hidden"
            onClick={close}
            aria-label="Tutup sidebar"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>
        <div className="panel-label">
          <span>Panel Admin</span>
          <span className="panel-key">⌘</span>
        </div>

        <nav className="sidebar-nav">
          {menuGroups.map((group, index) => (
            <div className="nav-group" key={group.title || index}>
              {group.title && <p>{group.title}</p>}
              {group.items.map((item) => (
                <button
                  key={item}
                  className={`nav-item ${
                    item === "Alat Musik" ? "active" : ""
                  }`}
                  onClick={() => {
                    onSelect(item)
                    close()
                  }}
                >
                  <Icon name={item === "Dashboard" ? "grid" : "book"} />
                  <span>{item}</span>
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <p className="font-serif text-[17px] leading-6 text-[#d5dbd2]">
            Mengenal warisan,
            <br />
            menghargai keberagaman.
          </p>
          <div className="admin-mini">
            <span className="avatar dark">RP</span>
            <span>
              <b>Rani Pratiwi</b>
              <small>Administrator</small>
            </span>
          </div>
          <button
            className="nav-item logout"
            onClick={() => onSelect("Anda telah keluar")}
          >
            <Icon name="logout" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  )
}

function InstrumentCard({
  instrument,
  view,
  onAction,
  onDelete,
}: {
  instrument: Instrument
  view: "grid" | "list"
  onAction: (message: string) => void
  onDelete: (instrument: Instrument) => void
}) {
  return (
    <article
      className={`instrument-card ${view === "list" ? "list-card" : ""}`}
    >
      <img src={instrument.image} alt={`Alat musik ${instrument.name}`} />
      <div className="card-content">
        <div className="card-meta">
          <span>{instrument.province}</span>
          <span
            className={`status ${instrument.status === "Draf" ? "draft" : ""}`}
          >
            <i />
            {instrument.status}
          </span>
        </div>
        <h3>{instrument.name}</h3>
        <p className="card-description">{instrument.description}</p>
        <p className="updated">Diperbarui {instrument.updated}</p>
        <button
          className="preview-link"
          onClick={() => onAction(`Pratinjau ${instrument.name} dibuka`)}
        >
          Lihat pratinjau <Icon name="arrow" />
        </button>
      </div>
      <div className="card-actions">
        <button onClick={() => onAction(`${instrument.name} siap diedit`)}>
          <Icon name="edit" /> Edit
        </button>
        <button className="danger" onClick={() => onDelete(instrument)}>
          <Icon name="trash" /> Hapus
        </button>
      </div>
    </article>
  )
}

export default function MusikPage() {
  const [items, setItems] = useState(instruments)
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Semua wilayah")
  const [province, setProvince] = useState("Semua provinsi")
  const [status, setStatus] = useState("Semua status")
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [toast, setToast] = useState("")
  const [newName, setNewName] = useState("")

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 2600)
  }

  const filtered = useMemo(
    () =>
      items.filter((item) => {
        const text =
          `${item.name} ${item.description} ${item.province}`.toLowerCase()
        return (
          text.includes(query.toLowerCase()) &&
          (region === "Semua wilayah" || item.region === region) &&
          (province === "Semua provinsi" || item.province === province) &&
          (status === "Semua status" || item.status === status)
        )
      }),
    [items, province, query, region, status],
  )

  const addInstrument = (event: React.FormEvent) => {
    event.preventDefault()
    if (!newName.trim()) return
    setItems((current) => [
      {
        id: Date.now(),
        name: newName,
        province: "Jawa Barat",
        region: "Jawa",
        status: "Draf",
        description:
          "Deskripsi alat musik baru siap dilengkapi oleh pengelola konten.",
        updated: "Hari ini",
        image:
          "https://images.unsplash.com/photo-1670179716487-5acdf98c9646?auto=format&fit=crop&w=1000&q=88",
      },
      ...current,
    ])
    setNewName("")
    setModalOpen(false)
    notify("Alat musik baru berhasil ditambahkan")
  }

  return (
    <div className="admin-shell">
      <Sidebar
        open={sidebarOpen}
        close={() => setSidebarOpen(false)}
        onSelect={notify}
      />

      <div className="main-column">
        <header className="topbar">
          <div className="topbar-title">
            <button
              className="menu-button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Buka menu"
            >
              <Icon name="menu" />
            </button>
            <h1>Alat Musik</h1>
            <span>Ruang redaksi</span>
          </div>
          <div className="topbar-tools">
            <label className="header-search">
              <Icon name="search" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Cari konten..."
              />
            </label>
            <button
              className="bell-button"
              onClick={() => notify("Tidak ada notifikasi baru")}
              aria-label="Notifikasi"
            >
              <Icon name="bell" />
              <i />
            </button>
            <div className="profile-wrap">
              <button
                className="profile-button"
                onClick={() => setProfileOpen((value) => !value)}
              >
                <span className="avatar">RP</span>
                <span className="profile-name">Rani Pratiwi</span>
                <Icon name="chevron" />
              </button>
              {profileOpen && (
                <div className="profile-menu">
                  <button onClick={() => notify("Profil dibuka")}>
                    Profil saya
                  </button>
                  <button onClick={() => notify("Pengaturan dibuka")}>
                    Pengaturan
                  </button>
                  <button onClick={() => notify("Anda telah keluar")}>
                    Keluar
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="content">
          <section className="page-heading">
            <div>
              <p>Koleksi Budaya / Pengelolaan Konten</p>
              <h2>Alat Musik</h2>
              <span>Rawat cerita di balik bunyi dan harmoni Nusantara.</span>
            </div>
            <button className="add-button" onClick={() => setModalOpen(true)}>
              <Icon name="plus" /> Tambah Alat Musik
            </button>
          </section>

          <section className="filters">
            <label className="search-field">
              <span>Cari alat musik</span>
              <div>
                <Icon name="search" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Cari nama atau deskripsi..."
                />
              </div>
            </label>
            <label>
              <span>Wilayah</span>
              <select
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                <option>Semua wilayah</option>
                <option>Sumatra</option>
                <option>Jawa</option>
                <option>Bali & Nusa Tenggara</option>
                <option>Sulawesi</option>
                <option>Papua</option>
              </select>
            </label>
            <label>
              <span>Provinsi</span>
              <select
                value={province}
                onChange={(event) => setProvince(event.target.value)}
              >
                <option>Semua provinsi</option>
                {Array.from(new Set(items.map((item) => item.province))).map(
                  (item) => (
                    <option key={item}>{item}</option>
                  ),
                )}
              </select>
            </label>
            <label>
              <span>Status</span>
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value)}
              >
                <option>Semua status</option>
                <option>Terbit</option>
                <option>Draf</option>
              </select>
            </label>
            <div className="view-filter">
              <span>Tampilan</span>
              <div>
                <button
                  className={view === "grid" ? "active" : ""}
                  onClick={() => setView("grid")}
                  aria-label="Tampilan grid"
                >
                  <Icon name="grid" />
                </button>
                <button
                  className={view === "list" ? "active" : ""}
                  onClick={() => setView("list")}
                  aria-label="Tampilan daftar"
                >
                  <Icon name="list" />
                </button>
              </div>
            </div>
          </section>

          <section className="result-bar">
            <b>{filtered.length} alat musik</b>
            <span>62 terbit · 12 draf</span>
            <span>Urutan: Terakhir diperbarui</span>
          </section>

          {filtered.length ? (
            <section
              className={`instrument-grid ${
                view === "list" ? "list-view" : ""
              }`}
            >
              {filtered.map((instrument) => (
                <InstrumentCard
                  key={instrument.id}
                  instrument={instrument}
                  view={view}
                  onAction={notify}
                  onDelete={(selected) => {
                    setItems((current) =>
                      current.filter((item) => item.id !== selected.id),
                    )
                    notify(`${selected.name} dihapus dari daftar`)
                  }}
                />
              ))}
            </section>
          ) : (
            <section className="empty-state">
              <Icon name="search" />
              <h3>Konten tidak ditemukan</h3>
              <p>Coba ubah kata kunci atau filter yang digunakan.</p>
              <button
                onClick={() => {
                  setQuery("")
                  setRegion("Semua wilayah")
                  setProvince("Semua provinsi")
                  setStatus("Semua status")
                }}
              >
                Atur ulang filter
              </button>
            </section>
          )}

          <section className="pagination-wrap">
            <p>Menampilkan 1–{filtered.length} dari 74 alat musik</p>
            <div className="pagination">
              <button aria-label="Halaman sebelumnya">‹</button>
              <button className="active">1</button>
              <button>2</button>
              <button>3</button>
              <span>...</span>
              <button>13</button>
              <button aria-label="Halaman berikutnya">›</button>
            </div>
          </section>
        </main>

        <footer>
          <span>© 2026 Budaya Indonesia · Merawat cerita bersama.</span>
          <span>Data ilustratif · 10 Oktober 2026</span>
        </footer>
      </div>

      {modalOpen && (
        <div className="modal-backdrop" onMouseDown={() => setModalOpen(false)}>
          <form
            className="modal"
            onSubmit={addInstrument}
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <p>Koleksi Budaya</p>
                <h3>Tambah Alat Musik</h3>
              </div>
              <button type="button" onClick={() => setModalOpen(false)}>
                <Icon name="close" />
              </button>
            </div>
            <label>
              Nama alat musik
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="Contoh: Talempong"
              />
            </label>
            <label>
              Provinsi
              <select>
                <option>Jawa Barat</option>
                <option>Sumatra Barat</option>
                <option>Papua</option>
              </select>
            </label>
            <div className="modal-actions">
              <button type="button" onClick={() => setModalOpen(false)}>
                Batal
              </button>
              <button className="save" type="submit">
                Simpan sebagai draf
              </button>
            </div>
          </form>
        </div>
      )}

      {toast && (
        <div className="toast">
          <i />
          {toast}
        </div>
      )}
    </div>
  )
}
