import { auth } from '@/auth'
import Landing from '@/components/landing'
import { prisma } from '@/src/db'

export default async function HomePage () {
  const [session, pages] = await Promise.all([
    auth(),
    prisma.page.findMany({
      orderBy: [{ elo: 'desc' }, { createdAt: 'desc' }],
      select: {
        id: true,
        websiteUrl: true,
        elo: true,
        user: {
          select: {
            xUsername: true,
            xHandle: true,
            xAvatar: true
          }
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
  const records = pages.map((page, index) => ({
    'sl.no.': index + 1,
    pageId: page.id,
    Username: `${page.user.xUsername} - @${page.user.xHandle}`,
    'X url': `https://x.com/${page.user.xHandle}`,
    'X image url': page.user.xAvatar ?? '',
    'portfolio url': page.websiteUrl,
    elo: page.elo,
    bookmarked: bookmarkedPageIds.has(page.id)
  }))

  return (
    <div>
      <Landing user={session?.user ?? null} records={records} />
    </div>
  )
}
