import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"
import { getApiBaseUrl } from "../api"

const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)

type Dish = {
  id: string | number
  name: string
  category: string
  region: string
  description: string
  ingredients: string
  image?: string
}

/* ---------- Data dari database (API) ---------- */

function resolveImage(image?: string) {
  if (!image) return undefined
  if (image.startsWith("http")) return image.replace(/^http:\/\//, "https://")
  if (image.startsWith("/")) return `${API_URL}${image}`
  return image
}

function useDishes() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_URL}/v1/foods`, {
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        "ngrok-skip-browser-warning": "true",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        const list = Array.isArray(json) ? json : json.data
        setDishes(
          (list ?? []).map((item: any) => ({
            id: item.id ?? item.name,
            name: item.name ?? "",
            category:
              typeof item.category === "string"
                ? item.category
                : (item.category?.name ?? ""),
            region: item.province?.name ?? "",
            description: item.description ?? "",
            ingredients: Array.isArray(item.ingredients)
              ? item.ingredients.join(", ")
              : (item.ingredients ?? ""),
            image: resolveImage(item.image_url),
          })),
        )
        setError(null)
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [])

  return { dishes, loading, error }
}

// Gambar diambil lewat fetch supaya lolos halaman peringatan ngrok
function DishImage({ src, alt }: { src?: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string>()

  useEffect(() => {
    if (!src) return
    const controller = new AbortController()
    let objectUrl: string | undefined

    fetch(src, {
      signal: controller.signal,
      headers: { "ngrok-skip-browser-warning": "true" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
      })
      .catch(() => { })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src])

  if (!blobUrl) return <div className="h-full w-full bg-[#eee7da]" />

  return (
    <img
      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
      src={blobUrl}
      alt={alt}
    />
  )
}

/* ---------- Ikon ---------- */

function BookIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 5.5c2.7-.8 5.3-.3 8 1.4v12c-2.7-1.7-5.3-2.2-8-1.4v-12Z"
        stroke="currentColor"
      />
      <path
        d="M20 5.5c-2.7-.8-5.3-.3-8 1.4v12c2.7-1.7 5.3-2.2 8-1.4v-12Z"
        stroke="currentColor"
      />
    </svg>
  )
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M4 10h11M11 6l4 4-4 4"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* ---------- Halaman ---------- */

export default function MakananPage() {
  const { dishes, loading, error } = useDishes()

  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Semua daerah")
  const [category, setCategory] = useState("Semua masakan")
  const [sort, setSort] = useState("Pilihan Jelajahin")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  // Daftar provinsi & kategori diambil dari data, bukan ditulis manual
  const regions = useMemo(
    () => [
      "Semua daerah",
      ...Array.from(new Set(dishes.map((d) => d.region).filter(Boolean))),
    ],
    [dishes],
  )

  const categories = useMemo(
    () => [
      "Semua masakan",
      ...Array.from(new Set(dishes.map((d) => d.category).filter(Boolean))),
    ],
    [dishes],
  )

  const filteredDishes = useMemo(() => {
    const result = dishes.filter((dish) => {
      const searchable =
        `${dish.name} ${dish.region} ${dish.category} ${dish.description} ${dish.ingredients}`.toLowerCase()
      return (
        searchable.includes(query.toLowerCase()) &&
        (region === "Semua daerah" || dish.region === region) &&
        (category === "Semua masakan" || dish.category === category)
      )
    })
    return sort === "Nama A–Z"
      ? [...result].sort((a, b) => a.name.localeCompare(b.name))
      : result
  }, [dishes, category, query, region, sort])

  const scrollToExplore = () =>
    document.getElementById("jelajah")?.scrollIntoView({ behavior: "smooth" })

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#312b27]">
      <header className="sticky top-0 z-30 border-b border-[#e8e0d3] bg-[#f7f3eb]/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link
            to="/"
            className="flex items-center gap-2.5"
            aria-label="Jelajahin"
          >
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#b84c37] text-[#fffaf2]">
              <BookIcon className="h-4 w-4" />
            </span>
            <span className="font-display text-[22px]">jelajahin</span>
          </Link>

          <nav className="hidden h-full items-center gap-9 text-[13px] text-[#756d65] md:flex">
            <a className="nav-active" href="#jelajah">
              Jelajahi makanan
            </a>
            <a className="transition hover:text-[#b84c37]" href="#daerah">
              Jelajah daerah
            </a>
            <a className="transition hover:text-[#b84c37]" href="#cerita">
              Cerita kuliner
            </a>
            <a className="transition hover:text-[#b84c37]" href="#tentang">
              Tentang Jelajahin
            </a>
          </nav>

          <button
            className="hidden items-center gap-2 text-[13px] transition hover:text-[#b84c37] md:flex"
            onClick={() => setSaved((value) => !value)}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill={saved ? "currentColor" : "none"}
            >
              <path
                d="M5 3.5h10v13L10 13l-5 3.5v-13Z"
                stroke="currentColor"
                strokeLinejoin="round"
              />
            </svg>
            {saved ? "Tersimpan" : "Simpan"}
          </button>
          <button
            className="grid h-10 w-10 place-items-center md:hidden"
            onClick={() => setMobileOpen((value) => !value)}
            aria-label="Buka menu"
          >
            <span className="space-y-1.5">
              <i className="block h-px w-5 bg-current" />
              <i className="block h-px w-5 bg-current" />
              <i className="block h-px w-5 bg-current" />
            </span>
          </button>
        </div>
        {mobileOpen && (
          <nav className="border-t border-[#e8e0d3] px-5 py-4 text-sm md:hidden">
            {[
              "Jelajahi makanan",
              "Jelajah daerah",
              "Cerita kuliner",
              "Tentang Jelajahin",
            ].map((item) => (
              <a
                className="block py-2"
                href="#jelajah"
                key={item}
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
          </nav>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-12 lg:py-9">
          <div className="max-w-[670px] lg:py-12">
            <p className="eyebrow">Dari dapur lokal, untuk penjelajah rasa</p>
            <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[58px] lg:text-[66px]">
              Beda daerah, beda rasa.
              <br />
              Semuanya Indonesia.
            </h1>
            <p className="mt-6 max-w-[590px] text-[15px] leading-7 text-[#716a62] sm:text-base">
              Jelajahi makanan khas dari Sumatra hingga Papua. Kenali asalnya,
              temukan ceritanya, dan pilih rasa yang ingin kamu coba.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button className="primary-button" onClick={scrollToExplore}>
                Mulai jelajah makanan
              </button>
              <button className="text-link" onClick={scrollToExplore}>
                Pilih daerah asal <ArrowRight />
              </button>
            </div>
          </div>

          <figure className="group relative h-[330px] overflow-hidden rounded-[18px] sm:h-[430px] lg:h-[440px]">
            <img
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
              src="https://images.unsplash.com/photo-1539755530862-00f623c00f52?auto=format&fit=crop&w=1400&q=90"
              alt="Beragam hidangan Indonesia tersaji di atas meja"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <figcaption className="absolute bottom-7 left-7 text-white sm:bottom-9 sm:left-9">
              <span className="text-[10px] font-bold uppercase tracking-[.22em]">
                Sepiring cerita Nusantara
              </span>
              <p className="mt-2 font-display text-2xl sm:text-[28px]">
                Kaya rempah. Dekat dengan rumah.
              </p>
            </figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12">
          <div className="grid gap-4 rounded-2xl bg-[#eee7da] p-5 md:grid-cols-[2fr_1fr] md:p-6">
            <label className="filter-label">
              Mau menjelajah rasa apa?
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="filter-input"
                placeholder="Cari makanan, bahan, atau daerah asal..."
              />
              <span>Contoh: “rendang”, “sagu”, atau “Makassar”</span>
            </label>
            <label className="filter-label">
              Provinsi asal
              <select
                className="filter-input"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
              >
                {regions.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
              <span>Sesuaikan pencarian berdasarkan provinsi.</span>
            </label>
          </div>
        </section>

        <section
          id="jelajah"
          className="mx-auto max-w-[1440px] px-5 pb-20 pt-6 sm:px-8 lg:px-12"
        >
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside id="daerah">
              <h2 className="font-display text-[28px]">Jelajah per daerah</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#776f67]">
                Mulai dari daerah yang membuatmu penasaran.
              </p>
              {/* <div className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
                {regions.map((item) => (
                  <button
                    key={item}
                    onClick={() => setRegion(item)}
                    className={`region-button ${region === item ? "active" : ""
                      }`}
                  >
                    <BookIcon className="h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </button>
                ))}
              </div> */}
              <div className="mt-7 hidden rounded-xl bg-[#eee7da] p-5 lg:block">
                <BookIcon className="h-7 w-7 text-[#b84c37]" />
                <h3 className="mt-3 font-display text-xl">
                  Satu rasa, banyak cerita
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#776f67]">
                  Beberapa makanan hidup di lebih dari satu daerah. Lokasi asal
                  menunjukkan akar ceritanya.
                </p>
                <button
                  className="mt-4 text-link"
                  onClick={() => setRegion("Semua daerah")}
                >
                  Lihat semua provinsi <ArrowRight />
                </button>
              </div>
            </aside>

            <div>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-[34px] sm:text-[40px]">
                    Temukan rasa Nusantara
                  </h2>
                  <p className="mt-1 text-[13px] text-[#776f67]">
                    {filteredDishes.length} masakan ditemukan
                  </p>
                </div>
                <label className="flex items-center gap-2 text-[12px] text-[#776f67]">
                  Urutkan:
                  <select
                    className="bg-transparent font-medium text-[#312b27] outline-none"
                    value={sort}
                    onChange={(event) => setSort(event.target.value)}
                  >
                    <option>Pilihan Jelajahin</option>
                    <option>Nama A–Z</option>
                  </select>
                </label>
              </div>

              {categories.length > 1 && (
                <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => setCategory(item)}
                      className={`category-pill ${category === item ? "active" : ""
                        }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <p className="mt-6 text-sm text-[#776f67]">Memuat data...</p>
              )}
              {error && (
                <p className="mt-6 text-sm text-[#b84c37]">
                  Gagal memuat data: {error}
                </p>
              )}

              {!loading && !error && filteredDishes.length > 0 && (
                <div className="mt-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredDishes.map((dish) => (
                    <article className="dish-card group" key={dish.id}>
                      <div className="h-[210px] overflow-hidden sm:h-[190px] xl:h-[205px]">
                        <DishImage src={dish.image} alt={dish.name} />
                      </div>
                      <div className="flex min-h-[230px] flex-col p-5">
                        <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#b84c37]">
                          <span>{dish.category}</span>
                          <span>{dish.region}</span>
                        </div>
                        <h3 className="mt-4 font-display text-[28px] leading-none">
                          {dish.name}
                        </h3>
                        <p className="mt-3 text-[13px] leading-5 text-[#716a62]">
                          {dish.description}
                        </p>
                        {/* {dish.ingredients && (
                          // <p className="mt-3 text-[11px] text-[#958b80]">
                          //   Bahan: {dish.ingredients}
                          // </p>
                        )} */}
                        <button className="card-link mt-auto">
                          Kenali makanan <ArrowRight />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loading && !error && filteredDishes.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-[#d5c8b7] px-6 py-20 text-center">
                  <p className="font-display text-2xl">
                    Belum ada rasa yang cocok
                  </p>
                  <p className="mt-2 text-sm text-[#776f67]">
                    Coba kata kunci atau daerah lain.
                  </p>
                  <button
                    className="secondary-button mt-5"
                    onClick={() => {
                      setQuery("")
                      setRegion("Semua daerah")
                      setCategory("Semua masakan")
                    }}
                  >
                    Atur ulang filter
                  </button>
                </div>
              )}

              <div className="mt-10 text-center">
                <p className="text-[12px] text-[#8a8179]">
                  Menampilkan {filteredDishes.length} masakan · Masih banyak
                  rasa untuk dijelajahi
                </p>
                <button
                  className="secondary-button mt-4"
                  onClick={() => setCategory("Semua masakan")}
                >
                  Jelajahi lebih banyak makanan
                </button>
                <p className="mt-4 text-[11px] text-[#a09890]">
                  Katalog akan terus diperbarui dengan kekayaan makanan
                  Indonesia.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
