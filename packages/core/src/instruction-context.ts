export * as InstructionContext from "./instruction-context"

import { Layer } from "effect"
import { makeLocationNode } from "./effect/app-node"

/**
 * Chat-only fork: ambient instruction files are never loaded.
 *
 * Upstream walked up from the working directory to the project root collecting
 * `AGENTS.md`, plus a global `AGENTS.md` from the config dir, and injected them
 * into the system prompt. Parley has no project context, so this registers
 * nothing with the SystemContext registry.
 *
 * The node is kept (rather than removed from the graph) so that
 * `system-context/builtins.ts` can keep listing it as a dependency.
 */
const layer = Layer.empty

export const node = makeLocationNode({
  name: "instruction-context",
  layer,
  deps: [],
})
