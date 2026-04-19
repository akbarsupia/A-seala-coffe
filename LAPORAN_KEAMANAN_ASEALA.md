# Laporan Arsitektur Keamanan Siber: Aseala Coffee Ecosystem
**Tanggal:** 19 April 2026  
**Status Sistem:** *Security Hardened (Terenkripsi & Tervalidasi)*

---

## 1. Ringkasan Eksekutif
Website Aseala Coffee telah mengadopsi standar keamanan web modern tingkat industri. Fokus utama pengembangan ini adalah perlindungan data pelanggan, integritas transaksi keuangan (Midtrans), dan pencegahan eksploitasi akses ilegal pada database cloud. Kami beralih dari mode "percobaan" ke mode "keamanan penuh".

---

## 2. Detail Lapisan Pertahanan (Penjelasan untuk Presentasi)

### A. Gembok Database Berlapis (Firestore Security Rules)
**Analogi:** Bayangkan database sebagai sebuah **Bank**. Dulu, pintunya terbuka untuk siapa saja. Sekarang, kami telah memasang sistem gembok otomatis.
- **Validasi Identitas**: Setiap orang yang masuk harus menunjukkan "KTP Digital" (UID). Mereka hanya bisa membuka loker milik mereka sendiri.
- **Izin Khusus Admin**: Hanya Anda (Admin) yang memegang kunci untuk gudang utama (Daftar Menu). Pelanggan hanya bisa melihat, tidak bisa memindahkan atau menghapus barang.
- **Manfaat**: Mencegah serangan *Data Leakage* di mana seseorang mencoba mencuri riwayat pesanan orang lain.

### B. Satpam Penjaga Gerbang (Firebase Admin SDK)
**Analogi:** Bayangkan rute pengiriman email dan pembayaran sebagai **Pintu Tol**.
- **Tiket Resmi (Bearer Token)**: Website Anda sekarang akan memberikan "Tiket Digital" setiap kali ada transaksi. Server tol (Admin SDK) akan mengecek keaslian tiket tersebut langsung ke kantor pusat Google.
- **Tolak Akses Ilegal**: Jika ada orang asing mencoba memanggil sistem email atau pembayaran tanpa tiket resmi, sistem akan langsung mengusir mereka (Status 401 Unauthorized).

### C. Sistem Anti-Manipulasi Harga (Price Logic Hardening)
**Analogi:** Ini adalah sistem **Kasir Pintar**.
- **Masalah**: Hacker sering mencoba mengubah harga barang saat di keranjang (misal: kopi 50rb diubah jadi 100 perak di browser). 
- **Solusi**: Kasir kita (Server) tidak akan percaya pada harga yang dibawa pelanggan. Kasir akan mengecek sendiri ke buku harga pusat (Firestore), menghitung ulang totalnya secara mandiri, baru kemudian memproses pembayaran.
- **Manfaat**: Melindungi profit bisnis dari serangan manipulasi data sisi klien (*Client-side Data Tampering*).

### D. Manajemen Kunci Rahasia (Secret Management)
**Analogi:** Ini seperti **Brankas Tersembunyi**.
- Semua kunci akses penting (Service Account) tidak diletakkan di lemari pajangan atau kode website biasa, melainkan disimpan di ruang rahasia server (`.env.local`). Bahkan jika seseorang melihat kode website Anda, mereka tidak akan bisa menemukan kunci masuk ke database Anda.

---

## 3. Hasil Akhir Audit Keamanan (OWASP Standard)
Berdasarkan standar keamanan aplikasi internasional (OWASP), sistem Aseala Coffee kini telah **KEBAL** terhadap:
1. **Broken Access Control**: Akses ilegal antar pengguna berhasil ditutup.
2. **Identification Failures**: Pemalsuan identitas berhasil dicegah.
3. **Data Integrity Attack**: Manipulasi harga pesanan berhasil digagalkan.

---
**Dibuat secara Profesional untuk:**
*Aseala Coffee Management Presentation*
