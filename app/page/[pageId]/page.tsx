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
  const [page, session] = await Promise.all([
    prisma.page.findUnique({
      where: { id: pageId },
      include: {
        user: {
          select: {
            xUsername: true,
            xHandle: true,
            xAvatar: true
          }
        }
      }
    }),
    auth()
  ])

  if (!page) {
    notFound()
  }

  return (
    <WebsitePage
      page={page}
      viewer={session?.user ?? null}
    />
  )
}
