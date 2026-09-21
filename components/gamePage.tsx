'use client'

import { useState } from 'react'

import { commitGame } from '@/app/play/actions'
import {
  FALLBACK_BRACKET,
  getRatingChange,
  makeRoundPlans,
  ROUND_COUNT
} from './game/gameData'
import GameIntro from './game/gameIntro'
import GameResults from './game/gameResult'
import GameRound from './game/gameRound'
import type {
  CommittedRound,
  GamePortfolio,
  GameUser,
  RoundPlan,
  RoundResult
} from './game/gameTypes'

export default function GamePage ({
  user,
  folios
}: {
  user: GameUser | null
  folios: GamePortfolio[]
}) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'results'>('intro')
  const [gameFolios, setGameFolios] = useState(folios)
  const [plans, setPlans] = useState<RoundPlan[]>([])
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [round, setRound] = useState(1)
  const [results, setResults] = useState<RoundResult[]>([])
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const currentPlan = plans[round - 1]
  const bracket = currentPlan?.bracket ?? FALLBACK_BRACKET
  const pair = (currentPlan?.pair ?? []).map(portfolio => ({
    ...portfolio,
    elo: ratings[portfolio.id] ?? portfolio.elo
  }))

  function startGame () {
    setPlans(makeRoundPlans(gameFolios))
    setRatings(Object.fromEntries(gameFolios.map(folio => [folio.id, folio.elo])))
    setRound(1)
    setResults([])
    setRoundResult(null)
    setSaveError(null)
    setPhase('playing')
  }

  function chooseWinner (winner: GamePortfolio) {
    if (pair.length < 2 || isSaving) return
    const first = pair[0]
    const second = pair[1]
    if (!first || !second) return
    const loser = first.id === winner.id ? second : first

    const ratingBefore = (portfolio: GamePortfolio) => {
      if (!roundResult) return ratings[portfolio.id] ?? portfolio.elo
      return roundResult.winner.id === portfolio.id
        ? roundResult.winnerEloBefore
        : roundResult.loserEloBefore
    }
    const winnerEloBefore = ratingBefore(winner)
    const loserEloBefore = ratingBefore(loser)
    const ratingChange = getRatingChange(winnerEloBefore, loserEloBefore)
    const nextResult: RoundResult = {
      winner,
      loser,
      bracket,
      ratingChange,
      winnerEloBefore,
      winnerEloAfter: winnerEloBefore + ratingChange,
      loserEloBefore,
      loserEloAfter: loserEloBefore - ratingChange
    }

    setRatings(current => ({
      ...current,
      [winner.id]: nextResult.winnerEloAfter,
      [loser.id]: nextResult.loserEloAfter
    }))
    setResults(current => roundResult
      ? [...current.slice(0, -1), nextResult]
      : [...current, nextResult])
    setRoundResult(nextResult)
    setSaveError(null)
  }

  async function advanceRound () {
    if (!roundResult || isSaving) return
    if (round < ROUND_COUNT) {
      setRound(current => current + 1)
      setRoundResult(null)
      return
    }

    if (!user) {
      setPhase('results')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const submissions = results.map((result, index) => ({
        pageAId: plans[index].pair[0].id,
        pageBId: plans[index].pair[1].id,
        winnerId: result.winner.id
      }))
      const committed = await commitGame(submissions)
      const committedResults = results.map((result, index) =>
        applyCommittedRatings(result, committed[index])
      )
      const committedRatings = new Map<string, number>()

      for (const match of committed) {
        committedRatings.set(match.pageAId, match.eloAAfter)
        committedRatings.set(match.pageBId, match.eloBAfter)
      }

      setResults(committedResults)
      setGameFolios(current => current.map(folio => ({
        ...folio,
        elo: committedRatings.get(folio.id) ?? folio.elo
      })))
      setPhase('results')
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : 'Could not save this game. Try again.'
      )
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      {phase === 'intro' ? <GameIntro onStart={startGame} /> : null}
      {phase === 'playing' ? (
        <GameRound
          round={round}
          bracket={bracket}
          pair={pair}
          roundResult={roundResult}
          onChooseWinner={chooseWinner}
          onNext={advanceRound}
          isAuthenticated={Boolean(user)}
          isSaving={isSaving}
          saveError={saveError}
        />
      ) : null}
      {phase === 'results' ? (
        <GameResults
          results={results}
          onRestart={startGame}
          isAuthenticated={Boolean(user)}
        />
      ) : null}
    </div>
  )
}

function applyCommittedRatings (
  result: RoundResult,
  committed: CommittedRound
): RoundResult {
  const winnerIsPageA = committed.winnerId === committed.pageAId

  return {
    ...result,
    ratingChange: committed.ratingChange,
    winnerEloBefore: winnerIsPageA ? committed.eloABefore : committed.eloBBefore,
    winnerEloAfter: winnerIsPageA ? committed.eloAAfter : committed.eloBAfter,
    loserEloBefore: winnerIsPageA ? committed.eloBBefore : committed.eloABefore,
    loserEloAfter: winnerIsPageA ? committed.eloBAfter : committed.eloAAfter
  }
}
