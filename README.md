# 🏛️ Buku Tamu Digital Candi Dadi

> Aplikasi pencatatan kunjungan premium, responsif, dan elegan khusus untuk cagar budaya Candi Dadi, Kabupaten Tulungagung, Jawa Timur.

Buku Tamu Digital Candi Dadi dirancang secara khusus untuk menggantikan pencatatan manual dengan sistem pencatatan digital berkinerja tinggi, mengusung arsitektur modern, dan memiliki antarmuka premium bertema warisan sejarah nusantara (*Heritage Gold & Warm Cream*).

---

## ✨ Fitur Unggulan

### 👥 Portal Pengunjung (Public Guest Check-In)
*   **Modular Layout Flow**: Pembagian form kunjungan yang logis dan mengalir (Personal vs Rombongan) untuk meminimalkan beban kognitif pengisi.
*   **Premium CustomSelect Dropdowns**: Mengganti select bawaan browser dengan dropdown kustom overlay yang menawan, lengkap dengan rotasi ikon chevron yang halus, checkmark aktif emas, dan proteksi pemotongan teks (*no-wrap text truncation*).
*   **Dynamic Geolocation Database**: Integrasi data wilayah administratif Indonesia (Negara, Provinsi, Kota/Kabupaten) secara asinkron berkinerja tinggi yang disajikan secara berurutan (*top-down*).
*   **Live Greeting & Matur Nuwun Card**: Kartu ucapan terima kasih dengan visualisasi yang mewah setelah tamu berhasil melakukan *check-in*.

### 🔑 Portal Admin (Admin Dashboard Portal)
*   **Statistik & KPI Menarik**: Ringkasan data pengunjung interaktif (total tamu, jumlah rombongan, rata-rata rating kepuasan, persentase kepuasan pengunjung).
*   **Tabel Tamu Dinamis**: Pencarian instan, filter kategori pengunjung, serta fitur edit dan hapus log tamu secara langsung via modal interaktif.
*   **Generasi QR Code Instan**: Unduh kode QR buku tamu beresolusi tinggi langsung dari panel admin untuk dicetak fisik di gerbang candi.
*   **Export CSV Anti-Gagal (Bulletproof)**: Menggunakan teknologi **Data URI** dengan *UTF-8 BOM* (Byte Order Mark), memastikan data terunduh instan dengan nama file yang rapi (`Daftar_Tamu_Candi_Dadi_YYYY-MM-DD.csv`) dan terformat sempurna tanpa ada kolom terpecah saat dibuka di Microsoft Excel atau Google Sheets.
*   **Pembaruan Kata Sandi Mandiri**: Pengaturan sandi akses admin langsung dari panel dashboard.

---

## 🛠️ Arsitektur & Teknologi

*   **Core Framework**: Next.js 16.2 (App Router & Dynamic Serverless Routes)
*   **State Management**: Zustand
*   **Styling & Design System**: TailwindCSS v4 & PostCSS
*   **Database ORM**: Drizzle ORM (Asynchronous & Type-Safe)
*   **Database Engine**:
    *   **Lokal**: File SQLite lokal (`candi-dadi.db`) via LibSQL.
    *   **Produksi (Cloud)**: **Turso Database (LibSQL)** — Database SQL serverless berkecepatan tinggi yang dirancang khusus untuk lingkungan cloud tanpa *cold-start*.

---

## 💻 Panduan Pengembangan Lokal

### 1. Prasyarat (Prerequisites)
Pastikan Anda sudah menginstal **Node.js** (Versi 18 ke atas disarankan).

### 2. Kloning & Instalasi Dependensi
```bash
# Masuk ke direktori proyek
cd candi-dadi

# Instal seluruh paket dependensi
npm install
```

### 3. Konfigurasi Environment Variables
Buat sebuah file bernama `.env` di direktori utama (sejajar dengan `package.json`):
```env
# Default password untuk login admin pertama kali: candidad1
ADMIN_PASSWORD=candidad1
```

### 4. Sinkronisasi Database & Seeding Awal
```bash
# Push schema Drizzle ke database lokal (candi-dadi.db)
npx drizzle-kit push

# Jalankan seeder untuk memasukkan data tamu dummy & sandi default admin
npm run db:seed
```

### 5. Jalankan Development Server
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.
*   **Halaman Buku Tamu**: `http://localhost:3000/`
*   **Halaman Admin**: `http://localhost:3000/admin` (Kata sandi default: **`candidad1`**)

---

## ☁️ Panduan Deploy ke Netlify + Turso Cloud

Karena Netlify berjalan di atas lingkungan serverless (tanpa penyimpanan file permanen), Anda **wajib** menyambungkan database ke Turso Cloud.

### 1. Pengaturan di Turso
1. Buat database baru di Turso CLI atau dashboard Turso Anda.
2. Dapatkan **Database URL** (`libsql://...`) dan **Auth Token**.

### 2. Pengaturan di Netlify
Saat melakukan konfigurasi proyek baru di Netlify, tambahkan variabel lingkungan (*Environment Variables*) berikut pada dashboard Netlify:
*   `TURSO_DATABASE_URL` = *(URL database Turso Anda)*
*   `TURSO_AUTH_TOKEN` = *(Token otentikasi Turso Anda)*

### 3. Menerapkan Schema ke Turso Cloud
Sebelum mendeploy, jalankan perintah berikut di terminal lokal Anda (dengan file `.env` yang sudah disesuaikan ke kredensial Turso) untuk membuat tabel di cloud secara instan:
```bash
npx drizzle-kit push
```

Setelah build di Netlify selesai, aplikasi Buku Tamu Digital Candi Dadi Anda siap digunakan oleh ribuan pengunjung secara online dengan performa serverless yang super kencang! 🚀
