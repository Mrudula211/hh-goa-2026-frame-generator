# FrameInGoa — HH Goa 2026 Builder ID / Frame Generator

Upload a photo, get back a branded HH Goa 2026 graphic, download or post it to X — all in the browser, no signup, no backend. Built for the HH Goa 2026 shortlisting task.

**Live:** (https://hh-goa-2026-frame-generator-ten.vercel.app/)

## What it does

Two formats, either one satisfies the brief on its own — this project ships both:

- **Builder ID (Format B)** — an event-badge-style card: your photo inside the official Canva-designed ring, your name, stack/role, a randomly generated "builder title" (e.g. *The AI Architect*), and a unique card ID.
- **PFP Frame (Format A)** — a square profile-picture overlay: your photo wrapped in the HH Goa 2026 frame with a customizable message and handle.

## Required flow — how it's covered

| Requirement | Status |
|---|---|
| Upload a photo (JPG/PNG/HEIC, etc.) | JPG, PNG, WEBP, HEIC, HEIF — HEIC converted client-side via `heic2any` |
| Quick fields for Format B | Name, stack/role, builder title (with a one-click random generator) |
| Near-instant generation | Pure `<canvas>` rendering, no server round-trip |
| Download | Real PNG file via `canvas.toBlob` |
| Share to X, pre-filled caption + `#FrameInGoa` | Mobile: Web Share API attaches the actual generated image automatically. Desktop: downloads the PNG and opens a pre-filled X compose window (see [Known limitation](#known-limitation-desktop-share)) |
| No login/signup gate | None anywhere in the flow |
| Handles real photos (portrait/landscape/off-centre/any aspect ratio) | Cover-fit crop, no manual cropping required |
| Mobile-friendly | Responsive layout, and the share flow is fully automatic on phones |

## How the Builder ID card works

The card isn't redrawn from scratch in code — it's the actual Canva export.

`assets/id-template.png` is the official HH Goa 2026 Canva design with a transparent circle cut exactly where the photo goes. At render time, `app.js`:

1. Clips the uploaded photo (cover-fit) into that circle.
2. Draws the real Canva artwork on top — ring, badges, illustrations, labels — so it sits pixel-perfect over the photo.
3. Draws the dynamic text (name, stack/role, builder title, generated card ID) into the exact slots measured off the original export.

The rest of the site (header, hero, panels, buttons, footer) is original CSS/SVG built to match that same palette and bold-outline "sticker" look — no raster cutouts, so nothing breaks against different backgrounds or screen widths.

## Tech stack

Vanilla HTML/CSS/JS. No framework, no build step, no dependencies beyond one CDN script (`heic2any`, loaded only when a HEIC file is uploaded) and Google Fonts.

```
index.html               Markup + inline SVG icons
styles.css               All styling (CSS custom properties for the palette)
app.js                   Canvas rendering, upload handling, download/share
favicon.svg              Site favicon
assets/id-template.png   Canva export with the photo-hole cut out
package.json             Just a `python -m http.server` convenience script
```

## Run locally

Open `index.html` directly in a browser, or serve it:

```bash
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Known limitation: desktop share

Browsers don't let a webpage programmatically attach a local file to X's web-intent URL, and a purely static site can't generate a unique per-image Open Graph preview without a backend. So:

- **On phones** (the primary use case per the brief), Share to X uses the Web Share API and passes the actual generated PNG straight into the native share sheet — fully automatic.
- **On desktop**, the button downloads the PNG and opens X's compose window with the caption and hashtag ready; the user drags the downloaded file in manually.

A fully automatic desktop flow would need a small serverless function to generate and host a per-image OG preview — happy to add that if there's time before the deadline.

## Branding

Palette pulled from the official HH Goa 2026 Canva design: Goa Green `#0B6839`, Sun Yellow `#FEE101`, Hot Pink `#FF0080`, Warm Cream `#FFFBE8`, and Dark Forest Green `#084E2B` for outlines/text-on-light, plus white and near-black neutrals. Editorial serif typography and the 28–31 Oct 2026 event dates carry through both formats and the site chrome.

Official event site: https://hhgoa.com/
