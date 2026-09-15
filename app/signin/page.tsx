import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"

import { auth, signIn } from "@/auth"

export const metadata: Metadata = {
  title: "Sign in | Xfolios",
  description: "Sign in to Xfolios with your X account.",
}

type SignInPageProps = {
  searchParams: Promise<{
    callbackUrl?: string | string[]
    error?: string | string[]
  }>
}

const errorMessages: Record<string, string> = {
  AccessDenied: "Access was denied. Please try again.",
  Configuration: "Sign-in is temporarily unavailable.",
  OAuthCallbackError: "X could not complete the sign-in request.",
  OAuthSignin: "X could not start the sign-in request.",
}

function safeRedirect(value: string | string[] | undefined) {
  const destination = Array.isArray(value) ? value[0] : value

  return destination?.startsWith("/") && !destination.startsWith("//")
    ? destination
    : "/"
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const query = await searchParams
  const redirectTo = safeRedirect(query.callbackUrl)
  const errorCode = Array.isArray(query.error) ? query.error[0] : query.error
  const session = await auth()

  if (session?.user) {
    redirect(redirectTo)
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-background px-5 py-8 text-foreground sm:px-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-45 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:linear-gradient(to_bottom,black,transparent_82%)]"
      />

      <div className="relative mx-auto flex w-full max-w-6xl flex-col">
        <header className="flex items-center justify-between">
          <Link
            href="/"
            className="font-display text-xl font-medium tracking-[-0.04em]"
          >
            <span className="text-primary">X</span>
            <span className="ml-1">folios</span>
          </Link>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Member access
          </span>
        </header>

        <section className="grid flex-1 place-items-center py-16">
          <div className="w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_80px_-40px_color-mix(in_oklch,var(--foreground)_32%,transparent)]">
            <div className="border-b border-border px-7 py-8 sm:px-9 sm:py-10">
              <div className="mb-8 flex h-11 w-11 items-center justify-center rounded-lg bg-foreground text-background">
                <svg
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                  className="h-5 w-5 fill-current"
                >
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                </svg>
              </div>

              <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                One account. No passwords.
              </p>
              <h1 className="font-display text-4xl font-normal tracking-[-0.055em]">
                Welcome to the index.
              </h1>
              <p className="mt-4 max-w-sm text-sm leading-6 text-muted-foreground">
                Use your X account to submit portfolios, bookmark standout work,
                and take part in community rankings.
              </p>

              {errorCode ? (
                <p
                  role="alert"
                  className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
                >
                  {errorMessages[errorCode] ??
                    "We could not sign you in. Please try again."}
                </p>
              ) : null}

              <form
                className="mt-8"
                action={async () => {
                  "use server"
                  await signIn("twitter", { redirectTo })
                }}
              >
                <button
                  type="submit"
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-md bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
                >
                  <svg
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                    className="h-4 w-4 fill-current"
                  >
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.657l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231Zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77Z" />
                  </svg>
                  Continue with X
                </button>
              </form>
            </div>

            <div className="flex items-center justify-between gap-4 bg-muted/45 px-7 py-4 font-mono text-[9px] uppercase tracking-[0.12em] text-muted-foreground sm:px-9">
              <span>OAuth 2.0</span>
              <span>Your password stays with X</span>
            </div>
          </div>
        </section>

        <footer className="flex flex-col gap-2 border-t border-border pt-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>Made for the curious internet.</p>
          <Link href="/" className="transition-colors hover:text-foreground">
            Back to the open index
          </Link>
        </footer>
      </div>
    </main>
  )
}
