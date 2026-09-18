import { motion } from 'motion/react'
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
			{pair.map((folio, index) => (
				<GameCard key={folio.id} folio={folio} index={index} roundResult={roundResult} onChoose={() => onChoose(folio)} />
			))}
		</div>
	)
}

function GameCard({ folio, index, roundResult, onChoose }: { folio: GamePortfolio; index: number; roundResult: RoundResult | null; onChoose: () => void }) {
	const selected = roundResult?.winner.id === folio.id
	const lost = roundResult?.loser.id === folio.id
	const initials = folio.name.trim().slice(0, 2).toUpperCase()

	return (
		<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: lost ? 0.58 : 1, y: 0 }} transition={{ delay: index * 0.08, duration: 0.35 }}>
			<Button type='button' variant='outline' onClick={onChoose} aria-label={`Choose ${folio.name}'s portfolio`} className={cn('group h-auto w-full flex-col items-stretch overflow-hidden rounded-xl p-0 text-left whitespace-normal', selected && 'border-primary ring-1 ring-primary', lost && 'border-border')}>
				<div className='relative aspect-[1.35] w-full overflow-hidden border-b border-border bg-secondary/70 p-[7%]'>
					<div className='absolute inset-[10%] rounded-lg border border-foreground/15 bg-card/70 p-[7%] transition-transform duration-500 group-hover:scale-[1.025]'>
						<div className='flex items-center justify-between'><span className='h-1 w-1/4 rounded-full bg-foreground/60' /><span className='h-1 w-[14%] rounded-full bg-primary/70' /></div>
						<div className='mt-[11%] h-[7%] w-2/3 rounded-full bg-foreground/70' />
						<div className='mt-[5%] h-[5%] w-1/2 rounded-full bg-foreground/20' />
						<div className='mt-[16%] grid grid-cols-3 gap-[5%]'><span className='aspect-[1.4] rounded-sm bg-primary/35' /><span className='aspect-[1.4] rounded-sm bg-foreground/10' /><span className='aspect-[1.4] rounded-sm bg-foreground/10' /></div>
					</div>
					<span className='absolute right-[9%] top-[8%] font-mono text-[9px] text-foreground/50'>{String(index + 1).padStart(2, '0')}</span>
					<span className='absolute bottom-[7%] left-[9%] font-mono text-[10px] uppercase tracking-[0.12em] text-foreground/50'>view folio ↗</span>
				</div>
				<div className='flex items-start gap-3 p-4 sm:p-5'>
					<Avatar className='h-10 w-10 shrink-0 rounded-md border border-border'><AvatarImage src={folio.avatar} alt={`${folio.name} on X`} loading='lazy' /><AvatarFallback className='rounded-md bg-accent text-xs text-accent-foreground'>{initials}</AvatarFallback></Avatar>
					<span className='min-w-0 flex-1'><span className='block truncate font-display text-lg font-medium text-card-foreground'>{folio.name}</span><span className='mt-0.5 block truncate text-xs text-muted-foreground'>@{folio.handle} · {folio.domain}</span></span>
					{selected ? <Trophy className='mt-1 h-4 w-4 shrink-0 text-primary' aria-hidden='true' /> : <ArrowRight className='mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1' aria-hidden='true' />}
				</div>
			</Button>
			<a href={folio.websiteUrl} target='_blank' rel='noreferrer' className='mt-2 inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary'>Open site <ExternalLink className='h-3 w-3' aria-hidden='true' /></a>
		</motion.div>
	)
}
