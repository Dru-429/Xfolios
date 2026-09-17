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

export async function updatePage(pageId: string, formData: FormData) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('Sign in to edit this page.')
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { userId: true }
  })

  if (!page || page.userId !== userId) {
    throw new Error('You can only edit your own pages.')
  }

  const websiteUrl = String(formData.get('websiteUrl') ?? '').trim()
  const coverUrl = String(formData.get('coverUrl') ?? '').trim()
  const title = String(formData.get('title') ?? '').trim()
  const oneLiner = String(formData.get('oneLiner') ?? '').trim()
  const tags = String(formData.get('tags') ?? '')
    .split(',')
    .map(tag => tag.trim())
    .filter(Boolean)
    .slice(0, 8)

  try {
    const parsedUrl = new URL(websiteUrl)
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
      throw new Error()
    }
  } catch {
    throw new Error('Enter a valid HTTP or HTTPS website URL.')
  }

  if (!title) {
    throw new Error('Title cannot be empty.')
  }

  const updatedPage = await prisma.page.update({
    where: { id: pageId },
    data: {
      websiteUrl,
      coverUrl: coverUrl || null,
      title,
      oneLiner: oneLiner || null,
      tags,
    }
  })

  return updatedPage
}

export async function deletePage(pageId: string) {
  const session = await auth()
  const userId = session?.user?.id

  if (!userId) {
    throw new Error('Sign in to delete this page.')
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { userId: true }
  })

  if (!page || page.userId !== userId) {
    throw new Error('You can only delete your own pages.')
  }

  await prisma.$transaction([
    prisma.page.delete({ where: { id: pageId } }),
    prisma.user.updateMany({
      where: { id: userId, totalPage: { gt: 0 } },
      data: { totalPage: { decrement: 1 } }
    })
  ])

  const owner = await prisma.user.findUnique({
    where: { id: userId },
    select: { xHandle: true }
  })

  return { redirectTo: owner ? `/profile/${owner.xHandle}` : '/' }
}
