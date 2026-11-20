# RenUI — Consumer Quick Reference

Compact layout & component usage for consumer web projects. Source `types.ts` / `.svelte` files are authoritative for exact props.

---

## 1. Setup

```bash
pnpm add @renui/svelte
```

### Entry points

| Import                                 | Provides                                                                    |
| -------------------------------------- | --------------------------------------------------------------------------- |
| `@renui/svelte`                        | All components, types, icon registry, portal, config, chart types, Drive UI |
| `@renui/svelte/styles`                 | Tokens → core → patterns (import once at root)                              |
| `@renui/svelte/styles/tokens.base.css` | Token contract only                                                         |
| `@renui/svelte/styles/core.css`        | Reset, shells, utilities (no implicit tokens)                               |
| `@renui/svelte/styles/patterns.css`    | Reusable composition patterns                                               |
| `@renui/svelte/color-scheme`           | Pre-paint script, controller, policy helpers, types                         |
| `@renui/svelte/drive`                  | Pure Drive helpers/types (not UI components)                                |

### Root layout

```svelte
<!-- src/routes/+layout.svelte -->
<script lang="ts">
	import '@renui/svelte/styles';
	import '../ren-theme.css';
	const { children } = $props();
</script>

{@render children?.()}
```

### First page

```svelte
<script lang="ts">
	import { Button, Card, Input, PageHeader } from '@renui/svelte';
	let name = $state('');
</script>

<div class="ren-stack ren-stack--lg">
	<PageHeader title="Workspace" subtitle="A clean starting point">
		{#snippet actions()}<Button variant="filled">Create</Button>{/snippet}
	</PageHeader>
	<div class="ren-grid ren-grid--responsive">
		<Card title="Profile" spaced>
			<Input bind:value={name} name="name" label="Display name" />
			<Button variant="filled" disabled={!name.trim()}>Save</Button>
		</Card>
		<Card title="Status"
			>Use components for behavior, utilities for composition.</Card
		>
	</div>
</div>
```

---

## 2. Theming

### Brand seeds (CSS data)

```css
/* ren-theme.css — load AFTER @renui/svelte/styles */
:root {
	/* Most products override only these two */
	--ren-brand-primary: #7c3aed;
	--ren-brand-secondary: #0f766e;
}
```

### Status seeds

Defaults are OKLCH in [`tokens.base.css`](../src/lib/styles/tokens.base.css). Override only when the product needs a different semantic identity:

```css
:root {
	--ren-status-success: oklch(54% 0.16 158);
	--ren-status-warning: oklch(80% 0.17 80);
	--ren-status-danger: oklch(56% 0.205 24);
	--ren-status-info: oklch(52% 0.15 210);
}
```

Set the seed; RenUI derives accent, solid fill, paired foreground, soft `-bg`, and dark-mode accent. Never reassign derived `--ren-color-*` tokens directly.

Every semantic role has one predictable family:

| Use                         | Token                           |
| --------------------------- | ------------------------------- |
| Border, focus, icon, marker | `--ren-color-{role}`            |
| Filled background           | `--ren-color-{role}-solid`      |
| Content on filled           | `--ren-color-{role}-foreground` |
| Tinted background           | `--ren-color-{role}-bg`         |

Choose brand and status seeds that pass with their semantic foreground. The default foreground is white except warning, which uses black.

### Migrating older color overrides

Remove direct assignments such as `--ren-color-secondary`, `--ren-color-secondary-solid`, or `--ren-color-secondary-foreground`. Replace them with the owning brand/status seeds above, and keep the theme file after the RenUI import.

Check both themes before adopting:

- Filled text is at least 4.5:1 against every solid and gradient stop.
- Required icons, thumbs, checks, focus rings, and borders are at least 3:1.
- Hover/active states do not change to an unpaired background.
- Neutral `.ren-bg--surface`, `--control`, `--background`, and `--glass` utilities restore neutral ink inside a solid ancestor. The legacy `--glass` class now uses an opaque surface.

`--ren-color-canvas` and `--ren-color-neutral` are the optional page/ink seeds. When overriding them, calibrate both `:root` and `[data-theme='dark']`; base backgrounds and Cards derive from the neutral surface ladder, while the default canvas follows the primary hue at low chroma.

