# Features Specification — LPU SCA Brainstorm Club Platform

## 1. Public Website Features

### 1.1 Home Page
- Hero section with 3D animated visual (React Three Fiber — floating shapes / particle brain motif tied to "Brainstorm" branding).
- GSAP scroll-triggered reveal animations for sections.
- Highlights: upcoming event banner, quick stats (total events, total members, ideas submitted), latest gallery preview.
- Call-to-action buttons: "Explore Events," "Join Us," "Submit an Idea."
- Light theme by default, with a persistent Dark/Light toggle stored in `localStorage`.

### 1.2 Events Page
- Grid/list of all events, filterable by status: **Upcoming / Ongoing / Completed**.
- Each **Event Card** shows: title, date, venue, short description, poster image, category tag.
- **Completed events** automatically unlock a "Gallery" section within the same card — admin-uploaded post-event photos display in a lightbox/carousel.
- Clicking a card opens an **Event Detail Page**: full description, schedule, coordinators, registration button (if still open), and full gallery for completed events.
- Skeleton loaders + GSAP fade-in as events load from the API.
- **Search & Filters**:
  - Live search bar (debounced) matching event title/description.
  - Filter by **category/tag** (e.g., Hackathon, Workshop, Seminar, Coding Contest) — multi-select chips.
  - Filter by **date range** (upcoming week/month, custom range picker) and by **status** (Upcoming/Ongoing/Completed, combinable with category/date).
  - Filters reflected in the URL query string (e.g., `/events?category=hackathon&status=completed`) so filtered views are shareable/bookmarkable.
  - "Clear all filters" action; empty-state illustration when no events match.

### 1.3 About Us Page
- Club mission, vision, history/timeline (GSAP horizontal or vertical scroll timeline).
- Faculty/HOS section (static, admin-editable but not tied to the member approval workflow).
- Optional 3D badge/logo animation.

### 1.4 Members Page
- Publicly lists **approved** members only, grouped by role hierarchy:
  1. HOS (fixed/static)
  2. Faculty Members (fixed/static)
  3. President
  4. Vice President
  5. Technical Head
  6. Coordinators
  7. Technical Team
- Each member card shows: photo, name, course/degree (MCA, BCA, BSc.IT, MSc.IT, etc.), role, section — **phone/WhatsApp numbers are NOT publicly displayed** (admin-only, for privacy).
- **Images are view-only**: right-click, drag, long-press-save, and `Ctrl+S` disabled; no direct image URL exposed in DOM/console (served via protected/obfuscated endpoint or canvas-render technique — see Design doc §6).
- Role labels for HOS/Faculty are permanently fixed in the schema; only student-role members rotate per academic session (admin can update/retire without deleting historical records).
- **Search & Filters**:
  - Search bar matching member name.
  - Filter by **role** (President, Vice President, Technical Head, Coordinator, Technical Team, Faculty, HOS) — single or multi-select.
  - Filter by **course/degree** (MCA, BCA, BSc.IT, MSc.IT, etc.) and optionally by **section**.
  - Filters apply client-side (fast, since the approved-members list is a bounded dataset) with results re-grouped by role hierarchy after filtering.

### 1.5 Contact Us Page
- Simple contact form: name, email, subject, message.
- Google Map embed (club/campus location) — optional.
- Social links, club email, and location.
- Server-side validation + rate limiting to prevent spam submissions.

### 1.6 Join Us Page
- **No login/signup required** — pure form submission.
- Fields: full name, LPU registration number, course, section, phone number, WhatsApp number (optional/checkbox), email, why they want to join (short text), area of interest.
- **Duplicate prevention**: unique index on `registrationNumber` (and/or `phone` + `email` combo) in MongoDB — a student cannot submit twice. On duplicate attempt, show a friendly "You've already applied" message instead of a raw DB error.
- Client-side + server-side validation (regex for phone, LPU reg. number format, email format).
- Confirmation message/email sent to the student on successful submission (optional).
- **Privacy Policy & Consent**:
  - A mandatory, unchecked-by-default checkbox: *"I have read and agree to the [Privacy Policy] and consent to the club storing my details (name, course, section, phone/WhatsApp number) for club membership and communication purposes."*
  - Form cannot be submitted until the checkbox is checked (client-side block + server-side re-validation — never trust the client alone).
  - `[Privacy Policy]` links to a dedicated `/privacy-policy` public page (see §1.9 below).
  - Consent timestamp (`consentGivenAt`) stored with the submission for audit purposes.

