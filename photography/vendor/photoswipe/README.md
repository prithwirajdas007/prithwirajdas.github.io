# PhotoSwipe (vendored)

Version 5.4.4, MIT licensed. Copied from the npm package `photoswipe@5.4.4`,
`dist/` only. No CDN, no build step.

Files kept:

| File | Purpose |
| --- | --- |
| `photoswipe-lightbox.esm.min.js` | Entry point, imported by `gallery.js` |
| `photoswipe.esm.min.js` | Core, loaded on demand via `pswpModule` |
| `photoswipe.css` | Lightbox styles |
| `LICENSE` | Upstream MIT licence |

To move to a newer version:

```bash
npm pack photoswipe@<version>
```

Extract those same four files over this directory, then re-check the lightbox:
open a photo, arrow between photos, press Escape, and confirm the caption still
renders. The caption element is registered by `gallery.js`, not by PhotoSwipe,
so it is the part most likely to need attention after an upgrade.
