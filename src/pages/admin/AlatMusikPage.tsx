import AdminCategoryPage from "../AdminCategoryPage"
import AdminContentForm from "../AdminContentForm"

export default function AlatMusikPage() {
  return <AdminCategoryPage category="alat-musik" />
}

export function AlatMusikFormPage({ mode }: { mode: "create" | "edit" }) {
  return <AdminContentForm category="alat-musik" mode={mode} />
}
