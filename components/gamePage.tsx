'use client'

import { useMemo, useState } from 'react'

import { Navbar } from '@/components/ui/Navbar'

import { FALLBACK_BRACKET, folios, getBracket, getOpponentElo, K_FACTOR, ROUND_COUNT, shuffle } from './game/gameData'
import GameIntro from './game/gameIntro'
import GameResults from './game/gameResult'
import GameRound from './game/gameRound'
import type { GameUser, RoundResult } from './game/gameTypes'

export default function GamePage({ user }: { user: GameUser | null }) {
  const [phase, setPhase] = useState<'intro' | 'playing' | 'results'>('intro')
  const [deck, setDeck] = useState(folios)
  const [round, setRound] = useState(1)
  const [elo, setElo] = useState(1000)
  const [results, setResults] = useState<RoundResult[]>([])
  const [roundResult, setRoundResult] = useState<RoundResult | null>(null)
  const bracket = getBracket(round) ?? FALLBACK_BRACKET
  const opponentElo = getOpponentElo(bracket, round)
  const pair = useMemo(() => {
    const firstIndex = ((round - 1) * 2) % Math.max(deck.length, 1)
    return [deck[firstIndex], deck[(firstIndex + 1) % Math.max(deck.length, 1)]].filter(Boolean)
  }, [deck, round])

  function startGame() {
    setDeck(shuffle(folios))
    setRound(1)
    setElo(1000)
    setResults([])
    setRoundResult(null)
    setPhase('playing')
  }

  function chooseWinner(winner: (typeof folios)[number]) {
    if (roundResult || pair.length < 2) return
    const first = pair[0]
    const second = pair[1]
    if (!first || !second) return
    const loser = first.id === winner.id ? second : first
    const expected = 1 / (1 + 10 ** ((opponentElo - elo) / 400))
    const ratingChange = Math.max(1, Math.round(K_FACTOR * (1 - expected)))
    const nextResult = { winner, loser, opponentElo, ratingChange, eloAfter: elo + ratingChange }
    setElo(nextResult.eloAfter)
    setResults(current => [...current, nextResult])
    setRoundResult(nextResult)
  }

  function advanceRound() {
    if (!roundResult) return
    if (round === ROUND_COUNT) {
      setPhase('results')
      return
    }
    setRound(current => current + 1)
    setRoundResult(null)
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar user={user} />
      {phase === 'intro' ? <GameIntro onStart={startGame} /> : null}
      {phase === 'playing' ? <GameRound round={round} elo={elo} bracket={bracket} pair={pair} roundResult={roundResult} onChooseWinner={chooseWinner} onNext={advanceRound} /> : null}
      {phase === 'results' ? <GameResults elo={elo} results={results} onRestart={startGame} /> : null}
    </div>
  )
}
