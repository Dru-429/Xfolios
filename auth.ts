import NextAuth from "next-auth"
import Twitter, { type TwitterProfile } from "next-auth/providers/twitter"

import { prisma } from "@/src/db"

const twitter = Twitter({
  async profile(profile: TwitterProfile) {
    const { data } = profile
    const handle = data.username.toLowerCase()

    // 1. Already linked before (returning user)?
    let dbUser = await prisma.user.findUnique({ where: { xId: data.id } })

    if (dbUser) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          xUsername: data.name,
          xHandle: handle,
          xAvatar: data.profile_image_url ?? null,
        },
      })
    } else {
      // 2. Not linked yet — is there an unclaimed seeded row for this handle?
      const unclaimed = await prisma.user.findFirst({
        where: { xHandle: handle, xId: null },
      })

      if (unclaimed) {
        // Claim it: attach the real xId, don't create a new row
        dbUser = await prisma.user.update({
          where: { id: unclaimed.id },
          data: {
            xId: data.id,
            xUsername: data.name,
            xAvatar: data.profile_image_url ?? null,
          },
        })
      } else {
        // 3. Genuinely new person, not in the scrape — create fresh
        dbUser = await prisma.user.create({
          data: {
            xId: data.id,
            xUsername: data.name,
            xHandle: handle,
            xAvatar: data.profile_image_url ?? null,
          },
        })
      }
    }

    return {
      id: data.id,
      name: data.name,
      email: null,
      image: data.profile_image_url ?? null,
      dbId: dbUser.id,
      xId: dbUser.xId,
      xHandle: dbUser.xHandle,
    }
  },
})
export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [twitter],
  pages: {
    signIn: "/signin",
    error: "/signin",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.userId = user.dbId
        token.xId = user.xId
        token.xHandle = user.xHandle
      }

      return token
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.userId
        session.user.xId = token.xId
        session.user.xHandle = token.xHandle
      }

      return session
    },
  },
})
