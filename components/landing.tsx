'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search
} from 'lucide-react'
import { Select } from 'radix-ui'
import {
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
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

type SortOption = 'elo-desc' | 'elo-asc' | 'bookmarks-desc'

const sortOptions: { value: SortOption; label: string }[] = [
  { value: 'elo-desc', label: 'Highest to lowest ELO' },
  { value: 'elo-asc', label: 'Lowest to highest ELO' },
  { value: 'bookmarks-desc', label: 'Highest bookmarked' }
]

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
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortOption>('elo-desc')
  const [isSortOpen, setIsSortOpen] = useState(false)
  const isDark = useSyncExternalStore(
    subscribeToThemeChange,
    getStoredTheme,
    () => false
  )
  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matches = query
      ? records.filter(record =>
          [
            record.Username,
            record['portfolio url']
          ].some(value => value.toLowerCase().includes(query))
        )
      : records

    return [...matches].sort((first, second) => {
      if (sort === 'elo-asc') {
        return (first.elo ?? 0) - (second.elo ?? 0)
      }

      if (sort === 'bookmarks-desc') {
        return (second.bookmarkCount ?? 0) - (first.bookmarkCount ?? 0) ||
          (second.elo ?? 0) - (first.elo ?? 0)
      }

      return (second.elo ?? 0) - (first.elo ?? 0)
    })
  }, [records, search, sort])
  const pageCount = Math.max(1, Math.ceil(filteredRecords.length / PAGE_SIZE))

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark)
  }, [isDark])

  const currentRecords = useMemo(
    () => filteredRecords.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filteredRecords, page]
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

        <div className='mb-12 flex flex-col items-stretch justify-end gap-3 border-b border-border pb-4 sm:flex-row sm:items-center'>
          <label className='group relative block w-full sm:max-w-sm'>
            <span className='sr-only'>Search pages</span>
            <Input
              type='search'
              value={search}
              onChange={event => {
                setSearch(event.target.value)
                setPage(1)
              }}
              placeholder='Search portfolios...'
              className='h-11 rounded-md bg-card pr-12'
            />
            <span className='pointer-events-none absolute right-1 top-1 inline-flex h-9 w-9 items-center justify-center rounded-sm group-hover:bg-primary bg-primary/80 text-primary-foreground'>
              <Search className='h-4 w-4' aria-hidden='true' />
            </span>
          </label>

          <Select.Root
            open={isSortOpen}
            onOpenChange={setIsSortOpen}
            value={sort}
            onValueChange={value => {
              setSort(value as SortOption)
              setPage(1)
            }}
          >
            <Select.Trigger
              aria-label='Sort portfolios'
              className='flex h-11 w-full items-center justify-between gap-3 rounded-md border border-input bg-card px-3 text-sm text-foreground outline-none transition-colors hover:bg-muted/40 focus-visible:ring-1 focus-visible:ring-ring data-[state=open]:border-ring data-[state=open]:bg-muted/40 sm:w-60'
            >
              <Select.Value />
              <Select.Icon asChild>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                    isSortOpen && 'rotate-180'
                  )}
                  aria-hidden='true'
                />
              </Select.Icon>
            </Select.Trigger>
            <Select.Portal>
              <Select.Content
                position='popper'
                sideOffset={6}
                align='end'
                className='z-50 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-md border border-border bg-popover text-popover-foreground shadow-md data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95'
              >
                <Select.Viewport className='p-1'>
                  {sortOptions.map(option => (
                    <Select.Item
                      key={option.value}
                      value={option.value}
                      className='relative flex h-9 cursor-default select-none items-center rounded-sm px-2.5 pr-9 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground'
                    >
                      <Select.ItemText>{option.label}</Select.ItemText>
                      <Select.ItemIndicator className='absolute right-2.5 inline-flex items-center text-primary'>
                        <Check className='h-3.5 w-3.5' aria-hidden='true' />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div className='mb-5 flex items-center justify-between gap-4'>
          <p className='font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground'>
            Showing{' '}
            {String(
              filteredRecords.length ? (page - 1) * PAGE_SIZE + 1 : 0
            ).padStart(3, '0')}{' '}
            —{' '}
            {String(Math.min(page * PAGE_SIZE, filteredRecords.length)).padStart(
              3,
              '0'
            )}
          </p>
          <p className='text-sm text-muted-foreground'>
            Page {page} of {pageCount}
          </p>
        </div>

        {currentRecords.length ? (
          <AnimatePresence mode='wait'>
            <motion.div
              key={`${page}-${search}-${sort}`}
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
        ) : (
          <div className='rounded-lg border border-dashed border-border py-20 text-center'>
            <p className='text-sm font-medium'>No portfolios found.</p>
            <p className='mt-1 text-xs text-muted-foreground'>
              Try a different name, handle, or website.
            </p>
          </div>
        )}

        {filteredRecords.length ? (
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
        ) : null}
      </main>

      <Footer />
    </div>
  )
}