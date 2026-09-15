"use client"

import Link from "next/link"
import Image from "next/image"

type ProfileLinkProps = {
  user?: {
    name?: string | null
    image?: string | null
    xHandle?: string | null
  } | null
}

export default function ProfileLink({ user }: ProfileLinkProps) {
  const href = user?.xHandle
    ? `/profile/${user.xHandle}`
    : "/signin"

  return (
    <Link href={href}>
      {user?.image ? (
        <Image
          src={user.image}
          alt={user.name ?? "Profile"}
          width={32}
          height={32}
          className="rounded-full"
        />
      ) : (
        <span>Sign in</span>
      )}
    </Link>
  )
}