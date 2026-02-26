# Afro-Arab Architect - Project Brief

## 1. Project Overview
**Name:** Afro-Arab Architect (formerly AFRO-ARAB Supply Chain)  
**Purpose:** A high-performance B2B supply chain management system that connects Admins, Regional Agents, Suppliers, and Associate Partners. It facilitates the end-to-end lifecycle of trade orders — from initial quotation to delivery and commission — with robust role-based access control, real-time notifications, and mobile support.

---

## 2. Technology Stack

### Frontend (Web & Mobile)
- **Framework:** React 19 (via Vite 6.2)
- **Language:** TypeScript
- **State Management:** React Hooks
- **Mobile Hybrid:** Capacitor 8 (Android deployment)
- **Styling:** Vanilla CSS + Tailwind utility classes
- **API Layer:** Custom `api.ts` service with automatic camelCase ↔ snake_case conversion

### Backend (API)
- **Framework:** Django (Python)
- **API:** Django REST Framework (DRF)
- **Authentication:** JWT with token rotation (`rest_framework_simplejwt`)
- **Database:**
  - Development: SQLite (`db_v2.sqlite3`)
  - Production: PostgreSQL (recommended)
- **File Storage:** Django media files (`/media/`) for brochures and payment screenshots

---

## 3. User Roles

| Role | Description |
|---|---|
| **Admin** | Full system control. Manages agents, approves suppliers, creates orders, views all data. |
| **Agent** | Regional trade representative. Manages assigned buyers and orders, tracks pipeline status. |
| **Supplier** | Registers company, uploads documents/brochures, tracks their own orders. |
| **Associate Partner** | Read-only view of linked supplier data, buyer requirements, and order pipeline. Receives real-time notifications. |

---

## 4. Core Modules

### Dashboard
- Key metrics: active orders, buyers, revenue volume, agent leaderboard.
- Data refreshes on every navigation (live sync).

### Supplier Management
- Registration workflow: **Pending → Approved / Rejected** (admin-controlled).
- Suppliers self-manage their profile (company identity, compliance docs, brochures).
- Admin can add suppliers directly — **payment proof is optional** for admin entries.
- Suppliers linked to an Associate Partner via `associate_partner` field.

### Buyer Management (Requirements)
- Database of buyers with sourcing requirements (product specs, quantity, incoterms, pricing).
- Assigned to specific Regional Agents.
- **Suppliers:** See anonymized buyer requirements (identity protected).
- **Associate Partners:** See all requirement details (product need, specs, target price, etc.) — read-only, no Add/Edit/Delete access.

### Order Management
- 12-stage pipeline: `Quotation Sent → Approved → MOU Sign → Follow-ups → Confirmed → Processing → Shipped → Delivered → Payment Terms → Payment Received → Commission Received → Order Completed`.
- Tracks order value (`amount`) and agent commission separately — displayed in **₹ (INR)**.
- Agents only see their assigned orders; Suppliers see their company's orders; Partners see orders for their linked suppliers.
- Agent dropdown for order assignment only shows `AGENT` role users (Partners excluded).

### Reports
- Aggregated analytics per agent: volume (₹), order count, value.
- All monetary values displayed in **₹ (INR)**.

### Intelligence Alerts (Notifications)
- Real-time alerts fetched every 30 seconds via Profile screen.
- **Admin:** Notified on all status changes and new registrations.
- **Agent:** Notified when assigned a new buyer or order, or when their order status changes.
- **Supplier:** Notified when a new order is assigned or status changes.
- **Associate Partner:** Notified when a new order is created or the status of an order changes for their linked supplier.
- Internal status (`COMMISSION_RECEIVED`) only notifies Admins — no noise for others.

### Agent & Partner Management (Admin only)
- Toggle between "Regional Agents" and "Associated Partners" tabs.
- Partners only require **username + password** to create (simplified onboarding).
- Agents require full profile (name, phone, country, region, etc.).

---

## 5. Architecture & Data Model

### Key Models
| Model | Key Fields |
|---|---|
| `User` | `role` (ADMIN/AGENT/SUPPLIER/PARTNER), `username`, `phone_number`, `country`, `region` |
| `Supplier` | `company_name`, `status` (PENDING/APPROVED/REJECTED), `associate_partner` (username), `brochure_file`, `payment_screenshot` |
| `Buyer` | `company_name`, `country`, `product_need`, `assigned_agent`, sourcing detail fields |
| `Order` | `supplier`, `assigned_agent`, `status`, `amount` (₹), `commission` (₹), `readable_id` |
| `Notification` | `recipient` (User FK), `message`, `type`, `is_read`, `created_at` |

### Folder Structure
```
AFRO-ARAB/
├── backend/
│   ├── api/             # Models, Views, Serializers
│   ├── config/          # Django settings, URLs
│   ├── media/           # Uploaded files (brochures, payment proofs)
│   └── .env             # Secret key, DB credentials, ALLOWED_HOSTS
├── frontend/
│   ├── screens/         # Login, Dashboard, Suppliers, Buyers, Orders, Reports, Agents, Profile
│   ├── components/      # BottomNav, Header, ConfirmationModal
│   ├── services/        # api.ts (HTTP client with auto camelCase conversion)
│   ├── types/           # Shared TypeScript types
│   └── .env             # VITE_API_BASE_URL (update when IP changes)
└── PROJECT_BRIEF.md
```

---

## 6. Environment & Configuration

### Frontend `.env`
```env
VITE_API_BASE_URL=http://<YOUR_IP>:8000/api/v1
VITE_API_URL=http://<YOUR_IP>:8000/api/v1
```
> ⚠️ **Update this file every time your machine's IP address changes.**

### Backend `.env`
```env
ALLOWED_HOSTS=*
DEBUG=True
CORS_ALLOW_ALL_ORIGINS=True
```

---

## 7. Deployment
- **Web:** `npm run build` (Vite) → serve `dist/` folder.
- **Mobile:** `npx cap sync android` → open in Android Studio → build APK/AAB.
- **Backend:** `python manage.py runserver 0.0.0.0:8000` (dev) or Gunicorn (prod).

---

## 8. Changelog

### Feb 2026 — Project Cleanup & Restructure
- Removed unused Flutter project, redundant database `db.sqlite3`, and unused UI components.
- Restructured into `frontend/` and `backend/` directories.

### Feb 2026 — Core Feature Additions
- Implemented the full 12-stage order pipeline with status validation.
- Added Notification system (backend model + frontend polling).
- Added Confirmation modal replacing native browser `confirm()` dialogs.
- Currency localized to **₹ INR** across all screens (Orders, Buyers, Reports, Suppliers).
- Fixed `DisallowedHost` login errors by setting `ALLOWED_HOSTS=*`.
- Moved API base URL to frontend `.env` for easy IP switching.

### Feb 2026 — Associate Partner Role
- Added `PARTNER` role to `User` model.
- Partners require only username + password (simplified onboarding).
- Partners see: linked supplier profiles, all buyer requirements (read-only), their supplier's orders.
- Partners receive real-time notifications for new orders and order status changes.
- Admin's agent management page now has tabs for "Regional Agents" and "Associated Partners".

### Feb 2026 — Bug Fixes
- Partners now see full buyer requirement details (not anonymized like Suppliers).
- Add/Edit/Delete buttons hidden for Partners on the Requirements page.
- Order agent assignment dropdown filters out Partner-role users.
- Payment proof made optional when Admin adds a new supplier.
- Backend notification logic extended to notify Associate Partners on order events.
