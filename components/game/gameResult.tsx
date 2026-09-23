'use client'

import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  LayoutGrid,
  List,
  RotateCcw
} from 'lucide-react'
import { motion } from 'motion/react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import PortfolioTile from '@/components/ui/pageTile'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { GamePortfolio, RoundResult } from './gameTypes'
import Link from 'next/link'

type ResultView = 'picked' | 'skipped'
type ResultLayout = 'cards' | 'list'
type ResultItem = { folio: GamePortfolio; elo: number }

export default function GameResults ({
  results,
  onRestart,
  isAuthenticated
}: {
  results: RoundResult[]
  onRestart: () => void
  isAuthenticated: boolean
}) {
  const [view, setView] = useState<ResultView>('picked')
  const [layout, setLayout] = useState<ResultLayout>('cards')
  const portfolios: ResultItem[] = results.map(result => ({
    folio: view === 'picked' ? result.winner : result.loser,
    elo: view === 'picked' ? result.winnerEloAfter : result.loserEloAfter
  }))

  return (
    <main className='mx-auto min-h-screen w-full max-w-375 px-4 py-8 sm:px-8 sm:py-12 lg:px-12'>
      <Link
        href='/'
        className='mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
      >
        <div className=' inline-flex items-center gap-2 text-sm'>
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          All folios
        </div>
      </Link>
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

          {!isAuthenticated ? (
            <p className='mt-3 text-sm text-muted-foreground'>
              This was a local game. Sign in before playing to save Elo and
              match history.
            </p>
          ) : null}

          <div className='flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end'>
            <div>
              <h1 className='my-4 font-display text-5xl font-normal tracking-[-0.06em] sm:text-7xl'>
                Here&apos;s your folio list.
              </h1>
            </div>
          </div>
        </div>

        <div className='border-b-o border-border flex flex-col items-center justify-between gap-4 py-5 sm:flex-row'>
          <div
            className='flex rounded-md border border-border bg-background p-1 sm:w-32'
            role='group'
            aria-label='Result layout'
          >
            <button
              type='button'
              aria-label='Card view'
              aria-pressed={layout === 'cards'}
              onClick={() => setLayout('cards')}
              className={cn(
                'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 text-xs transition-colors',
                layout === 'cards'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <LayoutGrid className='h-3.5 w-3.5' aria-hidden='true' />
              <span className='sr-only sm:not-sr-only'>Cards</span>
            </button>
            <button
              type='button'
              aria-label='List view'
              aria-pressed={layout === 'list'}
              onClick={() => setLayout('list')}
              className={cn(
                'inline-flex h-8 flex-1 items-center justify-center gap-1.5 rounded-sm px-2 text-xs transition-colors',
                layout === 'list'
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <List className='h-3.5 w-3.5' aria-hidden='true' />
              <span className='sr-only sm:not-sr-only'>List</span>
            </button>
          </div>
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
            className='rounded-md border-primary px-5 text-primary hover:bg-primary hover:text-primary-foreground sm:w-32'
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

          {layout === 'cards' ? (
            <div key={`${view}-cards`} className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {portfolios.map(({ folio, elo: portfolioElo }, index) => (
                <PortfolioTile
                  key={`${view}-${folio.id}-${index}`}
                  portfolio={toPortfolioTile(folio, portfolioElo)}
                  index={index}
                  isAuthenticated={isAuthenticated}
                />
              ))}
            </div>
          ) : (
            <ResultList
              key={`${view}-list`}
              title={view === 'picked' ? 'Your picks' : 'Skipped portfolios'}
              items={portfolios}
              tone={view === 'picked' ? 'win' : 'loss'}
            />
          )}
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

function ResultList ({
  title,
  items,
  tone
}: {
  title: string
  items: ResultItem[]
  tone: 'win' | 'loss'
}) {
  return (
    <section aria-label={title}>
      <div className='divide-y divide-border overflow-hidden rounded-lg border border-border bg-card'>
        {items.map(({ folio, elo }, index) => (
          <Link
            key={`${folio.id}-${index}`}
            href={`/page/${folio.pageId}`}
            className='group/row flex items-center gap-3 px-3 py-3 transition-colors hover:bg-accent/60 sm:px-4'
          >
            <span className='w-6 shrink-0 font-mono text-[10px] text-muted-foreground'>
              {String(index + 1).padStart(2, '0')}
            </span>
            <Avatar className='h-9 w-9 shrink-0 rounded-md border border-border'>
              <AvatarImage src={folio.avatar} alt={`${folio.name} on X`} />
              <AvatarFallback className='rounded-md bg-accent text-[10px] text-accent-foreground'>
                {folio.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className='min-w-0 flex-1'>
              <span className='block truncate text-sm font-medium text-card-foreground'>
                {folio.name}
              </span>
              <span className='block truncate text-xs text-muted-foreground'>
                @{folio.handle}
              </span>
            </span>
            <span className='hidden max-w-[38%] truncate text-xs text-muted-foreground sm:block'>
              {folio.domain}
            </span>
            <span
              className={cn(
                'shrink-0 rounded-md border px-2 py-1 font-mono text-[10px]',
                tone === 'win'
                  ? 'border-primary/30 bg-primary/10 text-primary'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              {elo} ELO
            </span>
            <ArrowRight
              className='h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover/row:translate-x-0.5 group-hover/row:text-primary'
              aria-hidden='true'
            />
          </Link>
        ))}
      </div>
    </section>
  )
}
