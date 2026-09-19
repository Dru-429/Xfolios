import { useState } from 'react'
import {
  ArrowRight,
  Bookmark,
  ExternalLink,
  RefreshCw,
  Trophy
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { setBookmark } from '@/app/page/[pageId]/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GamePortfolio, RoundResult } from './gameTypes'
import { motion } from 'motion/react'

export default function GameCards ({
  pair,
  roundResult,
  onChoose,
  isAuthenticated
}: {
  pair: GamePortfolio[]
  roundResult: RoundResult | null
  onChoose: (folio: GamePortfolio) => void
  isAuthenticated: boolean
}) {
  const router = useRouter()
  const [reloads, setReloads] = useState<Record<number, number>>({})
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>({})
  const [updatingBookmark, setUpdatingBookmark] = useState<string | null>(null)

  return (
    <div className='grid gap-5 pt-8 md:grid-cols-2 lg:gap-7'>
      {pair.map(folio => {
        const selected = roundResult?.winner.id === folio.id
        const lost = roundResult?.loser.id === folio.id
        const initials = folio.name.trim().slice(0, 2).toUpperCase()
        const isBookmarked = folio.pageId
          ? bookmarks[folio.pageId] ?? folio.bookmarked ?? false
          : false

        return (
          <div
            key={folio.id}
            className='transition-opacity duration-300'
            style={{ opacity: lost ? 0.58 : 1 }}
          >
            <Button
              type='button'
              variant='outline'
              onClick={() => onChoose(folio)}
              aria-label={`Choose ${folio.name}'s portfolio`}
              className={cn(
                'group h-auto w-full flex-col items-stretch overflow-hidden rounded-xl p-0 text-left whitespace-normal',
                selected && 'border-primary ring-1 ring-primary',
                lost && 'border-border'
              )}
            >
              <div className='w-full border-b border-border bg-secondary/55 p-2 sm:p-0'>
                <div className='overflow-hidden rounded-t-xl border border-foreground/20 bg-foreground/4 p-2 shadow-sm transition-transform duration-500 '>
                  <div className='grid h-8 grid-cols-[1fr_minmax(0,2fr)_1fr] items-center gap-2 border-b border-border px-1 pb-2 sm:h-10'>
                    <span
                      className='flex items-center gap-1.5'
                      aria-hidden='true'
                    >
                      <span className='h-3 w-3 rounded-full bg-[#F78463] sm:h-4 sm:w-4' />
                      <span className='h-3 w-3 rounded-full bg-[#F0E34D] sm:h-4 sm:w-4' />
                      <span className='h-3 w-3 rounded-full bg-[#84F165] sm:h-4 sm:w-4' />
                    </span>

                    <span className='flex min-w-0 items-center rounded-md border border-border bg-background pl-2 text-left text-muted-foreground shadow-xs'>
                      <span className='min-w-0 flex-1 truncate font-mono text-[10px] sm:text-[11px]'>
                        {folio.domain}
                      </span>
                      <motion.span
                        role='button'
                        tabIndex={0}
                        aria-label={`Reload ${folio.domain}`}
                        className='inline-flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-r-md transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
                        onClick={event => {
                          event.stopPropagation()
                          setReloads(current => ({
                            ...current,
                            [folio.id]: (current[folio.id] ?? 0) + 1
                          }))
                        }}
                        onKeyDown={event => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault()
                            event.currentTarget.click()
                          }
                        }}
                      >
                        <motion.span
                          className='inline-flex items-center justify-center'
                          animate={{ rotate: (reloads[folio.id] ?? 0) * 360 }}
                          transition={{ duration: 0.5, ease: 'easeInOut' }}
                        >
                          <RefreshCw
                            className='h-3.5 w-3.5'
                            aria-hidden='true'
                          />
                        </motion.span>
                      </motion.span>{' '}
                    </span>

                    <span className='flex justify-end'>
                      {folio.pageId ? (
                        <span
                          role='button'
                          tabIndex={updatingBookmark === folio.pageId ? -1 : 0}
                          aria-label={
                            isBookmarked ? 'Remove bookmark' : 'Add bookmark'
                          }
                          aria-pressed={isBookmarked}
                          aria-disabled={updatingBookmark === folio.pageId}
                          className={cn(
                            'inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:border-primary hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                            isBookmarked &&
                              'border-primary bg-primary text-primary-foreground hover:text-primary-foreground',
                            updatingBookmark === folio.pageId &&
                              'pointer-events-none opacity-60'
                          )}
                          onClick={async event => {
                            event.stopPropagation()
                            const pageId = folio.pageId
                            if (!pageId || updatingBookmark === pageId) return

                            if (!isAuthenticated) {
                              router.push('/signin?callbackUrl=/play')
                              return
                            }

                            setUpdatingBookmark(pageId)
                            try {
                              const result = await setBookmark(
                                pageId,
                                !isBookmarked
                              )
                              setBookmarks(current => ({
                                ...current,
                                [pageId]: result.saved
                              }))
                            } catch {
                              // Keep the previous bookmark state when the server update fails.
                            } finally {
                              setUpdatingBookmark(null)
                            }
                          }}
                          onKeyDown={event => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              event.preventDefault()
                              event.currentTarget.click()
                            }
                          }}
                        >
                          <Bookmark
                            className={cn(
                              'h-4 w-4',
                              isBookmarked && 'fill-current'
                            )}
                            aria-hidden='true'
                          />
                        </span>
                      ) : null}
                    </span>
                  </div>

                  <div className='relative mt-2 aspect-16/10 overflow-hidden rounded-md border border-border bg-background'>
                    <iframe
                      key={reloads[folio.id] ?? 0}
                      src={folio.websiteUrl}
                      title={`${folio.name}'s portfolio website preview`}
                      loading='lazy'
                      className=' h-full w-full bg-card'
                      referrerPolicy='no-referrer'
                    />
                    <span className='pointer-events-none absolute bottom-2 right-2 rounded-sm border border-border bg-card/90 px-1.5 py-1 font-mono text-[8px] uppercase tracking-widest text-muted-foreground'>
                      preview
                    </span>
                  </div>
                </div>
              </div>

              <div className='flex items-start gap-3 p-4 sm:p-5'>
                <Avatar className='h-10 w-10 shrink-0 rounded-md border border-border'>
                  <AvatarImage
                    src={folio.avatar}
                    alt={`${folio.name} on X`}
                    loading='lazy'
                  />
                  <AvatarFallback className='rounded-md bg-accent text-xs text-accent-foreground'>
                    {initials}
                  </AvatarFallback>
                </Avatar>

                <span className='min-w-0 flex-1'>
                  <span className='block truncate font-display text-lg font-medium text-card-foreground'>
                    {folio.name}
                  </span>
                  <span className='mt-0.5 block truncate text-xs text-muted-foreground'>
                    @{folio.handle} · {folio.domain}
                  </span>
                </span>

                {selected ? (
                  <Trophy
                    className='mt-1 h-4 w-4 shrink-0 text-primary'
                    aria-hidden='true'
                  />
                ) : (
                  <ArrowRight
                    className='mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1'
                    aria-hidden='true'
                  />
                )}
              </div>
            </Button>

            <a
              href={folio.websiteUrl}
              target='_blank'
              rel='noreferrer'
              className='mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary'
            >
              Open site <ExternalLink className='h-3 w-3' aria-hidden='true' />
            </a>
          </div>
        )
      })}
    </div>
  )
}
