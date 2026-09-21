import type { Bracket, GamePortfolio, RoundPlan } from './gameTypes'

export const ROUND_COUNT = 5
export const ELO_BAND_SIZE = 100
export const MIN_ELO_CHANGE = 20
export const MAX_ELO_CHANGE = 40
export const FALLBACK_BRACKET: Bracket = { min: 0, max: ELO_BAND_SIZE }

export function getRatingChange(firstElo: number, secondElo: number) {
  return Math.min(
    MAX_ELO_CHANGE,
    Math.max(MIN_ELO_CHANGE, Math.abs(firstElo - secondElo))
  )
}

export function makeRoundPlans(
  portfolios: GamePortfolio[],
  roundCount = ROUND_COUNT
): RoundPlan[] {
  if (portfolios.length < 2) return []

  const lowestElo = Math.min(...portfolios.map(portfolio => portfolio.elo))
  const highestElo = Math.max(...portfolios.map(portfolio => portfolio.elo))
  const brackets: Bracket[] = []

  for (let min = lowestElo; min <= highestElo; min += ELO_BAND_SIZE + 1) {
    brackets.push({ min, max: min + ELO_BAND_SIZE })
  }

  const populated = brackets
    .map(bracket => ({
      bracket,
      portfolios: portfolios.filter(
        portfolio => portfolio.elo >= bracket.min && portfolio.elo <= bracket.max
      )
    }))
    .filter(group => group.portfolios.length >= 2)

  const groups = populated.length
    ? populated
    : [{
        bracket: { min: lowestElo, max: highestElo },
        portfolios
      }]

  return Array.from({ length: roundCount }, (_, index) => {
    const group = groups[index % groups.length]
    const candidates = shuffle(group.portfolios)

    return {
      bracket: group.bracket,
      pair: [candidates[0], candidates[1]] as [GamePortfolio, GamePortfolio]
    }
  })
}

export function shuffle(items: GamePortfolio[]) {
  const copy = [...items]

  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]]
  }

  return copy
}
