# Microsoft Graph API - OneNote Endpoint Testing Findings

**Date:** 2026-03-15
**Tenant:** EDUVIC - Department of Education, Victoria, Australia
**User:** Sonny TAYLOR (sktay6@schools.vic.edu.au)
**User ID:** 9e4577a9-82a1-4d69-94fd-25812f316204
**Token Scopes:** Delegated (user) permissions via device code flow

---

## Phase 1: Personal Notebooks

### Test 1: GET /me/onenote/notebooks
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks`
- **Status:** 200 OK
- **Result:** 4 notebooks returned
- **Key Fields per notebook:**
  - `id` (e.g., `1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d`)
  - `displayName`, `createdDateTime`, `lastModifiedDateTime`
  - `isDefault` (all false), `userRole` (all "Owner"), `isShared` (all false)
  - `sectionsUrl`, `sectionGroupsUrl` (convenience URLs)
  - `createdBy.user.displayName`, `lastModifiedBy.user.displayName`
  - `links.oneNoteClientUrl.href`, `links.oneNoteWebUrl.href`
- **Notebooks found:**

| displayName | id | lastModified | Notes |
|---|---|---|---|
| big chungus | 1-9692d754-5d71-4d5f-b3e8-f63cc4eb25d0 | 2025-12-02 | Class Notebook structure (has _Collab, _Content, _Teacher, student groups). Stored in `Class Notebooks/` on OneDrive |
| something | 1-4591fe6f-9a52-419b-a12d-da338b610d68 | 2023-05-30 | Empty personal notebook |
| Sonny @ Department of Education | 1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d | 2025-11-07 | Default personal notebook |
| Sonny @ VIC - Department of Education and Training | 1-eea9e7c1-eac5-46a8-a733-a0bf7978f6f9 | 2022-06-06 | Legacy notebook from old tenant name |

- **Observations:**
  - `isShared` is false for all, even "big chungus" which is clearly a class notebook shared with others
  - `userRole` is "Owner" for all, including the class-notebook-structured one
  - Links use SharePoint OneDrive personal site: `eduvic-my.sharepoint.com/personal/sktay6_schools_vic_edu_au/Documents/`
  - The "big chungus" notebook is in `Class Notebooks/` subdirectory, indicating it was created via the Class Notebook tool

### Test 2: GET /me/onenote/notebooks/{id}/sections
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks/1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d/sections`
- **Status:** 200 OK
- **Result:** 2 sections returned
- **Key Fields per section:**
  - `id` (e.g., `1-ca16587b-e7bb-44ba-90e9-48c592cb5e3c`)
  - `displayName`, `createdDateTime`, `lastModifiedDateTime`
  - `isDefault` (boolean)
  - `pagesUrl` (convenience URL to get pages)
  - `links.oneNoteClientUrl.href` (onenote: protocol link to .one file)
  - `links.oneNoteWebUrl.href` (web URL with wd=target query param)
  - `parentNotebook` (always included inline)
  - `parentSectionGroup` (null for top-level sections)
  - `createdBy`, `lastModifiedBy`
- **Sections found:**
  - "New Section 1" (id: `1-ca16587b-e7bb-44ba-90e9-48c592cb5e3c`)
  - "Quick Notes" (id: `1-45278692-923d-4096-90a0-11d99d79695a`)
- **Observation:** Both sections had 0 pages (empty)

### Test 3: GET /me/onenote/notebooks/{id}/sectionGroups
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks/1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d/sectionGroups`
- **Status:** 200 OK
- **Result:** Empty array (no section groups in this personal notebook)

### Test 3b: Section Groups in "big chungus" (personal class notebook)
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks/1-9692d754-5d71-4d5f-b3e8-f63cc4eb25d0/sectionGroups`
- **Status:** 200 OK
- **Result:** 13 section groups returned
- **Structure discovered - Class Notebook anatomy:**
  - `_Collaboration Space` (id: `1-fe8a34cd-2c19-4409-8e4c-c23864fd7def`)
  - `_Content Library` (id: `1-ade3d9f3-2fa8-4139-bbe9-9b3c4d31f62e`)
  - `_Teacher Only` (id: `1-730ec532-3afa-4c63-a24b-626c294cb72d`)
  - Student section groups (named by student): Alexander COLLINS, Bailey WHITE, Darius NABB, Isaak DANIELS -STANTON, Jacob MCMAHON, Lee MOORE, Leroy KING, Ronan SQUIRES, Sebastian BIRCSAK, Taj PITTARD-KOOYMAN
