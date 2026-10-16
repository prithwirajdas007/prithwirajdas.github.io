# HANDOFF

Rolling state file. A new session reads `CLAUDE.md` then this, and starts work
without re-exploring the repo.

**Keep it short.** This file loads at the start of every coding session, so it
earns its length or it gets trimmed. One screen, max. Overwrite stale entries
rather than appending history — git already has the history.

---

## Current state

**Updated:** 2026-10-16
**Branch:** `claude/festive-mccarthy-6nsd9w`
**Live site:** deploys from `master` → `prithwirajdas.ca`

Added `CLAUDE.md` and this file as part of a context-architecture cleanup aimed
at cutting per-session token cost. No changes to `index.html`.

## In progress

Nothing open.

## Next up

- Nothing queued on the site itself.
- Pending outside this repo: trim installed skills/plugins on claude.ai (see the
  reduction list from the 2026-10-16 audit).

## Decisions worth remembering

- Stays dependency-free: no framework, no build step, no npm. Deliberate.
- Design tokens on `:root` are the only place colors and spacing are defined;
  every token needs a `[data-theme="dark"]` counterpart.
- `master` is the live branch. Netlify publishes it in ~30s, so never push there
  casually.
- Notion "Active Now" is the single tracker. Claude memory holds facts and
  pointers, not copies.

## Gotchas found the hard way

- "Bootstrap 3" and similar strings in `index.html` are skill *tags* in the
  content, not dependencies. Don't go looking for a package.
- The repo has 5 tracked files. If a search comes back empty, the thing genuinely
  isn't there — it isn't hidden in a subdirectory.

---

### How to update this file

At the end of a session, rewrite **Current state**, **In progress**, and
**Next up**. Add to **Decisions** or **Gotchas** only when something was learned
that would otherwise cost the next session real time to rediscover.
