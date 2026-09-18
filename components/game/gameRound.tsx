import { motion } from 'motion/react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'

import GameCards from './gameCards'
import type { Bracket, GamePortfolio, RoundResult } from './gameTypes'

export default function GameRound ({
  round,
  elo,
  bracket,
  pair,
  roundResult,
  onChooseWinner,
  onNext
}: {
  round: number
  elo: number
  bracket: Bracket
  pair: GamePortfolio[]
  roundResult: RoundResult | null
  onChooseWinner: (folio: GamePortfolio) => void
  onNext: () => void
}) {
  return (
    <main className='mx-auto w-full max-w-[1440px] px-5 pb-16 pt-7 sm:px-8 sm:pt-10 lg:px-10'>
      <div className='flex items-center justify-between gap-4'>
        <Link
          href='/'
          className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' /> Exit game
        </Link>
        <div className='text-right'>
          <p className='font-display text-2xl font-medium'>{round}/10</p>
          <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
            rounds
          </p>
        </div>
      </div>
      <motion.section
        key={round}
        className='mt-8 border-y border-border py-7 sm:mt-10 sm:py-9'
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        <div className='flex flex-col justify-between gap-5 sm:flex-row sm:items-end'>
          <div>
            <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
              Pick one
            </p>
            <h1 className='mt-3 font-display text-3xl font-normal tracking-tight sm:text-5xl'>
              Which folio wins?
            </h1>
          </div>
          <div className='flex items-center gap-6 text-sm'>
            <div>
              <span className='text-muted-foreground'>Your Elo </span>
              <strong className='font-display text-lg'>{elo}</strong>
            </div>
            <div className='border-l border-border pl-6'>
              <span className='text-muted-foreground'>Bracket </span>
              <strong className='font-mono text-xs'>
                {bracket.min}–{bracket.max}
              </strong>
            </div>
          </div>
        </div>
      </motion.section>
      <GameCards
        pair={pair}
        roundResult={roundResult}
        onChoose={onChooseWinner}
      />
      <div className='mt-8 flex min-h-12 items-center justify-between gap-4 border-t border-border pt-5'>
        <p className='text-sm text-muted-foreground'>
          {roundResult
            ? `${roundResult.ratingChange > 0 ? '+' : '-'}${Math.abs(
                roundResult.ratingChange
              )} Elo · ${roundResult.eloAfter} total`
            : 'Choose the folio you would rather visit.'}
        </p>
        <Button
          type='button'
          onClick={onNext}
          disabled={!roundResult}
          className='rounded-full px-5'
        >
          {round === 10 ? 'See results' : 'Next'}{' '}
          <ArrowRight aria-hidden='true' />
        </Button>
      </div>
    </main>
  )
}
