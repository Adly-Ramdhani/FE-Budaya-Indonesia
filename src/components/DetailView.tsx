import { Link, useParams } from "react-router-dom"

export default function DetailView() {
  const { category } = useParams()

  return (
    <main className="shell" style={{ padding: "48px 0" }}>
      <Link to="/">← Kembali ke beranda</Link>
      <h1 style={{ marginTop: 24 }}>Halaman detail: {category}</h1>
      <p style={{ marginTop: 12 }}>
        Ini halaman contoh. Kalau kamu bisa melihat tulisan ini, berarti link dan
        router sudah berjalan dengan benar.
      </p>
    </main>
  )
}