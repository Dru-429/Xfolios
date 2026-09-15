import Image from 'next/image'
import { Bookmark } from 'lucide-react'

import Footer from '@/components/ui/footer'
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
  oneLiner: string | null
  websiteUrl: string
  coverUrl: string | null
  bookmarked: number
  tags: string[]
}

type ProfilePageProps = {
  profile: ProfilePageUser
  pages: ProfilePageItem[]
  bookmarks: ProfilePageItem[]
  isOwner: boolean
}

function toPortfolioTile(page: ProfilePageItem, profile: ProfilePageUser, index: number) {
  return {
    'sl.no.': index + 1,
    Username: `${page.title} - @${profile.handle}`,
    'X url': `https://x.com/${profile.handle}`,
    'X image url': profile.avatar ?? '',
    'portfolio url': page.websiteUrl
  }
}

function PageGrid({ pages, profile }: { pages: ProfilePageItem[]; profile: ProfilePageUser }) {
  if (pages.length === 0) {
    return (
      <div className='border-t border-border py-12 text-sm text-muted-foreground'>
        No pages here yet.
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

export default function ProfilePage({
  profile,
  pages,
  bookmarks,
  isOwner
}: ProfilePageProps) {
  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar
        user={
          isOwner
            ? { name: profile.name, image: profile.avatar, xHandle: profile.handle }
            : null
        }
      />

      <main className='mx-auto max-w-[1440px] px-5 pb-16 pt-10 sm:px-8 sm:pt-14 lg:px-10'>
        <p className='mb-5 font-mono text-sm text-primary'>/profile/{profile.handle}</p>

        <section className='overflow-hidden rounded-[2rem] border border-primary bg-card'>
          <div className='grid gap-8 px-7 py-9 sm:grid-cols-[150px_1fr] sm:items-center sm:px-12 sm:py-10'>
            <div className='relative aspect-square w-full max-w-[150px] overflow-hidden rounded-[1.5rem] border border-foreground/70 bg-background'>
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt={profile.name}
                  fill
                  sizes='150px'
                  className='object-cover'
                  unoptimized
                />
              ) : (
                <div className='grid h-full place-items-center font-display text-4xl text-primary'>
                  {profile.name.slice(0, 1).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <h1 className='font-display text-3xl tracking-[-0.04em] sm:text-4xl'>
                {profile.name}
              </h1>
              <p className='mt-1 text-sm text-muted-foreground'>@{profile.handle}</p>
              <p className='mt-6 font-mono text-xs uppercase tracking-[0.14em] text-muted-foreground'>
                {profile.totalPages} pages <span className='px-2'>|</span>{' '}
                {profile.totalBookmarks} bookmarks
              </p>
            </div>
          </div>

          <div className='border-t border-border px-7 py-3 text-center font-display text-2xl text-primary sm:px-12'>
            pages
            {isOwner ? <span className='px-3 text-muted-foreground'>|</span> : null}
            {isOwner ? 'Bookmarked' : null}
          </div>
        </section>

        <section className='mt-10'>
          <div className='mb-5 flex items-center justify-between border-b border-border pb-4'>
            <h2 className='font-mono text-[11px] uppercase tracking-[0.14em]'>
              {profile.totalPages} submitted pages
            </h2>
          </div>
          <PageGrid pages={pages} profile={profile} />
        </section>

        {isOwner ? (
          <section className='mt-14'>
            <div className='mb-5 flex items-center gap-2 border-b border-border pb-4'>
              <Bookmark className='h-4 w-4 text-primary' aria-hidden='true' />
              <h2 className='font-mono text-[11px] uppercase tracking-[0.14em]'>
                Bookmarked pages
              </h2>
            </div>
            <PageGrid pages={bookmarks} profile={profile} />
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  )
}