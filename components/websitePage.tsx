'use client'

import { motion } from 'motion/react'
import { ArrowLeft, ArrowUpRight, Bookmark, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import Footer from '@/components/ui/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/Navbar'

export type WebsitePageData = {
  id: string
  title: string
  oneLiner: string | null
  websiteUrl: string
  coverUrl: string | null
  bookmarked: number
  elo: number
  tags: string[]
  user: {
    xUsername: string
    xHandle: string
    xAvatar: string | null
  }
}

type WebsitePageProps = {
  page: WebsitePageData
  viewer: {
    name?: string | null
    image?: string | null
    xHandle?: string | null
  } | null
}

export default function WebsitePage({ page, viewer }: WebsitePageProps) {
  const [saved, setSaved] = useState(false)
  const initials = page.user.xUsername.trim().slice(0, 2).toUpperCase()
  const domain = page.websiteUrl
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar user={viewer} />

      <main className='mx-auto w-full max-w-[1440px] px-5 pb-16 pt-7 sm:px-8 sm:pt-10 lg:px-10'>
        <Link
          href='/'
          className='mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          All folios
        </Link>

        <motion.section
          className='overflow-hidden rounded-xl border border-border bg-card'
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className='grid lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)]'>
            <div className='relative min-h-[460px] border-b border-border bg-secondary/40 p-4 sm:min-h-[600px] sm:p-7 lg:min-h-[680px] lg:border-b-0 lg:border-r'>
              <div className='relative flex h-full min-h-[420px] items-center justify-center overflow-hidden rounded-lg border border-border bg-background sm:min-h-[540px] lg:min-h-[620px]'>
                <div className='absolute inset-0 preview-warm opacity-50' aria-hidden='true' />
                <div className='relative z-10 flex h-full w-full items-center justify-center p-3 sm:p-6'>
                  <iframe
                    src={page.websiteUrl}
                    title={`${page.title} website`}
                    loading='lazy'
                    className='h-full min-h-[390px] w-full rounded-md border border-border bg-card'
                    referrerPolicy='no-referrer'
                  />
                </div>
                <a
                  href={page.websiteUrl}
                  target='_blank'
                  rel='noreferrer'
                  className='absolute bottom-5 right-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card/95 text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary'
                  aria-label={`Open ${domain} in a new tab`}
                >
                  <ArrowUpRight className='h-5 w-5' aria-hidden='true' />
                </a>
                <span className='absolute bottom-5 left-5 z-20 rounded-full bg-card/95 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground'>
                  live preview
                </span>
              </div>
            </div>

            <aside className='flex min-h-[460px] flex-col p-6 sm:p-8 lg:min-h-[680px] lg:p-10'>
              <div>
                <p className='font-mono text-[10px] uppercase tracking-[0.16em] text-primary'>
                  folio / {page.id.slice(0, 8)}
                </p>
                <h1 className='mt-5 break-words font-display text-3xl font-medium leading-tight sm:text-4xl'>
                  {page.title}
                </h1>
                <p className='mt-2 text-sm text-muted-foreground'>{domain}</p>

                {page.oneLiner ? (
                  <p className='mt-5 text-sm leading-6 text-muted-foreground'>
                    {page.oneLiner}
                  </p>
                ) : null}

                <div className='mt-8 flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                  <span>{page.elo} rating</span>
                  <span aria-hidden='true'>·</span>
                  <span>{page.bookmarked + (saved ? 1 : 0)} saved</span>
                </div>

                {page.tags.length > 0 ? (
                  <div className='mt-5 flex flex-wrap gap-2'>
                    {page.tags.map(tag => (
                      <span
                        key={tag}
                        className='rounded-md border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                <div className='mt-7 flex items-center gap-3'>
                  <Button
                    type='button'
                    variant='outline'
                    size='icon'
                    onClick={() => setSaved(current => !current)}
                    aria-label={saved ? 'Remove from saved folios' : 'Save folio'}
                    aria-pressed={saved}
                    className={saved ? 'border-primary text-primary' : ''}
                  >
                    <Bookmark className={saved ? 'fill-current' : ''} aria-hidden='true' />
                  </Button>
                  <Button asChild size='icon' variant='outline' aria-label={`Open ${domain}`}>
                    <a href={page.websiteUrl} target='_blank' rel='noreferrer'>
                      <ExternalLink aria-hidden='true' />
                    </a>
                  </Button>
                </div>
              </div>

              <Link
                href={`/profile/${page.user.xHandle}`}
                className='mt-auto flex items-center gap-3 border-t border-border pt-6 transition-colors hover:text-primary'
              >
                <Avatar className='h-11 w-11 rounded-md border border-border'>
                  <AvatarImage
                    src={page.user.xAvatar ?? undefined}
                    alt={`${page.user.xUsername} on X`}
                  />
                  <AvatarFallback className='rounded-md bg-accent text-xs text-accent-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className='min-w-0 flex-1'>
                  <span className='block truncate text-sm font-medium'>
                    {page.user.xUsername}
                  </span>
                  <span className='block truncate text-xs text-muted-foreground'>
                    @{page.user.xHandle}
                  </span>
                </span>
                <ArrowUpRight className='h-4 w-4 shrink-0' aria-hidden='true' />
              </Link>
            </aside>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  )
}
