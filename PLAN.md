# Parley — chat-only fork of the OpenCode desktop app

Parley is a fork of the OpenCode desktop app that keeps the UI/UX, sounds, themes and
provider setup, but strips it down to **chat only**: no tools, no file tree, no diffs,
no terminal, no project context.

**Not affiliated with, endorsed by, or supported by OpenCode / Anomaly Co.**

---

## Pinned upstream

| | |
|---|---|
| Upstream | `anomalyco/opencode` (remote: `upstream`) |
| Fork | `404priyanshu/parley` (remote: `origin`) |
| **Pinned tag** | **`v1.18.31`** — latest stable release, 2026-09-14 |
| Tag commit | `014614d35b397775e5d397a490fc72368c894ec2` |
| Work branch | `main-parley`, branched from `v1.18.31` |

Upstream's default branch is `dev` (a moving target). We deliberately branch from the
release tag, not `dev`.

### Toolchain

- `bun@1.3.14` is the declared package manager (bun 1.4.2 works).
- Install: `bun install` from the repo root.
- Desktop dev: `bun run --cwd packages/desktop dev` (runs `predev` → `electron-vite dev`).
- Electron 42.3.3 — **not** Tauri, so no Rust toolchain is needed.

`predev` builds the server bundle (`packages/opencode` → `packages/opencode/dist/node`),
downloads the Electron binary, copies channel icons, and fetches a prebuilt
`@opencode-ai/cli` into `resources/`.

> Note: the dev `channel` is derived from the git branch name, so on `main-parley` the
> dev build self-reports version `0.0.0-main-parley-<timestamp>`. Harmless, but it also
> means the sqlite file is channel-scoped (`opencode-main-parley.db`).

### Known setup gotcha — Electron install

On Node 26, electron's `install.js` **silently fails to extract** its zip: `extract-zip`
stops after the first entry, leaving `node_modules/electron/dist` with only
`LICENSES.chromium.html`, no `path.txt`, and an exit code of 0. `electron-vite dev` then
dies with `Error: Electron uninstall`.

The downloaded zip itself is fine. Fix by extracting it manually:

```bash
ED=$(node -e "console.log(require('path').dirname(require.resolve('electron/package.json')))")
Z=$(ls ~/Library/Caches/electron/*/electron-v*-darwin-arm64.zip | head -1)
rm -rf "$ED/dist" && mkdir -p "$ED/dist"
unzip -q -o "$Z" -d "$ED/dist"
printf 'Electron.app/Contents/MacOS/Electron' > "$ED/path.txt"
```

Worth pinning a supported Node version (`.nvmrc` / `engines`) in Phase 3 so this does
not recur for other contributors.

---

## Package map (`packages/`)

| Package | Purpose |
|---|---|
| `app` | SolidJS web UI shared by desktop and web — routes, pages, dialogs, settings, prompt input. |
| `cli` | CLI command framework (commands, services, TUI bootstrap). |
| `client` | Generated typed HTTP client derived from the server's Effect `HttpApi`. |
| `codemode` | Effect-native confined code execution over schema-described tools. |
| `console` | Cloud console site (SST app + core + functions); unrelated to the desktop app. |
| `containers` | Container/image build definitions used for publishing and CI. |
| `core` | **Effect-based v2 domain core** — agents, tools, sessions, permissions, config, providers, storage. |
| `desktop` | **Electron shell** (main / preload / renderer) that wraps `packages/app` and runs the server as a sidecar. |
| `docs` | Documentation site content (Mintlify). |
| `effect-drizzle-sqlite` | Effect integration layer for Drizzle ORM over SQLite. |
| `effect-sqlite-node` | Effect SQLite client bindings for Node. |
| `enterprise` | SolidStart enterprise / self-host web app. |
| `function` | Deployable cloud functions (API + GitHub webhooks). |
| `http-recorder` | Record/replay Effect HTTP traffic with deterministic cassettes (test tooling). |
| `httpapi-codegen` | Codegen turning the Effect `HttpApi` into client and OpenAPI artifacts. |
| `identity` | Brand assets — logo marks and app icons. |
| `llm` | Schema-first LLM core: one typed request/response/event/tool language plus provider adapters. |
| `opencode` | **The server + CLI runtime.** Built to `dist/node` and embedded by the desktop app as its sidecar. Also holds LSP, MCP, legacy session/tool code. |
| `plugin` | Public `@opencode-ai/plugin` API surface for third-party plugins. |
| `protocol` | Shared HTTP API route groups, middleware and error types. |
| `schema` | Shared Effect Schema definitions (agent, config, events, sessions, credentials). |
| `script` | Internal build/release helpers (version, channel, team). |
| `sdk` | Generated public JS SDK plus `openapi.json`. |
| `sdk-next` | Effect-native in-process SDK host that will replace the generated SDK. |
| `server` | Effect `HttpApi` server — handlers, middleware, auth, CORS. |
| `session-ui` | Reusable session/chat rendering components (message timeline, diffs, review panes). |
| `slack` | Slack bot integration creating threaded conversations. |
| `stats` | Usage-stats site (core + SolidStart app + Lambda entrypoints). |
| `storybook` | Storybook harness for UI components. |
| `tui` | Terminal UI built on opentui + SolidJS. |
| `ui` | **Shared design system** — themes, audio assets, icons, primitives. Source of the sounds and themes we keep. |
| `web` | Astro/Starlight marketing + docs website. |

