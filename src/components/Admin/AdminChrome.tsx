import { useState } from "react"
import {
  Bell,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  Drum,
  House,
  ImagePlus,
  LogOut,
  Menu,
  Music2,
  PersonStanding,
  Search,
  Settings,
  Shield,
  Shirt,
  Swords,
  Utensils,
  Users,
} from "lucide-react"
import styles from "../../pages/AdminDashboard.module.css"

const navigationGroups = [
  {
    heading: "Koleksi budaya",
    items: [
      { label: "Lagu Daerah", icon: Music2 },
      { label: "Tarian", icon: PersonStanding },
      { label: "Alat Musik", icon: Drum },
      { label: "Senjata Tradisional", icon: Swords },
      { label: "Pakaian Adat", icon: Shirt },
      { label: "Rumah Adat", icon: House },
      { label: "Makanan", icon: Utensils },
    ],
  },
  {
    heading: "Pengelolaan",
    items: [
      { label: "Media Library", icon: ImagePlus },
      { label: "Pengguna Admin", icon: Users },
      { label: "Pengaturan", icon: Settings },
    ],
  },
]

export function AdminSidebar({
  activeItem,
  open,
  onClose,
  onSelect,
}: {
  activeItem: string
  open: boolean
  onClose: () => void
  onSelect: (label: string) => void
}) {
  return (
    <>
      <button
        className={`${styles.scrim} ${open ? styles.scrimVisible : ""}`}
        aria-label="Tutup navigasi"
        onClick={onClose}
      />
      <aside className={`${styles.sidebar} ${open ? styles.sidebarOpen : ""}`}>
        <a href="/" className={styles.brand} aria-label="Budaya Indonesia, beranda">
          <span className={styles.brandMark}>
            <Shield size={23} strokeWidth={1.55} />
          </span>
          <span>Budaya Indonesia</span>
        </a>
        <div className={styles.sidebarLabel}>Panel admin</div>
        <button
          className={styles.collapseButton}
          aria-label="Tutup menu"
          onClick={onClose}
        >
          <ChevronLeft size={17} />
        </button>
        <nav className={styles.navigation} aria-label="Navigasi admin">
          <button
            className={`${styles.navItem} ${activeItem === "Dashboard" ? styles.navActive : ""}`}
            onClick={() => onSelect("Dashboard")}
          >
            <BookOpen size={17} />
            Dashboard
          </button>
          {navigationGroups.map((group) => (
            <div className={styles.navGroup} key={group.heading}>
              <p className={styles.groupLabel}>{group.heading}</p>
              {group.items.map(({ label, icon: Icon }) => (
                <button
                  key={label}
                  className={`${styles.navItem} ${activeItem === label ? styles.navActive : ""}`}
                  onClick={() => {
                    onSelect(label)
                    onClose()
                  }}
                >
                  <Icon size={17} />
                  {label}
                </button>
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
    </>
  )
}

export function AdminTopbar({
  title,
  search,
  searchPlaceholder = "Cari konten...",
  onSearchChange,
  onOpenMenu,
}: {
  title: string
  search: string
  searchPlaceholder?: string
  onSearchChange: (value: string) => void
  onOpenMenu: () => void
}) {
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)

  return (
    <header className={styles.topbar}>
      <button
        className={styles.mobileMenu}
        aria-label="Buka navigasi"
        onClick={onOpenMenu}
      >
        <Menu size={21} />
      </button>
      <div className={styles.breadcrumb}>
        <span>{title}</span>
        <i />
        <small>Ruang redaksi</small>
      </div>
      <label className={styles.searchBox}>
        <Search size={17} />
        <input
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
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
              setNotificationsOpen((value) => !value)
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
              <button onClick={() => setNotificationsOpen(false)}>Tutup</button>
            </div>
          )}
        </div>
        <span className={styles.topDivider} />
        <div className={styles.popoverWrap}>
          <button
            className={styles.profileButton}
            aria-expanded={profileOpen}
            onClick={() => {
              setProfileOpen((value) => !value)
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
  )
}
