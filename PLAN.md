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

### Phase 1 — chat-only mode ✅ done

A single built-in `chat` agent with every tool denied, a plain chat system prompt, and
no AGENTS.md / LSP / project-context loading.

**Correction to the original plan.** The pre-implementation file list targeted
`packages/core` (the v2, Effect-based stack). That was wrong about what actually runs:
the desktop sidecar serves **v1** code in `packages/opencode`. `/agent` is handled by
`@/agent/agent`, and the chat turn is assembled by `@/session/prompt` → `@/session/tools`
→ `@/session/llm/request`. `packages/core` holds a parallel v2 implementation that the
desktop app does not currently reach.

Both were changed: v1 because it is what runs today, v2 so the fork stays correct as
upstream migrates. Only the v1 edits affect runtime behaviour right now.

**Files changed — v1 (`packages/opencode`), the live path**

| File | Change |
|---|---|
| `src/agent/agent.ts` | Replaced `build`/`plan`/`general`/`explore` with a single `chat` agent (`mode: primary`, `"*": "deny"`, `prompt: PROMPT_CHAT`). Kept `compaction`/`title`/`summary` hidden — session titling needs them. Default-agent sort fallback `"build"` → `"chat"`. |
| `src/agent/prompt/chat.txt` | **New.** Plain conversational system prompt. Selected because `src/session/llm/request.ts` uses `agent.prompt` when set, otherwise the per-model coding prompts — so no `session/prompt/*.txt` edits were needed. |
| `src/session/tools.ts` | **The airtight chokepoint.** `SessionTools.resolve` builds the tool map handed to the provider; built-in, filesystem/plugin and MCP tools all converge here. Gated behind `TOOLS_ENABLED = false`. |
| `src/tool/registry.ts` | `builtin: []`. Permission rules gate *invocation*, not *advertisement*, so the list itself had to be emptied. Removed the orphaned `questionEnabled`. |
| `src/session/instruction.ts` | AGENTS.md / CLAUDE.md / CONTEXT.md discovery (global + every ancestor dir + `config.instructions`, including remote URLs) gated behind `INSTRUCTIONS_ENABLED = false`. |
| `src/session/system.ts` | Dropped the `<env>` block's working directory, worktree root and git status. Model identity and date remain. |
| `src/project/bootstrap.ts` | Removed `lsp` from the init list, so no language servers spawn. The LSP service stays wired — the instance status endpoint still resolves it. |

**Files changed — v2 (`packages/core`), not yet live**

| File | Change |
|---|---|
| `src/plugin/agent.ts` | Same substitution: one `chat` agent, `denyAll()` helper, coding agents removed. |
| `src/agent.ts` | `defaultID` `"build"` → `"chat"`; hardcoded `build` fallback now follows `defaultID`. |
| `src/tool/builtins.ts` | Built-in tool node list emptied. |
| `src/instruction-context.ts` | AGENTS.md loading replaced with a no-op node (export shape preserved for `system-context/builtins.ts`). |
| `src/system-context/builtins.ts` | `<env>` block removed; date-only. |

**Verified** — server run in a clean directory outside any project:

- `/agent` → `chat` (visible) plus `compaction`/`title`/`summary` (hidden). No
  `build`/`plan`/`general`/`explore`.
- `/experimental/tool/ids` → `[]`.
- No language-server processes spawned.
- `tsgo --noEmit` clean for both `core` and `opencode`; `oxlint` 0 errors (the 14
  remaining warnings are all pre-existing upstream).

**Worth knowing**

