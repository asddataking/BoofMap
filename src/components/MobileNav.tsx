"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Map, Newspaper, Target, User } from "lucide-react";
import { cn } from "@/lib/utils";

const links = [
  { href: "/", label: "Map", icon: Map },
  { href: "/reports", label: "Reports", icon: Newspaper },
  { href: "/report", label: "Report", icon: Target },
  { href: "/brands", label: "Brands", icon: Flame },
  { href: "/profile", label: "Profile", icon: User },
] as const;

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800/80 bg-[#0a0a0a]/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-2xl lg:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex max-w-6xl items-stretch justify-around px-1 py-1.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              aria-label={label}
              className={cn(
                "flex min-h-[52px] min-w-[56px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-[10px] font-medium transition active:scale-95",
                active
                  ? "text-emerald-400"
                  : "text-zinc-500 hover:text-zinc-300"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active && "drop-shadow-[0_0_8px_rgba(34,197,94,0.5)]"
                )}
                strokeWidth={active ? 2.5 : 2}
                aria-hidden
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
