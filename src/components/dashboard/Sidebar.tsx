"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  Megaphone,
  Users,
  BarChart3,
  Settings,
  LifeBuoy,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const SILK = [0.16, 1, 0.3, 1] as const;

type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge?: string;
};

const PRIMARY: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Intelligence", href: "/dashboard/intelligence", icon: Sparkles, badge: "AI" },
  { label: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { label: "Audiences", href: "/dashboard/audiences", icon: Users },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
];

const SECONDARY: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  { label: "Concierge", href: "/dashboard/concierge", icon: LifeBuoy },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname?.startsWith(href);

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 76 : 264 }}
      transition={{ duration: 0.5, ease: SILK }}
      className="sticky top-0 flex h-screen flex-col border-r border-gold/10 bg-obsidian/80 backdrop-blur-xl"
    >
      {/* Brand */}
      <div className="flex h-20 items-center border-b border-gold/10 px-6">
        <Link href="/dashboard" className="group flex items-center gap-3 overflow-hidden">
          <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border border-gold/30 bg-void">
            <span className="font-display text-lg italic text-gold">a</span>
            <span className="absolute -inset-px rounded-[2px] border border-gold/0 transition-colors duration-700 group-hover:border-gold/30" />
          </span>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, ease: SILK }}
              className="flex flex-col leading-tight"
            >
              <span className="font-display text-xl tracking-wide text-warm-white">
                apex<span className="text-gold">.</span>
              </span>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-mist">
                Atelier
              </span>
            </motion.span>
          )}
        </Link>
      </div>

      {/* Primary nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        <SectionLabel collapsed={collapsed} label="Practice" />
        <ul className="mt-3 flex flex-col gap-1">
          {PRIMARY.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={!!isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </ul>

        <div className="my-8 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />

        <SectionLabel collapsed={collapsed} label="Atelier" />
        <ul className="mt-3 flex flex-col gap-1">
          {SECONDARY.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              active={!!isActive(item.href)}
              collapsed={collapsed}
            />
          ))}
        </ul>
      </nav>

      {/* Footer / collapse */}
      <div className="border-t border-gold/10 p-3">
        {!collapsed && (
          <div className="mb-3 rounded-[2px] border border-gold/15 bg-carbon/60 p-4">
            <div className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
              Concierge
            </div>
            <p className="mt-2 text-xs leading-relaxed text-titanium">
              Direct line to your strategist. Replies within the hour.
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className={cn(
            "group flex w-full items-center gap-3 rounded-[2px] px-3 py-2.5 text-titanium transition-colors duration-500",
            "hover:bg-carbon/60 hover:text-gold-light"
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronsRight className="h-4 w-4" />
          ) : (
            <ChevronsLeft className="h-4 w-4" />
          )}
          {!collapsed && (
            <span className="font-mono text-[10px] uppercase tracking-[0.3em]">
              Collapse
            </span>
          )}
        </button>
      </div>
    </motion.aside>
  );
}

function SectionLabel({
  collapsed,
  label,
}: {
  collapsed: boolean;
  label: string;
}) {
  if (collapsed) {
    return <div className="mx-auto h-px w-6 bg-gold/20" />;
  }
  return (
    <div className="px-3 font-mono text-[9px] uppercase tracking-[0.4em] text-mist">
      {label}
    </div>
  );
}

function NavLink({
  item,
  active,
  collapsed,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
}) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        href={item.href}
        className={cn(
          "group relative flex items-center gap-3 rounded-[2px] px-3 py-2.5 transition-colors duration-500",
          active
            ? "bg-carbon/80 text-warm-white"
            : "text-titanium hover:bg-carbon/40 hover:text-warm-white"
        )}
      >
        {/* Active gold rail */}
        {active && (
          <motion.span
            layoutId="sidebar-rail"
            className="absolute left-0 top-1/2 h-6 w-px -translate-y-1/2 bg-gold"
            transition={{ duration: 0.5, ease: SILK }}
          />
        )}
        <Icon
          className={cn(
            "h-4 w-4 shrink-0 transition-colors duration-500",
            active ? "text-gold" : "text-mist group-hover:text-gold/70"
          )}
        />
        {!collapsed && (
          <span className="flex flex-1 items-center justify-between">
            <span className="text-sm tracking-wide">{item.label}</span>
            {item.badge && (
              <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-gold">
                {item.badge}
              </span>
            )}
          </span>
        )}
      </Link>
    </li>
  );
}
