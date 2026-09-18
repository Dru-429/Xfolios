import { motion } from 'motion/react'
import { ArrowRight, RotateCcw } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

import type { GamePortfolio, RoundResult } from './gameTypes'

export default function GameResults({ elo, results, onRestart }: { elo: number; results: RoundResult[]; onRestart: () => void }) {
	return (
		<main className='mx-auto w-full max-w-[1440px] px-5 pb-16 pt-12 sm:px-8 sm:pt-16 lg:px-10'>
			<motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
				<div className='flex flex-col justify-between gap-6 border-b border-border pb-8 sm:flex-row sm:items-end'><div><p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>Game complete</p><h1 className='mt-4 font-display text-5xl font-normal tracking-[-0.06em] sm:text-7xl'>Your folio list.</h1><p className='mt-4 text-muted-foreground'>{results.length} rounds played · final Elo {elo}</p></div><Button type='button' variant='outline' onClick={onRestart} className='rounded-full px-5'><RotateCcw aria-hidden='true' /> Play again</Button></div>
				<div className='grid gap-10 pt-10 lg:grid-cols-2 lg:gap-14'><ResultList title='You chose' items={results.map(result => result.winner)} tone='win' /><ResultList title='Passed on' items={results.map(result => result.loser)} tone='loss' /></div>
			</motion.section>
		</main>
	)
}

function ResultList({ title, items, tone }: { title: string; items: GamePortfolio[]; tone: 'win' | 'loss' }) {
	return <section><div className='mb-4 flex items-center justify-between border-b border-border pb-3'><h2 className='font-display text-2xl'>{title}</h2><span className={tone === 'win' ? 'font-mono text-xs text-primary' : 'font-mono text-xs text-muted-foreground'}>{items.length}/10</span></div><div className='divide-y divide-border border-y border-border'>{items.map((folio, index) => <Link key={`${folio.id}-${index}`} href={`/page/${folio.id}`} className='flex items-center gap-3 py-3 transition-colors hover:text-primary'><span className='w-6 font-mono text-[10px] text-muted-foreground'>{String(index + 1).padStart(2, '0')}</span><Avatar className='h-8 w-8 rounded-md border border-border'><AvatarImage src={folio.avatar} alt={`${folio.name} on X`} /><AvatarFallback className='rounded-md bg-accent text-[10px] text-accent-foreground'>{folio.name.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className='min-w-0 flex-1 truncate text-sm'>{folio.name}</span><span className='hidden max-w-[38%] truncate text-xs text-muted-foreground sm:block'>{folio.domain}</span><ArrowRight className='h-4 w-4 shrink-0 text-muted-foreground' aria-hidden='true' /></Link>)}</div></section>
}
