export * as BuiltInTools from "./builtins"

import { makeLocationNode } from "../effect/app-node"
import { Layer } from "effect"

/**
 * Chat-only fork: no built-in tools are registered.
 *
 * Upstream composed the Location-scoped built-in tool transforms here (bash,
 * edit, read, write, glob, grep, webfetch, websearch, skill, todowrite,
 * apply-patch, question). Parley is a conversation-only client, so the list is
 * intentionally empty and the registry materializes zero tool definitions.
 *
 * This is belt-and-braces with the permission model: every agent in
 * `plugin/agent.ts` already denies every action on every resource. Registering nothing means there is no
 * tool to advertise to the model in the first place.
 */
export const node = makeLocationNode({
  name: "built-in-tools",
  layer: Layer.empty,
  deps: [],
})
