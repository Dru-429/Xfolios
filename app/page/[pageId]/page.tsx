import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { auth } from '@/auth'
import WebsitePage from '@/components/websitePage'
import {
  decodeRouteSegment,
  getProfileHref,
  isUuid,
  isXHandle
} from '@/lib/routes'
import { prisma } from '@/src/db'

export async function generateMetadata({
  params
}: {
  params: Promise<{ pageId: string }>
}): Promise<Metadata> {
  const { pageId: routePageId } = await params
  const pageId = decodeRouteSegment(routePageId)

  if (!isUuid(pageId)) {
    return { title: 'Xfolios' }
  }

  const page = await prisma.page.findUnique({
    where: { id: pageId },
    select: { title: true }
  })

  return { title: page?.title ?? 'Xfolios' }
}

export default async function WebsitePageRoute({
  params
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId: routePageId } = await params
  const pageId = decodeRouteSegment(routePageId)

  if (!isUuid(pageId)) {
    if (isXHandle(pageId)) {
      redirect(getProfileHref(pageId))
    }

    notFound()
  }

  const session = await auth()
  const page = await prisma.page.findUnique({
    where: { id: pageId },
    include: {
      user: {
        select: {
          xUsername: true,
          xHandle: true,
          xAvatar: true
        }
      },
      bookmarks: session?.user?.id
        ? { where: { userId: session.user.id }, select: { id: true } }
        : false
    }
  })

  if (!page) {
    notFound()
  }

  return (
    <WebsitePage
      page={page}
      viewer={session?.user ?? null}
      isSaved={Array.isArray(page.bookmarks) && page.bookmarks.length > 0}
      isOwner={session?.user?.id === page.userId}
    />
  )
}
