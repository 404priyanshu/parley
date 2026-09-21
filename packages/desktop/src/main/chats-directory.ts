import { mkdirSync } from "node:fs"
import { join } from "node:path"
import { app } from "electron"

/**
 * Chat-only fork: every chat lives in one fixed, hidden directory.
 *
 * Upstream scoped each session to a user-chosen project directory or git
 * worktree. Parley has no project concept, so all chats share a single folder
 * the user never picks and never sees:
 *
 *   macOS   ~/Library/Application Support/Parley/chats
 *   Linux   ~/.config/Parley/chats
 *   Windows %APPDATA%\Parley\chats
 *
 * `appData` is the per-user application-data root, so this resolves to the
 * documented macOS path. It is deliberately independent of the app's bundle id
 * so the directory survives the Phase 3 rebrand unchanged.
 */
export const CHATS_APP_DIRECTORY = "Parley"
export const CHATS_DIRECTORY = "chats"

export function chatsDirectory() {
  const dir = join(app.getPath("appData"), CHATS_APP_DIRECTORY, CHATS_DIRECTORY)
  mkdirSync(dir, { recursive: true })
  return dir
}
