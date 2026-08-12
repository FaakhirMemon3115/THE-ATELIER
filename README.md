# THE ATELIER — Full-Stack Luxury Fashion Store

Ye project ab **do parts** mein hai:

```
THE-ATELIER/
├── src/            ← Frontend (Vite + TypeScript) — UI, admin panel, checkout
├── server/         ← Backend (Express + MySQL) — API, database, JazzCash/EasyPaisa payments
├── .env.example    ← Frontend ka API URL config
└── ...
```

## Quick Start (dono ek saath chalayein)

### 1) Database + Backend
```bash
# XAMPP mein MySQL start karein pehle

cd server
npm install
cp .env.example .env
npm run seed      # 54 dummy products + admin user + coupons MySQL mein daal dega
npm start          # http://localhost:4000
```

### 2) Frontend
```bash
# project root mein (server folder ke bahar)
npm install
cp .env.example .env
npm run dev         # http://localhost:5173
```

Browser mein `http://localhost:5173` kholein. Admin login:
- **Email:** `atif@admin.com`
- **Password:** `atif@access.com`

## Is update mein kya kya hua

### ✅ Admin Panel
- Sidebar (Dashboard, Products, Users, Orders, Coupons, Hero Customizer, Stock Alerts) verify aur clean kiya — sirf yehi 7 sections hain, koi extra/duplicate page nahi.
- Admin panel full-screen render hota hai (navbar/footer leak nahi karta) — verify kiya gaya.
- Product Add/Edit/Delete/Restock, Coupon Add/Delete, Order Status Update — sab ab MySQL database ke saath sync hote hain (backend chal raha ho to).

### ✅ Database → MySQL
- Poora schema (`server/db/schema.sql`): products, users, orders, order_items, coupons, payment_transactions, hero_banner.
- `npm run seed` se 54 real dummy products, 1 admin user, 3 coupons insert ho jaate hain.
- Pehle sab kuch sirf browser ke localStorage mein tha — ab real MySQL backend hai.

### ✅ Payment Gateway (JazzCash + EasyPaisa)
- Checkout page mein 3 options: **Cash on Delivery**, **JazzCash**, **EasyPaisa**.
- JazzCash/EasyPaisa select karne par: order backend mein MySQL ke andar create hota hai → phir signed HMAC request bana ke customer ko asli JazzCash/EasyPaisa payment page par redirect kar diya jaata hai → payment complete hone ke baad wapas app mein redirect ho ke success/fail toast dikhta hai.
- **Zaroori:** JazzCash/EasyPaisa se apne merchant sandbox credentials lein aur `server/.env` mein daalein (details `server/README.md` mein). Credentials ke bina ye clearly error dikhayega, crash nahi karega.
- Cash on Delivery hamesha kaam karta hai, credentials ki zaroorat nahi.

## Important Note (honesty)
Maine ye poora backend (MySQL schema + seed + JazzCash/EasyPaisa integration) yahan is sandbox mein likha hai jahan **internet access nahi hai** — isliye main khud live MySQL server ya real JazzCash/EasyPaisa sandbox se connect karke test nahi kar saka. Jo maine verify kiya:
- Frontend: `npx tsc --noEmit` → **0 errors**
- Backend: har `.js` file `node --check` se syntax-verified → **0 errors**

Aapko apne machine par `npm install` + `npm run seed` chalana hoga (jahan internet available hai) taake real MySQL connection aur payment gateway test ho sakein. Agar koi error aaye to mujhe exact error message bhej dein, main turant fix kar dunga.
