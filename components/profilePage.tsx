'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ArrowLeft, Bookmark, Grid3X3 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import Footer from '@/components/ui/footer'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Navbar } from '@/components/ui/Navbar'
import PortfolioTile from '@/components/ui/portfolioTile'

type ProfilePageUser = {
  name: string
  handle: string
  avatar: string | null
  totalPages: number
  totalBookmarks: number
}

type ProfilePageItem = {
  id: string
  title: string
  websiteUrl: string
  coverUrl: string | null
}

type ProfilePageProps = {
  profile: ProfilePageUser
  pages: ProfilePageItem[]
  bookmarks: ProfilePageItem[]
  isOwner: boolean
}

type ProfileTab = 'folios' | 'saved'

function toPortfolioTile (
  page: ProfilePageItem,
  profile: ProfilePageUser,
  index: number
) {
  return {
    'sl.no.': index + 1,
    Username: `${page.title} - @${profile.handle}`,
    'X url': `https://x.com/${profile.handle}`,
    'X image url': profile.avatar ?? '',
    'portfolio url': page.websiteUrl
  }
}

function PageGrid ({
  pages,
  profile
}: {
  pages: ProfilePageItem[]
  profile: ProfilePageUser
}) {
  if (pages.length === 0) {
    return (
      <div className='py-20 text-center text-sm text-muted-foreground'>
        Nothing here yet.
      </div>
    )
  }

  return (
    <div className='portfolio-grid'>
      {pages.map((page, index) => (
        <PortfolioTile
          key={page.id}
          portfolio={toPortfolioTile(page, profile, index)}
          index={index}
        />
      ))}
    </div>
  )
}

export default function ProfilePage ({
  profile,
  pages,
  bookmarks,
  isOwner
}: ProfilePageProps) {
  const [activeTab, setActiveTab] = useState<ProfileTab>('folios')
  const initials = profile.name.trim().slice(0, 2).toUpperCase()

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar
        user={
          isOwner
            ? {
                name: profile.name,
                image: profile.avatar,
                xHandle: profile.handle
              }
            : null
        }
      />

      <main className='mx-auto w-full max-w-4xl px-5 pb-20 pt-8 sm:px-8 sm:pt-12'>
        <Link
          href='/'
          className='mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground'
        >
          <ArrowLeft className='h-4 w-4' aria-hidden='true' />
          All folios
        </Link>

        <motion.section
          className='grid grid-cols-[88px_minmax(0,1fr)] gap-6 pb-10 sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-12 sm:px-8'
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <Avatar className='h-[88px] w-[88px] rounded-full border border-border p-1 sm:h-40 sm:w-40'>
            <AvatarImage
              src={profile.avatar?.replace(/_normal(?=\.[a-zA-Z]+$)/, "") ?? undefined}
              alt={`${profile.name} on X`}
              className='rounded-full object-cover'
            />
            <AvatarFallback className='rounded-full bg-accent font-display text-2xl text-accent-foreground sm:text-4xl'>
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className='min-w-0 self-center'>
            <div className='flex flex-col items-start gap-4 sm:flex-row sm:items-center'>
              <div className='min-w-0'>
                <h1 className='truncate font-display text-2xl font-medium sm:text-3xl'>
                  {profile.name}
                </h1>
                <p className='mt-1 text-sm text-muted-foreground'>
                  @{profile.handle}
                </p>
              </div>
              <Button asChild size='sm' className='rounded-md'>
                <a
                  href={`https://x.com/${profile.handle}`}
                  target='_blank'
                  rel='noreferrer'
                >
                  View on X
                </a>
              </Button>
            </div>

            <div className='mt-6 hidden items-center gap-8 text-sm sm:flex'>
              <p>
                <strong className='font-semibold'>{profile.totalPages}</strong>{' '}
                folio{profile.totalPages === 1 ? '' : 's'}
              </p>
              <p>
                <strong className='font-semibold'>
                  {profile.totalBookmarks}
                </strong>{' '}
                saved
              </p>
            </div>
          </div>
        </motion.section>

        <div className='grid grid-cols-2 border-y border-border py-4 text-center text-sm sm:hidden'>
          <p>
            <strong className='block font-semibold'>
              {profile.totalPages}
            </strong>
            <span className='text-muted-foreground'>
              folio{profile.totalPages === 1 ? '' : 's'}
            </span>
          </p>
          <p>
            <strong className='block font-semibold'>
              {profile.totalBookmarks}
            </strong>
            <span className='text-muted-foreground'>saved</span>
          </p>
        </div>

        <div
          className='mt-8 flex justify-center gap-10 border-t border-border sm:mt-2'
          role='tablist'
          aria-label='Profile content'
        >
          <Button
            type='button'
            variant='ghost'
            role='tab'
            aria-selected={activeTab === 'folios'}
            onClick={() => setActiveTab('folios')}
            className={`-mt-px h-12 rounded-none border-t px-1 text-xs font-medium uppercase hover:bg-transparent ${
              activeTab === 'folios'
                ? 'border-foreground text-foreground'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <Grid3X3 className='h-4 w-4' aria-hidden='true' /> Folios
          </Button>
          {isOwner ? (
            <Button
              type='button'
              variant='ghost'
              role='tab'
              aria-selected={activeTab === 'saved'}
              onClick={() => setActiveTab('saved')}
              className={`-mt-px h-12 rounded-none border-t px-1 text-xs font-medium uppercase hover:bg-transparent ${
                activeTab === 'saved'
                  ? 'border-foreground text-foreground'
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              <Bookmark className='h-4 w-4' aria-hidden='true' /> Saved
            </Button>
          ) : null}
        </div>

        <AnimatePresence mode='wait'>
          {activeTab === 'folios' ? (
            <motion.div
              key='folios'
              className='mt-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageGrid pages={pages} profile={profile} />
            </motion.div>
          ) : (
            <motion.div
              key='saved'
              className='mt-6'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PageGrid pages={bookmarks} profile={profile} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer />
    </div>
  )
}
