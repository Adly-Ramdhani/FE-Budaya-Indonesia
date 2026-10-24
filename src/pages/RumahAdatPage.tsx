import { Link } from "react-router-dom"
import { useEffect, useMemo, useState } from "react"

const API_URL = import.meta.env.VITE_API_URL

type House = {
  id: string | number
  name: string
  category: string
  region: string
  description: string
  image?: string
}

const ITEMS_PER_PAGE = 6

/* ---------- Data dari database (API) ---------- */

function resolveImage(image?: string) {
  if (!image) return undefined
  if (image.startsWith("http")) return image.replace(/^http:\/\//, "https://")
  if (image.startsWith("/")) return `${API_URL}${image}`
  return image
}

function useHouses() {
  const [houses, setHousees] = useState<House[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()

    fetch(`${API_URL}/api/traditional-houses`, {
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
        setHousees(
          (list ?? []).map((item: any) => ({
            id: item.id ?? item.name,
            name: item.name ?? "",
            category:
              typeof item.category === "string"
                ? item.category
                : (item.category?.name ?? ""),
            region: item.province?.name ?? "",
            description: item.description ?? "",
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

  return { houses, loading, error }
}

// Gambar diambil lewat fetch supaya lolos halaman peringatan ngrok
function HouseImage({ src, alt }: { src?: string; alt: string }) {
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
      .catch(() => {})

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

export default function RumahAdatPage() {
  const { houses, loading, error } = useHouses()

  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Semua daerah")
  const [category, setCategory] = useState("Semua kategori")
  const [sort, setSort] = useState("Pilihan Jelajahin")
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [saved, setSaved] = useState(false)

  // Daftar provinsi & kategori diambil dari data, bukan ditulis manual
  const regions = useMemo(
    () => [
      "Semua daerah",
      ...Array.from(new Set(houses.map((d) => d.region).filter(Boolean))),
    ],
    [houses],
  )

  const categories = useMemo(
    () => [
      "Semua kategori",
      ...Array.from(new Set(houses.map((d) => d.category).filter(Boolean))),
    ],
    [houses],
  )

  const filteredHouses = useMemo(() => {
    const result = houses.filter((house) => {
      const searchable =
        `${house.name} ${house.region} ${house.category} ${house.description}`.toLowerCase()
      return (
        searchable.includes(query.toLowerCase()) &&
        (region === "Semua daerah" || house.region === region) &&
        (category === "Semua kategori" || house.category === category)
      )
    })
    if (sort === "Nama A–Z") {
      return [...result].sort((a, b) => a.name.localeCompare(b.name))
    }
    if (sort === "Nama Z–A") {
      return [...result].sort((a, b) => b.name.localeCompare(a.name))
    }
    return result
  }, [houses, category, query, region, sort])

  const totalPages = Math.max(
    1,
    Math.ceil(filteredHouses.length / ITEMS_PER_PAGE),
  )
  const paginatedHouses = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredHouses.slice(start, start + ITEMS_PER_PAGE)
  }, [currentPage, filteredHouses])
  const startIdx =
    filteredHouses.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
  const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredHouses.length)

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
              Jelajahi rumah adat
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
              "Jelajahi rumah adat",
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
            <p className="eyebrow">Dari kampung adat, untuk penjelajah cerita</p>
            <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[58px] lg:text-[66px]">
              Beda daerah, beda rumah.
              <br />
              Semuanya Indonesia.
            </h1>
            <p className="mt-6 max-w-[590px] text-[15px] leading-7 text-[#716a62] sm:text-base">
              Jelajahi rumah adat dari Sumatra hingga Papua. Kenali asalnya,
              temukan ceritanya, dan pelajari makna di balik bentuknya.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button className="primary-button" onClick={scrollToExplore}>
                Mulai jelajah rumah adat
              </button>
              <button className="text-link" onClick={scrollToExplore}>
                Pilih daerah asal <ArrowRight />
              </button>
            </div>
          </div>

          <figure className="relative h-[330px] overflow-hidden rounded-[18px] bg-[#eee7da] sm:h-[430px] lg:h-[440px]">
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <figcaption className="absolute bottom-7 left-7 text-[#312b27] sm:bottom-9 sm:left-9">
              <span className="text-[10px] font-bold uppercase tracking-[.22em] text-[#b84c37]">
                Rumah penuh cerita Nusantara
              </span>
              <p className="mt-2 font-display text-2xl sm:text-[28px]">
                Kaya makna. Dibangun dengan kearifan.
              </p>
            </figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12">
          <div className="grid gap-4 rounded-2xl bg-[#eee7da] p-5 md:grid-cols-[2fr_1fr] md:p-6">
            <label className="filter-label">
              Mau menjelajah rumah adat apa?
              <input
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value)
                  setCurrentPage(1)
                }}
                className="filter-input"
                placeholder="Cari rumah adat atau daerah asal..."
              />
              <span>Contoh: “tongkonan”, “honai”, atau “gadang”</span>
            </label>
            <label className="filter-label">
              Provinsi asal
              <select
                className="filter-input"
                value={region}
                onChange={(event) => {
                  setRegion(event.target.value)
                  setCurrentPage(1)
                }}
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
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
                {regions.map((item) => (
                  <button
                    key={item}
                    onClick={() => {
                      setRegion(item)
                      setCurrentPage(1)
                    }}
                    className={`region-button ${
                      region === item ? "active" : ""
                    }`}
                  >
                    <BookIcon className="h-4 w-4 shrink-0" />
                    <span>{item}</span>
                  </button>
                ))}
              </div>
              <div className="mt-7 hidden rounded-xl bg-[#eee7da] p-5 lg:block">
                <BookIcon className="h-7 w-7 text-[#b84c37]" />
                <h3 className="mt-3 font-display text-xl">
                  Satu rumah, banyak cerita
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-[#776f67]">
                  Bentuk rumah adat bisa berbeda antarkomunitas, bahkan dalam satu
                  provinsi. Lokasi asal menunjukkan akar ceritanya.
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
                    Temukan rumah adat Nusantara
                  </h2>
                  <p className="mt-1 text-[13px] text-[#776f67]">
                    {loading
                      ? "Memuat rumah adat dari database..."
                      : `Menampilkan ${startIdx}–${endIdx} dari ${filteredHouses.length} rumah adat`}
                  </p>
                </div>
                <label className="flex items-center gap-2 text-[12px] text-[#776f67]">
                  Urutkan:
                  <select
                    className="bg-transparent font-medium text-[#312b27] outline-none"
                    value={sort}
                    onChange={(event) => {
                      setSort(event.target.value)
                      setCurrentPage(1)
                    }}
                  >
                    <option>Pilihan Jelajahin</option>
                    <option>Nama A–Z</option>
                    <option>Nama Z–A</option>
                  </select>
                </label>
              </div>

              {categories.length > 1 && (
                <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
                  {categories.map((item) => (
                    <button
                      key={item}
                      onClick={() => {
                        setCategory(item)
                        setCurrentPage(1)
                      }}
                      className={`category-pill ${
                        category === item ? "active" : ""
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

              {!loading && !error && paginatedHouses.length > 0 && (
                <div className="mt-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {paginatedHouses.map((house) => (
                    <article className="dish-card group" key={house.id}>
                      <div className="h-[210px] overflow-hidden sm:h-[190px] xl:h-[205px]">
                        <HouseImage src={house.image} alt={house.name} />
                      </div>
                      <div className="flex min-h-[230px] flex-col p-5">
                        <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#b84c37]">
                          <span>{house.category}</span>
                          <span>{house.region}</span>
                        </div>
                        <h3 className="mt-4 font-display text-[28px] leading-none">
                          {house.name}
                        </h3>
                        <p className="mt-3 text-[13px] leading-5 text-[#716a62]">
                          {house.description}
                        </p>
                        <button
                          className="card-link mt-auto"
                          type="button"
                          onClick={() => setSelectedHouse(house)}
                        >
                          Kenali rumah adat <ArrowRight />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {!loading && !error && filteredHouses.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-[#d5c8b7] px-6 py-20 text-center">
                  <p className="font-display text-2xl">
                    Belum ada rumah adat yang cocok
                  </p>
                  <p className="mt-2 text-sm text-[#776f67]">
                    Coba kata kunci atau daerah lain.
                  </p>
                  <button
                    className="secondary-button mt-5"
                    onClick={() => {
                      setQuery("")
                      setRegion("Semua daerah")
                      setCategory("Semua kategori")
                      setCurrentPage(1)
                    }}
                  >
                    Atur ulang filter
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-[#ded3c4] pt-5 sm:flex-row">
                  <span className="text-[12px] text-[#776f67]">
                    Halaman {currentPage} dari {totalPages} · {ITEMS_PER_PAGE} rumah adat per halaman
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() =>
                        setCurrentPage((page) => Math.max(1, page - 1))
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-[#d9cebe] text-[#312b27] transition hover:border-[#b84c37] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman sebelumnya"
                    >
                      <span aria-hidden="true">‹</span>
                    </button>
                    {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                      (page) => (
                        <button
                          key={page}
                          type="button"
                          onClick={() => setCurrentPage(page)}
                          aria-current={page === currentPage ? "page" : undefined}
                          className={`grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-xs transition ${
                            page === currentPage
                              ? "border-[#b84c37] bg-[#b84c37] text-white"
                              : "border-[#d9cebe] text-[#312b27] hover:border-[#b84c37]"
                          }`}
                        >
                          {page}
                        </button>
                      ),
                    )}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() =>
                        setCurrentPage((page) => Math.min(totalPages, page + 1))
                      }
                      className="grid h-9 w-9 place-items-center rounded-lg border border-[#d9cebe] text-[#312b27] transition hover:border-[#b84c37] disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Halaman berikutnya"
                    >
                      <span aria-hidden="true">›</span>
                    </button>
                  </div>
                </div>
              )}

              <p className="mt-8 text-center text-[11px] text-[#a09890]">
                Katalog akan terus diperbarui dengan kekayaan rumah adat Indonesia.
              </p>
            </div>
          </div>
        </section>
      </main>
      {selectedHouse && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="house-detail-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
          onClick={() => setSelectedHouse(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d9cebe] bg-[#fffcf6] p-6 shadow-2xl sm:p-7"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedHouse(null)}
              className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#fffcf6]/90 text-lg text-[#6e7268] hover:text-[#253b31]"
              aria-label="Tutup detail rumah adat"
            >
              ×
            </button>
            <div className="mb-5 h-52 overflow-hidden rounded-xl bg-[#eee7da]">
              <HouseImage src={selectedHouse.image} alt={selectedHouse.name} />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#ad5036]">
              {[selectedHouse.category, selectedHouse.region]
                .filter(Boolean)
                .join(" · ")}
            </p>
            <h2
              id="house-detail-title"
              className="mb-3 font-['DM_Serif_Display',Georgia,serif] text-3xl text-[#253b31]"
            >
              {selectedHouse.name}
            </h2>
            <p className="text-sm leading-relaxed text-[#555]">
              {selectedHouse.description ||
                "Informasi mengenai rumah adat ini belum tersedia."}
            </p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedHouse(null)}
                className="rounded-lg bg-[#ad5036] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
