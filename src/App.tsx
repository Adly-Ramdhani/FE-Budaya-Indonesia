import { Navigate, Route, Routes } from "react-router-dom"

import HomePage from "./pages/HomePage"

import MakananPage from "./pages/MakananPage"

import RumahAdatPage from "./pages/RumahAdatPage"

import DetailView from "./components/DetailView"

import LaguPage from "./pages/LaguPage"

import LoginPage from "./pages/LoginPage"

import AdminDashboard from "./pages/Admin/Dashboard/AdminDashboard"

import LaguDaerahPage from "./pages/Admin/LaguDaerah/LaguDaerah"
import CreateLaguDaerahPage from "./pages/Admin/LaguDaerah/CreateLaguDaerahPage"
import EditLaguDaerahPage from "./pages/Admin/LaguDaerah/EditLaguDaerahPage"
import TarianPage from "./pages/Admin/Tarian/Tarian"
import CreateTarianPage from "./pages/Admin/Tarian/CreateTarianPage"
import EditTarianPage from "./pages/Admin/Tarian/EditTarianPage"
import AlatMusikPage from "./pages/Admin/AlatMusik/AlatMusik"
import CreateAlatMusikPage from "./pages/Admin/AlatMusik/CreateAlatMusikPage"
import EditAlatMusikPage from "./pages/Admin/AlatMusik/EditAlatMusikPage"
import SenjataTradisionalPage from "./pages/Admin/SenjataTradisional/SenjataTradisional"
import CreateSenjataTradisionalPage from "./pages/Admin/SenjataTradisional/CreateSenjataTradisionalPage"
import EditSenjataTradisionalPage from "./pages/Admin/SenjataTradisional/EditSenjataTradisionalPage"
import PakaianAdatPage from "./pages/Admin/PakaianAdat/PakaianAdat"
import CreatePakaianAdatPage from "./pages/Admin/PakaianAdat/CreatePakaianAdatPage"
import EditPakaianAdatPage from "./pages/Admin/PakaianAdat/EditPakaianAdatPage"
import RumahAdatAdminPage from "./pages/Admin/RumahAdat/RumahAdat"
import CreateRumahAdatPage from "./pages/Admin/RumahAdat/CreateRumahAdatPage"
import EditRumahAdatPage from "./pages/Admin/RumahAdat/EditRumahAdatPage"
import MakananAdminPage from "./pages/Admin/Makanan/Makanan"
import CreateMakananPage from "./pages/Admin/Makanan/CreateMakananPage"
import EditMakananPage from "./pages/Admin/Makanan/EditMakananPage"
import DaerahProvinsiPage from "./pages/Admin/DaerahProvinsi/DaerahProvinsi"
import CreateDaerahProvinsiPage from "./pages/Admin/DaerahProvinsi/CreateDaerahProvinsiPage"
import EditDaerahProvinsiPage from "./pages/Admin/DaerahProvinsi/EditDaerahProvinsiPage"
import AdminContentDetailPage from "./pages/Admin/Shared/AdminContentDetailPage"

import { AdminStaticStub } from "./pages/Admin/Shared/AdminStubPage"

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
        element={<CreateLaguDaerahPage />}
      />
      <Route
        path="/admin/lagu-daerah/:slug/edit"
        element={<EditLaguDaerahPage />}
      />
      <Route path="/admin/lagu-daerah" element={<LaguDaerahPage />} />
      <Route path="/admin/tarian/baru" element={<CreateTarianPage />} />
      <Route path="/admin/tarian/:slug/edit" element={<EditTarianPage />} />
      <Route path="/admin/tarian" element={<TarianPage />} />
      <Route path="/admin/alat-musik/baru" element={<CreateAlatMusikPage />} />
      <Route
        path="/admin/alat-musik/:slug/edit"
        element={<EditAlatMusikPage />}
      />
      <Route path="/admin/alat-musik" element={<AlatMusikPage />} />
      <Route
        path="/admin/senjata-tradisional/baru"
        element={<CreateSenjataTradisionalPage />}
      />
      <Route
        path="/admin/senjata-tradisional/:slug/edit"
        element={<EditSenjataTradisionalPage />}
      />
      <Route
        path="/admin/senjata-tradisional"
        element={<SenjataTradisionalPage />}
      />
      <Route
        path="/admin/pakaian-adat/baru"
        element={<CreatePakaianAdatPage />}
      />
      <Route
        path="/admin/pakaian-adat/:slug/edit"
        element={<EditPakaianAdatPage />}
      />
      <Route path="/admin/pakaian-adat" element={<PakaianAdatPage />} />
      <Route path="/admin/rumah-adat/baru" element={<CreateRumahAdatPage />} />
      <Route
        path="/admin/rumah-adat/:slug/edit"
        element={<EditRumahAdatPage />}
      />
      <Route path="/admin/rumah-adat" element={<RumahAdatAdminPage />} />
      <Route path="/admin/makanan/baru" element={<CreateMakananPage />} />
      <Route path="/admin/makanan/:slug/edit" element={<EditMakananPage />} />
      <Route path="/admin/makanan" element={<MakananAdminPage />} />
      <Route
        path="/admin/daerah-provinsi/baru"
        element={<CreateDaerahProvinsiPage />}
      />
      <Route
        path="/admin/daerah-provinsi/:slug/edit"
        element={<EditDaerahProvinsiPage />}
      />
      <Route path="/admin/daerah-provinsi" element={<DaerahProvinsiPage />} />
    </Routes>
  )
}
