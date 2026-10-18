# prithwirajdas.ca — Portfolio Site

Personal portfolio for Prithwiraj Das — Lead Backend / Platform Engineer.

## Hosting Setup

| Layer | Service | Details |
| --- | --- | --- |
| **Domain** | Squarespace | `prithwirajdas.ca` — DNS managed via Squarespace |
| **Hosting** | Netlify | Auto-deploys from this GitHub repo on push to `master` |
| **Source** | GitHub | `prithwirajdas007/prithwirajdas.github.io` |

## How it works

1. Push changes to `master` branch
2. Netlify detects the push and auto-deploys
3. `prithwirajdas.ca` serves the updated site (Squarespace DNS points to Netlify)

## File structure

```
├── index.html              # Single-page portfolio (no frameworks, no build step)
├── classic.html            # Backup of the previous design (March 2026), noindex
├── favicon.svg
├── assets/
│   └── images/
│       ├── profile-400.webp  # Photo used by index.html (400px, metadata stripped)
│       ├── profile-400.jpg   # Same photo for link previews (og:image)
│       └── profile.jpg       # Original photo, used by classic.html
└── README.md               # This file
```

## To update

Edit `index.html` directly. No build tools, no dependencies, no npm. Just HTML + CSS + vanilla JS.

```bash
git add .
git commit -m "Update portfolio"
git push
```

Netlify picks it up automatically. Live in ~30 seconds.

## Photo

To change the profile photo, export a square image, strip its metadata (it can contain GPS location), and save it as `assets/images/profile-400.webp` and `profile-400.jpg` at 400×400. It renders as a 180px circle in the hero.

## Tech

- Pure HTML/CSS/JS — zero dependencies, no web fonts (system font stack)
- Apple-style design, guided by the `apple-design` skill in `.claude/skills/`
- Auto / Light / Dark appearance control, applied before first paint
- Respects reduced motion, reduced transparency and increased contrast settings
- Scroll-reveal animations (IntersectionObserver), visible without JS
- Responsive down to mobile

## Last rebuilt

October 2026 — Apple-style redesign. The March 2026 design is kept at `classic.html` (prithwirajdas.ca/classic.html).

March 2026 — Complete rebuild replacing the old 3rd Wave Media Pillar template.
