import { field, type DetailFieldConfig } from "../formFields"

export const senjataTradisionalFields: DetailFieldConfig[] = [
  field(
    "weaponType",

    "Jenis",

    "select",

    ["Tikam", "Tebas", "Lempar", "Pusaka upacara"],

    "Pilihan: Tikam · Tebas · Lempar · Pusaka upacara",
  ),

  field(
    "material",

    "Bahan pembuat",

    "text",

    undefined,

    undefined,

    false,

    "Besi, baja, kayu, atau bahan setempat",
  ),

  field(
    "craft",

    "Teknik pembuatan",

    "text",

    undefined,

    undefined,

    false,

    "Tempa lipat",
  ),

  field(
    "maker",

    "Pembuat",

    "text",

    undefined,

    undefined,

    false,

    "Nama empu atau komunitas perajin",
  ),

  field(
    "symbolicMeaning",

    "Fungsi & makna simbolis",

    "textarea",

    undefined,

    undefined,

    true,

    "Jelaskan fungsi budaya dan makna simbolisnya.",
  ),

  field(
    "preservation",

    "Status pelestarian",

    "select",

    ["Warisan UNESCO", "Terjaga", "Perlu pelestarian"],

    "Pilihan: Warisan UNESCO · Terjaga · Perlu pelestarian",

    true,
  ),
]
