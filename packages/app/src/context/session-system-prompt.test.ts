import { beforeEach, describe, expect, test } from "bun:test"
import { sessionSystemPrompts } from "./session-system-prompt"

beforeEach(() => {
  try {
    globalThis.localStorage?.clear()
  } catch {
    // ignore
  }
  sessionSystemPrompts.reset()
})

describe("per-chat system prompts", () => {
  test("returns undefined when nothing is set", () => {
    expect(sessionSystemPrompts.get("s1")).toBeUndefined()
  })

  test("round-trips a value", () => {
    sessionSystemPrompts.set("s1", "Answer concisely.")
    expect(sessionSystemPrompts.get("s1")).toBe("Answer concisely.")
  })

  test("is scoped per chat", () => {
    sessionSystemPrompts.set("s1", "one")
    sessionSystemPrompts.set("s2", "two")
    expect(sessionSystemPrompts.get("s1")).toBe("one")
    expect(sessionSystemPrompts.get("s2")).toBe("two")
  })

  test("blank and whitespace-only values read back as unset", () => {
    sessionSystemPrompts.set("s1", "   ")
    expect(sessionSystemPrompts.get("s1")).toBeUndefined()
  })

  test("clearing removes the value", () => {
    sessionSystemPrompts.set("s1", "one")
    sessionSystemPrompts.clear("s1")
    expect(sessionSystemPrompts.get("s1")).toBeUndefined()
  })

  test("trims surrounding whitespace", () => {
    sessionSystemPrompts.set("s1", "  hello  ")
    expect(sessionSystemPrompts.get("s1")).toBe("hello")
  })
})
