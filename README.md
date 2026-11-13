# Lumi UI

Lightweight Svelte 5 components with Lumen: crisp surfaces, consistent semantic tokens and **English + Spanish built in**. SSR-first, accessible, and small enough for SEO-critical storefronts — a page pays only for the components and icons it renders.

```bash
pnpm add @lumi-ui/svelte
```

```svelte
<script lang="ts">
	import Search from '@lucide/svelte/icons/search';
	import { Button, Card, Input } from '@lumi-ui/svelte';
	import '@lumi-ui/svelte/styles';
</script>

<Card title="Profile" spaced>
	<Input label="Display name" icon={Search} clearable />
	<Button variant="filled" href="/profile">Save</Button>
</Card>
```

## Why Lumi

- **Light by construction.** No runtime theme provider, no CSS-in-JS, no icon registry unless you ask for one. A `Button` is 2.6 KB gzip with its CSS, a `Tooltip` 4.1 KB, and the global stylesheet 7.4 KB, which splits further for lean pages. Overlays position themselves with no third-party engine.
- **Bilingual.** English by default; one line switches every built-in label, placeholder and `Intl` format to Spanish (`setLumiLocale`). Unused copy never reaches the bundle.
- **Platform first.** Real links (`Button href`, crawlable `Pagination`), `<ul>`/`<hr>` semantics, cascade layers so your CSS wins, container queries, `inert`, native date inputs — less JavaScript, better SEO.
- **One recipe per role.** Fields, switchers, spinners and skeletons share global recipes, so every control looks and behaves like its peers in light and dark mode.

## Language

```svelte
<script lang="ts">
	import { lumiEs, setLumiLocale } from '@lumi-ui/svelte';

	setLumiLocale({
		locale: 'es-PE',
		currency: 'PEN',
		timeZone: 'America/Lima',
		messages: lumiEs
	});
</script>
```

Explicit props (`placeholder`, `closeLabel`, …) always win. Details: [Guide §1](./docs/GUIDE.md#language-and-formatting).

## Entry Points

| Import                                          | Purpose                                                                   |
| ----------------------------------------------- | ------------------------------------------------------------------------- |
| `@lumi-ui/svelte`                               | Components, types, locale API, formatters, icon registry API, `portal`    |
| `@lumi-ui/svelte/icons`                         | Optional curated `lumiIcons` map for string icon names                    |
| `@lumi-ui/svelte/drive`                         | Pure Drive helpers, types and Drive copy                                  |
| `@lumi-ui/svelte/color-scheme`                  | Optional light/dark/system controller and pre-paint script                |
| `@lumi-ui/svelte/styles`                        | Tokens + core (base, layout, utilities), import once                      |
| `@lumi-ui/svelte/styles/{tokens.base,base}.css` | Minimum for pages that only render components                             |
| `@lumi-ui/svelte/styles/{layout,utilities}.css` | App shells / composition helpers, when the markup uses them               |
| `@lumi-ui/svelte/styles/patterns.css`           | Opt-in operative compositions (filter summaries, toolbars, metric lists…) |

Brand seeds and color scheme: [Guide §3](./docs/GUIDE.md#3-theming-and-color-scheme). Lean loading for public pages: [Guide §1](./docs/GUIDE.md#load-styles-once).

## Documentation

| Document                                                 | Covers                                                                   |
| -------------------------------------------------------- | ------------------------------------------------------------------------ |
| **[Guide](./docs/GUIDE.md)**                             | Install, styles, icons, language, theming, layouts, CSS, design, release |
| **[Components](./docs/COMPONENTS.md)**                   | Component catalog and selection                                          |
| **[Component authoring](./docs/COMPONENT_AUTHORING.md)** | How to build or change a component                                       |
| **[Consumer reference](./docs/CONSUMER_REFERENCE.md)**   | Compact product integration recipes                                      |
| **[Upgrade](./docs/UPGRADE.md)**                         | Current 1.x → 2.0 migration and archived earlier guides                  |
| **[Reviews](./docs/REFACTOR_REVIEW.md)**                 | Release changes and the evidence behind them                             |
| **[AGENTS.md](./AGENTS.md)**                             | Agent rules → [Agent Guide](./docs/AGENT_GUIDE.md)                       |

Version 2.0 removes legacy glass and gradient tokens. Read the [2.0 migration guide](./docs/UPGRADE.md#1x--200) before updating consumer CSS.

## Lightweight Contract

Budgets match the 1.2.0 baseline on all 16 measured surfaces, including all exports. They are release gates: `pnpm run package && pnpm run size` re-measures them and fails over budget. Figures are **bytes gzip**, summing separately gzipped (level 9) JavaScript and component CSS from fully minified Vite 8 production ES bundles (Rolldown + Lightning CSS), with Svelte externalized. Measured **2026-11-13**, comparing the 1.2.0 baseline (`f9826b8`) with 2.0.0 under the same toolchain.

| Surface                                                                                     | 1.2.0 baseline |  2.0.0 |   Budget |
| ------------------------------------------------------------------------------------------- | -------------: | -----: | -------: |
| Global CSS `@lumi-ui/svelte/styles`                                                         |          7,691 |  7,390 |  ≤ 7,691 |
| Lean CSS `tokens.base.css` + `base.css`                                                     |          4,984 |  4,715 |  ≤ 4,984 |
| `Button`                                                                                    |          2,754 |  2,586 |  ≤ 2,754 |
| `Divider`                                                                                   |            966 |    966 |    ≤ 966 |
| `Tooltip`                                                                                   |          4,121 |  4,105 |  ≤ 4,121 |
| `Dropdown` + `DropdownItem`                                                                 |          5,560 |  5,474 |  ≤ 5,560 |
| `Select`                                                                                    |          8,751 |  8,691 |  ≤ 8,751 |
| `Tabs`                                                                                      |          3,197 |  3,081 |  ≤ 3,197 |
| `SegmentedControl`                                                                          |          2,872 |  2,760 |  ≤ 2,872 |
| `ToggleGroup`                                                                               |          3,021 |  2,905 |  ≤ 3,021 |
| `Skeleton`                                                                                  |          1,089 |  1,089 |  ≤ 1,089 |
| `Message`                                                                                   |          1,585 |  1,585 |  ≤ 1,585 |
| `MessageList`                                                                               |          3,070 |  3,070 |  ≤ 3,070 |
| Form/table: `Switch`, `Radio`, `Textarea`, `Checkbox`, `SegmentedControl`, `Input`, `Table` |         15,156 | 14,795 | ≤ 15,156 |
| Storefront: `Button`, `Card`, `Image`, `Chip`, `Input`, `Icon`, `Divider`                   |          9,776 |  9,471 |  ≤ 9,776 |
| All exports                                                                                 |         74,124 | 72,846 | ≤ 74,124 |

Every measured surface is equal to or smaller than the baseline. Global CSS drops **3.9%**, lean CSS **5.4%**, and the all-exports bundle **1.7%**. These are transfer-size measurements, not runtime speed claims.

The [browser benchmark](./docs/BENCHMARK.md) exercises 300 components in light and dark themes on the final source. Median mount/layout time is 12.0 → 12.2 ms in light and 12.1 → 12.2 ms in dark; median slider-update and unmount times are unchanged. Dark mount p95 increases by 1.3 ms and dark update p95 by 0.6 ms. These mixed results do not establish a runtime speedup; see the methodology and limits.

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

Runnable showcase: [`eliaschampi/lumi`](https://github.com/eliaschampi/lumi) ([live site](https://eliaschampi.github.io/lumi/)). Release checklist: [Guide §8](./docs/GUIDE.md#8-release-verification).

MIT licensed.
