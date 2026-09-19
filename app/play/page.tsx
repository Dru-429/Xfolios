import type { Metadata } from 'next'

import { auth } from '@/auth'
import GamePage from '@/components/gamePage'
import { folios } from '@/components/game/gameData'
import { prisma } from '@/src/db'

export const metadata: Metadata = {
  title: 'Folio game | X folios',
  description: 'Choose between portfolios, climb the Elo ladder, and find your favorites.'
}

export default async function PlayPage() {
  const session = await auth()

  const portfolioUrls = folios.map(folio => folio.websiteUrl)
  const [pages, bookmarks] = await Promise.all([
    prisma.page.findMany({
      where: { websiteUrl: { in: portfolioUrls } },
      select: { id: true, websiteUrl: true }
    }),
    session?.user?.id
      ? prisma.bookmark.findMany({
          where: {
            userId: session.user.id,
            page: { websiteUrl: { in: portfolioUrls } }
          },
          select: { pageId: true }
        })
      : Promise.resolve([])
  ])
  const bookmarkedPageIds = new Set(bookmarks.map(bookmark => bookmark.pageId))

  return (
    <GamePage
      user={session?.user ?? null}
      portfolioPages={pages.map(page => ({
        id: page.id,
        websiteUrl: page.websiteUrl,
        bookmarked: bookmarkedPageIds.has(page.id)
      }))}
    />
  )
}
