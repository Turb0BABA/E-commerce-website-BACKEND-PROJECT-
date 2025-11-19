# E-commerce Website

This repository contains a two-part e-commerce project with a `Backend/` (Node/Express) and `Frontend/` (Vite + React + Tailwind) folders.

Quick start:

1. Backend
   - cd `Backend`
   - `npm install`
   - set up `.env` (database, email, etc.)
   - `node server.js` or `npm start`

2. Frontend
   - cd `Frontend`
   - `npm install`
   - `npm run dev`

To push this project to GitHub, either:

- use `gh` CLI: `gh repo create e-commerce-website --public --source . --remote origin --push --confirm`
- or create a repo on github.com, then run:
  - `git remote add origin https://github.com/<username>/<repo>.git`
  - `git branch -M main`
  - `git push -u origin main`
