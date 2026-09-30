'use client'

import { cn } from "@/lib/utils";
import { getProfileHref } from '@/lib/routes'
import Link from 'next/link'
import Image from 'next/image'

type ProfileLinkProps = {
  user?: {
    name?: string | null
    image?: string | null
    xHandle?: string | null
  } | null
}

export default function ProfileLink ({ user }: ProfileLinkProps) {
  const href = user?.xHandle ? getProfileHref(user.xHandle) : '/signin'

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-11 w-fit shrink-0 items-center justify-center p-1',
        'rounded-lg border border-border bg-card',
        'text-foreground outline-none transition-colors duration-200',
        'hover:border-foreground/40 focus-visible:ring-2 focus-visible:ring-ring/50'
      )}
    >
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ?? 'Profile'}
          width={36}
          height={36}
          className='h-9 w-9 rounded-md object-cover'
        />  
      ) : (
        <span className='px-3 text-md font-medium text-[#207fbe]'>Sign in</span>
      )}
    </Link>
  )
}
