import { field, type DetailFieldConfig } from "../formFields"

export const makananFields: DetailFieldConfig[] = [
  field(
    "foodType",

    "Jenis",

    "select",

    ["Hidangan utama", "Camilan", "Minuman", "Penutup"],

    "Pilihan: Hidangan utama · Camilan · Minuman · Penutup",

    true,
  ),

  field(
    "ingredients",

    "Bahan utama",

    "chips",

    undefined,

    undefined,

    true,

    "Tambah bahan utama",
  ),

  field(
    "cookingMethod",

    "Cara pengolahan",

    "select",

    ["Dimasak lama", "Digoreng", "Dikukus", "Dibakar", "Mentah/segar"],

    "Pilihan: Dimasak lama · Digoreng · Dikukus · Dibakar · Mentah/segar",

    true,
  ),

  {
    ...field(
      "taste",

      "Rasa dominan",

      "chips",

      undefined,

      "Pilihan: Gurih · Pedas · Manis · Asam",

      true,

      "Tambah rasa",
    ),

    suggestions: ["Gurih", "Pedas", "Manis", "Asam"],
  },

  field(
    "servingTime",

    "Disajikan saat",

    "text",

    undefined,

    undefined,

    true,

    "Jamuan keluarga, hari raya, atau upacara adat",
  ),

  field(
    "steps",

    "Langkah singkat",

    "steps",

    undefined,

    undefined,

    true,

    "Satu langkah per baris",
  ),
]