### Color-scheme controller (optional dark/light)

```ts
// $lib/color-scheme.svelte.ts
import {
	createColorScheme,
	type ColorSchemeOptions
} from '@renui/svelte/color-scheme';
export const colorSchemeOptions = {
	storageKey: 'app-scheme',
	defaultPreference: 'system'
} satisfies ColorSchemeOptions;
export const colorScheme = createColorScheme(colorSchemeOptions);
```

```svelte
<script lang="ts">
	import { onMount } from 'svelte';
	import { ColorSchemeScript } from '@renui/svelte/color-scheme';
	import { colorScheme, colorSchemeOptions } from '$lib/color-scheme.svelte';
	onMount(colorScheme.start);
</script>

<ColorSchemeScript {...colorSchemeOptions} />
```

| Member              | Meaning                               |
| ------------------- | ------------------------------------- |
| `preference`        | Stored: `system` \| `light` \| `dark` |
| `resolved`          | Applied: `light` \| `dark`            |
| `setPreference(v)`  | Persist, resolve, apply               |
| `cyclePreference()` | Advance through choices               |
| `start()`           | Sync; returns idempotent cleanup      |

**`/color-scheme` exports:** `createColorScheme` · `ColorSchemeScript` · `createColorSchemeBootScript` · `parseColorSchemePreference` · `resolveColorScheme` · constants (`COLOR_SCHEME_PREFERENCES`, `DEFAULT_COLOR_SCHEME_PREFERENCE`, `DEFAULT_COLOR_SCHEME_STORAGE_KEY`)

One controller per app. CSP: authorize the inline script hash or use `createColorSchemeBootScript` with nonces.

### Key tokens for custom CSS

```css
.my-section {
	gap: var(--ren-space-md); /* spacing: 2xs…6xl */
	border-radius: var(
		--ren-radius-xl
	); /* or --ren-radius-control, --ren-surface-radius */
	box-shadow: var(--ren-shadow-md);
	color: var(
		--ren-color-text
	); /* --ren-color-text-muted, --ren-color-text-light */
	background: var(--ren-color-surface);
	border: 1px solid var(--ren-color-border);
	/* Prefer shared recipes over raw duration pairs: */
	transition: var(--ren-transition-control);
}

.my-control {
	--ren-control-accent: var(--ren-color-primary);
	min-height: var(--ren-control-height-md); /* xs…xl */
	border-radius: var(--ren-radius-control);
	box-shadow: var(--ren-control-shadow);
	transition: var(--ren-transition-control);
}

.my-control:focus-visible {
	outline: var(--ren-focus-outline);
	outline-offset: var(--ren-focus-outline-offset);
}

.my-field:focus-within {
	box-shadow: var(--ren-control-focus-shadow);
}
```

---

## 3. Core Layout CSS

Import: `@renui/svelte/styles` = tokens → core → patterns. No Tailwind/Bootstrap.

### Structure chooser

| Need                         | Classes / Components                                             |
| ---------------------------- | ---------------------------------------------------------------- |
| App shell (sidebar + navbar) | `.ren-dashboard-layout` + `Sidebar` + `Navbar`                   |
| Standard page                | `.ren-stack` + `PageHeader` + `Card` / `DashboardSection`        |
| Filters beside content       | `.ren-layout--two-columns` + `PageSidebar`                       |
| Fluid card grid              | `.ren-grid .ren-grid--responsive`                                |
| Dashboard cards              | `.ren-grid .ren-grid--cards`                                     |
| Fixed columns (desktop)      | `.ren-grid .ren-grid--columns-{2,3,4}-lg`                        |
| Identity/content split       | `.ren-grid .ren-grid--identity-split`                            |
| Auth / focused task          | `.ren-centered-layout` + `.ren-centered-card`                    |
| Bounded width                | `.ren-container` (+ `--sm`)                                      |
| Dashboard analytics          | `.ren-dashboard-overview-grid` / `.ren-dashboard-analytics-grid` |

### Shells & layouts (CSS families)

