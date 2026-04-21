-- ============================================================
--  O2C Management System - MySQL Database Setup (CLEAN)
--  NO sample data - all data entered by users only
--  Run this script ONCE before starting the backend
-- ============================================================

-- Step 1: Create the database
CREATE DATABASE IF NOT EXISTS o2c_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE o2c_db;

-- ============================================================
--  Drop tables in reverse FK order (safe re-run)
-- ============================================================
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS otp_store;
DROP TABLE IF EXISTS users;
SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
--  Create Tables
-- ============================================================

-- Users table
CREATE TABLE users (
  id           BIGINT AUTO_INCREMENT PRIMARY KEY,
  username     VARCHAR(100) NOT NULL UNIQUE,
  password     VARCHAR(255) NOT NULL,
  mobile       VARCHAR(15)  NOT NULL UNIQUE,
  email        VARCHAR(150),
  full_name    VARCHAR(150),
  role         ENUM('USER','ADMIN') NOT NULL DEFAULT 'USER',
  active       TINYINT(1) NOT NULL DEFAULT 1,
  created_at   DATETIME
);

-- OTP Store table
CREATE TABLE otp_store (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  mobile      VARCHAR(15)  NOT NULL,
  otp         VARCHAR(6)   NOT NULL,
  expires_at  DATETIME     NOT NULL,
  used        TINYINT(1)   NOT NULL DEFAULT 0
);

-- Customers table
CREATE TABLE customers (
  id          BIGINT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(150) NOT NULL,
  email       VARCHAR(150) UNIQUE,
  mobile      VARCHAR(15),
  city        VARCHAR(100),
  address     TEXT,
  status      ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  created_at  DATETIME
);

-- Orders table
CREATE TABLE orders (
  id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id             VARCHAR(50)    NOT NULL UNIQUE,
  customer_id          BIGINT         NOT NULL,
  status               ENUM('PENDING','PROCESSING','SHIPPED','DELIVERED','CANCELLED') NOT NULL DEFAULT 'PENDING',
  shipping_address     VARCHAR(255),
  shipping_city        VARCHAR(100),
  shipping_postal_code VARCHAR(20),
  notes                TEXT,
  total_amount         DECIMAL(12,2)  NOT NULL DEFAULT 0.00,
  order_date           DATE,
  created_at           DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Order Items table
CREATE TABLE order_items (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  order_id      BIGINT         NOT NULL,
  product_name  VARCHAR(150)   NOT NULL,
  quantity      INT            NOT NULL,
  unit_price    DECIMAL(10,2)  NOT NULL,
  total_price   DECIMAL(12,2)  NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE invoices (
  id               BIGINT AUTO_INCREMENT PRIMARY KEY,
  invoice_number   VARCHAR(50)   NOT NULL UNIQUE,
  order_id         BIGINT        NOT NULL,
  customer_id      BIGINT        NOT NULL,
  status           ENUM('PAID','PENDING','OVERDUE') NOT NULL DEFAULT 'PENDING',
  amount           DECIMAL(12,2) NOT NULL,
  invoice_date     DATE,
  due_date         DATE,
  created_at       DATETIME,
  FOREIGN KEY (order_id)    REFERENCES orders(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- Payments table
-- NOTE: Default status is now PENDING (not COMPLETED)
--       Use PATCH /api/payments/{id}/pay to mark as COMPLETED
CREATE TABLE payments (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  payment_id    VARCHAR(50)   NOT NULL UNIQUE,
  invoice_id    BIGINT        NOT NULL,
  customer_id   BIGINT        NOT NULL,
  method        ENUM('BANK_TRANSFER','UPI','CHEQUE','CASH','CARD') NOT NULL,
  status        ENUM('COMPLETED','PENDING','FAILED') NOT NULL DEFAULT 'PENDING',
  amount        DECIMAL(12,2) NOT NULL,
  payment_date  DATE,
  created_at    DATETIME,
  FOREIGN KEY (invoice_id)  REFERENCES invoices(id),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- ============================================================
SELECT 'Clean database setup complete! No sample data loaded.' AS status;
-- ============================================================
