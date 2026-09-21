import { ScrollView } from "@opencode-ai/ui/scroll-view"
import { createHomeController } from "./home/home-controller"
import { createHomeProjectsController } from "./home/home-projects-controller"
import { HomeUtilityNav } from "./home/home-projects-view"
import { createHomeScrollController } from "./home/home-scroll-controller"
import { createHomeSessionSearchController } from "./home/home-session-search-controller"
import { createHomeSessionsController } from "./home/home-sessions-controller"
import { HomeSessions } from "./home/home-sessions"

export function NewHome() {
  const home = createHomeController()
  const projects = createHomeProjectsController(home)
  const sessions = createHomeSessionsController(home)
  const search = createHomeSessionSearchController(home, sessions)
  const scroll = createHomeScrollController(sessions.data.groups)
  return (
    <div
      class={`
        m-2 flex min-h-0 flex-1 flex-col self-stretch overflow-hidden rounded-[10px]
        bg-v2-background-bg-base shadow-[var(--v2-elevation-raised)]
      `}
    >
      <ScrollView
        class="min-h-0 flex-1 [container-type:size]"
        thumbContainer={scroll.viewport.thumbTrack}
        thumbHoverTarget={scroll.viewport.hoverTarget}
        viewportRef={scroll.viewport.setViewport}
        onScroll={(event) => scroll.viewport.update(event.currentTarget.scrollTop)}
        onWheel={scroll.viewport.containOuterWheel}
      >
        {/*
          Chat-only fork: the 280px projects sidebar is gone, so this is a single
          centred column of chats.
        */}
        <div class="mx-auto flex w-full max-w-[720px] flex-col px-3 lg:px-6">
          <HomeSessions sessions={sessions} search={search} scroll={scroll} />
        </div>
      </ScrollView>
      {/*
        The utility nav (settings, help) lived in the projects sidebar on desktop
        and only appeared below `lg`. It is the only route to provider and API-key
        settings, so it is pinned here as a footer outside the scroll container —
        inside it, a full-height grid pushed it below the fold and made the whole
        panel scroll just to reach Settings.
      */}
      <div class="shrink-0 border-t border-v2-background-bg-layer-04">
        <div class="mx-auto w-full max-w-[720px] px-3 py-1.5 lg:px-6">
          <HomeUtilityNav
            class="flex flex-row! items-center justify-start gap-1! [&>button]:w-auto [&>button]:flex-none"
            onOpenSettings={projects.utility.settings}
            onOpenHelp={projects.utility.help}
            language={projects.copy.language}
          />
        </div>
      </div>
    </div>
  )
}
