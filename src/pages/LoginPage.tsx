import { useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Diamond,
  ShieldCheck,
  Info,
  Eye,
  EyeOff,
  ArrowLeft,
} from "lucide-react";
import "./styles/Login.css";
import { getApiBaseUrl } from "../api"

const API_BASE = getApiBaseUrl(import.meta.env.VITE_API_URL)

export default function LoginPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setLoading(true);
    try {
     const res = await fetch(`${API_BASE}/v1/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        // Laravel: { message: "..." } atau { errors: { email: ["..."] } }
        const firstError = data?.errors
          ? (Object.values(data.errors)[0] as string[])?.[0]
          : undefined;
        throw new Error(
          firstError || data?.message || "Login gagal. Periksa email dan password."
        );
      }

      // Sesuaikan nama field dengan respons API kamu
      const token = data.token ?? data.access_token ?? data.data?.token;
      const user = data.user ?? data.data?.user ?? null;

      if (!token) {
        throw new Error("Respons API tidak berisi token.");
      }

      // "Ingat saya" -> localStorage (tetap login), jika tidak -> sessionStorage
      const storage = remember ? localStorage : sessionStorage;
      storage.setItem("auth_token", token);
      if (user) storage.setItem("auth_user", JSON.stringify(user));

      const from = location.state?.from;
      const destination =
        typeof from?.pathname === "string" && from.pathname.startsWith("/admin/")
          ? `${from.pathname}${from.search ?? ""}${from.hash ?? ""}`
          : "/dashboard";
      navigate(destination, { replace: true });
    } catch (err) {
      setError(
        err instanceof TypeError
          ? "Tidak dapat terhubung ke server. Pastikan API berjalan."
          : (err as Error).message
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-layout">
      {/* PANEL KIRI */}
      <section className="story-panel">
        <a className="brand" href="/">
          <Diamond size={25} strokeWidth={1.5} />
          <span>Budaya Indonesia</span>
        </a>

        <div className="story-copy">
          <p className="eyebrow light">RUANG REDAKSI · BUDAYA INDONESIA</p>

          <h1>
            Jaga warisan,
            <br />
            satu entri sekali.
          </h1>

          <p className="intro">
            Setiap cerita yang dirawat hari ini menjadi ingatan untuk generasi
            berikutnya.
          </p>
        </div>

        <p className="story-footer">Mengenal warisan, menghargai keberagaman.</p>
      </section>

      {/* PANEL KANAN */}
      <section className="form-panel">
        <header className="topbar">
          <span className="eyebrow">PANEL ADMIN</span>

          <span className="access-label">
            <ShieldCheck size={14} />
            Akses terbatas
          </span>
        </header>

        <div className="form-wrap">
          <section className="login-card">
            <p className="eyebrow accent">SELAMAT DATANG KEMBALI</p>

            <h2>Masuk ke ruang redaksi.</h2>

            <p className="subtitle">Kelola cerita, rawat keberagaman Nusantara.</p>

            <div className="info-note">
              <Info size={15} />
              <span>Gunakan akun admin yang telah terdaftar.</span>
            </div>

            {error && (
              <p
                role="alert"
                style={{
                  margin: "0 0 14px",
                  padding: "10px 12px",
                  borderRadius: 10,
                  fontSize: 12,
                  background: "#f6dcd4",
                  color: "#7b2f1f",
                }}
              >
                {error}
              </p>
            )}

            <form onSubmit={handleLogin}>
              <label htmlFor="email">Email</label>

              <input
                id="email"
                type="email"
                placeholder="nama@budayaindonesia.id"
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
              />

              <div className="password-label">
                <label htmlFor="password">Password</label>

                <button
                  className="show-password"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  {showPassword ? "Sembunyikan" : "Tampilkan"}
                </button>
              </div>

              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />

              <div className="form-options">
                <label className="remember-label">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                  />
                  <span>Ingat saya</span>
                </label>
              </div>

              <button className="submit-button" type="submit" disabled={loading}>
                {loading ? "Memproses…" : "Masuk ke Dashboard"}
              </button>
            </form>

            <p className="card-footnote">
              Khusus pengelola dan tim redaksi Budaya Indonesia.
            </p>
          </section>

          <a className="back-link" href="/">
            <ArrowLeft size={14} />
            Kembali ke website
          </a>
        </div>

        <footer className="copyright">
          © 2026 Budaya Indonesia · Merawat cerita bersama.
        </footer>
      </section>
    </main>
  );
}
