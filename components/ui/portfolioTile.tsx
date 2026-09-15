"use client"

import { motion } from "motion/react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from 'next/link'


type Portfolio = {
  'sl.no.': number
  pageId?: string
  Username: string
  'X url': string
  'X image url': string
  'portfolio url': string
}

export default function PortfolioTile ({
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
      {portfolio.pageId ? (
        <Link
          href={`/page/${portfolio.pageId}`}
          className='block'
          aria-label={`Open ${name}'s portfolio`}
        >
          <PortfolioTileContent
            portfolio={portfolio}
            name={name}
            handle={handle}
            initials={initials}
            portfolioUrl={portfolioUrl}
            hasPreviewError={hasPreviewError}
            setHasPreviewError={setHasPreviewError}
          />
        </Link>
      ) : (
        <a
          href={portfolioUrl}
          target='_blank'
          rel='noreferrer'
          className='block'
          aria-label={`Open ${name}'s portfolio`}
        >
          <PortfolioTileContent
            portfolio={portfolio}
            name={name}
            handle={handle}
            initials={initials}
            portfolioUrl={portfolioUrl}
            hasPreviewError={hasPreviewError}
            setHasPreviewError={setHasPreviewError}
          />
        </a>
      )}
      <div className='truncate border-t border-border/70 px-3 pb-3 font-mono text-[10px] text-muted-foreground sm:px-4'>
        {domain}
      </div>
    </motion.article>
  )
}

function PortfolioTileContent ({
  portfolio,
  name,
  handle,
  initials,
  portfolioUrl,
  hasPreviewError,
  setHasPreviewError
}: {
  portfolio: Portfolio
  name: string
  handle?: string
  initials: string
  portfolioUrl: string
  hasPreviewError: boolean
  setHasPreviewError: Dispatch<SetStateAction<boolean>>
}) {
  return (
    <>
        <div
          className={`relative aspect-[1.48] overflow-hidden border-b border-border`}
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
    </>
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