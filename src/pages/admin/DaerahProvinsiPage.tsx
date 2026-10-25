import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function DaerahProvinsiPage() {
  return <AdminCategoryPage category="daerah-provinsi" />
}

export function DaerahProvinsiFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="daerah-provinsi" mode={mode} />
}
