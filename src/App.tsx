import { Navigate, Route, Routes } from "react-router-dom"

import HomePage from "./pages/HomePage"

import MakananPage from "./pages/MakananPage"

import RumahAdatPage from "./pages/RumahAdatPage"

import DetailView from "./components/DetailView"

import LaguPage from "./pages/LaguPage"

import LoginPage from "./pages/LoginPage"

import AdminDashboard from "./pages/AdminDashboard"

import LaguDaerahPage, {
  LaguDaerahFormPage,
} from "./pages/admin/LaguDaerahPage"
import TarianPage, { TarianFormPage } from "./pages/admin/TarianPage"
import AlatMusikPage, { AlatMusikFormPage } from "./pages/admin/AlatMusikPage"
import SenjataTradisionalPage, {
  SenjataTradisionalFormPage,
} from "./pages/admin/SenjataTradisionalPage"
import PakaianAdatPage, {
  PakaianAdatFormPage,
} from "./pages/admin/PakaianAdatPage"
import RumahAdatAdminPage, {
  RumahAdatFormPage,
} from "./pages/admin/RumahAdatPage"
import MakananAdminPage, { MakananFormPage } from "./pages/admin/MakananPage"
import DaerahProvinsiPage, {
  DaerahProvinsiFormPage,
} from "./pages/admin/DaerahProvinsiPage"
import AdminContentDetailPage from "./pages/admin/AdminContentDetailPage"

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
        path="/admin/:category/:slug/preview"
        element={<AdminContentDetailPage />}
      />
      <Route
        path="/admin/lagu-daerah/baru"
        element={<LaguDaerahFormPage mode="create" />}
      />
      <Route
        path="/admin/lagu-daerah/:slug/edit"
        element={<LaguDaerahFormPage mode="edit" />}
      />
      <Route path="/admin/lagu-daerah" element={<LaguDaerahPage />} />
      <Route
        path="/admin/tarian/baru"
        element={<TarianFormPage mode="create" />}
      />
      <Route
        path="/admin/tarian/:slug/edit"
        element={<TarianFormPage mode="edit" />}
      />
      <Route path="/admin/tarian" element={<TarianPage />} />
      <Route
        path="/admin/alat-musik/baru"
        element={<AlatMusikFormPage mode="create" />}
      />
      <Route
        path="/admin/alat-musik/:slug/edit"
        element={<AlatMusikFormPage mode="edit" />}
      />
      <Route path="/admin/alat-musik" element={<AlatMusikPage />} />
      <Route
        path="/admin/senjata-tradisional/baru"
        element={<SenjataTradisionalFormPage mode="create" />}
      />
      <Route
        path="/admin/senjata-tradisional/:slug/edit"
        element={<SenjataTradisionalFormPage mode="edit" />}
      />
      <Route
        path="/admin/senjata-tradisional"
        element={<SenjataTradisionalPage />}
      />
      <Route
        path="/admin/pakaian-adat/baru"
        element={<PakaianAdatFormPage mode="create" />}
      />
      <Route
        path="/admin/pakaian-adat/:slug/edit"
        element={<PakaianAdatFormPage mode="edit" />}
      />
      <Route path="/admin/pakaian-adat" element={<PakaianAdatPage />} />
      <Route
        path="/admin/rumah-adat/baru"
        element={<RumahAdatFormPage mode="create" />}
      />
      <Route
        path="/admin/rumah-adat/:slug/edit"
        element={<RumahAdatFormPage mode="edit" />}
      />
      <Route path="/admin/rumah-adat" element={<RumahAdatAdminPage />} />
      <Route
        path="/admin/makanan/baru"
        element={<MakananFormPage mode="create" />}
      />
      <Route
        path="/admin/makanan/:slug/edit"
        element={<MakananFormPage mode="edit" />}
      />
      <Route path="/admin/makanan" element={<MakananAdminPage />} />
      <Route
        path="/admin/daerah-provinsi/baru"
        element={<DaerahProvinsiFormPage mode="create" />}
      />
      <Route
        path="/admin/daerah-provinsi/:slug/edit"
        element={<DaerahProvinsiFormPage mode="edit" />}
      />
      <Route path="/admin/daerah-provinsi" element={<DaerahProvinsiPage />} />
    </Routes>
  )
}
