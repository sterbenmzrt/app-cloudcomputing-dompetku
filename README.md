# Dompetku — Expense Tracker

Web app pencatat pemasukan dan pengeluaran dengan **Firebase Authentication** dan **Realtime Database**. UI memakai **Vite**, **Tailwind CSS**, dan modul JavaScript di folder `src/js/`.

---

## Fitur singkat

- Daftar / masuk (email + verifikasi, Google Sign-In)
- Transaksi pemasukan & pengeluaran, ringkasan saldo real-time
- CRUD transaksi per pengguna (`users/{uid}/transactions`)
- Filter dan pencarian

---

## Menjalankan di lokal

1. **Clone dan install dependensi**

   ```bash
   git clone <url-repo>
   cd dompetku
   npm install
   ```

2. **Config Firebase** — salin template ke `public/` lalu isi nilai project kamu:

   ```bash
   cp firebase-config.example.js public/firebase-config.js
   ```

3. **Jalankan dev server**

   ```bash
   npm run dev
   ```

   Buka URL yang ditampilkan di terminal (biasanya `http://localhost:5173`).

4. **Build produksi** (output di folder `dist/`):

   ```bash
   npm run build
   ```

---

## Firebase Console (ringkas)

- **Authentication:** aktifkan Email/Password dan Google.
- **Realtime Database:** buat database (misalnya region `asia-southeast1`). Untuk produksi, ganti rules dari test mode ke rules yang membatasi akses per `auth.uid` (lihat contoh di bawah).

**Contoh rules (setelah development):**

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

---

## Deploy Netlify

- **Build command:** `sh build.sh && npm ci && npm run build` (sudah di `netlify.toml`)
- **Publish directory:** `dist`
- Di Netlify, set **environment variables** untuk nilai yang sama seperti di `build.sh` (`FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, dll.) agar `public/firebase-config.js` ter-generate saat build.
- Tambahkan domain deploy ke **Firebase → Authentication → Authorized domains**.

File `public/firebase-config.js` yang dihasilkan build **jangan di-commit** (ada di `.gitignore`).

---

## Struktur data (Realtime DB)

```
users/{uid}/transactions/{txId}
  nominal, tipe, kategori, keterangan, tanggal, createdAt, updatedAt
```

---

## Struktur repo

```
dompetku/
├── index.html              # markup + entry script
├── src/
│   ├── main.js             # bootstrap, expose handler ke window
│   ├── input.css           # Tailwind
│   └── js/                 # modul fitur (auth, transaksi, ui, …)
├── public/
│   ├── logo_wallet.svg
│   └── firebase-config.js  # lokal / hasil build (gitignored)
├── build.sh                # generate public/firebase-config.js (Netlify)
├── vite.config.js
├── netlify.toml
├── firebase-config.example.js
└── package.json
```
