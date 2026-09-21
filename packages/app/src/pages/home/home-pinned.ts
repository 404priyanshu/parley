import { createMemo } from "solid-js"
import { createStore } from "solid-js/store"
import { Persist, persisted } from "@/utils/persist"

type PinnedState = { ids: string[] }

/**
 * Pinned chats.
 *
 * Kept deliberately simple: a persisted list of session ids. Pin state is a
 * local preference rather than server state, so it lives alongside the other
 * per-install preferences instead of on the session record.
 */
export function createHomePinnedController() {
  const [state, setState, , ready] = persisted(Persist.global("home.pinned-chats"), createStore<PinnedState>({ ids: [] }))

  const ids = createMemo(() => new Set(state.ids))

  return {
    ready,
    ids,
    isPinned: (sessionID: string) => ids().has(sessionID),
    toggle: (sessionID: string) => {
      setState("ids", (current) =>
        current.includes(sessionID) ? current.filter((id) => id !== sessionID) : [sessionID, ...current],
      )
    },
  }
}

export type HomePinnedController = ReturnType<typeof createHomePinnedController>