**The three that matter for Parley:** `desktop` (Electron shell) · `app` + `ui` + `session-ui` (web UI) · `opencode` + `core` + `server` (server).

---

## License

Upstream is **MIT** (`LICENSE`, "Copyright (c) 2025 opencode"). MIT permits forking,
modifying, rebranding, redistributing and even selling, with essentially one obligation:

1. **Keep the copyright notice and the MIT permission text** in all copies or
   substantial portions. Practically: keep upstream's `LICENSE` file in the repo and
   ship it in the packaged app. Add our own copyright line alongside it rather than
   replacing theirs.
2. There is **no warranty and no liability** — keep the disclaimer paragraph intact.
3. MIT grants **no trademark rights.** "OpenCode" is the upstream project's name and
   branding. Renaming to Parley is not just cosmetic, it is the thing that keeps us
   clear of trademark issues, so the rebrand must be thorough: name, icon, bundle ID,
   and no implication of affiliation.
4. Add a `NOTICE`/README section stating Parley is a fork of OpenCode, linking upstream,
   and disclaiming affiliation or endorsement.

Vendored sub-licenses to preserve: `packages/ui/LICENSE`, `packages/docs/LICENSE`,
`packages/http-recorder/LICENSE`, plus `patches/` and Electron's own
`LICENSES.chromium.html`.

---

## Phases

### Phase 1 — chat-only mode

A single built-in `chat` agent with every tool denied, a plain chat system prompt, and
no AGENTS.md / LSP / project-context loading.

The permission model already supports this: `compaction`, `title` and `summary` agents
are defined today with `{ action: "*", resource: "*", effect: "deny" }`. Phase 1 mostly
reuses that pattern rather than inventing a new one.

- [ ] Add a `chat` agent (`mode: "primary"`, plain chat system prompt, `*/*` denied).
- [ ] Make `chat` the default and the only user-selectable agent; drop `build`, `plan`,
      `general`, `explore` from the selectable set. Keep `title` / `summary` /
      `compaction` (hidden) — session titling depends on them.
- [ ] Stop registering built-in tools.
- [ ] Stop loading AGENTS.md, LSP and project/system context.

**Files expected to change**

| File | Change |
|---|---|
| `packages/core/src/plugin/agent.ts` | The main one. Defines `build`/`plan`/`general`/`explore`/`compaction`/`title`/`summary` and their permission rulesets. Add `chat`; remove or hide the coding agents. |
| `packages/core/src/agent.ts` | `defaultID = ID.make("build")` → `"chat"`; the `resolve`/`select` fallback at ~L73 also hardcodes `build`. |
| `packages/core/src/tool/builtins.ts` | Single chokepoint listing the 12 built-in tool nodes (bash, edit, read, write, glob, grep, webfetch, websearch, skill, todowrite, apply-patch, question). Reduce to an empty `deps` list. |
| `packages/core/src/tool/registry.ts` | Verify materialization degrades cleanly to zero tool definitions. |
| `packages/core/src/instruction-context.ts` | AGENTS.md discovery (`targets: ["AGENTS.md"]`, global `AGENTS.md`). Disable. |
| `packages/core/src/system-context/builtins.ts` | Injects `<env>` (cwd, workspace root, git repo, platform) into the system prompt. Strip to date-only. |
| `packages/core/src/config/lsp.ts` | LSP config surface — disable. |
| `packages/opencode/src/lsp/*` | LSP client/server/launch; stop starting language servers. |
| `packages/core/src/session/prompt.ts` | Prompt assembly — ensure the plain chat prompt is used. |
| `packages/opencode/src/session/prompt/*.txt` | Per-model coding prompts (`anthropic.txt`, `gpt.txt`, `beast.txt`, …). Add/route to a plain chat prompt. |
| `packages/core/src/plugin/skill/*` | Skills are tool-backed; disable. |

### Phase 2 — trim the UI

Remove: file tree, diff/review panes, terminal, project picker, agent switcher.
Keep: chat, sessions sidebar, model picker, provider/API-key settings, themes, sounds.
Replace "open project" with "new chat"; all sessions live in a hidden directory at
`~/Library/Application Support/Parley/chats`.

The load-bearing problem: routes and sessions are currently keyed by **directory**
(`/:dir/session/:id`). Phase 2 is mostly about severing that.

**Files expected to change**

*Routing / project coupling*
| File | Change |
|---|---|
| `packages/app/src/app.tsx` | Routes are `/:dir` → `DirectoryLayout` → `/session/:id`. Collapse to directory-free session routes. |
| `packages/app/src/pages/directory-layout.tsx` | Directory-scoped layout wrapper — remove. |
| `packages/app/src/pages/home.tsx`, `pages/home/home-projects*.tsx` | Projects list on the home screen — remove; keep `home-sessions*`. |
| `packages/app/src/pages/new-session/*`, `pages/new-session.tsx` | "New session in a directory" → "new chat". |
| `packages/app/src/components/directory-picker.tsx`, `dialog-select-directory{,-v2}.tsx` | Project picker — remove. |
| `packages/app/src/components/dialog-edit-project{,-v2}.tsx`, `edit-project.ts` | Project management — remove. |
| `packages/app/src/components/prompt-project-selector.tsx`, `prompt-workspace-selector.tsx` | Project/workspace selectors in the composer — remove. |

