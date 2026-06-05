# 🚀 DESA BICARA - SETUP INSTRUCTIONS

Sistem NLP berbasis dictionary untuk terjemahan Bahasa Lampung ↔ Indonesia (NO AI/LLM)

## 📋 PREREQUISITES

### Software yang dibutuhkan:
- **Node.js** (v18+) - untuk Next.js
- **Python** (v3.8+) - untuk Flask NLP Engine
- **MySQL** (v8.0+) - untuk database
- **Git** - untuk version control

### Tools yang dibutuhkan:
- **npm** atau **yarn** - package manager Node.js
- **pip** - package manager Python

---

## 🔧 STEP-BY-STEP SETUP

### STEP 1: SETUP DATABASE MYSQL

1. **Buka MySQL Workbench atau terminal MySQL**
2. **Buat database baru:**
   ```sql
   CREATE DATABASE desa_bicara;
   ```

3. **Catat kredensial database:**
   - Host: `localhost` (atau IP server)
   - Port: `3306` (default)
   - Username: `root` (atau user lain)
   - Password: password MySQL Anda
   - Database: `desa_bicara`

---

### STEP 2: SETUP NEXT.JS FRONTEND

1. **Install dependencies:**
   ```bash
   cd desa-bicara
   npm install
   ```

2. **Setup environment variables (.env):**
   File ini sudah ada di root project, pastikan konfigurasi benar:
   ```env
   DATABASE_URL="mysql://root:password@localhost:3306/desa_bicara"
   NEXT_PUBLIC_NLP_API_URL="http://localhost:5000"
   ```

3. **Generate Prisma client:**
   ```bash
   npx prisma generate
   ```

4. **Push schema ke database:**
   ```bash
   npx prisma db push
   ```

5. **Seed database dengan data awal:**
   ```bash
   npx prisma db seed
   ```

6. **Jalankan Next.js development server:**
   ```bash
   npm run dev
   ```

7. **Buka browser:**
   ```
   http://localhost:3000
   ```

---

### STEP 3: SETUP FLASK NLP ENGINE

1. **Buka terminal baru** (jangan tutup terminal Next.js)

2. **Masuk ke direktori lp-service:**
   ```bash
   cd lp-service
   ```

3. **Install Python dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Buat file .env** (MANUAL - tidak bisa dibuat otomatis):
   
   Buat file `lp-service/.env` dengan isi:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=desa_bicara
   ```
   
   **PENTING:** Ganti `your_password` dengan password MySQL Anda

5. **Jalankan Flask service:**
   ```bash
   python app.py
   ```

6. **Verifikasi Flask berjalan:**
   - Buka browser: `http://localhost:5000/health`
   - Harus muncul response JSON dengan status "healthy"

---

### STEP 4: VERIFIKASI SISTEM

#### Cek Next.js:
1. Buka `http://localhost:3000`
2. Coba navigasi ke halaman:
   - `/` - Landing page
   - `/translate` - Halaman terjemahan
   - `/admin` - Dashboard admin
   - `/admin/dictionary` - CRUD kamus
   - `/documentation` - Dokumentasi NLP

#### Cek Flask:
1. Buka `http://localhost:5000/health`
2. Harus muncul:
   ```json
   {
     "status": "healthy",
     "service": "Desa Bicara NLP Engine",
     "version": "1.0.0",
     "database_connected": true,
     "dictionary_entries": 60
   }
   ```

#### Cek Admin Dashboard:
1. Buka `http://localhost:3000/admin`
2. Cek status koneksi Flask di dashboard
3. Harus menampilkan "Terhubung ke localhost:5000"

---

### STEP 5: TEST TRANSLATION

1. **Buka halaman terjemahan:**
   ```
   http://localhost:3000/translate
   ```

2. **Input teks Lampung:**
   ```
   Nyak mengan
   ```

3. **Pilih dialek:** Api (default)

4. **Klik "Terjemahkan"**

5. **Expected output:**
   - Original: "Nyak mengan"
   - Case folding: "nyak mengan"
   - Tokens: ["nyak", "mengan"]
   - Normalized: ["nyak", "mengan"]
   - Translated: ["saya", "makan"]
   - Result: "saya makan"

