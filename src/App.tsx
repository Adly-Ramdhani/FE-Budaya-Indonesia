import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import MakananPage from "./pages/MakananPage"
import RumahAdatPage from "./pages/RumahAdatPage"
import DetailView from "./components/DetailView"
import LaguPage from "./pages/LaguPage"
import LoginPage from "./pages/LoginPage"
import AdminPage from "./pages/Admin/AdminPage"
import AdminDashboard from "./pages/AdminDashboard"

function AdminRoute() {
  const location = useLocation()
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")

  return token ? (
    <AdminPage />
  ) : (
    <Navigate to="/login" state={{ from: location }} replace />
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/jelajah/:category" element={<DetailView />} />
      <Route path="/jelajah/makanan" element={<MakananPage />} />
      <Route path="/jelajah/rumah-adat" element={<RumahAdatPage />} />
      <Route path="/jelajah/lagu" element={<LaguPage />} />
      <Route path="/jelajahi/lagu" element={<LaguPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/admin/musik" element={<AdminRoute />} />
      <Route path="/admin/rumah-adat" element={<AdminRoute />} />
       <Route path="/dashboard" element={<AdminDashboard/>} />

    </Routes>
  )
}
