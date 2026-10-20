import { Navigate, Route, Routes } from "react-router-dom"

import HomePage from "./pages/HomePage"

import MakananPage from "./pages/MakananPage"

import RumahAdatPage from "./pages/RumahAdatPage"

import DetailView from "./components/DetailView"

import LaguPage from "./pages/LaguPage"

import LoginPage from "./pages/LoginPage"

import AdminDashboard from "./pages/AdminDashboard"

import AdminCategoryPage from "./pages/AdminCategoryPage"
import AdminContentForm from "./pages/AdminContentForm"

import { AdminStaticStub } from "./pages/AdminStubPage"

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
      <Route path="/dashboard" element={<AdminDashboard />} />
      <Route
        path="/admin/dashboard"
        element={<Navigate to="/dashboard" replace />}
      />
      <Route
        path="/admin/media-library"
        element={<AdminStaticStub path="/admin/media-library" />}
      />
      <Route
        path="/admin/pengguna-admin"
        element={<AdminStaticStub path="/admin/pengguna-admin" />}
      />
      <Route
        path="/admin/pengaturan"
        element={<AdminStaticStub path="/admin/pengaturan" />}
      />
      <Route
        path="/admin/:category/baru"
        element={<AdminContentForm mode="create" />}
      />
      <Route
        path="/admin/:category/:slug/edit"
        element={<AdminContentForm mode="edit" />}
      />
      <Route path="/admin/:category" element={<AdminCategoryPage />} />
    </Routes>
  )
}