6. **Cek NLP visualization:**
   - Case folding result
   - Token list
   - Normalized tokens
   - Translated tokens
   - Kata tidak ditemukan (jika ada)

---

## 🐛 TROUBLESHOOTING

### Masalah: Database connection failed
**Solution:**
- Pastikan MySQL server berjalan
- Cek kredensial di .env
- Pastikan database `desa_bicara` sudah dibuat

### Masalah: Flask tidak terhubung
**Solution:**
- Pastikan Flask service berjalan di terminal terpisah
- Cek file `lp-service/.env` sudah dibuat
- Verifikasi kredensial database benar
- Cek port 5000 tidak dipakai aplikasi lain

### Masalah: Seed database gagal
**Solution:**
- Pastikan MySQL server berjalan
- Cek DATABASE_URL di .env
- Jalankan `npx prisma db push` dulu
- Baru jalankan `npx prisma db seed`

### Masalah: Translation tidak berfungsi
**Solution:**
- Pastikan Flask service berjalan
- Cek koneksi Flask di admin dashboard
- Pastikan database sudah di-seed
- Cek browser console untuk error

---

## 📁 STRUKTUR PROJECT

```
desa-bicara/
├── app/                          # Next.js App Router
│   ├── actions/                  # Server actions
│   ├── admin/                    # Admin pages
│   ├── components/               # React components
│   ├── documentation/            # Documentation
│   ├── translate/                # Translation page
│   └── globals.css               # Global styles
├── components/                   # shadcn/ui components
├── lib/                          # Utilities
├── lp-service/                   # Flask NLP Engine
│   ├── app.py                    # Main Flask app
│   ├── requirements.txt          # Python dependencies
│   └── .env                      # Flask environment (manual)
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Database schema
│   └── seed.ts                  # Seed data
├── .env                          # Next.js environment
├── package.json                  # Node.js dependencies
└── SETUP.md                      # This file
```

---

## 🎯 QUICK START (UNTUK DEMO)

Jika Anda ingin langsung demo:

1. **Start MySQL** (pastikan server berjalan)

2. **Terminal 1 - Next.js:**
   ```bash
   cd desa-bicara
   npm install
   npx prisma db push
   npx prisma db seed
   npm run dev
   ```

3. **Terminal 2 - Flask:**
   ```bash
   cd desa-bicara/lp-service
   pip install -r requirements.txt
   # Buat file .env manual
   python app.py
   ```

4. **Buka browser:**
   - Next.js: http://localhost:3000
   - Flask Health: http://localhost:5000/health

5. **Test translation:**
   - Buka http://localhost:3000/translate
   - Input: "Nyak mengan"
   - Klik terjemahkan
   - Lihat hasil dan NLP visualization

---

## 📊 STATUS IMPLEMENTASI

| Component | Status |
|-----------|--------|
| Flask NLP Engine | ✅ Completed |
| Next.js Frontend | ✅ Completed |
| Prisma Schema | ✅ Completed |
| Admin CRUD | ✅ Completed |
| NLP Visualization | ✅ Completed |
| Seed Data | ✅ Completed |
| Flask Connection Status | ✅ Completed |
| Setup Instructions | ✅ Completed |

---

## 🎓 UNTUK DEMO KULIAH NLP

### Yang perlu ditunjukkan:
1. **Landing page** - Modern UI dengan emerald green theme
2. **Translation page** - Form input + NLP visualization
3. **NLP Pipeline** - Case folding → Tokenization → Normalization → Dictionary Lookup
4. **Admin Dashboard** - Statistics + Flask connection status
5. **Dictionary Management** - CRUD kamus
6. **Documentation** - Arsitektur sistem & metode NLP

### Key points untuk presentasi:
- **NO AI/LLM** - Pure rule-based NLP
- **Dictionary-based** - Translation dari database
- **Step-by-step visualization** - Menunjukkan proses NLP
- **Admin system** - CRUD kamus via Prisma
- **Flask + Next.js** - Architecture modern

---

## 📞 SUPPORT

Jika ada masalah:
1. Cek troubleshooting section
2. Pastikan semua services berjalan (MySQL, Next.js, Flask)
3. Cek environment variables (.env files)
4. Cek browser console untuk error

---

**Project siap untuk demo kuliah NLP! 🎉**