| Family         | Contract                                                                                                                                                                          |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dashboard      | `.ren-dashboard-layout`, `__content`, `.ren-mobile-overlay`; sync `ren-sidebar--is-collapsed` / `ren-sidebar--mobile-open` with `Sidebar`                                         |
| Two column     | `.ren-layout--two-columns` + `.ren-layout--sidebar-left` + `.ren-layout--content-right`; collapses ≤ 64rem                                                                        |
| Page sidebar   | `.ren-page-sidebar-layout`, `__header-actions`, `__mobile-trigger`, `__section`, `__label`, `__radio-group`, `__radio-option`, `__bounded-list`                                   |
| Scroll well    | `.ren-scroll-well` recessed scroll surface; `--ren-scroll-well-max-height` / `--ren-scroll-well-bg`. `.ren-scroll-contain` holds the wheel only while a custom scroller overflows |
| Containers     | `.ren-container` (+ `--sm`); `--ultrawide` ≥ 96rem                                                                                                                                |
| Centered task  | `.ren-centered-layout` + `.ren-centered-card--{sm,md,lg,xl}`; combine with `Card`                                                                                                 |
| Dashboard data | `.ren-dashboard-overview-grid` (≤ 68.75rem); `.ren-dashboard-analytics-grid` (≤ 61.25rem)                                                                                         |

### Dashboard shell

```svelte
<script lang="ts">
	let collapsed = $state(false);
	let mobileOpen = $state(false);
	function toggleSidebar(): void {
		if (window.matchMedia('(max-width: 64rem)').matches) {
			mobileOpen = !mobileOpen;
			return;
		}
		collapsed = !collapsed;
	}
</script>

<div
	class="ren-dashboard-layout"
	class:ren-sidebar--is-collapsed={collapsed}
	class:ren-sidebar--mobile-open={mobileOpen}
>
	<Sidebar {collapsed} {mobileOpen}>
		<SidebarHeader title="App" />
		<SidebarItem href="/" current>Home</SidebarItem>
	</Sidebar>
	<Navbar ontogglesidebar={toggleSidebar} />
	<main class="ren-dashboard-layout__content">{@render children?.()}</main>
	<button
		type="button"
		class="ren-mobile-overlay ren-border--none"
		aria-label="Close navigation"
		onclick={() => (mobileOpen = false)}
	></button>
</div>
```

### Standard page

```svelte
<div class="ren-stack ren-stack--lg">
	<PageHeader title="Records" subtitle="Current workspace">
		{#snippet actions()}<Button variant="filled">Create</Button>{/snippet}
	</PageHeader>
	<DashboardSection title="Directory">
		<Table data={rows} />
	</DashboardSection>
</div>
```

### Page sidebar (filters panel)

```svelte
<PageHeader title="Records">
	{#snippet actions()}
		<div class="ren-page-sidebar__header-actions">
			<Button
				variant="border"
				class="ren-page-sidebar__mobile-trigger"
				onclick={() => (filtersOpen = true)}>Filters</Button
			>
		</div>
	{/snippet}
</PageHeader>

<div class="ren-layout--two-columns ren-page-sidebar-layout">
	<PageSidebar bind:mobileOpen={filtersOpen} mobileTitle="Filters">
		{#snippet sidebar()}…{/snippet}
	</PageSidebar>
	<section class="ren-layout--content-right">…</section>
</div>
```

### Grid

Always include `.ren-grid`; modifiers alone don't set `display:grid`.

| Modifier                   | Behavior                                                                               |
| -------------------------- | -------------------------------------------------------------------------------------- |
| `--responsive`             | Auto-fit from `--ren-grid-responsive-min`; 1 col ≤ 48rem                               |
| `--cards`                  | Fluid auto-fill from `--ren-dashboard-card-grid-min`; left-aligned; no forced collapse |
| `--identity-split`         | Weighted identity/content split; 1 col ≤ 64rem                                         |
| `--columns-{1..4}`         | Exact count; 2–4 → auto-fit ≤ 48rem, 1 col ≤ 30rem                                     |
| `--columns-{2,3,4}-lg`     | Explicit columns only ≥ 64rem                                                          |
| `--gap-{sm,md,lg,xl}`      | Tokenized gap                                                                          |
| `.ren-grid-item--span-all` | Child spans all columns                                                                |

