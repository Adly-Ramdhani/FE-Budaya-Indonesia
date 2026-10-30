import { useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { getApiBaseUrl } from "../api"

const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)
const ASSETS = "/assets"
const PAGE_SIZE = 9

type ExploreCategory = "tarian" | "alat-musik" | "senjata-tradisional" | "pakaian-daerah"

type ExploreItem = {
  id: string
  name: string
  region: string
  category: string
  description: string
  image?: string
}

const categoryConfig: Record<ExploreCategory, {
  label: string
  endpoint: string
  noun: string
  plural: string
  searchPrompt: string
  placeholder: string
  examples: string
  heading: string
  heroHeading: string
  intro: string
  heroTitle: string
  heroRegion: string
  fallbackImage: string
}> = {
  tarian: {
    label: "Tarian",
    endpoint: "/v1/dances",
    noun: "tarian",
    plural: "tarian",
    searchPrompt: "Mau menjelajahi gerak apa?",
    placeholder: "Cari tarian atau daerah asal...",
    examples: "Contoh: “Saman”, “Piring”, atau “Bali”",
    heading: "Temukan tarian Nusantara",
    heroHeading: "Beda daerah, beda gerak.",
    intro: "Setiap gerak menyimpan makna dari daerah asalnya.",
    heroTitle: "Gerak yang menyimpan makna",
    heroRegion: "Ragam tari dari seluruh Indonesia",
    fallbackImage: "3a211.png",
  },
  "alat-musik": {
    label: "Alat Musik",
    endpoint: "/v1/musical-instruments",
    noun: "alat musik",
    plural: "alat musik",
    searchPrompt: "Mau mendengar bunyi apa?",
    placeholder: "Cari alat musik atau daerah asal...",
    examples: "Contoh: “angklung”, “sasando”, atau “Rote”",
    heading: "Temukan alat musik Nusantara",
    heroHeading: "Beda daerah, beda bunyi.",
    intro: "Bambu, kayu, dan dawai membawa bunyi khas dari tiap daerah.",
    heroTitle: "Sasando, harmoni dari Rote",
    heroRegion: "Pulau Rote • Nusa Tenggara Timur",
    fallbackImage: "2489a.png",
  },
  "senjata-tradisional": {
    label: "Senjata Tradisional",
    endpoint: "/v1/traditional-weapons",
    noun: "senjata tradisional",
    plural: "senjata tradisional",
    searchPrompt: "Pusaka daerah mana yang ingin dikenal?",
    placeholder: "Cari senjata atau daerah asal...",
    examples: "Contoh: “keris”, “rencong”, atau “Kalimantan”",
    heading: "Kenali pusaka Nusantara",
    heroHeading: "Beda daerah, beda pusaka.",
    intro: "Kriya, sejarah, dan nilai budaya hadir dalam setiap pusaka.",
    heroTitle: "Kriya yang menyimpan sejarah",
    heroRegion: "Warisan seni dan keterampilan Nusantara",
    fallbackImage: "89f20.png",
  },
  "pakaian-daerah": {
    label: "Pakaian Daerah",
    endpoint: "/v1/traditional-attires",
    noun: "pakaian daerah",
    plural: "pakaian daerah",
    searchPrompt: "Kain dan busana daerah mana yang ingin dilihat?",
    placeholder: "Cari pakaian atau daerah asal...",
    examples: "Contoh: “ulos”, “baju bodo”, atau “Flores”",
    heading: "Temukan pakaian daerah Nusantara",
    heroHeading: "Beda daerah, beda busana.",
    intro: "Warna, potongan, dan tenunan membawa cerita dari daerah asal.",
    heroTitle: "Tenun dan busana Nusantara",
    heroRegion: "Kain, warna, dan identitas daerah",
    fallbackImage: "76c15.png",
  },
}

