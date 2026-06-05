# Deployment Guide - Desa Bicara

## Single Upload to Vercel

Project ini sudah dikonfigurasi untuk deploy langsung ke Vercel tanpa perlu Flask terpisah.

---

## 1. Setup Supabase Database

### 1.1 Buat Project Supabase
1. Buka https://supabase.com
2. Buat project baru
3. Simpan password yang kamu set

### 1.2 Copy Connection String
1. Buka Settings > Database
2. Copy connection string (URI)
3. Format: `postgresql://postgres:[PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres`

### 1.3 Update .env
```env
DATABASE_URL="postgresql://postgres:[PASSWORD]@aws-0-xxx.pooler.supabase.com:6543/postgres"
```

---

## 2. Push Schema ke Supabase (Local)

Jalankan di terminal:

```bash
cd "d:\Arva Wahyu\Kuliah\PBA\desa-bicara"

# Generate Prisma client
npx prisma generate

# Push schema ke Supabase
npx prisma db push

# Seed data (tambah admin dan dictionary awal)
npx prisma db seed
```

---

## 3. Deploy ke Vercel

### 3.1 Push ke GitHub
```bash
git add .
git commit -m "Ready for deployment"
git push origin main
```

### 3.2 Setup Vercel
1. Buka https://vercel.com
2. Import repository GitHub
3. Add Environment Variable:
   - Name: `DATABASE_URL`
   - Value: (connection string Supabase)
4. Klik Deploy

---

## 4. Login Admin

Setelah deploy:
- URL: `https://[project].vercel.app/admin/login`
- Username: `admin`
- Password: `admin`

---

## Fitur yang Sudah Built-in

✅ Dictionary-based translation (tanpa Flask)
✅ Auto-detect bahasa
✅ Translation history
✅ Admin panel untuk kelola kamus
✅ Simplifikasi bahasa formal

---

## Troubleshooting

### Build Error
```bash
# Regenerate Prisma client
npx prisma generate
```

### Database Connection Failed
- Cek DATABASE_URL di Vercel Environment Variables
- Pastikan Supabase project masih aktif
- Cek password Supabase benar

### Admin Login Failed
- Pastikan sudah jalankan `npx prisma db seed`
- Cek apakah admin user sudah dibuat