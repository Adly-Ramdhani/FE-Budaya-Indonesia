import { Route, Routes } from "react-router-dom"
import HomePage from "./pages/HomePage"
import MakananPage from "./pages/MakananPage"
import RumahAdatPage from "./pages/RumahAdatPage"
import DetailView from "./components/DetailView"
import LaguPage from "./pages/LaguPage"
import LoginPage from "./pages/LoginPage"

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
    </Routes>
  )
}