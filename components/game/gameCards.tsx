import { ArrowRight, ExternalLink, Trophy } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { GamePortfolio, RoundResult } from './gameTypes'

export default function GameCards({
  pair,
  roundResult,
  onChoose
}: {
  pair: GamePortfolio[]
  roundResult: RoundResult | null
  onChoose: (folio: GamePortfolio) => void
}) {
  return (
    <div className='grid gap-5 pt-8 md:grid-cols-2 lg:gap-7'>
      {pair.map((folio) => {
        const selected = roundResult?.winner.id === folio.id
        const lost = roundResult?.loser.id === folio.id
        const initials = folio.name.trim().slice(0, 2).toUpperCase()

        return (
          <div key={folio.id} className='transition-opacity duration-300' style={{ opacity: lost ? 0.58 : 1 }}>
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
              <div className='w-full border-b border-border bg-secondary/55 p-3 sm:p-4'>
                <div className='overflow-hidden rounded-xl border border-foreground/20 bg-foreground/4 p-2 shadow-sm transition-transform duration-500 group-hover:-translate-y-0.5 sm:p-3'>
                  <div className='flex h-6 items-center gap-1.5 border-b border-border px-1 pb-2 sm:h-7'>
                    <span className='h-2 w-2 rounded-full bg-destructive/70' />
                    <span className='h-2 w-2 rounded-full bg-primary/70' />
                    <span className='h-2 w-2 rounded-full bg-muted-foreground/40' />
                    <span className='ml-2 min-w-0 flex-1 truncate rounded-sm border border-border bg-background px-2 py-0.5 text-left font-mono text-[8px] text-muted-foreground sm:text-[9px]'>
                      {folio.domain}
                    </span>
                  </div>

                  <div className='relative mt-2 aspect-16/10 overflow-hidden rounded-md border border-border bg-background'>
                    <iframe
                      src={folio.websiteUrl}
                      title={`${folio.name}'s portfolio website preview`}
                      loading='lazy'
                      className='pointer-events-none h-full w-full bg-card'
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
                  <AvatarImage src={folio.avatar} alt={`${folio.name} on X`} loading='lazy' />
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
                  <Trophy className='mt-1 h-4 w-4 shrink-0 text-primary' aria-hidden='true' />
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