Fluid families clamp their minimum track to the containing block. Use `--responsive` for rows that should fill their width and `--cards` for variable-length card collections.

### Flex / Stack / Container

```html
<!-- Flex -->
<div
	class="ren-flex ren-flex--wrap ren-align-items--center ren-justify--between ren-flex--gap-sm"
>
	…
</div>
<!-- Vertical rhythm -->
<div class="ren-stack ren-stack--md">…</div>
<!-- Bounded container -->
<main class="ren-container">…</main>
<!-- Centered auth/task -->
<main class="ren-centered-layout">
	<Card class="ren-centered-card ren-centered-card--md">…</Card>
</main>
```

### Utility families (complete)

| Concern                | Classes                                                                                                                                                                                                                             |
| ---------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Flex**               | `.ren-flex`; `.ren-flex--{column,mobile-column,wrap,nowrap,center,between}`; `.ren-flex--gap-{2xs,xs,sm,md,lg,xl}`; `.ren-flex-item--{auto,grow,shrink,no-shrink}`                                                                  |
| **Align**              | `.ren-align-items--{start,center,end,stretch}`; `.ren-justify--{start,center,between,end}`                                                                                                                                          |
| **Grid**               | `.ren-grid--{responsive,cards,identity-split,columns-1…4,columns-2-lg…4-lg}`; `.ren-grid--gap-{sm,md,lg,xl}`; `.ren-grid-item--span-all`                                                                                            |
| **Vertical rhythm**    | `.ren-stack` with `.ren-stack--{2xs,xs,sm,md,lg,xl}`                                                                                                                                                                                |
| **Spacing**            | `.ren-padding--{none,2xs,xs,sm,md,lg,xl}`; `.ren-padding-{x,y}--{2xs,xs,sm,md}`; `.ren-margin--none`; `.ren-margin-{top,bottom}--{2xs,xs,sm,md,lg}` (logical properties)                                                            |
| **Size**               | `.ren-width--{full,tablet-full}`, `.ren-min-width--0`, `.ren-min-w--{sm,lg,xl}`, `.ren-max-w--{sm,lg,4xl,prose,full}`, `.ren-h--full`, `.ren-min-h--screen`                                                                         |
| **Text**               | `.ren-text--{xs,sm,lg,xl,2xl,4xl}`; `.ren-text--{center,right}`; `.ren-text--{muted,primary,secondary,success,warning,danger,info}`; `.ren-font--{medium,semibold,bold}`; `.ren-line-height--relaxed`; `.ren-text-decoration--none` |
| **Text overflow**      | `.ren-text-ellipsis`, `.ren-text-break`, `.ren-text-pre-line`, `.ren-text-clamp--{2,3}`; `.ren-sr-only` (base) hides visually but keeps text for assistive tech                                                                     |
| **Presentation**       | `.ren-border`, `.ren-border--{light,none}`; `.ren-rounded--{md,lg,xl,full}`; `.ren-shadow--sm`; `.ren-bg--{transparent,surface,control,glass,primary}`; `.ren-opacity--80`                                                          |
| **Display / position** | `.ren-block`, `.ren-hidden`, `.ren-overflow-hidden`; `.ren-position--{relative,absolute,bottom-right}`; `.ren-z--dropdown`                                                                                                          |

### Breakpoints

| Boundary        | Effect                                                                                                                   |
| --------------- | ------------------------------------------------------------------------------------------------------------------------ |
| ≤ 64rem         | Shell → navbar/content; two-column & identity grids collapse; tablet-full & mobile-column activate; PageSidebar → drawer |
| ≤ 48rem         | Responsive grid → 1 col; columns 2–4 → auto-fit; patterns stack; large padding/text compact                              |
| ≤ 30rem         | Auto grids & columns 2–6 → 1 col; large stack gaps compact                                                               |
| ≥ 64rem         | `columns-{2,3,4}-lg` activate                                                                                            |
| ≥ 80rem / 96rem | Wide / ultrawide container caps                                                                                          |

### Composition rules

