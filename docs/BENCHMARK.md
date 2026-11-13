# Browser benchmark — 2.0.0

Final source measured **2026-11-13**, including the light-border and control-shadow adjustment, against the 1.2.0 source at commit `f9826b8`, on Apple M4 (arm64), macOS 27.0.1, Node 26.13.1, headless Chromium **156.0.8078.4**. The benchmark uses a real browser, production Vite builds and the same installed toolchain for both versions. Transfer sizes are reported separately in the [Lightweight Contract](../README.md#lightweight-contract).

## Fixture and method

[`scripts/benchmark.mjs`](../scripts/benchmark.mjs) renders 60 cards in six columns. Each contains a Button, Chip, Progress and Slider: **300 library components**, covering all six semantic colors. Both pages use a 1440 × 1000 viewport and reduced motion.

For each theme and version, the script discards **10 warmup rounds** and records **30 samples**, alternating baseline/current execution order between rounds in one Chromium process. Each sample:

1. Mounts the fixture, flushes Svelte updates and forces style/layout through a bounding-box read.
2. Sets all 60 range inputs to 75, dispatches input events, flushes updates and forces layout again.
3. Unmounts the fixture and awaits completion.

Times are in milliseconds. The script reports the sorted sample at index `floor(n / 2)` as the median and nearest-rank p95. For 30 samples, these are the 16th and 29th sorted values. Results below are rounded to one decimal place.

## Results

| Theme | Operation                   | Baseline median | 2.0 median | Baseline p95 | 2.0 p95 |
| ----- | --------------------------- | --------------: | ---------: | -----------: | ------: |
| Light | Mount + style/layout        |            12.0 |       12.2 |         14.6 |    14.3 |
| Light | Slider input + style/layout |             5.5 |        5.5 |          7.0 |     6.7 |
| Light | Unmount                     |             0.7 |        0.7 |          0.9 |     1.0 |
| Dark  | Mount + style/layout        |            12.1 |       12.2 |         12.9 |    14.2 |
| Dark  | Slider input + style/layout |             8.9 |        8.9 |          9.9 |    10.5 |
| Dark  | Unmount                     |             0.7 |        0.7 |          0.9 |     0.9 |

Median mount/layout increases by **0.2 ms in light** and **0.1 ms in dark**; median update and unmount times are unchanged to one decimal place. Dark mount p95 increases by **1.3 ms** and dark update p95 by **0.6 ms**. Light mount/update p95 decrease by 0.3 ms, while light unmount p95 rises by 0.1 ms. The measured result is mixed: it does not establish a runtime speedup or an improvement in every metric. Repeated runs are needed to distinguish small changes from machine/browser noise.

These timings **do not measure GPU paint/compositing**, network loading, hydration, user-perceived responsiveness, animation smoothness or every component. Layout is forced synchronously, but paint is not awaited. They provide no basis for claiming Lumi is the fastest library or that every application becomes faster. Re-run on representative consumer pages and target devices before drawing broader conclusions.

## Reproduce

Install the repository dependencies, extract the baseline into a temporary directory, and install its locked dependencies. Run from the current repository root:

```bash
pnpm install --ignore-scripts --frozen-lockfile
lumi_baseline_dir=$(mktemp -d /tmp/lumi-baseline.XXXXXX)
git archive f9826b8 | tar -x -C "$lumi_baseline_dir"
pnpm --dir "$lumi_baseline_dir" install --ignore-scripts --frozen-lockfile
```

Point `PLAYWRIGHT_MODULE` to an existing Playwright JavaScript module. The library does not add Playwright as a runtime dependency. If Playwright is not already available, install it in a separate tooling directory and install its Chromium browser:

```bash
lumi_browser_tools=$(mktemp -d /tmp/lumi-browser-tools.XXXXXX)
printf '{"private":true,"type":"module"}\n' > "$lumi_browser_tools/package.json"
pnpm --dir "$lumi_browser_tools" add -D playwright
pnpm --dir "$lumi_browser_tools" exec playwright install chromium
PLAYWRIGHT_MODULE="$lumi_browser_tools/node_modules/playwright/index.mjs" \
  node scripts/benchmark.mjs "$lumi_baseline_dir" > /tmp/lumi-benchmark.json
```

Optionally provide `CHROMIUM_PATH=/absolute/path/to/chromium` to choose a browser executable. Record the browser version emitted in the JSON; a different browser or toolchain can produce different timings. For repeated comparisons, retain the tooling lockfile and use the same executable. The script cleans up its fixture builds and servers; the baseline and optional tooling directories remain available for inspection.

To reproduce the bundle-size comparison, run `pnpm run package && pnpm run size` in each source directory. Use identical dependency resolutions and record any toolchain changes when comparing runs.
