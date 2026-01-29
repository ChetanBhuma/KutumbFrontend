# 🔄 Complete End-to-End Workflow: Citizen Registration to Safety Net

This document outlines the detailed lifecycle of a Senior Citizen within the Kutumb portal, detailing every step for the Citizen, System, Officer, and Admin.

---

## 📍 Phase 1: Registration (The Entry Point)
**Actor:** Senior Citizen (or Family Member)

1.  **Submission**:
    *   Citizen navigates to the registration portal.
    *   Fills in:
        *   **Personal Details** (Name, DOB).
        *   **Contact Info** (Mobile - verified via OTP).
        *   **Address** (Locality, Police Station, Pincode).
        *   **Medical & Emergency Details**.
    *   Submits the form.

2.  **System State**:
    *   **Database Record**: Created in `CitizenRegistration` table.
    *   **Status**: Sets to `PENDING_REVIEW` (🟡).
    *   **Profile Link**: Creates a placeholder `SeniorCitizen` profile (Status: 'Pending').

---

## 🤖 Phase 2: Intelligent Assignment (The System Core)
**Actor:** Backend System (Automated)

1.  **Beat Identification**:
    *   The system analyzes the submitted **Address** and **Police Station**.
    *   Maps this location to a specific **Police Beat ID**.

2.  **Workload Balancing Algorithm**:
    *   System queries all **Active Officers** assigned to that Beat.
    *   Calculates the current workload (Count of 'Scheduled' + 'In Progress' visits) for each officer.
    *   **Selection**: Automatically assigns the new request to the officer with the **lowest workload**.

3.  **Task Creation**:
    *   **Visit Entity**: Creates a `Visit` record in the database.
    *   **Type**: `Verification`
    *   **Status**: `Scheduled`
    *   **Assignee**: The selected Beat Officer.

---

## 👮 Phase 3: Physical Verification (The Field Work)
**Actor:** Beat Officer

1.  **Notification**:
    *   Officer receives a "New Task" alert on their Dashboard/App.
    *   The visit appears in their "Today's Schedule".

2.  **On-Site Execution**:
    *   **Start**: Officer arrives at the citizen's home and clicks **"Start Visit"**.
    *   **Geofence Check**: System validates the officer is within 30m of the registered address (if enabled).
    *   **Verification**: Officer checks ID proofs and living conditions.

3.  **Completion & Reporting**:
    *   Officer clicks **"Complete Visit"**.
    *   **Inputs**:
        *   **Photo**: Proof of visit/citizen.
        *   **Assessment**: Confirms/Updates health or living details.
        *   **Risk Score**: Assigns a vulnerability score (Low/Medium/High).
    *   **Submission**: Visit status changes to `COMPLETED`.
    **System Actions (Immediate)**:
    *   **Status Upgrade**: Registration & Citizen Profile status -> `APPROVED` (🟢 Verified).
    *   **Card Generation**:
        *   Generates unique **Digital Card Number** (e.g., `SCID-2025-X9Y2`).
        *   Sets `digitalCardIssued = true`.
    *   **Notification**: Sends SMS to Citizen: *"Registration Approved. Digital ID available."*


---

## 🏠 Phase 4: Citizen Access & Safety (Active Mode)
**Actor:** Senior Citizen (Authenticated)

1.  **Access**:
    *   Citizen logs in to `/citizen-portal/dashboard`.
    *   **Digital ID**: Visible on dashboard. Can be viewed, downloaded (PNG/PDF), or printed.

2.  **Active Features**:
    *   **🆘 SOS Button**:
        *   **Action**: One-click distress signal.
        *   **Result**: Instantly shares Live GPS & Battery status with Police Control Room & Officer. Alerts family members.
    *   **📅 Request Visit**:
        *   Citizen can schedule "Health Checks" or "Safety Visits".
        *   Request flows directly to the Beat Officer's schedule.
    *   **📝 Document Vault**: Upload and store medical history/prescriptions for emergency access.

3.  **Dynamic Updates**:
    *   If Citizen updates **Address** -> System triggers **New Verification Request** (Back to Phase 2).

---

## 📊 Workflow Summary Table

| Phase | Action | Status | Who Acts? |
| :--- | :--- | :--- | :--- |
| **1** | Submit Registration | `PENDING_REVIEW` | 👴 Citizen |
| **2** | Assign Verification Visit | `SCHEDULED` | 🤖 System (Auto) |
| **3** | Complete Verification Visit | `COMPLETED` | 👮 Beat Officer |
| **4** | Issue Digital ID | `CARD_ISSUED` | 🤖 System (Auto) |
| **5** | Use SOS / Request Visits | `ACTIVE` | 👴 Citizen |
