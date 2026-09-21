import { useSettingsCommand } from "@/components/settings-dialog"
import { useCommand } from "@/context/command"
import { useLanguage } from "@/context/language"

/**
 * Chat-only fork: the new-chat screen registers only the focus command.
 *
 * Upstream also registered `project.select` (the project picker, Mod+Shift+O)
 * and a hidden `command.palette` entry that opened the file picker. Parley has
 * neither projects nor files, so both are gone.
 */
export function useNewSessionCommands(input: { restoreFocus: () => void }) {
  const command = useCommand()
  const language = useLanguage()

  useSettingsCommand()
  command.register("new-session", () => [
    {
      id: "input.focus",
      title: language.t("command.input.focus"),
      category: language.t("command.category.view"),
      keybind: "ctrl+l",
      onSelect: input.restoreFocus,
    },
  ])
}
