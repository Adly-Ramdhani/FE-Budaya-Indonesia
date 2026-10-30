import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import { getApiBaseUrl } from "../api"

const assets = "/assets"

const icons = {
  logo: `${assets}/3eee3.svg`,
  chevron: `${assets}/bb805.svg`,
  search: `${assets}/17800.svg`,
  heroArrow: `${assets}/78c0d.svg`,
  heroCardArrow: `${assets}/674ac.svg`,
  categoryArrow: `${assets}/13ebe.svg`,
  captionArrow: `${assets}/3a649.svg`,
  sectionArrow: `${assets}/6590d.svg`,
  darkCaptionArrow: `${assets}/024cc.svg`,
  darkSectionArrow: `${assets}/bfa1c.svg`,
  ctaArrow: `${assets}/5fa90.svg`,
  motif: `${assets}/a047e.svg`,
  darkMotif: `${assets}/b2bad.svg`,
  instagram: `${assets}/b8a19.svg`,
  youtube: `${assets}/64136.svg`,
  facebook: `${assets}/5a2d8.svg`,
}

export type Category = {
  icon: string
  title: string
  subtitle: string
  href: string
  keywords?: string[]
}

const categories: Category[] = [
  {
    icon: "01",
    title: "Lagu",
    subtitle: "Nada & cerita",
    href: "#lagu",
    keywords: ["lagu daerah", "musik", "nyanyian", "nada", "melodi", "bungong jeumpa", "apuse"],
  },
  {
    icon: "02",
    title: "Tarian",
    subtitle: "Gerak & makna",
    href: "#tarian",
    keywords: ["tari tradisional", "gerak", "saman", "piring", "cakalele", "legong"],
  },
  {
    icon: "03",
    title: "Alat Musik",
    subtitle: "Bunyi & harmoni",
    href: "#alat-musik",
    keywords: ["alat musik", "instrumen", "angklung", "sasando", "kolintang", "gamelan"],
  },
  {
    icon: "04",
    title: "Senjata Tradisional",
    subtitle: "Kriya & sejarah",
    href: "#senjata",
    keywords: ["senjata", "pusaka", "keris", "rencong", "mandau", "kriya", "tempa"],
  },
  {
    icon: "05",
    title: "Pakaian Daerah",
    subtitle: "Kain & identitas",
    href: "#pakaian",
    keywords: ["baju adat", "pakaian", "busana", "tenun", "ulos", "baju bodo", "batik"],
  },
  {
    icon: "06",
    title: "Rumah Adat",
    subtitle: "Ruang & kehidupan",
    href: "#rumah-adat",
    keywords: ["arsitektur", "rumah adat", "tongkonan", "gadang", "honai", "bangunan"],
  },
  {
    icon: "07",
    title: "Makanan",
    subtitle: "Rasa & tradisi",
    href: "#makanan",
    keywords: ["kuliner", "makanan tradisional", "rendang", "pempek", "papeda", "rempah"],
  },
]

const regionData: Record<
  string,
  {
    provinces: string[]
    feature: {
      tag: string
      title: string
      description: string
      image: string
    }
  }
> = {
  Sumatra: {
    provinces: ["Aceh", "Sumatera Utara", "Sumatera Barat", "Riau", "Sumatera Selatan"],
    feature: {
      tag: "Sumatera Barat",
      title: "Minangkabau: filosofi alam dan kearifan rumah gadang",
      description:
        "Menemukan keindahan ukiran rumah adat dan filosofi 'alam takambang jadi guru'.",
      image: "a2b4f.png",
    },
  },
  Jawa: {
    provinces: ["DKI Jakarta", "Jawa Barat", "Jawa Tengah", "DI Yogyakarta", "Jawa Timur"],
    feature: {
      tag: "Jawa Barat",
      title: "Tanah Pasundan: harmoni bambu dan ramahnya tradisi",
      description:
        "Mendengarkan alunan angklung dan merawat nilai kesantunan warisan leluhur.",
      image: "7e922.png",
    },
  },
  "Bali & Nusa Tenggara": {
    provinces: ["Bali", "Nusa Tenggara Barat", "Nusa Tenggara Timur"],
    feature: {
      tag: "Nusa Tenggara Timur",
      title: "Flores: tenun, kampung, dan ingatan leluhur",
      description:
        "Menyusuri Wae Rebo, bertemu penenun Sikka, dan memahami hubungan masyarakat dengan tanah yang mereka rawat.",
      image: "2489a.png",
    },
  },
  Kalimantan: {
    provinces: ["Kalimantan Barat", "Kalimantan Tengah", "Kalimantan Selatan", "Kalimantan Timur", "Kalimantan Utara"],
    feature: {
      tag: "Kalimantan",
      title: "Borneo: kearifan rimba dan seni kriya Dayak",
      description:
        "Ukiran mandau, motif manik-manik, dan hubungan harmonis suku Dayak dengan hutan hujan tropis.",
      image: "89f20.png",
    },
  },
  Sulawesi: {
    provinces: ["Sulawesi Selatan", "Sulawesi Utara", "Sulawesi Tengah", "Sulawesi Tenggara", "Gorontalo", "Sulawesi Barat"],
    feature: {
      tag: "Sulawesi Selatan",
      title: "Tana Toraja & Bugis: megahnya tongkonan dan busana Bugis",
      description:
        "Merawat tradisi arsitektur tongkonan dan kehalusan tenun sutra Bugis yang melegenda.",
      image: "76c15.png",
    },
  },
  "Maluku & Papua": {
    provinces: ["Maluku", "Maluku Utara", "Papua", "Papua Pegunungan", "Papua Barat"],
    feature: {
      tag: "Papua Pegunungan",
      title: "Lembah Baliem: kehangatan honai dan keteguhan tradisi",
      description:
        "Menyelami arsitektur honai yang menyatu dengan dinginnya pegunungan serta semangat persaudaraan.",
      image: "fdedd.png",
    },
  },
}

