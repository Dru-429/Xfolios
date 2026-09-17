import { notFound } from 'next/navigation'

import { auth } from '@/auth'
import WebsitePage from '@/components/websitePage'
import { prisma } from '@/src/db'

export default async function WebsitePageRoute({
  params
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
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
      isSaved={page.bookmarks.length > 0}
      isOwner={session?.user?.id === page.userId}
    />
  )
}