- **Key observation:** The user (Sonny) is the **owner** of this class notebook, meaning student section groups are visible. This is because "big chungus" is stored in Sonny's personal OneDrive under `Class Notebooks/`.
- **Observation:** createdBy for student section groups shows `"SharePoint App"` with the same user ID as Sonny, suggesting OneNote Class Notebook provisioning runs as the SharePoint App context

### Test 4: GET /me/onenote/sections/{id}/pages
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/sections/1-ca16587b-e7bb-44ba-90e9-48c592cb5e3c/pages`
- **Status:** 200 OK
- **Result:** Empty array (no pages in personal notebook sections)

### Test 5: Page Content (tested in Phase 2 with class notebook pages - see below)

---

## Phase 2: Groups/Class Notebooks

### Test 6: GET /me/memberOf
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/memberOf`
- **Status:** 200 OK
- **Result:** Large response with many groups (security groups, distribution groups, Teams)
- **Key fields per group:**
  - `@odata.type` (all `#microsoft.graph.group`)
  - `id`, `displayName`, `description`
  - `creationOptions` array - KEY FIELD for identifying class Teams
  - `resourceProvisioningOptions` array - contains "Team" for Teams-enabled groups
  - `mail`, `mailNickname`
  - `groupTypes` array
  - `onPremisesSyncEnabled` (many are synced from AD)
- **Team identification logic:**
  - Class Teams have `"classAssignments"` in `creationOptions` AND `"Team"` in `resourceProvisioningOptions`
  - Regular Teams have `"Team"` in `resourceProvisioningOptions` but NO `"classAssignments"` in `creationOptions`
- **Total Teams found:** 60
- **2026 Class Teams (with classAssignments):**

| displayName | id |
|---|---|
| BBB 12C English 2026 | 37777051-77f9-4ded-a2c7-dfbf1140c778 |
| BBB 12D General Maths 2026 | 7eb70cc1-180e-4c21-a962-5de92b9477bb |
| BBB 12A Psychology 2026 | 011666a3-eb36-4361-a511-ee0641d75cd4 |
| BBB 12A Food Studies 2026 | 422f626a-1a23-4a5d-9349-27ebf1b6e6d0 |
| BBB Systems Engineering 12 and 34 2026 | 9879db31-2d7a-488d-8fd1-b823fb676de2 |
| BBB 12 BEYOND.6 2026 | 9b659a26-50c9-4591-abcb-ec772ff3e57a |

- **Non-class Teams (2026):**
  - EDUVIC-BBB Year 12 Students 2026 (id: `c1dc0c4d-a1b3-4bdc-9b12-ac71ac3d6582`) - has "Team" but no "classAssignments"

- **Observation:** The `creationOptions` array for 2026 classes has a different pattern: `["ExchangeProvisioningFlags:3532", "Team", "classAssignments", "ExchangeProvisioningFlags:2509"]` with TWO ExchangeProvisioningFlags entries. Older classes only have one.

### Test 7: GET /groups/{id}/onenote/notebooks
- **Endpoint (English):** `GET https://graph.microsoft.com/v1.0/groups/37777051-77f9-4ded-a2c7-dfbf1140c778/onenote/notebooks`
- **Status:** 200 OK
- **Result:** 1 notebook: "BBB 12C English 2026 Notebook" (id: `1-d3e91d42-18bc-4daa-884d-1b53fe933333`)
  - Created by: Nicole Lee 3 (teacher)
  - `userRole`: "Owner" (interesting - student gets Owner role on class notebooks accessed via groups endpoint!)
  - Links: `eduvic.sharepoint.com/sites/BBB12CEnglish2026/SiteAssets/`

