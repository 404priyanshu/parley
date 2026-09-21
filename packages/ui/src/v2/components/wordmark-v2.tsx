import type { ComponentProps } from "solid-js"

/**
 * Parley wordmark.
 *
 * Upstream shipped the OpenCode logotype as SVG paths here. That artwork is
 * OpenCode's brand, and the MIT licence grants no trademark rights, so the fork
 * draws its own mark instead. The viewBox keeps upstream's 720x129 aspect so
 * callers laying this out with `h-auto w-full` are unaffected.
 */
export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 720 129"
      fill="none"
      role="img"
      aria-label="Parley"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <text
        x="360"
        y="64.5"
        text-anchor="middle"
        dominant-baseline="central"
        fill="currentColor"
        font-family="ui-sans-serif, -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif"
        font-size="96"
        font-weight="560"
        letter-spacing="-2"
      >
        parley
      </text>
    </svg>
  )
}
