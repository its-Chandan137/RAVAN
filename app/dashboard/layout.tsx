"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckSquare, ScrollText, BarChart3, Settings, LogOut, Menu, X, Flame
} from "lucide-react";
import { logout, checkSession } from "@/lib/auth";

const nav = [
  { href: "/dashboard/daily", label: "Daily Tracker", icon: CheckSquare },
  { href: "/dashboard/philosophy", label: "Ravana Philosophy", icon: ScrollText },
  { href: "/dashboard/weekly", label: "Weekly Progress", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    checkSession().then((ok) => {
      if (!ok) router.replace("/login");
      else setReady(true);
    });
  }, [router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
    router.refresh();
  }

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gold font-display text-2xl animate-pulse">Entering Lanka...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-border bg-bg2/60 backdrop-blur sticky top-0 h-screen">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-4 py-3 bg-bg2/90 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-gold" />
          <span className="font-display text-gold tracking-widest">RAVAN</span>
        </div>
        <button onClick={() => setMobileOpen(true)} className="text-gold">
          <Menu className="w-6 h-6" />
        </button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-40 bg-black/60"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-72 bg-bg2 border-r border-border flex flex-col"
            >
              <div className="flex justify-end p-3">
                <button onClick={() => setMobileOpen(false)} className="text-gold"><X className="w-5 h-5" /></button>
              </div>
              <SidebarContent pathname={pathname} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 min-w-0 pt-14 lg:pt-0">
        <div className="max-w-7xl mx-auto p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
}

function SidebarContent({ pathname, onLogout, onNavigate }: { pathname: string; onLogout: () => void; onNavigate?: () => void }) {
  return (
    <>
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-gold flex items-center justify-center pulse-gold">
            <Flame className="w-5 h-5 text-gold" />
          </div>
          <div>
            <h2 className="font-display text-xl text-gold tracking-widest">RAVAN</h2>
            <p className="text-muted text-[10px] tracking-[0.2em] uppercase">Path to Mastery</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {nav.map((item) => {
          const active = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                active
                  ? "bg-gold/15 text-gold border border-gold/30"
                  : "text-text/80 hover:bg-bg3 hover:text-gold"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-border">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-crimson-light hover:bg-crimson/10 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </>
  );
}