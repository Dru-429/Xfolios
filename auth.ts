import NextAuth from "next-auth"
import Twitter, { type TwitterProfile } from "next-auth/providers/twitter"

import { prisma } from "@/src/db"

const twitter = Twitter({
  async profile(profile: TwitterProfile) {
    const { data } = profile

    const dbUser = await prisma.user.upsert({
      where: { xId: data.id },
      update: {
        xUsername: data.name,
        xHandle: data.username,
        xAvatar: data.profile_image_url ?? null,
      },
      create: {
        xId: data.id,
        xUsername: data.name,
        xHandle: data.username,
        xAvatar: data.profile_image_url ?? null,
      },
    })

    return {
      id: data.id,
      name: data.name,
      email: null,
      image: data.profile_image_url ?? null,
      dbId: dbUser.id,
      xId: data.id,
      xHandle: data.username,
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
