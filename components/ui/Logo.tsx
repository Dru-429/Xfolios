import type { SVGProps } from 'react'

const css = `
.xf-logo { --logo-bg: #0a1013; --logo-fg: #fafafa; }
@media (prefers-color-scheme: dark) {
  .xf-logo { --logo-bg: #fafafa; --logo-fg: #0a1013; }
}
html.light .xf-logo, [data-theme="light"] .xf-logo { --logo-bg: #0a1013; --logo-fg: #fafafa; }
html.dark .xf-logo, .dark .xf-logo, [data-theme="dark"] .xf-logo { --logo-bg: #fafafa; --logo-fg: #0a1013; }
.xf-logo .xf-bg { fill: var(--logo-bg, #0a1013) !important; }
.xf-logo .xf-fg { stroke: var(--logo-fg, #fafafa) !important; }
`

export function Logo({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      role='img'
      aria-label='X folios'
      className={`xf-logo ${className}`.trim()}
      {...props}
    >
      <title>X folios</title>
      <style>{css}</style>

      <rect className='xf-bg' width='512' height='512' rx='20' fill='#0a1013' />

      <g className='xf-fg' fill='none' stroke='#fafafa'>
        <rect
          x='20'
          y='20'
          width='472'
          height='472'
          rx='14'
          strokeWidth='20'
        />
        <polygon
          points='120,104 156,104 396,408 360,408'
          strokeWidth='22'
          strokeLinejoin='miter'
        />
        <g strokeWidth='26' strokeLinecap='butt' strokeLinejoin='round'>
          <path d='M166 410C214 404 246 372 249 300L253 204C256 152 274 120 318 114C334 112 350 113 364 118' />
          <path d='M246 264C290 264 328 259 372 252' strokeWidth='38' />
        </g>
      </g>
    </svg>
  )
}

export default Logo 