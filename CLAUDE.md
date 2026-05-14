# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Yarn 4 + Lerna-lite monorepo. All scripts run from the repo root unless noted.

- `yarn build` — `tsc --build` across the workspace via root project references in `tsconfig.json`. Builds emit to each package's `lib/`.
- `yarn build:watch` — incremental build in watch mode.
- `yarn test` — runs Vitest once (`vitest --run`) across both packages via `vitest.workspace.ts`.
- `yarn test:watch` — Vitest in watch mode.
- `yarn test:coverage` — Vitest with coverage.
- `yarn lint` / `yarn lint:fix` — ESLint with cache (`.eslintcache` is committed-ignored). Type-aware rules require a successful `yarn build` of the package's tsconfig because the ESLint config points `parserOptions.project` at each `packages/*/tsconfig.json`.
- Run a single package's scripts: `yarn workspace @systemd-js/conf test` (or `lint`, `build`, etc.). Same scripts exist on each package.
- Run a single test file or test name: `yarn workspace @systemd-js/conf test src/__tests__/service.test.ts` or filter with `-t "<name pattern>"`.

Node `^24` is the declared engine; CI uses Node 24. Husky `pre-commit` runs `yarn test` (not lint-staged — `lint-staged` is configured but not wired into a hook); `commit-msg` runs commitlint with `@commitlint/config-conventional` and a **mandatory non-empty scope** (e.g. `feat(conf): ...`, `fix(ctl): ...`).

## Releases

`master` is the only release branch. Releases are fully automated by `.github/workflows/publish.yaml` on PR merge: it runs `lerna version --conventional-commits` then `lerna publish from-git`. Both packages are versioned in lockstep (`lerna.json` `version`). Don't bump versions or edit `CHANGELOG.md` by hand — conventional-commit messages drive both.

## Architecture

Two packages with a strict dependency direction: **`conf` is pure** (parse/build), **`ctl` wraps the OS** (`systemctl` + filesystem) and depends on `conf`.

### `@systemd-js/conf` — unit file model

The shape every unit follows (`Service`, `Timer`, `Container`):

1. A TypeScript `interface` for each section (`UnitSection`, `ServiceSection`, `TimerSection`, `InstallSectionConfig`, `ExecSectionConfig`, `KillSectionConfig`, `ResourceSectionConfig`, `ContainerSection`) that mirrors the systemd man-page directives 1:1, with the man-page text preserved as JSDoc.
2. A Zod schema declared via the `implement<Interface>().with({ ... })` helper in `utils.ts`. This helper *requires* the schema to cover every key of the interface (and only those keys) — it's how interface and runtime validator stay in sync. When you add a directive, add it to the interface, the schema, **and** the builder.
3. A `*SectionBuilder` class with chainable `setX()` setters and a `toObject()` that re-validates through the schema.
4. A top-level `Unit` class (`Service`/`Timer`/`Container`) that composes the section builders, exposes `getXSection()` accessors, and implements `AbstractUnit` (`toObject`, `toINIString`, `equals`) plus statics `getType()`, `fromObject(obj)`, `fromINI(ini)`.

Section builders share behavior via **runtime mixins**, not inheritance: `ServiceSectionBuilder` declares `extends ExecSectionBuilder, KillSectionBuilder, ResourceSectionBuilder` as a TypeScript `interface` (declaration-merging on the class), and `applyMixins(...)` from `utils.ts` copies the prototypes at module load. `TimerSectionBuilder` does the same with `ExecSectionBuilder`. The `@typescript-eslint/no-unsafe-declaration-merging` rule is disabled in `eslint.config.js` specifically to allow this.

`INI` (`ini.ts`) is the only (de)serializer. It is **not** a full systemd parser: no quoting, no escaping, no continuation-line semantics beyond a basic `\\\n` strip. Booleans round-trip as `yes`/`no`; multiple assignments to the same key collapse into a string array (e.g. multiple `ExecStartPre=`); `1`/`0` warn and are coerced to booleans.

`Container` units are quadrux-wrapped: they have `[Unit]`, `[Container]`, optional `[Install]`, **and** optional `[Service]` (Quadlet/podman-systemd convention).

All unit equality (`equals`) is `JSON.stringify(toObject())` — order-sensitive. Don't reorder builder keys casually.

### `@systemd-js/ctl` — runtime control

`ctl.ts` is the entire surface. It maps unit names to filesystem paths:
- `*.service`, `*.timer` → `/etc/systemd/system/<name>.<type>`
- `*.container` → `/etc/containers/systemd/<name>.<type>` (Quadlet location)

Type detection: pass an explicit `Unit` instance (`(unit.constructor as typeof Service).getType()`) or it's parsed from the filename extension. `enable`/`disable` reject containers (Quadlet doesn't use systemctl enable). `write()` reads the existing on-disk unit (if any), compares via `unit.equals(current)`, and returns `"created" | "updated" | "unchanged"` — only writing on diff.

Every other operation shells out via `execSync("systemctl ...")` — no daemon-reload is implicit, callers must invoke `daemonReload()` themselves after `write()` if they want systemd to pick up changes. There is no error wrapping; failures throw the raw `execSync` error. The README explicitly notes "lack proper error handling" — keep that in mind before adding swallowing try/catches.

The `Ctl` class is a thin stateful wrapper around the same functions; it caches `current` (on-disk unit) at construction time, so a second `new Ctl(name)` is needed to see external changes.

## Conventions

- ESM only (`"type": "module"`). Relative imports must use the **`.js` extension** even from `.ts` source (e.g. `import { INI } from "./ini.js"`) — required by Node ESM resolution after `tsc` emits `.js`.
- The `@chyzwar/eslint-config/node` config and `@chyzwar/tsconfig/lib.json` are external; behavior is dictated there, not in-repo. Don't fight the formatter — run `yarn lint:fix`.
- Keep the man-page JSDoc verbatim when adding new directives (`exec.ts`, `service.ts` etc. follow this pattern). The pinned reference is systemd v255.4.
- Tests live in `packages/*/src/__tests__/*.test.ts` and import from sibling files using the `.js` extension.
