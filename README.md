# 🏫 Sistem Penjemputan Siswa Sekolah (School Pickup System)
Aplikasi manajemen antrean dan panggilan penjemputan siswa sekolah terpadu secara **Real-time**, terintegrasi dengan **Layar Monitor TV Lobi**, **Pos Keamanan Gerbang (Satpam)**, **Portal Guru Kelas**, dan sistem **Pengeras Suara Otomatis (Text-to-Speech & Bel Sekolah)**.
Dirancang untuk mengurai kemacetan antrean kendaraan saat jam kepulangan sekolah serta memastikan koordinasi yang aman, tertib, dan transparan antara satpam, guru, dan orang tua murid.
---
## 🌟 Fitur Utama
### 1. 👮‍♂️ Pos Satpam (Input 3 Bagian Plat Nomor)
* **Format Plat Nomor Indonesia**: Input terbagi menjadi 3 kotak khusus:
  * `[ Wilayah (Huruf) ]` — `[ Nomor Polisi (Angka) ]` — `[ Seri Akhir (Huruf) ]`
* **Navigasi Cerdas (Auto-Jump)**: Kursor otomatis berpindah ke kotak berikutnya saat jumlah karakter terpenuhi atau saat menekan spasi/enter.
* **Dukungan Saudara Kandung (Kakak-Adik)**: 1 nomor polisi kendaraan dapat terhubung ke lebih dari 1 siswa dengan kelas yang berbeda.
* **Seleksi Siswa Beda Jam Kepulangan**: Jika adik kelas 1 pulang lebih awal dari kakak kelas 4, satpam dapat memilih/mencentang hanya anak yang akan dijemput saat ini.
### 2. 📺 Layar Monitor TV Lobi (Display Utama)
* **Tampilan Resolusi Tinggi & Kiosk Friendly**: Dirancang kontras dan mudah dibaca dari jarak jauh pada layar TV/Monitor besar di ruang tunggu atau lobi sekolah.
* **Stopwatch Realtime (Counting Timer)**: Menghitung secara otomatis berapa menit dan detik orang tua telah menunggu sejak nomor plat diinput di gerbang.
* **Indikator Warna Otomatis**:
  * 🟢 **Hijau** ($< 5$ menit): Baru tiba di gerbang.
  * 🟡 **Kuning** ($5 - 10$ menit): Sedang menunggu siswa keluar kelas.
  * 🔴 **Merah Berkedip** ($> 10$ menit): Perhatian khusus bagi guru piket untuk memeriksa kendala siswa.
* **Jam & Kalender Digital**: Sinkronisasi waktu WIB otomatis.
### 3. 🔔 Audio Panggilan Otomatis (Text-to-Speech + Bel Sekolah)
* Mengeluarkan nada bel bandara/sekolah (*dual-tone pleasant chime*) sebelum panggilan dimulai menggunakan Web Audio API.
* Pengumuman suara otomatis dalam Bahasa Indonesia menggunakan Web Speech API bawaan browser (tanpa biaya API pihak ketiga):
  > *"Perhatian. Orang tua dari ananda Muhammad Farhan kelas 4B dan ananda Aisyah Zahira kelas 1A telah tiba di gerbang penjemputan."*
### 4. 👩‍🏫 Portal Guru Kelas (Pelepasan Siswa)
* **Filter Kelas yang Diampu**: Guru dapat menyaring antrean berdasarkan kelas (misal: hanya menampilkan murid kelas 1A).
* **Konfirmasi 1-Klik (`✅ Sudah Dijemput`)**: Begitu murid diantar ke orang tua:
  * Nama siswa otomatis terhapus dari Layar TV lobi.
  * Sistem menghitung total durasi tunggu dan memindahkannya ke tabel log harian sekolah.
### 5. 📊 Riwayat & Log Penjemputan (Analitik Harian)
* Rekap waktu kedatangan, waktu dijemput, total durasi tunggu, dan identitas guru/petugas yang melepas siswa.
* Ringkasan KPI: Total siswa dijemput, rata-rata waktu tunggu harian, waktu tunggu tercepat, dan antrean terlama.
* **Fitur Ekspor CSV / Excel**: Dapat diunduh kapan saja untuk evaluasi dan arsip laporan sekolah.
