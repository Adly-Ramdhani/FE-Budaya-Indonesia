import { FunctionComponent, useEffect, useMemo, useRef, useState } from "react"
import { Link } from "react-router-dom"
import styles from "./styles/JelajahiLagu.module.css";

const API_URL = import.meta.env.VITE_API_URL

export type Song = {
    id: string | number
    title: string
    region: string
    language: string
    composer?: string
    description: string
    lyrics?: string
    audio?: string
}

const defaultLyricsByTitle: Record<string, string> = {
  "bungong jeumpa": `Bungong jeumpa, bungong jeumpa meugah di Acèh
Bungong teuleubèh, teuleubèh indah lagoina

Puteh kunèng, meujampu mirah
Bungong si-ula, indah lagoina

Lam sinar buleun, lam sinar buleun angèn peu-ayôn
Rurôh meususôn, meususôn nyang mala-mala

Keubit mangat that, mubèe meuhayak
Bak bungong jeumpa, bungong jeumpa indah lagoina`,

  "ampar-ampar pisang": `Ampar-ampar pisang
Pisangku balum masak
Masak sabigi dihurung bari-bari
Masak sabigi dihurung bari-bari

Mangga lepak mangga lepok
Patah kayu bengkok
Bengkok dimakan api, apinya canculupan
Bengkok dimakan api, apinya canculupan

Nang mana batis kutung, dikitip bidawang
Nang mana batis kutung, dikitip bidawang`,

  "apuse": `Apuse kokon dao
Yarabe soren doreri
Wuf lenso bani nema baki pase

Apuse kokon dao
Yarabe soren doreri
Wuf lenso bani nema baki pase

Arafabye aswarakwar
Arafabye aswarakwar`,

  "manuk dadali": `Mesat ngapung luhur jauh di awang-awang
Mébérkeun jangjangna bangun taya karingrang
Sukuna ranggoas reujeung pamatukna ngeluk
Ngepak mega bari hiberna tarik nyuruwuk

Saha anu bisa nyusul kana tandangna
Gandang jeung perténtang taya bandingannana
Dipikagimir dipikasérab ku sasama
Taya karempan kasieun lébér wawanénna

Manuk dadali manuk panggagahna
Perlambang sakti Indonesia Jaya
Manuk dadali pangkakoncarana
Resep ngahiji rukun sakabéhna

Hirup sauyunan tara pahiri-hiri
Silih pikanyaah teu inggis béla pati
Manuk dadali ngandung siloka sinatria
Keur sakumna Bangsa di Nagara Indonesia`,

  "soleram": `Soleram, Soleram
Soleram anak yang manis
Anak manis janganlah dicium, sayang
Kalau dicium merahlah pipinya

Satu dua tiga dan empat
Lima enam tujuh delapan
Kalau tuan dapat kawan baru, sayang
Kawan yang lama dilupakan jangan`,

  "rasa sayange": `Rasa sayange, rasa sayang sayange
Kulihat dari jauh rasa sayang sayange

Rasa sayange, rasa sayang sayange
Kulihat dari jauh rasa sayang sayange

Kalau ada sumur di ladang
Boleh kita menumpang mandi
Kalau ada umurku panjang
Boleh kita berjumpa lagi

Rasa sayange, rasa sayang sayange
Kulihat dari jauh rasa sayang sayange`,

  "kicir-kicir": `Kicir-kicir ini lagunya
Lagu lama ya tuan dari Jakarta
Saya menyanyi ya tuan memang sengaja
Untuk menghibur, menghibur hati yang duka

Burung dara burung merpati
Terbang cepat ya tuan tiada tara
Bilalah kita ya tuan suka menyanyi
Badanlah sehat ya tuan hati gembira

Buah mangga enak rasanya
Si manalagi ya tuan paling ternama
Siapa saja ya tuan rajin bekerja
Pasti menjadi warga berguna`,

  "gundul-gundul pacul": `Gundul-gundul pacul cul gembèlengan
Nyunggi-nyunggi wakul kul gembèlengan

Wakul ngglimpang segané dadi saratan
Wakul ngglimpang segané dadi saratan`,

  "bolelebo": `Bolelebo ita nusa lelebo
Bolelebo ita nusa lelebo
Malole do simalole
Ita nusa lelebo
Malole do simalole
Ita nusa lelebo

Ie mulu dale do si
Ita nusa lelebo
Ie mulu dale do si
Ita nusa lelebo
Te nusa le te bole
Ita nusa lelebo
Te nusa le te bole
Ita nusa lelebo`,

  "o ina ni keke": `O Ina ni Keke, mangewi kau mange
Si mato-towan mangewi kau mange

Mange mi mikir aki, mi mikir aki
We ane ko koki, we ane ko koki

Mangemo ki wena, tumutuk tumo le-le
Mangemo ki wena, tumutuk tumo le-le`,

  "yamko rambe yamko": `Hee yamko rambe yamko aronawa kombe
Hee yamko rambe yamko aronawa kombe

Teemi gino bebe sunggo roho dumu
Teemi gino bebe sunggo roho dumu

Yumano bungko roho
Yumano bungko roho

Hongke hongke hongke riro
Hongke jombe jombe riro
Hongke hongke hongke riro
Hongke jombe jombe riro`,

  "ayo mama": `Ayam hitam telurnya putih
Mencari makan di pinggir kali
Sinyo hitam giginya putih
Kalau tertawa manis sekali

Ayo mama, jangan mama marah kulo
Dia cuma cuma pegang beta pung tangan
Ayo mama, jangan mama marah kulo
Lah orang muda punya biasa`,
}

