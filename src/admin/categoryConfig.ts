import {
  Drum,
  House,
  Music2,
  PersonStanding,
  Shirt,
  Swords,
  Utensils,
  MapPinned,
} from "lucide-react"
import type { CategoryConfig, CategoryKey, ProvinceRecord } from "./types"

export const regions = [
  "Sumatra",
  "Jawa",
  "Bali & Nusa Tenggara",
  "Kalimantan",
  "Sulawesi",
  "Maluku & Papua",
] as const

export const provinces: ProvinceRecord[] = [
  { name: "Aceh", region: "Sumatra", capital: "Banda Aceh" },
  { name: "Sumatera Utara", region: "Sumatra", capital: "Medan" },
  { name: "Sumatera Barat", region: "Sumatra", capital: "Padang" },
  { name: "Riau", region: "Sumatra", capital: "Pekanbaru" },
  { name: "Jambi", region: "Sumatra", capital: "Jambi" },
  { name: "Sumatera Selatan", region: "Sumatra", capital: "Palembang" },
  { name: "Bengkulu", region: "Sumatra", capital: "Bengkulu" },
  { name: "Lampung", region: "Sumatra", capital: "Bandar Lampung" },
  {
    name: "Kepulauan Bangka Belitung",
    region: "Sumatra",
    capital: "Pangkalpinang",
  },
  { name: "Kepulauan Riau", region: "Sumatra", capital: "Tanjungpinang" },
  { name: "DKI Jakarta", region: "Jawa", capital: "Jakarta" },
  { name: "Jawa Barat", region: "Jawa", capital: "Bandung" },
  { name: "Jawa Tengah", region: "Jawa", capital: "Semarang" },
  { name: "DI Yogyakarta", region: "Jawa", capital: "Yogyakarta" },
  { name: "Jawa Timur", region: "Jawa", capital: "Surabaya" },
  { name: "Banten", region: "Jawa", capital: "Serang" },
  { name: "Bali", region: "Bali & Nusa Tenggara", capital: "Denpasar" },
  {
    name: "Nusa Tenggara Barat",
    region: "Bali & Nusa Tenggara",
    capital: "Mataram",
  },
  {
    name: "Nusa Tenggara Timur",
    region: "Bali & Nusa Tenggara",
    capital: "Kupang",
  },
  { name: "Kalimantan Barat", region: "Kalimantan", capital: "Pontianak" },
  { name: "Kalimantan Tengah", region: "Kalimantan", capital: "Palangka Raya" },
  { name: "Kalimantan Selatan", region: "Kalimantan", capital: "Banjarbaru" },
  { name: "Kalimantan Timur", region: "Kalimantan", capital: "Samarinda" },
  { name: "Kalimantan Utara", region: "Kalimantan", capital: "Tanjung Selor" },
  { name: "Sulawesi Utara", region: "Sulawesi", capital: "Manado" },
  { name: "Sulawesi Tengah", region: "Sulawesi", capital: "Palu" },
  { name: "Sulawesi Selatan", region: "Sulawesi", capital: "Makassar" },
  { name: "Sulawesi Tenggara", region: "Sulawesi", capital: "Kendari" },
  { name: "Gorontalo", region: "Sulawesi", capital: "Gorontalo" },
  { name: "Sulawesi Barat", region: "Sulawesi", capital: "Mamuju" },
  { name: "Maluku", region: "Maluku & Papua", capital: "Ambon" },
  { name: "Maluku Utara", region: "Maluku & Papua", capital: "Sofifi" },
  { name: "Papua", region: "Maluku & Papua", capital: "Jayapura" },
  { name: "Papua Barat", region: "Maluku & Papua", capital: "Manokwari" },
  { name: "Papua Selatan", region: "Maluku & Papua", capital: "Merauke" },
  { name: "Papua Tengah", region: "Maluku & Papua", capital: "Nabire" },
  { name: "Papua Pegunungan", region: "Maluku & Papua", capital: "Wamena" },
  { name: "Papua Barat Daya", region: "Maluku & Papua", capital: "Sorong" },
]

