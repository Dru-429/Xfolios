import { redirect } from 'next/navigation'

import { auth } from '@/auth'
import AddForm from '@/components/ui/addForm'
import Footer from '@/components/ui/footer'
import { Navbar } from '@/components/ui/Navbar'

export default async function AddPage() {
  const session = await auth()

  if (!session?.user) {
    redirect('/signin?callbackUrl=/add')
  }

  return (
    <div className='min-h-screen bg-background text-foreground'>
      <Navbar user={session.user} />
      <main className='mx-auto w-full max-w-6xl px-5 pb-16 pt-8 sm:px-8 sm:pt-12 lg:px-10'>
        <div className='grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(420px,1.25fr)] lg:gap-16'>
          <header className='max-w-md lg:pt-8'>
            <p className='font-mono text-[10px] uppercase tracking-[0.18em] text-primary'>
              Add / folio
            </p>
            <h1 className='mt-5 font-display text-5xl font-normal leading-[0.98] tracking-[-0.04em] sm:text-6xl'>
              Put your corner of the web on the map.
            </h1>
            <p className='mt-6 max-w-sm text-base leading-relaxed text-muted-foreground'>
              Share a personal site, studio, or side project with the X folios community.
            </p>
          </header>
          <AddForm userName={session.user.xHandle} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
