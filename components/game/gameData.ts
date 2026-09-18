import portfolios from '@/data/portfolios.json'

import type { Bracket, GamePortfolio } from './gameTypes'

const BRACKETS: Bracket[] = [
  { min: 900, max: 1000 },
  { min: 1000, max: 1100 },
  { min: 1200, max: 1300 },
  { min: 1300, max: 1400 },
  { min: 1400, max: 1500 }
]

export const ROUND_COUNT = 10
export const K_FACTOR = 32
export const FALLBACK_BRACKET: Bracket = { min: 900, max: 1000 }

type PortfolioRecord = {
  'sl.no.': number
  Username: string
  'X url': string
  'X image url': string
  'portfolio url': string
}

export const folios = (portfolios as PortfolioRecord[]).map(parsePortfolio)

function parsePortfolio(record: PortfolioRecord): GamePortfolio {
  const [rawName, rawHandle] = record.Username.split(' - ')
  const name = rawName?.trim() || record.Username
  const handle =
    rawHandle?.replace(/^@/, '') ||
    record['X url'].split('/').filter(Boolean).at(-1) ||
    'creator'
  const websiteUrl = record['portfolio url']

  return {
    id: record['sl.no.'],
    name,
    handle,
    avatar: record['X image url'],
    websiteUrl,
    domain: websiteUrl.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')
  }
}

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
