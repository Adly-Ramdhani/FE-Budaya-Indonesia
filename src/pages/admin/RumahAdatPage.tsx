import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function RumahAdatPage() {
  return <AdminCategoryPage category="rumah-adat" />
}

export function RumahAdatFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="rumah-adat" mode={mode} />
}
