import type { Metadata } from 'next'

import { auth } from '@/auth'
import GamePage from '@/components/gamePage'
import { prisma } from '@/src/db'

export const metadata: Metadata = {
  title: 'Folio game | X folios',
  description: 'Choose between portfolios, climb the Elo ladder, and find your favorites.'
}

export default async function PlayPage() {
  const [session, pages] = await Promise.all([
    auth(),
    prisma.page.findMany({
      orderBy: [{ elo: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        websiteUrl: true,
        user: {
          select: {
            xUsername: true,
            xHandle: true,
            xAvatar: true
          },
        }
      }
    })
  ])
  const bookmarks = session?.user?.id
    ? await prisma.bookmark.findMany({
        where: { userId: session.user.id },
        select: { pageId: true }
      })
    : []
  const bookmarkedPageIds = new Set(bookmarks.map(bookmark => bookmark.pageId))
  const folios = pages.map(page => ({
    id: page.id,
    pageId: page.id,
    bookmarked: bookmarkedPageIds.has(page.id),
    name: page.user.xUsername,
    handle: page.user.xHandle,
    avatar: page.user.xAvatar ?? '',
    websiteUrl: page.websiteUrl,
    domain: page.websiteUrl
      .replace(/^https?:\/\/(www\.)?/, '')
      .replace(/\/$/, '')
  }))

  return (
    <GamePage
      user={session?.user ?? null}
      folios={folios}
    />
  )
}
