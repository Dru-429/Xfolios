export type GamePortfolio = {
  id: number
  name: string
  handle: string
  avatar: string
  websiteUrl: string
  domain: string
}

export type Bracket = {
  min: number
  max: number
}

export type RoundResult = {
  winner: GamePortfolio
  loser: GamePortfolio
  opponentElo: number
  ratingChange: number
  eloAfter: number
}

export type GameUser = {
  name?: string | null
  image?: string | null
  xHandle?: string | null
}
