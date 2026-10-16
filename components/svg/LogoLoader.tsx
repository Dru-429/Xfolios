import type { SVGProps } from 'react'

const css = `
.xf-fg { stroke: currentColor; }

.xf-draw {
  stroke-dasharray: 1;
  stroke-dashoffset: 1;
  animation: xf-draw 3.6s cubic-bezier(.65, 0, .35, 1) infinite both;
}
.xf-d1 { animation-delay: 0s; }
.xf-d2 { animation-delay: .25s; }
.xf-d3 { animation-delay: .55s; }
.xf-d4 { animation-delay: .85s; }

@keyframes xf-draw {
  0%       { stroke-dashoffset: 1; opacity: 1; }
  40%, 78% { stroke-dashoffset: 0; opacity: 1; }
  92%, 100%{ stroke-dashoffset: 0; opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  .xf-draw { animation-duration: 8s; }
}
`

export function LogoLoader({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      viewBox='0 0 512 512'
      role='img'
      aria-label='Loading X folios'
      className={`xf-logo-loader ${className}`.trim()}
      {...props}
    >
      <title>Loading X folios</title>
      <style>{css}</style>

      <g className='xf-fg' fill='none'>
        <rect
          className='xf-draw xf-d1'
          pathLength={1}
          x='20'
          y='20'
          width='472'
          height='472'
          rx='14'
          strokeWidth='20'
        />
        <path
          className='xf-draw xf-d2'
          pathLength={1}
          d='M120 104H156L396 408H360Z'
          strokeWidth='22'
          strokeLinejoin='miter'
        />
        <path
          className='xf-draw xf-d3'
          pathLength={1}
          d='M166 410C214 404 246 372 249 300L253 204C256 152 274 120 318 114C334 112 350 113 364 118'
          strokeWidth='26'
          strokeLinecap='butt'
          strokeLinejoin='round'
        />
        <path
          className='xf-draw xf-d4'
          pathLength={1}
          d='M246 264C290 264 328 259 372 252'
          strokeWidth='38'
          strokeLinecap='butt'
        />
      </g>
    </svg>
  )
}

export default LogoLoader
