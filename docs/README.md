# RenUI Documentation

These documents cover the library. Source remains authoritative for exact APIs.

| Document                                            | Covers                                                                                            |
| --------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **[Guide](./GUIDE.md)**                             | Install, styles, icons, language, theming, layouts, CSS, design language, library design, release |
| **[Components](./COMPONENTS.md)**                   | Every root-exported component, selection matrix, contracts                                        |
| **[Component authoring](./COMPONENT_AUTHORING.md)** | How to build or change a component: skeleton, prop contract, CSS, a11y, pre-merge checklist       |
| **[Consumer reference](./CONSUMER_REFERENCE.md)**   | Compact setup, theming, layout classes, and component usage for product apps                      |
| **[Upgrade](./UPGRADE.md)**                         | Lumi UI 1.x → RenUI 2.0 migration and codemod                                                     |
| **[Release reviews](./REFACTOR_REVIEW.md)**         | Release changes, measured evidence, remaining considerations                                      |

[Browser benchmark](./BENCHMARK.md): reproducible 1.2.0 → 2.0.0 runtime comparison and measurement limits.

Coding agents: [AGENTS.md](../AGENTS.md) → [Agent Guide](./AGENT_GUIDE.md). Working pages: the [`renweb`](https://github.com/eliaschampi/renweb) showcase.

## Authority

| Question                     | Source of truth                                                                                                                                                                                                                                      |
| ---------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Repository rules             | [`AGENTS.md`](../AGENTS.md)                                                                                                                                                                                                                          |
| Entry points, peer versions  | [`package.json`](../package.json)                                                                                                                                                                                                                    |
| Exported symbols             | Root or subpath `index.ts`                                                                                                                                                                                                                           |
| Props and snippets           | Component `types.ts` **and** `.svelte` (`types.ts` is not always exhaustive)                                                                                                                                                                         |
| Tokens and CSS classes       | [`tokens.base.css`](../src/lib/styles/tokens.base.css), [`base.css`](../src/lib/styles/base.css), [`layout.css`](../src/lib/styles/layout.css), [`utilities.css`](../src/lib/styles/utilities.css), [`patterns.css`](../src/lib/styles/patterns.css) |
| Built-in copy                | [`i18n/en.ts`](../src/lib/i18n/en.ts), [`i18n/es.ts`](../src/lib/i18n/es.ts)                                                                                                                                                                         |
| Intent and composition       | [Guide](./GUIDE.md)                                                                                                                                                                                                                                  |
| App integration recipes      | [Consumer reference](./CONSUMER_REFERENCE.md)                                                                                                                                                                                                        |
| Breaking / visual migrations | [Upgrade](./UPGRADE.md)                                                                                                                                                                                                                              |

## When Public Behavior Changes

| Change                                                    | Update                                                                      |
| --------------------------------------------------------- | --------------------------------------------------------------------------- |
| Root component export                                     | [Components](./COMPONENTS.md)                                               |
| Install, theming, layout recipe, CSS family, architecture | [Guide](./GUIDE.md) (the relevant section)                                  |
| Authoring contract, prop naming, or pre-merge checklist   | [Component authoring](./COMPONENT_AUTHORING.md)                             |
| Consumer setup / class recipes used by products           | [Consumer reference](./CONSUMER_REFERENCE.md) when the compact table shifts |
| Visual or migration impact for apps                       | [Upgrade](./UPGRADE.md) (even for CSS-only polish)                          |

Guides route, compare, and explain—they do not mirror full TypeScript or CSS declarations.
