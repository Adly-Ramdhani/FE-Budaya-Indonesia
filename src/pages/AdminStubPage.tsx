import { useParams } from "react-router-dom"
import AdminShell from "../admin/AdminShell"
import { categoryConfigs, isCategoryKey } from "../admin/categoryConfig"
import styles from "./AdminStubPage.module.css"

const titles: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/media-library": "Media Library",
  "/admin/pengguna-admin": "Pengguna Admin",
  "/admin/pengaturan": "Pengaturan",
}

export function AdminStaticStub({ path }: { path: string }) {
  return (
    <AdminShell title={titles[path] ?? "Halaman Admin"}>
      <Stub title={titles[path] ?? "Halaman Admin"} />
    </AdminShell>
  )
}

export function AdminFormStub({ mode }: { mode: "create" | "edit" }) {
  const { category, slug } = useParams()
  const valid = isCategoryKey(category)
  const config = valid ? categoryConfigs[category] : undefined
  const title =
    mode === "create"
      ? `Tambah ${config?.singular ?? "konten"}`
      : `Edit ${slug ?? "konten"}`
  return (
    <AdminShell title={config?.title ?? "Koleksi Budaya"}>
      <Stub title={title} />
    </AdminShell>
  )
}

function Stub({ title }: { title: string }) {
  return (
    <section className={styles.stub}>
      <span className={styles.eyebrow}>Ruang redaksi · Budaya Indonesia</span>
      <h1>{title}</h1>
      <div className={styles.rule} />
      <h2>Segera hadir</h2>
      <p>Halaman ini sudah disiapkan sebagai bagian dari ruang kerja admin.</p>
    </section>
  )
}
