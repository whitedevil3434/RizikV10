import type { SVGProps } from "react";

type RizikLogoVariant = "full" | "mark";
type RizikLogoTone = "navy" | "light";

interface RizikLogoProps extends SVGProps<SVGSVGElement> {
  variant?: RizikLogoVariant;
  tone?: RizikLogoTone;
  decorative?: boolean;
}

const NAVY = "#04204C";
const LIGHT = "#F5F2EB";

export default function RizikLogo({
  variant = "full",
  tone = "navy",
  decorative = false,
  className,
  ...rest
}: RizikLogoProps) {
  const isLight = tone === "light";
  // The provided rizik-logo.svg is 724x325.
  // We use CSS filter to adapt the tone dynamically (invert for dark theme if needed)
  const filterStyle = isLight ? { filter: "brightness(0) invert(1)" } : undefined;

  if (variant === "mark") {
    // Keep the old mark intact for icon-only usage since the new asset is the full text logo
    const fill = isLight ? LIGHT : NAVY;
    return (
      <svg
        viewBox="0 0 80 80"
        className={className}
        role={decorative ? undefined : "img"}
        aria-hidden={decorative || undefined}
        aria-label={decorative ? undefined : "Rizik mark"}
        {...rest}
      >
        <g transform="translate(25, 8)">
          <path
            fill={fill}
            d="M30 0 C 45 0, 50 10, 45 25 L 20 50 L 5 50 L 15 35 C 20 25, 10 15, 0 30 L -15 45 L -15 65 L 0 65 L 0 40 C 0 20, 10 0, 30 0 Z"
          />
          <path fill={fill} d="M22 65 L 45 65 L 20 40 L 5 55 Z" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 724 325"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Rizik logo"}
      style={filterStyle}
      {...rest}
    >
      <image width="724" height="325" href="/rizik-logo.svg" />
    </svg>
  );
}
