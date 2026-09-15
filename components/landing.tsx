'use client'

import { AnimatePresence, motion } from 'motion/react'
import {
  ArrowUpRight,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'
import Image from 'next/image'
import {
  type Dispatch,
  type SetStateAction,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore
} from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import portfolios from '@/data/portfolios.json'
import { Navbar } from './ui/Navbar'
import Hero from './ui/Hero'

type Portfolio = {
  'sl.no.': number
  Username: string
  'X url': string
  'X image url': string
  'portfolio url': string
}

const records = portfolios as Portfolio[]
const PAGE_SIZE = 20
const THEME_STORAGE_KEY = 'x-folios-theme'
const THEME_EVENT = 'x-folios-theme-change'
const previewThemes = [
  'preview-warm',
  'preview-ink',
  'preview-blue',
  'preview-rose',
  'preview-moss'
]

function getPreviewRequestUrl (portfolioUrl: string) {
  try {
    const params = new URLSearchParams({
      url: portfolioUrl,
      screenshot: 'true',
      meta: 'false',
      'viewport.isMobile': 'false',
      'viewport.width': '1200',
      'viewport.height': '750'
    })

    return `https://api.microlink.io/?${params.toString()}`
  } catch {
    return null
  }
}

function getScreenshotUrl (payload: unknown) {
  if (!payload || typeof payload !== 'object') {
    return null
  }

  const data =
    'data' in payload && payload.data && typeof payload.data === 'object'
      ? payload.data
      : null

  const screenshot =
    data &&
    'screenshot' in data &&
    data.screenshot &&
    typeof data.screenshot === 'object'
      ? data.screenshot
      : null

  if (
    screenshot &&
    'url' in screenshot &&
    typeof screenshot.url === 'string' &&
    screenshot.url.length > 0
  ) {
    return screenshot.url
  }

  return null
}

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

export default function Landing () {
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
    [page]
  )

  const changePage = (nextPage: number) => {
    setPage(Math.min(pageCount, Math.max(1, nextPage)))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <header className='border-b border-border'>
        <Navbar />
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

      <footer className='border-t border-border'>
        <div className='mx-auto flex max-w-[1440px] flex-col gap-2 px-5 py-7 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-8 lg:px-10'>
          <p>Made for the curious internet.</p>
          <p className='font-mono'>x folios / open index</p>
        </div>
      </footer>
    </div>
  )
}

function PortfolioTile ({
  portfolio,
  index
}: {
  portfolio: Portfolio
  index: number
}) {
  const [hasPreviewError, setHasPreviewError] = useState(false)
  const [rawName, handle] = portfolio.Username.split(' - ')
  const name = rawName ?? portfolio.Username
  const portfolioUrl = portfolio['portfolio url']
  const domain = portfolio['portfolio url']
    .replace(/^https?:\/\/(www\.)?/, '')
    .replace(/\/$/, '')
  const initials = name.trim().slice(0, 2).toUpperCase()

  return (
    <motion.article
      className='group min-w-0 overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/60'
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.025, 0.3), duration: 0.35 }}
    >
      <a
        href={portfolioUrl}
        target='_blank'
        rel='noreferrer'
        className='block'
        aria-label={`Open ${name}'s portfolio`}
      >
        <div
          className={`relative aspect-[1.48] overflow-hidden border-b border-border ${
            previewThemes[index % previewThemes.length]
          }`}
        >
          {!hasPreviewError ? (
            <PortfolioPreview
              portfolioUrl={portfolioUrl}
              name={name}
              setHasPreviewError={setHasPreviewError}
            />
          ) : (
            <PreviewFallback />
          )}
          <span className='absolute right-[9%] top-[8%] font-mono text-[8px] text-foreground/60'>
            {String(portfolio['sl.no.']).padStart(3, '0')}
          </span>
          <span className='absolute bottom-[7%] left-[9%] font-mono text-[8px] uppercase tracking-[0.12em] text-foreground/50'>
            view site ↗
          </span>
        </div>
        <div className='flex min-w-0 items-center gap-3 p-3 sm:p-4'>
          <Avatar className='h-9 w-9 shrink-0 rounded-md border border-border'>
            <AvatarImage
              src={portfolio['X image url']}
              alt={`${name} on X`}
              loading='lazy'
            />
            <AvatarFallback className='rounded-md bg-accent text-xs text-accent-foreground'>
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className='min-w-0 flex-1'>
            <p className='truncate text-sm font-medium text-card-foreground'>
              {name}
            </p>
            <p className='truncate text-xs text-muted-foreground'>
              {handle ?? `@${name.toLowerCase().replaceAll(' ', '')}`}
            </p>
          </div>
          <ArrowUpRight
            className='h-4 w-4 shrink-0 text-muted-foreground transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary'
            aria-hidden='true'
          />
        </div>
      </a>
      <div className='truncate border-t border-border/70 px-3 pb-3 font-mono text-[10px] text-muted-foreground sm:px-4'>
        {domain}
      </div>
    </motion.article>
  )
}

function PortfolioPreview ({
  portfolioUrl,
  name,
  setHasPreviewError
}: {
  portfolioUrl: string
  name: string
  setHasPreviewError: Dispatch<SetStateAction<boolean>>
}) {
  const [screenshotUrl, setScreenshotUrl] = useState<string | null>(null)

  useEffect(() => {
    const previewUrl = getPreviewRequestUrl(portfolioUrl)

    if (!previewUrl) {
      setHasPreviewError(true)
      return
    }

    const requestUrl = previewUrl
    const controller = new AbortController()

    async function loadPreview () {
      try {
        const response = await fetch(requestUrl, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Preview request failed: ${response.status}`)
        }

        const payload = await response.json()
        const nextScreenshotUrl = getScreenshotUrl(payload)

        if (!nextScreenshotUrl) {
          throw new Error('Preview response did not include a screenshot URL')
        }

        setScreenshotUrl(nextScreenshotUrl)
      } catch {
        if (controller.signal.aborted) {
          return
        }

        setHasPreviewError(true)
      }
    }

    loadPreview()

    return () => {
      controller.abort()
    }
  }, [portfolioUrl, setHasPreviewError])

  if (!screenshotUrl) {
    return <PreviewFallback />
  }

  return (
    <Image
      src={screenshotUrl}
      alt={`Preview of ${name}'s website`}
      fill
      sizes='(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw'
      className='object-cover transition-transform duration-500 group-hover:scale-[1.025]'
      onError={() => setHasPreviewError(true)}
    />
  )
}

function PreviewFallback () {
  return (
    <div className='absolute inset-x-[9%] top-[13%] bottom-[12%] overflow-hidden rounded-[4px] border border-foreground/15 bg-card/80 p-[7%] transition-transform duration-500 group-hover:scale-[1.025]'>
      <div className='mb-[10%] flex items-center justify-between'>
        <span className='h-1 w-[26%] rounded-full bg-foreground/60' />
        <span className='h-1 w-[14%] rounded-full bg-primary/70' />
      </div>
      <div className='h-[8%] w-[68%] rounded-full bg-foreground/70' />
      <div className='mt-[5%] h-[5%] w-[48%] rounded-full bg-foreground/20' />
      <div className='mt-[16%] grid grid-cols-3 gap-[5%]'>
        <span className='aspect-[1.4] rounded-[2px] bg-primary/35' />
        <span className='aspect-[1.4] rounded-[2px] bg-foreground/10' />
        <span className='aspect-[1.4] rounded-[2px] bg-foreground/10' />
      </div>
      <span className='absolute bottom-[10%] left-[7%] h-1 w-[24%] rounded-full bg-foreground/25' />
    </div>
  )
}
