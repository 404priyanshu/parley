import { useDialog } from "@opencode-ai/ui/context/dialog"
import { Dialog } from "@opencode-ai/ui/dialog"
import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { useParams } from "@solidjs/router"
import { createSignal, type Component } from "solid-js"
import { useLanguage } from "@/context/language"
import { sessionSystemPrompts } from "@/context/session-system-prompt"

/**
 * Per-chat instructions.
 *
 * Saved locally and sent as the prompt's `system` field on every turn of this
 * chat, where the server appends it to the agent's own system prompt.
 */
export const DialogChatInstructions: Component = () => {
  const params = useParams<{ id?: string }>()
  const dialog = useDialog()
  const language = useLanguage()
  const [value, setValue] = createSignal(params.id ? (sessionSystemPrompts.get(params.id) ?? "") : "")

  const save = () => {
    const id = params.id
    if (id) sessionSystemPrompts.set(id, value())
    dialog.close()
  }

  return (
    <Dialog title={language.t("dialog.chatInstructions.title")} size="large">
      <div class="flex flex-col gap-3 p-4">
        <p class="text-[13px] leading-5 text-v2-text-text-faint">
          {language.t("dialog.chatInstructions.description")}
        </p>
        <textarea
          autofocus
          rows={10}
          value={value()}
          onInput={(event) => setValue(event.currentTarget.value)}
          placeholder={language.t("dialog.chatInstructions.placeholder")}
          class={`
            w-full resize-y rounded-[6px] bg-v2-background-bg-deep px-3 py-2 text-[13px] leading-5
            text-v2-text-text-base focus:outline-none
          `}
        />
        <div class="flex justify-end gap-2">
          <ButtonV2 variant="ghost-muted" onClick={() => dialog.close()}>
            {language.t("common.cancel")}
          </ButtonV2>
          <ButtonV2 variant="neutral" onClick={save}>
            {language.t("common.save")}
          </ButtonV2>
        </div>
      </div>
    </Dialog>
  )
}
