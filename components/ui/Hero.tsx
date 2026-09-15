'use client'

import { Button } from '@/components/ui/button'
import { animate } from 'motion'
import { motion, useMotionValue, useTransform } from 'motion/react'
import Link from 'next/link'
import { useEffect } from 'react'

type HeroProps = {
  num: number
}

export default function Hero ({ num }: HeroProps) {
  const count = useMotionValue(0)
  const rounded = useTransform(count, latest => Math.round(latest))

  useEffect(() => {
    const controls = animate(count, num, {
      duration: 3,
      ease: 'easeOut'
    })
    return controls.stop
  }, [num, count])

  return (
    <section className='mb-12 md:mb-20 flex flex-col justify-between gap-8 border-b border-border pb-10 md:py-20 sm:flex-row sm:items-end'>
      <div className='max-w-2xl'>
        <p className='mb-5 font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
          A living index / 2026
        </p>

        <div className="flex flex-col gap-3">
          <h1 className='font-display text-5xl font-normal leading-[0.96] tracking-[-0.06em] sm:text-7xl'>
            Portfolios from <span className='text-primary'>X.</span>
          </h1>
          <p className=' max-w-lg text-base leading-relaxed text-primary/80'>
            Chess.com for your pages.
          </p>
        </div>
        <p className='mt-6 max-w-lg text-base leading-relaxed text-muted-foreground'>
          A small collection of personal corners on the internet, made by
          developers and designers who share their work on X.
        </p>
        <div className='mt-8 flex flex-wrap items-center gap-3'>
          <Button
            asChild
            className='rounded-md md:w-[6vw] bg-primary px-6 text-primary-foreground hover:bg-primary/90'
          >
            <Link href='/play'>Play</Link>
          </Button>
          <Button asChild variant='outline' className='rounded-md px-6 w-[6vw]'>
            <Link href='/add'>Submit</Link>
          </Button>
        </div>
      </div>
      <div className='flex items-end gap-3 text-right'>
        <div>
          <motion.p className='font-display text-4xl tracking-[-0.05em]'>
            {rounded}
          </motion.p>
          <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
            folios collected
          </p>
        </div>
      </div>
    </section>
  )
}
