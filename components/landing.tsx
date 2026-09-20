'use client'

import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react'

import { Button } from '@/components/ui/button'
import { Navbar } from './ui/Navbar'
import Hero from './ui/Hero'
import PortfolioTile, { type PortfolioTileData } from './ui/pageTile'
import Footer from './ui/footer'

type LandingUser = {
  name?: string | null
  image?: string | null
  xHandle?: string | null
}

const PAGE_SIZE = 20
const THEME_STORAGE_KEY = 'x-folios-theme'
const THEME_EVENT = 'x-folios-theme-change'

function getStoredTheme () {
  if (typeof window === 'undefined') {
    return false
  }

  const savedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)

  if (savedTheme) {
    return savedTheme === 'dark'
  }

  return document.documentElement.classList.contains('dark')
}

function subscribeToThemeChange (onStoreChange: () => void) {
  if (typeof window === 'undefined') {
    return () => {}
  }

  window.addEventListener('storage', onStoreChange)
  window.addEventListener(THEME_EVENT, onStoreChange)

  return () => {
    window.removeEventListener('storage', onStoreChange)
    window.removeEventListener(THEME_EVENT, onStoreChange)
  }
}

export default function Landing ({
  user,
  records
}: {
  user: LandingUser | null
  records: PortfolioTileData[]
}) {
  const [page, setPage] = useState(1)
  const isDark = useSyncExternalStore(
    subscribeToThemeChange,
    getStoredTheme,
    () => false
  )
  const pageCount = Math.ceil(records.length / PAGE_SIZE)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const currentRecords = useMemo(
    () => records.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, records]
  )

  const changePage = (nextPage: number) => {
    setPage(Math.min(pageCount, Math.max(1, nextPage)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b border-border'>
        <Navbar user={user} />
      </header>

      <main
        id='folios'
        className='mx-auto max-w-[1440px] px-5 pb-12 pt-12 sm:px-8 sm:pt-16 lg:px-10 lg:pt-20'
      >
        <Hero num={records.length} />

        <div className='mb-5 flex items-center justify-between gap-4'>
          <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
            Showing {String((page - 1) * PAGE_SIZE + 1).padStart(3, '0')} —{' '}
            {String(Math.min(page * PAGE_SIZE, records.length)).padStart(
              3,
              '0'
            )}
          </p>
          <p className='text-sm text-muted-foreground'>
            Page {page} of {pageCount}
          </p>
        </div>

        <AnimatePresence mode='wait'>
          <motion.div
            key={page}
            className='portfolio-grid'
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          >
            {currentRecords.map((portfolio, index) => (
              <PortfolioTile
                key={portfolio['sl.no.']}
                portfolio={portfolio}
                index={index}
                isAuthenticated={Boolean(user)}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        <div className='mt-12 flex items-center justify-between border-t border-border pt-5'>
          <Button
            variant='ghost'
            onClick={() => changePage(page - 1)}
            disabled={page === 1}
            className='px-0 text-muted-foreground hover:bg-transparent hover:text-foreground'
          >
            <ChevronLeft aria-hidden='true' /> Previous
          </Button>
          <div className='flex items-center gap-1' aria-label='Pagination'>
            {Array.from({ length: pageCount }, (_, index) => index + 1).map(
              item => (
                <Button
                  key={item}
                  variant={item === page ? 'default' : 'ghost'}
                  size='icon'
                  onClick={() => changePage(item)}
                  aria-label={`Go to page ${item}`}
                  aria-current={item === page ? 'page' : undefined}
                  className={
                    item === page ? 'h-8 w-8' : 'h-8 w-8 text-muted-foreground'
                  }
                >
                  {item}
                </Button>
              )
            )}
          </div>
          <Button
            variant='ghost'
            onClick={() => changePage(page + 1)}
            disabled={page === pageCount}
            className='px-0 text-muted-foreground hover:bg-transparent hover:text-foreground'
          >
            Next <ChevronRight aria-hidden='true' />
          </Button>
        </div>
      </main>

      <Footer />
    </div>
  )
}
