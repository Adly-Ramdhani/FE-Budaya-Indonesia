import type { FormEvent } from "react"
import Icon from "../AdminIcon"
import type { Island, Province } from "../types"

export type CreateMusikProps = {
  islands: Island[]
  islandsError: string | null
  islandsLoading: boolean
  provinces: Province[]
  provincesError: string | null
  provincesLoading: boolean
  title: string
  islandId: string
  provinceId: string
  composer: string
  language: string
  description: string
  lyrics: string
  audio: File | null
  saving: boolean
  mode?: "create" | "edit"
  onTitleChange: (value: string) => void
  onIslandChange: (value: string) => void
  onProvinceChange: (value: string) => void
  onComposerChange: (value: string) => void
  onLanguageChange: (value: string) => void
  onDescriptionChange: (value: string) => void
  onLyricsChange: (value: string) => void
  onAudioChange: (file: File | null) => void
  onCancel: () => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

export default function CreateMusik({
  islands,
  islandsError,
  islandsLoading,
  provinces,
  provincesError,
  provincesLoading,
  title,
  islandId,
  provinceId,
  composer,
  language,
  description,
  lyrics,
  audio,
  saving,
  onTitleChange,
  onIslandChange,
  onProvinceChange,
  onComposerChange,
  onLanguageChange,
  onDescriptionChange,
  onLyricsChange,
  onAudioChange,
  onCancel,
  onSubmit,
  mode = "create",
}: CreateMusikProps) {
  const isEditing = mode === "edit"
  return (
    <section className="content create-song-page">
      <div className="page-heading">
        <div>
          <p>Koleksi Budaya / Pengelolaan Konten</p>
          <h2>{isEditing ? "Edit Lagu Daerah" : "Tambah Lagu Daerah"}</h2>
          <span>
            {isEditing
              ? "Perbarui informasi lagu yang sudah ada di koleksi."
              : "Lengkapi informasi lagu untuk menambahkannya ke koleksi."}
          </span>
        </div>
      </div>

      <form className="modal create-song-form" onSubmit={onSubmit}>
        <div className="modal-heading">
          <div>
            <p>Koleksi Budaya</p>
            <h3>{isEditing ? "Perbarui Informasi Lagu" : "Informasi Lagu"}</h3>
          </div>
          <button
            type="button"
            onClick={onCancel}
            aria-label="Kembali ke daftar lagu"
            disabled={saving}
          >
            <Icon name="close" />
          </button>
        </div>

        <label>
          Judul lagu
          <input
            autoFocus
            name="title"
            value={title}
            onChange={(event) => onTitleChange(event.target.value)}
            placeholder="Contoh: Bungong Jeumpa"
            required
          />
        </label>

        <label>
          Pulau asal
          <select
            value={islandId}
            onChange={(event) => onIslandChange(event.target.value)}
            required
            disabled={islandsLoading || Boolean(islandsError)}
          >
            <option value="">
              {islandsLoading ? "Memuat pulau..." : "Pilih pulau"}
            </option>
            {islands.map((island) => (
              <option key={island.id} value={island.id}>
                {island.name}
              </option>
            ))}
          </select>
          {islandsError && (
            <span role="alert" className="create-song-error">
              Gagal memuat pulau: {islandsError}
            </span>
          )}
        </label>

        <label>
          Provinsi asal
          <select
            name="province_id"
            value={provinceId}
            onChange={(event) => onProvinceChange(event.target.value)}
            required
            disabled={!islandId || provincesLoading || Boolean(provincesError)}
          >
            <option value="">
              {!islandId
                ? "Pilih pulau terlebih dahulu"
                : provincesLoading
                  ? "Memuat provinsi..."
                  : "Pilih provinsi"}
            </option>
            {provinces.map((province) => (
              <option key={province.id} value={province.id}>
                {province.name}
              </option>
            ))}
          </select>
          {provincesError && (
            <span role="alert" className="create-song-error">
              Gagal memuat provinsi: {provincesError}
            </span>
          )}
          {!provincesLoading &&
            !provincesError &&
            islandId &&
            provinces.length === 0 && <span>Tidak ada provinsi untuk pulau ini.</span>}
        </label>

        <label>
          Pencipta lagu
          <input
            name="composer"
            value={composer}
            onChange={(event) => onComposerChange(event.target.value)}
            placeholder="Contoh: Traditional / Abraham Abduh"
          />
        </label>

        <label>
          Bahasa daerah
          <input
            name="language"
            value={language}
            onChange={(event) => onLanguageChange(event.target.value)}
            placeholder="Contoh: Bahasa Aceh / Bahasa Sunda"
          />
        </label>

        <label>
          Deskripsi &amp; Makna
          <textarea
            name="description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            placeholder="Tuliskan latar belakang, makna, atau cerita di balik lagu ini..."
            rows={3}
          />
        </label>

        <label>
          Lirik lagu
          <textarea
            name="lyrics"
            value={lyrics}
            onChange={(event) => onLyricsChange(event.target.value)}
            placeholder="Masukkan lirik lagu..."
            rows={4}
          />
        </label>

        <label>
          Audio lagu
          <input
            accept="audio/*"
            name="audio"
            type="file"
            onChange={(event) => onAudioChange(event.target.files?.[0] ?? null)}
          />
          {audio && <span>{audio.name}</span>}
        </label>

        <div className="modal-actions">
          <button type="button" onClick={onCancel} disabled={saving}>
            Batal
          </button>
          <button
            className="save"
            type="submit"
            name="status"
            value={isEditing ? "keep" : "draft"}
            disabled={saving}
          >
            {saving
              ? "Menyimpan..."
              : isEditing
                ? "Simpan perubahan"
                : "Simpan sebagai draf"}
          </button>
          <button
            className="save"
            type="submit"
            name="status"
            value="published"
            disabled={saving}
          >
            {isEditing ? "Simpan perubahan & publish" : "Publish"}
          </button>
        </div>
      </form>
    </section>
  )
}
