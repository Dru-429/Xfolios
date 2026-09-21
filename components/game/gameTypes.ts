export type GamePortfolio = {
  id: string
  pageId: string
  bookmarked?: boolean
  elo: number
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
  bracket: Bracket
  ratingChange: number
  winnerEloBefore: number
  winnerEloAfter: number
  loserEloBefore: number
  loserEloAfter: number
}

export type RoundPlan = {
  bracket: Bracket
  pair: [GamePortfolio, GamePortfolio]
}

export type GameSubmission = {
  pageAId: string
  pageBId: string
  winnerId: string
}

export type CommittedRound = GameSubmission & {
  ratingChange: number
  eloABefore: number
  eloAAfter: number
  eloBBefore: number
  eloBAfter: number
}

export type GameUser = {
  name?: string | null
  image?: string | null
  xHandle?: string | null
}
