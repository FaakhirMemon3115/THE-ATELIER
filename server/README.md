# The Atelier — Backend API (Express + MySQL + JazzCash/EasyPaisa)

Ye backend aapke local **XAMPP MySQL** se connect hota hai, dummy products seed karta hai,
aur **JazzCash / EasyPaisa** mobile wallet payments ko real API flow ke saath handle karta hai.

## 1. XAMPP MySQL start karein
- XAMPP Control Panel kholein → **MySQL** ke saamne **Start** dabayein.
- (Apache start karna zaroori nahi, sirf MySQL chahiye.)

## 2. Backend install karein
```bash
cd server
npm install
```

## 3. `.env` file banayein
```bash
cp .env.example .env
```
Default values XAMPP ke liye already sahi hain (`DB_HOST=localhost`, `DB_USER=root`, `DB_PASSWORD=` empty).
Agar aapne XAMPP mein root ka password set kiya hua hai, to `.env` mein `DB_PASSWORD=` update kar dein.

## 4. Database create + seed karein (54 dummy products)
```bash
npm run seed
```
Ye command:
- `atelier_db` database aur saari tables bana dega (`schema.sql` se)
- 54 real dummy products insert karega
- 1 admin user banayega: **atif@admin.com / atif@access.com**
- 3 coupons banayega: `ATELIER10`, `LUXE20`, `SPRING500`

## 5. Server chalayein
```bash
npm start
```
Aapko ye dikhna chahiye:
```
✅ MySQL connected: localhost:3306/atelier_db
🚀 The Atelier API running on http://localhost:4000
```

Test karne ke liye browser mein kholein: http://localhost:4000/api/health

## 6. JazzCash / EasyPaisa credentials lagayein
`.env` file mein ye fields hain:
```
JAZZCASH_MERCHANT_ID=
JAZZCASH_PASSWORD=
JAZZCASH_INTEGRITY_SALT=
```
Ye JazzCash Merchant Sandbox se milte hain: https://sandbox.jazzcash.com.pk
(Merchant onboarding request submit karne ke baad JazzCash aapko sandbox credentials email karta hai — ye mujhe khud generate karne ki ijazat nahi hai kyunke ye har merchant ke liye unique/secret hote hain.)

EasyPaisa ke liye: https://easypaisa.com.pk/business/ → Merchant Portal se `EASYPAISA_STORE_ID` aur `EASYPAISA_HASH_KEY` milega.

**Jab tak real credentials nahi lagayenge**, JazzCash/EasyPaisa checkout attempt karne par
saaf error milega ("JazzCash credentials missing...") — Cash on Delivery hamesha kaam karega.

## Kaise chalayein (dono ek saath)
Do terminal windows kholein:
```bash
# Terminal 1 — backend
cd server && npm start

# Terminal 2 — frontend
npm run dev
```
Frontend `http://localhost:5173` par khulega aur automatically backend (`http://localhost:4000/api`) se baat karega.

## API Endpoints (summary)
| Method | Route | Description |
|---|---|---|
| GET | `/api/health` | Server + DB status |
| GET | `/api/products` | All products |
| POST/PUT/DELETE | `/api/products/:id` | Admin CRUD (needs JWT) |
| POST | `/api/auth/register`, `/api/auth/login` | Auth |
| GET | `/api/orders` | List orders (admin: all, user: own) |
| POST | `/api/orders` | Place order (server re-prices from DB, decrements stock) |
| PATCH | `/api/orders/:id/status` | Admin: update order status |
| GET/POST/DELETE | `/api/coupons` | Coupons CRUD |
| POST | `/api/payments/jazzcash/initiate` | Build signed JazzCash payment request |
| POST | `/api/payments/jazzcash/callback` | JazzCash redirects here after payment |
| POST | `/api/payments/easypaisa/initiate` | Build signed EasyPaisa payment request |
| POST | `/api/payments/easypaisa/callback` | EasyPaisa redirects here after payment |
| GET | `/api/payments/status/:orderId` | Check payment status |
