'use client'

import { cn } from "@/lib/utils";
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
  const href = user?.xHandle ? `/profile/${user.xHandle}` : '/signin'

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex h-9 w-fit shrink-0 items-center justify-center',
        'rounded-md border border-border bg-card ',
        'text-foreground transition-all duration-200',
        'hover:border-foreground/40'
      )}
    >
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ?? 'Profile'}
          width={32}
          height={32}
          className='p-[1px] rounded-md'
        />  
      ) : (
        <span className="px-2">Sign in</span>
      )}
    </Link>
  )
}