const provinceCulture: Record<
  string,
  { title: string; category: string; description: string }
> = {
  Bali: {
    title: "Tari Legong",
    category: "Seni Tari",
    description:
      "Keanggunan gerak mata dan lentik jemari penari, sarat nilai estetika luhur tradisi Bali.",
  },
  "Nusa Tenggara Barat": {
    title: "Gendang Beleq",
    category: "Alat Musik",
    description:
      "Ansambel tabuh perkusi akbar suku Sasak yang dahulu menyemangati prajurit dan kini merayakan adat.",
  },
  "Nusa Tenggara Timur": {
    title: "Tenun Ikat Flores & Sasando",
    category: "Pakaian Daerah",
    description:
      "Warisan yang menyimpan motif, warna, dan makna khas serta tumbuh bersama kehidupan masyarakatnya.",
  },
  Aceh: {
    title: "Tari Saman & Rencong",
    category: "Seni Tari",
    description:
      "Tari serempak tepukan tangan masyarakat Gayo dan bilah senjata pusaka khas Tanah Rencong.",
  },
  "Sumatera Barat": {
    title: "Rumah Gadang & Rendang",
    category: "Arsitektur & Kuliner",
    description:
      "Atap gonjong menjulang dan kelezatan rendang kaya rempah warisan tradisi Minangkabau.",
  },
  "Sumatera Utara": {
    title: "Kain Ulos Batak",
    category: "Pakaian Daerah",
    description:
      "Kain tenun sakral Batak yang menjadi simbol restu, kasih sayang, dan kehangatan dalam upacara adat.",
  },
  "Jawa Barat": {
    title: "Angklung",
    category: "Alat Musik",
    description:
      "Alat musik bambu goyang yang menghasilkan harmoni indah dari kerjasama seluruh pemainnya.",
  },
  "Jawa Tengah": {
    title: "Keris Jawa",
    category: "Senjata Tradisional",
    description:
      "Senjata tikam pusaka dengan pamor tempaan empu sarat filosofi spiritual dan keahlian kriya tinggi.",
  },
  "DI Yogyakarta": {
    title: "Batik Tulis Keraton",
    category: "Kriya & Busana",
    description:
      "Karya seni motif canting malam dengan filosofi mendalam dan nilai estetika adiluhung.",
  },
  Papua: {
    title: "Honai & Noken",
    category: "Arsitektur & Kriya",
    description:
      "Rumah jerami pelindung kehangatan dan tas rajut serat alami ikon identitas masyarakat Papua.",
  },
  "Papua Pegunungan": {
    title: "Rumah Honai",
    category: "Rumah Adat",
    description:
      "Arsitektur bundar khas suku Dani yang dirancang cerdas menyiasati suhu dingin dataran tinggi.",
  },
  "Kalimantan Selatan": {
    title: "Ampar-Ampar Pisang & Sasirangan",
    category: "Lagu & Kain",
    description:
      "Irama lagu ceria anak Banjar dan teknik pewarnaan kain jelujur khas Kalimantan Selatan.",
  },
  "Sulawesi Selatan": {
    title: "Tongkonan & Baju Bodo",
    category: "Rumah Adat & Pakaian",
    description:
      "Rumah adat beratap perahu suku Toraja dan busana tertua nan elegan dari tanah Bugis.",
  },
}

