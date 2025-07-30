"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  BarChart3,
  FileText,
  Home,
  LayoutDashboard,
  Menu,
  Settings,
  Users,
  X,
  ChevronDown,
  ChevronRight,
  Tag,
  ChevronLeft,
  Wallet,
  Receipt,
  Trophy,
  Users2,
  Network,
  UserCheck,
  DollarSign,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { getMyInfor } from "@/services/api/UserAdminService"
import { useQuery } from "@tanstack/react-query"
import { getSetting } from "@/services/api/SettingService"
import { useLang } from "@/lang/useLang"

interface NavItem {
  title: string
  href: string
  icon: React.ElementType
  color: string
  submenu?: { title: string; href: string }[]
}

export function AdminSidebar() {
  const { t } = useLang()
  
  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });

  const navItems: NavItem[] = [
    {
      title: t("navigation.dashboard"),
      href: "/dashboard",
      icon: LayoutDashboard,
      color: "text-blue-400 hover:text-blue-300",
    },
    // ...(myInfor?.role !== "partner" ? [{
    //   title: t("navigation.users"),
    //   href: "/users",
    //   icon: Users,
    //   color: "text-purple-400 hover:text-purple-300",
    // }] : []),
    // {
    //   title: "Swap Investors",
    //   href: "/swap-investors",
    //   icon: DollarSign,
    //   color: "text-green-400 hover:text-green-300",
    // },
    {
      title: t("navigation.listWallets"),
      href: "/list-wallets",
      icon: Wallet,
      color: "text-emerald-400 hover:text-emerald-300",
    },
    // {
    //   title: t("navigation.categoriesToken"),
    //   href: "/categories-token",
    //   icon: Tag,
    //   color: "text-amber-400 hover:text-amber-300",
    // },
    {
      title: t("navigation.orders"),
      href: "/orders",
      icon: Receipt,
      color: "text-pink-400 hover:text-pink-300",
    },
    // {
    //   title: t("navigation.normalAffiliate"),
    //   href: "/normal-affiliate",
    //   icon: UserCheck,
    //   color: "text-orange-400 hover:text-orange-300",
    // },
    {
      title: t("navigation.referral"),
      href: "/bg-affiliate",
      icon: Network,
      color: "text-cyan-400 hover:text-cyan-300",
    },
    {
      title: t("navigation.analytics"),
      href: "/analytics",
      icon: BarChart3,
      color: "text-purple-400 hover:text-purple-300",
    },
    {
      title: t("navigation.settings"),
      href: "/settings",
      icon: Settings,
      color: "text-slate-400 hover:text-slate-300",
    },
  ]
  const { data: setting, isLoading } = useQuery({
    queryKey: ["setting"],
    queryFn: getSetting,
  });
  const [isOpen, setIsOpen] = useState(false)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null)
  const pathname = usePathname()

  const toggleSubmenu = (title: string) => {
    setOpenSubmenu(openSubmenu === title ? null : title)
  }

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed)
  }

  const isActive = (item: NavItem) => {
    if (pathname === item.href) return true
    if (item.submenu && item.submenu.some((subitem) => pathname === subitem.href)) return true
    return false
  }

  useEffect(() => {
    navItems.forEach((item) => {
      if (item.submenu && item.submenu.some((subitem) => pathname === subitem.href)) {
        setOpenSubmenu(item.title)
      }
    })
  }, [pathname])

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        className="fixed left-4 top-3 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </Button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 backdrop-blur-xl dark:border-r border-border transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          isCollapsed ? "w-20" : "w-64",
        )}
      >
        <div className="flex-shrink-0">
          <div className="flex items-center gap-3 h-16 px-6 border-b border-black dark:border-border bg-[#0e0e0e]">
            <img src="https://static-www.bittworld.com/main-static/img/logo.f3383a1.svg" className="w-32 rounded-lg" alt="logo" />
          </div>
        </div>
        
        <nav className="flex-1 mt-6 flex flex-col gap-1 px-2 overflow-y-auto">
          {navItems.map(item => (
            <Link
              key={item.title}
              href={item.href}
              className={cn(
                  "cursor-pointer flex items-center gap-3 px-4 py-2.5 rounded-lg font-medium transition-all group text-sm",
                  isActive(item)
                    ? "bg-[#00e09e]/10 text-[#00e09e] border border-[#00e09e] shadow-lg shadow-[#00e09e]/20"
                    : "text-black dark:text-white hover:bg-muted hover:text-foreground",
                  isCollapsed && "justify-center px-0"
                )}
            >
              <item.icon className={cn(
                "h-5 w-5 mr-2 transition-colors",
                isActive(item) ? "text-[#00e09e]" : item.color
              )} />
              {!isCollapsed && <span>{item.title}</span>}
            </Link>
          ))}
        </nav>
        
        <div className="flex-shrink-0 p-4 border-t border-border">
              <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold text-lg shadow-lg shadow-cyan-500/25">
                {myInfor?.username?.charAt(0).toUpperCase()}
              </div>
              {!isCollapsed && (
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-black dark:text-white">{myInfor?.username}</span>
                  <span className="text-xs text-black dark:text-slate-300 uppercase">{t("navigation.admin")}</span>
                </div>
              )}
            </div>
        </div>
      </aside>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={() => setIsOpen(false)} />
      )}
    </>
  )
}
