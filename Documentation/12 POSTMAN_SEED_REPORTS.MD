# POSTMAN_SEED_REPORTS (Demo Database Populator — NO SCRIPTS)

This guide shows you how to populate the CRASH database with 96 demo reports (Resolved status) to showcase analytics, hashtags, and hotspots.

**Approach**: 
- We use a pre-generated JSON file (`12_POSTMAN_SEED_REPORTS_DATA.json`).
- You replace the placeholder IDs in that file with your own local database IDs.
- You run it via **Postman Collection Runner** (one-tap).

No backend changes required. No complex scripts required.

---

## 0) Prerequisites: Create Users & Offices

Since the database relations (Foreign Keys) depend on real IDs, you must first ensure you have these records in your local database.

1.  **3 Offices**:
    *   **Main Office** (Target for the "Hotspot" demo).
    *   **Secondary Office 1**.
    *   **Secondary Office 2**.
2.  **3 Citizens / Reporters** (Users who "reported" the incidents).
    *   Reporter 1
    *   Reporter 2
    *   Reporter 3
3.  **1 Admin Account** (To run the seed requests).

*Tip: You can create these via the Django Admin panel or the standard Registration API.*

---

## 1) Prepare Your Data File (Crucial Step)

The file `12_POSTMAN_SEED_REPORTS_DATA.json` acts as a template. It contains **Subject IDs** like `[OFFICE_MAIN_ID]` which you must replace with your actual UUIDs.

**Steps:**
1.  Open `Documentation/12_POSTMAN_SEED_REPORTS_DATA.json` in VS Code or a text editor.
2.  Perform **Find & Replace** (Ctrl+H) for each of the following placeholders:

| Placeholder | Description | Action |
| :--- | :--- | :--- |
| `[OFFICE_MAIN_ID]` | The UUID of your primary Police Office (center of the demo). | Replace with your `uuid` |
| `[OFFICE_SECONDARY_1_ID]` | Another office UUID (for variance). | Replace with your `uuid` |
| `[OFFICE_SECONDARY_2_ID]` | Another office UUID (for variance). | Replace with your `uuid` |
| `[REPORTER_1_ID]` | UUID of a citizen user. | Replace with your `uuid` |
| `[REPORTER_2_ID]` | UUID of a citizen user. | Replace with your `uuid` |
| `[REPORTER_3_ID]` | UUID of a citizen user. | Replace with your `uuid` |

3.  **Save the file**. Now it is ready to be imported into Postman.

---

## 2) Get Admin Token

You need an Admin JWT token to insert valid resolved reports manually.

### Endpoint
`POST http://localhost:8000/api/v1/auth/login/`

### Body (raw JSON)
```json
{
  "email": "YOUR_ADMIN_EMAIL_HERE",
  "password": "YOUR_ADMIN_PASSWORD_HERE"
}
```

### What you copy from the response
Copy the `access` token. You will use it in step 4.

---

## 3) Create the Postman Request

Create a single request in Postman.

*   **Name**: `Insert Manual Report (Runner)`
*   **Method**: `POST`
*   **URL**: `http://localhost:8000/api/v1/admin/reports/manual/`

### Headers
*   `Content-Type`: `application/json`
*   `Authorization`: `Bearer {{access_token}}`  *(Or paste your token directly if not using vars)*

### Body (raw JSON)
Copy this exact template. The `{{...}}` syntax tells Postman to pull values from the JSON data file.

```json
{
  "category": "{{category}}",
  "description": "{{description}}",
  "latitude": {{latitude}},
  "longitude": {{longitude}},
  "reporter": "{{reporter}}",
  "assigned_office": "{{assigned_office}}",
  "status": "{{status}}",
  "remarks": "{{remarks}}",
  "created_at": "{{created_at}}",
  "updated_at": "{{updated_at}}"
}
```

---

## 4) Run the "One-Tap" Seeder (Collection Runner)

1.  **Save** the request above into a Collection (e.g., named `CRASH Seeder`).
2.  Set your environment variable `access_token` to the token you got in Step 2 (or just hardcode it in the Header).
3.  Click on the **Collection Name** > **Run**.
4.  **Select Data File**: Choose your **edited** `12_POSTMAN_SEED_REPORTS_DATA.json`.
    *   *Postman should detect ~96 iterations.*
5.  Click **Run CRASH Seeder**.

Postman will now loop through every object in the JSON file and send a POST request for each one.

---

## 5) Notes / Troubleshooting

*   **400 Bad Request (Invalid UUID)**: You forgot to replace a placeholder like `[OFFICE_MAIN_ID]` in the JSON file. Check Step 1.
*   **401 Unauthorized**: Your token is expired or missing. Login again.
*   **403 Permission Denied**: You are using a non-admin token.
*   **No Hotspots?**: Ensure your Google Maps API Key is valid in the backend `.env`. The backend needs it to reverse-geocode the coordinates (lat/lng) into City/Barangay names for the analytics to work.
