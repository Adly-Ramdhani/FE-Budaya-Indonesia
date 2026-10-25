import { field, type DetailFieldConfig } from "../formFields"

export const pakaianAdatFields: DetailFieldConfig[] = [
  field(
    "garmentType",

    "Jenis",

    "select",

    [
      "Atasan",

      "Bawahan",

      "Kain",

      "Penutup kepala",

      "Aksesori",

      "Set lengkap",
    ],

    "Pilihan: Atasan · Bawahan · Kain · Penutup kepala · Aksesori · Set lengkap",
  ),

  field(
    "wearer",

    "Pemakai",

    "select",

    ["Perempuan", "Laki-laki", "Pengantin", "Anak"],

    "Pilihan: Perempuan · Laki-laki · Pengantin · Anak",
  ),

  field(
    "fabric",

    "Bahan & teknik",

    "text",

    undefined,

    undefined,

    false,

    "Kain tenun; teknik sesuai daerah",
  ),

  field(
    "colors",

    "Warna & motif",

    "text",

    undefined,

    undefined,

    false,

    "Warna cerah polos; sarung bermotif tenun",
  ),

  field(
    "occasion",

    "Dipakai saat",

    "text",

    undefined,

    undefined,

    true,

    "Upacara adat, pernikahan, atau keseharian",
  ),

  field(
    "meaning",

    "Makna & kelengkapan",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan makna busana dan kelengkapannya.",
  ),
]
