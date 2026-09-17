'use server'

import { auth } from '@/auth'
import { prisma } from '@/src/db'

export async function setBookmark(pageId: string, shouldSave: boolean) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('Sign in to save folios.')
  }

  if (shouldSave) {
    const bookmark = await prisma.bookmark.findUnique({
      where: { userId_pageId: { userId, pageId } }
    })

    if (!bookmark) {
      await prisma.$transaction([
        prisma.bookmark.create({ data: { userId, pageId } }),
        prisma.page.update({
          where: { id: pageId },
          data: { bookmarked: { increment: 1 } }
        })
      ])
    }

    const page = await prisma.page.findUnique({
      where: { id: pageId },
      select: { bookmarked: true }
    })

    return { saved: true, bookmarked: page?.bookmarked ?? 0 }
  }

  const bookmark = await prisma.bookmark.findUnique({
    where: { userId_pageId: { userId, pageId } }
  })

  if (bookmark) {
    await prisma.$transaction([
      prisma.bookmark.delete({ where: { id: bookmark.id } }),
      prisma.page.update({
        where: { id: pageId },
        data: { bookmarked: { decrement: 1 } }
      })
    ])
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { bookmarked: true }
  })

  return { saved: false, bookmarked: Math.max(page?.bookmarked ?? 0, 0) }
}
