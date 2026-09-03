# Design System — LPU SCA Brainstorm Club Platform

## 1. Design Philosophy

The brand sits at the intersection of **academic credibility** (LPU/SCA institutional trust) and **creative energy** (a "Brainstorm" club — ideas, innovation, tech events). The visual language should feel:

- **Modern & tech-forward** — subtle 3D elements, clean grids, generous whitespace.
- **Professional, not gimmicky** — GSAP and 3D are used to *support* content, never distract from it.
- **Consistent across two permanent themes** — Light is the default/baseline theme; Dark is a fully-supported alternate, not an afterthought.

---

## 2. Color System

### 2.1 Light Theme (Default)

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#FFFFFF` | Page background |
| `--bg-secondary` | `#F5F7FA` | Section/alt background |
| `--bg-card` | `#FFFFFF` | Card surfaces (with soft shadow) |
| `--text-primary` | `#0F172A` | Headings, body text |
| `--text-secondary` | `#475569` | Muted text, captions |
| `--brand-primary` | `#4F46E5` (Indigo) | CTAs, links, active states |
| `--brand-secondary` | `#0EA5E9` (Sky Blue) | Accents, gradients |
| `--brand-accent` | `#F59E0B` (Amber) | Highlights, badges (e.g., "New," "Completed") |
| `--success` | `#16A34A` | Approved/completed status |
| `--warning` | `#D97706` | Pending status |
| `--danger` | `#DC2626` | Rejected/error states |
| `--border` | `#E2E8F0` | Dividers, card borders |

### 2.2 Dark Theme

| Token | Hex | Usage |
|---|---|---|
| `--bg-primary` | `#0B1120` | Page background |
| `--bg-secondary` | `#111827` | Section/alt background |
| `--bg-card` | `#1E293B` | Card surfaces |
| `--text-primary` | `#F1F5F9` | Headings, body text |
| `--text-secondary` | `#94A3B8` | Muted text, captions |
| `--brand-primary` | `#818CF8` (Indigo-light) | CTAs, links, active states |
| `--brand-secondary` | `#38BDF8` (Sky-light) | Accents, gradients |
| `--brand-accent` | `#FBBF24` (Amber-light) | Highlights, badges |
| `--success` | `#4ADE80` | Approved/completed status |
| `--warning` | `#FBBF24` | Pending status |
| `--danger` | `#F87171` | Rejected/error states |
| `--border` | `#2D3748` | Dividers, card borders |

**Implementation note**: Define these as CSS custom properties on `:root` and `.dark`, and map them into `tailwind.config.js` under `theme.extend.colors` so utility classes like `bg-primary`, `text-secondary`, `border-brand` work identically in both themes. Toggle via a `dark` class on `<html>`, controlled by `ThemeContext` + `localStorage`, applied via a blocking inline script before React hydrates (no flash of unstyled theme).

---

## 3. Typography

| Role | Font | Notes |
|---|---|---|
| Headings | **Poppins** (600/700) | Bold, geometric — conveys energy/innovation |
| Body | **Inter** (400/500) | Highly legible for forms, tables, long content |
| Numeric/Stats | **Space Grotesk** (500) | Used for stat counters, dashboard figures |

- Base size: `16px` (1rem); scale using a 1.25 modular ratio for headings (`h1: 2.5rem → h6: 1rem`).
- Line height: `1.5` for body, `1.2` for headings.
- Letter-spacing: slightly tightened (`-0.01em`) on large headings for a modern feel.

---

## 4. Layout & Spacing

- **Grid**: 12-column responsive grid, `max-w-7xl` container, `px-6 md:px-10` gutters.
- **Spacing scale**: Tailwind default (`4px` base unit) — maintain consistent vertical rhythm with `py-16 md:py-24` between major sections.
- **Cards**: `rounded-2xl`, soft shadow (`shadow-md` light / `shadow-black/40` dark), `1px` border using `--border` token, `p-6`.
- **Breakpoints**: mobile-first — `sm:640px, md:768px, lg:1024px, xl:1280px, 2xl:1536px`.

---

## 5. Page-Specific Design Notes

### 5.1 Home Page
- Full-viewport hero with a lightweight React Three Fiber scene (e.g., a rotating low-poly abstract "brain/idea" mesh or floating particle field in brand colors) sitting behind/beside the headline.
- GSAP `ScrollTrigger` staggers section entrances (fade + slight `y` translate, `duration: 0.8`, `ease: power2.out`).
- Stat counters animate from `0` on scroll-into-view.

### 5.2 Events Page
- Masonry/grid card layout; each card:
  - Poster image (top, `aspect-video`, `rounded-t-2xl`)
  - Status badge (Upcoming / Ongoing / Completed) using `--brand-accent` / `--success`
  - Title, date, short description
  - **Completed events**: an expandable gallery strip (horizontal scroll thumbnails) appears at the bottom of the same card, opening a full lightbox on click.
