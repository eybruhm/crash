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
    * Handles core system maintenance and has full repository access.
    * Manages Admin Level 1 accounts directly via Supabase.
    * Uses `hashing.py` to ensure nobody can become an administrator without direct authorization from the system owners.

* **Admin Level 1 (Junior IT / Dispatch Management)**
    * Responsible for registering and maintaining Police Office accounts via the Admin Web Dashboard.
    * Manages security control by adding, editing, or removing Police/Authority accounts.
    * Ensures that only legitimate law enforcement officers can access the system.

* **Police / Authority**
    * Uses the Police Web Dashboard to receive, track, and manage all incoming reports system-wide.
    * Can view analytics, manage checkpoints, and communicate with citizens.

* **Citizen / User**
    * Uses the mobile application to report incidents, track case status, and utilize the emergency quick-trigger feature.

---

## 3. ADVANCED AUTHENTICATION AND TOOLS

To maintain the integrity of credentials, CRASH supports specialized security paths:
* **Secure Hashing Page**: Admins can use the `PasswordHashConverter.jsx` page within the portal to generate secure, Django-compatible password strings.
* **Local Hashing Script**: `Backend/hashing.py` allows an Admin Level 2 to generate password hashes in a private terminal using Django’s `make_password()` function.
* **Geospatial Tools**: Both Admins and Police can right-click any spot on the map to instantly capture the latitude, longitude, and physical address for quick copy-pasting into reports.

---

## 4. CITIZEN REPORTING: ONLINE AND OFFLINE WORKFLOWS

CRASH is designed to be resilient, acknowledging that internet connectivity is often lost during a crisis.

### Online Reporting
* Citizens send reports with precise GPS coordinates, optional descriptions, and media evidence (images/videos).
* Reports are automatically routed to the nearest available police station using the Haversine distance formula.
* The system enforces upload limits (e.g., max 3 images, 2 videos, 15MB per file).

### Offline Reporting (911 / SMS Integration)
* **Detection**: If the mobile app detects no internet, it enters "Offline Mode."
* **SOS Trigger**: Users are prompted to call 911 or send a "Quick SMS" via their phone’s native messaging app.
* **SMS Content**: The automated message contains the user’s name, contact info, emergency contacts, timestamp, User ID, and exact GPS coordinates.

### Offline-to-System Flow (The Bridge)
* **Admin Role**: Since 911 receives the offline report, the Admin verifies the user’s identity in the system.
* **Manual Insertion**: The Admin encodes the 911/SMS details into the system via `ManualReport.jsx`.
* **Conditions for Entry**: For an offline report to count in analytics, the User and the responding Police must exist in the system, and valid coordinates/time must be provided.

---

## 5. POLICE OPERATIONAL FEATURES

The Police Web Portal is optimized for response time and incident management.

* **Real-Time Incident Queue**
    * Reports are received in near real-time via polling (every 5 seconds for reports, 3 seconds for chat).
    * Police view full incident details, including high-resolution media evidence uploaded by citizens.

* **Navigation and Dispatch**
    * **Google Maps Integration**: The system embeds Google Maps showing the optimal route from the station to the reporter, including ETA and distance.
    * **Routing QR Code**: The system generates a unique QR code for the route; responding officers scan this to open directions on their personal mobile devices.

* **Live Communication**
    * A per-report chat system allows Police and Citizens to exchange messages while an incident is "Active" or "On Scene".

* **Checkpoint Management**
    * Police manage checkpoints including locations, contact numbers, and staffing notes.
    * **Automatic Scheduling**: The system compares the current time with the checkpoint schedule to display "Active" vs. "Inactive" status automatically.

---

## 6. ANALYTICS VS. RESOLVED CASES

CRASH provides two distinct ways to view historical data to serve different operational needs.

### Map-Based Visual Analysis
* **Visual Clusters**: Police and Admins view active and resolved cases on a map.
* **Color-Coded Pins**: Pin colors identify categories (e.g., Violence vs. Theft), allowing users to visually identify which locations have the highest crime density.

### Statistical Analytics (Decision Support)
* **Focus**: High-level aggregated insights, trends, and percentages.
* **Rankings**: Highlights "Top Categories" and "Top Locations" based on filters like time, office, city, and barangay.
* **Export**: These filtered statistical dashboards can be exported to PDF for official reporting.

### Resolved Cases (The Archive)
* **Focus**: Individual record-keeping, auditing, and evidence lookup.
* **Case Files**: Highlights the list of every closed case, including timestamps, police remarks, and computed resolution times.
* **Single Export**: A single report can be exported to PDF, including the report details, images, and a QR code for video evidence.

---

## 7. STATUS LIFECYCLE

Every incident in CRASH follows a strictly monitored lifecycle:
* **Pending**: Report received and awaiting review.
* **Acknowledged**: Police have reviewed and accepted the incident.
* **En Route**: Officers are moving toward the reporter’s location.
* **On Scene**: Officers have arrived at the incident location.
* **Resolved**: The case is successfully closed.
* **Canceled**: The report was withdrawn or identified as a false alarm.