- Prefer a canonical shell/grid/flex/stack before writing page CSS.
- Tokenize new application composition with `--ren-*`.
- Keep overlays portaled and independent of page overflow.
- Don't nest full dashboard shells or duplicate `PageSidebar` drawer markup.
- Don't copy core/pattern declarations into app CSS; compose the public class or token.
- Don't target component-internal selectors from app CSS.

---

## 4. Component Usage

```ts
import {
	Button,
	Card,
	Input,
	PageHeader,
	Table,
	Dialog,
	Select
} from '@renui/svelte';
import type { ButtonProps, RenColor, RenSize } from '@renui/svelte';
```

### Semantic scales (shared)

- **color**: `'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info'`
- **size**: per component (`Input` `xs`–`xl`; `Button` `sm`–`xl`; `Select`/`Textarea`/`NumberInput` `sm`–`lg`) — check `types.ts`
- **variant** (Button): `'filled' | 'border' | 'flat' | 'ghost' | 'gradient'`

### Choose between similar components

| Need                                                    | Choose                                                        |
| ------------------------------------------------------- | ------------------------------------------------------------- |
| Text / numeric / multiline input                        | `Input` / `NumberInput` / `Textarea`                          |
| One visible exclusive choice                            | `SegmentedControl`; `Radio` when each needs label/description |
| Several independent toggles or filters                  | `ToggleGroup`; one standalone toggle → `Button pressed`       |
| Longer or space-constrained choice                      | `Select`; `RemoteSelect` for server search                    |
| Submitted boolean vs immediate setting                  | `Checkbox` vs `Switch`                                        |
| Persistent vs transient feedback                        | `Alert` vs `Toaster` (+ `createToaster`)                      |
| Navigate vs act                                         | `Button href` vs `Button onclick`                             |
| Generic vs titled dashboard surface                     | `Card` vs `DashboardSection`                                  |
| Structured records vs short rows                        | `Table` vs `List` / `ListItem`; person rows → `UserInfo`      |
| Page through results                                    | `Pagination` (`href` for crawlable links)                     |
| Anchored / pointer / interruptive / explanatory overlay | `Dropdown` / `Context` / `Dialog` / `Tooltip`                 |
| No data / failure / pending                             | `EmptyState` / `ErrorState` / `Skeleton` or `Loading`         |
| Conversation                                            | `MessageList` of `Message` rows                               |

### Actions & Forms

| Component          | Key props                                                                                              | Notes                                                                          |
| ------------------ | ------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| `Button`           | `variant`, native `type`, `color`, `size`, `icon`, `href`, `summary`, `pressed`, `disabled`, `loading` | `href` → `<a>`; `summary` → `<summary>` of a `<details>`; icon-only needs name |
| `Input`            | `bind:value`, `label`, `type`, `icon`, `actionIcon` + `onactionclick`, `clearable`, `error`, `hint`    | Native input types incl. dates                                                 |
| `NumberInput`      | `bind:value`, `min`, `max`, `step`, `label`, `error`, `hint`                                           | No implicit bounds                                                             |
| `Textarea`         | `bind:value`, `label`, `rows`, `maxlength`, `showCount`, `error`, `hint`                               | Grows with content where supported                                             |
| `Checkbox`         | `bind:checked`, `label`, `name`, `value`, `indeterminate`                                              | Form boolean                                                                   |
| `Radio`            | `bind:group`, `value`, `name`, `label`, `description`, `busy`                                          | One in a named native group                                                    |
| `Switch`           | `bind:checked`, `label`, `name`                                                                        | Immediate toggle                                                               |
| `Slider`           | `bind:value`, `min`, `max`, `step`, `showValue`, `showTooltip`                                         | Range selection                                                                |
| `Select`           | `bind:value`, `options`, `searchable`, `searchMode`, `clearable`, `loading`, `error`, `size`           | Client or server search                                                        |
| `RemoteSelect`     | `bind:value`, `bind:selected`, `endpoint`, mappers; optional `minQueryLength`/`debounceMs`/`limit`     | Debounced, cancellable search                                                  |
| `SegmentedControl` | `bind:value`, `options`, `fullWidth`, `orientation`, `iconOnly`, `clearable`                           | One exclusive choice                                                           |
| `ToggleGroup`      | `bind:value` (array), `options`, `size`, `orientation`, `fullWidth`                                    | Any number pressed                                                             |
| `FileUpload`       | `bind:files`, `accept`, `multiple`, `maxSize`, `validateFile`                                          | Queue + validation + removal                                                   |
| `DatePicker`       | `bind:value` or `range` + `bind:start`/`bind:end`, `min`, `max`, `isDateDisabled`, `format`, `name`    | `YYYY-MM-DD`; range submits `start/end`                                        |
| `Calendar`         | Same date props as `DatePicker`, `weekStart`, `onchange`                                               | Inline month grid                                                              |
| `TimePicker`       | `bind:value`, `interval`, `min`, `max`, `hour12`, plus `Select` field props                            | `HH:MM`; labels follow the locale                                              |
| `DateRangeFilter`  | `bind:fromValue`, `bind:toValue`, `compact`, `onapply`                                                 | Apply button only with `onapply`                                               |
| `Fieldset`         | `legend`                                                                                               | Semantic grouping                                                              |
| `TagOption`        | `label`, `color`, `selected`, `onclick`                                                                | Compact tag choice                                                             |

