# RenUI

Lightweight Svelte 5 components with Lumen: crisp surfaces, consistent semantic tokens and **English + Spanish built in**. SSR-first, accessible, and small enough for SEO-critical storefronts — a page pays only for the components and icons it renders.

```bash
pnpm add @renui/svelte
```

```svelte
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { Button, Card, Input } from '@renui/svelte';
	import '@renui/svelte/styles';
</script>

<Card title="Profile" spaced>
	<Input label="Display name" icon={Search} clearable />
	<Button variant="filled" href="/profile">Save</Button>
</Card>
```

## Why RenUI

- **Light by construction.** No runtime theme provider, no CSS-in-JS, no icon registry unless you ask for one. A `Button` is 2.6 KB gzip with its CSS, a `Tooltip` 4.1 KB, and the global stylesheet 7.4 KB, which splits further for lean pages. Overlays position themselves with no third-party engine.
- **Bilingual.** English by default; one line switches every built-in label, placeholder and `Intl` format to Spanish (`setRenLocale`). Unused copy never reaches the bundle.
- **Platform first.** Real links (`Button href`, crawlable `Pagination`), `<ul>`/`<hr>` semantics, cascade layers so your CSS wins, container queries, `inert`, native date inputs — less JavaScript, better SEO.
- **One recipe per role.** Fields, switchers, spinners and skeletons share global recipes, so every control looks and behaves like its peers in light and dark mode.

## Language

```svelte
<script lang="ts">
	import { renEs, setRenLocale } from '@renui/svelte';

	setRenLocale({
		locale: 'es-PE',
		currency: 'PEN',
		timeZone: 'America/Lima',
		messages: renEs
	});
</script>
```