function resolveImage(image?: string) {
  if (!image) return undefined
  if (image.startsWith("/assets/")) return image
  if (/^https?:\/\//.test(image)) return image.replace(/^http:\/\//, "https://")
  return image.startsWith("/") ? `${API_URL}${image}` : `${API_URL}/${image}`
}

function CollectionImage({ src, fallback, alt, className }: {
  src?: string
  fallback: string
  alt: string
  className: string
}) {
  const [displaySrc, setDisplaySrc] = useState(fallback)

  useEffect(() => {
    const resolved = resolveImage(src)
    if (!resolved || resolved.startsWith("/assets/")) {
      setDisplaySrc(resolved ?? fallback)
      return
    }

    const controller = new AbortController()
    let objectUrl: string | undefined
    fetch(resolved, {
      signal: controller.signal,
      headers: { Accept: "image/*", "ngrok-skip-browser-warning": "true" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.blob()
      })
      .then((blob) => {
        objectUrl = URL.createObjectURL(blob)
        setDisplaySrc(objectUrl)
      })
      .catch(() => setDisplaySrc(fallback))

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [fallback, src])

  return <img className={className} src={displaySrc} alt={alt} />
}

function ArrowRight() {
  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" className="h-4 w-4">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ExploreCollectionPage({ category }: { category: ExploreCategory }) {
  const config = categoryConfig[category]
  const [items, setItems] = useState<ExploreItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Semua daerah")
  const [itemCategory, setItemCategory] = useState("Semua kategori")
  const [sort, setSort] = useState("Rekomendasi")
  const [page, setPage] = useState(1)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedItem, setSelectedItem] = useState<ExploreItem | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    setLoading(true)
    setError("")
    fetch(`${API_URL}${config.endpoint}`, {
      signal: controller.signal,
      headers: { Accept: "application/json", "ngrok-skip-browser-warning": "true" },
    })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json()
      })
      .then((json) => {
        const rows = Array.isArray(json) ? json : (json.data ?? [])
        setItems(rows.map((item: any, index: number) => ({
          id: String(item.id ?? item.slug ?? `${item.name ?? item.title ?? "item"}-${index}`),
          name: item.name ?? item.title ?? item.nama ?? "Tanpa nama",
          region: item.province?.name ?? item.province ?? item.region ?? "",
          category: typeof item.category === "string" ? item.category : item.category?.name ?? config.label,
          description: item.description ?? item.short_description ?? "Informasi mengenai warisan ini belum tersedia.",
          image: item.image_url ?? item.image ?? item.photo,
        })))
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError("Data belum dapat dimuat. Coba muat ulang halaman.")
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [config.endpoint, config.label])

  const regions = useMemo(() => [
    "Semua daerah",
    ...Array.from(new Set(items.map((item) => item.region).filter(Boolean))),
  ], [items])
  const categories = useMemo(() => [
    "Semua kategori",
    ...Array.from(new Set(items.map((item) => item.category).filter(Boolean))),
  ], [items])
  const filteredItems = useMemo(() => {
    const keyword = query.trim().toLocaleLowerCase("id")
    const filtered = items.filter((item) =>
      `${item.name} ${item.region} ${item.category} ${item.description}`.toLocaleLowerCase("id").includes(keyword) &&
      (region === "Semua daerah" || item.region === region) &&
      (itemCategory === "Semua kategori" || item.category === itemCategory),
    )
    return sort === "Nama A–Z" ? [...filtered].sort((a, b) => a.name.localeCompare(b.name, "id")) : filtered
  }, [items, itemCategory, query, region, sort])
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE))
  const pageItems = filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const featuredItem = items.find((item) => item.image)
  const fallbackImage = `${ASSETS}/${config.fallbackImage}`
  const scrollTo = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })

  const resetPage = (action: () => void) => {
    action()
    setPage(1)
  }

  return (
    <div className="min-h-screen bg-[#f7f3eb] text-[#312b27]">
      <header className="sticky top-0 z-30 border-b border-[#e8e0d3] bg-[#f7f3eb]/95 backdrop-blur">
        <div className="mx-auto flex h-[70px] max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link to="/" className="flex items-center gap-2.5" aria-label="Purwa Nusantara">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-[#b84c37] text-[#fffaf2]">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M4 5.5c2.7-.8 5.3-.3 8 1.4v12c-2.7-1.7-5.3-2.2-8-1.4v-12ZM20 5.5c-2.7-.8-5.3-.3-8 1.4v12c2.7-1.7 5.3-2.2 8-1.4v-12Z" stroke="currentColor" />
              </svg>
            </span>
            <span className="font-display text-[20px] sm:text-[22px]">Purwa Nusantara</span>
          </Link>

          <nav className="hidden h-full items-center gap-5 text-[12px] text-[#756d65] lg:flex xl:gap-9" aria-label="Navigasi utama">
            <a className="nav-active" href="#jelajah">Jelajahi {config.label.toLowerCase()}</a>
            <a className="transition hover:text-[#b84c37]" href="#daerah">Jelajah daerah</a>
            <Link className="transition hover:text-[#b84c37]" to="/#tentang">Tentang Purwa Nusantara</Link>
          </nav>

          <div className="flex items-center gap-3">
            <button
              className="hidden items-center gap-2 text-[13px] transition hover:text-[#b84c37] sm:flex"
              onClick={() => setSaved((value) => !value)}
              aria-pressed={saved}
            >
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill={saved ? "currentColor" : "none"} aria-hidden="true">
                <path d="M5 3.5h10v13L10 13l-5 3.5v-13Z" stroke="currentColor" strokeLinejoin="round" />
              </svg>
              {saved ? "Tersimpan" : "Simpan"}
            </button>
            <button
              className="grid h-10 w-10 place-items-center lg:hidden"
              onClick={() => setMobileOpen((value) => !value)}
              aria-label={mobileOpen ? "Tutup menu" : "Buka menu"}
              aria-expanded={mobileOpen}
            >
              <span className="space-y-1.5" aria-hidden="true">
                <i className="block h-px w-5 bg-current" />
                <i className="block h-px w-5 bg-current" />
                <i className="block h-px w-5 bg-current" />
              </span>
            </button>
          </div>
        </div>
        {mobileOpen && (
          <nav className="space-y-1 border-t border-[#e8e0d3] px-5 py-4 text-sm lg:hidden" aria-label="Navigasi seluler">
            <a className="block py-2" href="#jelajah" onClick={() => setMobileOpen(false)}>Jelajahi {config.label.toLowerCase()}</a>
            <a className="block py-2" href="#daerah" onClick={() => setMobileOpen(false)}>Jelajah daerah</a>
            <Link className="block py-2" to="/#tentang" onClick={() => setMobileOpen(false)}>Tentang Purwa Nusantara</Link>
            <button className="flex items-center gap-2 py-2" onClick={() => setSaved((value) => !value)} aria-pressed={saved}>
              <span>{saved ? "Tersimpan" : "Simpan koleksi"}</span>
            </button>
          </nav>
        )}
      </header>

      <main>
        <section className="mx-auto grid max-w-[1440px] gap-8 px-5 py-8 sm:px-8 lg:grid-cols-[1.02fr_.98fr] lg:items-center lg:px-12 lg:py-9">
          <div className="max-w-[670px] lg:py-12">
            <p className="eyebrow">Dari setiap daerah, untuk penjelajah budaya</p>
            <h1 className="mt-6 font-display text-[44px] leading-[1.02] tracking-[-0.02em] sm:text-[58px] lg:text-[66px]">
              {config.heroHeading} <span className="text-[#b84c37]">Semuanya Indonesia.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-[15px] leading-7 text-[#716a62] sm:text-base">{config.intro}</p>
            <div className="mt-7 flex flex-wrap items-center gap-5">
              <button className="primary-button" onClick={() => scrollTo("jelajah")}>Mulai jelajah {config.noun}</button>
              <button className="text-link" onClick={() => scrollTo("daerah")}>Pilih daerah asal <ArrowRight /></button>
            </div>
          </div>

          <figure className="group relative h-[330px] overflow-hidden rounded-[18px] bg-[#eee7da] sm:h-[430px] lg:h-[440px]">
            <CollectionImage
              src={featuredItem?.image}
              fallback={fallbackImage}
              alt={featuredItem?.name ?? config.heroTitle}
              className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
            <figcaption className="absolute bottom-7 left-7 text-white sm:bottom-9 sm:left-9">
              <span className="text-[10px] font-bold uppercase tracking-[.22em]">Koleksi {config.label.toLowerCase()} Nusantara</span>
              <p className="mt-2 font-display text-2xl sm:text-[28px]">{featuredItem?.name ?? config.heroTitle}</p>
              <small className="mt-1 block text-[12px] text-white/80">{featuredItem?.region || config.heroRegion}</small>
            </figcaption>
          </figure>
        </section>

        <section className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 lg:px-12">
          <div className="grid gap-4 rounded-2xl bg-[#eee7da] p-5 md:grid-cols-[2fr_1fr] md:p-6">
            <label className="filter-label">
              {config.searchPrompt}
              <input value={query} onChange={(event) => resetPage(() => setQuery(event.target.value))} className="filter-input" placeholder={config.placeholder} />
              <span>{config.examples}</span>
            </label>
            <label className="filter-label">
              Provinsi asal
              <select className="filter-input" value={region} onChange={(event) => resetPage(() => setRegion(event.target.value))}>
                {regions.map((value) => <option key={value}>{value}</option>)}
              </select>
              <span>Sesuaikan pencarian berdasarkan provinsi.</span>
            </label>
          </div>
        </section>

        <section id="jelajah" className="mx-auto max-w-[1440px] scroll-mt-24 px-5 pb-20 pt-6 sm:px-8 lg:px-12">
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <aside id="daerah" className="scroll-mt-24">
              <h2 className="font-display text-[28px]">Jelajah per daerah</h2>
              <p className="mt-1 text-[12px] leading-5 text-[#776f67]">Pilih daerah untuk menemukan {config.plural} khasnya.</p>
              <div className="mt-5 flex gap-2 overflow-x-auto pb-2 lg:block lg:space-y-1 lg:overflow-visible">
                {regions.map((value) => (
                  <button key={value} onClick={() => resetPage(() => setRegion(value))} className={`region-button ${region === value ? "active" : ""}`}>
                    <span>{value}</span>
                  </button>
                ))}
              </div>
            </aside>

            <div>
              <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
                <div>
                  <h2 className="font-display text-[34px] sm:text-[40px]">{config.heading}</h2>
                  <p className="mt-1 text-[13px] text-[#776f67]">{filteredItems.length} {config.plural} ditemukan</p>
                </div>
                <label className="flex items-center gap-2 text-[12px] text-[#776f67]">
                  Urutkan:
                  <select className="bg-transparent font-medium text-[#312b27] outline-none" value={sort} onChange={(event) => resetPage(() => setSort(event.target.value))}>
                    <option>Rekomendasi</option>
                    <option>Nama A–Z</option>
                  </select>
                </label>
              </div>

              {categories.length > 1 && (
                <div className="mt-5 flex gap-2 overflow-x-auto pb-3">
                  {categories.map((value) => (
                    <button key={value} onClick={() => resetPage(() => setItemCategory(value))} className={`category-pill ${itemCategory === value ? "active" : ""}`}>
                      {value}
                    </button>
                  ))}
                </div>
              )}

              {loading && <p className="mt-6 text-sm text-[#776f67]">Memuat {config.plural}...</p>}
              {error && <p role="alert" className="mt-6 text-sm text-[#b84c37]">{error}</p>}
              {!loading && !error && pageItems.length > 0 && (
                <div className="mt-2 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {pageItems.map((item) => (
                    <article className="dish-card group" key={item.id}>
                      <div className="h-[210px] overflow-hidden sm:h-[190px] xl:h-[205px]">
                        <CollectionImage src={item.image} fallback={fallbackImage} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                      </div>
                      <div className="flex min-h-[230px] flex-col p-5">
                        <div className="flex justify-between gap-3 text-[10px] font-bold uppercase tracking-[.12em] text-[#b84c37]">
                          <span>{item.category}</span>
                          <span>{item.region}</span>
                        </div>
                        <h3 className="mt-4 font-display text-[28px] leading-none">{item.name}</h3>
                        <p className="mt-3 text-[13px] leading-5 text-[#716a62]">{item.description}</p>
                        <button type="button" className="card-link mt-auto" onClick={() => setSelectedItem(item)}>
                          Kenali {config.noun} <ArrowRight />
                        </button>
                      </div>
                    </article>
                  ))}
                </div>
              )}
              {!loading && !error && filteredItems.length === 0 && (
                <div className="mt-2 rounded-xl border border-dashed border-[#d5c8b7] px-6 py-20 text-center">
                  <p className="font-display text-2xl">Belum ada {config.plural} yang cocok</p>
                  <p className="mt-2 text-sm text-[#776f67]">Coba kata kunci atau daerah lain.</p>
                  <button className="secondary-button mt-5" onClick={() => resetPage(() => { setQuery(""); setRegion("Semua daerah"); setItemCategory("Semua kategori") })}>Atur ulang filter</button>
                </div>
              )}
              {totalPages > 1 && (
                <div className="mt-8 flex items-center justify-between border-t border-[#ded3c4] pt-5">
                  <span className="text-[12px] text-[#776f67]">Halaman {page} dari {totalPages}</span>
                  <div className="flex gap-2">
                    <button className="secondary-button" disabled={page === 1} onClick={() => setPage((value) => Math.max(1, value - 1))}>Sebelumnya</button>
                    <button className="secondary-button" disabled={page === totalPages} onClick={() => setPage((value) => Math.min(totalPages, value + 1))}>Berikutnya</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {selectedItem && (
        <div role="dialog" aria-modal="true" aria-labelledby="explore-detail-title" className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm" onClick={() => setSelectedItem(null)}>
          <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-[#d9cebe] bg-[#fffcf6] p-6 shadow-2xl sm:p-7" onClick={(event) => event.stopPropagation()}>
            <button type="button" onClick={() => setSelectedItem(null)} className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full bg-[#fffcf6]/90 text-lg text-[#6e7268] hover:text-[#253b31]" aria-label="Tutup detail">×</button>
            <div className="mb-5 h-52 overflow-hidden rounded-xl bg-[#eee7da]">
              <CollectionImage src={selectedItem.image} fallback={fallbackImage} alt={selectedItem.name} className="h-full w-full object-cover" />
            </div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#ad5036]">{[selectedItem.category, selectedItem.region].filter(Boolean).join(" · ")}</p>
            <h2 id="explore-detail-title" className="mb-3 font-display text-3xl text-[#253b31]">{selectedItem.name}</h2>
            <p className="text-sm leading-relaxed text-[#555]">{selectedItem.description}</p>
            <div className="mt-6 flex justify-end">
              <button type="button" onClick={() => setSelectedItem(null)} className="rounded-lg bg-[#ad5036] px-5 py-2 text-xs font-semibold text-white transition hover:opacity-90">Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
