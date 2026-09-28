'use client'

import { Moon, Sun } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import ProfileLink from './ProfileLink'
import { Logo } from './Logo';

type NavbarUser = {
  name?: string | null
  image?: string | null
  xHandle?: string | null
}

const pageLinks = [
  { href: '/', label: 'Home', route: '/' },
  { href: '/play', label: 'Play', route: '/play' },
  { href: '/add', label: 'Submit', route: '/add' }
] as const

export function ThemeToggle ({
  isDark,
  toggleTheme
}: {
  isDark: boolean
  toggleTheme: () => void
}) {
  return (
    <button
      type='button'
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-pressed={isDark}
      className='relative grid items-center h-11 w-20 shrink-0 grid-cols-2 rounded-lg border border-border bg-card p-1 text-muted-foreground outline-none transition-colors hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50'
    >
      <span
        className={cn(
          'absolute left-1 top-1 h-8.5 w-9 rounded-l-md bg-primary shadow-sm transition-transform duration-300 ease-out',
          isDark && 'translate-x-8.5 rounded-r-md rounded-l-none'
        )}
        aria-hidden='true'
      />
      <span
        className={cn(
          'relative z-10 flex items-center justify-center transition-colors',
          !isDark && 'text-primary-foreground'
        )}
      >
        <Sun className='h-4 w-4' aria-hidden='true' />
      </span>
      <span
        className={cn(
          'relative z-10 flex items-center justify-center transition-colors',
          isDark && 'text-primary-foreground'
        )}
      >
        <Moon className='h-4 w-4' aria-hidden='true' />
      </span>
    </button>
  )
}

export function Navbar ({ user }: { user: NavbarUser | null }) {
  const pathname = usePathname()
  const { isDark, toggleTheme, mounted } = useTheme()
  const isSignedIn = Boolean(user?.xHandle)

  return (
    <header className='sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm'>
      <div className='mx-auto grid w-full max-w-[1440px] grid-cols-[1fr_auto] items-center gap-x-3 gap-y-2 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:px-8 lg:px-10'>
        <Link
          href='/'
          aria-label='Xfolios home'
          className='group col-start-1 row-start-1 flex h-11 w-[136px] items-center justify-center rounded-lg p-1 text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring/50'
        >
          {/* <span
            aria-hidden='true'
            className='block h-9 w-32 bg-current transition-opacity group-hover:opacity-80'
            style={{
              mask: "url('/logo/logo.svg') center / contain no-repeat",
              WebkitMask: "url('/logo/logo.svg') center / contain no-repeat"
            }}
          /> */}
          <Logo className="h-9 w-9" />
          
        </Link>

        <nav
          className='col-span-2 row-start-2 flex h-11 justify-self-center rounded-lg border border-border bg-card p-1 sm:col-span-1 sm:col-start-2 sm:row-start-1'
          aria-label='Primary navigation'
        >
          {pageLinks.map(link => {
            const isActive = pathname === link.route
            const href = link.route !== '/' && !isSignedIn
              ? '/signin'
              : link.href

            return (
              <Link
                key={link.route}
                href={href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'inline-flex h-8.5 min-w-18 items-center justify-center rounded-md px-4 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring/50 sm:min-w-20',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                )}
              >
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div className='col-start-2 row-start-1 flex items-center justify-self-end gap-2 sm:col-start-3'>
          {mounted ? (
            <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
          ) : (
            <div
              className='h-11 w-20 shrink-0 rounded-lg border border-border bg-card p-1'
              aria-hidden='true'
            />
          )}
          <ProfileLink user={user} />
        </div>
      </div>
    </header>
  )
}
