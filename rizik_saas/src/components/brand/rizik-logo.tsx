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
  const fill = tone === "light" ? LIGHT : NAVY;

  if (variant === "mark") {
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
      viewBox="0 0 400 150"
      className={className}
      role={decorative ? undefined : "img"}
      aria-hidden={decorative || undefined}
      aria-label={decorative ? undefined : "Rizik logo"}
      {...rest}
    >
      <g transform="translate(30, 45)">
        <path
          fill={fill}
          d="M30 0 C 45 0, 50 10, 45 25 L 20 50 L 5 50 L 15 35 C 20 25, 10 15, 0 30 L -15 45 L -15 65 L 0 65 L 0 40 C 0 20, 10 0, 30 0 Z"
        />
        <path fill={fill} d="M22 65 L 45 65 L 20 40 L 5 55 Z" />
      </g>

      <g fill={fill} transform="translate(110, 50)">
        <path d="M0 0 H 12 V 10 H 25 V 20 H 12 V 45 H 0 Z" />
        <path d="M35 0 H 47 V 45 H 35 Z" />
        <path d="M60 0 H 95 V 10 L 72 35 H 95 V 45 H 60 V 35 L 83 10 H 60 Z" />
        <path d="M105 0 H 117 V 45 H 105 Z" />
        <path d="M130 0 H 142 V 45 H 130 Z" />
        <path d="M142 20 L 165 0 H 180 L 155 22 L 182 45 H 167 L 142 25 V 20 Z" />
      </g>
    </svg>
  );
}
