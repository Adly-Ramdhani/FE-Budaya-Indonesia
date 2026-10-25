import type { ReactNode } from "react"
import { Navigate, Route, Routes, useLocation } from "react-router-dom"
import HomePage from "./pages/HomePage"
import MakananPage from "./pages/MakananPage"
import RumahAdatPage from "./pages/RumahAdatPage"
import DetailView from "./components/DetailView"
import LaguPage from "./pages/LaguPage"
import LoginPage from "./pages/LoginPage"
import AdminPage from "./pages/Admin/AdminPage"
import AlatMusikPage from "./pages/Admin/AlatMusik/AlatMusik"
import CreateAlatMusikPage from "./pages/Admin/AlatMusik/CreateAlatMusikPage"
import EditAlatMusikPage from "./pages/Admin/AlatMusik/EditAlatMusikPage"
import TarianPage from "./pages/Admin/Tarian/TarianPage"
import CreateTarianPage from "./pages/Admin/Tarian/CreateTarianPage"
import EditTarianPage from "./pages/Admin/Tarian/EditTarianPage"
import AdminDashboard from "./pages/AdminDashboard"

function AdminRoute({ children }: { children: ReactNode }) {
  const location = useLocation()
  const token =
    localStorage.getItem("auth_token") || sessionStorage.getItem("auth_token")

  return token ? (
    children
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

      // admin Musik
      <Route path="/admin/musik/:songId/edit" element={<AdminRoute> <AdminPage /> </AdminRoute>}/>
      <Route path="/admin/musik/tambah" element={ <AdminRoute> <AdminPage /> </AdminRoute>}/>
      <Route path="/admin/musik" element={ <AdminRoute><AdminPage /></AdminRoute>} />  
      <Route
        path="/admin/alat-musik"
        element={
          <AdminRoute>
            <AlatMusikPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/alat-musik/tambah"
        element={
          <AdminRoute>
            <CreateAlatMusikPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/alat-musik/:instrumentId/edit"
        element={
          <AdminRoute>
            <EditAlatMusikPage />
          </AdminRoute>
        }
      />

      <Route
        path="/admin/tarian/tambah"
        element={
          <AdminRoute>
            <CreateTarianPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tarian/:danceId/edit"
        element={
          <AdminRoute>
            <EditTarianPage />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/tarian"
        element={
          <AdminRoute>
            <TarianPage />
          </AdminRoute>
        }
      />

      <Route path="/admin/rumah-adat" element={<AdminRoute> <AdminPage /></AdminRoute>} />
      <Route path="/dashboard" element={ <AdminRoute> <AdminDashboard /></AdminRoute> }/>
    </Routes>
  )
}
