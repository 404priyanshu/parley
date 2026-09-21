import { DateTime } from "luxon"
import type { HomeSessionGroup, HomeSessionRecord } from "./home-sessions-controller"

type Translate = { t: (key: string) => string }

/**
 * Groups the home chat list.
 *
 * Split out of the controller so it can be tested without pulling in the
 * controller's runtime dependencies (sync, markdown worker, solid context).
 */
export function groupSessions(
  records: HomeSessionRecord[],
  language: Translate,
  pinnedIDs: ReadonlySet<string> = new Set(),
): HomeSessionGroup[] {
  const now = DateTime.local()
  const yesterday = now.minus({ days: 1 })
  // Pinned chats are lifted out of the date groups entirely, so a pinned chat
  // appears once, at the top, however old it is.
  const pinnedSessions = records.filter((record) => pinnedIDs.has(record.session.id))
  const rest = records.filter((record) => !pinnedIDs.has(record.session.id))
  const todaySessions = rest.filter((record) =>
    DateTime.fromMillis(record.session.time.updated ?? record.session.time.created).hasSame(now, "day"),
  )
  const yesterdaySessions = rest.filter((record) =>
    DateTime.fromMillis(record.session.time.updated ?? record.session.time.created).hasSame(yesterday, "day"),
  )
  const olderSessions = rest.filter((record) => {
    const time = DateTime.fromMillis(record.session.time.updated ?? record.session.time.created)
    return !time.hasSame(now, "day") && !time.hasSame(yesterday, "day")
  })
  const olderTitle =
    todaySessions.length === 0 && yesterdaySessions.length === 0
      ? language.t("sidebar.project.recentSessions")
      : language.t("home.sessions.group.older")
  return [
    { id: "pinned" as const, title: language.t("home.sessions.group.pinned"), sessions: pinnedSessions },
    { id: "today" as const, title: language.t("home.sessions.group.today"), sessions: todaySessions },
    { id: "yesterday" as const, title: language.t("home.sessions.group.yesterday"), sessions: yesterdaySessions },
    { id: "older" as const, title: olderTitle, sessions: olderSessions },
  ].filter((group) => group.sessions.length > 0)
}