- Filter/tab bar (Upcoming/Ongoing/Completed/All) with animated underline indicator (GSAP or CSS transition).

### 5.3 Members Page
- Grouped sections in fixed hierarchy order (HOS → Faculty → President → VP → Technical Head → Coordinators → Technical Team), each with a section heading and a responsive card grid (`grid-cols-2 md:grid-cols-3 lg:grid-cols-4`).
- Member card: circular/rounded-square photo, name, role badge (color-coded per role tier), course/degree, section.
- **Image protection styling**: image wrapped in a `div` with `select-none`, `pointer-events-none` on the `<img>` itself (interactions handled by an overlay `div` instead), no visible download affordance, right-click disabled via `onContextMenu={(e) => e.preventDefault()}`.
- Subtle hover animation only (scale `1.03`, shadow lift) — no click-through to a larger/raw image version.

### 5.4 Join Us / Ideas / Contact Forms
- Single-column, centered form (`max-w-xl`), floating labels or top-aligned labels with clear focus states (`ring-2 ring-brand-primary`).
- Inline validation messages in `--danger`, success toast on submission (animated slide-in, GSAP or a toast library styled to match theme tokens).
- Disabled submit button with spinner during network request to prevent double-submits.

### 5.5 Hidden Member Self-Registration Page
- Same form styling as Join Us, plus a **photo upload dropzone** with live preview, file-type/size validation feedback, and a clear "Pending Approval" confirmation screen after submission (no ambiguity that it's not yet live).

### 5.6 Admin Dashboard (`/control`)
- Distinct **utility-focused** layout: fixed sidebar navigation + top bar (search, theme toggle, admin profile/logout).
- Data-dense tables with sticky headers, checkbox columns, sortable columns, pagination.
- Status pills using theme-consistent semantic colors (`success`/`warning`/`danger`).
- Export buttons grouped top-right of each table (Excel / CSV / PDF icons with tooltips).
- Minimal decorative animation here — GSAP limited to subtle panel transitions and modal open/close (fast, `duration: 0.2–0.3s`) to keep the admin experience snappy, not showy.
- Login screen (`/control`) is intentionally plain/neutral (no public branding hints, no 3D hero) with a two-step form: Email → OTP, countdown timer for OTP resend, clear error states.

---

## 6. 3D & Animation Usage Guidelines

- **Library**: `@react-three/fiber` + `@react-three/drei` for hero scenes, floating icons, or an interactive "idea bulb" element on the Ideas page.
- **Performance budget**: 3D scenes lazy-loaded (`React.lazy`/`Suspense`), capped at a reasonable poly count, `dpr` capped at `[1, 2]`, paused when off-screen (`IntersectionObserver`).
- **Accessibility**: respect `prefers-reduced-motion` — disable auto-rotation/parallax and heavy GSAP timelines for users who request reduced motion; provide a static fallback image/gradient instead of the 3D canvas if needed.
- **GSAP usage patterns**:
  - Page transitions: fade/slide between routes (`0.3–0.5s`).
  - Scroll reveals: `ScrollTrigger` with `once: true` for performance (avoid infinite triggers).
  - Micro-interactions: button hover scale (`1.05`), card lift, nav underline slide.
  - Avoid excessive bounce/elastic easing — keep motion confident and minimal (`power2`/`power3` easing family) to match the "professional" tone.

---

## 7. Component Library Notes

- Build a small internal **UI kit** (`components/ui/`) — `Button`, `Card`, `Badge`, `Input`, `Select`, `Modal`, `Toast`, `Table`, `Tabs`, `ThemeToggle` — all theme-aware via Tailwind's `dark:` variant and the color tokens in §2.
- `ThemeToggle`: animated sun/moon icon swap (GSAP or CSS transition), accessible (`aria-pressed`, keyboard operable).
- All interactive elements meet WCAG AA contrast in **both** themes — verify token pairs (e.g., `text-primary` on `bg-primary`) with a contrast checker before finalizing.

---

## 8. Design Tokens Summary (for Tailwind config)

```js
// tailwind.config.js (excerpt)
theme: {
  extend: {
    colors: {
      bg: { primary: 'var(--bg-primary)', secondary: 'var(--bg-secondary)', card: 'var(--bg-card)' },
      text: { primary: 'var(--text-primary)', secondary: 'var(--text-secondary)' },
      brand: { primary: 'var(--brand-primary)', secondary: 'var(--brand-secondary)', accent: 'var(--brand-accent)' },
      state: { success: 'var(--success)', warning: 'var(--warning)', danger: 'var(--danger)' },
      border: 'var(--border)',
    },
    fontFamily: {
      heading: ['Poppins', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
      mono: ['Space Grotesk', 'sans-serif'],
    },
    borderRadius: { card: '1rem' },
  },
},
darkMode: 'class',
```
