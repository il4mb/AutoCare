# APLIKASI CAR MELIHAT KERUSAKAN MOBIL DENGAN KONEKSI KE ICU MOBIL DENGAN BLUETOOTH

## Fitur
- 1. Login
- 2. Register
- 3. Daftar Mobil
- 4. Tambah Mobil - dengan bluetooth connection
- 5. Detail Diagnosis Mobil

## Bluetooth
dalam dev menggunakan virtual port yang di forward oleh pc tcp/35000 dengan Module Elm327-Emulator

## Penyimpanan Local 
menggunakan Watermelon db

## Authentifikasi
menggunakan session lokal yang diamankan dengan `expo-secure-store` sebagai setup awal, lalu siap diganti ke Firebase.

### Alur Auth Saat Ini
- Layar login dan register aktif di `src/app/(app)/auth`.
- Session disimpan di perangkat dan dipakai untuk redirect otomatis ke tab utama.
- Tombol logout ada di beranda tab utama untuk menguji alur session.
