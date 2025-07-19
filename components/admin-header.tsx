"use client"

import { useState, useRef, useEffect } from "react"
import { Settings, LogOut } from "lucide-react"
import { Avatar } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { getMyInfor } from "@/services/api/UserAdminService"
import { logout } from "@/services/api/AuthService"
import { LanguageSelector } from "./language-selector"
import { useLang } from "@/lang/useLang"

export function AdminHeader() {
  const { t } = useLang()
  const { data: myInfor} = useQuery({
    queryKey: ["my-infor"],
    queryFn: getMyInfor,
    refetchOnMount: true,
  });
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false)
  const avatarMenuRef = useRef<HTMLDivElement>(null)
  const avatarButtonRef = useRef<HTMLButtonElement>(null)
  const router = useRouter()

  // Close menus when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Handle avatar menu
      if (
        avatarMenuRef.current &&
        avatarButtonRef.current &&
        !avatarMenuRef.current.contains(event.target as Node) &&
        !avatarButtonRef.current.contains(event.target as Node)
      ) {
        setIsAvatarMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleSettingsClick = () => {
    router.push("/settings")
    setIsAvatarMenuOpen(false)
  }

  const handleLogout = async () => {
    await logout()
    router.push("/login")
  }

  return (
    <div className="sticky top-0 z-40 w-full backdrop-blur-xl border-b border-[#2a2a2a]/50 shadow">
      <div className="flex h-16 items-center justify-end px-6 gap-4">
        <div className="flex items-center gap-4">
          <LanguageSelector />
          {/* Custom Avatar Dropdown */}
          <div className="relative">
            <Button
              ref={avatarButtonRef}
              variant="ghost"
              className={`relative h-9 w-9 rounded-full transition-all duration-200 ${isAvatarMenuOpen ? "ring-2 ring-cyan-500/50 ring-offset-2 ring-offset-[#0e0e0e]" : ""}`}
              onClick={() => setIsAvatarMenuOpen(!isAvatarMenuOpen)}
            >
              <Avatar className="h-9 w-9 border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                {myInfor?.username?.charAt(0).toUpperCase()}
              </Avatar>
            </Button>

            {isAvatarMenuOpen && (
              <div
                ref={avatarMenuRef}
                className="absolute right-0 mt-2 w-64 rounded-xl border border-[#2a2a2a]/50 bg-[#1a1a1a] backdrop-blur-xl p-1 text-white shadow-lg shadow-cyan-500/10 animate-in fade-in-0 zoom-in-95 z-50"
              >
                <div className="flex items-center gap-4 p-3">
                  <Avatar className="h-12 w-12 border-2 border-cyan-500/30 bg-gradient-to-r from-cyan-500 to-purple-500 text-white flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    {myInfor?.username?.charAt(0).toUpperCase()}
                  </Avatar>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none text-slate-200">{myInfor?.username}</p>
                    <p className="text-xs leading-none text-slate-400">{myInfor?.email}</p>
                  </div>
                </div>

                <div className="h-px bg-[#2a2a2a]/50 my-1"></div>

                <div className="p-2">
                  <div className="text-xs font-medium text-slate-400 mb-2">{t("header.accountInformation")}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex flex-col space-y-1 rounded-md bg-[#2a2a2a]/50 p-2">
                      <span className="text-xs font-medium text-slate-300">{t("header.status")}</span>
                      <span className="text-xs text-emerald-400 font-medium">{t("header.active")}</span>
                    </div>
                    <div className="flex flex-col space-y-1 rounded-md bg-[#2a2a2a]/50 p-2">
                      <span className="text-xs font-medium text-slate-300">{t("header.role")}</span>
                      <span className="text-xs font-medium uppercase text-cyan-300">{myInfor?.role}</span>
                    </div>
                  </div>
                </div>

                <div className="h-px bg-[#2a2a2a]/50 my-1"></div>

                <button
                  className="flex w-full items-center px-3 py-2 text-sm rounded-md text-slate-300 hover:bg-[#2a2a2a]/50 hover:text-cyan-200 transition-colors"
                  onClick={handleSettingsClick}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t("header.settings")}</span>
                </button>

                <div className="h-px bg-[#2a2a2a]/50 my-1"></div>

                <button className="flex w-full items-center px-3 py-2 text-sm rounded-md text-red-400 hover:bg-red-500/10 transition-colors" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("header.logOut")}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