*Panes to remove*
| File | Change |
|---|---|
| `packages/app/src/components/file-tree.tsx`, `file-tree-v2.tsx` (+ models/tests) | File tree. |
| `packages/app/src/pages/session/file-tabs.tsx`, `file-tab-scroll.ts` | File tabs. |
| `packages/app/src/pages/session/review-tab.tsx`, `v2/review-panel-v2*.tsx`, `v2/review-diff-kinds.ts` | Diff/review panes. |
| `packages/session-ui/src/components/session-review*.tsx`, `session-diff.ts`, `v2/components/session-review*` | Diff/review rendering. |
| `packages/app/src/components/terminal.tsx`, `pages/session/terminal-panel{,-v2}.tsx`, `terminal-label.ts` | Terminal. |
| `packages/app/src/components/session/session-sortable-terminal-tab{,-v2}.tsx` | Terminal tabs. |
| `packages/app/src/pages/session/session-side-panel.tsx`, `session-panel-layout.ts`, `session-panel-width.ts` | Side panel that hosts tree/diff/terminal. |
| `packages/app/src/components/dialog-select-file.tsx` | File picker. |
| `packages/app/src/context/local-agent.ts`, `utils/agent.ts` | Agent switcher state. |
| `packages/app/src/components/dialog-select-mcp.tsx` | MCP picker (tool-related). |

*Keep, but re-point*
| File | Change |
|---|---|
| `packages/app/src/components/settings-providers.tsx`, `settings-models.tsx`, `dialog-select-model.tsx`, `dialog-connect-provider.tsx`, `dialog-custom-provider.tsx` | **Keep** — provider/API-key setup and model picker. |
| `packages/app/src/components/settings-general.tsx`, `settings-keybinds.tsx`, `settings-dialog.tsx` | **Keep**; prune tool/project rows. |
| `packages/ui/src/theme/*`, `packages/ui/src/assets/audio/*`, `packages/app/src/utils/sound.ts` | **Keep unchanged** — themes and sounds. |
| `packages/app/src/components/command-palette.ts`, `dialog-command-palette-v2.tsx` | Prune commands for removed features. |
| `packages/app/src/components/titlebar*.tsx` | Tab strip/history — retarget from project tabs to chats. |
| `packages/app/src/pages/session/use-session-commands.tsx`, `use-composer-commands.tsx` | Prune tool/file/terminal commands. |

*Storage relocation*
| File | Change |
|---|---|
| `packages/core/src/global.ts` | `const app = "opencode"` drives every XDG data/config/state path. |
| `packages/core/src/database/database.ts` | DB filename `opencode.db` / `opencode-<channel>.db`. |
| `packages/core/src/database/path.ts` | `storagePath()` resolution. |
| `packages/desktop/src/main/sidecar.ts` | Sets `XDG_STATE_HOME` from Electron's `userDataPath`. |
| `packages/desktop/src/main/index.ts`, `store.ts`, `store-keys.ts` | Electron `userData` location and persisted store. |
| `packages/core/src/project.ts`, `src/project/*` | Project resolution — pin to one hidden chats dir instead of user-chosen directories. |

### Phase 3 — rebrand

- [ ] Name, icon, bundle ID: `packages/desktop/electron-builder.config.ts`
      (`APP_IDS` = `ai.opencode.desktop{,.dev,.beta}` → `co.parley.desktop…`,
      `productName`, `artifactName`, `executableName`), `packages/desktop/icons/*`,
      `packages/desktop/scripts/copy-icons.ts`, `packages/identity/*`.
- [ ] Window titles / menus: `packages/desktop/src/main/menu.ts`, `windows.ts`,
      `packages/app/src/i18n/*`.
- [ ] README note: fork of OpenCode, link upstream, **not affiliated or endorsed**.
      Keep upstream `LICENSE` + add `NOTICE`.
- [ ] Strip upstream-specific telemetry/updater endpoints (Sentry DSN,
      `packages/desktop/src/main/updater*.ts`) — do not phone home to OpenCode.
- [ ] New features: per-chat system prompts, chat search, export, pinned chats.

### Phase 4 — ship

- [ ] Signed + notarized `.dmg` (`bun run --cwd packages/desktop package:mac`).
- [ ] GitHub release on `404priyanshu/parley`.
- [ ] README with demo GIF.

---

## Open questions

- `packages/core` (v2, Effect) and `packages/opencode` (v1) both carry session/tool code.
  Phase 1 targets `core`, but `opencode` must be checked for v1 fallback paths still
  reachable from the desktop sidecar.
- Many components exist in both `foo.tsx` and `foo-v2.tsx` form behind a flag. Confirm
  which generation the desktop build actually renders before deleting either.
