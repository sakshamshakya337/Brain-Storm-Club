# LPU SCA Brainstorm Club — Event Management Platform

A full-stack, LMS-style event management website for the **LPU SCA Brainstorm Club**. The platform combines a public marketing/event site with a secure private admin dashboard for managing events, member approvals, registrations, and club communication.

---

## 1. Tech Stack

| Layer | Technology |
|---|---|
| Frontend Framework | React.js (Vite) |
| Styling | Tailwind CSS (Light theme default + Dark theme toggle) |
| Animations | GSAP (GreenSock) + ScrollTrigger |
| 3D Components | React Three Fiber + drei (Three.js wrapper) |
| Backend | Node.js + Express.js |
| Database | MongoDB (Atlas) via Mongoose ODM |
| Authentication | Admin-only auth — Email + OTP (Gmail SMTP via Nodemailer) + JWT session |
| File/Image Storage | Cloud storage (e.g., Cloudinary / S3) — never store raw images in DB |
| Export Utilities | `exceljs` (Excel), `pdfkit` / `pdf-lib` (PDF), `json2csv` (CSV) |
| Form Validation | `zod` / `express-validator` (server) + `react-hook-form` + `zod` (client) |
| Security Middleware | `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`, `cors`, `csurf` |

---

## 2. Project Structure

```
lpu-sca-brainstorm/
├── client/                        # React frontend
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                # Buttons, cards, modals, form fields
│   │   │   ├── layout/             # Navbar, Footer, ThemeToggle
│   │   │   ├── three/              # 3D hero scenes, particle backgrounds
│   │   │   └── animations/         # GSAP wrapper components/hooks
│   │   ├── pages/
│   │   │   ├── public/             # Home, Events, About, Members, Contact, JoinUs, Ideas
│   │   │   ├── hidden/             # MemberSelfRegister (secret link)
│   │   │   └── admin/              # Dashboard, EventsAdmin, MembersAdmin, etc.
│   │   ├── context/                 # ThemeContext, AuthContext
│   │   ├── hooks/
│   │   ├── services/                # Axios API instances
│   │   ├── utils/                   # validators, formatters
│   │   └── App.jsx
│   └── tailwind.config.js
│
├── server/                        # Node/Express backend
│   ├── config/                     # db.js, mailer.js, cloud.js
│   ├── models/                     # Event, Member, Registration, JoinUsForm, Idea, ContactQuery, Admin, OtpSession
│   ├── controllers/
│   ├── routes/
│   │   ├── public.routes.js
│   │   └── admin.routes.js         # protected, mounted at /api/control
│   ├── middleware/
│   │   ├── auth.middleware.js       # JWT + role check
│   │   ├── rateLimiter.js
│   │   ├── sanitize.js
│   │   └── validate.js
│   ├── utils/
│   │   ├── otpGenerator.js
│   │   ├── exportExcel.js
│   │   ├── exportPdf.js
│   │   └── exportCsv.js
│   └── server.js
│
├── design.md
├── features.md
└── README.md
```

---

## 3. Environment Variables (`.env` — never commit this file)

```
# Server
PORT=5000
NODE_ENV=production
CLIENT_URL=https://sca-brainstorm.lpu.in

# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/lpu_sca_brainstorm

# Auth
JWT_SECRET=<strong-random-64-char-secret>
JWT_EXPIRES_IN=1d
OTP_EXPIRES_MIN=5
ADMIN_LOGIN_ROUTE=/control

# Gmail SMTP (use App Password, not real Gmail password)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_USER=club.email@gmail.com
SMTP_PASS=<gmail-app-password>

# Image/File storage
CLOUDINARY_CLOUD_NAME=xxxx
CLOUDINARY_API_KEY=xxxx
CLOUDINARY_API_SECRET=xxxx

# Security
CORS_ORIGIN=https://sca-brainstorm.lpu.in
RATE_LIMIT_WINDOW_MIN=15
RATE_LIMIT_MAX=100
```

> ⚠️ Never expose `JWT_SECRET`, `SMTP_PASS`, or DB credentials to the client bundle. All secrets live only in `server/.env`, loaded via `dotenv`, and excluded from git via `.gitignore`.

---

## 4. Getting Started

```bash
# 1. Clone
git clone <repo-url>
cd lpu-sca-brainstorm

# 2. Install dependencies
cd server && npm install
cd ../client && npm install

# 3. Configure environment
cp server/.env.example server/.env
# fill in MongoDB URI, Gmail SMTP app password, JWT secret, Cloudinary keys

# 4. Run in development
cd server && npm run dev      # http://localhost:5000
cd client && npm run dev      # http://localhost:5173

# 5. Build for production
cd client && npm run build
```

---

## 5. Route Map (High Level)

**Public**
```
/                → Home
/events          → Events listing + past event galleries
/events/:slug    → Event detail
/about           → About Us
/members         → Approved members directory
/contact         → Contact Us
/join-us         → Join Us form (no login, one-time entry per student)
/ideas           → Submit an event idea
/register-member → Hidden self-registration link (shared manually, not linked in nav)
```

**Private / Admin** (all under a non-guessable base path)
```
/control                    → Admin login (Email + OTP)
/control/dashboard          → Overview / stats
/control/events             → Manage events, view registrations, export data
/control/events/:id/entries → Registration list, mark attendance, export
/control/members            → Approved members list
/control/members/pending    → Approve/reject self-registered members
/control/join-us            → Join Us submissions
/control/contact            → Contact Us queries
/control/ideas              → Student idea submissions
```

---

## 6. Security Overview (see `features.md` for full detail)

- OTP-based admin login only — no public sign-up, no exposed admin credentials.
- All admin routes protected by JWT + server-side role middleware.
- Input sanitization against NoSQL injection (`express-mongo-sanitize`), XSS (`xss-clean`/DOMPurify), and HTML injection on every form.
- Rate limiting + CAPTCHA on public forms to prevent spam/bot submissions.
- Unique compound indexes in MongoDB to enforce one registration per student per event and one member profile per student.
- Member/event images served through a protected proxy with disabled context menu, drag, and keyboard shortcuts; watermarking recommended for extra protection (see Design doc — noted as deterrents, not absolute prevention).
- HTTPS enforced, secure & HTTP-only cookies for session tokens, CSRF protection on state-changing requests.

---

## 7. License

Internal project for LPU SCA Brainstorm Club. All rights reserved to the club/institution unless otherwise licensed.

# Brain-Storm-Club
Club website