### Surfaces & Feedback

| Component                     | Key props                                                                                                                | Notes                                 |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------ | ------------------------------------- |
| `Card`                        | `title`, `subtitle`, `spaced`, `href`, `onclick`, `selected`, `hoverable`, `image`; snippets `header`, `footer`, `media` | Generic / link / button card          |
| `DashboardSection`            | `title`, `subtitle`, `icon`; snippets `actions`, `footer`                                                                | Titled section                        |
| `Alert`                       | `color`, `title`, `closable`, `bind:active`, `onclose`                                                                   | Persistent inline message             |
| `Toaster` + `createToaster()` | `toaster`, `placement`; `toaster.show({ title, message, color, duration })`                                              | Transient, portaled, live region      |
| `Notification`                | `color`, `title`, `message`, `duration`                                                                                  | Rendered in place (Toaster uses it)   |
| `Chip`                        | `color`, `size`, `icon`, `closable`, `closeLabel`, `onclick`, `onclose`                                                  | Label / status / token                |
| `Collapse`                    | `title`, `bind:open`, `color`, `size`, `ontoggle`                                                                        | Content stays in the DOM, `inert`     |
| `Divider`                     | `label`, `align`, `orientation`, `variant`, `spacing`                                                                    | `<hr>` when plain                     |
| `EmptyState`                  | `title`, `description`, `icon`, `image`; snippet `actions`                                                               | No-content guidance                   |
| `ErrorState`                  | `status`, `message`, `homeHref`                                                                                          | HTTP error recovery page              |
| `Loading` / `Skeleton`        | `text`, `size` / `shape`, `width`, `height`, `lines`                                                                     | Unknown vs known layout while pending |
| `Progress`                    | `value`, `indeterminate`, `striped`, `animated`, `showLabel`                                                             | Determinate / indeterminate           |
| `Tooltip`                     | `text` or `content`, `placement`, `delay`                                                                                | Describes its focusable child         |

### Data & Dashboard

| Component                          | Key props                                                                                                               | Notes                                  |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| `Table`                            | `data`, `rowKey`, `search`, `selectable`, `pagination`, `layout`, `loading`; snippets `thead`, `row`                    | Embeds `Pagination`; skeleton loading  |
| `Pagination`                       | `bind:page`, `pages`, `siblings`, `href`, `compact`, `onpagechange`                                                     | `href` → crawlable `rel` links         |
| `List` / `ListHeader` / `ListItem` | `color`, `size`, `maxHeight`; item `title`, `description`, `href`/`onclick`, `selected`; snippets `leading`, `trailing` | `<ul>`/`<li>`; stretched target        |
| `UserInfo`                         | `name`, `description`, `src`, `size`, `href`; snippet `trailing`                                                        | Person row for tables and lists        |
| `InfoItem`                         | `label`, `value`, `icon`, `layout`                                                                                      | Label/value metadata                   |
| `StatCard` / `QuickAccessCard`     | `title`, `value` / `description`, `icon`, `href`                                                                        | Metric / navigational card             |
| `DashboardChart`                   | `series`, `color`, `valueFormat`                                                                                        | Formats with the locale currency       |
| `DashboardBarChart`                | `data`, `color`, `valueFormat`                                                                                          | Single-series bars                     |
| `DashboardDonutChart`              | `data`, `centerLabel`, `centerValue`, `valueFormat`                                                                     | Ring + legend                          |
| `Message` / `MessageList`          | `align`, `variant`, `color`, `name`, `time`, `grouped`; list `busy`, `loading`, `onloadmore`                            | Chat rows; transcript pinned to latest |

