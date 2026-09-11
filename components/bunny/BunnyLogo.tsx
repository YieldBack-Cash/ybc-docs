import { bunnyBody } from "./motion";
import { originalFarEarPath } from "./far-ear";

// The team's bunny (same art as the app and landing page, components/bunny from
// YieldBack-Cash/landing-page), static for the nav: the title is already a link, so the
// landing page's clickable AnimatedBunny would nest a button in it. Hops a little on hover.
export function BunnyLogo() {
  return (
    <svg
      viewBox="0 0 240 200"
      aria-hidden="true"
      className="h-6 w-auto shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:-rotate-6"
    >
      <g className="fill-lime" transform="translate(40 20) scale(.16)">
        <path d={bunnyBody} />
        <path d={originalFarEarPath} />
        <path d="M856 252 C794 144 579 22 510 35 C439 45 486 134 561 192 L723 302Z" />
        <circle cx="99" cy="780" r="63" />
        <ellipse cx="734" cy="363" rx="46" ry="44" className="fill-fd-background" />
      </g>
    </svg>
  );
}
