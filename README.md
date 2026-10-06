# EcoHer — Growth Platform for Women-Led Sustainable Businesses

## Project description

EcoHer is a responsive web application concept designed to help women-led sustainable businesses become easier to discover, build trust with customers, and grow with practical community support. It brings business discovery, mentorship, verification information, and impact reporting together in one website.

The experience is organized around three roles—entrepreneurs, customers, and mentors. Entrepreneurs can create a profile for their business, manage products, submit verification information, record impact updates, and request mentorship. Customers can discover and filter businesses, save profiles, and record product or contact requests. Mentors can maintain a skills profile and review mentorship activity.

EcoHer uses example businesses and sample impact figures to demonstrate the interface. Sample information is illustrative and should not be treated as independently verified claims.

## Main features

- **Responsive home page:** introduces EcoHer and links to discovery, mentorship, and impact information.
- **Business discovery:** browse women-led businesses and filter by search term, location, category, sustainability focus, and verification label.
- **Business profiles:** view founder stories, products, materials, production details, verification information, and impact highlights.
- **Local accounts:** create an account and log back in with the same email and password in the same browser.
- **Role-based workspaces:** select the entrepreneur, customer, or mentor experience when creating an account; demo workspaces are also available from the login page.
- **Entrepreneur tools:** edit business details, add product entries, submit verification notes, record estimated impact, and request a mentor.
- **Customer tools:** save business profiles and record contact or product requests.
- **Mentor tools:** edit skills, languages, and availability; respond to mentorship requests in the demo interface.
- **Browser-local persistence:** supported account and feature data is saved in the browser using local storage, so it remains available on that browser after refresh.

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

## Project files

- `index.html` — application interface, styles, sample data, local account flow, and feature interactions.
- `package.json` — project metadata and Vite commands.
- `.gitignore` — excludes generated build output, local dependencies, and local environment files.
- `README.md` — project overview and run instructions.

## Suggested GitHub description

**EcoHer is a local-first web platform concept that helps people discover women-led sustainable businesses and gives entrepreneurs tools for visibility, mentorship, verification, and impact tracking.**
