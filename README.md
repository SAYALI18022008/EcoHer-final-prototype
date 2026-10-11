# EcoHer — Growth Platform for Women-Led Sustainable Businesses

## Project description

EcoHer is a responsive web application concept designed to help women-led sustainable businesses become easier to discover, build trust with customers, and grow with practical community support. It brings business discovery, mentorship, verification information, and impact reporting together in one website.

The experience is organized around three roles—entrepreneurs, customers, and mentors. Entrepreneurs can create a profile for their business, manage products, submit verification information, record impact updates, and request mentorship. Customers can discover and filter businesses, save profiles, and record product or contact requests. Mentors can maintain a skills profile and review mentorship activity.

EcoHer uses example businesses and sample impact figures to demonstrate the interface. Sample information is illustrative and should not be treated as independently verified claims.

## Main features

- **Three roles only:** Entrepreneur, Mentor and Customer, each with its own dashboard. Registration asks for role-specific fields and validates email, mobile number, password length and password confirmation.
- **Guarded navigation:** dashboards check the logged-in role. Opening another role's dashboard by URL redirects to your own dashboard, and logged-out users are sent to the login page.
- **Entrepreneur dashboard:** overview, business profile (story, materials, packaging, women supported, image), products (add/edit/delete with ₹ prices and stock), finance (sales, expenses, revenue, estimated profit, chart, low-stock warnings), verification, impact records, mentor matching, AI Business Coach and security & privacy settings.
- **Transparent sustainability verification:** each new product opens a verification form. Statuses move through Information Submitted → Basic Review Pending → Community Review Pending → Partner Verification Pending → Verification Approved (demo). Approval needs an explicit simulated review and is never presented as real certification.
- **AI Business Coach (rule-based):** suggested questions, chat history, clear chat and a fallback for unknown questions. Answers use your saved business, products, prices, stock and finance records. It is not a real AI model and needs no API key.
- **Mentor dashboard:** incoming requests with accept/decline, accepted mentees, guidance notes, history and an editable profile (expertise, years, languages, availability). Matching considers expertise, city, language and availability.
- **Customer marketplace:** realistic demo listings from Pune, Mumbai, Nashik, Nagpur, Kolhapur, Bengaluru, Jaipur, Ahmedabad and Delhi; filters by name, city, state, category, sustainability type, verification status and price; product details with verification; favourites; cart; simulated checkout and demo order history. No payment details are collected.
- **Languages:** English, हिंदी and मराठी. Switching updates the visible UI immediately, keeps the current page and form input, and is remembered after refresh.
- **Impact tracking:** products sold (from sale records), reusable packaging, waste reused, women supported and local suppliers, with units, calculation notes and "estimated" labels. No carbon-saving claims.
- **Browser-local persistence:** accounts, session, language, businesses, products, verification, finance, mentorship, cart, favourites, orders, security settings and coach chat are stored under separate `ecoher.v2.*` localStorage keys, scoped to the relevant user, and malformed data is ignored safely.

## Technology

- HTML, CSS, and JavaScript
- Vite development server and production build
- Browser local storage for demo accounts and saved data
- No Supabase project, API key, external authentication provider, or hosted database is required

## Getting started

### Requirements

Install a current version of [Node.js](https://nodejs.org/), which includes npm.

### Install and run

Open a terminal in the project directory and run:

```sh
npm install
npm run dev
```

Vite prints a local address, usually `http://localhost:5173`. Open that address in a browser. Do not open `index.html` directly using a `file://` URL; the development server is needed to serve the website correctly.

### Production build

To create an optimized static build, run:

```sh
npm run build
```

Vite writes the deployable website to the `dist/` folder. To preview the build locally, run:

```sh
npm run preview
```

## Account and data behavior

Accounts are local to the browser and device where they are created. Use that same browser to log in again. The demo does not send account information to a server, so accounts cannot be shared across devices, recovered through email, or used for real multi-user collaboration. Clearing browser data may remove locally saved accounts and changes.

This local authentication is provided for demonstration and classroom/project submission use. It is not a substitute for secure production authentication or a server-side database. Do not use real passwords or store sensitive personal information in the demo.

## Testing

An end-to-end Playwright script covers the six required flows (entrepreneur, mentor, customer, language switching, refresh persistence and role guards) and fails on any browser console error.

```sh
npx playwright install chromium   # first time only
npm run dev                        # in one terminal
npm run test:e2e                   # in another terminal
```

Set `BASE_URL` if the dev server runs on a different address.

## Project files

- `index.html` — Vite entry page.
- `src/main.js` — routing, role guards, rendering and event handling.
- `src/store.js` — safe, namespaced localStorage helpers.
- `src/auth.js` — registration, login, logout and session.
- `src/pages/` — public pages and the entrepreneur, mentor and customer dashboards.
- `src/verification.js`, `src/coach.js` — verification flow and rule-based coach.
- `src/i18n.js`, `src/locales/` — translation helper and Hindi/Marathi dictionaries.
- `src/styles/` — base and application styles.
- `public/images/` — local photographs (see `CREDITS.md`).
- `tests/e2e.mjs` — end-to-end browser checks.

## Suggested GitHub description

**EcoHer is a local-first web platform concept that helps people discover women-led sustainable businesses and gives entrepreneurs tools for visibility, mentorship, verification, and impact tracking.**
