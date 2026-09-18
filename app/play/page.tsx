import type { Metadata } from 'next'

import { auth } from '@/auth'
import GamePage from '@/components/gamePage'

export const metadata: Metadata = {
  title: 'Folio game | X folios',
  description: 'Choose between portfolios, climb the Elo ladder, and find your favorites.'
}

export default async function PlayPage() {
  const session = await auth()

  return <GamePage user={session?.user ?? null} />
}
