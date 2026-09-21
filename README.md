<p align="center">
  <img src="packages/identity/mark.svg" alt="Parley" width="96" height="96">
</p>
<p align="center"><strong>Parley</strong></p>
<p align="center">A chat-only desktop app for talking to language models.</p>

---

> [!IMPORTANT]
> **Parley is an independent fork of [OpenCode](https://github.com/anomalyco/opencode).**
> It is **not affiliated with, endorsed by, or supported by** OpenCode or Anomaly Co.
> Please do not report Parley issues to the OpenCode project.

## What it is

Parley takes OpenCode's desktop app — its interface, themes, sounds and provider
setup — and strips it down to a single thing: conversation.

**It has no tools.** It cannot read or write your files, run commands, search the
web, or touch your system in any way. There is no file tree, no diff viewer, no
terminal, no project picker, and no agent switcher. It does not read `AGENTS.md`,
start language servers, or load any project context.

What's left is a fast, native chat client with your own API keys.

| | |
|---|---|
| **Chats** | Stored in `~/Library/Application Support/Parley/chats`. No project folders. |
| **Providers** | Bring your own API key — same provider setup as upstream. OpenCode Zen's free tier does **not** work here: it is restricted to the real OpenCode app. |
| **Themes & sounds** | Inherited from upstream, unchanged. |
| **Telemetry** | None. Error reporting is opt-in via env vars and off by default. |

## Status

Early, but it runs. See [PLAN.md](PLAN.md) for what has landed and what is still open.

## Install

Builds are **unsigned** — Parley has no Apple Developer ID yet. macOS will refuse to
open the app on a double-click and say it is damaged or from an unidentified developer.
That warning is expected for an unsigned build, not a sign anything is wrong.

To open it the first time, either right-click the app and choose **Open**, or clear the
quarantine flag:

```bash
xattr -dr com.apple.quarantine /Applications/Parley.app
```

Only do that for a build you produced yourself or otherwise trust.

## Build it yourself

```bash
bun install
OPENCODE_CHANNEL=prod bun run --cwd packages/desktop build
OPENCODE_CHANNEL=prod bun run --cwd packages/desktop package:mac
```

The `.dmg` and `.zip` land in `packages/desktop/dist/`. Signing and notarization turn on
automatically when signing material is present in the environment (`CSC_LINK`, `CSC_NAME`
or `APPLE_TEAM_ID`), so a machine with a certificate produces a signed build from the
same command.

## Running from source

Requires [Bun](https://bun.sh) 1.3+.

```bash
bun install
bun run --cwd packages/desktop dev
```

> On Node 26, Electron's installer can silently fail to unpack. If the app dies with
> `Error: Electron uninstall`, see the workaround in [PLAN.md](PLAN.md).

## Relationship to OpenCode

Parley exists because OpenCode's desktop client is a genuinely nice piece of
software, and sometimes you want that interface without an agent that can touch
your machine.

Everything good about how this app looks and feels is upstream's work. Everything
removed, and any bug introduced in the removing, is this fork's.

- Upstream: <https://github.com/anomalyco/opencode>
- Upstream docs: <https://opencode.ai/docs> — still the reference for provider and
  theme configuration, which Parley inherits unchanged.

The name "OpenCode", its logo and its wordmark are the upstream project's. Parley
uses its own name, icon and wordmark, and registers its own bundle identifiers,
URL scheme and update feed. It will never pull OpenCode's builds.

## License

Parley is MIT licensed, as is the upstream project it is derived from.
See [LICENSE](LICENSE) for the full text and [NOTICE](NOTICE) for attribution.