type Story = {
  label?: string
  region: string
  name: string
  description: string
  image?: string
}




function Brand() {
  return (
    <a className="brand" href="#top" aria-label="Purwa Nusantara">
      <img src={icons.logo} alt="" />
      <span>Purwa Nusantara</span>
    </a>
  )
}



function ArrowLink({
  children,
  to = "/",
  dark = false,
}: {
  children: React.ReactNode
  to?: string
  dark?: boolean
}) {
  return (
    <Link className={`arrow-link ${dark ? "arrow-link--dark" : ""}`} to={to}>
      {children}
      <img src={dark ? icons.darkSectionArrow : icons.sectionArrow} alt="" />
    </Link>
  )
}

function SectionIntro({
  number,
  category,
  title,
  description,
  dark = false,
  stacked = false,
}: {
  number: string
  category: string
  title: string
  description: string
  dark?: boolean
  stacked?: boolean
}) {
  return (
    <header
      className={`section-intro ${dark ? "section-intro--dark" : ""} ${stacked ? "section-intro--stacked" : ""}`}
    >
      <div className="eyebrow">
        <span>{number}</span>
        <i />
        <strong>{category}</strong>
      </div>
      <div className="intro-copy">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  )
}

function StoryList({ stories }: { stories: Story[] }) {
  return (
    <div className="story-list">
      {stories.map((story) => (
        <article className="story-row" key={story.name}>
          <div>
            <h3>{story.name}</h3>
            <span>{story.region}</span>
          </div>
          <p>{story.description}</p>
        </article>
      ))}
    </div>
  )
}


// function ArrowLink({ href, children }: { href: string; children: ReactNode }) {
//   return (
//     <a className="arrow-link" href={href}>
//       {children} <Icon name="arrow" size={16} />
//     </a>
//   );
// }
function FeatureImage({
  image,
  title,
  subtitle,
}: {
  image: string
  title: string
  subtitle: string
}) {
  return (
    <figure className="feature-image">
      <img className="feature-photo" src={`${assets}/${image}`} alt="" />
      <figcaption>
        <span>
          <strong>{title}</strong>
          <small>{subtitle}</small>
        </span>
        <img src={icons.captionArrow} alt="" />
      </figcaption>
    </figure>
  )
}

function resolveImage(image?: string) {
  if (!image) return undefined
  if (image.startsWith("http")) return image.replace(/^http:\/\//, "https://")
  if (image.startsWith("/")) return `${API_URL}${image}`
  return `${assets}/${image}`
}

function Gallery({ stories }: { stories: Story[] }) {
  return (
    <div className="gallery">
      {stories.map((story) => {
        const src = resolveImage(story.image)
        return (
          <article className="gallery-card" key={story.name}>
            <div className="gallery-photo">
              {src && <NgrokImage src={src} alt={story.name} />}
              <span>{story.label}</span>
            </div>
            <small>{story.region}</small>
            <div className="gallery-title">
              <h3>{story.name}</h3>
              <img src={icons.darkCaptionArrow} alt="" />
            </div>
            <p>{story.description}</p>
          </article>
        )
      })}
    </div>
  )
}

type Song = {
  id: string
  title: string
  region: string
  language: string
  composer: string
  description: string
  audio?: string
}


// Audio diambil lewat fetch (supaya lolos halaman peringatan ngrok),
// baru dimuat saat tombol ditekan agar hemat kuota.
function NgrokAudio({ src }: { src: string }) {
  const [blobUrl, setBlobUrl] = useState<string>()
  const [loading, setLoading] = useState(false)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    return () => {
      if (blobUrl) URL.revokeObjectURL(blobUrl)
    }
  }, [blobUrl])

  const load = () => {
    setLoading(true)
    setFailed(false)
    fetch(src, { headers: { "ngrok-skip-browser-warning": "true" } })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.blob()
      })
      .then((blob) => setBlobUrl(URL.createObjectURL(blob)))
      .catch((err) => {
        console.error("Gagal load audio:", src, err)
        setFailed(true)
      })
      .finally(() => setLoading(false))
  }

  if (blobUrl) return <audio controls autoPlay src={blobUrl} style={{ width: "100%" }} />

  if (loading) return <span style={{ fontSize: "12px", color: "#666" }}>Memuat audio...</span>

  if (failed) {
    return (
      <button
        type="button"
        onClick={load}
        style={{
          fontSize: "12px",
          color: "#b84e36",
          background: "none",
          border: 0,
          cursor: "pointer",
        }}
      >
        Gagal memuat. Coba lagi
      </button>
    )
  }

  return (
    <button
      type="button"
      onClick={load}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        background: "#b84e36",
        color: "white",
        border: 0,
        borderRadius: 6,
        padding: "5px 12px",
        fontSize: "12px",
        fontWeight: 600,
        cursor: "pointer",
        marginTop: "8px",
      }}
    >
      ▶ Putar Audio
    </button>
  )
}


