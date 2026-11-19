# 💰 Money Talk — Aplikasi Catatan Keuangan Pintar & Lengkap (70 Batches)

Aplikasi catatan keuangan pribadi *mobile-first* dengan tampilan modern standar **Apple iOS 18 Cupertino Aesthetic**, dirancang agar sangat intuitif, proporsional, bebas *auto-zoom* di Safari iPhone, dan kaya interaksi (haptik & efek audio sintetis Web Audio API).

---

## 📱 Akses Langsung di Browser iPhone Safari

Pastikan iPhone terhubung ke **jaringan Wi-Fi yang sama** dengan laptop/Mac ini.

1. Buka browser **Safari** di iPhone.
2. Masukkan alamat URL berikut di address bar:
   ```
   http://192.168.100.163:5173
   ```
3. *(Sangat disarankan)* Agar tampil *fullscreen* seperti aplikasi App Store asli:
   - Tap ikon **Share** (`[↑]` di bagian bawah Safari).
   - Pilih **"Tambah ke Layar Utama" (Add to Home Screen)**.
   - Tap **Tambah**.
   - Ikon **Money Talk** akan muncul di Home Screen iPhone kamu dan bisa dibuka layaknya aplikasi native tanpa bilah browser!

Akses di browser laptop/Mac:
```
http://localhost:5173
```

---

## ✨ Fitur Unggulan & 70 Batch Pengembangan

### 1. Desain & Proporsi Layar (iOS 18 Cupertino Aesthetic)
- **Anti-Zoom Safari**: Bebas distorsi dan auto-zoom saat mengetik atau memilih kategori di iPhone (standar input 16px & `touch-action: manipulation`).
- **Apple Card Titanium Saldo**: Kartu saldo utama dengan tipografi angka tabular (`tabular-nums`) dan grafik ritme belanja 7 hari interaktif (*tap-to-expand*).
- **Quick Shortcut Dock & Skor Kesehatan 50/30/20 (Batch 61)**: Pintasan cepat ke Split Bill, Tagihan, Kalender, dan AI Advisor di Beranda, lengkap dengan indikator Skor Kesehatan Finansial & perbandingan pengeluaran vs bulan lalu (*MoM*).
- **Smart Bill Reminder Banner (Batch 68)**: Pengingat tagihan jatuh tempo otomatis di Beranda dengan tombol **Catat 1-Tap**.
- **De-Wordified UI**: Tata letak bersih, minimalis, dan elegan tanpa teks petunjuk bertele-tele.
- **Glassmorphism Dock**: Bilah navigasi 5 tab jempol-ramah dengan tombol hero FAB (+) mengambang.
- **Efek Haptik & Audio**: Umpan balik audio lembut dan getaran mikro haptik saat berganti tab, memilih kategori, dan mencatat transaksi.

### 2. Fitur Keuangan Inti
- **1-Pintu Pencatatan Kilat + Kalkulator Pintar (Batch 62)**: Input teks alami (contoh: *"Kopi 25rb gopay"*), input suara (*real Web Speech API*), serta kalkulator operasi hitung (`+`, `-`, `×`, `÷`, `=`) langsung di kolom nominal.
- **Sistem Hashtag (`#kantor`, `#liburan`) & Flag Reimburse (Batch 63)**: Tandai transaksi dengan tag pintar atau klaim kantor langsung saat mencatat transaksi.
- **Pembuat Kategori Instan & Modal Kustom (Batch 65)**: Tambah kategori/sumber pendapatan baru dengan pemilih warna & ikon secara langsung di modal transaksi maupun di Pengaturan.
- **Dukungan Multi-Mata Uang**: IDR, USD, SGD, JPY, EUR, MYR dengan konversi kurs otomatis.
- **Laporan Bulanan & Tren 6 Bulan (Batch 66)**: Bagan donat SVG interaktif (*touch-to-inspect*), grafik arus kas harian twin-bar, grafik perbandingan historis 6 bulan terakhir, rincian pengeluaran per dompet, dan ekspor ringkasan 1-klik ke WhatsApp.
- **Auto-Budget 50/30/20 & Manajemen Target (Batch 69)**: Alokasi batas anggaran kategori otomatis 1-tap, fitur setor/tarik dana tabungan, dan kustomisasi target impian.
- **Multi-Rekening & Rekonsiliasi Saldo Instan (Batch 64)**: Ketuk kartu dompet untuk melihat mutasi khusus dompet tersebut, mengedit info kartu, atau melakukan **Penyesuaian Saldo (Rekonsiliasi)** otomatis.
- **Duplikat Transaksi 1-Tap & Filter Dompet (Batch 67)**: Ulangi transaksi harian dalam 1 sentuhan dan saring daftar transaksi berdasarkan dompet, tipe, atau rentang waktu.

### 3. Modul Finansial Tambahan (Laboratorium)
- **Target Impian & Dana Darurat**: Tracking impian finansial dengan visualisasi tabungan terkumpul.
- **Catatan Hutang & Piutang**: Pengingat cicilan, pencatatan pinjaman teman, dan status pelunasan.
- **Tagihan Rutin & Langganan**: Manajemen komitmen bulanan (Netflix, Spotify, Wifi, Kost).
- **Kalkulator Patungan (Split Bill)**: Hitung bagi rata/custom tagihan resto termasuk pajak PB1 & servis + format pesan WhatsApp siap kirim.
- **Klaim Kantor (Reimbursement)**: Lacak uang pribadi yang belum dicairkan kantor.
- **Portofolio Aset & Net Worth**: Lacak nilai investasi reksadana, saham, emas, dan total kekayaan bersih.
- **Simulasi Finansial**: Kalkulator bunga majemuk tabungan masa depan dan estimasi potongan pajak penghasilan UU HPP (PPh 21).
- **Daftar Belanjaan**: Checklist belanja supermarket agar tidak impulsif, siap dibukukan langsung ke pos pengeluaran.
- **Aura AI Financial Advisor**: Asisten keuangan cerdas terintegrasi untuk konsultasi tips hemat dan evaluasi rasio tabungan.
- **Keamanan PIN 4-Digit**: Kunci privasi aplikasi dengan simulasi Face ID dan keypad layar sentuh aman.
- **Cadangan Data Offline (JSON & CSV)**: 100% data tersimpan di penyimpanan lokal perangkat (*offline-first*), dapat diekspor ke JSON atau diunduh sebagai tabel Excel/CSV.

---

## 🛠️ Tech Stack

- **Framework**: React 18, TypeScript 5.5, Vite 5.4
- **Styling**: Tailwind CSS 3.4, PostCSS, Lucide Icons
- **Animasi & Interaktivitas**: Canvas Confetti, Web Audio API Synthesizer, CSS Keyframes
- **PWA & Mobile Ready**: Standalone Web App manifest, iOS Safe-Area Insets (`viewport-fit=cover`), Capacitor ready.

---

## 💻 Menjalankan Proyek Secara Lokal

```bash
# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev -- --host

# Kompilasi build produksi
npm run build
```
