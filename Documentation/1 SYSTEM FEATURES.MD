# SYSTEM FEATURES (CRASH)

This document explains what CRASH can do, and why it matters.
It is written so non-technical readers can understand the value, while still being detailed enough to impress technical reviewers.

CRASH includes:
- **Backend (Django REST API)**: `Backend/`
- **Admin Web (React/Vite)**: `Frontend-Admin/`
- **Police Web (React/Vite)**: `Frontend-Police-JS/`
- **Citizen/Mobile concept**: not included as a UI in this repo, but supported by backend endpoints and database tables.

---

## 1) Security hierarchy (who is allowed to create accounts)

CRASH is designed so that *not anyone can just become Admin or Police*. The system enforces an “authorized onboarding” chain.

### Admin2 (highest level)
Admin2 (highest level) can register the Admin1 through Supabase and using `Backend/hashing.py` from the system project repository, so it means not anyone can just be admin, only authorized.

What this means in practice:
- `hashing.py` generates a **Django PBKDF2 password hash** using `make_password()`.
- Admin2 inserts the hashed password directly into the database (Supabase). There is no public “create super-admin” endpoint.

### Admin1 (manager/dispatcher level)
Admin1 can register and manage police so it means not anyone can just be police, only authorized.

Admin can hash password using `hashing.py` or the hashing page in admin website (`PasswordHashConverter.jsx`).

Technical note:
- The Admin Web hashing tool calls `POST /admin/password-hash/` and returns a Django-compatible hash.

---

## 2) Offline / 911 / SMS reporting (resilient even without internet)

Users with no internet can send SMS report through 911.
The thing is, if the mobile app detects it has no internet, the mobile app for users will go in offline mode where if they click the “SOS” it will ask to direct them to call 911 on their phone dialer or send a quick SMS on their phone messaging app to 911.

The SMS message contains user info including the coordinates, name, contact, emergency contact, datetime, userId for tracking in our database/system, and other user personal details (stored in our data model; see `Backend/core/models.py`).

### Offline report encoding (Admin Web)
Admin can also insert an active “Pending” report or a resolved report through admin website.
This is for offline feature of user mobile (stated above). Since 911 receives the offline report, users sent their necessary details to input in our system that can be use by admin.

The flow for our offline feature:
1) user send their details to 911
2) 911 receives the report with details
3) 911 sends the report details including the status to admin
4) then admin will insert the report to our system so even if its offline, it can still include in our analytics

Even offline reports counts!

But with three conditions:
1) user exists in system
2) police that responded also exist in our system
3) there’s necessary details like coordinates, time

How the system supports this:
- Admin Web provides a **Manual Report** page (`ManualReport.jsx`) that creates reports via `POST /admin/reports/manual/`.
- Admin Web can display/search existing users and police offices so it is to insert a report (example: `GET /admin/users/search/` + `GET /admin/police-offices/`).
- Reverse-geocoding auto-fills city/barangay from coordinates so offline entries are searchable and analytics-ready.

---

## 3) Online citizen reporting (GPS + evidence)

Users can send report with:
- gps location (lat/lng)
- description (optional)
- media (optional)
- category (emergency by default)

Backend support (for mobile/Postman testing):
- `POST /mobile/reports/` accepts multipart form-data.
- Media validation is enforced server-side:
  - max **3 images**
  - max **2 videos**
  - max **15MB** per file

Technical note (geospatial assignment):
- The backend can assign the **nearest police office** based on distance using the **Haversine formula** (great-circle distance on Earth), so reports can be routed consistently.

---

## 4) Admin Web features (visibility + control)

Admin can view all or specific [filters] existing police accounts and police checkpoints with their details in table and even in map.

### Police account management (table + filters)
- Admin1 can create, update, and delete police office accounts.
- Admin can view **All** or **Our** police accounts (scoped by which admin created the account).

### Map dashboard (map + right-click tools)
- Admin dashboard loads police offices and checkpoints (and can filter what is shown).
- Admin can just right click a spot in map to get the lat/lng and even address so it can copy paste quickly.