### 1.7 Members Page — Hidden Self-Registration Link
- Accessible only via a **private, unlisted URL** (e.g., `/register-member/<club-shared-token>`), shared manually by the admin — not linked anywhere in the public navigation.
- Student fills their own profile:
  - Photo upload
  - Full name
  - Course/degree (dropdown: MCA, BCA, BSc.IT, MSc.IT, etc.)
  - Phone number
  - WhatsApp number
  - Section
  - Requested role *(dropdown restricted to the current rotating student roles: President, Vice President, Technical Head, Coordinator, Technical Team — HOS/Faculty are not selectable here)*
- Submission status = **Pending** until admin approval.
- **Duplicate prevention**: unique index on registration number/phone so a student can only have one pending/approved profile at a time (they can request an update, which goes back to pending for re-approval, but not create duplicates).
- Once **approved** by admin, the entry automatically becomes live on the public Members page.
- If **rejected**, student sees no public entry (optionally notified via email why).
- **Privacy Policy & Consent**: same mandatory consent checkbox pattern as the Join Us form (§1.6), with explicit mention that a **photo** is also being collected and will be displayed publicly (view-only) on the Members page once approved. Consent timestamp stored alongside the submission.

### 1.8 Your Ideas Page
- Simple form for students to pitch event ideas: name, course, section, contact, idea title, idea description, expected outcome/benefit.
- No login required; light spam protection (rate limit + honeypot field + optional CAPTCHA).
- Submissions visible only to admin, who can mark them as Reviewed / Shortlisted / Rejected internally.

### 1.9 Privacy Policy Page
- A standalone public page (`/privacy-policy`) linked from the Join Us form, the hidden member self-registration form, and the site footer.
- Covers: what data is collected (name, course, section, phone/WhatsApp, email, photo), why it's collected (club membership, event communication, public member directory), how long it's retained, who can access it (admins only, except approved-member public fields), and how a student can request corrections or deletion (see §4.7 Data Subject Rights).
- Written in plain language, versioned (e.g., "Last updated: DD-MM-YYYY") so future changes are traceable.

---

## 2. Private (Admin) Dashboard Features

### 2.1 Access & Authentication
- Hidden login route: **`/control`** — not linked from any public page, not indexed by search engines (`robots.txt` disallow + `noindex` meta).
- **Two-step login**:
  1. Admin enters registered email + password (or just email, per design choice).
  2. System emails a **6-digit OTP** via **Gmail SMTP (Nodemailer)**, valid for a short window (e.g., 5 minutes), rate-limited to prevent brute force.
  3. On correct OTP entry, server issues a **JWT** stored in a secure, HTTP-only, SameSite cookie.
- Session expiry + auto-logout on inactivity; refresh-token rotation optional for longer sessions.
- All `/control/*` API routes protected by JWT verification middleware + role check.

### 2.2 Events Management
- Create/edit/delete events (title, description, date, venue, poster, category, registration open/close toggle).
- Upload post-event gallery images (auto-attached to the event card shown publicly).
- **Registrations per event**:
  - View all entries in a table: student name, course, section, phone number, WhatsApp (if provided).
  - **Strict one-registration-per-event-per-student** enforced via a unique compound index (`eventId + registrationNumber` or `eventId + phone`).
  - Checkbox columns for status marking: **Participated / Completed / No-show / Certificate Issued**, etc. — configurable per event.
  - **WhatsApp checkbox**: if a student marks "has WhatsApp," their entry is automatically flagged/copied into a "WhatsApp broadcast list" export for that event.
  - **Export options**: Excel (.xlsx), CSV, and PDF — export respects any filters/checkboxes applied (e.g., export only "Completed" participants).

