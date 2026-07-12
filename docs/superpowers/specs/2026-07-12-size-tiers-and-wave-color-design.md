# Size tiers (s/m/l/xl) and wave color

Date: 2026-07-12

## Summary

Two additions to the rendered now-playing card:

1. Replace the `size: 'banner' | 'compact'` input with four tiers: `s | m | l | xl`. This is a **breaking change** — no aliases for the old values.
2. Add a `wave-color` input, independent of `accent-color`, that colors the waveform (l/xl) and equalizer bars (s/m). Defaults to whatever `accent-color` is set to, so existing configs render identically until a user opts in.

Building the mockups also surfaced a layout problem with the existing "YT Music" badge (it reserved a full-height column purely for itself, eating into title/artist width) — fixing that is part of this spec since the size tiers made it worse, not better.

## Size tiers

| Tier | Width×Height | Art size | Bottom row | Notes |
|---|---|---|---|---|
| `s` | 260×68 | 46 | equalizer + "NOW PLAYING" label | new; wider than a naive halving of `m` because the label needs room |
| `m` | 300×80 | 56 | equalizer + "NOW PLAYING" label | unchanged pixel-for-pixel from today's `compact` |
| `l` | 600×120 | 88 | waveform | unchanged pixel-for-pixel from today's `banner` |
| `xl` | 760×150 | 112 | waveform | new; title/artist font bumped to 23px/17px (vs 19px/14px on `l`) since the card is proportionally bigger |

`m` and `l` are deliberately identical to today's `compact`/`banner` in pixel output — only the size *names* change. `s` and `xl` are new tiers extending the range at both ends.

Per-tier layout constants (padding, gap, label font size) live in a `LAYOUT` table in `card.ts` rather than a boolean branch, since four tiers no longer fit a two-way split cleanly.

## Wave color

- New `wave-color` action input (and `RenderOptions.waveColor` field), defaulting to `accent-color`'s value if not explicitly set.
- Applies to both the waveform (`l`/`xl`) and the equalizer bars (`s`/`m`) — anywhere the old `accentColor` was used to color animated bars.
- `accent-color` continues to control the neon art style's glow ring, unaffected by this change.

## Badge layout (YT Music attribution)

Current behavior: the badge occupies a reserved vertical column on the right edge of the card at every size, whether or not anything else needs that space. This directly reduces available width for title/artist text (part of why marquee-scroll exists), and gets worse as tiers get smaller.

New behavior — badge moves to a top-right corner placement, sized per tier:

- **`s`, `m`**: icon-only, no "YT Music" text, ~35% opacity, positioned as a small corner watermark. Reserves *no* layout width — title, artist, and the equalizer row all use the full card width. These tiers don't have room for the text label without crowding.
- **`l`, `xl`**: full icon + "YT Music" text badge (same visual weight as today, ~55% opacity), also moved to the top-right corner instead of vertically centered on the right edge. Because it now sits at the same height as the title line (not spanning the full card height), only the **title** row reserves width for it (`badge width + 12px margin`) — artist and the waveform row below are clear of it and use the full card width.

This was validated against real rendered SVGs during design (mockups, not shipped code) — three layout alternatives were considered (icon-only column, badge folded into the bottom row, corner watermark) before landing on the corner placement with the s/m vs l/xl split above.

## Out of scope / explicit non-goals

- No backward-compat aliasing of `banner`→`l` / `compact`→`m`. Existing workflows pinning `size: banner` will break and need to update to `size: l`.
- No change to `accent-color`'s role for the neon art style.
- No change to art-style rendering logic (`vinylArt`, `cassetteArt`, `neonArt`, `vinylSleeveArt`, `staticArt`) — they already scale off `Dimensions.artSize` generically and need no tier-specific changes.

## Implementation notes

`src/render/types.ts`, `dimensions.ts`, `card.ts`, and `badge.ts` were prototyped directly during design (to render real mockups rather than wireframes) and already reflect the tables above. Remaining work for the implementation plan:

- `src/inputs.ts` / `action.yml`: update `size` default (`banner` → `l`, the closest equivalent) and enum documentation; add `wave-color` input defaulting to `accent-color`.
- Existing tests (`__tests__/render/card.test.ts`, `compactSizes.test.ts`, etc.) reference `banner`/`compact` and the old `RenderOptions` shape (missing `waveColor`) — need updating to the new tiers and to cover the badge placement/reservation rules above.
- `examples/*.svg` and the README's example table use `banner`/`compact` naming — need regenerating under the new tier names.
- `dist/index.js` needs rebuilding (`npm run build`) once source changes land.
