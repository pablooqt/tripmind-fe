# TripMind Frontend

## Deskripsi Project

TripMind Frontend adalah aplikasi antarmuka pengguna untuk platform TripMind yang dikembangkan dengan Expo dan React Native. Aplikasi ini menyediakan alur utama untuk pengguna dalam menjelajah destinasi wisata, membuat itinerary perjalanan, berinteraksi dengan guide, mengelola profil, serta melakukan chat real-time. Frontend ini terhubung ke backend melalui API Gateway dan WebSocket chat service.

## Fitur

Aplikasi ini memiliki beberapa fitur utama yang terlihat dari struktur screen dan integrasi API, antara lain:

- Autentikasi pengguna untuk traveler dan guide, termasuk login, registrasi, verifikasi email, dan sesi Google.
- Onboarding dan profiling traveler untuk menyesuaikan preferensi perjalanan.
- Eksplorasi destinasi wisata, tampilan detail destinasi, dan halaman kabupaten/kota.
- Pembuatan trip dan itinerary perjalanan.
- Rekomendasi destinasi berbasis backend AI.
- Chat room real-time antara traveler dan guide.
- Dashboard guide untuk melihat trip, pembayaran, dan pengaturan profil.
- Pengaturan akun, profil, password, preferensi, dan daftar favorit.

## Tech Stack

| Kategori         | Teknologi                                                                                            | Keterangan                                                                    |
| ---------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Framework        | Expo, React Native                                                                                   | Aplikasi mobile/web berbasis Expo SDK 54.                                     |
| Routing          | Expo Router                                                                                          | Routing berbasis file (file-based routing).                                   |
| UI Navigation    | React Navigation                                                                                     | Digunakan untuk tab navigation dan screen navigation.                         |
| State Management | Context API                                                                                          | Digunakan melalui AuthContext dan AlertContext.                               |
| HTTP Client      | Fetch API                                                                                            | Komunikasi dengan backend dilakukan melalui service layer di services/api.ts. |
| Styling          | NativeWind, Tailwind CSS                                                                             | Styling UI menggunakan NativeWind.                                            |
| Maps             | react-native-maps                                                                                    | Digunakan pada fitur lokasi dan destinasi.                                    |
| Storage          | AsyncStorage                                                                                         | Menyimpan token autentikasi dan data lokal sederhana.                         |
| Build Tool       | Metro (Expo)                                                                                         | Bundler default untuk aplikasi Expo.                                          |
| Package Manager  | npm                                                                                                  | Berdasarkan skrip dan konfigurasi package.json.                               |
| Linting          | ESLint                                                                                               | Tersedia script lint melalui Expo.                                            |
| Other Libraries  | expo-image-picker, expo-location, expo-router, react-native-gesture-handler, react-native-reanimated | Digunakan untuk fitur multimedia, lokasi, gesture, dan animasi.               |

## Struktur Folder

```text
tripmind-frontend/
├── app/                  # Screen dan routing Expo Router
├── components/           # Komponen UI yang dipakai oleh screen
├── context/              # Context API untuk auth dan alert
├── hooks/                # Custom hooks, termasuk WebSocket chat
├── services/             # Layer integrasi API dan helper backend
├── assets/               # Gambar, ikon, splash, favicon
├── constants/            # Konstanta aplikasi
├── scripts/              # Script bantu proyek
├── package.json          # Konfigurasi dependency dan script
├── app.json              # Konfigurasi Expo
├── tsconfig.json         # Konfigurasi TypeScript
└── .env.example          # Template environment variable |
```

Folder penting:

- app/: berisi halaman utama aplikasi dan route berdasarkan file.
- components/: memuat komponen UI yang digunakan oleh halaman tertentu.
- context/: menyimpan provider untuk autentikasi dan alert global.
- hooks/: berisi custom hook seperti koneksi WebSocket chat.
- services/: memuat integrasi API backend melalui helper fetch.
- assets/: menyimpan aset visual aplikasi.

