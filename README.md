# 💰 Dompetku — Expense Tracker

Aplikasi pencatat keuangan pribadi berbasis web menggunakan **Firebase Authentication** dan **Firebase Realtime Database**.

Dibuat untuk tugas mata kuliah **Cloud Computing 2024/2025**.

---

## ✨ Fitur

- 🔐 **Register & Login** — Email/Password dengan verifikasi email + Google Sign-In
- ➕ **Tambah Transaksi** — Pemasukan & Pengeluaran dengan 12 kategori
- 📊 **Ringkasan Otomatis** — Saldo, total pemasukan, total pengeluaran dihitung real-time
- 🔄 **CRUD Real-time** — Tambah, lihat, edit, hapus transaksi sync ke Firebase
- 🔍 **Filter & Search** — Cari berdasarkan keterangan, tipe, dan kategori
- 👤 **Data per-user** — Setiap akun hanya melihat datanya sendiri

---

## 🚀 Cara Menjalankan

### 1. Clone repo
```bash
git clone https://github.com/username/dompetku.git
cd dompetku
```

### 2. Buat file config Firebase
```bash
cp firebase-config.example.js firebase-config.js
```
Isi `firebase-config.js` dengan config Firebase project kamu.

### 3. Setup Firebase Console

**Authentication:**
1. Build → Authentication → Get started
2. Sign-in method → aktifkan **Email/Password**
3. Tambah provider → **Google** → Enable → simpan

**Realtime Database:**
1. Build → Realtime Database → Create Database
2. Region: asia-southeast1 → Next
3. Start in **test mode** → Enable

**Security Rules (rekomendasi):**
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

### 4. Jalankan
Buka `index.html` langsung di browser.

---

## ☁️ Deploy ke Netlify

1. Push repo ke GitHub (tanpa `firebase-config.js` — sudah di `.gitignore`)
2. Netlify → New site → Connect repository
3. Build command: `sh build.sh` | Publish directory: `.`
4. Environment Variables → isi 7 variable Firebase
5. Deploy → tambahkan domain Netlify ke Firebase Authorized Domains

---

## 🗄️ Struktur Data Firebase

```
users/
  {uid}/
    transactions/
      {txId}/
        nominal:     50000
        tipe:        "Pengeluaran"
        kategori:    "Makanan & Minuman"
        keterangan:  "Makan siang di warteg"
        tanggal:     "2025-04-10"
        createdAt:   "2025-04-10T08:00:00.000Z"
        updatedAt:   "2025-04-10T08:00:00.000Z"
```

---

## 📁 Struktur File

```
dompetku/
├── index.html                   ← Aplikasi utama
├── build.sh                     ← Build script Netlify
├── netlify.toml                 ← Konfigurasi Netlify
├── firebase-config.example.js  ← Template config
├── .gitignore
└── README.md
```
