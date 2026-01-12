# SYSTEM FEATURES (CRASH)

This document provides a comprehensive, code-aligned description of the capabilities and workflows supported by **CRASH** (Crime Response & Alert System Hub). It is structured to be accessible to both technical stakeholders and non-technical administrators.

---

## 1. PROJECT ARCHITECTURE

CRASH is a multi-platform ecosystem designed for high-stakes public safety. It consists of:
* **Backend (Django REST Framework)**: The central brain managing the database, security, and API endpoints.
* **Admin Web Portal (React/Vite)**: The management interface for high-level oversight and account provisioning.
* **Police Web Portal (React/Vite)**: The operational command center for responders and station leads.
* **Citizen API / Mobile Support**: A specialized set of endpoints built to handle mobile GPS data and media evidence.

---

## 2. SECURITY AND AUTHORIZATION (ROLE-BASED ACCESS)

CRASH uses a strictly hierarchical "Chain of Trust" to ensure that only authorized personnel can access sensitive crime data.

* **Admin Level 2 (Highest Level / Senior IT)**
    * Handles core system maintenance and has full access to repository codes.
    * Manages Admin Level 1 accounts directly via Supabase and the repository’s `hashing.py` script.
    * This ensures that nobody can become an administrator without direct authorization from the system owners.

* **Admin Level 1 (Junior IT / Dispatch Management)**
    * Responsible for registering, editing, and removing Police/Authority accounts for security control.
    * Uses the Admin Web Portal to control which stations are active in the system.
    * Ensures that only legitimate law enforcement officers can access the Police Web Portal.

* **Police / Authority**
    * Uses the Police Web Portal to receive, track, manage, and respond to all incoming incidents.
    * Can view analytics, manage checkpoints, and communicate with citizens.

* **Citizen / User**
    * Uses the mobile application or API to report incidents and track their safety status.

---

## 3. ADVANCED AUTHENTICATION AND TOOLS

To maintain the integrity of credentials, CRASH supports specialized password hashing paths:

* **Django PBKDF2 Password Hashing**: The system utilizes Django’s `make_password()` function, which defaults to the **PBKDF2 algorithm with a SHA256 hash**.
* **Secure Hashing Page**: Admins can use the `PasswordHashConverter.jsx` page within the portal to generate these secure hashed strings.
* **Local Hashing Script**: For even higher security, `Backend/hashing.py` allows an Admin Level 2 to generate hashes in a private terminal, preventing plaintext passwords from ever touching the database.
* **Geospatial Tools**: Both Admins and Police can right-click any spot on the map to instantly capture the latitude, longitude, and physical address for quick copy-pasting into reports or office logs.

---

## 4. CITIZEN REPORTING: ONLINE AND OFFLINE WORKFLOWS

CRASH is designed to be resilient, acknowledging that internet connectivity is often lost during a crisis.

* **Online Reporting**
    * Citizens send reports with precise GPS coordinates, optional descriptions, and media evidence.
    * **Media Validation**: The backend enforces strict upload limits: maximum **3 images**, maximum **2 videos**, and a **15MB limit** per file.
    * Reports are automatically routed to the nearest available police station using the **Haversine distance formula**.

* **Offline Reporting (911 / SMS Integration)**
    * If the mobile app detects no internet, it enters **Offline Mode**.
    * The user is prompted to call 911 or send a "Quick SOS" via SMS.
    * The automated SMS contains the user’s name, contact info, emergency contacts, timestamp, User ID, and exact GPS coordinates (`lat/lng`).

* **Offline-to-System Flow (The Bridge)**
    * When 911/Dispatch receives an offline report, the Admin verifies the user’s identity in the system.
    * The Admin then manually inserts the report via the **Manual Report** page (`ManualReport.jsx`).
    * This ensures that even offline incidents are tracked and included in analytics.
    * **Conditions for entry**: The User and responding Police must exist in the system, and valid coordinates/timestamps must be provided.

---

## 5. POLICE OPERATIONAL FEATURES

The Police Web Portal is optimized for response time and incident management.

* **Real-Time Incident Queue**
    * Reports are received in near real-time via high-frequency polling.
    * Dashboard updates every **5 seconds**, while the live map refreshes every **15 seconds**.
    * Police can view full incident details, including media evidence uploaded by the reporter.

* **Navigation and Dispatch**
    * **Google Maps Integration**: The system embeds Google Maps showing the optimal route from the station to the reporter, including **Estimated Time of Arrival (ETA)** and **distance**.
    * **Routing QR Code**: The system generates a unique QR code for the route. A responding officer can scan this to open directions on their personal device for hands-free navigation.

* **Live Communication**
    * A per-report chat system allows the Police and the Citizen to exchange messages.
    * Message polling occurs every **3 seconds** to ensure rapid communication.

* **Checkpoint Management**
    * Police can create and manage checkpoints, including locations, contact numbers, and specific schedules.
    * The system automatically identifies **"Active" vs. "Inactive"** checkpoints by comparing current time to the scheduled window.

---

## 6. ANALYTICS VS. RESOLVED CASES

CRASH provides two distinct ways to view historical data to serve different administrative needs.

* **Map-Based Visual Analytics**
    * Police and Admins can view active and resolved cases on a map.
    * Pins are **color-coded by category** (e.g., Violence, Theft) to visually identify crime clusters and hotspots.

* **Statistical Analytics (Decision Support)**
    * **Metric Distinction**: Focuses on aggregated **numbers, ranks, and percentages**.
    * **Rankings**: Highlights top categories or top locations (City/Barangay) based on user filters.
    * Includes filters for specific dates, police offices, or crime categories.
    * Supported by `tbl_summary_analytics` for high-speed dashboard reporting.

* **Resolved Cases (The Archive)**
    * **Focus:** Individual record-keeping, auditing, and evidence lookup.
    * **Case Files:** Highlights the list of every closed case, including timestamps, police remarks, and computed resolution times.
    * **Single Export:** A single report can be exported to PDF, including the report details, images, and a QR code for video evidence.


---

## 7. EXPORTS AND DOCUMENTATION

To support official record-keeping, CRASH allows the export of various data into professional PDF formats.

* **Analytics Export**: Police can export filtered statistical dashboards to PDF to show numerical trends and rankings.
* **Single Case File PDF**: Generates a document for a single incident, including timestamps, remarks, maps, images, and a **QR code for video evidence**.
* **Resolved Case List PDF**: Generates a summary of all closed cases within a specific timeframe or jurisdiction for station-wide auditing.