### Navigation & Layout

| Component                                   | Key props / snippets                                                    | Notes                         |
| ------------------------------------------- | ----------------------------------------------------------------------- | ----------------------------- |
| `Navbar`                                    | `title`, snippets `actions`, `user`; `ontogglesidebar`                  | Dashboard top bar             |
| `Sidebar` / `SidebarHeader` / `SidebarItem` | `collapsed`, `mobileOpen`, `aria-label`; item `href`, `icon`, `current` | Primary nav; group: Dropdown  |
| `PageHeader`                                | `title`, `subtitle`, `icon`, `level` (default `1`); snippet `actions`   | Page identity + actions       |
| `PageSidebar`                               | `bind:mobileOpen`, `mobileTitle`; snippet `sidebar`                     | Desktop aside + mobile drawer |
| `Tabs`                                      | `tabs`, `bind:value`, `color`, `orientation`; `Tab.content` panels      | Managed panels stay mounted   |

### Overlays & Menus

| Component                   | Key props                                                                     | Notes                                       |
| --------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- |
| `Dialog`                    | `bind:open`, `title`, `size`, `persistent`, `closeOnEscape`; snippet `footer` | Modal; focus-trapped; put actions in footer |
| `Dropdown` / `DropdownItem` | `bind:open`, `placement`, `size`; `triggerContent` or `trigger(props)`        | Spread `props` on your own trigger control  |
| `Context` / `ContextItem`   | programmatic open, `size`                                                     | Pointer/row context menu                    |

`Dropdown` and `Context` are menus — keep menu roles and keyboard behavior. Overlays opened inside a `Dialog` render inside it.

### Identity & Foundations

| Component         | Key props                                                                           |
| ----------------- | ----------------------------------------------------------------------------------- |
| `Avatar`          | `name`, `src`, `alt`, `size`, `color`; icon as children                             |
| `AvatarGroup`     | `items` (`{ name, src }`), `max`, `total`, `size`                                   |
| `AvatarPicker`    | `options`, `bind:value`, `name`                                                     |
| `Icon`            | `icon` (Lucide component or registered name), `size`, `color`                       |
| `IconBadge`       | `icon`, `color`, `size`                                                             |
| `StatusIndicator` | `status`, `pulse`, `tooltip`                                                        |
| `Image`           | `src`, `alt`, `width`, `height`, `ratio`, `fit`, `fetchpriority`, `srcset`, `sizes` |
| `Title`           | `title`, `subtitle`, `level`, `size`, `icon`, `color`                               |

### Drive workspace

| Component           | Use                      |
| ------------------- | ------------------------ |
| `DriveFileCard`     | File card display        |
| `DriveFileGrid`     | Grid view of files       |
| `DriveFileList`     | List view of files       |
| `DriveFilePreview`  | File preview panel       |
| `DriveFileUploader` | Upload dialog            |
| `DriveSidebar`      | Drive navigation sidebar |

Persistence/endpoints stay in the app. Pure helpers, types and `renDriveEs`: `import { ... } from '@renui/svelte/drive'`.

### Shared helpers & types

```ts
import {
	formatDate,
	formatNumber,
	getInitials,
	renEs,
	portal,
	registerIcons,
	setRenLocale
} from '@renui/svelte';
import { renIcons } from '@renui/svelte/icons'; // only for string icon names
import type {
	IconComponent,
	IconSource,
	RenColor,
	RenChoiceOption,
	RenLocaleOptions
} from '@renui/svelte';
```

