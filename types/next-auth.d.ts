import type { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      xId: string
      xHandle: string
    }
  }

  interface User {
    dbId: string
    xId: string
    xHandle: string
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    userId: string
    xId: string
    xHandle: string
  }
}
