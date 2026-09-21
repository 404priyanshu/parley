import { describe, expect, test } from "bun:test"
import { DateTime } from "luxon"
import { groupSessions } from "./home-session-groups"
import type { HomeSessionRecord } from "./home-sessions-controller"

const language = { t: (key: string) => key } as never

function record(id: string, updated: number): HomeSessionRecord {
  return {
    session: { id, time: { created: updated, updated } },
    project: {},
    projectName: "",
  } as unknown as HomeSessionRecord
}

const now = DateTime.local().toMillis()
const longAgo = DateTime.local().minus({ days: 30 }).toMillis()

describe("pinned chats", () => {
  test("no pinned group when nothing is pinned", () => {
    const groups = groupSessions([record("a", now)], language)
    expect(groups.map((g) => g.id)).not.toContain("pinned")
  })

  test("pinned chats are lifted to a group at the top", () => {
    const groups = groupSessions([record("a", now), record("b", now)], language, new Set(["b"]))
    expect(groups[0].id).toBe("pinned")
    expect(groups[0].sessions.map((s) => s.session.id)).toEqual(["b"])
  })

  test("a pinned chat appears once, not also in its date group", () => {
    const groups = groupSessions([record("a", now), record("b", now)], language, new Set(["b"]))
    const ids = groups.flatMap((g) => g.sessions.map((s) => s.session.id))
    expect(ids.filter((id) => id === "b")).toHaveLength(1)
    expect(groups.find((g) => g.id === "today")?.sessions.map((s) => s.session.id)).toEqual(["a"])
  })

  test("an old pinned chat is promoted above recent unpinned ones", () => {
    const groups = groupSessions([record("recent", now), record("ancient", longAgo)], language, new Set(["ancient"]))
    expect(groups[0].id).toBe("pinned")
    expect(groups[0].sessions.map((s) => s.session.id)).toEqual(["ancient"])
    expect(groups.find((g) => g.id === "older")).toBeUndefined()
  })
})