- **Endpoint (Maths):** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/notebooks`
- **Status:** 200 OK
- **Result:** 1 notebook: "BBB 12D General Maths 2026 Notebook" (id: `1-52e65c54-f0e4-4e91-8acc-0894fa8ee5b7`)
  - Created by: Campbell Barnard-Green (teacher)
  - `userRole`: "Owner"
  - Links: `eduvic.sharepoint.com/sites/BBB12DGeneralMaths2026/SiteAssets/`

- **Key observation:** Class notebooks are stored on **SharePoint team sites** (not personal OneDrive), with the URL pattern `eduvic.sharepoint.com/sites/{TeamName}/SiteAssets/{NotebookName}`

### Test 8: GET /groups/{id}/onenote/notebooks/{id}/sectionGroups
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/notebooks/1-52e65c54-f0e4-4e91-8acc-0894fa8ee5b7/sectionGroups`
- **Status:** 200 OK
- **Result (Maths 2026):** 3 section groups:

| displayName | id | Notes |
|---|---|---|
| _Collaboration Space | 1-ef4987fe-493b-4d1f-8819-eda8f0d18abc | Shared space for all |
| _Content Library | 1-87566a56-0a59-4e23-826b-a101408eccbf | Teacher-published content (read-only for students) |
| Sonny TAYLOR | 1-bdf71ee3-9835-494c-9447-a66624fafcc6 | Student's personal section group |

- **Result (English 2026):** 3 section groups:
  - _Collaboration Space (id: `1-e0148329-4006-4c41-a7ae-b91fd365ca9b`)
  - _Content Library (id: `1-653fc44a-3ae2-4c2c-a10e-f10e30810398`)
  - Sonny TAYLOR (id: `1-fe8c989b-a393-4f40-b72d-fccce368b07f`)

- **CRITICAL OBSERVATION:** When accessing via `/groups/{id}/onenote/`, a student can ONLY see:
  1. Their own personal section group
  2. _Collaboration Space
  3. _Content Library
  - They CANNOT see other students' section groups or `_Teacher Only`
  - This is different from the "big chungus" notebook accessed via `/me/onenote/` where the owner can see everything

### Test 9: GET sections from student's personal section group
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/sectionGroups/1-bdf71ee3-9835-494c-9447-a66624fafcc6/sections`
- **Status:** 200 OK
- **Result:** 2 sections in Sonny's personal area:
  - "Data Analysis" (id: `1-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`) - last modified by teacher "Campbell Barnard-Green"
  - "Extras" (id: `1-fc2aef54-601b-4240-b335-83b0149e9f14`) - also last modified by teacher

### Test 10: GET pages from a section
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/sections/1-dcfbbea6-b46e-413d-a070-7c2cd5eb902d/pages`
- **Status:** 200 OK
- **Result:** 20 pages returned (with `@odata.nextLink` for pagination)
- **Pagination:** Default page size is 20. Use `$skip=20` or `$top=N` for pagination.
- **Key fields per page:**
  - `id` (e.g., `1-a4e1c78fde3c4242927c4be1b48c0904!59-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`)
  - `title`, `createdDateTime`, `lastModifiedDateTime`
  - `createdByAppId` (empty string for manual pages, app ID for API-created pages)
  - `contentUrl` (direct URL to get HTML content)
  - `links.oneNoteClientUrl.href`, `links.oneNoteWebUrl.href`
  - `parentSection` (inline)
- **Page ID format:** `{unique-part}!{sequence}-{section-id}` - the `!` character is significant
- **Sample pages:** "Required exercises", "INQUIRE 1D: Dot Plots and Stem Plots", "1D Show Case", etc.

