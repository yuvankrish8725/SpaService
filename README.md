# SpaService 🌿

A modern, full-stack Spa & Wellness appointment booking and salon management system.

## 🚀 Tech Stack

- **Backend**: Spring Boot 3 (Java 21), Spring Data JPA, Spring Security (JWT), Flyway Migration, Gradle
- **Database**: PostgreSQL (Hosted on Aiven Cloud Free Tier)
- **Frontend**: Next.js 15 (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Deployment**:
  - Frontend: Vercel (Free tier)
  - Backend: Render / Koyeb (Free tier Docker)
  - Database: Aiven (Free PostgreSQL)

---

## 📁 Repository Architecture

```text
SpaService/
├── spa-backend/             # Spring Boot 3 REST API
│   ├── src/                 # Controllers, Services, Entities, Flyway Migrations
│   ├── build.gradle.kts     # Gradle dependencies & build configuration
│   └── Dockerfile           # Production container build
│
├── spa-frontend/            # Next.js 15 Web Application
│   ├── src/app/             # Booking portal & Admin management dashboard
│   ├── src/components/      # UI components & calendar widgets
│   └── package.json
│
└── README.md
```

---

## 🛠️ Local Development

### 1. Backend (`spa-backend`)
```bash
cd spa-backend
./gradlew bootRun
```
Backend runs on: `http://localhost:8081`  
Swagger API Docs: `http://localhost:8081/swagger-ui.html`

### 2. Frontend (`spa-frontend`)
```bash
cd spa-frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000` (or `http://localhost:3001`)

---

## 🌐 Free Deployment Guide

1. **Database**: Create a free PostgreSQL service on [Aiven.io](https://aiven.io). Obtain the JDBC connection URL.
2. **Backend**: Link this repository to [Render.com](https://render.com) or [Koyeb.com](https://koyeb.com), select Docker root directory `spa-backend`, and add `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`.
3. **Frontend**: Import this repo into [Vercel](https://vercel.com) with root directory `spa-frontend` and set `NEXT_PUBLIC_API_URL` to your backend URL.
