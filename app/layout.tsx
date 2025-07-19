"use client";
import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react"
import { Toaster } from "sonner";
import { AdminHeader } from "@/components/admin-header";
import { AdminSidebar } from "@/components/admin-sidebar";
import { LangProvider } from "@/lang/LangProvider";
import { usePathname } from "next/navigation";

// Configure Inter font with all required weights
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-inter",
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";

  // Khởi tạo QueryClient trong component để nó không bị chia sẻ giữa các yêu cầu
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnMount: true,
      },
    },
  }));
  
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <title>{process.env.NEXT_PUBLIC_APP_NAME}</title>
        <link rel="icon" href="/logo.png" type="image/png" />
      </head>
      <body className={`${inter.variable} ${inter.className}`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <QueryClientProvider client={queryClient}>
            <LangProvider>
              {isLoginPage ? (
                <main className="min-h-screen bg-background">{children}</main>
              ) : (
                <div className="flex min-h-screen">
                  <AdminSidebar />
                  <div className="flex flex-col flex-1 h-screen overflow-auto">
                    <AdminHeader />
                    <main className="flex-1 p-4 md:p-6 bg-background">{children}</main>
                  </div>  
                </div>
              )}
            </LangProvider>
          </QueryClientProvider>
        </ThemeProvider>
        <Toaster position="top-center" theme="dark" />
      </body>
    </html>
  )
}
