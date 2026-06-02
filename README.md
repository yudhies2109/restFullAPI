# REST API JWT

REST API menggunakan Node.js, Express.js, PostgreSQL, Prisma ORM, dan JWT Authentication.

Fitur utama:

- Register user
- Login dengan JWT
- Refresh token
- Logout
- Get profile user login
- CRUD customer
- Searching, pagination, dan sorting customer

## Kebutuhan Sistem

Pastikan komputer sudah memiliki:

- Node.js
- npm
- PostgreSQL
- Git

Untuk mengecek versi:

```bash
node -v
npm -v
psql --version
git --version
```

## 1. Clone Project

Clone repository ke komputer:

```bash
git clone <url-repository>
```

Masuk ke folder project:

```bash
cd restapi-jwt
```

## 2. Install Dependency

Install seluruh dependency Node.js:

```bash
npm install
```

## 3. Buat Database PostgreSQL

Buat database baru di PostgreSQL.

Contoh menggunakan `psql`:

```bash
createdb restapi_jwt
```

Atau buat manual melalui pgAdmin dengan nama database:

```txt
restapi_jwt
```

## 4. Buat File Environment

Buat file `.env` di root project:

```bash
touch .env
```

Isi file `.env`:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/restapi_jwt
JWT_SECRET=secret-access-token
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=secret-refresh-token
JWT_REFRESH_EXPIRES_IN=7d
PORT=3000
```

Sesuaikan bagian berikut dengan konfigurasi PostgreSQL lokal:

- `username`
- `password`
- `localhost`
- `5432`
- `restapi_jwt`

Contoh:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/restapi_jwt
```

## 5. Jalankan Prisma Migration

Generate Prisma Client:

```bash
npx prisma generate
```

Jalankan migration untuk membuat tabel database:

```bash
npx prisma migrate dev
```


## 6. Jalankan Server

Mode development:

```bash
npm run dev
```

Mode production/local biasa:

```bash
npm start
```

Jika berhasil, server berjalan di:

```http
http://localhost:3000
```
