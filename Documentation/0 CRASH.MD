# 0. CRASH (Crime Response & Alert System Hub)

## What is CRASH?
**CRASH (Crime Response & Alert System Hub)** is a digital crime reporting and response system that improves coordination between **citizens** and **law enforcement**.

It lets citizens submit incident reports (with location and optional media), and it gives police a centralized dashboard to **monitor reports, manage case status, and coordinate responses**.

---

## Why do we need CRASH?
Traditional reporting often relies on:

- emergency hotlines
- in-person reporting
- manual paperwork

These methods can cause delays and incomplete records, especially when situations are time-critical.

CRASH aims to reduce delays and confusion by providing:

- structured reporting (clear categories, fields, timestamps)
- real-time visibility for authorities
- case tracking for citizens
- analytics to guide resource planning

---

## How CRASH works (simple flow)
1. **Citizen submits a report** (category, description, location, optional photos/media).
2. **The report appears on the Police Dashboard** for review and action.
3. **Police updates the case status** as they respond (e.g., Pending → En Route → Resolved).
4. **Citizen can track the status** of their report.
5. **Administrators manage police accounts** to ensure only authorized personnel can access the dashboards.

---

## CRASH parts (what you’ll see in the system)
### Citizen Side
- A **mobile reporting experience** for submitting incidents.
- May support **offline-friendly reporting** (e.g., via SMS) depending on deployment and configuration.

### Police/Authority Side
- A **web dashboard** used by police to:
  - receive reports
  - view locations on a map
  - manage checkpoints (if enabled)
  - update statuses and remarks
  - communicate as needed (where supported)
  - review analytics and summaries

### Admin Side
- A separate **admin dashboard** used to manage police accounts and access control.

### Backend (System Core)
- The backend stores data, applies security rules, and provides APIs for the dashboards.

---

## Role-Based Access (who can do what)
CRASH uses role-based access to protect sensitive data and prevent unauthorized actions.

### Admin Level 2 (Senior IT)
- Highest level access
- Maintains system and repository-level assets
- Manages Admin Level 1 accounts directly (example: via Supabase SQL)
- May use supporting utilities such as `Backend/hashing.py`

### Admin Level 1 (Junior IT)
- Uses the **Admin Web Dashboard**
- Registers, edits, and removes police/authority accounts
- Focuses on operational account management and access control

### Police/Authority
- Uses the **Police Web Dashboard**
- Receives, reviews, and responds to reports
- Updates case statuses and remarks
- Uses map tools and analytics features to support real operations

### Citizen/User
- Submits incident reports
- Tracks progress/status updates
- Uses emergency/quick-trigger features (if enabled)

---

## Key Terminologies (plain explanations)
- **Report**: A submitted incident entry (what happened, where, when, category).
- **Case**: A report that is being processed and tracked over time.
- **Category**: The type of incident (used for quick triage).
- **Status**: The current progress stage of the report/case.
- **Remarks**: Notes added by authorities (e.g., actions taken, important updates).
- **Checkpoint**: A managed police checkpoint marker (time-based / location-based), if enabled in the system.
- **Analytics**: Summaries and trends (e.g., hotspot locations, category counts) to support planning.
- **Routing / Directions**: Navigation guidance to help responders reach incident locations faster.

---

## Report Categories (CRASH standard)
These categories help citizens choose the right report type and help authorities prioritize responses.

### 1) Violence
**Meaning:** Immediate physical danger or severe harm.
**Examples:** armed robbery, kidnapping, assault, sexual assault, shooting/stabbing, homicide.

### 2) Threat
**Meaning:** Menacing or intimidating behavior that may escalate.
**Examples:** stalking, severe threats, harassment, bullying, aggressive confrontation.

### 3) Theft
**Meaning:** Property taken without permission and without direct physical confrontation.
**Examples:** shoplifting, pickpocketing, vehicle theft, break-in where items were taken.

### 4) Vandalism
**Meaning:** Property damage or destruction.
**Examples:** graffiti, broken windows, tire slashing, malicious damage, arson (when treated as property damage).

### 5) Suspicious
**Meaning:** Concerning activity that isn’t clearly a confirmed crime yet.
**Examples:** suspicious loitering, unusual late-night activity, possible drug activity, abandoned objects.

### 6) Emergency
**Meaning:** Time-critical public safety incident (may be non-crime).
**Examples:** fire, serious accident, medical emergency, structural collapse, gas leak.

### 7) Others
**Meaning:** Anything important that doesn’t fit the categories above.
**Examples:** scams/fraud reports, noise complaints, animal issues, civil disputes, specialized concerns.

**Quick summary:**
- Violence – Immediate physical danger
- Threat – Menacing or non-physical threats
- Theft – Loss of property without confrontation
- Vandalism – Damage/destruction of property
- Suspicious – Unusual activity needing investigation
- Emergency – Non-crime, time-critical incidents
- Others – Anything not covered above

---

## Case Statuses (6 stages)
Statuses show where a report is in the response process.

1) **Pending** – Report received, awaiting review
2) **Acknowledged** – Police has reviewed the report
3) **En Route** – Authorities are on the way
4) **On Scene** – Police is at the incident location
5) **Resolved** – Case is completed
6) **Canceled** – Report is withdrawn or invalid

---

## What CRASH is trying to improve (in one sentence)
CRASH helps communities report incidents faster and helps authorities respond more effectively by combining **reporting, tracking, mapping, and analytics** in one system.
