"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Eye, EyeOff, Lock, User, BarChart2, Users, Shield, Layers } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { AuthService } from "@/services/api"
import { useLang } from "@/lang/useLang"

export default function LoginPage() {
  const { t } = useLang()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!username || !password) {
      setError(t("login.errors.enterBothFields"))
      return
    }

    try {
      setIsLoading(true)
      const res = await AuthService.login({username, password})
      if (res.status === 200) {
        router.push("/dashboard")
      } else {
        setError(t("login.errors.invalidCredentials"))
      }
    } catch (err: any) {
      if (err.status === 401) {
        setError(t("login.errors.invalidCredentials"))
      } else {
        setError(t("login.errors.generalError"))
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
        <Card className="w-full max-w-md bg-card/90 backdrop-blur-sm border-border shadow-xl">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <img src="https://static-www.bittworld.com/main-static/img/logo.f3383a1.svg" alt="Logo" className="h-12 w-auto bg-black p-1 rounded" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">{t("login.signIn")}</h2>
          <p className="text-sm text-muted-foreground">{t("login.accessDashboard")}</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && <div className="bg-red-900/90 text-red-300 text-sm p-3 rounded-md border border-red-900/80 shadow">{error}</div>}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-foreground">{t("login.username")}</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                      <Input
                      id="username"
                      type="text"
                      placeholder={t("login.usernamePlaceholder")}
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
                      required
                    />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground">{t("login.password")}</Label>
                  {/* <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
                    {t("login.forgotPassword")}
                  </Link> */}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                                      <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("login.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:border-ring"
                      required
                    />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-[#00e09e] hover:bg-[#00e09e]/90 text-black font-medium" 
              disabled={isLoading}
            >
              {isLoading ? t("login.signingIn") : t("login.signInButton")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
