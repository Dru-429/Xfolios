import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import GameCards from './gameCards'
import type { Bracket, GamePortfolio, RoundResult } from './gameTypes'

export default function GameRound ({
  round,
  bracket,
  pair,
  roundResult,
  onChooseWinner,
  onNext,
  isAuthenticated,
  isSaving,
  saveError
}: {
  round: number
  bracket: Bracket
  pair: GamePortfolio[]
  roundResult: RoundResult | null
  onChooseWinner: (folio: GamePortfolio) => void
  onNext: () => void
  isAuthenticated: boolean
  isSaving: boolean
  saveError: string | null
}) {
  return (
    <main className='relative w-full max-h-scree px-5 pb-1 pt-7 sm:pb-10 sm:px-8 sm:pt-4 lg:px-5'>
      <div className='flex w-full flex-col gap-3 border-b-2 border-muted pb-2'>
        <div className='relative flex items-center justify-between gap-4'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' aria-hidden='true' /> Exit game
          </Link>
          <div className='relative right-5 text-right'>
            <p className='font-display text-2xl font-medium'>{round}/5</p>
            <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
              rounds
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between gap-4'>
          <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
            Pick one · Elo {bracket.min}–{bracket.max}
          </p>
          <Button
            type='button'
            onClick={onNext}
            disabled={!roundResult || isSaving}
            className='rounded-md px-5'
          >
            {isSaving
              ? 'Saving…'
              : round === 5 && isAuthenticated
                ? 'Save results'
                : round === 5
                  ? 'See results'
                  : 'Next'}{' '}
            <ArrowRight aria-hidden='true' />
          </Button>
        </div>
      </div>

      <GameCards
        pair={pair}
        roundResult={roundResult}
        onChoose={onChooseWinner}
        isAuthenticated={isAuthenticated}
      />
      <p className='absolute bottom-10 right-10 w-fit text-sm text-primary'>
        {roundResult
          ? `${roundResult.winner.name} +${roundResult.ratingChange} · ${roundResult.loser.name} −${roundResult.ratingChange}`
          : 'Choose the folio you would rather visit.'}
      </p>
      {saveError ? (
        <p role='alert' className='mt-4 text-sm text-destructive'>
          {saveError}
        </p>
      ) : null}
    </main>
  )
}
