import type { SVGProps } from "react";

const css = `
.xf-logo { --logo-bg: #0a1013; --logo-fg: #fafafa; }
@media (prefers-color-scheme: dark) {
  .xf-logo { --logo-bg: #fafafa; --logo-fg: #0a1013; }
}
html.light .xf-logo, [data-theme="light"] .xf-logo { --logo-bg: #0a1013; --logo-fg: #fafafa; }
html.dark .xf-logo, .dark .xf-logo, [data-theme="dark"] .xf-logo { --logo-bg: #fafafa; --logo-fg: #0a1013; }
.xf-logo .xf-bg { fill: var(--logo-bg, #0a1013) !important; }
.xf-logo .xf-fg * { fill: none !important; stroke: var(--logo-fg, #fafafa) !important; }
`;

export function Logo({ className = "", ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      width={40}
      height={40}
      role="img"
      aria-label="X folios"
      className={`xf-logo ${className}`.trim()}
      {...props}
    >
      <title>X folios</title>
      <style>{css}</style>

      {/* tile */}
      <rect className="xf-bg" width="512" height="512" rx="20" fill="#0a1013" />

      {/* mark */}
      <g className="xf-fg">
        <rect x="20" y="20" width="472" height="472" rx="14" fill="none" stroke="#fafafa" strokeWidth="14" style={{ fill: "none" }} />
        <polygon points="120,104 156,104 396,408 360,408" fill="none" stroke="#fafafa" strokeWidth="12" strokeLinejoin="miter" style={{ fill: "none" }} />
        <path
          d="M166 410C214 404 246 372 249 300L253 204C256 152 274 120 318 114C334 112 350 113 364 118"
          fill="none" stroke="#fafafa" strokeWidth="26" strokeLinejoin="round" style={{ fill: "none" }}
        />
        <path d="M246 264C290 264 328 259 372 252" fill="none" stroke="#fafafa" strokeWidth="22" style={{ fill: "none" }} />
      </g>
    </svg>
  );
}

export default Logo;