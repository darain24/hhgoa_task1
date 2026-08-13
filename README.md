# Frame in Goa — HH Goa 2026 Builder Frames

Turn any photo into a personalized **Hackers House Goa 2026** builder badge — no signup, no server upload, just create, download, and share.

**Live site:** [https://hhgoa-task1-xi.vercel.app/](https://hhgoa-task1-xi.vercel.app/)

---

## What it is

Frame in Goa is a browser-based frame generator for builders attending (or hyping) **HH Goa 2026**. You upload a photo, add your details, pick a design, and export a share-ready PNG — or post straight to X with a pre-filled caption that promotes the app.

Everything runs **client-side**. Photos never leave the browser.

---

## Features

### Frame formats

| Format | Output | Description |
| --- | --- | --- |
| **Builder ID** | `1600 × 1000` PNG | Landscape ID card with photo, name, stack, team, and optional social handle |
| **PFP Frame** | `1080 × 1080` PNG | Square profile-style frame with name, stack, team, and optional social |
| **Squad Frame** | `1080 × 1080` PNG | Triptych for up to **3** teammates |

### Builder ID designs

Choose from two card designs in the dropdown:

1. **Coastal Classic** — Cream badge, hibiscus corners, stamp seal, green / yellow / pink HH Goa palette  
2. **Goa Horizon** — Sunset header band, open cream layout, clear typography, dark footer strip  

### Personalization

- Photo upload (JPG, PNG, WebP, iPhone **HEIC/HEIF**)
- Smart face-aware crop when the browser supports `FaceDetector`
- Name, stack / role, and team name
- Optional social handle (shown on Builder ID + PFP when provided; `@` added automatically if missing)
- Live canvas preview as you type

### Export & share

- **Download PNG** — saves the current frame locally  
- **Share to X** — opens a short pre-filled post with:
  - Builder name  
  - Generated builder ID (includes team slug + code), e.g. `#HH-GOA-SHIPSQUA-4821`  
  - Live app link: `https://hhgoa-task1-xi.vercel.app/`  
  - `#FrameInGoa` `#HHGoa2026`  
- Share does **not** auto-download the image (download separately if you want to attach the PNG)

### Validation

If you click **Download PNG** or **Share to X** without required details, a popup asks you to finish first. No download or share runs until:

- **Builder ID / PFP:** photo, name, stack / role, and team name  
- **Squad:** at least one photo, squad name, and member names  

Social handle remains optional.

---

## Tech stack

- **Next.js** (App Router) + **React 19** + **TypeScript**
- **Canvas 2D** for all frame rendering and PNG export
- **Tailwind CSS v4** (utility import) + custom CSS in `app/globals.css`
- **Google Fonts:** Imbue (display) + Victor Mono (UI / labels)
- **heic2any** for HEIC → JPEG conversion in the browser
- Deployed on **Vercel** (`vercel.json` locks framework to Next.js)

---

## Getting started

### Requirements

- Node.js **20.9+**
- npm

### Install & run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
npm run build
npm start
```

### Checks

```bash
npm test      # project capability / structure tests
npm run lint  # ESLint
npm run build # production compile
```

---

## How to use

1. Pick a format: **Builder ID**, **PFP Frame**, or **Squad Frame**.  
2. For Builder ID, choose **Coastal Classic** or **Goa Horizon**.  
3. Upload your photo (or up to three for Squad).  
4. Fill in your details. Social handle is optional.  
5. Preview updates live.  
6. **Download PNG** and/or **Share to X**.  
7. If sharing, attach the downloaded PNG to the X draft if you want the image in the post.

---

## Project structure

```text
hhgoa_task1/
├── app/
│   ├── layout.tsx      # Fonts, metadata, Open Graph
│   ├── page.tsx        # Generator UI + canvas drawing + share logic
│   └── globals.css     # Theme, layout, floral accents, popup styles
├── tests/
│   └── project.test.mjs
├── types/
│   └── heic2any.d.ts
├── public/             # Static assets (favicon, OG image, etc.)
├── package.json
├── next.config.ts
├── vercel.json
└── README.md
```

Most product logic lives in `app/page.tsx` (modes, designs, canvas draw functions, validation, X share caption).

---

## Brand & design notes

Palette used across UI and cards:

| Token | Hex | Role |
| --- | --- | --- |
| Ink / green | `#0b6839` | Headers, text, borders |
| Cream | `#fffbe8` | Backgrounds |
| Yellow | `#fee101` | Accents, stamps |
| Pink | `#ff0080` | Highlights, badges |

The site includes light floral / leaf decorations to match the Goa beach + builder theme without cluttering the first viewport or the card content.

---

## Privacy

- Photos are processed only in the browser (canvas + optional local HEIC conversion).  
- Nothing is uploaded to a backend for frame generation.  
- Clearing or leaving the page discards in-memory / blob URLs for uploaded images.

---

## Deploy to Vercel

1. Import this repository into Vercel.  
2. Framework should detect as **Next.js** (`vercel.json` sets `"framework": "nextjs"`).  
3. No environment variables are required for the generator.  
4. Build command: `npm run build` (default / as in `vercel.json`).

If the project previously used another framework:

- Set **Root Directory** to `./`  
- Clear custom **Build Command** / **Output Directory** overrides so Next.js manages output  

Current production URL:

[https://hhgoa-task1-xi.vercel.app/](https://hhgoa-task1-xi.vercel.app/)

---

## Scripts reference

| Script | Purpose |
| --- | --- |
| `npm run dev` | Local development server |
| `npm run build` | Production build |
| `npm start` | Serve production build |
| `npm test` | Node test suite for project requirements |
| `npm run lint` | ESLint |

---

## Hashtags

When sharing builder frames on X, the app encourages:

- `#FrameInGoa`
- `#HHGoa2026`

---

## License

Private project (`"private": true` in `package.json`). Adjust licensing here if you open-source or redistribute it.
