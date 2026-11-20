# Component Authoring Guide

How to add or change RenUI components so the library stays **beautiful, minimal, consistent, and professional**.

Read with: [GUIDE.md](./GUIDE.md) · [COMPONENTS.md](./COMPONENTS.md) · root [AGENTS.md](../AGENTS.md)

---

## 1. Before You Build

Run the [decision filter in GUIDE §7](./GUIDE.md#7-library-design) first: useful across products, already covered, semantic and domain-neutral, centralizes behavior, tokenizable, works across modes, smaller API than the detail it hides.

Then, for authoring specifically:

- Compose `Button`, `Icon`, `Card`, `Input`, etc. before adding a new primitive.
- Reusable but not primitive → do not force into `components/`; promote to a future `src/lib/patterns/` component layer only when proven in both products. Do not confuse that layer with `src/lib/styles/patterns.css`.
- If you cannot name every prop without product vocabulary, redesign the API.

---

## 2. Directory Skeleton

```txt
src/lib/components/MyComponent/
  MyComponent.svelte   # implementation + scoped styles
  types.ts             # public props & related types
  index.ts             # re-exports
```

Then wire the public API in `src/lib/index.ts` (component + types).

### `index.ts` template

```ts
export { default as MyComponent } from './MyComponent.svelte';
export type { MyComponentProps } from './types';
```

### `types.ts` template

```ts
import type { RenColor, RenControlSize } from '../config';

export interface MyComponentProps {
	/** Semantic color */
	color?: RenColor;
	/** Size on the shared scale */
	size?: RenControlSize;
	/** Visual style of this component */
	variant?: 'default' | 'soft' | 'outline';
	disabled?: boolean;
	loading?: boolean;
	/** Accessible name when needed */
	'aria-label'?: string;
	class?: string;
}
```

Use size aliases from `config.ts` intentionally:

| Alias             | Typical use                  |
| ----------------- | ---------------------------- |
| `RenSize`         | Full ladder                  |
| `RenCompactSize`  | `sm` \| `md` (chips)         |
| `RenControlSize`  | `sm` \| `md` \| `lg` (forms) |
| `RenDisplaySize`  | `sm`…`xl` (buttons)          |
| `RenExtendedSize` | `xs`…`xl` (inputs)           |

---

## 3. Svelte 5 Implementation Pattern

```svelte
<script module lang="ts">
	import * as en from '../../i18n/en';

	// English defaults this component renders; tree-shaking keeps only these keys.
	const COPY = { close: en.close };
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import X from '@lucide/svelte/icons/x'; // fixed icons: deep import, never a string
	import { useRenLocale } from '../../i18n';
	import type { MyComponentProps } from './types';

	interface Props extends MyComponentProps {
		children?: Snippet;
	}

	let {
		color = 'primary',
		size = 'md',
		variant = 'default',
		disabled = false,
		'aria-label': ariaLabel,
		class: className = '',
		children
	}: Props = $props();

	const i18n = useRenLocale(COPY); // read i18n.t.* in markup or $derived
</script>

<div
	class={[
		'ren-my-component',
		`ren-my-component--${variant}`,
		`ren-my-component--${size}`,
		disabled && 'ren-my-component--disabled',
		className
	]}
	style:--ren-control-accent="var(--ren-color-{color})"
	aria-label={ariaLabel || undefined}
	aria-disabled={disabled || undefined}
>
	{@render children?.()}
	<button type="button" aria-label={i18n.t.close}><X class="ren-icon" /></button
	>
</div>

<style>
	.ren-my-component {
		/* tokens only; the accent arrives through --ren-control-accent */
		border-radius: var(--ren-radius-control);
		transition: var(--ren-transition-control);
	}
</style>
```

### Rules of thumb

| Do                                                   | Don't                                       |
| ---------------------------------------------------- | ------------------------------------------- |
| `$props()`, `$state`, `$derived`, `$bindable`        | Svelte 4 `export let` / stores for new code |
| Relative imports (`../Icon`, `../../actions/portal`) | `$lib`, `$app`                              |
| BEM `ren-*` classes                                  | Global unscoped class soup                  |
| `class: className` rename                            | Clash with JS reserved `class`              |
| Snippets for slots                                   | Legacy `$$slots`                            |
| `class={[...]}` arrays/objects                       | `.filter(Boolean).join(' ')` builders       |
| One `style:--ren-control-accent` from `color`        | Six `.ren-x--{color}` modifier blocks       |
| Lowercase callbacks (`onrowclick`)                   | Hyphenated callbacks (`onrow-click`)        |
| Deep Lucide imports for fixed icons                  | String icon names inside the library        |
| Copy from `useRenLocale(COPY)`                       | Hardcoded English or Spanish defaults       |
| Token CSS variables                                  | Hardcoded `px` colors / one-off fonts       |

---

## 4. Prop Naming Contract

### Preferred semantic props

```ts
color?: RenColor;
size?: ...;
variant?: string;      // visual style
orientation?: 'horizontal' | 'vertical';
clearable?: boolean;
selected?: boolean;
disabled?: boolean;
loading?: boolean;
open?: boolean;        // bindable for overlays
value?: ...;           // bindable for inputs
placeholder?: string;
label?: string;
'aria-label'?: string;
class?: string;
```

### Events

Use Svelte 5 callback props:

```ts
onclick?: (event: MouseEvent) => void;
onclose?: () => void;
oninput?: (event: Event) => void;
```

### Visual style vs native type

| Need                            | Prop                                     |
| ------------------------------- | ---------------------------------------- |
| filled / outline / ghost        | `variant`                                |
| HTML button type                | `type?: 'button' \| 'submit' \| 'reset'` |
| HTML input type                 | `type?: 'text' \| 'email' \| ...`        |
| Semantic status for Alert/Toast | Prefer `color` over `type`               |

`Button` follows this contract: `variant` selects the visual treatment and `type` preserves the native HTML meaning.

---

## 5. CSS Authoring

### BEM

```css
.ren-card {
}
.ren-card--selected {
}
.ren-card__title {
}
.ren-card__body {
}
```

### Tokens only

```css
/* good */
background: var(--ren-color-surface-card);
box-shadow: var(--ren-shadow-md);
padding: var(--ren-space-md);
color: var(--ren-color-text);

/* bad */
background: #f3f7fc;
box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
padding: 13px;
color: #0b1220;
```

### Dynamic color via CSS variables

Use `.ren-tone` plus `.ren-tone--{color}` from the semantic `color` prop (see Button). The base recipe owns accent, solid, foreground, soft, strong, ink and beam roles. Reapply `.ren-tone` on a nested element that changes accent so its derived roles resolve locally.

### Background/foreground contract

When a component owns a filled chromatic surface, bind both
`--ren-color-{role}-solid` and its paired `--ren-color-{role}-foreground`.
Keep accent for the component's existing borders, focus rings, and indicators.

Rules:

- Foreground belongs to the effective background, never to light/dark mode alone.
- Do not change a solid or gradient stop after resolving foreground unless every resulting background is validated.
- Do not force black/white as functional content. Pairing belongs to public seeds and semantic tokens; decorative neutral effects may consume the corresponding neutral token.
- Preserve established soft-surface recipes unless a measured defect requires a shared contract.
- Text on a background must pass 4.5:1. Functional icons, checks, thumbs, focus, and required borders must pass 3:1.

### Motion

Prefer the shared control micro-transition. Append `transform` only when the interaction actually lifts or scales:

```css
/* good — shared control micro-motion */
transition: var(--ren-transition-control);

/* good — when lift/press is needed */
transition:
	var(--ren-transition-control),
	transform var(--ren-duration-fast) var(--ren-easing-default);

/* bad — invents a second timing ladder per component */
transition:
	background-color var(--ren-duration-base) var(--ren-easing-default),
	box-shadow var(--ren-duration-base) var(--ren-easing-default);
```

### Where CSS lives

A component's required CSS lives in its scoped `<style>`, in `base.css` (recipes every page needs) or in a stylesheet the `.svelte` component imports itself (`Field/field.css`, `styles/charts.css`, `styles/switcher.css`, `styles/switcher-group.css`, `styles/skeleton.css`, `styles/floating.css`, layer `ren.components`). Never import CSS from an `index.ts` barrel: with `sideEffects: ["**/*.css"]`, bundlers skip re-export-only modules and their CSS. Never depend on `utilities.css` or `patterns.css` — pages may not load them. Layout components may rely on `layout.css` shell classes.

### Responsive

Prefer layout tokens (`--ren-layout-*`, breakpoints already used in `core.css`) over ad-hoc media queries that redefine the design system.

---

## 6. Accessibility Checklist

Interactive components must cover what applies:

- [ ] Keyboard operable (Enter/Space/Arrows/Escape as relevant)
- [ ] Visible focus (`--ren-control-focus-shadow` or `--ren-focus-outline`)
- [ ] `aria-label` / `aria-labelledby` when text is absent
- [ ] `aria-expanded` / `aria-controls` for disclosure & menus
- [ ] `aria-invalid` + described-by message for form errors
- [ ] `disabled` / `aria-disabled` + no silent click-through
- [ ] Focus trap + restore for modal dialogs
- [ ] Portal content still reachable / announced appropriately
- [ ] Loading state announced or button disabled while loading

---

## 7. Overlay Components

If the surface can be clipped by `overflow: hidden` parents:

1. Apply `use:portal` (default `body`).
2. Position with `createFloating` from `utils/floating.svelte.ts`; it follows the anchor by itself, and `onoutside` handles dismissal, so add no scroll, resize or document listeners. Geometry lives in the pure `utils/position.ts`.
3. Use z-index tokens (`--ren-z-dropdown`, `--ren-z-modal`, etc.) and `.ren-floating` for the surface.
4. On open: cancel pending close timers/transitions before rebinding target.
5. On close: restore focus to the trigger when the user opened via keyboard/pointer interaction that expects it.

Release listeners and scroll locks in the effect that acquired them; destroying a closed overlay must not change another overlay's state. A surface stays `visibility: hidden` until placed and hidden elements refuse focus, so move focus after `tick()` once `hasPosition` is true. Lists navigate with `rovingIndex` from `utils/roving.ts`.

Reference implementations: `Dialog`, `Dropdown`, `Context`, `Select`, `Tooltip`.

---

## 8. Forms Family

Forms and interactive peers should feel like one system:

| Concern            | Approach                                                                                              |
| ------------------ | ----------------------------------------------------------------------------------------------------- |
| Heights            | `--ren-control-height-xs` … `--ren-control-height-xl`                                                 |
| Radius             | `--ren-radius-control`                                                                                |
| Fill / border      | `--ren-color-control-*`                                                                               |
| Accent             | `--ren-control-accent` on the control root (drives focus fill, ring, and outline)                     |
| Filled accent      | `solidAccent(color)` plus `--ren-control-solid` / `-foreground` defaults on the control root          |
| Focus (field)      | `--ren-control-focus-shadow` on the shell / peer visual                                               |
| Focus (affordance) | `--ren-focus-outline` + offset                                                                        |
| Disabled           | `opacity: var(--ren-opacity-disabled)` + `pointer-events: none`, so hover rules need no guard         |
| Motion             | `--ren-transition-control` (+ `transform` only when lift/press is used)                               |
| Autofill           | Class `ren-autofill` + `--ren-control-autofill-bg` (default + `:focus-within` focus fill)             |
| Labels             | `FieldLabel` (accent on `:focus-within`, decorative `*` for `required`) above the shell               |
| Validation         | `error?: FieldError` (`true` or a message) plus `hint`; render internal `FieldLabel` / `FieldMessage` |

When adding a new control, **side-by-side with Input** at the sizes that control actually supports and match padding/typography. Focus recipes resolve on the focused element by themselves, so read `--ren-focus-outline` or `--ren-control-focus-shadow` on `:focus-visible` or on the sibling right after a hidden input; nothing needs registering. Do not invent private focus-ring or transition variables.

### Shared visual recipes (copy peers — do not fork)

One role → one CSS recipe. Match the nearest peer; do not invent a second shell, spinner, or tile.

| Role                  | Peers                                    | Recipe (tokens only)                                                                                                                                                                                                                         |
| --------------------- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Field / binary active | Input, Checkbox, Radio, Switch           | Control fill/border; active via `--ren-control-active-*`; field focus via `--ren-control-focus-shadow`                                                                                                                                       |
| Switcher              | Tabs, SegmentedControl, ToggleGroup      | `styles/switcher.css` (+ `switcher-group.css` for SegmentedControl and ToggleGroup): recessed track (`surface-inset`, light border, `--ren-control-shadow`); neutral hover (no lift); raised **active pill** with tone ink and quiet shadow. |
| Spinner               | Button, Select, Table                    | Global `.ren-spinner` (base.css): `currentColor` 18% track + solid arc, `--ren-duration-spin`; reduced motion handled globally. `Loading` draws its own SVG arc on a tone-soft track                                                         |
| Skeleton              | Skeleton, Image, Table loading           | `styles/skeleton.css`: `.ren-skeleton` (+ `--text`, `--rect`, `--circle`); decorative, the loading region carries `aria-busy`                                                                                                                |
| Floating surface      | Dropdown, Context, Select                | `styles/floating.css`: `.ren-floating` opaque raised surface                                                                                                                                                                                 |
| Row tint              | Menu items, options, list and table rows | Neutral `--ren-color-hover` on hover; `--ren-tone-soft` / `--ren-tone-strong` when selected                                                                                                                                                  |
| Field shell           | Input, NumberInput, Select, Textarea     | `Field/field.css` (`.ren-field*`, layer `ren.components`) with `FieldLabel` / `FieldMessage`                                                                                                                                                 |
| Icon tile             | IconBadge, InfoItem icon                 | 12% accent fill, 20% accent border, `--ren-radius-lg`, 30% top sheen; IconBadge may keep `--ren-shadow-sm` as a free-standing tile                                                                                                           |
| Affordance focus      | Chip close/action, list/menu items, tabs | `--ren-focus-outline` + offset; set `--ren-control-accent` on the root                                                                                                                                                                       |

Surface roles: [GUIDE §6](./GUIDE.md#6-design-language).

---

## 9. Content Defaults

- Every user-visible or `aria-*` default comes from `i18n/en.ts` (+ `es.ts`, `types.ts` keep parity); explicit props override it.
- No product copy in primitives; apps localize through `setRenLocale`.
- Avoid hard-coded asset paths like `/assets/images/...` — accept full URLs or leave image slots to the consumer.

---

## 10. Pre-merge checklist

For every touched component:

- [ ] `Component.svelte` + `types.ts` + `index.ts`
- [ ] `types.ts` complete and exported; root `src/lib/index.ts` updated if public
- [ ] Props (`color` / `size` / `variant` / state booleans) match peers
- [ ] No domain words in prop unions, classes, or defaults
- [ ] Tokens only—no raw hex, rgba, or magic numbers
- [ ] Defaults from the i18n dictionaries (English + Spanish parity)
- [ ] Interactive → keyboard operable + accessible name
- [ ] Every filled chromatic surface uses its paired solid foreground
- [ ] Text ≥ 4.5:1; required non-text indicators/focus/borders ≥ 3:1
- [ ] Overlay → portal + focus trap/restore + dismissal
- [ ] Visual: light theme, and dark seeds if colors touched
- [ ] `pnpm run check` clean
- [ ] `pnpm run package` clean, and `pnpm run size` within budget

Release command sequence: [GUIDE §8](./GUIDE.md#8-release-verification).

---

## 11. Quality Rubric (score before merge)

Rate 1–5. Ship only if each ≥ 4.

| Dimension       | 5 means                                            |
| --------------- | -------------------------------------------------- |
| **Beauty**      | Lumen surfaces; no visual noise; aligns with peers |
| **Minimalism**  | Smallest API that solves the job                   |
| **Consistency** | Props, sizes, tokens, BEM match the system         |
| **Reuse**       | Works in any product without domain forks          |
| **A11y**        | Keyboard + SR + focus are correct                  |
| **Code**        | Typed, Runes, relative imports, no hacks           |

---

## 12. Reference Components (copy these patterns)

| Need                       | Look at                           |
| -------------------------- | --------------------------------- |
| Action control + loading   | `Button`                          |
| Text field + validation UI | `Input`                           |
| Modal a11y + portal        | `Dialog`                          |
| Floating menu              | `Dropdown`, `Context`             |
| Async options              | `Select` / `RemoteSelect`         |
| Shared config              | `config.ts`                       |
| Layout shell classes       | `core.css` dashboard layout       |
| Token seeds                | `tokens.base.css` header comments |

---

## 13. Anti-Patterns to Reject in Review

[Avoid](./GUIDE.md#7-library-design) in GUIDE §7 lists the structural anti-patterns (domain names, raw palettes, component-selector patches, clipped overlays, public helpers without a consumer). In review also reject:

1. New component without `types.ts` / `index.ts`
2. Silent a11y regressions (icon-only control with no accessible name)
3. Scope-creep refactors unrelated to the task
4. Exporting internal helpers as public API without a consumer contract
5. Filled surface using accent without its paired solid foreground
6. Theme-only black/white foreground rules or per-role corrective percentages
