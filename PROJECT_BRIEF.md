# Afro-Arab Architect - Project Brief (v2.0)

## 1. Project Overview
**Name:** Afro-Arab Architect  
**Purpose:** A high-performance B2B supply chain management system connecting Admins, Regional Agents, Suppliers, and Associate Partners. It facilitates the end-to-end trade lifecycle — from quotation to commission — with robust RBAC, real-time notifications, and mobile support.

---

## 2. Technology Stack

### Frontend (Web & Mobile)
- **Directory:** `/frontend`
- **Framework:** React 19 (Vite 6)
- **Language:** TypeScript
- **State Management:** React Hooks
- **Mobile Hybrid:** Capacitor 8 (Android)
- **Styling:** Vanilla CSS + Tailwind
- **API Layer:** Custom service with auto camelCase/snake_case conversion

### Backend (API)
- **Directory:** `/backend`
- **Framework:** Django (Python)
- **API:** Django REST Framework (DRF)
- **Authentication:** JWT (SimpleJWT)
- **Database:** PostgreSQL (Production & Development)
- **File Storage:** Django media files (brochures, payment proofs)

---

## 3. Directory Structure
```
AABA_FINAL/
├── backend/            # Django Backend
│   ├── api/            # Models, Views, Serializers
│   ├── config/         # Settings & URLs
│   ├── manage.py
│   └── requirements.txt
├── frontend/           # React Frontend
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── services/
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   └── types.ts
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── PROJECT_BRIEF.md    # This document
├── .gitignore
└── README.md
```

---

## 4. User Roles & Permissions

| Role | Permissions |
|---|---|
| **Admin** | Full system control. Manages all users, orders, and system settings. |
| **Agent** | Manages assigned buyers and orders. Tracks regional trade. |
| **Supplier** | Manages company profile, brochures, and tracks their own orders. |
| **Partner** | Read-only access to linked supplier data and buyer requirements. |

---

## 5. Core Features
- **12-Stage Pipeline:** `Quotation Sent` → `Order Completed`.
- **Localization:** All monetary values displayed in **₹ (INR)**.
- **Notifications:** Real-time alerts for status changes and assignments.
- **Associate Partner Role:** Simplified onboarding with read-only monitoring capabilities.

---

## 6. Recent Features & Security Enhancements
- **Lead Visibility & Search**: Implemented role-based lead visibility and added searching by detailed product requirements in the Buyer Registry.
- **Data Deletion & Integrity**: Added a reusable `ConfirmationModal` for all deletion actions. Fixed ID type mismatches between frontend and backend to enable reliable record deletion.
- **Security Logic (IDOR Fix)**: Implemented backend object-level permission checks. Agents can only modify leads they created or are assigned to.
- **Restricted Fields**: Secured sensitive data fields (e.g., `assigned_agent`) to be modifiable only by Administrators.
- **Admin Visibility**: Enhanced the Buyer Registry to show assigned agent names next to corporate entities for Admin users.

## 7. Project Cleanup & Migration
- **Restructuring:** Segregated frontend and backend into dedicated top-level directories.
- **Database:** Migrated fully from SQLite to PostgreSQL; all local `.sqlite3` files removed.
- **Mobile Prep:** Configured Capacitor for Android deployment.
