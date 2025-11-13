# Project-X

Project-X is a small full-stack application containing:

- A Node/Express backend (under `backend/`) which uses Firebase Admin (Firestore), Supabase utilities, Cloudinary and Razorpay for payments.
- A React frontend (under `frontend/projectx/`) created with Create React App.

This README explains how to run the app locally on Windows PowerShell, what configuration is required, and where to look in the codebase.

## Project description
Project-X is a personal storefront that showcases and sells projects (digital products).

Primary features and flows:

- A catalogue of the author's projects with details, images, and downloadable assets.
- A purchase flow: users select a project, create an order, and complete payment (handled by Razorpay on the backend).
- After successful purchase, buyers receive access to downloadable assets or a delivery link (assets/media handled via Cloudinary and/or Drive integrations in `Utils/`).
- Firestore (Firebase Admin) is used as the main data store for projects, purchases, and user-related metadata; Supabase helpers exist for additional storage or operations.

This README assumes the codebase implements a single-owner storefront (your projects). If you'd like different wording (for example: commercial store, portfolio shop, or a course/paywall site), provide a short blurb and I'll update the description to match your preferred phrasing.

## Repository layout

- `backend/` — Express API server
	- `server.js` — application entry
	- `Routes/` — express route handlers (projects, purchases, otp, createorder)
	- `models/` — Mongoose-like or schema files used by the app
	- `Utils/` — helpers for Cloudinary, Drive, Supabase, email, etc.
	- `firebase/serviceAccountKey.json` — Firebase admin key (kept in repo in this workspace; in production, use secret storage)

- `frontend/projectx/` — React single-page app
	- `src/` — React source files
	- `public/` — static assets and manifest

## Tech stack

- Backend: Node.js, Express, Firebase Admin (Firestore), Supabase client, Cloudinary, Razorpay, Nodemailer
- Frontend: React (Create React App), axios, react-router-dom

## Requirements

- Node.js (v16+ recommended)
- npm

## Environment and configuration

Backend expects configuration via environment variables and service credentials. The project already contains a Firebase service account at `backend/firebase/serviceAccountKey.json`. For local development you should also create a `.env` file in `backend/` including any keys used by `backend/Utils/*.js`.

Common environment variables to set (example names based on utils in repo):

- `PORT` — port for backend server (defaults to 5000)
- `SUPABASE_URL` and `SUPABASE_KEY` — if Supabase is used
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — for Cloudinary uploads
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — for Razorpay payments
- `EMAIL_HOST`, `EMAIL_PORT`, `EMAIL_USER`, `EMAIL_PASS` — for Nodemailer email sending

Note: The Firebase Admin SDK in `backend/firebase.js` reads `backend/firebase/serviceAccountKey.json` directly. In production you should store this in a secrets manager and not commit it to version control.

## Run locally (PowerShell)

Open PowerShell and run the backend and frontend in separate shells.

Backend

```powershell
cd .\backend
npm install
# start the server
# if you prefer, run: node .\server.js
node .\server.js
```

Frontend

```powershell
cd .\frontend\projectx
npm install
npm start
```

The backend listens on the port set in `PORT` or 5000 by default. The frontend dev server runs on the port Create React App chooses (usually 3000).

## Important files to inspect

- `backend/server.js` — Express app wiring and route mounting
- `backend/firebase.js` — initializes Firebase Admin (Firestore) with `serviceAccountKey.json`
- `backend/Utils/supabase.js` — supabase client helper (if used)
- `frontend/projectx/src/` — frontend React components and pages

## Notes on scripts

- The frontend `package.json` (in `frontend/projectx/`) exposes standard CRA scripts: `start`, `build`, `test`.
- The backend in this repo is launched via `node server.js` — there is no `start` script in `backend/package.json` in the current workspace; you can add one if you'd like:

```json
{
	"scripts": {
		"start": "node server.js"
	}
}
```

## Next steps / suggestions

- Add a `.env.example` in `backend/` listing required env variables so contributors know what to set.
- Add a `start` script to `backend/package.json` and consider using `nodemon` for development.
- Move secrets to environment variables or a secrets manager before publishing the repository.

## Where to get help

If you need specifics about an endpoint, open the files under `backend/Routes/` (for example `Routes/purchases.js`) to see how routes work and what request bodies are expected.

---

If you'd like, I can:

- generate a `.env.example` with the env keys referenced above,
- add a `start` script to `backend/package.json`, or
- document a few endpoints with examples in this README.

Tell me which of those you'd like next.