### 2.3 Members Management
- List of all **approved/live** members with full edit capability (update role, section, retire a student role at end of tenure without losing historical record).
- **Pending Approvals** tab: shows self-registered submissions from the hidden link.
  - Admin reviews photo, details, requested role → **Approve** (goes live on public Members page) or **Reject** (with optional reason, notified to student via email).
  - Approved members are timestamped with `approvedBy` and `approvedAt` for audit trail.
- Ability to reorder/feature members within a role group.

### 2.4 Join Us Submissions
- Table of all Join Us form entries with search/filter (by course, section, date).
- Export to Excel/CSV/PDF.
- Mark as "Contacted" / "Onboarded" internally.

### 2.5 Contact Us Queries
- Inbox-style list of contact form messages, mark as Read/Unread/Resolved.
- Reply option (opens default mail client or triggers SMTP email reply).

### 2.6 Your Ideas Submissions
- List of all submitted ideas with status tags (New / Reviewed / Shortlisted / Implemented / Rejected).
- Export for planning meetings.

### 2.7 Dashboard Overview
- Summary cards: total events, total members, pending approvals, new Join Us entries, new ideas, new contact queries (last 7/30 days).
- Quick links into each analytics view described below.

### 2.8 Analytics Dashboard
A dedicated `/control/analytics` page for deeper, filterable reporting beyond the top-level summary cards. Charts built with a lightweight library (e.g., `recharts`) and theme-aware (light/dark).

- **Event Attendance Trends over Semesters**:
  - Line/bar chart of total registrations vs. actual attendance (marked "Participated/Completed") per event, grouped and filterable by **semester/academic session** (e.g., derived from event date ranges configured by admin, such as "Odd 2026" / "Even 2026").
  - Toggle between "Registrations" and "Attendance" series to compare drop-off/no-show rate over time.
  - Drill-down: click a semester bar to see the underlying event list for that period.
- **Most Active Course/Section**:
  - Aggregated view (bar chart + ranked table) of registration/attendance counts grouped by **course** (MCA, BCA, BSc.IT, MSc.IT, etc.) and by **section**, across all events or a selected date range.
  - Helps identify which courses/sections engage most, useful for targeted outreach.
- **Idea-to-Event Conversion Rate**:
  - Tracks how many submissions from the **Your Ideas** page were eventually **Implemented** (i.e., linked to a real event created by admin) vs. Rejected/Shortlisted/still New.
  - Displayed as a conversion funnel or percentage stat (e.g., "18% of submitted ideas became real events this year") plus a trend line over semesters.
  - Requires an optional `linkedEventId` field on the `Idea` model, set by admin when marking an idea "Implemented" (so the conversion can be traced end-to-end).
- **Export**: analytics views support exporting the underlying aggregated data (not just raw entries) to Excel/CSV/PDF for use in club reports/presentations.
- **Data source note**: all analytics are computed via MongoDB aggregation pipelines (not client-side computation on full raw datasets) for performance as data grows across semesters.

---

## 3. Cross-Cutting Technical Features

### 3.1 Theming
- Tailwind CSS with a `light` (default/permanent baseline) and `dark` theme using the `class` strategy.
- Theme preference persisted in `localStorage`, applied before first paint (no flash of wrong theme).
- All components, including 3D scenes and GSAP-animated elements, must have theme-aware color variants.

### 3.2 Animations
- GSAP for page transitions, scroll-triggered reveals, hover micro-interactions, and card entrance animations.
- React Three Fiber for hero/background 3D elements — kept performant (lazy-loaded, low poly, capped frame budget) and with a reduced-motion fallback for accessibility (`prefers-reduced-motion`).

### 3.3 Data Export Utilities
- Centralized export service supporting **Excel, CSV, PDF** for: event registrations, Join Us data, member lists, and ideas — triggered from the admin dashboard with column/status filters applied before export.

### 3.4 Notifications (Gmail SMTP)
- OTP emails for admin login.
- Optional confirmation emails: Join Us submission received, member approval/rejection, idea acknowledgment.

---

## 4. Security & Validation Requirements