### Test 11: GET page content (HTML)
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/.../onenote/pages/{page-id}/content`
- **Status:** 200 OK
- **Content-Type:** text/html
- **Result:** Full HTML document with:
  - `<html lang="en-AU">` (locale)
  - `<title>` matching page title
  - `<meta name="created" content="...">` with creation timestamp
  - `<body data-absolute-enabled="true" style="font-family:Calibri;font-size:11pt">`
  - Content in `<div>` elements with absolute positioning (`position:absolute;left:48px;top:115px;width:720px`)
  - Tables with inline styles (`border:1px solid;border-collapse:collapse`)
  - Highlighted text using `<span style="background-color:yellow">`
  - Images as `<img>` tags with `src` pointing to Graph API resource URLs

### Content Library Page Content (with image)
- **HTML structure for images:**
```html
<img width="1149" height="320"
     src="https://graph.microsoft.com/v1.0/groups('7eb70cc1-...')/onenote/resources/1-3f91203112f2053d0be56c9994e993a2!1-9be5a74a-eb67-475e-8866-78564da0365c/$value"
     data-src-type="image/png"
     data-fullres-src="https://graph.microsoft.com/v1.0/groups('7eb70cc1-...')/onenote/resources/1-3f91203112f2053d0be56c9994e993a2!1-9be5a74a-eb67-475e-8866-78564da0365c/$value"
     data-fullres-src-type="image/png" />
```
- **Note:** Image URLs use OData-style parenthesis notation for group IDs: `groups('...')` instead of `groups/...`

---

## Phase 3: Advanced Features

### Test 12: Search
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/pages?search=test`
- **Status:** 400 Bad Request
- **Error:** `20108` - "Your request contains unsupported OData query parameters."
- **Conclusion:** The `search` query parameter is NOT supported on the v1.0 endpoint for this tenant.

### Test 12b: $filter on pages
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/pages?$filter=contains(title,'test')&$top=5`
- **Status:** 400 Bad Request
- **Error:** `20266` - "The number of maximum sections is exceeded for this request. To get pages for accounts with a high number of sections, we recommend getting pages for one section at a time."
- **Conclusion:** The `/me/onenote/pages` endpoint is UNUSABLE for this account because it has too many sections (55 sections + 76 section groups across all accessible notebooks). Must use section-scoped page queries.

### Test 13: _Content Library Access
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/sectionGroups/1-87566a56-0a59-4e23-826b-a101408eccbf/sections`
- **Status:** 200 OK
- **Result:** 1 section: "Extras 2025" (id: `1-9be5a74a-eb67-475e-8866-78564da0365c`)
  - Last modified by: Grace Zou (not the teacher who created it - suggesting teacher editing)
  - Pages: "Timeline", "Chapter 1 and 2", "Solutions" (3 pages)
- **Conclusion:** Students CAN read _Content Library sections and pages via the API. This is read-only in the OneNote UI but the API returns full content.

### Test 14: _Collaboration Space Access
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups/7eb70cc1-180e-4c21-a962-5de92b9477bb/onenote/sectionGroups/1-ef4987fe-493b-4d1f-8819-eda8f0d18abc/sections`
- **Status:** 200 OK
- **Result:** 1 section: "Using the Collaboration Space" (id: `1-696fbbdb-45cd-4dd2-b1f1-ad66296c80a6`)
  - Pages: "Genny Math 3&4 Textbook", "Getting started with the Collaboration Space" (2 pages)
- **Conclusion:** Students CAN read AND write to _Collaboration Space.

### Test 14b: _Teacher Only Access (via personal "big chungus" notebook)
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/sectionGroups/1-730ec532-3afa-4c63-a24b-626c294cb72d/sections`
- **Status:** 200 OK
- **Result:** 1 section: "Using the Teacher Only Space"
- **Observation:** This is accessible because "big chungus" is owned by Sonny (stored in personal OneDrive). For class notebooks accessed via `/groups/`, the `_Teacher Only` section group is NOT returned at all.

### Test 15: /education/me/classes
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/education/me/classes`
- **Status:** 403 Forbidden (AccessDenied)
- **Error:** "Required scp claim values are not provided."
- **Conclusion:** The Education API endpoints require specific scopes (EduRoster.ReadBasic, etc.) that are NOT included in the standard OneNote/Graph token. This endpoint is NOT usable with the current permission set.

### Test 16: includesharednotebooks parameter
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/me/onenote/notebooks?includesharednotebooks=true`
- **Status:** 200 OK
- **Result:** Same 4 notebooks as without the parameter
- **Conclusion:** The `includesharednotebooks=true` parameter does NOT surface class notebooks shared via Groups. Class notebooks are only accessible through the `/groups/{id}/onenote/` path.