function Motif({ dark = false }: { dark?: boolean }) {
  return (
    <div className="motif" aria-hidden="true">
      {Array.from({ length: 24 }, (_, index) => (
        <img src={dark ? icons.darkMotif : icons.motif} alt="" key={index} />
      ))}
    </div>
  )
}

function Arrow() {
  return <img src={icons.categoryArrow} alt="" className="arrow-icon" />
}

function SectionLabel({
  number,
  children,
}: {
  number: string
  children: React.ReactNode
}) {
  return (
    <div className="eyebrow">
      <span>{number}</span>
      <i />
      <strong>{children}</strong>
    </div>
  )
}


const API_URL = getApiBaseUrl(import.meta.env.VITE_API_URL)
const API_BASE = API_URL

function truncate(text = "", max = 120) {
  if (text.length <= max) return text
  return text.slice(0, max).replace(/\s+\S*$/, "") + "..."
}

function NgrokImage({ src, alt }: { src: string; alt: string }) {
  const [blobUrl, setBlobUrl] = useState<string>()

  useEffect(() => {
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

  return blobUrl ? <img src={blobUrl} alt={alt} /> : null
}

function useStories(endpoint: string) {
  const [stories, setStories] = useState<Story[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    const url = `${API_BASE}/${endpoint.replace(/^\//, "")}`
    fetch(url, {
      signal: controller.signal,
     headers: { Accept: "application/json" },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })

    // fetch(`${API_URL}${endpoint}`, { signal: controller.signal })
    //   .then((res) => {
    //     if (!res.ok) throw new Error(`HTTP ${res.status}`)
    //     return res.json()
    //   })
      .then((json) => {
        const list = Array.isArray(json) ? json : json.data
        setStories(
          (list ?? []).map((item: any) => ({
            name: item.name ?? item.title ?? "Tanpa nama",
            region:
              item.province?.name ?? item.province ?? item.region ?? "",
            label: item.province?.name ?? item.province ?? item.region,
            description: truncate(item.description, 300),
            image: item.image_url ?? item.image,
          })),
        )
        setError(null)
      })
      .catch((err) => {
        if (err.name !== "AbortError") setError(err.message)
      })
      .finally(() => setLoading(false))

    return () => controller.abort()
  }, [endpoint])

  return { stories, loading, error }
}


function SongList({ songs }: { songs: Song[] }) {
  return (
    <div className="story-list">
      {songs.map((song) => (
        <article className="story-row" key={song.id}>
          <div>
           <h3>{song.title}</h3>
            <span>{[song.region, song.language].filter(Boolean).join(" • ")}</span>
          </div>
          <div>
            <p>{song.description}</p>
            {song.audio && <NgrokAudio src={song.audio} />}
          </div>
        </article>
      ))}
    </div>
  )
}


function useSongs() {
  const [songs, setSongs] = useState<Song[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const controller = new AbortController()
    fetch(`${API_BASE}/v1/songs`, {
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
        setSongs(
          (list ?? []).map((item: any) => ({
            id: item.id,
            title: item.title,  
            region: item.province?.name ?? "",
            language: item.language ?? "",
            composer: item.composer ?? "",
            description: truncate(item.description, 300),
            audio: item.audio_url?.replace(/^http:\/\//, "https://"),
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

  return { songs, loading, error }
}

export default function HomePage() {
  const [query, setQuery] = useState("")
  const [region, setRegion] = useState("Bali & Nusa Tenggara")
  const [province, setProvince] = useState("Nusa Tenggara Timur")
  const {
    stories: instruments,
    loading: instrumentsLoading,
    error: instrumentsError,
  } = useStories("/v1/musical-instruments")
  const { stories: weapons, loading: weaponsLoading, error: weaponsError } =
    useStories("/v1/traditional-weapons")
  const { stories: houses, loading: housesLoading, error: housesError } =
  useStories("/v1/traditional-houses")
  const { stories: foods, loading: foodsLoading, error: foodsError } =
  useStories("/v1/foods")
  const {
    stories: traditionalAttires,
    loading: traditionalAttiresLoading,
    error: traditionalAttiresError,
  } = useStories("/v1/traditional-attires")
  const { stories: dances, loading: dancesLoading, error: dancesError } =
  useStories("/v1/dances")
const { songs, loading: songsLoading, error: songsError } = useSongs()

  const matchingCategories = categories.filter((category) => {
    const q = query.toLowerCase().trim()
    if (!q) return true
    return (
      category.title.toLowerCase().includes(q) ||
      category.subtitle.toLowerCase().includes(q) ||
      category.keywords?.some((k) => k.toLowerCase().includes(q))
    )
  })

  const handleRegionChange = (newRegion: string) => {
    setRegion(newRegion)
    const available = regionData[newRegion]?.provinces || []
    if (available.length > 0 && !available.includes(province)) {
      setProvince(available[0])
    }
  }

  const currentFeature =
    regionData[region]?.feature || regionData["Bali & Nusa Tenggara"].feature

  const currentCulture = provinceCulture[province] || {
    title: `Warisan Budaya ${province}`,
    category: "Khas Daerah",
    description:
      "Warisan yang menyimpan motif, warna, dan makna khas serta tumbuh bersama kehidupan masyarakatnya.",
  }

  return (
    <main id="top">
      <nav className="nav shell">
        <Brand />
        <div className="nav-links">
          <a className="active" href="#top">
            Beranda
          </a>
          <a href="#ragam">
            Ragam budaya <img src={icons.chevron} alt="" />
          </a>
          <a href="#tentang">Tentang kami</a>
        </div>
        {/* <div className="search">
          <img src={icons.search} alt="" />
          <input
            type="text"
            placeholder="Cari ragam budaya..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="search-input"
            aria-label="Cari ragam budaya"
          />
          {query && (
            <button
              className="search-clear"
              type="button"
              onClick={() => setQuery("")}
              aria-label="Hapus pencarian"
            >
              ×
            </button>
          )}
        </div> */}
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="kicker">WARISAN YANG TERUS HIDUP</div>
          <h1>Satu Nusantara, sejuta cerita.</h1>
          <p>
            Dari irama yang akrab di telinga hingga rasa yang membekas di lidah.
            Temukan kekayaan budaya Indonesia, dan kenali cerita di baliknya.
          </p>
          <div className="hero-actions">
            <a className="button button--primary" href="#ragam">
              Mulai menjelajah <img src={icons.heroArrow} alt="" />
            </a>
            <a className="text-link" href="#cerita">
              Kenali Nusantara
            </a>
          </div>
          <div className="hero-stat">
            <strong>7</strong>
            <span>
              <b>ragam budaya, tak terhitung cerita</b>
              Dari Sabang sampai Merauke. Dekat, beragam, menginspirasi.
            </span>
          </div>
        </div>
        <FeatureImage
          image="0f23d.png"
          title="Keanggunan Tari Legong"
          subtitle="BALI • SENI TARI — Gerak, ekspresi, dan tradisi yang diwariskan."
        />
      </section>

      <section className="category-block" id="ragam">
        <Motif />
        <div className="shell category-inner">
          <header>
            <h2>Budaya punya banyak bahasa.</h2>
            <p>Pilih pintu masuk ceritamu.</p>
          </header>
          <div className="category-grid">
            {(query ? matchingCategories : categories).map((category) => (
              <a href={category.href} className="category-card" key={category.title}>
                <div>
                  <span className="category-icon">{category.icon}</span>
                  <Arrow />
                </div>
                <strong>{category.title}</strong>
                <small>{category.subtitle}</small>
              </a>
            ))}
          </div>
          {query && matchingCategories.length === 0 && (
            <p className="empty-search">
              Belum ada kategori yang cocok dengan “{query}”.
            </p>
          )}
        </div>
      </section>

      {/* <section className="region-section" id="cerita">
        <div className="shell">
          <div className="section-heading">
            <div>
              <SectionLabel number="02">Dari barat ke timur</SectionLabel>
              <h2>
                Pilih daerah, temukan
                <br />
                dunianya.
              </h2>
            </div>
            <p>
              Setiap pulau memiliki ritme, rasa, bahasa, dan ingatan yang khas.
              Mulai dari wilayah yang memanggil rasa ingin tahumu.
            </p>
          </div>
          <div className="region-tabs" role="tablist" aria-label="Pilih wilayah">
            {[
              "Sumatra",
              "Jawa",
              "Bali & Nusa Tenggara",
              "Kalimantan",
              "Sulawesi",
              "Maluku & Papua",
            ].map((item) => (
              <button
                role="tab"
                aria-selected={region === item}
                className={region === item ? "selected" : ""}
                onClick={() => handleRegionChange(item)}
                key={item}
              >
                {item}
              </button>
            ))}
          </div>
          <article className="region-feature">
            <img
              src={`${assets}/${currentFeature.image}`}
              alt={currentFeature.title}
            />
            <div>
              <span>{currentFeature.tag}</span>
              <h3>{currentFeature.title}</h3>
              <p>{currentFeature.description}</p>
              <a href="#cerita-nusantara">
                Jelajahi cerita dari {region} <Arrow />
              </a>
            </div>
          </article>

          <article className="map-panel">
            <div className="map-intro">
              <div>
                <span>Jelajah peta</span>
                <h3>Temukan budaya provinsi dari peta Indonesia</h3>
                <p>
                  Jelajahi Indonesia dari pulau ke provinsi, lalu temukan kekayaan
                  budaya di setiap daerah.
                </p>
              </div>
              <p>
                <b>Cara jelajah</b>
                <br />
                Pilih pulau, pilih provinsi, lalu lihat budaya yang muncul. Contoh ini
                menampilkan {province} sebagai provinsi terpilih.
              </p>
            </div>
            <div className="map-content">
              <div>
                <span className="field-label">Peta Indonesia</span>
                <div
                  className="map-graphic"
                  aria-label="Peta ilustratif Indonesia"
                >
                  <svg viewBox="0 0 700 320" role="img" aria-hidden="true">
                    <path
                      className={region === "Sumatra" ? "active-island" : ""}
                      d="M52 131c40-20 84-13 129 24l83 64-20 19-73-39-54-11-47-34z"
                    />
                    <path
                      className={region === "Jawa" ? "active-island" : ""}
                      d="M239 239l151 17 31 20-168-10z"
                    />
                    <path
                      className={region === "Kalimantan" ? "active-island" : ""}
                      d="M277 113l59-31 45 19-5 45 45 17-30 30-47-19-52 26-24-35z"
                    />
                    <path
                      className={region === "Sulawesi" ? "active-island" : ""}
                      d="M428 151l50-36 40 22-19 31 35 20-25 18-35-18-36 16-17-26z"
                    />
                    <path
                      className={
                        region === "Bali & Nusa Tenggara" ? "active-island" : ""
                      }
                      d="M399 262l42-4 22 16 37-12 44 18-45 20-36-9-36 10-23-17z"
                    />
                    <path
                      className={
                        region === "Maluku & Papua" ? "active-island" : ""
                      }
                      d="M548 150l74-32 36 30-21 24 29 28-48 27-39-37-43-9z"
                    />
                    {[90, 260, 350, 454, 525, 624].map((cx, index) => (
                      <circle
                        key={cx}
                        cx={cx}
                        cy={[144, 225, 135, 172, 276, 170][index]}
                        r="8"
                      />
                    ))}
                  </svg>
                  <strong>{province}</strong>
                </div>
                <p className="map-caption">
                  Peta ilustratif kepulauan Indonesia. Wilayah aktif ditandai warna terakota.
                </p>
              </div>
              <div className="map-controls">
                <div className="select-card">
                  <label htmlFor="island">Pilih pulau</label>
                  <select
                    id="island"
                    value={region}
                    onChange={(event) => handleRegionChange(event.target.value)}
                  >
                    {Object.keys(regionData).map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                  <small>
                    Sumatra · Jawa · Bali · Nusa Tenggara · Kalimantan · Sulawesi · Maluku · Papua
                  </small>
                </div>
                <div className="select-card">
                  <label htmlFor="province">Pilih provinsi</label>
                  <select
                    id="province"
                    value={province}
                    onChange={(event) => setProvince(event.target.value)}
                  >
                    {(regionData[region]?.provinces || []).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="culture-example">
                  <span>Contoh budaya provinsi terpilih</span>
                  <small>{province}</small>
                  <h4>{currentCulture.title}</h4>
                  <p>{currentCulture.description}</p>
                  <em>{currentCulture.category}</em>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section> */}

      <section className="culture-section shell" id="lagu">
        <div id="cerita-nusantara" />
        <SectionIntro
          number="01"
          category="Lagu"
          title="Cerita yang menjadi nada."
          description="Lagu daerah menyimpan bahasa, kenangan, dan keseharian masyarakat. Satu melodi bisa membawa kita pulang."
        />
        <div className="split">
          <FeatureImage
            image="7e922.png"
            title="Bungong Jeumpa"
            subtitle="Aceh • Nyanyian tentang bunga cempaka"
          />
        <div>
          {songsLoading && <p>Memuat data...</p>}
          {songsError && <p>Gagal memuat data: {songsError}</p>}
          {!songsLoading && !songsError && songs.length === 0 && (
            <p>Belum ada data lagu.</p>
          )}
          {songs.length > 0 && <SongList songs={songs.slice(0, 3)} />}
           <ArrowLink to="/jelajahi/lagu">Jelajahi lagu</ArrowLink>
        </div>
        </div>
      </section>

    <section className="culture-section culture-section--tint" id="tarian">
      <div className="shell">
        <SectionIntro
          number="02"
          category="Tarian"
          title="Setiap gerak punya makna."
          description="Dari kekompakan satu barisan hingga lentik jemari, tarian menjadi cara masyarakat merayakan hidup dan menjaga ingatan."
        />

        {dancesLoading && <p>Memuat data...</p>}
        {dancesError && <p>Gagal memuat data: {dancesError}</p>}
        {!dancesLoading && !dancesError && dances.length === 0 && (
          <p>Belum ada data tarian.</p>
        )}
        {dances.length > 0 && <Gallery stories={dances.slice(0, 3)} />}

        <div className="section-foot">
          <span>
            Tiga cerita untuk memulai. Masih banyak warisan untuk dikenali.
          </span>
          <ArrowLink to="/jelajah/tarian">Jelajahi tarian</ArrowLink>
        </div>
      </div>
    </section>

      <section className="culture-section culture-section--dark" id="alat-musik">
        <div className="shell">
          <SectionIntro
            number="03"
            category="Alat Musik"
            title="Dengarkan suara Nusantara."
            description="Bambu, kayu, dan dawai diolah menjadi bunyi yang khas. Setiap alat musik membawa jejak alam dan keterampilan pembuatnya."
            dark
            stacked
          />
          <div className="split split--reverse">
            <div>
              {instrumentsLoading && <p>Memuat data alat musik...</p>}
              {instrumentsError && (
                <p>Gagal memuat data alat musik: {instrumentsError}</p>
              )}
              {!instrumentsLoading &&
                !instrumentsError &&
                instruments.length === 0 && <p>Belum ada data alat musik.</p>}
              {instruments.length > 0 && (
                <StoryList stories={instruments.slice(0, 3)} />
              )}
              <ArrowLink to="/jelajah/alat-musik" dark>Jelajahi alat musik</ArrowLink>
            </div>
            <FeatureImage
              image="2489a.png"
              title="Sasando, harmoni dari Rote"
              subtitle="Pulau Rote • Nusa Tenggara Timur"
            />
          </div>
        </div>
      </section>

      <section className="culture-section shell" id="senjata">
        <SectionIntro
          number="04"
          category="Senjata Tradisional"
          title="Kriya yang menyimpan sejarah."
          description="Lebih dari alat pertahanan, senjata tradisional menyimpan keahlian perajin, nilai simbolis, dan identitas masyarakatnya."
        />
        <div className="split">
          <FeatureImage
            image="89f20.png"
            title="Keris dan seni tempa"
            subtitle="Jawa • Warisan keterampilan empu"
          />
        <div>
          {weaponsLoading && <p>Memuat data...</p>}
          {weaponsError && <p>Gagal memuat data: {weaponsError}</p>}
          {!weaponsLoading && !weaponsError && weapons.length === 0 && (
            <p>Belum ada data senjata tradisional.</p>
          )}
          {weapons.length > 0 && <StoryList stories={weapons.slice(0, 3)} />}
          <ArrowLink to="/jelajah/senjata-tradisional">Jelajahi senjata tradisional</ArrowLink>
        </div>
        </div>
        <p className="editorial-note">
          Kenali senjata tradisional sebagai warisan seni, sejarah, dan
          adat—dengan menghormati makna serta konteks penggunaannya.
        </p>
      </section>

      <section className="culture-section culture-section--soft" id="pakaian">
        <div className="shell">
          <SectionIntro
            number="05"
            category="Pakaian Daerah"
            title="Identitas dalam sehelai kain."
            description="Warna, potongan, dan tenunan berbicara tentang asal-usul. Busana daerah merawat hubungan antara manusia, adat, dan keterampilan."
          />
          <div className="split split--reverse">
            <div>
              {traditionalAttiresLoading && <p>Memuat data...</p>}
              {traditionalAttiresError && (
                <p>Gagal memuat data: {traditionalAttiresError}</p>
              )}
              {!traditionalAttiresLoading &&
                !traditionalAttiresError &&
                traditionalAttires.length === 0 && (
                  <p>Belum ada data pakaian daerah.</p>
                )}
              {traditionalAttires.length > 0 && (
                <StoryList stories={traditionalAttires.slice(0, 3)} />
              )}
              <ArrowLink to="/jelajah/pakaian-daerah">Jelajahi pakaian daerah</ArrowLink>
            </div>
          </div>
        </div>
      </section>

    <section className="culture-section culture-section--tint" id="rumah-adat">
      <div className="shell">
        <SectionIntro
          number="06"
          category="Rumah Adat"
          title="Ruang tinggal, ruang cerita."
          description="Arsitektur tradisional tumbuh bersama alam dan adat. Dari bentuk atap hingga ruang bersama, setiap rumah punya filosofi."
        />

        {housesLoading && <p>Memuat data...</p>}
        {housesError && <p>Gagal memuat data: {housesError}</p>}
        {!housesLoading && !housesError && houses.length === 0 && (
          <p>Belum ada data rumah adat.</p>
        )}
        {houses.length > 0 && <Gallery stories={houses} />}

        <div className="section-foot">
          <span>
            Tiga cerita untuk memulai. Masih banyak warisan untuk dikenali.
          </span>
          
          <ArrowLink to="/jelajah/rumah-adat">Jelajahi rumah adat</ArrowLink>
        </div>
      </div>
    </section>

      <section className="culture-section shell" id="makanan">
        <SectionIntro
          number="07"
          category="Makanan"
          title="Mengenal Indonesia lewat rasa."
          description="Rempah, bahan lokal, dan resep turun-temurun bertemu di meja makan. Setiap hidangan adalah undangan mengenal daerah asalnya."
        />

        {foodsLoading && <p>Memuat data...</p>}
        {foodsError && <p>Gagal memuat data: {foodsError}</p>}
        {!foodsLoading && !foodsError && foods.length === 0 && (
          <p>Belum ada data makanan.</p>
        )}
       {foods.length > 0 && <Gallery stories={foods.slice(0, 3)} />}

        <div className="section-foot">
          <span>
            Tiga cerita untuk memulai. Masih banyak warisan untuk dikenali.
          </span>
         <ArrowLink to="/jelajah/makanan">Jelajahi makanan</ArrowLink>
        </div>
      </section>

      <section className="cta">
        <Motif dark />
        <div className="shell cta-inner">
          <img src={`${assets}/f6758.png`} alt="" />
          <div>
            <span>KENALI. HARGAI. LESTARIKAN.</span>
            <h2>Cerita berikutnya, dimulai dari rasa ingin tahu.</h2>
            <p>
              Jelajahi tradisi di luar yang sudah kamu kenal. Karena mengenal
              budaya adalah langkah pertama untuk ikut menjaganya.
            </p>
            <a className="button button--light" href="#ragam">
              Jelajahi ragam budaya <img src={icons.ctaArrow} alt="" />
            </a>
          </div>
        </div>
      </section>

      <footer className="footer" id="tentang">
        <div className="shell footer-grid">
          <div className="footer-brand">
            <Brand />
            <p>
              Jelajahi lagu, tarian, alat musik, senjata tradisional, pakaian
              daerah, rumah adat, dan makanan dari berbagai penjuru Indonesia.
            </p>
            <div className="socials">
              {(["instagram", "youtube", "facebook"] as const).map(
                (network) => (
                  <a href="#top" aria-label={network} key={network}>
                    <img src={icons[network]} alt="" />
                  </a>
                ),
              )}
            </div>
          </div>
          <div>
            <h3>JELAJAHI BUDAYA</h3>
            <div className="footer-links two-columns">
              {categories.map((category) => (
                <a href={category.href} key={category.title}>
                  {category.title}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3>KENALI LEBIH DEKAT</h3>
            <div className="footer-links">
              <a href="#tentang">Tentang Purwa Nusantara</a>
              <a href="#ragam">Jelajahi ragam budaya</a>
              <a href="#top">Kembali ke beranda</a>
            </div>
          </div>
          <div className="footer-note">
            Setiap tradisi punya makna dan cerita. Sebutan serta praktiknya
            dapat berbeda di tiap komunitas—mari mengenalnya dengan rasa ingin
            tahu dan hormat.
          </div>
          <div className="copyright">
            <span>© 2026 Purwa Nusantara.</span>
            <span>Mengenal dan merayakan budaya Nusantara.</span>
          </div>
        </div>
      </footer>
    </main>
  )
}
