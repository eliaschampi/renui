# Upgrade

Consumer migration from **1.x to 2.0**. Use **pnpm** only. Source remains authoritative.

## 1.x → 2.0.0

This is a **breaking CSS release**. Component props and entry points remain available, but applications that consume removed tokens must migrate. Lumen replaces decorative glass and gradient panels with opaque surfaces, shared tone roles, and a brand-tinted canvas.

```bash
pnpm add @lumi-ui/svelte@^2.0.0
```

Includes the 1.2.1 fixes for narrow table pagination and scroll chaining. The current library targets left-to-right interfaces; RTL is not a supported contract.

### Token migration

The following tokens are removed; replace their uses and remove obsolete overrides. These replacements express the new visual role, not a pixel-identical rendering of 1.2.

| Removed token(s)                                                                                 | Replacement / action                                                                                                           |
| ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------ |
| `--lumi-control-radius`                                                                          | `--lumi-radius-control`                                                                                                        |
| `--lumi-color-surface-glass`, `--lumi-color-surface-glass-strong`                                | `--lumi-color-surface` or `--lumi-color-surface-raised`                                                                        |
| `--lumi-color-border-glass`                                                                      | `--lumi-color-border`                                                                                                          |
| `--lumi-color-primary-50`                                                                        | `--lumi-color-primary-bg` for soft semantic containers                                                                         |
| `--lumi-color-gray-400`                                                                          | `--lumi-color-text-muted` for secondary content                                                                                |
| `--lumi-gradient-app`                                                                            | `--lumi-color-background`                                                                                                      |
| `--lumi-gradient-card`, `--lumi-gradient-card-hover`                                             | `--lumi-color-surface-card`, `--lumi-color-surface-card-hover`                                                                 |
| `--lumi-gradient-subtle`, `--lumi-gradient-glass-sidebar`, `--lumi-gradient-sidebar-header`      | Choose the owning `--lumi-color-surface-*` role                                                                                |
| `--lumi-floating-surface-bg`, `--lumi-floating-surface-border`, `--lumi-floating-surface-shadow` | `--lumi-color-surface-raised`, `--lumi-color-border`, `--lumi-shadow-md`; custom floating overrides belong on `.lumi-floating` |
| `--lumi-state-bg-strength`                                                                       | Semantic `--lumi-color-{role}-bg`, or `.lumi-tone` with `--lumi-tone-soft` / `--lumi-tone-strong`                              |
| `--lumi-border-width-accent`                                                                     | Choose a token from the standard thin/base/thick border scale                                                                  |
| `--lumi-gradient-card-sheen`, `--lumi-card-sheen-opacity`, `--lumi-sidebar-header-veil`          | Remove decorative layers                                                                                                       |
| `--lumi-app-background-accent`, `--lumi-app-pattern-size`, `--lumi-app-pattern-line-color`       | Remove canvas decoration; custom patterns belong to the consumer                                                               |
| `--lumi-blur-sm`, `--lumi-surface-saturation`                                                    | Remove default blur/saturation overrides; cards retain the optional `--lumi-surface-blur-filter` hook                          |

### Shared tone roles

Use semantic `color` props as before. For consumer CSS, `.lumi-tone` anchors the primary tone, and `.lumi-tone--secondary`, `--success`, `--warning`, `--danger` or `--info` selects another role. Apply the base class to every element that changes accent; otherwise derived custom properties inherit the ancestor's resolved tone.

- `--lumi-tone-soft`, `--lumi-tone-strong`, `--lumi-tone-ink`: containers and their text; theme planes are controlled by `--lumi-tone-{soft,strong,ink}-lc`.
- `--lumi-tone-beam`: directional value fill derived from the solid and the shared `--lumi-sun` / `--lumi-dusk` seeds.
- `--lumi-color-hover`: neutral hover wash; reserve semantic color for meaning and selection.

Theme seeds remain the customization entry point. Tone planes preserve hue while normalizing lightness/chroma; validate custom seeds and plane overrides in both themes. Relative OKLCH colors are required by these recipes.

### Light and dark surface changes

Light borders now mix ink at 7% (standard) and 12% (strong), and `--lumi-control-shadow` is `none`. Dark keeps 10% / 16% borders and its inset control shadow. Focus tokens and keyboard outlines are unchanged by this adjustment; do not remove the focus indicator when removing decorative shadows.

### Visual checks for consumers

Review light/dark forms, navigation, status messages, tables and overlays. Switchers now use a recessed track with a raised active pill. Alerts use a soft status surface; notifications use a raised neutral surface with a solid status icon. The `.lumi-bg--glass` utility remains available but renders an opaque surface. Progress and Slider share the directional beam; reduced motion and semantic values remain in place.

Check keyboard focus, disabled/loading states and responsive layouts after replacing tokens. Compare production bundles using the same toolchain and fixture; a smaller bundle is not proof of faster rendering.

Earlier migration notes are preserved in the [1.x upgrade archive](./archive/UPGRADE-1.x.md).
