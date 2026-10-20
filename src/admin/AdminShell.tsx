import { useState, type ReactNode } from "react"
import {
  Bell,
  ChevronDown,
  ChevronLeft,
  Diamond,
  LayoutDashboard,
  LogOut,
  Menu,
  Music2,
  Settings,
  ShieldCheck,
  Image as ImageIcon,
  PersonStanding,
  Drum,
  Swords,
  Shirt,
  House,
  Utensils,
  MapPinned,
} from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import styles from "./AdminShell.module.css"
import { categoryConfigs } from "./categoryConfig"
import type { CategoryKey } from "./types"

const categories: CategoryKey[] = [
  "lagu-daerah",
  "tarian",
  "alat-musik",
  "senjata-tradisional",
  "pakaian-adat",
  "rumah-adat",
  "makanan",
  "daerah-provinsi",
]
const management = [
  { label: "Media Library", href: "/admin/media-library", icon: ImageIcon },
  { label: "Pengguna Admin", href: "/admin/pengguna-admin", icon: ShieldCheck },
  { label: "Pengaturan", href: "/admin/pengaturan", icon: Settings },
]

export default function AdminShell({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const location = useLocation()
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const activeCategory = categories.find((key) =>
    location.pathname.startsWith(`/admin/${key}`),
  )
  const navClass = `${styles.sidebar} ${collapsed ? styles.collapsed : ""} ${
    mobileOpen ? styles.mobileOpen : ""
  }`
  const categoryIcons = [
    Music2,
    PersonStanding,
    Drum,
    Swords,
    Shirt,
    House,
    Utensils,
    MapPinned,
  ]

  return (
    <div className={styles.shell}>
      {mobileOpen && (
        <button
          className={styles.scrim}
          aria-label="Tutup navigasi"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <aside className={navClass}>
        <Link
          to="/"
          className={styles.brand}
          onClick={() => setMobileOpen(false)}
        >
          <span className={styles.brandMark}>
            <Diamond size={22} />
          </span>
          <span>Budaya Indonesia</span>
        </Link>
        <div className={styles.sidebarTitle}>
          Panel Admin{" "}
          <button
            aria-label={collapsed ? "Buka sidebar" : "Ciutkan sidebar"}
            onClick={() => setCollapsed(!collapsed)}
            className={styles.collapse}
          >
            <ChevronLeft size={17} />
          </button>
        </div>
        <nav className={styles.nav} aria-label="Navigasi admin">
          <div className={styles.navGroup}>
            <Link
              to="/dashboard"
              className={`${styles.navItem} ${
                location.pathname === "/dashboard" ? styles.active : ""
              }`}
              title="Dashboard"
              onClick={() => setMobileOpen(false)}
            >
              <LayoutDashboard size={18} />
              <span>Dashboard</span>
            </Link>
          </div>
          <div className={styles.groupLabel}>Koleksi Budaya</div>
          {categories.map((key, index) => {
            const config = categoryConfigs[key]
            const Icon = categoryIcons[index]
            return (
              <Link
                key={key}
                to={`/admin/${key}`}
                className={`${styles.navItem} ${
                  activeCategory === key ? styles.active : ""
                }`}
                title={config.title}
                aria-current={activeCategory === key ? "page" : undefined}
                onClick={() => setMobileOpen(false)}
              >
                <Icon size={18} />
                <span>{config.title}</span>
              </Link>
            )
          })}
          <div className={styles.groupLabel}>Pengelolaan</div>
          {management.map(({ label, href, icon: Icon }) => (
            <Link
              key={href}
              to={href}
              className={`${styles.navItem} ${
                location.pathname === href ? styles.active : ""
              }`}
              title={label}
              onClick={() => setMobileOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
        {!collapsed && (
          <div className={styles.sidebarBottom}>
            <p className={styles.motto}>
              Mengenal warisan,
              <br />
              menghargai keberagaman.
            </p>
            <div className={styles.user}>
              <span className={styles.avatar}>RP</span>
              <span className={styles.userInfo}>
                <b>Rani Pratiwi</b>
                <small>Administrator</small>
              </span>
              <ChevronDown size={15} />
            </div>
            <button className={styles.logout}>
              <LogOut size={17} />
              <span>Logout</span>
            </button>
          </div>
        )}
      </aside>
      <main className={styles.main}>
        <header className={styles.topbar}>
          <button
            className={styles.menuButton}
            aria-label="Buka navigasi"
            onClick={() => setMobileOpen(true)}
          >
            <Menu size={20} />
          </button>
          <div className={styles.breadcrumb}>
            <strong>{title}</strong>
            <span>Ruang redaksi</span>
          </div>
          <label className={styles.globalSearch}>
            <span className="sr-only">Cari konten</span>
            <input placeholder="Cari konten..." />
          </label>
          <button className={styles.iconButton} aria-label="Notifikasi">
            <Bell size={19} />
            <i />
          </button>
          <span className={styles.topDivider} />
          <span className={styles.avatar}>RP</span>
          <span className={styles.topUser}>Rani Pratiwi</span>
          <ChevronDown size={15} className={styles.topChevron} />
        </header>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  )
}
