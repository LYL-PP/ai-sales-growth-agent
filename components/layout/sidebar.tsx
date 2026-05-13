"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MessageSquareText,
  UserCircle,
  Sparkles,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

const navItems = [
  {
    label: "工作台",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "AI 销售分析",
    href: "/analysis",
    icon: MessageSquareText,
    highlight: true,
  },
  {
    label: "用户画像",
    href: "/profile/u1",
    icon: UserCircle,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-full w-[220px] flex-col border-r border-border bg-sidebar">
      {/* Logo */}
      <div className="flex h-14 items-center gap-3 border-b border-border px-4">
        <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary/30 to-primary/5 ring-1 ring-primary/20">
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/20 to-transparent" />
          <Sparkles className="relative h-4 w-4 text-primary" />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-[14px] font-bold tracking-tight text-foreground">
            Growth
          </span>
          <span className="text-[14px] font-bold tracking-tight text-foreground -mt-0.5">
            Agent
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 px-3 py-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] font-medium transition-all duration-150",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
            >
              <item.icon
                className={cn(
                  "h-4 w-4 transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              />
              <span className="flex-1">{item.label}</span>
              {item.highlight && (
                <span className="flex h-4 items-center rounded bg-primary/15 px-1.5 text-[9px] font-semibold text-primary">
                  AI
                </span>
              )}
              {isActive && (
                <ChevronRight className="h-3 w-3 text-primary opacity-60" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-border px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/15">
            <TrendingUp className="h-3 w-3 text-emerald-400" />
          </div>
          <div className="flex flex-col text-[10px]">
            <span className="text-muted-foreground">AI 处理率</span>
            <span className="font-semibold text-emerald-400">76.8%</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
