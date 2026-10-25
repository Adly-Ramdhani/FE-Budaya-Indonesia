import type { FormEvent } from "react"
import AdminIcon from "../AdminIcon"

type Province = {
  id: string | number
  name: string
  islandId: string
}

type Island = {
  id: string | number
  name: string
}

type CreateAlatMusikProps = {
  islands: Island[]
  islandsLoading: boolean
  islandsError: string | null
  provinces: Province[]
  provincesLoading: boolean
  provincesError: string | null
  name: string
  islandId: string
  provinceId: string
  description: string
  videoUrl: string
  status: string
  image: File | null
  saving: boolean
  error: string | null
  onIslandChange: (value: string) => void
  onNameChange: (value: string) => void
  onProvinceChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onVideoUrlChange: (value: string) => void
  onStatusChange: (value: string) => void
  onImageChange: (file: File | null) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function CreateAlatMusik({
  islands,
  islandsLoading,
  islandsError,
  provinces,
  provincesLoading,
  provincesError,
  name,
  islandId,
  provinceId,
  description,
  videoUrl,
  status,
  image,
  saving,
  error,
  onIslandChange,
  onNameChange,
  onProvinceChange,
  onDescriptionChange,
  onVideoUrlChange,
  onStatusChange,
  onImageChange,
  onCancel,
  onSubmit,
}: CreateAlatMusikProps) {
  return (
    <section className="content create-song-page">
      <div className="page-heading">
        <div>
          <p>Koleksi Budaya / Pengelolaan Konten</p>
          <h2>Tambah Alat Musik</h2>
          <span>Lengkapi informasi alat musik untuk menambahkannya ke koleksi.</span>
        </div>
      </div>

      <form className="modal create-song-form" onSubmit={onSubmit}>
        <div className="modal-heading">
          <div>
            <p>Koleksi Budaya</p>
            <h3>Informasi Alat Musik</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Kembali ke daftar alat musik"
            disabled={saving}
          >
            <AdminIcon name="close" />
          </button>
        </div>

        {error && (
          <p className="create-song-error" role="alert">
            {error}
          </p>
        )}

        <label>
          Pulau
          <select
            value={islandId}
            onChange={(event) => onIslandChange(event.target.value)}
            required
            disabled={islandsLoading || Boolean(islandsError)}
          >
            <option value="">
              {islandsLoading
                ? "Memuat pulau..."
                : islandsError
                  ? "Pulau gagal dimuat"
                  : "Pilih pulau"}
            </option>
            {islands.map((island) => (
              <option key={island.id} value={island.id}>
                {island.name}
              </option>
            ))}
          </select>
          {islandsError && (
            <span className="create-song-error" role="alert">
              Gagal memuat pulau: {islandsError}
            </span>
          )}
        </label>

        <label>
          Provinsi asal
          <select
            value={provinceId}
            onChange={(event) => onProvinceChange(event.target.value)}
            required
            disabled={
              !islandId || provincesLoading || Boolean(provincesError)
            }
          >
            <option value="">
              {!islandId
                ? "Pilih pulau terlebih dahulu"
                : provincesLoading
                ? "Memuat provinsi..."
                : provincesError
                  ? "Provinsi gagal dimuat"
                  : "Pilih provinsi"}
            </option>
            {provinces
              .filter((province) => province.islandId === islandId)
              .map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
              ))}
          </select>
          {provincesError && (
            <span className="create-song-error" role="alert">
              Gagal memuat provinsi: {provincesError}
            </span>
          )}
        </label>

        <label>
          Nama alat musik
          <input
            autoFocus
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Contoh: Angklung"
            required
          />
        </label>

        <label>
          Deskripsi &amp; Makna
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Ceritakan asal-usul atau makna alat musik..."
            rows={4}
          />
        </label>

        <label>
          Gambar alat musik
          <input
            accept="image/*"
            type="file"
            onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
          />
          {image && <span>{image.name}</span>}
        </label>

        <label>
          URL Video (opsional)
          <input
            type="url"
            value={videoUrl}
            onChange={(event) => onVideoUrlChange(event.target.value)}
            placeholder="https://youtube.com/..."
          />
        </label>

        <label>
          Status
          <select
            value={status}
            onChange={(event) => onStatusChange(event.target.value)}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>

        <div className="modal-actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Batal
          </button>
          <button className="save" type="submit" disabled={saving}>
            {saving ? "Menyimpan..." : "Simpan alat musik"}
          </button>
        </div>
      </form>
    </section>
  )
}
