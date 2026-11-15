"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, BarChart3, BookOpen, Flame, LayoutDashboard, LogOut, Menu, Moon, Settings, Sun, X } from "lucide-react";
import { logout, checkSession } from "@/lib/auth";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/daily", label: "Daily practice", icon: Activity },
  { href: "/dashboard/weekly", label: "Weekly progress", icon: BarChart3 },
  { href: "/dashboard/philosophy", label: "Ravana philosophy", icon: BookOpen },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => { checkSession().then((ok) => { if (!ok) router.replace("/login"); else setReady(true); }); }, [router]);
  useEffect(() => {
    const saved = window.localStorage.getItem("ravan-theme");
    const nextTheme = saved === "dark" ? "dark" : "light";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
  }, []);
  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    window.localStorage.setItem("ravan-theme", nextTheme);
  }
  async function handleLogout() { await logout(); router.replace("/login"); router.refresh(); }

  if (!ready) return <div className="loading-screen"><Flame size={22} /> <span>Entering Lanka…</span></div>;
  return <div className="app-shell">
    <aside className="desktop-sidebar"><Brand /><SidebarContent pathname={pathname} onLogout={handleLogout} theme={theme} onToggleTheme={toggleTheme} /></aside>
    <header className="mobile-header"><Link href="/dashboard" className="mobile-brand"><Brand compact /></Link><div className="mobile-header-actions"><ThemeButton theme={theme} onToggle={toggleTheme} /><button className="mobile-menu-button" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu size={22} /></button></div></header>
    <AnimatePresence>{mobileOpen && <>
      <motion.button aria-label="Close navigation" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mobile-scrim" onClick={() => setMobileOpen(false)} />
      <motion.aside initial={{ x: -310 }} animate={{ x: 0 }} exit={{ x: -310 }} transition={{ type: "spring", damping: 27 }} className="mobile-drawer"><div className="drawer-top"><Brand /><button aria-label="Close menu" onClick={() => setMobileOpen(false)}><X size={20} /></button></div><SidebarContent pathname={pathname} onLogout={handleLogout} onNavigate={() => setMobileOpen(false)} theme={theme} onToggleTheme={toggleTheme} /></motion.aside>
    </>}</AnimatePresence>
    <main className="app-main"><div className="main-content">{children}</div></main>
    <nav className="mobile-tabbar" aria-label="Primary navigation">{nav.slice(0, 4).map(({ href, label, icon: Icon }) => { const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href); return <Link key={href} href={href} className={active ? "active" : ""}><Icon size={19} /><span>{label === "Daily practice" ? "Daily" : label === "Weekly progress" ? "Weekly" : label === "Overview" ? "Home" : "Wisdom"}</span></Link>; })}</nav>
  </div>;
}

function Brand({ compact = false }: { compact?: boolean }) { return <div className={`brand-lockup ${compact ? "compact" : ""}`}><span className="brand-symbol"><Flame size={21} strokeWidth={1.7} /></span><span><strong>RAVAN</strong><small>THE PATH TO MASTERY</small></span></div>; }

function SidebarContent({ pathname, onLogout, onNavigate, theme, onToggleTheme }: { pathname: string; onLogout: () => void; onNavigate?: () => void; theme: "light" | "dark"; onToggleTheme: () => void }) {
  return <><nav className="side-nav">{nav.map(({ href, label, icon: Icon }) => {
    const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href);
    return <Link key={href} href={href} onClick={onNavigate} className={active ? "active" : ""}><Icon size={18} strokeWidth={1.8} /><span>{label}</span>{active && <i />}</Link>;
  })}</nav><div className="sidebar-footer"><div className="sidebar-quote">“The mind is everything.<br />What you think, you become.”<span>— The practice</span></div><ThemeButton theme={theme} onToggle={onToggleTheme} /><button onClick={onLogout} className="logout-link"><LogOut size={16} /> Sign out</button></div></>;
}

function ThemeButton({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) { const Icon = theme === "dark" ? Sun : Moon; return <button className="theme-toggle" onClick={onToggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><Icon size={16} /><span>{theme === "dark" ? "Light mode" : "Dark mode"}</span><i className={theme === "dark" ? "on" : ""} /></button>; }
