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
| **Providers** | Bring your own API key — same provider setup as upstream. |
| **Themes & sounds** | Inherited from upstream, unchanged. |
| **Telemetry** | None. Error reporting is opt-in via env vars and off by default. |

## Status

Early. Phases 1–3 of the plan are done; see [PLAN.md](PLAN.md) for what has landed
and what is still open. There is no packaged release yet — run it from source.

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
