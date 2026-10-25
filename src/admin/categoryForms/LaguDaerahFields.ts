import { field, type DetailFieldConfig } from "../formFields"

export const laguDaerahFields: DetailFieldConfig[] = [
  field(
    "creator",

    "Pencipta",

    "text",

    undefined,

    "Atribusi pencipta masih perlu diverifikasi.",
  ),

  field("language", "Bahasa daerah", "select", [
    "Aceh",

    "Batak",

    "Minangkabau",

    "Sunda",

    "Jawa",

    "Bali",

    "Bugis",

    "Minahasa",

    "Melayu",

    "Lainnya",
  ]),

  field(
    "theme",

    "Tema lagu",

    "select",

    ["Kasih sayang", "Permainan anak", "Alam", "Perjuangan", "Upacara"],

    "Pilihan: Kasih sayang · Permainan anak · Alam · Perjuangan · Upacara",

    true,
  ),

  field(
    "lyrics",

    "Lirik asli",

    "textarea",

    undefined,

    "Tulis lirik penuh hanya untuk lagu anonim atau domain publik. Untuk lagu berhak cipta, cukup tautkan sumber.",

    true,

    "Tuliskan lirik atau tautkan sumber yang terverifikasi.",
  ),

  field(
    "translation",

    "Terjemahan Indonesia",

    "textarea",

    undefined,

    undefined,

    true,

    "Tambahkan terjemahan setelah sumber lirik terverifikasi.",
  ),

  {
    ...field(
      "copyright",

      "Status hak cipta",

      "select",

      ["Domain publik", "Berhak cipta, tautkan sumber"],

      "Pilihan: Domain publik · Berhak cipta, tautkan sumber",

      true,
    ),

    placeholder: "Pilih setelah verifikasi sumber",
  },
]
