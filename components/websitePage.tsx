'use client'

import { motion } from 'motion/react'
import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  ExternalLink,
  Maximize2,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { setBookmark } from '@/app/page/[pageId]/actions'

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
  isSaved: boolean
}

export default function WebsitePage ({ page, viewer, isSaved }: WebsitePageProps) {
  const [saved, setSaved] = useState(isSaved)
  const [bookmarkCount, setBookmarkCount] = useState(page.bookmarked)
  const [isUpdatingBookmark, setIsUpdatingBookmark] = useState(false)
  const [showRemoveConfirmation, setShowRemoveConfirmation] = useState(false)
  const [bookmarkError, setBookmarkError] = useState('')
  const [isPreviewExpanded, setIsPreviewExpanded] = useState(false)
  const initials = page.user.xUsername.trim().slice(0, 2).toUpperCase()
  const domain = page.websiteUrl
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')

  async function updateBookmark (shouldSave: boolean) {
    setBookmarkError('')
    setIsUpdatingBookmark(true)

    try {
      const result = await setBookmark(page.id, shouldSave)
      setSaved(result.saved)
      setBookmarkCount(result.bookmarked)
      setShowRemoveConfirmation(false)
    } catch (error) {
      setBookmarkError(
        error instanceof Error ? error.message : 'Could not update bookmark.'
      )
    } finally {
      setIsUpdatingBookmark(false)
    }
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <main className='mx-auto w-full min-h-screen h-full p-5 '>
        <Link
          href='/'
          className='mb-6 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          All folios
        </Link>

        <motion.section
          className='overflow-hidden rounded-xl sm:rounded-r-none border border-border bg-card'
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className='grid lg:grid-cols-[minmax(0,7.5fr)_minmax(250px,2.5fr)]'>
            <div className='relative min-h-[460px] border-b border-border bg-secondary/40 p-4 sm:min-h-[600px] sm:p-0 lg:border-b-0 lg:border-r sm:h-[90vh]'>
              <div className='relative flex h-full min-h-[420px] items-center justify-center overflow-hidden rounded-lg border border-border bg-background sm:min-h-[80vh]'>
                <div
                  className='absolute inset-0 preview-warm opacity-50'
                  aria-hidden='true'
                />
                <div className='relative z-10 flex h-full w-full items-center justify-center p-2 sm:p-6'>
                  <iframe
                    src={page.websiteUrl}
                    title={`${page.title} website`}
                    loading='lazy'
                    className='h-full min-h-[390px] w-full rounded-md border border-border bg-card'
                    referrerPolicy='no-referrer'
                  />
                </div>
                <button
                  type='button'
                  onClick={() => setIsPreviewExpanded(true)}
                  className='absolute bottom-5 right-5 z-20 inline-flex h-10 w-10 items-center justify-center rounded-md border border-border bg-card/95 text-foreground shadow-sm transition-colors hover:border-primary hover:text-primary'
                  aria-label='Expand website preview'
                >
                  <Maximize2 className='h-5 w-5' aria-hidden='true' />
                </button>
              </div>
            </div>
            
            <aside className='flex min-h-[460px] flex-col p-6 lg:min-h-[680px]'>
              <div className='flex flex-col items-start gap-4'>
                <div className='flex w-full items-center justify-between'>
                  <p className='font-mono text-[12px] uppercase tracking-[0.16em] text-primary'>
                    page/<span>{' ' + page.elo} elo</span>
                  </p>

                  <div className='flex items-center gap-2'>
                    <Button
                      asChild
                      size='lg'
                      variant='outline'
                      aria-label={`Open ${domain}`}
                      className='rounded-sm px-3'
                    >
                      <a
                        href={page.websiteUrl}
                        target='_blank'
                        rel='noreferrer'
                      >
                        <ExternalLink aria-hidden='true' />
                      </a>
                    </Button>

                    <Button
                      type='button'
                      size='lg'
                      onClick={() => {
                        if (saved) {
                          setShowRemoveConfirmation(true)
                        } else {
                          void updateBookmark(true)
                        }
                      }}
                      aria-label={
                        saved ? 'Remove from saved folios' : 'Save folio'
                      }
                      aria-pressed={saved}
                      disabled={isUpdatingBookmark || !viewer}
                      className={
                        saved
                          ? 'py-1 rounded-sm'
                          : 'rounded-sm py-1'
                      }
                    >
                      <Bookmark
                        className={saved ? 'fill-current' : ''}
                        aria-hidden='true'
                      />
                      {saved ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>

                <div className='flex flex-col gap-1 items-start'>
                  <h1 className='break-words font-display text-3xl font-medium leading-tight sm:text-4xl'>
                    {page.title}
                  </h1>

                  <p className='text-sm text-muted-foreground'>{domain}</p>
                </div>

                {page.oneLiner ? (
                  <p className='text-sm leading-6 text-muted-foreground'>
                    {page.oneLiner}
                  </p>
                ) : null}

                {page.tags.length > 0 ? (
                  <div className='flex w-full flex-nowrap gap-2'>
                    {page.tags.slice(0, 3).map(tag => (
                      <span
                        key={tag}
                        className='rounded-md border border-primary/50 px-2 py-1 font-mono text-[12px] uppercase tracking-[0.08em] font-semibold text-primary/60 bg-primary/10'
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <div className='flex flex-wrap items-center gap-2 text-sm text-muted-foreground'>
                  <span>{bookmarkCount} saved</span>
                </div>
                {bookmarkError ? (
                  <p className='text-xs text-destructive' role='alert'>
                    {bookmarkError}
                  </p>
                ) : null}
              </div>

              <Link
                href={`/profile/${page.user.xHandle}`}
                className='mt-auto group flex items-center gap-3 border-t border-border pt-6 transition-colors hover:text-primary'
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
                <ArrowUpRight
                  className='h-4 w-4 shrink-0 group-hover:scale-130 transition-all ease-out'
                  aria-hidden='true'
                />
              </Link>
            </aside>
          </div>
        </motion.section>
      </main>

      {isPreviewExpanded ? (
        <div
          className='fixed inset-0 z-100 flex flex-col bg-zinc-900/40 dark:bg-background p-3 sm:p-5'
          role='dialog'
          aria-modal='true'
          aria-label={`${page.title} website preview`}
        >
          <div className='mb-3 flex items-center justify-between gap-3'>
            <p className='truncate font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground'>
              {domain} / live preview
            </p>
            <Button
              type='button'
              variant='outline'
              size='icon'
              onClick={() => setIsPreviewExpanded(false)}
              aria-label='Close expanded website preview'
              className='shrink-0 rounded-md'
            >
              <X aria-hidden='true' />
            </Button>
          </div>
          <iframe
            src={page.websiteUrl}
            title={`${page.title} website fullscreen preview`}
            className='min-h-0 flex-1 rounded-md border border-border bg-card'
            referrerPolicy='no-referrer'
          />
        </div>
      ) : null}
      {showRemoveConfirmation ? (
        <div
          className='fixed inset-0 z-[110] grid place-items-center bg-black/50 p-5'
          role='dialog'
          aria-modal='true'
          aria-labelledby='remove-bookmark-title'
        >
          <div className='w-full max-w-sm rounded-lg border border-border bg-card p-6 shadow-xl'>
            <h2 id='remove-bookmark-title' className='font-display text-xl'>
              Remove bookmark?
            </h2>
            <p className='mt-3 text-sm leading-6 text-muted-foreground'>
              This will remove this page from ur bookmark, press Yes to confirm
            </p>
            <div className='mt-6 flex justify-end gap-2'>
              <Button
                type='button'
                variant='outline'
                onClick={() => setShowRemoveConfirmation(false)}
                disabled={isUpdatingBookmark}
              >
                Cancle
              </Button>
              <Button
                type='button'
                onClick={() => void updateBookmark(false)}
                disabled={isUpdatingBookmark}
              >
                Yes
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
