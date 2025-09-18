"use client"

import { Moon, Sun, Bell, History } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "@/components/theme-provider"
import { useLanguage } from "@/hooks/use-language"

interface HeaderProps {
  onOpenSidebar?: () => void
}

export function Header({ onOpenSidebar }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const { language, setLanguage, t } = useLanguage()

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  const toggleLanguage = () => {
    setLanguage(language === "en" ? "zh" : "en")
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-50/80 dark:bg-slate-900/80 backdrop-blur-sm border-b-4 border-slate-900 dark:border-cyan-400">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Seedream 4.0</h1>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-cyan-400 transition-colors"
              href="#"
            >
              {t("header.home")}
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-cyan-400 transition-colors"
              href="#"
            >
              {t("header.explore")}
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-cyan-400 transition-colors"
              href="#"
            >
              {t("header.community")}
            </a>
            <a
              className="text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-pink-500 dark:hover:text-cyan-400 transition-colors"
              href="#"
            >
              {t("header.about")}
            </a>
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-4">
            {/* History/Sidebar Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onOpenSidebar}
              className="rounded-full text-slate-900 dark:text-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20 transition-colors"
            >
              <History className="h-5 w-5" />
            </Button>

            {/* Language Toggle */}
            <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-full border-2 border-slate-900 dark:border-cyan-400">
              <button
                onClick={toggleLanguage}
                className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-200 ${
                  language === "en"
                    ? "text-pink-500 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                EN
              </button>
              <button
                onClick={toggleLanguage}
                className={`text-sm font-bold px-3 py-1 rounded-full transition-all duration-200 ${
                  language === "zh"
                    ? "text-pink-500 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm"
                    : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                }`}
              >
                中文
              </button>
            </div>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full text-slate-900 dark:text-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20 transition-colors"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full text-slate-900 dark:text-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20 relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 w-3 h-3 bg-pink-500 dark:bg-cyan-400 rounded-full animate-pulse"></span>
            </Button>

            {/* Profile */}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-4 border-slate-900 dark:border-cyan-400"></div>
          </div>
        </div>
      </div>
    </header>
  )
}
