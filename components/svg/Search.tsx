'use client'

import { motion, MotionConfig } from 'motion/react'
import type { SVGMotionProps, TargetAndTransition } from 'motion/react'
import type { SVGProps } from 'react'

const T = 7.2
const EASE: [number, number, number, number] = [0.4, 0, 0.2, 1]

/** Looping keyframes on one shared timeline. `times` are fractions of T. */
const kf = (
  times: number[],
  v: TargetAndTransition,
  origin?: [number, number]
) => ({
  initial: Object.fromEntries(
    Object.entries(v).map(([k, a]) => [k, (a as number[])[0]])
  ),
  animate: v,
  transition: { duration: T, times, repeat: Infinity, ease: EASE },
  style: origin ? { originX: origin[0], originY: origin[1] } : undefined
})

/** Line draw-in, hold, fade out. */
const draw = (o = 1) => ({
  initial: { pathLength: 0, opacity: 0 },
  animate: { pathLength: [0, 1, 1, 1], opacity: [0, o, o, 0, 0] },
  transition: {
    pathLength: {
      duration: T,
      times: [0, 0.13, 0.92, 1],
      repeat: Infinity,
      ease: 'easeOut' as const
    },
    opacity: {
      duration: T,
      times: [0, 0.06, 0.92, 0.98, 1],
      repeat: Infinity,
      ease: 'linear' as const
    }
  }
})

const Ln = ({ o, ...p }: SVGMotionProps<SVGPathElement> & { o?: number }) => (
  <motion.path {...draw(o)} {...p} />
)

const rr = (x: number, y: number, w: number, h: number, r = 2) =>
  `M${x + r} ${y}H${x + w - r}Q${x + w} ${y} ${x + w} ${y + r}V${y + h - r}Q${
    x + w
  } ${y + h} ${x + w - r} ${y + h}H${x + r}Q${x} ${y + h} ${x} ${y + h - r}V${
    y + r
  }Q${x} ${y} ${x + r} ${y}Z`

const Cell = ({ x, y }: { x: number; y: number }) => (
  <>
    <Ln d={rr(x, y, 66, 50)} />
    <Ln d={rr(x + 21, y + 14, 24, 11, 1.5)} />
    <Ln d={`M${x + 27} ${y + 20}H${x + 39}`} strokeWidth={1.5} />
  </>
)

const fileD = (x: number, y: number, h: number) =>
  `M${x} ${y + h}V${y + 7}Q${x} ${y} ${x + 7} ${y}H${x + 23}L${x + 28} ${
    y + 5
  }H${x + 40}V${y + h}`

// cabinet grid (the cell at 164,86 is the drawer that opens)
const COLS = [20, 92, 164]
const ROWS = [26, 86, 146]

// area covered by the open drawer (tray + files + front); any cell touching it fades out
const OPEN = { x1: 124, y1: 92, x2: 230, y2: 152 }
const hidden = (x: number, y: number) =>
  x < OPEN.x2 && x + 66 > OPEN.x1 && y < OPEN.y2 && y + 50 > OPEN.y1

const DRAWER_T = [0, 0.1, 0.2, 0.82, 0.92, 1]

const FILES = [
  [149, 82, 34],FOUND
  [158, 80, 36],
  [167, 78, 38],
  [176, 80, 36],
  [185, 77, 39],
  [194, 81, 35],
  [203, 79, 37]
]
const FOUND = 4

