import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'

import { auth } from '@/auth'
import ProfilePage from '@/components/profilePage'
import { decodeRouteSegment, getProfileHref, normalizeXHandle } from '@/lib/routes'
import { prisma } from '@/src/db'

type ProfileRouteProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfileRouteProps): Promise<Metadata> {
  const { username: routeUsername } = await params
  const username = normalizeXHandle(routeUsername)
  const profile = await prisma.user.findUnique({
    where: { xHandle: username },
    select: { xUsername: true }
  })

  return { title: profile?.xUsername ?? 'Xfolios' }
}

export default async function ProfileRoute({ params }: ProfileRouteProps) {
  const { username: routeUsername } = await params
  const username = normalizeXHandle(routeUsername)

  if (!username) {
    notFound()
  }

  if (decodeRouteSegment(routeUsername) !== username) {
    redirect(getProfileHref(username))
  }

  const session = await auth()
  const viewerHandle = session?.user?.xHandle
    ? normalizeXHandle(session.user.xHandle)
    : null
  const isViewingOwnProfile = viewerHandle === username
  const profile = await prisma.user.findUnique({
    where: { xHandle: username },
    include: {
      pages: {
        orderBy: { createdAt: 'desc' },
        include: {
          bookmarks: session?.user?.id
            ? { where: { userId: session.user.id }, select: { id: true } }
            : false
        }
      }
    }
  })

  if (!profile) {
    notFound()
  }

  const isOwner = viewerHandle === profile.xHandle
  const profileBookmarks = isViewingOwnProfile
    ? await prisma.bookmark.findMany({
        where: { userId: profile.id },
        include: { page: true },
        orderBy: { createdAt: 'desc' }
      })
    : []

  return (
    <ProfilePage
      profile={{
        name: profile.xUsername,
        handle: profile.xHandle,
        avatar: profile.xAvatar,
        totalPages: profile.pages.length,
        totalBookmarks: profileBookmarks.length
      }}
      pages={profile.pages.map(page => ({
        id: page.id,
        title: page.title,
        websiteUrl: page.websiteUrl,
        coverUrl: page.coverUrl,
        elo: page.elo,
        bookmarked: Array.isArray(page.bookmarks) && page.bookmarks.length > 0
      }))}
      bookmarks={profileBookmarks.map(bookmark => ({
        id: bookmark.page.id,
        title: bookmark.page.title,
        websiteUrl: bookmark.page.websiteUrl,
        coverUrl: bookmark.page.coverUrl,
        elo: bookmark.page.elo,
        bookmarked: true
      }))}
      isOwner={isOwner}
      viewer={session?.user
        ? {
            name: session.user.name,
            image: session.user.image,
            xHandle: session.user.xHandle
          }
        : null}
    />
  )
}
