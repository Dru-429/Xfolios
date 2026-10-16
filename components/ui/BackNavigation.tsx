'use client'

import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { cn } from '@/lib/utils'

type BackNavigationProps = {
  className?: string
  fallbackHref?: string
}

export default function BackNavigation ({
  className,
  fallbackHref = '/'
}: BackNavigationProps) {
  const router = useRouter()

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
      return
    }

    router.push(fallbackHref)
  }

  return (
    <button
      type='button'
      onClick={handleBack}
      aria-label='Go back'
      title='Go back'
      className={cn(
        'mb-4 sm:mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground',
        className
      )}
    >
      <ArrowLeft className='h-5 w-10' aria-hidden='true' />
        
    </button>
  )
}
