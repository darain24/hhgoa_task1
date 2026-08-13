# Frame in Goa — HH Goa 2026 Builder Frames

Turn any photo into a personalized **Hackers House Goa 2026** builder badge in seconds.

**Live site:** [https://hhgoa-task1-xi.vercel.app/](https://hhgoa-task1-xi.vercel.app/)

No signup. No crop anxiety. Upload a photo, fill in your details, download a PNG, or share a pre-filled post on X.

---

## What it does

**Frame in Goa** is a client-side frame generator for HH Goa 2026. Everything runs in the browser — photos never leave the user’s device.

Builders can create:

| Format | Output size | Description |
| --- | --- | --- |
| **Builder ID** | `1600 × 1000` landscape | Full event ID card with photo, name, stack, team, and optional social handle |
| **PFP Frame** | `1080 × 1080` square | Profile-picture style frame with name, stack/role, team, and optional social |
| **Squad Frame** | `1080 × 1080` square | Triptych for up to **3** teammates |

---

## Features

### Builder ID designs

Choose from two themed layouts:

1. **Coastal Classic** — cream badge, hibiscus corners, stamp seal  
2. **Goa Horizon** — sunset header band, open cream body, clear typography  

### Personalization

- Upload JPG, PNG, WebP, or iPhone **HEIC/HEIF** photos  
- Smart face-aware crop when the browser supports `FaceDetector`  
- Fields: name, stack/role, team name  
- Optional social handle (shown on Builder ID and PFP when provided)  
- Live canvas preview updates as you type  

### Export & share

- **Download PNG** — exports the current frame  
- **Share to X** — opens X with a short drafted post including:
  - Builder name  
  - Generated Builder ID (`#HH-GOA-{TEAM}-{code}`)  
  - Live site link  
  - `#FrameInGoa` / `#HHGoa2026`  
- Share does **not** auto-download the image  

### Validation

Download and Share require details first. If something is missing, a popup appears and no action runs.

**Builder ID / PFP require:** photo, name, stack/role, team name  

**Squad requires:** at least one photo, squad name, member names  

Social handle is always optional.

---

## Tech stack

- [Next.js](https://nextjs.org/) (App Router)  
- React 19 + TypeScript  
- Tailwind CSS v4 (PostCSS)  
- Canvas 2D for frame rendering  
- [heic2any](https://github.com/alexcorvi/heic2any) for HEIC conversion  
- Google fonts: **Imbue** + **Victor Mono**  
- Deployed on [Vercel](https://vercel.com/)  

---

## Project structure

```text
hhgoa_task1/
├── app/
│   ├── layout.tsx      # Root layout, fonts, metadata / OG
│   ├── page.tsx        # Generator UI + canvas drawing
│   └── globals.css     # Theme, layout, floral accents, popup
├── types/
│   └── heic2any.d.ts
├── tests/
│   └── project.test.mjs
├── public/             # favicon, OG image assets (as present)
├── next.config.ts
├── vercel.json
└── package.json
```

Almost all product logic lives in `app/page.tsx` (modes, designs, canvas drawing, download/share, validation).

---

## Getting started

### Requirements

- **Node.js 20.9+**  
- npm (comes with Node)

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

---

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start local development server |
| `npm run build` | Create production build |
| `npm start` | Serve the production build |
| `npm test` | Run project capability / structure tests |
| `npm run lint` | Run ESLint |

---

## How to use the site

1. Pick a format: **Builder ID**, **PFP Frame**, or **Squad Frame**  
2. For Builder ID, choose **Coastal Classic** or **Goa Horizon**  
3. Upload a photo (or up to three for Squad)  
4. Fill required details  
5. Preview the live canvas  
6. **Download PNG**, or **Share to X** for a ready draft  

---

## Privacy

- Photo processing and PNG export happen **entirely in the browser**  
- Uploaded images are **not** uploaded to a backend for generation  
- HEIC conversion also runs client-side via `heic2any`  

---

## Deploy on Vercel

1. Import this repository into Vercel  
2. Framework should detect as **Next.js**  
3. No environment variables are required for the core generator  

If reusing an old Vercel project from another framework:

- Set **Root Directory** to `./`  
- Clear custom Build Command / Output Directory overrides  

`vercel.json` pins Next.js and keeps the framework-managed output directory.

**Current deployment:** [https://hhgoa-task1-xi.vercel.app/](https://hhgoa-task1-xi.vercel.app/)

---

## Brand & design notes

Color system used across the UI and frames:

| Token | Hex | Role |
| --- | --- | --- |
| Ink / green | `#0b6839` | Headers, borders, primary text |
| Cream | `#fffbe8` | Backgrounds, card body |
| Yellow | `#fee101` | Accents, stamps, CTAs |
| Pink | `#ff0080` | Highlights, badges, shadows |

The site uses tropical / Goa-inspired floral accents while keeping type readable on ID cards.

---

## Testing

```bash
npm test
```

Tests assert that core capabilities remain present (modes, photo slots, HEIC support, X intent URL, brand colors, Vercel/Next setup).

---

## License / event context

Built for **Hackers House Goa 2026** builders — ship, share, and frame your Goa story with `#FrameInGoa`.