function cleanLyrics(lyrics?: string): string {
  if (!lyrics) return ""
  return lyrics
    .replace(/Baca artikel detik.*?$/gis, "")
    .replace(/Download Apps.*?$/gis, "")
    .trim()
}

function getSongLyrics(title: string, lyrics?: string): string {
  const cleaned = cleanLyrics(lyrics)
  if (cleaned) return cleaned
  const key = title.toLowerCase().trim()
  return defaultLyricsByTitle[key] ?? ""
}

const fallbackSongs: Song[] = [
  {
    id: "1",
    title: "Bungong Jeumpa",
    region: "Aceh",
    language: "Bahasa Aceh",
    description:
      "Nyanyian tentang bunga cempaka, dengan melodi lembut yang lekat dengan identitas masyarakat Aceh.",
    lyrics: defaultLyricsByTitle["bungong jeumpa"],
  },
  {
    id: "2",
    title: "Ampar-Ampar Pisang",
    region: "Kalimantan Selatan",
    language: "Bahasa Banjar",
    description:
      "Lagu tentang pisang dijemur. Iramanya ceria dan akrab dalam permainan anak masyarakat Banjar.",
    lyrics: defaultLyricsByTitle["ampar-ampar pisang"],
  },
  {
    id: "3",
    title: "Apuse",
    region: "Papua",
    language: "Bahasa Biak",
    description:
      "Kisah seorang cucu yang berpamitan kepada kakek dan neneknya untuk pergi merantau.",
    lyrics: defaultLyricsByTitle["apuse"],
  },
  {
    id: "4",
    title: "Manuk Dadali",
    region: "Jawa Barat",
    language: "Bahasa Sunda",
    description:
      "Burung garuda menjadi lambang keberanian dan persatuan dalam nyanyian berbahasa Sunda.",
    lyrics: defaultLyricsByTitle["manuk dadali"],
  },
  {
    id: "5",
    title: "Soleram",
    region: "Riau",
    language: "Bahasa Melayu",
    description:
      "Nyanyian lembut yang membawa pesan menjaga persahabatan dan menghormati satu sama lain.",
    lyrics: defaultLyricsByTitle["soleram"],
  },
  {
    id: "6",
    title: "Rasa Sayange",
    region: "Maluku",
    language: "Bahasa Melayu Ambon",
    description:
      "Pantun yang dinyanyikan berbalas, merayakan kehangatan dan kedekatan dalam kebersamaan.",
    lyrics: defaultLyricsByTitle["rasa sayange"],
  },
  {
    id: "7",
    title: "Kicir-Kicir",
    region: "DKI Jakarta",
    language: "Bahasa Betawi",
    description:
      "Lagu riang penghibur hati khas Betawi dengan pantun jenaka yang mengundang tawa.",
    lyrics: defaultLyricsByTitle["kicir-kicir"],
  },
  {
    id: "8",
    title: "Gundul-Gundul Pacul",
    region: "Jawa Tengah",
    language: "Bahasa Jawa",
    description:
      "Lagu dolanan anak sarat nasihat kepemimpinan agar seorang pemimpin tidak sombong dan amanah.",
    lyrics: defaultLyricsByTitle["gundul-gundul pacul"],
  },
  {
    id: "9",
    title: "Bolelebo",
    region: "Nusa Tenggara Timur",
    language: "Bahasa Rote",
    description:
      "Lagu rindu kampung halaman Pulau Rote yang mengekspresikan betapa manisnya tanah kelahiran.",
    lyrics: defaultLyricsByTitle["bolelebo"],
  },
  {
    id: "10",
    title: "O Ina Ni Keke",
    region: "Sulawesi Utara",
    language: "Bahasa Minahasa",
    description:
      "Percakapan penuh kasih antara ibu dan anak perempuannya yang hendak berpergian ke Wenang.",
    lyrics: defaultLyricsByTitle["o ina ni keke"],
  },
  {
    id: "11",
    title: "Yamko Rambe Yamko",
    region: "Papua",
    language: "Bahasa Papua",
    description:
      "Irama penuh semangat perjuangan dan keberanian yang populer di berbagai penjuru negeri.",
    lyrics: defaultLyricsByTitle["yamko rambe yamko"],
  },
  {
    id: "12",
    title: "Ayo Mama",
    region: "Maluku",
    language: "Bahasa Ambon",
    description:
      "Lagu bernada ceria khas Maluku yang mengisahkan rayuan pemuda dengan suasana santai.",
    lyrics: defaultLyricsByTitle["ayo mama"],
  },
]

