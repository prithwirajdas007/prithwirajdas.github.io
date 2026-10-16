# CLAUDE.md — prithwirajdas.ca

Read this first. It replaces exploring the repo.

## What this is

Single-page personal portfolio for Prithwiraj Das (Lead Backend / Platform Engineer).
**Zero dependencies. No build step. No npm, no bundler, no framework.**
Any "Bootstrap 3" / "SQL Server" strings in the markup are skill *tags* in the
content, not dependencies.

## Entire file tree (5 tracked files)

```
index.html              # The whole site: HTML + <style> + <script>, ~42 KB
assets/images/profile.jpg   # Hero photo, renders as a 160px circle
favicon.svg
repo_README.md          # Hosting/deploy notes
.claude/settings.local.json
```

There is nothing else. Do not search for config, tests, or source directories —
they do not exist.

## Editing

Everything lives in `index.html`. Three regions, in order:

1. `<head>` — meta, Google Fonts (Newsreader / DM Sans / JetBrains Mono)
2. `<style>` — all CSS. Design tokens on `:root`, dark overrides on
   `[data-theme="dark"]`. **Change colors, spacing, radius, and max-width via
   the tokens, never with hard-coded values in rules.**
3. `<script>` — vanilla JS only: theme toggle + IntersectionObserver
   scroll-reveal. No libraries.

### Section ids (in document order)

`experience` · `skills` · `projects` · `writing` · `achievements` ·
`education` · `contact`

To edit one section, jump straight to its `<section id="...">` with
`grep -n 'id="projects"' index.html` and read only that range. Do not read the
whole file for a single-section change.

### Design tokens worth knowing

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#FAFAF7` | `#141413` |
| `--text-primary` | `#1A1A18` | `#E8E7E1` |
| `--accent` | `#2D5A3D` (green) | `#5FA978` |
| `--accent-warm` | `#8B6914` | `#C9A032` |
| `--max-w` | `860px` | — |

Any new color must be added as a token **and** given a dark-mode value.

## Conventions

- Keep it dependency-free. Do not introduce a framework, a build step, or a CDN
  script to solve a problem vanilla JS can handle.
- Theme must work in both modes. Check any visual change against
  `[data-theme="dark"]`.
- Responsive down to mobile. No horizontal scroll at phone width.
- Match the existing indentation (4 spaces) and the plain, unflashy voice of the
  surrounding copy.
- Prefer a targeted edit over regenerating `index.html`. Full rewrites of a
  42 KB file are expensive and lose hand-tuned detail.

## Deploy — read before pushing

| Layer | Service |
|---|---|
| Domain | Squarespace DNS → `prithwirajdas.ca` |
| Hosting | Netlify, auto-deploys on push to **`master`** |
| Source | `prithwirajdas007/prithwirajdas.github.io` |

**`master` is the live branch.** A push to `master` is live on the public site in
about 30 seconds. Work on a feature branch and let a human merge, unless they
explicitly ask you to push to `master`.

No tests, no linter, no CI. Verification is reading the diff and, if the change
is visual, loading `index.html` in a browser.

## Verifying a change

```bash
# Syntax sanity + a look at what changed
git diff --stat && git diff

# Serve locally if you need to see it
python3 -m http.server 8000   # then open http://localhost:8000
```

## Session hygiene

Finishing a work session? Update `HANDOFF.md` with what changed and what is next,
so the following session starts from that file instead of re-reading the repo.