### Test 17: Beta endpoint
- **Endpoint:** `GET https://graph.microsoft.com/beta/me/onenote/notebooks`
- **Status:** 200 OK
- **Result:** Same 4 notebooks with same fields. No additional fields visible in beta.
- **Conclusion:** Beta endpoint works identically to v1.0 for notebooks listing.

---

## Phase 4: Write Operations

### Test 18: PATCH page content
- **Endpoint:** `PATCH https://graph.microsoft.com/v1.0/groups/{group-id}/onenote/pages/{page-id}/content`
- **First attempt (raw page ID with `!`):** 400 Bad Request
  - Error: "Resource not found for the segment '!59-...'"
  - The `!` in the page ID is interpreted as an OData segment separator
- **Second attempt (URL-encoded `!` as `%21`):** **204 No Content (SUCCESS)**
  - Body: `[{"target":"body","action":"append","content":"<p>Appended by API test</p>"}]`
  - The content was successfully appended to the page

- **CRITICAL BUG/QUIRK:** Page IDs contain `!` characters that MUST be URL-encoded as `%21` when used in PATCH/DELETE URLs. The page ID returned by the API (e.g., `1-a4e1c78fde3c4242927c4be1b48c0904!59-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`) cannot be used directly - it must be encoded to `1-a4e1c78fde3c4242927c4be1b48c0904%2159-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`.

- **PATCH format:**
  - Content-Type: `application/json`
  - Body: Array of patch operations
  - Each operation has: `target` (CSS selector or "body"), `action` ("append", "replace", etc.), `content` (HTML string)
  - Returns 204 No Content on success

- **Observation on `preprocess=true`:** Requesting page content with `?preprocess=true` does NOT add `data-id` attributes to all elements (at least not in this case). This limits the ability to target specific elements for PATCH operations.

### Test 19: POST create page
- **Endpoint:** `POST https://graph.microsoft.com/v1.0/groups/{group-id}/onenote/sections/{section-id}/pages`
- **Status:** **201 Created (SUCCESS - page was actually created!)**
- **Content-Type:** `application/xhtml+xml`
- **Body:** Simple XHTML document
- **Response fields:**
  - `id`: `1-12482a82641e4668be49dd1f99116a08!13-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`
  - `title`: "API Test"
  - `createdByAppId`: `ORGID-DE8BC8B5-D9F9-48B1-A8AD-B748DA725064` (the app registration ID)
  - `createdDateTime`, `lastModifiedDateTime` (same, just created)
  - `contentUrl`, `links` (same structure as read)
- **Note:** The page was successfully created in the student's personal section group within the class notebook. Students have WRITE access to their own sections.

### Test 19b: DELETE page
- **Endpoint:** `DELETE https://graph.microsoft.com/v1.0/groups/{group-id}/onenote/pages/{page-id}` (with `%21` encoding)
- **Status:** **204 No Content (SUCCESS)**
- **Conclusion:** Students CAN delete pages in their own sections via the API. The test page was successfully cleaned up.

---

## Phase 5: Resources

### Test 20: Fetch image resource
- **Endpoint:** `GET https://graph.microsoft.com/v1.0/groups('7eb70cc1-...')/onenote/resources/{resource-id}/$value`
- **Status:** 200 OK
- **Result:** PNG binary data returned (25,511 bytes)
- **Content-Type:** image/png (inferred from data)
- **Note:** The resource URL from page HTML uses OData parenthesis notation: `groups('...')` - this works correctly
- **Note:** Resource IDs also contain `!` characters. The URL-encoded version (`%21`) also works.

---

## Summary of Key Findings

### Architecture
1. **Personal notebooks** are stored in OneDrive: `eduvic-my.sharepoint.com/personal/{username}/Documents/`
2. **Class notebooks** are stored in SharePoint team sites: `eduvic.sharepoint.com/sites/{TeamName}/SiteAssets/`
3. **Personal class notebooks** (created by students via Class Notebook tool) are stored in OneDrive under `Class Notebooks/`

