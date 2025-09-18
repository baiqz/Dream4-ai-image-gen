"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"

type Language = "en" | "zh"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string) => string
}

const translations = {
  en: {
    // Header
    "header.home": "Home",
    "header.explore": "Explore",
    "header.community": "Community",
    "header.about": "About",

    // Hero
    "hero.title": "Unleash Your Imagination",
    "hero.subtitle": "Describe anything you can dream of, and let our AI bring it to life.",

    // Generator
    "generator.placeholder": "A vibrant cartoon world with talking animals...",
    "generator.style": "Style",
    "generator.dimensions": "Dimensions",
    "generator.quality": "Quality",
    "generator.generate": "Generate",
    "generator.generating": "Generating...",

    // Styles
    "style.cinematic": "Cinematic",
    "style.photography": "Photography",
    "style.anime": "Anime",
    "style.cartoon": "Cartoon",
    "style.comic_book": "Comic Book",
    "style.oil_painting": "Oil Painting",

    // Dimensions
    "dimension.square": "Square",
    "dimension.square_hd": "Square HD",
    "dimension.portrait_4_3": "Portrait 3:4",
    "dimension.portrait_16_9": "Portrait 9:16",
    "dimension.landscape_4_3": "Landscape 4:3",
    "dimension.landscape_16_9": "Landscape 9:16",

    // Gallery
    "gallery.title": "Your Creations",
    "gallery.empty.title": "No creations yet",
    "gallery.empty.subtitle": "Generate your first image to see it here!",
    "gallery.download": "Download",
    "gallery.share": "Share",
    "gallery.retry": "Retry",

    // Errors
    "error.generation_failed": "Failed to generate image",
    "error.download_failed": "Failed to download image",
    "error.share_failed": "Failed to share image",
    "error.image_not_found": "Image not found",
  },
  zh: {
    // Header
    "header.home": "首页",
    "header.explore": "探索",
    "header.community": "社区",
    "header.about": "关于",

    // Hero
    "hero.title": "释放你的想象力",
    "hero.subtitle": "描述你能梦想到的任何事物，让我们的AI将其变为现实。",

    // Generator
    "generator.placeholder": "一个充满会说话动物的生动卡通世界...",
    "generator.style": "风格",
    "generator.dimensions": "尺寸",
    "generator.quality": "质量",
    "generator.generate": "生成",
    "generator.generating": "生成中...",

    // Styles
    "style.cinematic": "电影风格",
    "style.photography": "摄影",
    "style.anime": "动漫",
    "style.cartoon": "卡通",
    "style.comic_book": "漫画书",
    "style.oil_painting": "油画",

    // Dimensions
    "dimension.square": "正方形",
    "dimension.square_hd": "高清正方形",
    "dimension.portrait_4_3": "竖版 3:4",
    "dimension.portrait_16_9": "竖版 9:16",
    "dimension.landscape_4_3": "横版 4:3",
    "dimension.landscape_16_9": "横版 9:16",

    // Gallery
    "gallery.title": "你的作品",
    "gallery.empty.title": "还没有作品",
    "gallery.empty.subtitle": "生成你的第一张图片来查看！",
    "gallery.download": "下载",
    "gallery.share": "分享",
    "gallery.retry": "重试",

    // Errors
    "error.generation_failed": "生成图片失败",
    "error.download_failed": "下载图片失败",
    "error.share_failed": "分享图片失败",
    "error.image_not_found": "找不到图片",
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>("en")

  useEffect(() => {
    const savedLanguage = localStorage.getItem("seedream-language") as Language
    if (savedLanguage && (savedLanguage === "en" || savedLanguage === "zh")) {
      setLanguage(savedLanguage)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("seedream-language", lang)
  }

  const t = (key: string): string => {
    return translations[language][key as keyof (typeof translations)[typeof language]] || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }
  return context
}
