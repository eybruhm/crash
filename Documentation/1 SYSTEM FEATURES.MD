# SYSTEM FEATURES (CRASH)

This document is a detailed, code-aligned description of what CRASH currently supports.

CRASH is composed of:
- **Backend (Django REST)**: `Backend/`
- **Admin Web (React/Vite)**: `Frontend-Admin/`
- **Police Web (React/Vite)**: `Frontend-Police-JS/`

Scope note:
- The backend includes a **Mobile/Citizen create-report API** for Postman/end-to-end testing (`POST /mobile/reports/`). A full mobile app UI is outside this repository.

---

## 1) Users, roles, and “who can do what”

CRASH recognizes three real-world actor types:

### Admin (IT / dispatch / management)
- Uses **Admin Web** for:
  - Registering and maintaining police station accounts
  - Visual oversight (map of offices and checkpoints)
  - Encoding **offline / 911 / SMS** reports into the system (manual insertion tool)
  - Generating password hashes for controlled account provisioning (Admin-to-Admin workflow)

### Police Office (a station account)
- Uses **Police Web** for:
  - Viewing reports (typically scoped to their station)
  - Updating report status and adding remarks
  - Viewing and managing checkpoints
  - Viewing analytics and exporting reports (PDF)
  - Viewing resolved cases archive and exporting case files (PDF)

### Citizen / User
- Exists in the database as `tbl_users`.
- Can create reports through the backend’s **mobile endpoint** (currently for testing and future mobile integration).

---

## 2) Core data model (what the system stores)

These tables define what CRASH can do:

### Reports (`tbl_reports`)
- Key fields:
  - `category`, `description`
  - `latitude`, `longitude`
  - `location_city`, `location_barangay` (reverse-geocoded “labels” stored for filtering/analytics)
  - `reporter` (optional link to a user)
  - `assigned_office` (police office that owns the incident)
  - `status`, `remarks`
  - `created_at`, `updated_at`

### Status lifecycle
CRASH uses a defined report lifecycle:
- `Pending` → initial state (waiting to be handled)
- `Acknowledged` → police has seen and accepted it
- `En Route` → responders are moving
- `On Scene` → responders arrived
- `Resolved` → case closed
- `Canceled` → false alarm / canceled

### Messages (`tbl_messages`)
- Messages are stored per report and include:
  - `sender_id`, `sender_type`, `receiver_id`
  - `message_content`, `timestamp`

### Checkpoints (`tbl_checkpoints`)
- Checkpoints include:
  - `office` (owner station)
  - `checkpoint_name`, `contact_number`
  - `time_start`, `time_end` (schedule window)
  - `latitude`, `longitude`, `location` (human-readable address line)
  - `assigned_officers` (free-text list)

### Media (`tbl_media`)
- Stores uploaded evidence metadata:
  - `file_url` (stored in Supabase Storage)
  - `file_type` (`image`/`video`)
  - `report` link
  - `sender_id`

### Analytics cache (`tbl_summary_analytics`)
- Stores precomputed counts by `(city, barangay, category)` for fast dashboard reporting.

---

## 3) Reporting workflows

CRASH supports two report creation paths.

### A) Mobile / citizen submission (backend-supported)
Endpoint: `POST /mobile/reports/` (multipart)
- Required inputs:
  - `reporter` (must exist in `tbl_users`)
  - `category`, `latitude`, `longitude`
  - Optional `description`
  - Optional `uploaded_files` (image/video)

System behavior:
- Validates upload limits server-side (hardcoded in backend):
  - max **3 images**, max **2 videos**, max **15MB** per file
- Automatically reverse-geocodes coordinates into `location_city` + `location_barangay`.
- Automatically assigns the nearest police office (Haversine distance) as `assigned_office` (fallback: first office in DB).

Why this exists:
- The system can ingest real-world “citizen GPS + media” evidence with consistent rules and deterministic office assignment.

### B) Offline / 911 / SMS encoding (Admin Web manual insert)
Admin Web page: **Manual Report** (`Frontend-Admin/src/pages/ManualReport.jsx`)

Used when:
- A report arrives via phone call / radio / SMS / offline logs and must be encoded into CRASH for tracking and analytics.

Key rules (enforced in backend):
- Endpoint: `POST /admin/reports/manual/`
- `assigned_office` is **required** (dispatch decides ownership)
- `status` allowed: `Pending` or `Resolved` (so already-resolved 911 entries can still appear in reporting)
- `location_city`/`location_barangay` are auto-filled by reverse geocode.
- `created_at`/`updated_at` can be provided for timeline accuracy.

Why this exists:
- Ensures offline incidents are not “lost” and can be audited/exported like digitally-submitted reports.

---

## 4) Police Web features (what police users can do)

Police Web is built in `Frontend-Police-JS/`.

### Authentication and session
- Login flow uses JWT access/refresh tokens.
- Requests attach `Authorization: Bearer <token>`.
- The frontend uses an API client layer with interceptors to centralize auth and error handling.

### Active reports (queue + details)
Core capabilities:
- List reports and open details per report.
- Update status and remarks via backend patch endpoint.
- View a report’s location, category, reporter metadata (when present), and evidence.

### Report route + QR
Endpoint: `GET /reports/{report_id}/route/`
- Generates a Google Maps directions URL and a QR code for fast navigation/sharing.

### Per-report chat
Endpoints:
- `GET /reports/{report_id}/messages/`
- `POST /reports/{report_id}/messages/`

