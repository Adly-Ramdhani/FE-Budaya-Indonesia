import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function PakaianAdatPage() {
  return <AdminCategoryPage category="pakaian-adat" />
}

export function PakaianAdatFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="pakaian-adat" mode={mode} />
}
