'use client'

import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { motion } from 'motion/react'

import PortfolioTile from '@/components/ui/pageTile'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { GamePortfolio, RoundResult } from './gameTypes'

type ResultView = 'picked' | 'skipped'

export default function GameResults ({
  elo,
  results,
  onRestart,
  isAuthenticated
}: {
  elo: number
  results: RoundResult[]
  onRestart: () => void
  isAuthenticated: boolean
}) {
  const [view, setView] = useState<ResultView>('picked')
  const portfolios = results.map(result => ({
    folio: view === 'picked' ? result.winner : result.loser,
    elo: view === 'picked' ? result.eloAfter : result.opponentElo
  }))

  return (
    <main className='mx-auto min-h-screen w-full max-w-[1500px] px-4 py-8 sm:px-8 sm:py-12 lg:px-12'>
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className='rounded-[2.5rem] px-5 py-8 sm:rounded-[4rem] sm:px-10 sm:py-12 lg:px-16'
      >
        <div className=' border-primary/80 pb-5'>
          <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
            Game complete · {results.length} rounds 
          </p>

          <div className='flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end'>
            <div>
              <h1 className='my-4 font-display text-5xl font-normal tracking-[-0.06em] sm:text-7xl'>
                Here's your folio list.
              </h1>
            </div>
          </div>
        </div>

        <div className='flex flex-col items-center justify-between gap-4 py-5 sm:flex-row'>
          <div className='hidden sm:block sm:w-32' aria-hidden='true' />
          <div
            className='flex rounded-lg border-2 border-primary'
            role='group'
            aria-label='Result view'
          >
            <button
              type='button'
              aria-pressed={view === 'picked'}
              onClick={() => setView('picked')}
              className={cn(
                ' px-4 py-1.5 text-sm transition-colors sm:px-7 sm:text-base',
                view === 'picked'
                  ? 'bg-primary text-primary-foreground rounded-l-md '
                  : 'text-primary hover:bg-primary/10'
              )}
            >
              Picked
            </button>
            <button
              type='button'
              aria-pressed={view === 'skipped'}
              onClick={() => setView('skipped')}
              className={cn(
                ' px-4 py-1.5 text-sm transition-colors sm:px-7 sm:text-base',
                view === 'skipped'
                  ? 'rounded-r-md bg-primary text-primary-foreground'
                  : 'text-primary hover:bg-primary/10'
              )}
            >
              Skipped
            </button>
          </div>

          <Button
            type='button'
            variant='outline'
            onClick={onRestart}
            className='rounded-xl border-primary px-5 text-primary hover:bg-primary hover:text-primary-foreground sm:w-32'
          >
            <RotateCcw aria-hidden='true' /> Play again
          </Button>
        </div>

        <div className=' bg-background/40 p-4 sm:p-6'>
          <div className='mb-4 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground'>
            <span>
              {view === 'picked' ? 'Your picks' : 'Skipped portfolios'}
            </span>
            <span>{portfolios.length} shown</span>
          </div>

          <div
            key={view}
            className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
          >
            {portfolios.map(({ folio, elo: portfolioElo }, index) => (
              <PortfolioTile
                key={`${view}-${folio.id}-${index}`}
                portfolio={toPortfolioTile(folio, portfolioElo)}
                index={index}
                isAuthenticated={isAuthenticated}
              />
            ))}
          </div>
        </div>
      </motion.section>
    </main>
  )
}

function toPortfolioTile (folio: GamePortfolio, elo: number) {
  return {
    'sl.no.': folio.id,
    pageId: folio.pageId,
    Username: `${folio.name} - @${folio.handle}`,
    'X url': `https://x.com/${folio.handle}`,
    'X image url': folio.avatar,
    'portfolio url': folio.websiteUrl,
    elo,
    bookmarked: folio.bookmarked
  }
}
