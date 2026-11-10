# Crave-Kartel storefront (Next.js 14 · Tailwind · Framer Motion · Firebase)

## Run
```
npm install
cp .env.example .env.local   # fill Firebase values
npm run dev                  # npm run build to verify production build
```
The site works without Firebase (defaults from the reference site, WhatsApp checkout). Firebase adds saved orders, admin and editable settings.

## Firebase
1. Create a project, enable **Authentication > Email/Password** and **Firestore**.
2. Copy web app config into `.env.local` (`NEXT_PUBLIC_FIREBASE_*`).
3. Publish `firestore.rules` (Firestore > Rules).
4. Admin: create a user in Authentication > Users, copy its UID, then in Firestore create document `admins/<UID>` (any field, e.g. `role: "admin"`). Only these users can read orders or change settings.

## Hero video
Upload an optimized MP4 (H.264, ≤1080p, ≤8 MB, no audio) or WebM to any host/CDN you own or are licensed to use, then paste its URL in Admin > Hero video URL. Without a URL, or with reduced-motion, the poster image shows. No video file is bundled.

## Pixels
Admin > settings: Meta Pixel ID, GA4 `G-…`, Google Ads `AW-…` + label, TikTok ID. IDs are validated; scripts load only after visitor consent and never twice. Tracked: PageView, ViewContent, AddToCart, InitiateCheckout, Contact (WhatsApp). Purchase is deliberately not fired from the browser; add it from a verified, admin-confirmed order.

## Deploy to Vercel
Push to Git, import in Vercel, add the env vars from `.env.example`, deploy. Add your Vercel domain to Firebase Auth > Authorized domains.

## Fonts
`app/layout.tsx` uses Noto Serif Bengali + Hind Siliguri as stand-ins. Replace with the reference fonts once confirmed.
