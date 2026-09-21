'use server'

import { revalidatePath } from 'next/cache'

import { auth } from '@/auth'
import {
  getRatingChange,
  ROUND_COUNT
} from '@/components/game/gameData'
import type {
  CommittedRound,
  GameSubmission
} from '@/components/game/gameTypes'
import { prisma } from '@/src/db'

export async function commitGame(submissions: GameSubmission[]) {
  const session = await auth()
  const sessionUser = session?.user

  if (!sessionUser) throw new Error('Sign in to save game results.')

  const voter = await prisma.user.findFirst({
    where: {
      OR: [
        ...(isUuid(sessionUser.id) ? [{ id: sessionUser.id }] : []),
        ...(sessionUser.xId ? [{ xId: sessionUser.xId }] : []),
        ...(sessionUser.xHandle
          ? [{ xHandle: sessionUser.xHandle.toLowerCase() }]
          : [])
      ]
    },
    select: { id: true }
  })

  if (!voter) {
    throw new Error('Your account could not be matched. Sign out and sign in again.')
  }

  const voterId = voter.id
  if (submissions.length !== ROUND_COUNT) {
    throw new Error(`A completed game must contain ${ROUND_COUNT} rounds.`)
  }

  for (const round of submissions) {
    if (
      round.pageAId === round.pageBId ||
      (round.winnerId !== round.pageAId && round.winnerId !== round.pageBId)
    ) {
      throw new Error('Invalid game result.')
    }
  }

  const pageIds = [...new Set(
    submissions.flatMap(round => [round.pageAId, round.pageBId])
  )]

  const committedRounds = await prisma.$transaction(async transaction => {
    const pages = await transaction.page.findMany({
      where: { id: { in: pageIds } },
      select: { id: true, elo: true }
    })

    if (pages.length !== pageIds.length) {
      throw new Error('One or more folios are no longer available.')
    }

    const ratings = new Map(pages.map(page => [page.id, page.elo]))
    const matches: CommittedRound[] = []

    for (const round of submissions) {
      const eloABefore = ratings.get(round.pageAId)
      const eloBBefore = ratings.get(round.pageBId)

      if (eloABefore === undefined || eloBBefore === undefined) {
        throw new Error('Invalid game result.')
      }

      const ratingChange = getRatingChange(eloABefore, eloBBefore)
      const pageAWon = round.winnerId === round.pageAId
      const eloAAfter = eloABefore + (pageAWon ? ratingChange : -ratingChange)
      const eloBAfter = eloBBefore + (pageAWon ? -ratingChange : ratingChange)

      ratings.set(round.pageAId, eloAAfter)
      ratings.set(round.pageBId, eloBAfter)
      matches.push({
        ...round,
        ratingChange,
        eloABefore,
        eloAAfter,
        eloBBefore,
        eloBAfter
      })
    }

    await Promise.all(
      [...ratings].map(([id, elo]) =>
        transaction.page.update({ where: { id }, data: { elo } })
      )
    )

    await transaction.match.createMany({
      data: matches.map(match => ({
        voterId,
        pageAId: match.pageAId,
        pageBId: match.pageBId,
        winnerId: match.winnerId,
        eloABefore: match.eloABefore,
        eloBBefore: match.eloBBefore,
        eloAAfter: match.eloAAfter,
        eloBAfter: match.eloBAfter
      }))
    })

    return matches
  }, { isolationLevel: 'Serializable' })

  revalidatePath('/')
  revalidatePath('/play')

  return committedRounds
}

function isUuid(value: string | undefined): value is string {
  return Boolean(
    value &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
  )
}