| Export                                      | Use                                                                          |
| ------------------------------------------- | ---------------------------------------------------------------------------- |
| `setRenLocale`, `renEs`, `renEn`            | Built-in copy + `Intl` locale, currency and time zone (root layout)          |
| `formatNumber`, `formatDate`, `getInitials` | Cached, pure helpers — replace app copies of currency/initials helpers       |
| `registerIcons`, `getIcon`, `hasIcon`       | Opt-in string icon registry (empty by default)                               |
| `portal`                                    | Svelte action: `use:portal` (open modal or body) or `use:portal={'#target'}` |

Prefer deep Lucide imports (`import Search from '@lucide/svelte/icons/search'`) on public pages; register `renIcons` only in layouts that render icon names from data.

---

## 5. Patterns CSS

Reusable domain-neutral compositions — opt-in: `import '@renui/svelte/styles/patterns.css'`. Apply via `class`; use documented BEM children — don't invent modifiers.

| Pattern              | Families & variants                                                                                                                                                     |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Surfaces & auth      | `.ren-surface`, `.ren-auth-mark`; `.ren-card--ambient` / `.ren-auth-card` via `Card class`. Plain cards are crisp; translucent cards set `--ren-surface-blur-filter`    |
| Filter summary       | `.ren-filter-summary` + `__eyebrow`, `__title`, `__subtitle`, `__title-row`, `__meta`, `__actions`; `--compact`, `--centered`, color variants                           |
| Section actions      | `.ren-section-toolbar`, `.ren-toolbar-field`, `.ren-form-action-row`, `.ren-inline-filters` (+ child/compact variants)                                                  |
| Ranked metrics       | `.ren-metric-rank-list` / `.ren-metric-rank-row`; `--dense`, `--accent-secondary`, `--scroll-capped`                                                                    |
| Identity & selection | `.ren-person-cell`, `.ren-selected-panel`, `.ren-result-list`, `.ren-placeholder-tile`                                                                                  |
| Context panels       | `.ren-search-panel` + BEM children                                                                                                                                      |
| Collections          | `.ren-item-row`, `.ren-item-list`; interactive/active row variants                                                                                                      |
| Summaries            | `.ren-total-box`, `.ren-scan-result`                                                                                                                                    |
| Small helpers        | `.ren-scrollbar`, `.ren-list-item--stack-actions`                                                                                                                       |
| Specialized          | `.ren-drive-toolbar-card` (via `Card class`, includes blur opt-in), `.ren-drive-content`, `.ren-navbar-branch`, `.ren-navbar-user-dropdown`, `.ren-brand-logo-wordmark` |

---

## 6. Behavioral checks

- Read `.svelte` when snippets/callbacks matter; several are local, not in exported `*Props`.
- Built-in copy is English until `setRenLocale` runs; explicit label props always win.
- String icon names render nothing until registered; pass components where possible.
- A clickable `Card` renders as a button and must not contain nested interactive controls.
- `ListItem` with `href`/`onclick` uses a stretched target, so `trailing` actions stay real siblings.
- Supply `Table.rowKey` when records lack stable `id` or `key`.
- Create one `createToaster()` per app in client code; call `show()` from handlers, render one `<Toaster>`.
- `MessageList` needs a height; pass `busy` while a reply streams and `loading` while history loads.
- Icon-only controls need an accessible name; decorative nested icons do not.
- `Dropdown`/`Context` are menus, not generic popovers — keep menu roles.
- One `ColorSchemeScript` + one controller instance per app.

---

## 7. Rules of thumb

0. Preserve the shared visual language: compose existing utilities and semantic surface/border tokens before adding application CSS.
1. Use `var(--ren-*)` tokens for color, spacing, radius, shadow, motion — never raw values.
2. Compose with layout classes before writing custom CSS.
3. Components own behavior/a11y; CSS classes own page composition.
4. Overlays are portaled — don't place inside `overflow:hidden` parents.
5. Brand seeds are CSS; light/dark is an optional controller — keep them separate.
6. Don't target component selectors or redefine derived `--ren-color-*` tokens.
7. Semantic APIs: `tone`, `color`, `size`, `variant`, `disabled`, `loading` — not visual instructions.
8. Domain-neutral: components never know about your business entities.
