# Upgrade

Consumer migration from **Lumi UI 1.x** (`@lumi-ui/svelte`) to **RenUI 2.0** (`@renui/svelte`). Use **pnpm** only. Source remains authoritative.

## 2.0 → 2.1.0

A minor release: no prop, token or entry point is removed or renamed.

- New: `DatePicker` (one date or a `range`), inline `Calendar`, and `TimePicker` (a `Select` of times). Values are `YYYY-MM-DD` / `HH:MM` strings, so native date and time inputs migrate without conversion. `DateRangeFilter` is unchanged.
- `Loading` draws a soft track with an arc that grows, shrinks and turns, instead of a ring around a pulsing dot. Props are unchanged; check screenshots that capture it.
- `Select` opens with its selected option centered in the list.
- `formatDate` returns `''` for an impossible date-only string such as `2026-02-31`; it used to roll over into the next month.
- New locale keys `datePlaceholder`, `dateRangePlaceholder`, `timePlaceholder`, `calendarPrevious`, `calendarNext`, `calendarMonth`, `calendarYear` ship in `renEs`. An app with its own complete `RenMessages` dictionary must add them.

## 1.x → 2.0.0

RenUI 2.0 is Lumi UI under a new name and a **breaking CSS release**. Component props and entry points are unchanged; names change, and applications that consume removed tokens must migrate. Lumen replaces decorative glass and gradient panels with opaque surfaces, shared tone roles, and a brand-tinted canvas. Its palette derives from CSS relative colors, which raises the [browser baseline](../README.md#browser-support) to Baseline 2024.

Includes the 1.2.1 fixes for narrow table pagination and scroll chaining. The current library targets left-to-right interfaces; RTL is not a supported contract.

### Rename

| Lumi UI 1.x                                                        | RenUI 2.0                                                        |
| ------------------------------------------------------------------ | ---------------------------------------------------------------- |
| `@lumi-ui/svelte` and its subpaths (`/styles`, `/icons`, …)        | `@renui/svelte`, same subpaths                                   |
| `--lumi-*` tokens, `.lumi-*` classes, `lumi.*` cascade layers      | `--ren-*`, `.ren-*`, `ren.*`                                     |
| `Lumi*`, `lumi*`, `LUMI_*` names (`LumiColor`, `useLumiLocale`, …) | `Ren*`, `ren*`, `REN_*` (`RenColor`, `useRenLocale`, `renEn`, …) |
| Default color-scheme storage key `lumi-color-scheme`               | `ren-color-scheme`: default-key preferences reset once           |

### Codemod

Run it from a RenUI checkout; RenUI's own source is the ground truth for which tokens exist, and its `package.json` for the version 1.x pins move to.

```bash
node scripts/migrate-2.0.mjs <app-dir>           # dry run: every change and problem
node scripts/migrate-2.0.mjs <app-dir> --write   # rewrite files and move renamed paths
pnpm install                                     # package.json now asks for @renui/svelte
```

The codemod works on the app's git files, tracked or untracked (lockfiles excluded), and is idempotent:

- stops before any write when a `package.json` pins `@lumi-ui/svelte` older than 1.x: upgrade to 1.2.1 first with the codemods at tag `v1.2.1`;
- renames the package, imports, tokens, classes, layers, TypeScript names, file names and prose, without touching words such as `Illuminate`, `luminous`, `Lumen` or `Lumière`;
- moves renamed files and folders (`git mv` when tracked) and never overwrites: an existing destination is an `error:`;
- rewrites reads of removed tokens that have a one-to-one replacement (table below);
- checks every `--ren-*` token the app reads against RenUI: `error:` marks undefined tokens and `lumi` leftovers, `manual:` marks app overrides of tokens RenUI no longer defines, `info:` lists `ren-*` classes RenUI does not define (app-owned or removed).

It exits 1 until no `error:` or `manual:` line remains. Then run the app's `svelte-check`, build and tests.

### Token migration

The following tokens are removed; replace their uses and remove obsolete overrides. These replacements express the new visual role, not a pixel-identical rendering of 1.2. Names use the 2.0 prefix, as the codemod reports them.

| Removed token(s)                                                                              | Replacement / action                                                                                                       | Codemod   |
| --------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------- | --------- |
| `--ren-control-radius`                                                                        | `--ren-radius-control`                                                                                                     | rewritten |
| `--ren-color-border-glass`                                                                    | `--ren-color-border`                                                                                                       | rewritten |
| `--ren-gradient-app`                                                                          | `--ren-color-background`                                                                                                   | rewritten |
| `--ren-gradient-card`, `--ren-gradient-card-hover`                                            | `--ren-color-surface-card`, `--ren-color-surface-card-hover`                                                               | rewritten |
| `--ren-floating-surface-bg`, `--ren-floating-surface-border`, `--ren-floating-surface-shadow` | `--ren-color-surface-raised`, `--ren-color-border`, `--ren-shadow-md`; custom floating overrides belong on `.ren-floating` | rewritten |
| `--ren-color-surface-glass`, `--ren-color-surface-glass-strong`                               | `--ren-color-surface` or `--ren-color-surface-raised`                                                                      | reported  |
| `--ren-color-primary-50`                                                                      | `--ren-color-primary-bg` for soft semantic containers                                                                      | reported  |
| `--ren-color-gray-400`                                                                        | `--ren-color-text-muted` for secondary content                                                                             | reported  |
| `--ren-gradient-subtle`, `--ren-gradient-glass-sidebar`, `--ren-gradient-sidebar-header`      | Choose the owning `--ren-color-surface-*` role                                                                             | reported  |
| `--ren-state-bg-strength`                                                                     | Semantic `--ren-color-{role}-bg`, or `.ren-tone` with `--ren-tone-soft` / `--ren-tone-strong`                              | reported  |
| `--ren-border-width-accent`                                                                   | Choose a token from the standard thin/base/thick border scale                                                              | reported  |
| `--ren-gradient-card-sheen`, `--ren-card-sheen-opacity`, `--ren-sidebar-header-veil`          | Remove decorative layers                                                                                                   | reported  |
| `--ren-app-background-accent`, `--ren-app-pattern-size`, `--ren-app-pattern-line-color`       | Remove canvas decoration; custom patterns belong to the consumer                                                           | reported  |
| `--ren-blur-sm`, `--ren-surface-saturation`                                                   | Remove default blur/saturation overrides; cards retain the optional `--ren-surface-blur-filter` hook                       | reported  |

Component-internal tokens were removed as well (for example `--ren-shadow`, `--ren-blur-md`, the `--ren-gradient-glass-*` panels, the progress track and stripe tokens, and the unused `--ren-metric-rank-value-color` hook). The codemod reports any the app still reads; choose the role that owns the surface.

### Shared tone roles

Use semantic `color` props as before. For consumer CSS, `.ren-tone` anchors the primary tone, and `.ren-tone--secondary`, `--success`, `--warning`, `--danger` or `--info` selects another role. Apply the base class to every element that changes accent; otherwise derived custom properties inherit the ancestor's resolved tone.

- `--ren-tone-soft`, `--ren-tone-strong`, `--ren-tone-ink`: containers and their text; theme planes are controlled by `--ren-tone-{soft,strong,ink}-lc`.
- `--ren-tone-beam`: directional value fill derived from the solid and the shared `--ren-sun` / `--ren-dusk` seeds.
- `--ren-color-hover`: neutral hover wash; reserve semantic color for meaning and selection.

Theme seeds remain the customization entry point. Tone planes preserve hue while normalizing lightness/chroma; validate custom seeds and plane overrides in both themes.

### Light and dark surface changes

Light borders now mix ink at 7% (standard) and 12% (strong), and `--ren-control-shadow` is `none`. Dark keeps 10% / 16% borders and its inset control shadow. Focus tokens and keyboard outlines are unchanged by this adjustment; do not remove the focus indicator when removing decorative shadows.

### Visual checks for consumers

Review light/dark forms, navigation, status messages, tables and overlays. Switchers now use a recessed track with a raised active pill. Alerts use a soft status surface; notifications use a raised neutral surface with a solid status icon. The `.ren-bg--glass` utility remains available but renders an opaque surface. Progress and Slider share the directional beam; reduced motion and semantic values remain in place.

Check keyboard focus, disabled/loading states and responsive layouts after replacing tokens. Compare production bundles using the same toolchain and fixture; a smaller bundle is not proof of faster rendering.

Migration notes for Lumi UI releases before 1.2.1 remain in the git history at tag `v1.2.1`.
