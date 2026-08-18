# 🌿 Serene Haven — Luxury Spa & Wellness Platform

[![Spring Boot](https://img.shields.io/badge/Spring_Boot_3.4-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js_16_App_Router-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Tailwind CSS](https://img.shields.io/badge/Vanilla_CSS_%26_Design_Tokens-D4AF37?style=for-the-badge)](https://developer.mozilla.org/en-US/docs/Web/CSS)

> A state-of-the-art, luxury wellness management and appointment reservation platform with multi-sanctuary geolocation routing, daily verified therapist presence check-ins, multi-image therapist portfolios, ₹99 daily branch unlocks, and role-based client & administrative dashboards.

---

## 📑 Table of Contents

1. [Executive Summary & Core Value Proposition](#-executive-summary--core-value-proposition)
2. [Role Architecture & Access Control Matrix](#-role-architecture--access-control-matrix)
3. [Key Features & Modules](#-key-features--modules)
   - [Client Experience & Financial Privacy](#1-client-experience--financial-privacy)
   - [Branch Staff Roster & Sanctuary Transfers](#2-branch-staff-roster--sanctuary-transfers)
   - [Therapist Studio & Multi-Photo Gallery](#3-therapist-studio--multi-photo-gallery)
   - [Branch Agent Presence Desk](#4-branch-agent-presence-desk)
   - [Admin Business Intelligence & Payment Analytics](#5-admin-business-intelligence--payment-analytics)
   - [Branch Geolocation & Razorpay Daily Unlock Model](#6-branch-geolocation--razorpay-daily-unlock-model)
4. [System Architecture & Technology Stack](#-system-architecture--technology-stack)
5. [Database Schema & Data Models](#-database-schema--data-models)
6. [API Endpoints & Integration Specification](#-api-endpoints--integration-specification)
7. [Default Seed Credentials & Test Accounts](#-default-seed-credentials--test-accounts)
8. [Local Installation & Setup Guide](#-local-installation--setup-guide)
9. [Deployment Guide](#-deployment-guide)

---

## 🌟 Executive Summary & Core Value Proposition

**Serene Haven** is built for premium spa chains operating multiple physical sanctuaries across cities. It eliminates booking friction, guarantees therapist availability through verified daily branch check-ins, and protects business privacy with clean role segregation.

```
┌──────────────────────────────────────────────────────────────────────────┐
│                             SERENE HAVEN                                 │
│                   Luxury Spa & Wellness Ecosystem                        │
└──────────────────────────────────────────────────────────────────────────┘
                                      │
         ┌────────────────────────────┼───────────────────────────┐
         ▼                            ▼                           ▼
┌──────────────────┐        ┌──────────────────┐        ┌──────────────────┐
│   CLIENT VIEW    │        │   BRANCH AGENT   │        │   SUPER ADMIN    │
│                  │        │                  │        │                  │
│ • GPS Discovery  │        │ • Daily Check-in │        │ • Roster Mgmt    │
│ • Daily Unlock   │        │ • Presence Desk  │        │ • Studio Gallery │
│ • Verified Staff │        │ • Photo Updates  │        │ • Rev Analytics  │
│ • Photo Gallery  │        │ • Branch Scope   │        │ • Client LTV     │
│ • Instant Booking│        │ • Safe Isolation │        │ • Agent Control  │
└──────────────────┘        └──────────────────┘        └──────────────────┘
```

---

## 👥 Role Architecture & Access Control Matrix

| Feature / Capability | Client (`CLIENT`) | Branch Agent (`AGENT`) | Super Admin (`SUPER_ADMIN` / `ADMIN`) |
| :--- | :---: | :---: | :---: |
| **Browse Branches & Services** | ✅ | ✅ | ✅ |
| **View Verified Present Staff** | ✅ *(Post-Unlock)* | ✅ *(Branch only)* | ✅ *(All Sanctuaries)* |
| **View Therapist Photo Gallery** | ✅ | ✅ | ✅ |
| **Book Ritual Appointments** | ✅ | ❌ | ✅ |
| **₹99 Branch Access Unlock** | ✅ | ❌ *(Bypassed)* | ❌ *(Bypassed)* |
| **Daily Staff Check-in (`PRESENT`/`LEAVE`)** | ❌ | ✅ *(Assigned Branch)* | ✅ *(All Sanctuaries)* |
| **Reassign Staff between Sanctuaries** | ❌ | ❌ | ✅ |
| **Create Therapists & Multi-Photo Upload**| ❌ | ❌ | ✅ |
| **Manage Agent Accounts** | ❌ | ❌ | ✅ |
| **Client Spend & Lifetime Value Metrics**| ❌ *(Strictly Hidden)*| ❌ *(Strictly Hidden)*| ✅ *(Full Financial Suite)*|
| **Itemized Payment Ledger** | ❌ *(Strictly Hidden)*| ❌ *(Strictly Hidden)*| ✅ *(All Transactions)*|

---

## 💎 Key Features & Modules

### 1. Client Experience & Financial Privacy
- **Luxury Navigation:** Client sidebar is focused strictly on discovery: *Overview*, *Explore Sanctuaries*, *Treatments*, and *My Appointments*.
- **Financial Privacy Assurance:** Client spend totals, payment ledgers, and transaction histories are completely stripped from client views to maintain discretion.
- **Lightbox Photo Viewer:** Interactive therapist gallery with high-resolution image slideshow, therapist bio, certifications, ratings, and instant booking CTA.

### 2. Branch Staff Roster & Sanctuary Transfers
- **Pure Branch Assignment:** Streamlined interface dedicated solely to assigning practitioners to branches without clutter.
- **Multi-Level Filters:** Filter sanctuaries by city location, specific branch, or real-time practitioner search.
- **Collapsible Sanctuary Accordions:** Smooth collapsible cards with 1-click `Expand All` / `Collapse All` toggles.
- **Instant Sanctuary Transfer:** 1-click dropdown on any staff member immediately reallocates them to another sanctuary in the database.

### 3. Therapist Studio & Multi-Photo Gallery
- **Dedicated Master Studio:** Create therapists with multiple image URLs (comma-separated or dynamic fields), specialization badges, and detailed bios.
- **Portfolio Strips:** Real-time thumbnail preview strips with `+X more` count indicators.
- **Photo Management Modal (`StaffGalleryManageModal`):**
  - Add unlimited high-res image URLs.
  - 1-click **"Make Primary Profile Photo"** selector.
  - Delete individual images with instant preview updates.

### 4. Branch Agent Presence Desk
- **Daily Check-In Station:** Agents check in therapists every morning (`PRESENT` or `ON_LEAVE`) aligned with Indian Standard Time (`Asia/Kolkata`).
- **Verified Staff Badging:** Only therapists marked `PRESENT` are bookable by clients for that day.
- **Branch Scoped Isolation:** Agents are locked to their assigned physical sanctuary and cannot view or alter other branches.

### 5. Admin Business Intelligence & Payment Analytics
- **Executive Revenue Metrics:** Tracks Lifetime Platform Collections, Paying Client counts, and Average Order Value.
- **Client Lifetime Spend Breakdown:** Itemized table calculating total payments, transaction frequencies, and last activity date per client.
- **Detailed Transactions Ledger:** Full audit log of all ₹99 branch unlocks and ritual booking payments.

### 6. Branch Geolocation & Razorpay Daily Unlock Model
- **GPS Coordinates & Direct Google Maps Routing:** Exact latitude/longitude mapping with embedded Google Maps directions.
- **₹99 Daily Unlock Monetization:** Unlocks verified live staff availability for a specific sanctuary for 24 hours (IST reset).

---

## 🏗 System Architecture & Technology Stack

```text
SpaService/
├── spa-backend/                         # Spring Boot 3.4.3 (Java 25)
│   ├── src/main/java/com/spaservice/
│   │   ├── config/                      # SecurityConfig, CorsConfig, DataInitializer
│   │   ├── controller/                  # Client, Agent, Admin, Auth, Payment Controllers
│   │   ├── dto/                         # Request/Response Data Transfer Objects
│   │   ├── entity/                      # JPA Entities (WorkingStaff, Branch, Payment, User...)
│   │   ├── repository/                  # Spring Data JPA Repositories
│   │   ├── service/                     # Business Logic (StaffService, BranchService, UnlockService...)
│   │   └── exception/                   # Global Exception Handlers & Custom Exceptions
│   └── src/main/resources/
│       ├── application.yml              # Main configuration
│       ├── application-local.yml        # In-memory H2 local dev profile
│       └── db/migration/                # Flyway SQL migrations
│
└── spa-frontend/                        # Next.js 16 (App Router + Turbopack)
    ├── src/app/
    │   ├── admin/dashboard/             # Super Admin Portal (Roster, Studio, Analytics)
    │   ├── agent/dashboard/             # Branch Agent Portal (Check-in desk)
    │   ├── client/dashboard/            # Client Portal (Appointments, Unlocks)
    │   ├── branches/                    # Sanctuary exploration & Therapist gallery
    │   ├── services/                    # Treatment catalog
    │   └── auth/                        # Login & Registration flows
    ├── src/components/                  # TherapistGalleryModal, StaffGalleryManageModal, Navbar
    └── src/lib/                         # API fetcher, auth context, TypeScript definitions
```

---

## 🗄 Database Schema & Data Models

### `working_staff`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique practitioner identifier |
| `branch_id` | `UUID` | `FOREIGN KEY` | Assigned spa sanctuary |
| `name` | `VARCHAR(100)` | `NOT NULL` | Therapist full name |
| `specialization` | `VARCHAR(255)` | `NOT NULL` | Treatment specialties |
| `bio` | `TEXT` | `NULLABLE` | Biography & certifications |
| `gallery_photo_urls`| `TEXT` | `NULLABLE` | Comma-separated gallery image URLs |
| `is_active` | `BOOLEAN` | `DEFAULT TRUE` | Active employment status |

### `staff_daily_checkin`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique check-in record |
| `staff_id` | `UUID` | `FOREIGN KEY` | Checked-in practitioner |
| `branch_id` | `UUID` | `FOREIGN KEY` | Verification sanctuary |
| `checkin_date` | `DATE` | `NOT NULL` | Date in `Asia/Kolkata` |
| `status` | `VARCHAR(20)` | `NOT NULL` | `PRESENT` / `ON_LEAVE` |
| `confirmed_at` | `TIMESTAMP` | `NOT NULL` | Timestamp of agent check-in |

### `branch_daily_unlock`
| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | `PRIMARY KEY` | Unique unlock record |
| `user_id` | `UUID` | `FOREIGN KEY` | Client user |
| `branch_id` | `UUID` | `FOREIGN KEY` | Unlocked sanctuary |
| `unlock_date` | `DATE` | `NOT NULL` | Valid calendar date (IST) |
| `expires_at` | `TIMESTAMP` | `NOT NULL` | 23:59:59 IST expiry |

---

## 🔌 API Endpoints & Integration Specification

### 🔐 Authentication & Session
- `POST /api/v1/auth/register` — Client registration
- `POST /api/v1/auth/login` — JWT Authentication (returns token & role metadata)
- `GET /api/v1/auth/me` — Current authenticated user profile

### 🌿 Public & Client APIs
- `GET /api/v1/branches` — List all active sanctuaries
- `GET /api/v1/branches/{id}` — Sanctuary details & location
- `GET /api/v1/branches/{id}/staff` — Verified present therapists (requires branch unlock or admin/agent auth)
- `POST /api/v1/client/branches/{id}/unlock` — ₹99 Razorpay branch unlock initiation
- `POST /api/v1/client/appointments` — Book a session with a present therapist
- `GET /api/v1/client/appointments` — Client's booked sessions

### 🛡 Super Admin APIs
- `GET /api/v1/admin/dashboard` — Revenue, bookings, staff, and branch statistics
- `GET /api/v1/admin/staff` — Master staff directory with branch mappings and galleries
- `POST /api/v1/admin/staff` — Create therapist with multi-image gallery
- `PUT /api/v1/admin/staff/{id}` — Update therapist details, bio, and gallery
- `POST /api/v1/admin/staff/{id}/assign-branch` — Reassign therapist to a different sanctuary
- `PUT /api/v1/admin/staff/{id}/gallery` — Update multi-photo gallery URLs
- `DELETE /api/v1/admin/staff/{id}/profile-photo` — Remove primary photo
- `PATCH /api/v1/admin/staff/{id}/status?active=true` — Toggle active status
- `GET /api/v1/admin/payments` — Client lifetime spend and transaction log

### 👥 Branch Agent APIs
- `GET /api/v1/agent/staff` — Assigned branch staff roster
- `POST /api/v1/agent/staff/{id}/checkin` — Mark therapist `PRESENT` or `ON_LEAVE`
- `PUT /api/v1/agent/staff/{id}/gallery` — Update gallery photos for local branch staff

---

## 🔑 Default Seed Credentials & Test Accounts

| Role | Email Address | Password | Assigned Sanctuary |
| :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@serenehaven.com` | `Admin@1234` | All Sanctuaries |
| **Branch Agent (BLR)**| `agent.blr@serenehaven.com` | `Agent@1234` | Serene Haven — Koramangala |
| **Client** | `client@example.com` | `Client@1234` | Client Portal |

---

## 🚀 Local Installation & Setup Guide

### 1. Prerequisites
- **Java**: OpenJDK 21 or Java 25
- **Node.js**: v18+ or v20+
- **Git**: Installed and configured

### 2. Backend Setup (`spa-backend`)
```bash
# Clone the repository
git clone git@github.com:yuvankrish8725/SpaService.git
cd SpaService/spa-backend

# Run with local profile (in-memory H2 database with automatic seeding)
./gradlew.bat bootRun --args='--spring.profiles.active=local'
```
*Backend runs at:* **`http://localhost:8081`**

### 3. Frontend Setup (`spa-frontend`)
```bash
cd ../spa-frontend

# Install dependencies
npm install

# Start Next.js with Turbopack
npm run dev
```
*Frontend runs at:* **`http://localhost:3000`**

---

## 🌐 Production Deployment Guide

1. **Database:** Deploy a PostgreSQL instance on [Aiven.io](https://aiven.io) or AWS RDS.
2. **Backend:** Deploy `spa-backend` as a Docker container on [Render](https://render.com) or [Railway](https://railway.app) with environment variables:
   ```env
   SPRING_PROFILES_ACTIVE=prod
   DB_URL=jdbc:postgresql://<host>:<port>/<dbname>
   DB_USERNAME=<username>
   DB_PASSWORD=<password>
   JWT_SECRET=<secure_256_bit_secret>
   ```
3. **Frontend:** Connect `spa-frontend` to [Vercel](https://vercel.com) with:
   ```env
   NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api/v1
   ```

---

## 📜 License
Copyright © 2026 Serene Haven Luxury Spa & Wellness Platform. All rights reserved.