### 4.1 Input Validation
- Every public form validated **both client-side** (`react-hook-form` + `zod`) **and server-side** (`zod`/`express-validator`) — never trust client input alone.
- Strict schemas: regex for phone numbers (10-digit Indian format), email format, registration number pattern, file type/size limits for photo uploads (e.g., JPEG/PNG only, max 2MB).

### 4.2 Injection Protection
- **NoSQL Injection**: `express-mongo-sanitize` strips `$`/`.` operators from all incoming request bodies/queries before they reach Mongoose.
- **XSS**: Sanitize all free-text fields (`xss-clean` or DOMPurify) both on save and on render; never use `dangerouslySetInnerHTML` with unsanitized content.
- **CSRF**: `csurf` middleware + SameSite cookies for all state-changing admin requests.
- **Rate Limiting**: `express-rate-limit` on all public POST endpoints (Join Us, Contact, Ideas, Member self-registration, OTP requests) to block spam/brute-force.
- **File Upload Safety**: validate MIME type and magic bytes (not just extension) before accepting uploaded photos; scan/re-encode images server-side to strip embedded scripts/metadata (EXIF stripping).
- **Helmet.js**: sets secure HTTP headers (CSP, X-Frame-Options, HSTS, X-Content-Type-Options).
- **CORS**: locked to the production frontend origin only.

### 4.3 Duplicate Entry Prevention
- MongoDB unique compound indexes:
  - `JoinUsForm`: unique on `registrationNumber` (and/or `phone`).
  - `Member`: unique on `registrationNumber` for self-registration (pending or approved).
  - `EventRegistration`: unique on `(eventId, registrationNumber)`.
- API returns a clean, user-friendly duplicate error (HTTP 409) instead of raw MongoDB error text.

### 4.4 Image Protection (Members Page)
- Images rendered via a protected image component:
  - `onContextMenu`, `draggable={false}`, CSS `user-select: none` and `pointer-events` control on the image layer.
  - Actual image URLs not exposed directly in page source — served via a signed/short-lived proxy endpoint or rendered onto a `<canvas>` to make right-click "Save As" and simple DOM inspection non-trivial.
  - Disable common shortcuts (`Ctrl+S`, `Ctrl+U`, `F12` warning) as an additional deterrent.
  - **Note**: No front-end technique makes an on-screen image 100% undownloadable (a determined user can always screenshot); these measures raise the barrier significantly and prevent casual/bulk scraping, which is the realistic goal.

### 4.5 Admin Auth Hardening
- OTP + JWT flow (see §2.1); OTPs hashed before storage, single-use, short expiry.
- Login attempts rate-limited and temporarily locked after repeated failures.
- Admin route path (`/control`) excluded from sitemaps and `robots.txt`.
- All admin actions (approve member, mark attendance, export data) logged with timestamp + admin identity for auditability.

### 4.6 General Data Protection
- Passwords/OTP secrets always hashed (bcrypt/argon2) — never stored in plain text.
- HTTPS enforced in production; HTTP-only, Secure, SameSite cookies for session tokens.
- Principle of least privilege: public API endpoints never expose sensitive fields (phone numbers, emails) that aren't meant for public consumption — controlled via Mongoose `select`/response DTOs.

### 4.7 Privacy Compliance & Data Subject Rights
- **Consent capture**: every form that collects personal data (Join Us, member self-registration) requires an explicit, mandatory consent checkbox (see §1.6, §1.7) before submission; consent is timestamped and stored with the record, never inferred/pre-checked.
- **Privacy Policy page** (`/privacy-policy`, §1.9) is the single source of truth for what's collected and why, and must be updated whenever new personal fields are added to any form.
- **Correction/Deletion requests**: students can email the club (via Contact Us or the address listed in the Privacy Policy) to request their data be corrected or removed; admin dashboard provides a way to locate a record by phone/registration number and permanently delete it (hard delete, not soft delete, for genuine removal requests) with the action captured in the audit log (§4.5).
- **Minimal necessary exposure**: publicly rendered member data is limited to what's needed for the directory (name, photo, course, role, section) — phone/WhatsApp numbers stay admin-only, enforced at the API response layer (not just hidden in the UI).
