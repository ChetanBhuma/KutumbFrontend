# Gap Analysis: Role & Permission User Flow

## Overview
This document compares the **User Requested Workflow** against the **Current System Implementation** to identify gaps and necessary changes.

| Feature Scope | User Request | Current Implementation | Status |
| :--- | :--- | :--- | :--- |
| **1. Role Creation** | Admin defines permissions **AND** assigns "Jurisdiction Mapping" (e.g., Role X applies to 'District' level). | Admin can only define `code`, `name`, and functional `permissions`. Jurisdiction logic is **hardcoded** in frontend code (`create-user-dialog.tsx`). | 🔴 **Major Gap** |
| **2. Jurisdiction Level** | Admin selects applicable levels (Multi-select: Range, District, etc.) for a role. | Logic is hardcoded: `DCP` = District, `SHO` = Police Station, etc. No UI to configure this dynamically per role. | 🔴 **Major Gap** |
| **3. Jurisdiction Assignment** | **Multi-select** lists for assigning jurisdictions (e.g., select multiple Ranges or Stations). | **Single-select** Dropdowns. An officer can only be assigned to **ONE** Range, District, or Station. | 🔴 **Critical Gap** |
| **4. Conditional Logic** | Dynamic display based on Role Config from Step 1. | Dynamic display based on Hardcoded Switch Case in React Code. | 🔴 **Gap** |

---

## Detailed Findings

### 1. Role & Permission Setup (Step 1)
*   **Gap:** The current `Role` database model only supports a flat list of permissions `string[]`. It lacks a field to store `jurisdictionLevel` or `allowedJurisdictions`.
*   **Impact:** Adding a new role requires a developer to manually update the frontend code to define where it fits in the hierarchy (e.g., is it a Range-level role or a District-level role?).

### 2. Jurisdiction Mapping Logic (Step 2 & 3)
*   **Gap:** The functionality to "Choose which levels apply" during Role Creation does not exist.
*   **Gap:** The User Creation form uses `getRequiredLevel(roleCode)` which contains hardcoded rules (e.g., `if role == 'DCP' return 'DISTRICT'`).

### 3. User Creation / Data Model (Step 3)
*   **Gap (Multi-select vs Single-select):**
    *   **User Requirement:** "Display a multi-select containing all 7 Ranges... (Select all, clear all)".
    *   **Current System:** Uses `<Select>` component (Single value).
    *   **Database Constraint:** The `BeatOfficer` table uses foreign keys like `districtId`, `policeStationId`. This restricts an officer to exactly **one** administrative unit.
    *   **Required Change:** To support the user request, the database needs a Many-to-Many relationship (e.g., `OfficerDistricts` table) or array fields (`districtIds: string[]`), and the API/Frontend must be updated to handle arrays.

## Recommendations

To achieve the requested workflow, the following significant technical changes are required:

1.  **Database Migration (Backend):**
    *   Update `Role` model: Add `jurisdictionLevel` (enum/string) and `jurisdictionType` (Single vs Multi).
    *   Update `BeatOfficer` model: Support Many-to-Many relations for `ranges`, `districts`, `subDivisions`, `policeStations` (or use Array columns if using Postgres specific features, though relations are cleaner).

2.  **Role Master Page (Frontend):**
    *   Add "Jurisdiction Configuration" section to the Role Create/Edit modal.

3.  **User Creation Form (Frontend):**
    *   Remove hardcoded `getRequiredLevel` logic.
    *   Fetch role configuration to determine strictness.
    *   Replace `Select` dropdowns with `MultiSelect` components (e.g., Checkbox lists or Tags input).
    *   Update form state to handle arrays of IDs.

4.  **API Logic (Backend):**
    *   Update `createUser` controller to accept arrays of jurisdiction IDs.
    *   Validate that the selected jurisdictions match the Role's allowed level.