- Run *inside* a directory with an `.opencode` config, the server still picks up
  config-defined agents and plugin tools from it (running in this repo surfaced
  upstream's own `triage` / `duplicate-pr` agents and `github-*` tools). They are hidden
  and the tool gate blocks them from reaching the model, but Phase 2's hidden chats dir
  is what removes the exposure properly.
- `/experimental/tool/ids` reports the *registry*, not the model-facing map. Plugin tools
  can still appear there while `TOOLS_ENABLED` keeps them out of the conversation.

### Phase 2 — trim the UI ✅ mostly done

Removed: file tree, diff/review panes, terminal, project picker, agent switcher.
Kept: chat, sessions sidebar, model picker, provider/API-key settings, themes, sounds.
All chats live in `~/Library/Application Support/Parley/chats`.

**Correction to the original plan.** The plan's file list was drawn from the legacy
components. The desktop actually renders the **new layout** —
`newLayoutDesignsDefault = true` in `context/settings.tsx` — and its v2 components
(`session-new-design`, `prompt-input-v2`, `project-avatar-v2`), confirmed by reading the
live DOM of the running app over the Electron debug port. Two consequences:

- The new layout already routes sessions as `/server/:serverKey/session/:id`, so there
  was **no `/:dir` coupling to unpick**. `pages/directory-layout.tsx`, `pages/layout.tsx`
  and the legacy home/session files are not on the live path and were left alone.
- The work landed in `pages/new-session/*`, `pages/home.tsx`, `pages/session.tsx` and the
  v2 composer rather than the files originally listed.

**Files changed**

| File | Change |
|---|---|
| `app/src/pages/session.tsx` | Diff/review pane, file tree and terminal gated behind `PANES_ENABLED`. Those three memos are the roots every panel visibility signal derives from, so the `<Show>` blocks collapse and chat takes the full width. |
| `app/src/pages/new-session/new-session-view.tsx` | Project picker, "add project" button, workspace selector and git-status chip removed; props reduced to `input`. |
| `app/src/pages/new-session.tsx` | Dropped the project controller. |
| `app/src/pages/home.tsx` | Projects sidebar removed; single centred column of chats. The utility nav (settings, help) lived in that sidebar on desktop and only appeared below `lg`, so it is now shown at every width — it is the only route to provider settings. |
| `session-ui/src/v2/components/prompt-input/index.tsx` | Agent switcher removed (one agent now); shell menu entry removed. |
| `app/src/components/prompt-input-v2.tsx`, `prompt-input.tsx` | Shell-mode command and keybind removed — it drove the bash tool. |
| `app/src/pages/session/use-session-commands.tsx` | `REMOVED_COMMANDS` filters out terminal/review/file-tree/file-picker commands at registration. |
| `app/src/pages/new-session/use-new-session-commands.tsx` | Dropped `project.select` and the hidden file-picker entry. |
| `desktop/src/main/chats-directory.ts` | **New.** Resolves and creates the fixed chats dir under Electron's `appData`. Keyed on the name "Parley" rather than the bundle id, so it survives the Phase 3 rebrand. |
| `desktop/src/main/ipc.ts` | Exposes it over a *synchronous* channel — the preload is sandboxed (`sandbox: true`), so `sendSync` is the only way to have the path before the first draft tab is built. |
| `desktop/src/preload/{index,types}.ts` | Surfaces `window.api.chatsDirectory`. |
| `desktop/src/main/onboarding.ts` | First launch opens the chats dir instead of creating `~/Documents/Default Project`. |
| `app/src/context/tabs.tsx` | `newDraft` is the single chokepoint every new chat goes through; pins them all to the chats dir. Optional-chained so the web build keeps the caller's value. |
| `app/src/app.tsx` | `window.api.chatsDirectory` added to the `Window` augmentation. |

**Verified** against the running app:

- Project row, agent switcher and `project-avatar-v2` gone from the new-chat screen;
  composer keeps attach, model and model-variant.
- Home shows only chats plus Settings/Help; the settings dialog still opens with its
  **Providers** and **Models** tabs.
- Command palette reduced to Focus input / Open settings / Add files / Choose model —
  no project, terminal, file-tree or review entries.
- `window.api.chatsDirectory` resolves to
  `/Users/<user>/Library/Application Support/Parley/chats`, the directory is created, and
  a newly created chat persists with that directory.
- `tsgo` clean for app, session-ui and desktop. session-ui 83/83 tests pass; app 723/724
  — the one failure (`i18n/desktop-native.test.ts`, Unicode likely-subtags) fails
  identically with these changes stashed, so it is pre-existing and environmental.

**Not done — carried forward**

- **Terminology.** The UI still says "session", not "chat" (`command.session.new` =
  "New session"). `en.ts` alone has ~185 occurrences across 65 locale files; that sweep
  belongs with the Phase 3 rebrand, where the app name changes anyway. "Open project" as
  an *action* is gone, which was the functional half of this item.
- **Pre-existing chats do not migrate.** Tabs and sessions recorded before the storage
  change keep the directory they were created with.
- **`@` context mentions** remain in the composer. With no files, references or
  subagents they may now offer little; worth auditing.
- **Legacy components** (`pages/layout.tsx`, `directory-layout.tsx`, `file-tree.tsx`,
  `terminal.tsx`, legacy home/session) are dead on the live path but still in the tree.
  Deleting them is safe cleanup, deferred to keep this phase reviewable.
- The shell-mode removal was verified at source and in the vite-served modules, not in
  the live palette — synthetic key events do not drive the palette widget.

### Phase 3 — rebrand ✅ mostly done

**Identity** — the fork never claims OpenCode's identity and never pulls its builds.

| | |
|---|---|
| Bundle ids | `ai.opencode.desktop*` → `co.parley.desktop*` |
| Product name | Parley / Parley Dev / Parley Beta |
| Artifacts | `parley-${os}-${arch}.${ext}` |
| URL scheme | `opencode://` → `parley://`. Registering `opencode` would have hijacked the real OpenCode's deep links whenever both apps were installed. |
| Update feed | `anomalyco/opencode` → `404priyanshu/parley` |
| Window title | Parley |

**Artwork** — MIT grants no trademark rights, so no upstream brand art is reused. A new
icon was drawn for the fork (overlapping speech bubbles on a macOS squircle, with alpha),
rendered per channel — amber prod, violet beta, blue dev — as all 49 PNGs per channel plus
`.icns` and a multi-size `.ico`. `wordmark-v2` (upstream's logotype as SVG paths),
`packages/identity` and the shared favicon set were redrawn too.

**Copy** — "OpenCode" → "Parley" across 125 locale files. **"OpenCode Zen" is a
third-party provider service, not this app**, so its 58 occurrences are preserved.

**Stopped contacting upstream**

- Notifications no longer fetch `opencode.ai`'s favicon on every notification, which both
  leaked a request and showed their mark as ours.
- The startup fetch of `opencode.ai/changelog.json` is disabled — it presented OpenCode's
  release notes as Parley's. Re-enable by pointing `CHANGELOG_URL` at a Parley feed.
- Sentry was already env-gated with no hardcoded DSN, so it stays off by default.
- Links to `opencode.ai/docs` are kept deliberately: they are upstream's docs for the
  provider and theme configuration Parley inherits unchanged.

**Licensing** — upstream's `LICENSE` retained with the fork's copyright added alongside;
new `NOTICE` covering attribution and trademarks; `README.md` rewritten to state plainly
that Parley is not affiliated with or endorsed by OpenCode. 21 translated READMEs
describing the upstream product were removed.

**Features** — two of the four already existed upstream and survive the Phase 2 trim:

| Feature | Status |
|---|---|
| Chat search | Already existed — the home list search. |
| Export | Already existed — reachable from the palette and `/export`. |
| Pinned chats | **Built.** Pin from the home list; pinned chats lift to a group at the top however old they are. Local preference, persisted as session ids. |
| Per-chat system prompts | **Built.** Sent per turn as the prompt's `system` field, which the server already appends to the agent's system prompt; upstream's client compat layer simply never forwarded it. Edited via `session.instructions` / `/instructions`. |

**Verified** — the app runs, window title and wordmark read "Parley", the new icon is in
place, and **a real chat round-tripped end to end** (`hello` → a conversational reply,
labelled "Chat"), which confirms Phase 1's chat-only agent works against a live provider.
`tsgo` clean across app/desktop/ui/session-ui; app suite 733 pass, 1 pre-existing failure.

**Open / carried forward**

- ~~The home chat list is not confirmed working.~~ **Fixed and verified.**
  `buildHomeSessionRecords` required every session to belong to a registered project,
  which no chat can satisfy. The lingering "Nothing here yet" after that fix turned out to
  be a stale module that had not hot-reloaded, not a second bug — the session index is
  server-wide, not directory-scoped. Chats now list under "Today", pinning works and
  survives a reload. Chats no longer show "chats" as a project name.
- Terminology: the UI still says "session", not "chat", in ~185 strings across 65 locales.
- `resources/opencode-cli` still ships upstream's CLI binary; a chat-only app probably
  does not need it at all.
- `wsl/runtime.ts` still installs the real OpenCode CLI on Windows/WSL.
- `metainfoFpm` references `resources/<appId>.metainfo.xml`, which does not exist (it did
  not upstream either). Linux packaging only.
- Pre-existing chats and settings do not migrate to the new bundle id.

### Phase 4 — ship 🟡 released, unsigned

- [x] **Unsigned `.dmg` builds and runs.** `OPENCODE_CHANNEL=prod` produces
      `parley-mac-arm64.dmg` (149 MB) plus a `.zip`. The dmg mounts with `Parley.app` and
      the Applications symlink; the bundle reports `co.parley.desktop` / "Parley" /
      `parley://` with the new icon, launches, and stores data under `co.parley.desktop`.
- [x] Signing gated on `CSC_LINK` / `CSC_NAME` / `APPLE_TEAM_ID` being present, so a
      certificate-less machine gets a working unsigned build instead of a notarize
      failure, and a machine that has one still signs.
- [x] `main-parley` pushed to `404priyanshu/parley`. The `upstream` push URL is now
      `DISABLED` so nothing can land on `anomalyco/opencode` by accident.
- [x] README: install instructions covering the Gatekeeper warning unsigned builds
      produce, and how to build one yourself.
- [ ] **Signed + notarized build.** Blocked: needs an Apple Developer Program membership
      and a Developer ID Application certificate. None exists on this machine
      (`security find-identity` → 0 valid identities). Nothing else is in the way — the
      config already turns signing on when the certificate is there.
- [x] **GitHub release cut**: [`parley-v0.1.0`](https://github.com/404priyanshu/parley/releases/tag/parley-v0.1.0),
      public, with `parley-mac-arm64.dmg` attached. Uploaded asset verified against the
      local build by size and sha256
      (`e6b64f60ea4e962b898ee37a2ac3e00763c7621dd8366a1ff2138cb2f6ddc6b6`).
      Tagged `parley-v0.1.0` rather than `v0.1.0`: the fork inherited upstream's tags, so
      plain semver tags up to `v1.18.31` are already taken. Keep the `parley-` prefix.
- [ ] **Auto-update.** The release now carries `latest-mac.yml` and the `.zip` alongside
      the `.dmg`, so the feed is complete and internally consistent (manifest hashes and
      sizes verified against the served assets). Updates still will not *apply*:
      electron-updater validates the payload's code signature on macOS, and these builds
      are unsigned. Two further things to know when a certificate arrives:
      - ~~`latest-mac.yml` reports upstream's version.~~ Fixed: the fork is versioned
        `0.1.0` across all 28 packages, and `packages/script` no longer derives release
        versions by fetching opencode-ai from npm — it reads the root `package.json`.
      - The `.blockmap` files are now uploaded too, so differential updates can work
        rather than pulling a full ~150 MB each time.
- [x] **Demo GIF** — `docs/assets/parley-demo.gif`, shown at the top of the README.
      6.3s, 285 KB: the empty new-chat screen, a question typed and sent, and the reply
      rendering with a markdown table. Captured by driving the running app over the
      Electron debug port (CDP `Input.insertText` + `Page.captureScreenshot`), cropped
      above the tab bar to keep the dev build's DEV badge out, and encoded with ffmpeg
      through palettegen/paletteuse. The recipe is worth reusing: capture frames, find
      the last frame whose hash changes (the response finished well before capture did),
      trim there and hold the final frame, or two thirds of the GIF is a freeze.

**Found while packaging**

- `main/index.ts` carried a *second* `APP_IDS` map, separate from the electron-builder
  one, driving `userData` and the app user model id — the packaged app was still storing
  everything under `ai.opencode.desktop`. Both maps now agree.
- `migrate.ts` imported data from `~/Library/Application Support/ai.opencode.*`, which is
  the real OpenCode's directory. In a fork that means silently absorbing another
  application's settings on first launch. Disabled.
- **OpenCode Zen's free tier is gated to the real OpenCode app** — it returns
  "OpenCode's free tier can only be used from within OpenCode". Parley needs the user's
  own provider API key; noted in the README.

---

## Open questions

- ~~Which of `packages/core` (v2) and `packages/opencode` (v1) the desktop actually
  uses.~~ **Answered in Phase 1: v1 is the live path.** Keep this in mind for Phase 2 —
  UI-adjacent server behaviour should be traced in `packages/opencode` first.
- ~~Many components exist in both `foo.tsx` and `foo-v2.tsx` form behind a flag.~~
  **Answered in Phase 2: the desktop renders the v2 / new-layout generation**
  (`newLayoutDesignsDefault = true`). The legacy files are dead on the live path and are
  still in the tree pending cleanup.