Technical note:
- Right-click reverse geocoding uses `GET /geocode/reverse/?lat=...&lng=...` and returns address components.

---

## 5) Police Web features (real-time response tools)

Police can receive the reports in almost real-time, the system uses polling.

Actual polling intervals (from `Frontend-Police-JS/src/constants/index.js`):
- Dashboard + global notifier: **5 seconds**
- Report chat: **3 seconds**
- Live map: **15 seconds**

### Report details + evidence
Police can view the report details including the media inputted by the reporter/citizen.

### Status workflow + remarks
Police can set the status of the report and send a remarks for resolutions later.

### Directions route + QR handoff
Police can view the directions route from the office to the reporter via a google map embedded with indicated ETA and distance (`DirectionsModal.jsx`).

Police website also generates a QR code containing the route directions of the report so dispatching police can also have the same directions route by just scanning it in their devices.

Technical note:
- The system provides a route link + QR code via `GET /reports/{report_id}/route/`.
- The UI can also compute/visualize routes using Google Maps rendering; if needed, distance can fall back to Haversine.

### Two-way messaging during ongoing incidents
Police and users can have conversation during active/on going reports — police and users can receive and send messages.

### Map + checkpoints + right-click geocoding
Police can add checkpoints with details including the location and schedule.
The police website can also show what checkpoint is active or not based on comparison of the current time and schedule of checkpoint (including overnight schedules).

Police can view all or specific checkpoints with their details in the map.

Police and admin can just right click a spot in map to get the lat/lng and even address so it can copy paste quickly.

---

## 6) Map-based insight (visual analytics)

Police can view active or resolved report cases in a map.
Reports have a specific color of pins to easily and visually identify what part/location has the most or what category tends to happen in the area.

This is a **map-based analytics** because:
- It gives fast situational awareness (“what’s happening where”) using color/category pins.
- It does not require reading charts; commanders can spot hotspots visually.

---

## 7) Analytics vs Resolved Cases (what’s the difference?)

This is the key difference:

### Analytics = summarized trends (numbers, rank, percentages)
Police can view analyzation of our reports with filters like based on their time, office, categories, cities, barangays.
Analysis highlights the numbers, rank, and percentage.
Rank can be top categories or top locations depending on the setted filters.

Police can export that filtered analysis to PDF.

Technical note:
- Analytics endpoints include:
  - `GET /analytics/summary/overview/`
  - `GET /analytics/hotspots/locations/`
  - `GET /analytics/hotspots/categories/`
  - `GET /analytics/export/` (PDF)

### Resolved Cases = the archive (the list of cases)
Police can also see all the resolved cases and export them.
Police can select filters like days, office, categories, cities, and baranggay to filter all resolved cases.

Resolved cases highlights the list of cases.

Police can export these to PDF just to show the list of resolved cases.

Technical note:
- Resolved cases endpoints include:
  - `GET /reports/resolved/` (list)
  - `GET /reports/resolved/export/` (PDF list)

---

## 8) Case-file exports (single report PDF with media)

Police can export a single report case to PDF that include report details even the image and QR code for video so they can just scan it.

Backend behavior (code-accurate):
- `GET /reports/{report_id}/export/` generates a PDF case file.
- Up to **3 images** are embedded into the PDF.
- Up to **2 videos** are represented as **QR codes** (because a video cannot be printed, but the QR can open the file URL).

---

## 9) Technical foundation (impressive but understandable)

Authentication:
- All protected endpoints use **Bearer Token (JWT)** via `Authorization: Bearer <access_token>`.
- Tokens contain role information (admin vs police) so the backend can enforce scope and permissions.

Geocoding:
- Reverse geocoding is implemented through Google Geocoding API and exposed through a simple endpoint for map right-click productivity.

PDF generation:
- PDFs are generated server-side using HTML templates and rendered to PDF (WeasyPrint).

Polling architecture:
- CRASH uses polling (`setInterval`) instead of WebSockets for stability and simplicity.
- Polling intervals are centralized so performance can be tuned without hunting through multiple files.

