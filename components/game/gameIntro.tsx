import { motion } from 'motion/react'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'

export default function GameIntro({ onStart }: { onStart: () => void }) {
	return (
		<main className='mx-auto flex min-h-[calc(100vh-64px)] max-w-360 items-center px-5 py-14 sm:px-8 lg:px-10'>
			<motion.section
				className='w-full border-y border-border py-16 sm:py-24'
				initial={{ opacity: 0, y: 14 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.45 }}
			>
				<div className='max-w-2xl'>
					<p className='font-mono text-[11px] uppercase tracking-[0.18em] text-primary'>X folios / game mode</p>
					<h1 className='mt-5 max-w-xl font-display text-5xl font-normal leading-[0.96] tracking-[-0.06em] sm:text-7xl'>
						Find your <span className='text-primary'>favorite</span> folio.
					</h1>
					<p className='mt-6 max-w-lg text-base leading-relaxed text-muted-foreground'>
						Five rounds. Two portfolios at a time. Choose the one you would keep open, climb the Elo ladder, and see your personal shortlist at the end.
					</p>
					<Button type='button' onClick={onStart} className='mt-9 rounded-md px-7'>
						Start game <ArrowRight aria-hidden='true' />
					</Button>
				</div>
			</motion.section>
		</main>
	)
}