## Arsitektur Frontend

Frontend ini mengikuti arsitektur sederhana berbasis Expo Router:

1. Aplikasi dimulai dari root layout di app/\_layout.tsx.
2. Provider global seperti AuthProvider dan AlertProvider membungkus aplikasi untuk menyediakan state lintas layar.
3. Screen utama berada di folder app/ dan memanfaatkan routing berbasis file.
4. Komponen UI modular diletakkan di folder components/.
5. Semua komunikasi dengan backend dilakukan melalui services/api.ts.
6. Fitur chat real-time menggunakan hook khusus yang terhubung ke WebSocket.

Secara umum, arsitektur ini memisahkan concern antara UI, state global, dan integrasi API.

## Cara Menjalankan Project

Pastikan dependency sudah terinstal terlebih dahulu.

```bash
npm install
```

Jalankan aplikasi dalam mode development:

```bash
npx expo start
```

Untuk menjalankan ke platform tertentu:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

Aplikasi ini menggunakan base URL backend yang ditentukan secara dinamis dari host Expo melalui services/api.ts. Saat berjalan di emulator atau perangkat fisik, pastikan backend dapat diakses dari host yang sesuai.

## Environment Variables

File environment yang tersedia pada repository:

| Variabel         | File         | Deskripsi                               |
| ---------------- | ------------ | --------------------------------------- |
| GOOGLE_CLIENT_ID | .env.example | Client ID untuk integrasi Google OAuth. |

Untuk menggunakannya, salin file contoh terlebih dahulu:

```bash
cp .env.example .env
```

> Belum ditemukan pada repository.

## Struktur Routing

Routing aplikasi menggunakan Expo Router dengan pendekatan file-based routing. Struktur routing yang terlihat pada repository mencakup:

- / untuk halaman utama.
- /login untuk autentikasi.
- /profiling untuk onboarding traveler.
- /create-trip untuk pembuatan trip.
- /destinations-list dan /destination/[id] untuk daftar dan detail destinasi.
- /regency/[name] untuk halaman kabupaten/kota.
- /chat-list dan /chat-room/[id] untuk fitur chat.
- /guide-dashboard untuk dashboard guide.
- /(tabs) untuk navigasi tab utama: Home, Explore, My Plans, Settings.
- /settings/\* untuk halaman pengaturan akun.

## Struktur State Management

State management pada frontend ini tidak menggunakan Redux, Zustand, Pinia, atau Vuex. Pengelolaan state dilakukan melalui:

- Context API untuk autentikasi dan notifikasi global.
- State lokal di komponen React menggunakan hooks seperti useState dan useEffect.

## API Integration

Frontend berkomunikasi dengan backend melalui service layer yang terdapat di services/api.ts. Secara umum:

- Request HTTP dilakukan dengan Fetch API.
- Base URL backend ditentukan secara dinamis dari host Expo.
- Endpoint yang dipanggil mencakup autentikasi, profil preferensi, destinasi, favorit, rekomendasi AI, dan trip.
- Fitur chat real-time menggunakan WebSocket ke service chat.

Token autentikasi disimpan di AsyncStorage dan disertakan dalam header Authorization saat request dibutuhkan.

## Build Production

Script build production khusus belum ditemukan pada repository. Saat ini package.json hanya menyediakan script untuk menjalankan aplikasi dan linting.

## Development Guide

Untuk developer yang baru mulai bekerja pada project ini:

1. Instal dependency dengan npm install.
2. Jalankan aplikasi dengan npx expo start.
3. Fokus pada folder app/ untuk screen dan folder components/ untuk komponen UI.
4. Jika mengubah fitur backend-related, cek integrasi yang ada di services/api.ts.
5. Untuk fitur chat, perhatikan hook di hooks/useChatWebSocket.ts.
6. Gunakan .env berdasarkan template yang tersedia di .env.example.
