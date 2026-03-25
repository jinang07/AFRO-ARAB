# Afro-Arab Architect - Project Brief (v3.0) - LIVE

## 1. Project Overview
**Name:** Afro-Arab Architect  
**Purpose:** A high-performance B2B supply chain management system connecting Admins, Regional Agents, Suppliers, and Associate Partners. It facilitates the end-to-end trade lifecycle — from quotation to commission — with robust RBAC, real-time notifications, and mobile support.

### 🚀 Production Status
- **Backend Server:** [Live on VPS]
- **Android App:** [Published on Google Play Store (v4)]
- **iOS App:** Capacitor Integration Complete (Distribution Ready)

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
- **Buyer Anonymization**: Implemented privacy controls to hide personal and company names of Buyers from Suppliers and Associate Partners, replacing them with "Verified Client" labels.
- **Global Notifications**: Centralized the "Mark All As Read" functionality in the global Header, making it accessible from all panels.
- **Improved Onboarding**: Redesigned the Supplier registration flow into a simplified 3-step process and replaced brochure URLs with direct file uploads.
- **Lead Visibility & Search**: Implemented role-based lead visibility and added searching by detailed product requirements in the Buyer Registry.
- **Security Logic (IDOR Fix)**: Implemented backend object-level permission checks. Agents can only modify leads they created or are assigned to.
- **Theme Refinement**: Updated document management sections to a professional Indigo theme and removed legacy red/rose branding from supplier views.
- **iOS & Xcode Optimization**: Configured project for iOS deployment via Capacitor, including signing and provisioning setup for App Store distribution.
- **Splash Screen Revamp**: Implemented high-performance animations and smooth transitions for the mobile launch experience.
- **Production Stabilization**: Finalized PostgreSQL migration and environment configuration for live VPS deployment.

## 7. Project Cleanup & Migration
- **Restructuring:** Segregated frontend and backend into dedicated top-level directories.
- **Database:** Migrated fully from SQLite to PostgreSQL; all local `.sqlite3` files removed.
- **Mobile Prep:** Full Capacitor integration for Android, including optimized Build Bundle (.aab) generation pipelines.
