import { useEffect, useState, type FormEvent } from "react"
import AdminIcon from "../AdminIcon"
import { DanceImage, type Province } from "./TarianView"

type EditTarianProps = {
  provinces: Province[]
  provincesLoading: boolean
  provincesError: string | null
  name: string
  provinceId: string
  description: string
  status: string
  image: File | null
  currentImage?: string
  saving: boolean
  error: string | null
  onNameChange: (value: string) => void
  onProvinceChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onStatusChange: (value: string) => void
  onImageChange: (file: File | null) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function EditeTarian({
  provinces,
  provincesLoading,
  provincesError,
  name,
  provinceId,
  description,
  status,
  image,
  currentImage,
  saving,
  error,
  onNameChange,
  onProvinceChange,
  onDescriptionChange,
  onStatusChange,
  onImageChange,
  onCancel,
  onSubmit,
}: EditTarianProps) {
  const [imagePreview, setImagePreview] = useState<string>()

  useEffect(() => {
    if (!image) {
      setImagePreview(undefined)
      return
    }

    const previewUrl = URL.createObjectURL(image)
    setImagePreview(previewUrl)
    return () => URL.revokeObjectURL(previewUrl)
  }, [image])

  return (
    <section className="content create-song-page">
      <div className="page-heading">
        <div>
          <p>Koleksi Budaya / Pengelolaan Konten</p>
          <h2>Edit Tarian</h2>
          <span>Perbarui informasi tarian di koleksi budaya.</span>
        </div>
      </div>

      <form className="modal create-song-form" onSubmit={onSubmit}>
        <div className="modal-heading">
          <div>
            <p>Koleksi Budaya</p>
            <h3>Perbarui Informasi Tarian</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Kembali ke daftar tarian"
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
          Nama tarian
          <input
            autoFocus
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
            placeholder="Contoh: Tari Saman"
            required
          />
        </label>

        <label>
          Provinsi asal
          <select
            value={provinceId}
            onChange={(event) => onProvinceChange(event.target.value)}
            required
            disabled={provincesLoading || Boolean(provincesError)}
          >
            <option value="">
              {provincesLoading
                ? "Memuat provinsi..."
                : provincesError
                  ? "Provinsi gagal dimuat"
                  : "Pilih provinsi"}
            </option>
            {provinces.map((province) => (
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
          Deskripsi &amp; Makna
          <textarea
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Ceritakan asal-usul atau makna tarian..."
            rows={4}
          />
        </label>

        {(currentImage || image) && (
          <div className="house-preview-image">
            {imagePreview ? (
              <img src={imagePreview} alt={`Pratinjau gambar ${name}`} />
            ) : image ? (
              <span role="status">Memuat pratinjau gambar...</span>
            ) : (
              <DanceImage src={currentImage} alt={`Gambar ${name}`} />
            )}
          </div>
        )}

        <label>
          Gambar tarian
          <input
            accept="image/*"
            type="file"
            onChange={(event) => onImageChange(event.target.files?.[0] ?? null)}
          />
          {image ? (
            <span>{image.name}</span>
          ) : currentImage ? (
            <span>Gambar saat ini tetap digunakan jika tidak diganti.</span>
          ) : null}
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
            {saving ? "Menyimpan..." : "Simpan perubahan"}
          </button>
        </div>
      </form>
    </section>
  )
}
