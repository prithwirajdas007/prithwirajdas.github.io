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
├── assets/
│   └── images/
│       └── profile.jpg     # Profile photo
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

To change the profile photo, replace `assets/images/profile.jpg` and push. The photo renders as a 160px circle in the hero section.

## Tech

- Pure HTML/CSS/JS — zero dependencies
- Google Fonts (Newsreader, DM Sans, JetBrains Mono)
- Dark/light theme toggle (respects system preference)
- Scroll-reveal animations (IntersectionObserver)
- Responsive down to mobile

## Last rebuilt

March 2026 — Complete rebuild replacing the old 3rd Wave Media Pillar template.
