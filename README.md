# Laptop Repair Bishkek

A single-page landing site for a private laptop repair master in Bishkek.
The page presents services and pricing, a "why choose me" section, a
step-by-step process explainer, a lead request form, and contact details.
Submitted requests are stored in a local SQLite database via a small
Express API.

## Tech stack

- **Frontend:** static HTML5 + Tailwind CSS (via CDN) + vanilla JavaScript
  (`public/`)
- **Backend:** Node.js + Express, single `POST /api/requests` endpoint that
  validates and stores leads (`server/`)
- **Storage:** SQLite via `better-sqlite3`, file `data/requests.db` (created
  automatically on first run, not committed to git)

## Project structure

```
public/
├── index.html          # markup for all page sections
├── css/style.css        # color palette variables and custom styles
├── js/main.js           # form validation, fetch to the API, CONTACTS config
└── assets/               # icons

server/
├── server.js            # Express app: static files + POST /api/requests
└── db.js                 # SQLite initialization and schema

data/                     # runtime SQLite database (gitignored)
```

## Getting started

```bash
npm install
npm start
```

The server starts on `http://localhost:3000` by default. Set the `PORT`
environment variable to use a different port, e.g.:

```bash
PORT=4000 npm start
```

`npm run dev` runs the same entry point as `npm start`.

## API

| Method | Path             | Body                                             | Response                                                        |
|--------|------------------|---------------------------------------------------|------------------------------------------------------------------|
| POST   | `/api/requests`  | `{ name, phone, model, problem }` (JSON)          | `200 { ok: true, id }` on success, `400 { ok: false, error }` on invalid input |

Phone numbers must match `+996XXXXXXXXX` or `0XXXXXXXXX`.

## Placeholders

The business name, phone number, WhatsApp/Telegram links, address and all
service prices shown on the site are **placeholders** and must be replaced
with the real values before this site goes live. They live in one place
in `public/js/main.js` (the `CONTACTS` object) and in the services section
of `public/index.html`.