### Access Patterns
1. **`/me/onenote/`** - Only returns notebooks stored in the user's personal OneDrive (4 notebooks)
2. **`/groups/{id}/onenote/`** - Returns notebooks in the group's SharePoint site (class notebooks)
3. **`includesharednotebooks=true`** does NOT bridge these two - you must query groups separately
4. **To get ALL of a student's notebooks,** you must:
   a. Query `/me/onenote/notebooks` for personal ones
   b. Query `/me/memberOf` to find Teams groups
   c. Filter for groups with `classAssignments` in `creationOptions`
   d. Query `/groups/{id}/onenote/notebooks` for each class group

### Class Notebook Structure
```
Class Notebook (via /groups/{id}/onenote/)
  +-- _Collaboration Space (section group)  [student: read+write]
  |     +-- sections
  |           +-- pages
  +-- _Content Library (section group)       [student: read-only]
  |     +-- sections
  |           +-- pages
  +-- _Teacher Only (section group)          [student: HIDDEN - not returned by API]
  +-- {Student Name} (section group)         [student: read+write own only, others HIDDEN]
        +-- sections (e.g., "Data Analysis", "Extras")
              +-- pages
```

### ID Format Quirks
- **Notebook IDs:** `1-{uuid}` (e.g., `1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d`)
- **Section IDs:** `1-{uuid}` (same format)
- **Section Group IDs:** `1-{uuid}` (same format)
- **Page IDs:** `1-{hex-hash}!{sequence}-{section-uuid}` (e.g., `1-a4e1c78fde3c4242927c4be1b48c0904!59-dcfbbea6-b46e-413d-a070-7c2cd5eb902d`)
- **Resource IDs:** `1-{hex-hash}!{sequence}-{section-uuid}` (same format as page IDs)
- **CRITICAL:** The `!` in page/resource IDs MUST be URL-encoded as `%21` in URL paths for PATCH, DELETE, and other write operations

### Permissions & Access (Student Account)
| Operation | Personal Notebooks | Class: Own Section | Class: _Content Library | Class: _Collaboration Space | Class: _Teacher Only | Class: Other Students |
|---|---|---|---|---|---|---|
| List | YES | YES | YES | YES | **HIDDEN** | **HIDDEN** |
| Read pages | YES | YES | YES | YES | N/A | N/A |
| Read content | YES | YES | YES | YES | N/A | N/A |
| Create pages | YES | YES | ? | ? | N/A | N/A |
| PATCH content | YES | YES | ? | ? | N/A | N/A |
| Delete pages | YES | YES | ? | ? | N/A | N/A |

### Broken/Unavailable Endpoints
1. **`/me/onenote/pages?search=...`** - Error 20108: Unsupported OData query parameters
2. **`/me/onenote/pages`** (unscoped) - Error 20266: Too many sections. Must use section-scoped queries.
3. **`/me/onenote/pages?$filter=...`** - Same error 20266
4. **`/education/me/classes`** - Error 403: Missing scope claims (EduRoster permissions not in token)

### Global Sections & Section Groups
- **`/me/onenote/sections`** returns 55 sections across ALL accessible notebooks (personal + personal class notebooks)
- **`/me/onenote/sectionGroups`** returns 76 section groups - BUT many are garbage (GUIDs, folder names from OneDrive). This suggests the API indexes more than just OneNote section groups.

### Pagination
- Default page size for pages listing: 20
- Use `$skip` and `$top` for pagination
- `@odata.nextLink` provided when more results available

### Rate Limiting / Performance
- All requests completed in under 2 seconds
- No rate limiting encountered during testing
- No throttling headers observed

---

## Recommended API Flow for UnNote

### Step 1: Get all notebooks
```
GET /me/onenote/notebooks                              -> personal notebooks
GET /me/memberOf                                        -> find class groups
For each group with classAssignments:
  GET /groups/{groupId}/onenote/notebooks              -> class notebooks
```

### Step 2: Build notebook tree
```
For each notebook:
  GET .../notebooks/{id}/sectionGroups                 -> _Collab, _Content, Student name
  For each sectionGroup:
    GET .../sectionGroups/{id}/sections                -> sections within
  GET .../notebooks/{id}/sections                      -> top-level sections (if any)
```

