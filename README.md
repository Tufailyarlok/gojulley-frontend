# GoJulley — Frontend

React + TypeScript (Vite) web app for **GoJulley**, a Ladakh trip-booking marketplace.
Backend API lives in a separate repo: **gojulley-backend**.

## Features
- Browse & filter listings (hotels / homestays / cars / bikes)
- Auth: signup → **email OTP verification** → login
- Book a listing (dates + quantity), pay via **Razorpay Checkout**
- "My bookings" with pay / cancel; admin page to add listings

## Stack
React 19 · TypeScript · Vite · React Router

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```
The dev server proxies `/api` to the backend at `http://localhost:8080`
(see `vite.config.ts`), so run **gojulley-backend** alongside it.

## Build
```bash
npm run build      # type-check + production build to dist/
```