Explicit props (`placeholder`, `closeLabel`, …) always win. Details: [Guide §1](./docs/GUIDE.md#language-and-formatting).

## Entry Points

| Import                                        | Purpose                                                                   |
| --------------------------------------------- | ------------------------------------------------------------------------- |
| `@renui/svelte`                               | Components, types, locale API, formatters, icon registry API, `portal`    |
| `@renui/svelte/icons`                         | Optional curated `renIcons` map for string icon names                     |
| `@renui/svelte/drive`                         | Pure Drive helpers, types and Drive copy                                  |
| `@renui/svelte/color-scheme`                  | Optional light/dark/system controller and pre-paint script                |
| `@renui/svelte/styles`                        | Tokens + core (base, layout, utilities), import once                      |
| `@renui/svelte/styles/{tokens.base,base}.css` | Minimum for pages that only render components                             |
| `@renui/svelte/styles/{layout,utilities}.css` | App shells / composition helpers, when the markup uses them               |
| `@renui/svelte/styles/patterns.css`           | Opt-in operative compositions (filter summaries, toolbars, metric lists…) |

Brand seeds and color scheme: [Guide §3](./docs/GUIDE.md#3-theming-and-color-scheme). Lean loading for public pages: [Guide §1](./docs/GUIDE.md#load-styles-once).

## Browser Support

Baseline 2024: Chrome and Edge 125+, Firefox 128+, Safari 18+ on macOS and iOS. Every color derives from CSS relative color syntax (`oklch(from …)`), so older engines are not supported.

## Documentation

| Document                                                 | Covers                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| **[Guide](./docs/GUIDE.md)**                             | Install, styles, icons, language, theming, layouts, CSS, design, release |
| **[Components](./docs/COMPONENTS.md)**                   | Component catalog and selection                                          |
| **[Component authoring](./docs/COMPONENT_AUTHORING.md)** | How to build or change a component                                       |
| **[Consumer reference](./docs/CONSUMER_REFERENCE.md)**   | Compact product integration recipes                                      |
| **[Upgrade](./docs/UPGRADE.md)**                         | Lumi UI 1.x → RenUI 2.0 migration and codemod                            |
| **[Reviews](./docs/REFACTOR_REVIEW.md)**                 | Release changes and the evidence behind them                             |
| **[AGENTS.md](./AGENTS.md)**                             | Agent rules → [Agent Guide](./docs/AGENT_GUIDE.md)                       |

RenUI was published as Lumi UI (`@lumi-ui/svelte`) until 1.2.1. Version 2.0 renames it and removes legacy glass and gradient tokens; the [2.0 migration guide](./docs/UPGRADE.md#1x--200) has a codemod that does both.

## Lightweight Contract

Budgets start from the 1.2.0 baseline on the 16 surfaces measured since then, including all exports, with a few bytes of headroom where gzip output varies across Node/zlib builds. `Loading` keeps its 2.0 size as its cap; surfaces new in 2.1.0 cap at their first measurement. They are release gates: `pnpm run package && pnpm run size` re-measures them and fails over budget. Figures are **bytes gzip**, summing separately gzipped (level 9) JavaScript and component CSS from fully minified Vite 8 production ES bundles (Rolldown + Lightning CSS), with Svelte externalized. Measured **2026-11-19** for 2.1.0.

| Surface                                                                                     | 1.2.0 baseline |  2.1.0 |   Budget |
| ------------------------------------------------------------------------------------------- | -------------: | -----: | -------: |
| Global CSS `@renui/svelte/styles`                                                           |          7,691 |  7,440 |  ≤ 7,691 |
| Lean CSS `tokens.base.css` + `base.css`                                                     |          4,984 |  4,787 |  ≤ 4,984 |
| `Button`                                                                                    |          2,754 |  2,580 |  ≤ 2,754 |
| `Divider`                                                                                   |            966 |    962 |    ≤ 976 |
| `Tooltip`                                                                                   |          4,121 |  4,050 |  ≤ 4,121 |
| `Dropdown` + `DropdownItem`                                                                 |          5,560 |  5,377 |  ≤ 5,560 |
| `Select`                                                                                    |          8,751 |  8,674 |  ≤ 8,751 |
| `Tabs`                                                                                      |          3,197 |  3,016 |  ≤ 3,197 |
| `SegmentedControl`                                                                          |          2,872 |  2,754 |  ≤ 2,872 |
| `ToggleGroup`                                                                               |          3,021 |  2,842 |  ≤ 3,021 |
| `Skeleton`                                                                                  |          1,089 |  1,003 |  ≤ 1,089 |
| `Loading` (2.0: 1,375)                                                                      |              — |  1,351 |  ≤ 1,375 |
| `Calendar` (new)                                                                            |              — |  5,460 |  ≤ 5,470 |
| `DatePicker` (new, includes `Calendar`)                                                     |              — | 10,699 | ≤ 10,710 |
| `TimePicker` (new, includes `Select`)                                                       |              — |  9,300 |  ≤ 9,310 |
| `Message`                                                                                   |          1,585 |  1,580 |  ≤ 1,585 |
| `MessageList`                                                                               |          3,070 |  3,055 |  ≤ 3,070 |
| Form/table: `Switch`, `Radio`, `Textarea`, `Checkbox`, `SegmentedControl`, `Input`, `Table` |         15,156 | 14,719 | ≤ 15,156 |
| Storefront: `Button`, `Card`, `Image`, `Chip`, `Input`, `Icon`, `Divider`                   |          9,776 |  9,368 |  ≤ 9,776 |
| All exports                                                                                 |         74,124 | 77,874 | ≤ 77,890 |

Reference output can differ by a few bytes across platforms and Node/zlib builds (`Divider` measures 962–968 B); budgets absorb that variance, not feature growth. Every surface measured in 1.2.0 is still equal to or smaller than its baseline. The all-exports bundle grows 5,202 B over 2.0.1 (72,672 B) for `Calendar`, `DatePicker` and `TimePicker`, so its cap moved to the 2.1.0 measurement; an app pays for them only when it imports them. These are transfer-size measurements, not runtime speed claims.

The [browser benchmark](./docs/BENCHMARK.md) exercises 300 components in light and dark themes after incorporating upstream 1.2.1 changes. Median mount/layout time is 11.9 → 11.9 ms in light and 12.1 → 11.9 ms in dark; median slider-update is 5.4 → 5.3 ms in light and unchanged in dark. Unmount medians are unchanged. Dark mount p95 increases by 0.1 ms and dark update p95 by 0.4 ms. These mixed results do not establish a universal runtime speedup; see the methodology and limits.

```bash
pnpm run package && pnpm run size
```

```bash
npm pack --dry-run --ignore-scripts --json
```

## Development

```bash
pnpm install --ignore-scripts
pnpm run lint && pnpm run check && pnpm run test && pnpm run package && pnpm run size
```

Runnable showcase: [`eliaschampi/renweb`](https://github.com/eliaschampi/renweb) ([live site](https://eliaschampi.github.io/renweb/)). Release checklist: [Guide §8](./docs/GUIDE.md#8-release-verification).

MIT licensed.