function resolveAudioUrl(audio?: string): string | undefined {
    if (!audio) return undefined
    let resolved = audio.trim()
    if (!resolved) return undefined
    if (resolved.startsWith("http://")) {
        resolved = resolved.replace(/^http:\/\//, "https://")
    } else if (!resolved.startsWith("http://") && !resolved.startsWith("https://")) {
        const base = API_URL ? API_URL.replace(/\/$/, "") : ""
        resolved = `${base}/${resolved.replace(/^\//, "")}`
    }
    return resolved
}

function formatRegion(region?: string): string {
    if (!region) return "Nusantara"
    const trimmed = region.trim()
    if (trimmed === trimmed.toUpperCase() && trimmed.length > 3) {
        return trimmed
            .toLowerCase()
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")
    }
    return trimmed
}

// In-memory cache agar audio yang sudah dimuat tidak perlu didownload ulang
const audioBlobCache = new Map<string, string>()

function SongAudio({
    src,
    autoLoad = false,
    layout = "card",
}: {
    src?: string
    autoLoad?: boolean
    layout?: "card" | "modal"
}) {
    const [blobUrl, setBlobUrl] = useState<string | null>(() => {
        if (!src) return null
        const resolved = resolveAudioUrl(src)
        return resolved ? audioBlobCache.get(resolved) ?? null : null
    })
    const [loading, setLoading] = useState(false)
    const [failed, setFailed] = useState(false)
    const audioRef = useRef<HTMLAudioElement | null>(null)

    const resolvedSrc = useMemo(() => resolveAudioUrl(src), [src])

    const loadAudio = (targetUrl: string, signal?: AbortSignal) => {
        if (audioBlobCache.has(targetUrl)) {
            setBlobUrl(audioBlobCache.get(targetUrl)!)
            setLoading(false)
            setFailed(false)
            return
        }

        setLoading(true)
        setFailed(false)

        fetch(targetUrl, {
            signal,
            headers: { "ngrok-skip-browser-warning": "true" },
        })
            .then((res) => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`)
                return res.blob()
            })
            .then((blob) => {
                const objectUrl = URL.createObjectURL(blob)
                audioBlobCache.set(targetUrl, objectUrl)
                setBlobUrl(objectUrl)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    console.error("Gagal memuat audio:", targetUrl, err)
                    setFailed(true)
                }
            })
            .finally(() => {
                if (!signal?.aborted) {
                    setLoading(false)
                }
            })
    }

    useEffect(() => {
        if (!resolvedSrc) {
            setBlobUrl(null)
            return
        }

        if (audioBlobCache.has(resolvedSrc)) {
            setBlobUrl(audioBlobCache.get(resolvedSrc)!)
            return
        }

        if (autoLoad) {
            const controller = new AbortController()
            loadAudio(resolvedSrc, controller.signal)
            return () => controller.abort()
        }
    }, [resolvedSrc, autoLoad])

    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
            }
        }
    }, [])

    if (!resolvedSrc) return null

    if (layout === "modal") {
        if (loading) {
            return (
                <div className="flex items-center gap-3 py-1 text-xs font-medium text-[#253b31]">
                    <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#ad5036] border-t-transparent" />
                    <span>Sedang menyiapkan audio lagu dari server...</span>
                </div>
            )
        }

        if (failed) {
            return (
                <div className="flex items-center justify-between text-xs text-[#ad5036]">
                    <span>Gagal memuat file audio lagu.</span>
                    <button
                        type="button"
                        onClick={() => resolvedSrc && loadAudio(resolvedSrc)}
                        className="rounded-md bg-[#ad5036] px-3 py-1 font-semibold text-white transition hover:opacity-90"
                    >
                        Coba Lagi
                    </button>
                </div>
            )
        }

        if (blobUrl) {
            return (
                <audio
                    ref={audioRef}
                    controls
                    autoPlay
                    src={blobUrl}
                    className="w-full rounded-md outline-none"
                >
                    Browser Anda tidak mendukung pemutar audio.
                </audio>
            )
        }

        return (
            <button
                type="button"
                onClick={() => resolvedSrc && loadAudio(resolvedSrc)}
                className="flex items-center gap-2 rounded-lg bg-[#ad5036] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
            >
                <span>▶ Putar Melodi</span>
            </button>
        )
    }

    // Card layout
    if (blobUrl) {
        return (
            <audio
                ref={audioRef}
                controls
                autoPlay
                src={blobUrl}
                className={styles.audioPlayer}
            >
                Browser Anda tidak mendukung pemutar audio.
            </audio>
        )
    }

    if (loading) {
        return (
            <div className="flex h-9 w-full items-center justify-center gap-2 rounded-md bg-[#eee7da] px-3 text-xs text-[#6e7268]">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-[#ad5036] border-t-transparent" />
                <span>Memuat audio...</span>
            </div>
        )
    }

    if (failed) {
        return (
            <button
                type="button"
                onClick={() => resolvedSrc && loadAudio(resolvedSrc)}
                className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#f5c6cb] bg-[#fcf2ee] text-xs font-semibold text-[#ad5036] transition hover:bg-[#fadbd8]"
            >
                <span>Gagal memuat · Coba lagi</span>
            </button>
        )
    }

    return (
        <button
            type="button"
            onClick={() => resolvedSrc && loadAudio(resolvedSrc)}
            className="flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#d9cebe] bg-[#f7f3eb] text-xs font-semibold text-[#253b31] transition hover:border-[#ad5036] hover:bg-[#ad5036] hover:text-white"
        >
            <span className="text-xs">▶</span>
            <span>Putar lagu</span>
        </button>
    )
}

function useSongs() {
    const [songs, setSongs] = useState<Song[]>(fallbackSongs)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const controller = new AbortController()

        if (!API_URL) {
            setLoading(false)
            return
        }

        fetch(`${API_URL}/v1/songs`, {
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
                if (Array.isArray(list) && list.length > 0) {
                    setSongs(
                        list.map((item: any) => ({
                            id: item.id ?? item.title ?? item.name,
                            title: item.title ?? item.name ?? "Lagu Daerah",
                            region: formatRegion(item.province?.name ?? item.region),
                            language: item.language
                                ? item.language.startsWith("Bahasa")
                                    ? item.language
                                    : `Bahasa ${item.language}`
                                : "",
                            composer: item.composer ?? "",
                            description:
                                item.description ?? "Warisan melodi tradisional Nusantara.",
                            lyrics: getSongLyrics(
                                item.title ?? item.name ?? "",
                                item.lyrics ?? item.lirik ?? item.lyric,
                            ),
                            audio: resolveAudioUrl(item.audio_url ?? item.audio),
                        })),
                    )
                }
                setError(null)
            })
            .catch((err) => {
                if (err.name !== "AbortError") {
                    setError(err.message)
                }
            })
            .finally(() => setLoading(false))

        return () => controller.abort()
    }, [])

    return { songs, loading, error }
}

const ITEMS_PER_PAGE = 6

const JelajahiLagu: FunctionComponent = () => {
    const { songs, loading, error } = useSongs()

    const [query, setQuery] = useState("")
    const [region, setRegion] = useState("Semua daerah")
    const [sort, setSort] = useState("Pilihan editor")
    const [currentPage, setCurrentPage] = useState(1)
    const [selectedSong, setSelectedSong] = useState<Song | null>(null)

    const regions = useMemo(() => {
        return [
            "Semua daerah",
            ...Array.from(new Set(songs.map((s) => s.region).filter(Boolean))),
        ]
    }, [songs])

    const filteredSongs = useMemo(() => {
        const result = songs.filter((song) => {
            const text = `${song.title} ${song.region} ${song.language} ${song.description} ${song.composer ?? ""}`.toLowerCase()
            const matchesQuery = !query || text.includes(query.toLowerCase())
            const matchesRegion = region === "Semua daerah" || song.region === region
            return matchesQuery && matchesRegion
        })

        if (sort === "Nama A–Z") {
            return [...result].sort((a, b) => a.title.localeCompare(b.title))
        }
        if (sort === "Nama Z–A") {
            return [...result].sort((a, b) => b.title.localeCompare(a.title))
        }
        return result
    }, [songs, query, region, sort])

    const totalPages = Math.max(
        1,
        Math.ceil(filteredSongs.length / ITEMS_PER_PAGE),
    )

    const paginatedSongs = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE
        return filteredSongs.slice(start, start + ITEMS_PER_PAGE)
    }, [filteredSongs, currentPage])

    const startIdx = filteredSongs.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredSongs.length)

    return (
        <div className={styles.jelajahiLagu}>
            <div className={styles.navigasiDanPengantar}>
                <nav className={styles.navigasi}>
                    <Link to="/" className={styles.identitasSitus} aria-label="Budaya Indonesia">
                        <img
                            className={styles.lambangTenunIcon}
                            alt=""
                            src="/assets/3eee3.svg"
                        />
                        <div className={styles.namaSitus}>Budaya Indonesia</div>
                    </Link>
                    <div className={styles.menuUtama}>
                        <Link to="/" className={styles.namaSitus}>
                            Beranda
                        </Link>
                        <div className={styles.menuKategori}>
                            <div className={styles.menuAktif}>Ragam budaya</div>
                            <img
                                className={styles.pilihanKategoriIcon}
                                alt=""
                                src="/assets/bb805.svg"
                            />
                        </div>
                        <Link to="/#cerita" className={styles.namaSitus}>
                            Cerita Nusantara
                        </Link>
                        <Link to="/#tentang" className={styles.namaSitus}>
                            Tentang kami
                        </Link>
                    </div>
                    <div className={styles.pencarianSitus}>
                        <img
                            className={styles.cariIcon}
                            alt=""
                            src="/assets/17800.svg"
                        />
                        <div className={styles.labelPencarian}>Cari budaya</div>
                    </div>
                </nav>

                <div className={styles.pengantarPenjelajahan}>
                    <div className={styles.jejakHalaman}>
                        <Link to="/" className={styles.namaSitus}>
                            Beranda
                        </Link>
                        <div className={styles.namaSitus}>/</div>
                        <Link to="/#ragam" className={styles.namaSitus}>
                            Ragam budaya
                        </Link>
                        <div className={styles.namaSitus}>/</div>
                        <div className={styles.halamanAktif}>Lagu daerah</div>
                    </div>
                    <div className={styles.judulDanPengantar}>
                        <div className={styles.judulHalaman}>
                            <div className={styles.penandaKategori}>
                                <div className={styles.namaSitus}>01</div>
                                <div className={styles.garisAksen} />
                                <div className={styles.menuAktif}>LAGU DAERAH</div>
                            </div>
                            <div className={styles.judul}>Jelajahi Lagu</div>
                            <div className={styles.petunjukPenjelajahan}>
                                Temukan lirik, bahasa, dan cerita di balik melodi Nusantara.
                            </div>
                        </div>
                        <div className={styles.catatanEditorial}>
                            <div className={styles.pengantar}>
                                Lagu daerah menyimpan bahasa, kenangan, dan keseharian
                                masyarakat. Satu melodi bisa membawa kita pulang.
                            </div>
                            <div className={styles.jangkauanKoleksi}>
                                Dari Sabang sampai Merauke.
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <section className="mx-auto w-full max-w-[1440px] px-5 py-7 sm:px-8 lg:px-20">
                <div className="grid gap-4 rounded-2xl bg-[#eee7da] p-5 md:grid-cols-[2fr_1fr] md:p-6">
                    <label className="filter-label">
                        Mau mendengarkan lagu apa?
                        <input
                            value={query}
                            onChange={(event) => {
                                setQuery(event.target.value)
                                setCurrentPage(1)
                            }}
                            className="filter-input"
                            placeholder="Cari judul lagu, lirik, atau daerah asal..."
                        />
                        <span>Contoh: “Bungong Jeumpa”, “Sunda”, atau “Aceh”</span>
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
                                <option key={item} value={item}>
                                    {item}
                                </option>
                            ))}
                        </select>
                        <span>Sesuaikan pencarian berdasarkan provinsi.</span>
                    </label>
                </div>
            </section>

            <div className={styles.koleksiLagu}>
                <div className={styles.kepalaKoleksi}>
                    <div className={styles.ringkasanKoleksi}>
                        <div className={styles.namaSitus}>
                            Melodi dari seluruh penjuru.
                        </div>
                        <div className={styles.jumlahHasil}>
                            {loading
                                ? "Memuat lagu dari database..."
                                : `Menampilkan ${startIdx}–${endIdx} dari ${filteredSongs.length} lagu daerah`}
                        </div>
                    </div>
                    <div className={styles.urutanKoleksi}>
                        <div className={styles.labelPencarian}>Urutkan:</div>
                        <div className={styles.urutkanLagu}>
                            <div className={styles.pilihan2}>
                                <select
                                    value={sort}
                                    onChange={(event) => setSort(event.target.value)}
                                    className="w-full cursor-pointer bg-transparent text-[#2b2a26] outline-none"
                                    aria-label="Urutkan lagu"
                                >
                                    <option value="Pilihan editor">Pilihan editor</option>
                                    <option value="Nama A–Z">Nama A–Z</option>
                                    <option value="Nama Z–A">Nama Z–A</option>
                                </select>
                                <img
                                    className={styles.chevronDownIcon}
                                    alt=""
                                    src="/assets/bb805.svg"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="w-full rounded-lg bg-[#fcf2ee] p-3 text-xs text-[#ad5036]">
                        Server sedang offline ({error}). Menampilkan koleksi arsip lagu daerah.
                    </div>
                )}

                {paginatedSongs.length > 0 ? (
                    <div className={styles.pilihanLaguGrid}>
                        {paginatedSongs.map((song) => (
                            <div className={styles.laguDaerah} key={song.id}>
                                <div className={styles.rincianCerita}>
                                    <div className={styles.metadataDanStatus}>
                                        <div className={styles.metadata}>
                                            {[song.region, song.language]
                                                .filter(Boolean)
                                                .join(" · ")}
                                        </div>
                                    </div>
                                    <div className={styles.cerita}>
                                        <div className={styles.judulCatatan}>{song.title}</div>
                                        <div className={styles.teksPenjelas}>
                                            {song.description}
                                        </div>
                                    </div>
                                    {song.composer && (
                                        <div className="text-xs text-[#6e7268]">
                                            Pencipta: {song.composer}
                                        </div>
                                    )}
                                    {song.audio && (
                                        <div className="w-full">
                                            <SongAudio src={song.audio} layout="card" />
                                        </div>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setSelectedSong(song)}
                                        className={styles.tombolAksi}
                                    >
                                        <span className={styles.menuAktif}>{`Lirik & cerita`}</span>
                                        <img
                                            className={styles.arrowRightIcon}
                                            alt=""
                                            src="/assets/6590d.svg"
                                        />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="w-full py-16 text-center text-[#6e7268]">
                        <p className="mb-3 text-base">
                            Tidak ada lagu yang cocok dengan pencarian “{query}”.
                        </p>
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("")
                                setRegion("Semua daerah")
                            }}
                            className="rounded-md bg-[#ad5036] px-4 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                            Reset Filter
                        </button>
                    </div>
                )}

                {totalPages > 1 && (
                    <div className={styles.penelusuranHalaman}>
                        <div className={styles.labelPencarian}>
                            Halaman {currentPage} dari {totalPages} · {ITEMS_PER_PAGE} lagu per halaman
                        </div>
                        <div className={styles.paginationLagu}>
                            <button
                                type="button"
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                className={`${styles.halamanBiasa} ${styles.tombolHalaman} ${currentPage === 1 ? styles.halamanSebelumnyaNonaktif : ""
                                    }`}
                                aria-label="Halaman sebelumnya"
                            >
                                <img
                                    className={styles.chevronDownIcon}
                                    alt=""
                                    src="/assets/bb805.svg"
                                    style={{ transform: "rotate(90deg)" }}
                                />
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                                (pageNum) => (
                                    <button
                                        key={pageNum}
                                        type="button"
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`${pageNum === currentPage
                                            ? `${styles.halamanAktif2} ${styles.tombolHalamanAktif}`
                                            : `${styles.halamanBiasa} ${styles.tombolHalaman}`
                                            }`}
                                    >
                                        <div className={styles.nomor}>{pageNum}</div>
                                    </button>
                                ),
                            )}
                            <button
                                type="button"
                                disabled={currentPage === totalPages}
                                onClick={() =>
                                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                                }
                                className={`${styles.halamanBiasa} ${styles.tombolHalaman} ${currentPage === totalPages
                                    ? styles.halamanSebelumnyaNonaktif
                                    : ""
                                    }`}
                                aria-label="Halaman berikutnya"
                            >
                                <img
                                    className={styles.chevronDownIcon}
                                    alt=""
                                    src="/assets/bb805.svg"
                                    style={{ transform: "rotate(-90deg)" }}
                                />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <div className={styles.catatanBudayaDanFooter}>
                <div className={styles.catatanKeberagaman}>
                    <img
                        className={styles.lambangTenunIcon}
                        alt=""
                        src="/assets/3eee3.svg"
                    />
                    <div className={styles.pesanPelestarian}>
                        <div className={styles.judulCatatan}>Satu lagu, banyak ingatan.</div>
                        <div className={styles.teksPenjelas}>
                            Lirik dan penyebutan asal dapat memiliki variasi. Kenali setiap
                            lagu dengan menghormati bahasa dan masyarakat yang merawatnya.
                        </div>
                    </div>
                </div>
                <footer className={styles.footer}>
                    <div className={styles.informasiSitus}>
                        <div className={styles.identitas}>
                            <div className={styles.namaSitus}>Budaya Indonesia</div>
                            <div className={styles.semboyan}>
                                Merawat warisan, menghubungkan cerita.
                            </div>
                        </div>
                        <div className={styles.tautanFooter}>
                            <Link to="/#ragam" className={styles.labelPencarian}>
                                Ragam budaya
                            </Link>
                            <Link to="/#cerita" className={styles.labelPencarian}>
                                Cerita Nusantara
                            </Link>
                            <Link to="/#tentang" className={styles.labelPencarian}>
                                Tentang kami
                            </Link>
                        </div>
                    </div>
                    <div className={styles.hakCipta}>
                        <div className={styles.namaSitus}>© 2026 Budaya Indonesia</div>
                        <div className={styles.namaSitus}>
                            Ruang untuk mengenal dan menghargai Nusantara.
                        </div>
                    </div>
                </footer>
            </div>

            {selectedSong && (
                <div
                    role="dialog"
                    aria-modal="true"
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-5 backdrop-blur-sm"
                    onClick={() => setSelectedSong(null)}
                >
                    <div
                        className="relative w-full max-w-lg rounded-2xl border border-[#d9cebe] bg-[#fffcf6] p-7 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            onClick={() => setSelectedSong(null)}
                            className="absolute right-4 top-4 text-xl text-[#6e7268] hover:text-[#253b31]"
                            aria-label="Tutup jendela"
                        >
                            ✕
                        </button>
                        <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-[#ad5036]">
                            {[selectedSong.region, selectedSong.language]
                                .filter(Boolean)
                                .join(" · ")}
                        </div>
                        <h3 className="mb-3 font-['DM_Serif_Display',Georgia,serif] text-3xl text-[#253b31]">
                            {selectedSong.title}
                        </h3>
                        {selectedSong.composer && (
                            <p className="mb-3 text-xs text-[#6e7268]">
                                <b>Pencipta:</b> {selectedSong.composer}
                            </p>
                        )}
                        <p className="mb-5 text-sm leading-relaxed text-[#555]">
                            {selectedSong.description}
                        </p>
                        <div className="mb-5">
                            <span className="mb-1.5 block text-xs font-semibold text-[#253b31]">
                                Lirik Lagu:
                            </span>
                            {selectedSong.lyrics ? (
                                <div className="max-h-48 overflow-y-auto whitespace-pre-line rounded-xl border border-[#d9cebe] bg-[#f7f3eb] p-3 text-xs leading-relaxed text-[#444]">
                                    {selectedSong.lyrics}
                                </div>
                            ) : (
                                <div className="rounded-xl border border-[#d9cebe] bg-[#f7f3eb] p-3 text-xs italic text-[#6e7268]">
                                    Lirik lagu belum tersedia untuk lagu ini.
                                </div>
                            )}
                        </div>
                        {selectedSong.audio ? (
                            <div className="mt-4 rounded-xl bg-[#eee7da] p-4">
                                <span className="mb-2 block text-xs font-semibold text-[#253b31]">
                                    Dengarkan Melodi:
                                </span>
                                <SongAudio src={selectedSong.audio} autoLoad layout="modal" />
                            </div>
                        ) : (
                            <div className="mt-4 rounded-xl bg-[#f7f3eb] p-3 text-xs italic text-[#6e7268]">
                                Audio melodi belum tersedia untuk lagu ini.
                            </div>
                        )}
                        <div className="mt-6 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setSelectedSong(null)}
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

export default JelajahiLagu
