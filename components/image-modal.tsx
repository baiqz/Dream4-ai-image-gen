"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { X, Download, Share2, RotateCcw, ZoomIn, ZoomOut } from "lucide-react"
import { useLanguage } from "@/hooks/use-language"
import type { GeneratedImage } from "@/lib/seedream-api"

interface ImageModalProps {
  image: GeneratedImage
  isOpen: boolean
  onClose: () => void
  onDownload: (image: GeneratedImage) => void
  onShare: (image: GeneratedImage) => void
  onRetry: (image: GeneratedImage) => void
}

export function ImageModal({ image, isOpen, onClose, onDownload, onShare, onRetry }: ImageModalProps) {
  const [isZoomed, setIsZoomed] = useState(false)
  const { t } = useLanguage()

  if (!isOpen) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full bg-white dark:bg-slate-800 rounded-xl border-4 border-slate-900 dark:border-cyan-400 shadow-cartoon overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b-2 border-slate-200 dark:border-slate-700">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white truncate">{image.prompt}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-sm text-pink-500 dark:text-cyan-400">{image.style}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-pink-500 dark:text-cyan-400">{image.quality}</span>
              <span className="text-sm text-slate-400">•</span>
              <span className="text-sm text-slate-500 dark:text-slate-400">{image.createdAt.toLocaleDateString()}</span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Image */}
        <div className="relative flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900">
          <img
            src={image.url || "/placeholder.svg"}
            alt={image.prompt}
            className={`max-w-full max-h-[60vh] object-contain rounded-lg transition-transform duration-300 ${
              isZoomed ? "scale-150 cursor-zoom-out" : "cursor-zoom-in"
            }`}
            onClick={() => setIsZoomed(!isZoomed)}
            onError={(e) => {
              console.log("[v0] Modal image failed to load:", image.url)
              const target = e.target as HTMLImageElement
              target.src = "/image-loading-error.jpg"
            }}
            onLoad={() => {
              console.log("[v0] Modal image loaded successfully:", image.url)
            }}
          />

          {/* Zoom Controls */}
          <div className="absolute top-4 right-4 flex gap-2">
            <Button
              size="icon"
              variant="secondary"
              onClick={() => setIsZoomed(!isZoomed)}
              className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm"
            >
              {isZoomed ? <ZoomOut className="w-4 h-4" /> : <ZoomIn className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-4 p-4 border-t-2 border-slate-200 dark:border-slate-700">
          <Button
            onClick={() => onDownload(image)}
            className="flex items-center gap-2 bg-pink-500 dark:bg-cyan-400 text-white dark:text-slate-900 hover:bg-pink-600 dark:hover:bg-cyan-500 border-2 border-slate-900 dark:border-slate-900 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
          >
            <Download className="w-4 h-4" />
            {t("gallery.download")}
          </Button>

          <Button
            onClick={() => onShare(image)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-slate-900 dark:border-cyan-400 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
          >
            <Share2 className="w-4 h-4" />
            {t("gallery.share")}
          </Button>

          <Button
            onClick={() => onRetry(image)}
            className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-600 border-2 border-slate-900 dark:border-cyan-400 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
          >
            <RotateCcw className="w-4 h-4" />
            {t("gallery.retry")}
          </Button>
        </div>
      </div>
    </div>
  )
}
