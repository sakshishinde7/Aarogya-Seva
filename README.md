# Aarogya Seva (आरोग्य सेवा)
> **Tagline:** Connected Healthcare. Healthier Communities.  
> **Challenge:** Seva First Innovation Challenge, Maharashtra  
> **License:** Demonstration Prototype (Fictional Data Only)

---

## 1. Executive Summary

**Aarogya Seva** is an integrated rural healthcare management demonstration platform designed to coordinate rural health records, immunization schedules, maternal and child healthcare, elderly care, disease tracking, follow-ups, and aggregate administrative reporting.

The platform provides a **single, unified patient identity** (`AS-PAT-XXXXX`) across all healthcare modules, eliminating redundant paperwork for Auxiliary Nurse Midwives (ANMs) and Accredited Social Health Activists (ASHAs), while providing health supervisors and administrators with real-time visibility into rural healthcare delivery.

> [!IMPORTANT]
> **Prototype & Clinical Disclaimer:**  
> Aarogya Seva is a software demonstration prototype built with fictional sample records. It is **not a certified clinical diagnostic tool** and does not provide automated diagnoses, clinical decision-making, or prescriptive medical recommendations.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19 with TypeScript (Strict Mode)
- **Build Tool:** Vite 8
- **Styling:** Tailwind CSS (Custom Healthcare Color Palette)
- **Routing:** React Router v7
- **Forms & Validation:** React Hook Form + Zod
- **Icons:** Lucide React
- **Data Visualizations:** Recharts (Dynamic BarCharts, Donut Charts)
- **API Communication:** Centralized Axios client with automatic 401 interception & HTTP-only cookie support
- **Testing:** Vitest + React Testing Library + Happy-DOM

### Backend
- **Language / Runtime:** Python 3.12+
- **API Framework:** FastAPI with Pydantic v2 validation
- **ORM & Database:** SQLAlchemy 2.x with Alembic migrations
- **Supported Databases:** SQLite (Local Dev) & Managed PostgreSQL (Production)
- **Password Hashing:** Argon2id (`passlib` + `argon2_cffi`)
- **Session Security:** Signed JWTs in secure HTTP-only cookies (`SameSite=Lax`, `Secure` in prod) + Bearer token support
- **Rate Limiting:** Built-in sliding-window rate limiting on sensitive authentication endpoints
- **Export Safety:** Formula injection sanitization (CWE-1236 protection) for CSV exports
- **Testing:** Pytest + FastAPI TestClient + SQLite in-memory isolation

---

## 3. Design System & Palette

Aarogya Seva implements a warm, accessible healthcare palette:

| Color Token | Hex Code | Usage |
|---|---|---|
| **Warm Ivory** | `#FAF8F4` | App background, clean contrast |
| **Pastel Sage** | `#A8C3A0` | Primary brand accent, nav active states |
| **Sage Dark** | `#6E9464` | Primary action buttons, headings |
| **Soft Mint** | `#DCEBE0` | Hero badges, card highlight |
| **Mint Light** | `#EBF4EE` | Table hover, chip backgrounds |
| **Pale Lavender**| `#E8E1F4` | Elderly care, informational tags |
| **Blush Pink** | `#F5E2E1` | Maternal healthcare, warning alerts |
| **Soft Blue** | `#DFEAF5` | Vaccination records, neutral badges |
| **Primary Text**| `#26352F` | High-contrast readable typography |
| **Secondary Text**|`#718078` | Subheadings, metadata labels |
| **Subtle Border**|`#E2E8E4` | Crisp cards and divider borders |

---

## 4. Role-Based Access Control (RBAC)

The system enforces permissions at the API route and database layer:

1. **Administrator (`administrator`):** Full access to user management, staff registry, patient records, reference catalogues, audit logs, and system reports.
2. **Healthcare Worker (`worker`):** Patient registration, recording vaccinations, logging healthcare visits, updating disease follow-ups, and managing village tasks.
3. **Supervisor / Viewer (`supervisor`):** Read-only visibility into patient profiles, vaccination schedules, disease epidemiology, and aggregate reporting across facilities. Cannot alter clinical records.

---

## 5. Development Seed & Demo Accounts

The database includes a deterministic development seeder creating realistic rural healthcare scenarios across Maharashtra (Satara, Wai, Karad, Mahabaleshwar).

### Demo Credentials (Fictional Staff)