export const categoryConfigs: Record<CategoryKey, CategoryConfig> = {
  "lagu-daerah": {
    key: "lagu-daerah",
    title: "Lagu Daerah",
    subtitle: "Rawat cerita di balik melodi Nusantara.",
    addLabel: "Tambah Lagu",
    singular: "lagu",
    plural: "lagu",
    searchLabel: "Cari lagu",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: Music2,
    total: 58,
    published: 49,
    drafts: 9,
    previewPath: "/jelajah/lagu",
    seeds: [
      {
        title: "Bungong Jeumpa",
        province: "Aceh",
        region: "Sumatra",
        description:
          "Lagu tentang bunga jeumpa yang harum, lambang keindahan dan keramahan Aceh.",
      },
      {
        title: "Ampar-Ampar Pisang",
        province: "Kalimantan Selatan",
        region: "Kalimantan",
        description:
          "Lagu permainan khas Banjar yang riang dan mudah dinyanyikan bersama.",
      },
      {
        title: "Apuse",
        province: "Papua",
        region: "Maluku & Papua",
        description:
          "Lagu perpisahan penuh kasih dari tanah Papua yang dinyanyikan lintas generasi.",
      },
      {
        title: "Soleram",
        province: "Riau",
        region: "Sumatra",
        description:
          "Lagu pengantar tidur Melayu yang lembut, penuh kasih sayang.",
      },
      {
        title: "Cublak-Cublak Suweng",
        province: "Jawa Tengah",
        region: "Jawa",
        description:
          "Lagu dolanan anak Jawa dengan pesan tentang mencari ketenangan hati.",
      },
      {
        title: "O Ina Ni Keke",
        province: "Sulawesi Utara",
        region: "Sulawesi",
        description:
          "Lagu Minahasa tentang kerja sama dan kebersamaan di ladang.",
      },
    ],
  },
  tarian: {
    key: "tarian",
    title: "Tarian",
    subtitle: "Rawat cerita di balik setiap gerak Nusantara.",
    addLabel: "Tambah Tarian",
    singular: "tarian",
    plural: "tarian",
    searchLabel: "Cari tarian",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: PersonStanding,
    total: 66,
    published: 55,
    drafts: 11,
    previewPath: "/jelajah/tarian",
    seeds: [
      {
        title: "Tari Saman",
        province: "Aceh",
        region: "Sumatra",
        description:
          "Tarian Suku Gayo yang dibawakan penari duduk dengan tepukan dan gerak serempak.",
      },
      {
        title: "Tari Piring",
        province: "Sumatera Barat",
        region: "Sumatra",
        description:
          "Tarian Minangkabau dengan gerak lincah memainkan piring di kedua tangan.",
      },
      {
        title: "Tari Cakalele",
        province: "Maluku",
        region: "Maluku & Papua",
        description:
          "Tarian perang tradisional yang menggambarkan keberanian dan semangat juang.",
      },
      {
        title: "Tari Kecak",
        province: "Bali",
        region: "Bali & Nusa Tenggara",
        description:
          "Pertunjukan paduan suara “cak” yang mengiringi kisah Ramayana.",
      },
      {
        title: "Tari Pendet",
        province: "Bali",
        region: "Bali & Nusa Tenggara",
        description:
          "Tarian penyambutan yang anggun, lahir dari persembahan di pura.",
      },
      {
        title: "Tari Jaipong",
        province: "Jawa Barat",
        region: "Jawa",
        description:
          "Tarian pergaulan Sunda yang dinamis dengan iringan kendang.",
      },
    ],
  },
  "alat-musik": {
    key: "alat-musik",
    title: "Alat Musik",
    subtitle: "Rawat cerita di balik bunyi dan harmoni Nusantara.",
    addLabel: "Tambah Alat Musik",
    singular: "alat musik",
    plural: "alat musik",
    searchLabel: "Cari alat musik",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: Drum,
    total: 74,
    published: 62,
    drafts: 12,
    previewPath: "/jelajah/alat-musik",
    seeds: [
      {
        title: "Angklung",
        province: "Jawa Barat",
        region: "Jawa",
        description:
          "Bambu yang digoyangkan, nada yang berpadu. Harmoni lahir dari kebersamaan.",
      },
      {
        title: "Sasando",
        province: "Nusa Tenggara Timur",
        region: "Bali & Nusa Tenggara",
        description:
          "Dawai dari Pulau Rote dengan resonator daun lontar. Bunyinya lembut dan berlapis.",
      },
      {
        title: "Kolintang",
        province: "Sulawesi Utara",
        region: "Sulawesi",
        description:
          "Bilah kayu masyarakat Minahasa, dimainkan dalam ansambel melodi dan iringan.",
      },
      {
        title: "Saluang",
        province: "Sumatera Barat",
        region: "Sumatra",
        description:
          "Seruling bambu Minangkabau yang mengiringi dendang dan cerita masyarakat.",
      },
      {
        title: "Tifa",
        province: "Papua",
        region: "Maluku & Papua",
        description:
          "Tabuhan yang menyatukan irama, tarian, dan upacara dalam kehidupan masyarakat.",
      },
      {
        title: "Gamelan",
        province: "Jawa Tengah",
        region: "Jawa",
        description:
          "Gong dan bilah logam berpadu dalam tradisi karawitan yang diwariskan lintas generasi.",
      },
    ],
  },
  "senjata-tradisional": {
    key: "senjata-tradisional",
    title: "Senjata Tradisional",
    subtitle: "Rawat nilai seni, simbol, dan sejarah di balik kriya tempa.",
    addLabel: "Tambah Senjata",
    singular: "senjata",
    plural: "senjata",
    searchLabel: "Cari senjata",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: Swords,
    total: 31,
    published: 26,
    drafts: 5,
    previewPath: "/jelajah/senjata-tradisional",
    seeds: [
      {
        title: "Keris",
        province: "Jawa Tengah",
        region: "Jawa",
        description:
          "Bilah berlekuk yang dipandang sebagai karya seni dan simbol identitas.",
      },
      {
        title: "Rencong",
        province: "Aceh",
        region: "Sumatra",
        description:
          "Senjata tradisional Aceh dengan bentuk menyerupai huruf “bismillah”.",
      },
      {
        title: "Mandau",
        province: "Kalimantan Tengah",
        region: "Kalimantan",
        description:
          "Mandau Dayak dengan ukiran dan hiasan yang sarat makna adat.",
      },
      {
        title: "Badik",
        province: "Sulawesi Selatan",
        region: "Sulawesi",
        description:
          "Pisau tradisional Bugis-Makassar yang melambangkan harga diri.",
      },
      {
        title: "Kujang",
        province: "Jawa Barat",
        region: "Jawa",
        description:
          "Pusaka Sunda berbentuk khas yang lekat dengan lambang daerah.",
      },
      {
        title: "Parang Salawaku",
        province: "Maluku",
        region: "Maluku & Papua",
        description:
          "Pasangan parang dan perisai Maluku yang hadir dalam tarian adat.",
      },
    ],
  },
  "pakaian-adat": {
    key: "pakaian-adat",
    title: "Pakaian Adat",
    subtitle: "Rawat cerita di balik helai kain dan motif Nusantara.",
    addLabel: "Tambah Pakaian Adat",
    singular: "pakaian adat",
    plural: "pakaian adat",
    searchLabel: "Cari pakaian adat",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: Shirt,
    total: 45,
    published: 38,
    drafts: 7,
    previewPath: "/jelajah/pakaian-adat",
    seeds: [
      {
        title: "Baju Bodo",
        province: "Sulawesi Selatan",
        region: "Sulawesi",
        description: "Busana perempuan Bugis yang anggun dalam kesederhanaan.",
      },
      {
        title: "Ulos dan Busana Batak",
        province: "Sumatera Utara",
        region: "Sumatra",
        description:
          "Kain tenun Batak yang menjadi lambang kasih sayang dan kehormatan.",
      },
      {
        title: "Payas Agung",
        province: "Bali",
        region: "Bali & Nusa Tenggara",
        description:
          "Busana pengantin Bali yang mewah, dipakai dalam upacara penting.",
      },
      {
        title: "Aesan Gede",
        province: "Sumatera Selatan",
        region: "Sumatra",
        description:
          "Busana adat Palembang dengan songket dan mahkota keemasan.",
      },
      {
        title: "Ulee Balang",
        province: "Aceh",
        region: "Sumatra",
        description:
          "Busana kebesaran bangsawan Aceh dengan sulaman benang emas.",
      },
      {
        title: "Baju Kurung Melayu",
        province: "Riau",
        region: "Sumatra",
        description:
          "Busana Melayu yang sopan dan elegan, dipakai dalam acara adat.",
      },
    ],
  },
  "rumah-adat": {
    key: "rumah-adat",
    title: "Rumah Adat",
    subtitle: "Rawat cerita ruang tinggal dan arsitektur Nusantara.",
    addLabel: "Tambah Rumah Adat",
    singular: "rumah adat",
    plural: "rumah adat",
    searchLabel: "Cari rumah adat",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: House,
    total: 40,
    published: 34,
    drafts: 6,
    previewPath: "/jelajah/rumah-adat",
    seeds: [
      {
        title: "Rumah Gadang",
        province: "Sumatera Barat",
        region: "Sumatra",
        description:
          "Rumah Minangkabau beratap gonjong, pusat keluarga besar dan adat.",
      },
      {
        title: "Tongkonan",
        province: "Sulawesi Selatan",
        region: "Sulawesi",
        description:
          "Rumah adat Toraja berbentuk perahu dengan ukiran penuh makna.",
      },
      {
        title: "Honai",
        province: "Papua Pegunungan",
        region: "Maluku & Papua",
        description:
          "Rumah bundar beratap jerami yang menghangatkan di tengah dinginnya pegunungan.",
      },
      {
        title: "Joglo",
        province: "Jawa Tengah",
        region: "Jawa",
        description:
          "Rumah Jawa dengan atap bertingkat yang melambangkan kedudukan pemiliknya.",
      },
      {
        title: "Rumah Betang",
        province: "Kalimantan Tengah",
        region: "Kalimantan",
        description:
          "Rumah panjang Dayak yang dihuni banyak keluarga dalam satu atap.",
      },
      {
        title: "Rumah Bolon",
        province: "Sumatera Utara",
        region: "Sumatra",
        description:
          "Rumah adat Batak Toba berbentuk panggung dengan ornamen khas.",
      },
    ],
  },
  makanan: {
    key: "makanan",
    title: "Makanan",
    subtitle: "Rawat cerita di balik rasa dan rempah Nusantara.",
    addLabel: "Tambah Makanan",
    singular: "makanan",
    plural: "makanan",
    searchLabel: "Cari makanan",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "content",
    icon: Utensils,
    total: 82,
    published: 70,
    drafts: 12,
    previewPath: "/jelajah/makanan",
    seeds: [
      {
        title: "Rendang",
        province: "Sumatera Barat",
        region: "Sumatra",
        description:
          "Daging dimasak perlahan dengan santan dan rempah hingga kering dan kaya rasa.",
      },
      {
        title: "Pempek",
        province: "Sumatera Selatan",
        region: "Sumatra",
        description:
          "Olahan ikan dan sagu yang disajikan dengan kuah cuko asam, manis, dan pedas.",
      },
      {
        title: "Papeda",
        province: "Papua",
        region: "Maluku & Papua",
        description:
          "Bubur sagu bening yang disantap bersama ikan kuah kuning.",
      },
      {
        title: "Gudeg",
        province: "DI Yogyakarta",
        region: "Jawa",
        description: "Nangka muda dimasak lama dengan santan dan gula kelapa.",
      },
      {
        title: "Coto Makassar",
        province: "Sulawesi Selatan",
        region: "Sulawesi",
        description:
          "Sup daging berkuah rempah pekat yang disantap dengan ketupat.",
      },
      {
        title: "Ayam Betutu",
        province: "Bali",
        region: "Bali & Nusa Tenggara",
        description:
          "Ayam berbumbu rempah yang dimasak lama hingga empuk dan harum.",
      },
    ],
  },
  "daerah-provinsi": {
    key: "daerah-provinsi",
    title: "Daerah & Provinsi",
    subtitle: "Atur provinsi dan sorotan daerah yang tampil di peta beranda.",
    addLabel: "Tambah Daerah",
    singular: "provinsi",
    plural: "provinsi",
    searchLabel: "Cari provinsi",
    searchPlaceholder: "Cari nama atau deskripsi...",
    kind: "province",
    icon: MapPinned,
    total: 38,
    published: 36,
    drafts: 2,
    previewPath: "/",
    seeds: [
      {
        title: "Nusa Tenggara Timur",
        region: "Bali & Nusa Tenggara",
        description: "Flores: tenun, kampung, dan ingatan leluhur.",
        capital: "Kupang",
        storyCount: 38,
      },
      {
        title: "Aceh",
        region: "Sumatra",
        description:
          "Tanah serambi Mekkah dengan tari, lagu, dan tradisi yang kuat.",
        capital: "Banda Aceh",
        storyCount: 24,
      },
      {
        title: "Bali",
        region: "Bali & Nusa Tenggara",
        description: "Seni, upacara, dan keseharian yang menyatu.",
        capital: "Denpasar",
        storyCount: 41,
      },
      {
        title: "Papua Pegunungan",
        region: "Maluku & Papua",
        description: "Honai, noken, dan budaya lembah tinggi.",
        capital: "Wamena",
        storyCount: 12,
      },
      {
        title: "Sulawesi Selatan",
        region: "Sulawesi",
        description: "Bugis, Makassar, dan Toraja dalam satu pulau.",
        capital: "Makassar",
        storyCount: 29,
      },
      {
        title: "Jawa Barat",
        region: "Jawa",
        description: "Sunda dengan bambu, kujang, dan jaipong.",
        capital: "Bandung",
        storyCount: 33,
      },
    ],
  },
}

export const categoryList = Object.values(categoryConfigs)

export function isCategoryKey(value: string | undefined): value is CategoryKey {
  return (
    value !== undefined &&
    Object.prototype.hasOwnProperty.call(categoryConfigs, value)
  )
}
