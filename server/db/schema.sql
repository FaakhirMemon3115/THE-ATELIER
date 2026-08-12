-- ============================================================
--  THE ATELIER — MySQL Schema
--  Run this once against your local MySQL (XAMPP/phpMyAdmin
--  or `mysql -u root -p < schema.sql`) to create the database
--  and all tables. Safe to re-run (uses IF NOT EXISTS).
-- ============================================================

CREATE DATABASE IF NOT EXISTS atelier_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE atelier_db;

-- ── USERS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            VARCHAR(40)  PRIMARY KEY,
  email         VARCHAR(190) NOT NULL UNIQUE,
  name          VARCHAR(150) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  avatar        VARCHAR(255) DEFAULT NULL,
  is_banned     TINYINT(1)   NOT NULL DEFAULT 0,
  registered_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME     DEFAULT NULL
) ENGINE=InnoDB;

-- ── PRODUCTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id                  VARCHAR(40)  PRIMARY KEY,
  sku                 VARCHAR(60)  NOT NULL UNIQUE,
  name                VARCHAR(200) NOT NULL,
  category            ENUM('Clothing','Bags','Footwear','Accessories') NOT NULL,
  subcategory         VARCHAR(100),
  price               DECIMAL(10,2) NOT NULL,
  original_price      DECIMAL(10,2) DEFAULT NULL,
  discount_percentage INT DEFAULT NULL,
  badge               ENUM('NEW','SALE','BESTSELLER') DEFAULT NULL,
  rating              DECIMAL(2,1) DEFAULT 0,
  reviews_count       INT DEFAULT 0,
  primary_image       VARCHAR(500),
  secondary_image     VARCHAR(500),
  description         TEXT,
  material            VARCHAR(255),
  care                VARCHAR(255),
  fit                 VARCHAR(255),
  sizes               JSON,
  colors              JSON,
  stock               INT NOT NULL DEFAULT 0,
  mood                ENUM('CONFIDENT','ROMANTIC','MINIMAL','BOLD') DEFAULT NULL,
  is_day              TINYINT(1) DEFAULT 0,
  is_night            TINYINT(1) DEFAULT 0,
  featured            TINYINT(1) DEFAULT 0,
  created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_category (category),
  INDEX idx_stock (stock)
) ENGINE=InnoDB;

-- ── COUPONS ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS coupons (
  code             VARCHAR(40) PRIMARY KEY,
  discount_percent INT NOT NULL,
  is_used          TINYINT(1) NOT NULL DEFAULT 0,
  used_by_email    VARCHAR(190) DEFAULT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ── ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                VARCHAR(40) PRIMARY KEY,
  user_id           VARCHAR(40) DEFAULT NULL,
  customer_name     VARCHAR(150) NOT NULL,
  customer_email    VARCHAR(190) NOT NULL,
  customer_phone    VARCHAR(30)  NOT NULL,
  shipping_address  VARCHAR(500) NOT NULL,
  city              VARCHAR(100) NOT NULL,
  postal_code       VARCHAR(20)  DEFAULT NULL,
  subtotal          DECIMAL(10,2) NOT NULL,
  discount          DECIMAL(10,2) NOT NULL DEFAULT 0,
  shipping_fee      DECIMAL(10,2) NOT NULL DEFAULT 0,
  total             DECIMAL(10,2) NOT NULL,
  coupon_code       VARCHAR(40) DEFAULT NULL,
  status            ENUM('Pending','Processing','Shipped','Delivered','Cancelled') NOT NULL DEFAULT 'Pending',
  payment_method    ENUM('Cash on Delivery','JazzCash','EasyPaisa') NOT NULL DEFAULT 'Cash on Delivery',
  payment_status    ENUM('Unpaid','Paid','Failed','Refunded') NOT NULL DEFAULT 'Unpaid',
  tracking_number   VARCHAR(40) NOT NULL,
  date              DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_email (customer_email)
) ENGINE=InnoDB;

-- ── ORDER ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS order_items (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  order_id       VARCHAR(40) NOT NULL,
  product_id     VARCHAR(40) NOT NULL,
  product_name   VARCHAR(200) NOT NULL,
  price          DECIMAL(10,2) NOT NULL,
  quantity       INT NOT NULL,
  selected_size  VARCHAR(20),
  selected_color VARCHAR(60),
  image          VARCHAR(500),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- ── PAYMENT TRANSACTIONS (JazzCash / EasyPaisa audit log) ──
CREATE TABLE IF NOT EXISTS payment_transactions (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  order_id         VARCHAR(40) NOT NULL,
  provider         ENUM('JazzCash','EasyPaisa') NOT NULL,
  txn_ref_number   VARCHAR(60) NOT NULL,
  amount           DECIMAL(10,2) NOT NULL,
  status           ENUM('Initiated','Success','Failed') NOT NULL DEFAULT 'Initiated',
  response_code    VARCHAR(20) DEFAULT NULL,
  response_message VARCHAR(255) DEFAULT NULL,
  raw_response     JSON DEFAULT NULL,
  created_at       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  INDEX idx_txn_ref (txn_ref_number)
) ENGINE=InnoDB;

-- ── HERO BANNER (single-row settings table) ─────────────────
CREATE TABLE IF NOT EXISTS hero_banner (
  id        INT PRIMARY KEY DEFAULT 1,
  title     VARCHAR(200),
  subtitle  VARCHAR(200),
  tagline   VARCHAR(300),
  image_url VARCHAR(500)
) ENGINE=InnoDB;
