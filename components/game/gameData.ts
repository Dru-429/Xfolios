import type { Bracket, GamePortfolio } from './gameTypes'

const BRACKETS: Bracket[] = [
  { min: 900, max: 1000 },
  { min: 1000, max: 1100 },
  { min: 1100, max: 1200 },
  { min: 1200, max: 1300 },
  { min: 1300, max: 1400 },
]

export const ROUND_COUNT = 5;
export const K_FACTOR = 32;
export const FALLBACK_BRACKET: Bracket = { min: 900, max: 1000 }

export function getBracket(round: number) {
  return BRACKETS[Math.min(round - 1, BRACKETS.length - 1)] ?? FALLBACK_BRACKET
}

export function getOpponentElo(bracket: Bracket, round: number) {
  const span = bracket.max - bracket.min
  return bracket.min + Math.round((span * ((round * 37) % 100)) / 100)
}

export function shuffle(items: GamePortfolio[]) {
  return [...items].sort(() => Math.random() - 0.5)
}