Purpose:
- Keeps communication contextual (messages are attached to a specific incident).

### Checkpoints (operations and visibility)
Endpoints:
- CRUD: `/checkpoints/`
- Active-only list: `/checkpoints/active/`

Purpose:
- Display active checkpoints on maps and allow offices to maintain their patrol/checkpoint schedule and staffing notes.

---

## 5) Admin Web features (what admins can do)

Admin Web is built in `Frontend-Admin/`.

### Admin dashboard map (offices + checkpoints + reports)
Page: `Frontend-Admin/src/pages/Dashboard.jsx`

Capabilities:
- Loads map data from `GET /admin/map/data/` (combined payload for map rendering).
- Filters “All” vs “Our” data:
  - “Our” is based on which police offices were created by the current admin account.
- Toggle visibility of office markers vs checkpoint markers.

Right-click reverse geocoding:
- When an admin right-clicks any location on the map, Admin Web calls:
  - `GET /geocode/reverse/?lat=...&lng=...`
- The backend returns a readable `address_line`, `barangay`, `city`, and `full_address`.

Why this exists:
- Gives admins a fast “what’s where” operational view and a practical tool for identifying coordinates during encoding/audits.

### Police account management (CRUD for station accounts)
Page: `Frontend-Admin/src/pages/PoliceAccountManagement.jsx`

Endpoints:
- `GET /admin/police-offices/?scope=all|our`
- `POST /admin/police-offices/`
- `PATCH /admin/police-offices/{office_id}/`
- `DELETE /admin/police-offices/{office_id}/`

What it enables:
- Admin can create new police offices (with email/password credentials).
- Backend hashes credentials (police password stored as `password_hash`).
- Office coordinates are reverse-geocoded and cached for UI display and filtering.

### Manual report insertion (911/offline)
Page: `Frontend-Admin/src/pages/ManualReport.jsx`
- Includes helper tabs to search/select:
  - a reporter user (`GET /admin/users/search/`)
  - a police office (from police office list)

### Password hashing tools (Admin1 → Admin2 workflow)
CRASH supports two “safe hashing” paths for controlled account provisioning:

1) Admin Web tool
- Page: `Frontend-Admin/src/pages/PasswordHashConverter.jsx`
- Endpoint: `POST /admin/password-hash/`
- Output: a Django-compatible hashed password string

2) Backend script tool (terminal)
- Script: `Backend/hashing.py`
- Uses Django’s `make_password()` to produce a valid hash for direct DB insertion.

Why this exists:
- Lets one admin generate hashes while another admin inserts accounts into Supabase/DB without ever storing plaintext passwords in the database.

---

## 6) Analytics vs Resolved Cases (important distinction)

CRASH separates “Analytics” from “Resolved Cases” because they answer different questions.

### Analytics = aggregated insights (dashboards)
Backend endpoints:
- `GET /analytics/summary/overview/`
- `GET /analytics/hotspots/locations/`
- `GET /analytics/hotspots/categories/`
- `GET /analytics/export/` (PDF)

What analytics is for:
- Trend insight and decision support (counts, hotspots, category distribution, average resolution time).
- Typically driven by **resolved** data, filtered by days/location/category and by scope.

Performance support:
- Backend includes an analytics cache table `tbl_summary_analytics` and a rebuild endpoint:
  - `POST /analytics/update/`
- This is intended to precompute aggregates so dashboards don’t rely on heavy queries.

### Resolved Cases = an archive of individual case records
Backend endpoints:
- `GET /reports/resolved/` (JSON list)
- `GET /reports/resolved/export/` (PDF list)
- `GET /reports/{report_id}/export/` (single case file PDF)

What resolved cases is for:
- Audits, review, evidence lookup, and “case file” exports.
- Shows each resolved report with timestamps, location, remarks, and computed resolution time.

---

## 7) Exports (PDF)

CRASH supports PDF exports for official documentation:
- Analytics report PDF
- Resolved cases list PDF
- Single resolved case file PDF

Implementation details (backend):
- PDF HTML templates live under: `Backend/core/pdf-templates/`
- Backend renders HTML and converts to PDF (WeasyPrint).
- Responses use `Content-Disposition: inline` so the browser can open the PDF in a new tab.

---

## 8) Near-real-time behavior (polling)

CRASH achieves “live-ish” updates using polling (not WebSockets).

Police Web polling (see `Documentation/11 POLLING_INTERVALS.MD`):
- Dashboard + global report notifier: every **5 seconds**
- Report chat: every **3 seconds**
- Live map refresh: every **15 seconds**

Admin Web polling:
- Admin dashboard map refresh: every **30 seconds** (`Frontend-Admin/src/pages/Dashboard.jsx`)

Why polling exists:
- Keeps UI simple while still delivering timely operational updates.

---

## 9) Security and scoping (data visibility)

Authentication:
- Backend issues JWT tokens with custom claims (`user_id`, `role`).

Scoping rules (high level):
- Police users are generally restricted to data belonging to their `assigned_office`.
- Admin users may view broader system data and manage police office accounts.

Why this exists:
- Prevents accidental data leakage while keeping police screens relevant to their jurisdiction.

---

## 10) Time and timezone correctness

CRASH stores and returns timestamps using ISO-like formats.

Manual insert note:
- Admin Web uses `datetime-local` inputs (no timezone). For Manila-based operations, Admin Web encodes timestamps explicitly as `+08:00` to avoid accidental “timezone shifting” when encoding offline/911 events.

