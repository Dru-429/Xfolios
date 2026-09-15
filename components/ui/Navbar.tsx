"use client";

import { Moon, Sun, User, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/useTheme";
import Link from "next/link";

function NavPill({
  to,
  label,
  primary = false,
}: {
  to: string;
  label: string;
  primary?: boolean;
}) {
  return (
    <Link
      href={to}
      className={cn(
        "inline-flex h-9 items-center justify-center rounded-md border px-4 text-sm font-medium",
        "transition-all duration-200",
        primary
          ? "border-primary bg-primary text-primary-foreground hover:opacity-90"
          : "border-border bg-card text-foreground hover:border-foreground/40"
      )}
    >
      {label}
    </Link>
  );
}

function ThemeToggle({
  isDark,
  toggleTheme,
}: {
  isDark: boolean;
  toggleTheme: () => void;
}) {
  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={cn(
        "relative flex h-9 w-18 items-center rounded-md",
        "border border-border bg-card p-1",
        "transition-colors duration-200",
        "hover:border-foreground/40"
      )}
    >
      {/* Sliding orange indicator */}
      <span
        className={cn(
          "absolute top-1 flex h-7 w-8 items-center justify-center rounded-lg",
          "bg-primary text-primary-foreground",
          "transition-transform duration-300 ease-out",
          isDark ? "translate-x-7" : "translate-x-0"
        )}
      >
        {isDark ? (
          <Moon size={14} strokeWidth={2} aria-hidden="true" />
        ) : (
          <Sun size={14} strokeWidth={2} aria-hidden="true" />
        )}
      </span>

      {/* Empty side icons */}
      <span
        className={cn(
          "relative z-10 flex w-1/2 items-center justify-center",
          !isDark ? "opacity-0" : "text-muted-foreground"
        )}
      >
        <Sun size={13} aria-hidden="true" />
      </span>

      <span
        className={cn(
          "relative z-10 flex w-1/2 items-center justify-center",
          isDark ? "opacity-0" : "text-muted-foreground"
        )}
      >
        <Moon size={13} aria-hidden="true" />
      </span>
    </button>
  );
}

function ProfileLink() {
  return (
    <Link
      href="/profile"
      aria-label="Profile"
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center",
        "rounded-md border border-border bg-card",
        "text-foreground transition-all duration-200",
        "hover:border-foreground/40"
      )}
    >
      <User size={16} strokeWidth={1.8} aria-hidden="true" />
    </Link>
  );
}

export function Navbar() {
  const { isDark, toggleTheme, mounted } = useTheme();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm px-5">
      <div className="mx-auto flex h-18 w-full items-center justify-between px-6 sm:px-8 lg:px-10">
        
        <Link
          href="/"
          className="group flex items-center font-display text-[21px] font-medium tracking-[-0.03em]"
        >
          <span className="text-primary transition-opacity group-hover:opacity-80">
            X
          </span>
          <span className="ml-1 text-foreground">
            folios
          </span>
        </Link>

        {/* Navigation */}
        <nav
          className="flex items-center gap-2 sm:gap-3"
          aria-label="Primary navigation"
        >
          <NavPill
            to="/play"
            label={
              <span className="flex items-center gap-2">
                <Play size={13} fill="currentColor" />
                Play
              </span>
            }
          />

          <NavPill
            to="/add"
            label="Add"
            primary
          />

          {/* Theme */}
          {mounted ? (
            <ThemeToggle
              isDark={isDark}
              toggleTheme={toggleTheme}
            />
          ) : (
            <div className="h-9 w-18 rounded-md border border-border bg-card" />
          )}

          {/* Profile */}
          <ProfileLink />
        </nav>
      </div>
    </header>
  );
}