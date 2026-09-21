import { ArrowLeft, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import GameCards from './gameCards'
import type { Bracket, GamePortfolio, RoundResult } from './gameTypes'

export default function GameRound ({
  round,
  pair,
  roundResult,
  onChooseWinner,
  onNext,
  isAuthenticated
}: {
  round: number
  elo: number
  bracket: Bracket
  pair: GamePortfolio[]
  roundResult: RoundResult | null
  onChooseWinner: (folio: GamePortfolio) => void
  onNext: () => void
  isAuthenticated: boolean
}) {
  return (
    <main className=' relative w-full max-h-scree px-5 pb-1 sm:pb-10 pt-7 sm:px-8 sm:pt-4 lg:px-5'>
      <div className='flex flex-col w-full gap-3 border-b-2 border-muted pb-2 '>
        <div className='relative flex items-center justify-between gap-4'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
          >
            <ArrowLeft className='h-4 w-4' aria-hidden='true' /> Exit game
          </Link>
          <div className='text-right relative right-5'>
            <p className='font-display text-2xl font-medium'>{round}/10</p>
            <p className='font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
              rounds
            </p>
          </div>
        </div>

        <div className='flex items-center justify-between gap-4'>
          <p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>
            Pick one
          </p>
          <Button
            type='button'
            onClick={onNext}
            disabled={!roundResult}
            className='rounded-md px-5'
          >
            {round === 5 ? 'See results' : 'Next'}{' '}
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
      <p className='text-sm w-fit text-primary absolute  right-10 bottom-10 '>
        {roundResult
          ? `${roundResult.ratingChange > 0 ? '+' : '-'}${Math.abs(
              roundResult.ratingChange
            )} Elo · ${roundResult.eloAfter} total`
          : 'Choose the folio you would rather visit.'}
      </p>
    </main>
  )
}