export function Search ({ className = '', ...props }: SVGProps<SVGSVGElement>) {
  return (
    <MotionConfig reducedMotion='user'>
      <svg
        xmlns='http://www.w3.org/2000/svg'
        viewBox='0 0 420 240'
        role='img'
        aria-label='Searching files'
        className={`xf-search overflow-visible ${className}`.trim()}
        {...props}
      >
        <title>Searching files</title>

        <g
          fill='none'
          stroke='currentColor'
          strokeWidth='2.7'
          strokeLinecap='round'
          strokeLinejoin='round'
          style={{ filter: 'drop-shadow(0 0 2.5px currentColor)' }}
        >
          {/* floor */}
          <Ln d='M12 214H405' o={0.35} />

          {/* cabinet wall: cells under the open drawer fade out */}
          <g opacity='.72'>
            {ROWS.flatMap(y =>
              COLS.map(x => {
                if (x === 164 && y === 86) return null
                return (
                  <g key={`${x}-${y}`}>
                    <Cell x={x} y={y} />
                  </g>
                )
              })
            )}
          </g>

          {/* drawer: front + tray slide out together */}
          <motion.g
            {...kf(DRAWER_T, {
              x: [0, 0, -24, -24, 0, 0],
              y: [0, 0, 15, 15, 0, 0]
            })}
          >
            <motion.g 
              {...kf([0, 0.13, 0.19, 0.84, 0.94, 1], {
                opacity: [1, 0.3, 0.1, 0.1, 1, 1]
              })}            >
              <Cell x={164} y={86} />
            </motion.g>

            <motion.g
              {...kf([0, 0.13, 0.19, 0.84, 0.94, 1], {
                opacity: [0, 0, 1, 1, 0, 0]
              })}
            >
              <path d='M148 112L151 131H225L221 112' opacity='.75' />

              {FILES.map(([x, y, h], i) =>
                i === FOUND ? (
                  <motion.g
                    key={i}
                    {...kf(
                      [0, 0.63, 0.7, 0.78, 0.84, 0.96, 1],
                      {
                        x: [0, 0, -3, -1, 0, 0, 0],
                        y: [0, 0, -31, -34, -4, 0, 0],
                        rotate: [0, 0, -7, -3, 0, 0, 0]
                      },
                      [0.5, 1]
                    )}
                  >
                    <path d={fileD(x, y, h)} />
                    <path
                      d={`M${x + 8} ${y + 13}H${x + 31}`}
                      strokeWidth='1.5'
                      opacity='.7'
                    />
                  </motion.g>
                ) : (
                  <motion.path
                    key={i}
                    d={fileD(x, y, h)}
                    {...kf(
                      // each file flips a beat after the previous one
                      [
                        0,
                        ...[0.28, 0.34, 0.39, 0.44, 0.72].map(
                          t => t + i * 0.0139
                        ),
                        1
                      ],
                      {
                        y: [0, 0, -12, 2, 0, 0, 0],
                        rotate: [0, 0, -11, 5, 0, 0, 0]
                      },
                      [0.5, 1]
                    )}
                  />
                )
              )}
            </motion.g>
          </motion.g>

          {/* mouse */}
          <motion.g
            {...kf(
              [0, 0.1, 0.2, 0.31, 0.4, 0.49, 0.58, 0.68, 0.78, 0.9, 1],
              {
                x: [12, 12, 2, -5, -8, -5, -9, -4, 0, 12, 12],
                y: [8, 8, 2, -2, -3, -2, -4, -1, 1, 8, 8],
                rotate: [1, 1, -2, -4, -5, -3, -5, -2, 0, 1, 1]
              },
              [0.73, 0.74]
            )}
          >
            {/* tail */}
            <motion.g
              {...kf(
                [0, 0.25, 0.48, 0.7, 0.85, 1],
                { rotate: [0, 5, -4, 6, -2, 0] },
                [1, 0.5]
              )}
            >
              <Ln d='M338 185C373 197 392 185 393 169C394 154 377 153 370 163C363 175 376 186 394 180' />
            </motion.g>

            {/* body */}
            <Ln d='M286 105C314 103 344 116 361 140C373 157 376 177 369 199C353 210 325 213 298 207C286 199 278 185 277 167C275 146 277 121 286 105Z' />
            <Ln d='M286 124C279 142 277 165 281 183' o={0.72} />
            <Ln d='M329 204C337 207 346 207 353 203' />

            {/* head */}
            <motion.g
              {...kf(
                [0, 0.18, 0.28, 0.38, 0.48, 0.58, 0.68, 0.76, 0.84, 1],
                {
                  rotate: [0, 0, -7, 3, -6, 4, -5, -10, 0, 0],
                  x: [0, 0, -2, 0, -2, 0, 0, -3, 0, 0],
                  y: [0, 0, 1, 0, 0, 0, 0, -2, 0, 0]
                },
                [0.72, 0.54]
              )}
            >
              <Ln d='M292 83C278 78 260 83 252 94C246 102 248 111 257 116C266 121 279 119 286 113C291 109 294 102 296 95' />

              <motion.g
                {...kf([0, 0.3, 0.34, 0.39, 0.44, 1], {
                  rotate: [0, 0, -12, 5, 0, 0]
                })}
              >
                <Ln d='M270 88C258 75 263 62 275 65C286 68 288 80 282 90' />
              </motion.g>
              <motion.g
                {...kf([0, 0.53, 0.57, 0.62, 0.67, 1], {
                  rotate: [0, 0, 11, -4, 0, 0]
                })}
              >
                <Ln d='M292 87C289 70 300 61 309 68C316 74 312 84 304 91' />
              </motion.g>

              <Ln d='M267 101Q271 97 275 101' />
              <motion.circle
                cx='271'
                cy='100'
                r='1.5'
                fill='currentColor'
                stroke='none'
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0, 0] }}
                transition={{
                  duration: T,
                  times: [0, 0.06, 0.92, 0.98, 1],
                  repeat: Infinity
                }}
              />
            </motion.g>

            {/* back paw */}
            <motion.g
              {...kf(
                [0, 0.27, 0.33, 0.38, 0.43, 0.48, 0.53, 0.58, 0.64, 0.7, 1],
                {
                  x: [0, 0, -13, 8, -13, 9, -12, 7, -10, 0, 0],
                  y: [0, 0, -10, -18, -10, -18, -10, -17, -10, 0, 0],
                  rotate: [0, 0, 8, -7, 7, -7, 6, -5, 5, 0, 0]
                },
                [1, 0.5]
              )}
            >
              <Ln d='M301 133C286 126 268 121 249 116' />
              <Ln d='M250 116L243 112M250 116L242 117M250 116L244 122' />
            </motion.g>

            {/* front paw */}
            <motion.g
              {...kf(
                [0, 0.24, 0.3, 0.35, 0.4, 0.45, 0.5, 0.55, 0.6, 0.68, 1],
                {
                  x: [0, 0, -18, 7, -20, 8, -19, 7, -17, 0, 0],
                  y: [0, 0, -18, -7, -17, -6, -18, -7, -16, 0, 0],
                  rotate: [0, 0, -9, 5, -8, 5, -8, 4, -6, 0, 0]
                },
                [1, 0.5]
              )}
            >
              <Ln d='M294 130C277 125 258 121 237 117' />
              <Ln d='M238 117L229 111M238 117L227 117M238 117L230 124' />
            </motion.g>
          </motion.g>
        </g>
      </svg>
    </MotionConfig>
  )
}

export default Search