### Step 3: Get pages
```
For each section:
  GET .../sections/{id}/pages                          -> paginated, 20 per request
```

### Step 4: Get page content
```
GET .../pages/{pageId}/content                         -> HTML content
  (remember to URL-encode ! as %21 in pageId)
```

### Step 5: Get resources (images, etc.)
```
Parse <img src="..."> from HTML
GET the resource URL directly (already contains auth context)
```

---

## Raw IDs Reference

### Personal Notebooks
| Name | Notebook ID |
|---|---|
| big chungus | `1-9692d754-5d71-4d5f-b3e8-f63cc4eb25d0` |
| something | `1-4591fe6f-9a52-419b-a12d-da338b610d68` |
| Sonny @ Department of Education | `1-18ad9b4d-913f-40bf-8bdd-f8e85cd8508d` |
| Sonny @ VIC - DET | `1-eea9e7c1-eac5-46a8-a733-a0bf7978f6f9` |

### 2026 Class Groups
| Class Name | Group ID | Notebook ID |
|---|---|---|
| BBB 12C English 2026 | `37777051-77f9-4ded-a2c7-dfbf1140c778` | `1-d3e91d42-18bc-4daa-884d-1b53fe933333` |
| BBB 12D General Maths 2026 | `7eb70cc1-180e-4c21-a962-5de92b9477bb` | `1-52e65c54-f0e4-4e91-8acc-0894fa8ee5b7` |
| BBB 12A Psychology 2026 | `011666a3-eb36-4361-a511-ee0641d75cd4` | (not tested) |
| BBB 12A Food Studies 2026 | `422f626a-1a23-4a5d-9349-27ebf1b6e6d0` | (not tested) |
| BBB Systems Engineering 12/34 2026 | `9879db31-2d7a-488d-8fd1-b823fb676de2` | (not tested) |
| BBB 12 BEYOND.6 2026 | `9b659a26-50c9-4591-abcb-ec772ff3e57a` | (not tested) |

### 2025 Class Groups (also active)
| Class Name | Group ID | Notebook ID |
|---|---|---|
| BBB 11/12A Applied Computing 2025 | `ead7bb62-283b-41fc-b56e-c8168ad40f60` | `1-f8fd8dea-92dd-4c21-9b86-c62a9a7df52d` |
| BBB 11D General Maths 2025 | `041dc774-48d8-4960-a625-1b2c699d7bb2` | (not tested) |
| BBB 11 B English 2025 | `9a5f8aab-5141-4d80-b8c6-783c73542e3c` | (not tested) |
| BBB 11A Food Studies 2025 | `16fef725-6167-45d5-9ec0-e6d24e7f0ef5` | (not tested) |
| BBB 11B Psychology 2025 | `16ce74c7-c162-4a4c-936d-19039bd71e44` | (not tested) |
| BBB Beyond 11.2 2025 | `94aefefa-37ff-45c4-a0a2-4a91c1ce6a39` | (not tested) |
| BBB 11A Systems Engineering 2025 | `d6b392c2-da85-439b-90cd-5ec9a378461b` | (not tested) |

### Maths 2026 Section Groups & Sections
| Area | Section Group ID | Section Name | Section ID |
|---|---|---|---|
| Student (Sonny) | `1-bdf71ee3-9835-494c-9447-a66624fafcc6` | Data Analysis | `1-dcfbbea6-b46e-413d-a070-7c2cd5eb902d` |
| Student (Sonny) | `1-bdf71ee3-9835-494c-9447-a66624fafcc6` | Extras | `1-fc2aef54-601b-4240-b335-83b0149e9f14` |
| _Content Library | `1-87566a56-0a59-4e23-826b-a101408eccbf` | Extras 2025 | `1-9be5a74a-eb67-475e-8866-78564da0365c` |
| _Collaboration Space | `1-ef4987fe-493b-4d1f-8819-eda8f0d18abc` | Using the Collaboration Space | `1-696fbbdb-45cd-4dd2-b1f1-ad66296c80a6` |