| Role | Email | Password | Assigned Facility |
|---|---|---|---|
| **Administrator** | `admin@aarogyaseva.org` | `Admin@Aarogya2026` | District Health Office, Satara |
| **Healthcare Worker** | `worker@aarogyaseva.org` | `Worker@Aarogya2026` | Primary Health Centre, Wai |
| **Supervisor** | `supervisor@aarogyaseva.org` | `Supervisor@Aarogya2026` | Sub-District Supervisory Unit, Karad |

*(Note: The login page includes one-click demo credentials fill buttons for rapid testing.)*

---

## 6. Local Quickstart Guide

### Prerequisites
- Node.js 20+ and npm
- Python 3.12+

### Step 1: Backend Setup
```bash
# Navigate to backend
cd aarogya-seva/backend

# Create and activate virtual environment
python -m venv venv
# On Windows PowerShell:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Seed development data (users, catalogue, 25 fictional patients, records, follow-ups)
python -m app.cli seed --reset

# Start the FastAPI server
uvicorn app.main:app --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

### Step 2: Frontend Setup
```bash
# Navigate to frontend (in another terminal)
cd aarogya-seva/frontend

# Install dependencies
npm install --legacy-peer-deps

# Start Vite dev server
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 7. Verification & Testing

Both frontend and backend include automated test suites:

### Backend Tests (Pytest)
```bash
cd aarogya-seva/backend
.\venv\Scripts\python.exe -m pytest -v
```
**Coverage:** 17 integration tests covering authentication, RBAC permission barriers, patient CRUD, duplicate detection, vaccination scheduling, disease reporting, follow-up resolution, dashboard metrics aggregation, and CSV export.

### Frontend Tests (Vitest)
```bash
cd aarogya-seva/frontend
npm test
```
**Coverage:** 9 component tests covering Landing page elements, disclaimer compliance, public pages, auth context, and login form interactions.

### Production Build Verification
```bash
cd aarogya-seva/frontend
npm run build
```

---

## 8. Deployment Guide

### A. Deploy Backend & Database on Render

1. **Create Managed PostgreSQL Database:**
   - Log into [Render Dashboard](https://dashboard.render.com).
   - Click **New +** → **PostgreSQL**.
   - Name: `aarogya-seva-db`
   - Region: `Singapore` (or nearest)
   - Copy the **Internal Database URL** (e.g., `postgresql://aarogya_user:pass@dpg-xxx:5432/aarogya_seva`).

2. **Deploy Backend Web Service:**
   - Click **New +** → **Web Service** → Connect your repository.
   - Root Directory: `backend`
   - Environment: `Python 3`
   - Build Command: `pip install -r requirements.txt && alembic upgrade head`
   - Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - Add Environment Variables:
     - `ENVIRONMENT`: `production`
     - `DATABASE_URL`: *(Your PostgreSQL URL)*
     - `SECRET_KEY`: *(Generate a 32+ character random secret)*
     - `COOKIE_SECURE`: `true`
     - `COOKIE_NAME`: `aarogya_session`
     - `CORS_ORIGINS`: `https://aarogya-seva.vercel.app`
   - Seed the production database with initial reference catalogues and admin account via the Render Shell tab:
     ```bash
     python -m app.cli create-admin --email admin@aarogyaseva.org --password <YourSecurePassword> --name "System Administrator"
     ```

### B. Deploy Frontend on Vercel

1. Log into [Vercel](https://vercel.com).
2. Click **Add New...** → **Project** → Import your repository.
3. Configure the Project:
   - Root Directory: `frontend`
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. Environment Variables:
   - `VITE_API_BASE_URL`: `https://aarogya-seva-backend.onrender.com` (your deployed Render service URL)
5. Deploy. Vercel automatically respects `vercel.json` for SPA routing and API proxy rewrites.

---

## 9. Security & Governance Implementation

- **Password Storage:** Argon2id via `passlib`, immune to GPU-based cracking.
- **Session Tokens:** JWTs issued with expiration timestamps, transmitted via HTTP-only cookies with `SameSite=Lax` and production `Secure=True`.
- **CWE-1236 Defense:** CSV export sanitizes cells starting with `=`, `+`, `-`, `@`, `\t`, or `\r` to protect spreadsheet software against formula injection attacks.
- **Audit Logging:** Every sensitive event (logins, patient registrations, record updates, deactivations) records an immutable log with timestamp, user ID, IP address, and change details.
- **Data Minimization:** No national identity numbers (Aadhaar) or unnecessary PII are required or stored.

