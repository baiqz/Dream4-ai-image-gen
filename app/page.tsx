"use client"

import { useState } from "react"
import { Header } from "@/components/header"
import { ImageGenerator } from "@/components/image-generator"
import { ImageGallery } from "@/components/image-gallery"
import { GenerationSidebar } from "@/components/generation-sidebar"
import { ThemeProvider } from "@/components/theme-provider"
import { LanguageProvider, useLanguage } from "@/hooks/use-language"

function HomeContent() {
  const [highlightImageId, setHighlightImageId] = useState<string | undefined>()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const { t } = useLanguage()

  const handleImageGenerated = (imageId: string) => {
    setHighlightImageId(imageId)
    // Clear highlight after 3 seconds
    setTimeout(() => setHighlightImageId(undefined), 3000)

    window.dispatchEvent(new CustomEvent("imageGenerated"))
  }

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-slate-900">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>

      <div className="relative flex flex-col min-h-screen">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />

        <main className="container mx-auto px-6 py-10 flex-grow">
          <div className="max-w-4xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-6xl font-bold text-slate-900 dark:text-white mb-4 text-balance">
                {t("hero.title")}
              </h1>
              <p className="text-lg text-slate-600 dark:text-slate-300 text-pretty">{t("hero.subtitle")}</p>
            </div>

            {/* Image Generator */}
            <ImageGenerator onImageGenerated={handleImageGenerated} />

            {/* Image Gallery */}
            <ImageGallery highlightImageId={highlightImageId} />
          </div>
        </main>
      </div>

      <GenerationSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </div>
  )
}

export default function Home() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <HomeContent />
      </LanguageProvider>
    </ThemeProvider>
  )
}
