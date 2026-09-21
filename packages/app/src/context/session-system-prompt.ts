/**
 * Per-chat system prompts.
 *
 * Sent with each turn as the prompt's `system` field, which the server appends
 * to the agent's own system prompt (see session/llm/request.ts). Keeping this
 * client-side means it applies to every turn in a chat without a schema change
 * on the session record.
 *
 * Deliberately a plain module-level store rather than a Solid context: the
 * submit path reads it directly, and threading a context through every caller
 * of `sendFollowupDraft` would buy nothing.
 */
const STORAGE_KEY = "parley.session-system-prompts"

type State = Record<string, string>

let memory: State | undefined

function read(): State {
  if (memory) return memory
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY)
    memory = raw ? (JSON.parse(raw) as State) : {}
  } catch {
    // Private windows, cleared site data and the thumbnail renderer can all
    // throw here. An empty map is the correct fallback.
    memory = {}
  }
  return memory
}

function write(state: State) {
  memory = state
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Keep the in-memory value; persistence is best effort.
  }
}

export const sessionSystemPrompts = {
  get(sessionID: string): string | undefined {
    const value = read()[sessionID]?.trim()
    return value ? value : undefined
  },
  set(sessionID: string, value: string) {
    const next = { ...read() }
    const trimmed = value.trim()
    if (trimmed) next[sessionID] = trimmed
    else delete next[sessionID]
    write(next)
  },
  clear(sessionID: string) {
    sessionSystemPrompts.set(sessionID, "")
  },
  /** Test seam. */
  reset() {
    memory = undefined
  },
}
