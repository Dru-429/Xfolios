import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import ProfilePage from '@/components/profilePage'
import { prisma } from '@/src/db'

type ProfileRouteProps = {
  params: Promise<{ username: string }>
}

export default async function ProfileRoute({ params }: ProfileRouteProps) {
  const { username } = await params
  const session = await auth()
  const profile = await prisma.user.findUnique({
    where: { xHandle: username },
    include: {
      pages: {
        orderBy: { createdAt: 'desc' },
        include: {
          bookmarks: {
            where: { userId: session?.user?.id ?? '' },
            select: { id: true }
          }
        }
      },
      bookmarks: {
        include: { page: true },
        orderBy: { createdAt: 'desc' }
      }
    }
  })

  if (!profile) {
    notFound()
  }

  const isOwner = session?.user?.xHandle === profile.xHandle

  return (
    <ProfilePage
      profile={{
        name: profile.xUsername,
        handle: profile.xHandle,
        avatar: profile.xAvatar,
        totalPages: profile.pages.length,
        totalBookmarks: profile.bookmarks.length
      }}
      pages={profile.pages.map(page => ({
        id: page.id,
        title: page.title,
        websiteUrl: page.websiteUrl,
        coverUrl: page.coverUrl,
        elo: page.elo,
        bookmarked: page.bookmarks.length > 0
      }))}
      bookmarks={profile.bookmarks.map(bookmark => ({
        id: bookmark.page.id,
        title: bookmark.page.title,
        websiteUrl: bookmark.page.websiteUrl,
        coverUrl: bookmark.page.coverUrl,
        elo: bookmark.page.elo,
        bookmarked: true
      }))}
      isOwner={isOwner}
      isAuthenticated={Boolean(session?.user)}
    />
  )
}