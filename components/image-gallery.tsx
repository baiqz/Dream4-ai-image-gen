"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download, Share2, RotateCcw, ChevronLeft, ChevronRight, Wand2, Eye, Video } from "lucide-react"
import { useImageGeneration } from "@/hooks/use-image-generation"
import { useLanguage } from "@/hooks/use-language"
import { ImageModal } from "@/components/image-modal"
import type { GeneratedImage } from "@/lib/seedream-api"

interface ImageGalleryProps {
  highlightImageId?: string
}

export function ImageGallery({ highlightImageId }: ImageGalleryProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { generatedImages, downloadImage, shareImage, retryGeneration, generateVideo, isGeneratingVideo } =
    useImageGeneration()
  const { t } = useLanguage()

  const imagesPerPage = 6
  const totalPages = Math.ceil(generatedImages.length / imagesPerPage)

  // Reset to first page when new images are added
  useEffect(() => {
    if (highlightImageId && generatedImages.length > 0) {
      setCurrentPage(1)
    }
  }, [highlightImageId, generatedImages.length])

  const handleDownload = async (image: GeneratedImage) => {
    try {
      await downloadImage(image.id)
    } catch (error) {
      console.error("Download failed:", error)
    }
  }

  const handleShare = async (image: GeneratedImage) => {
    try {
      await shareImage(image.id)
    } catch (error) {
      console.error("Share failed:", error)
    }
  }

  const handleRetry = async (image: GeneratedImage) => {
    try {
      await retryGeneration(image)
    } catch (error) {
      console.error("Retry failed:", error)
    }
  }

  const handleGenerateVideo = async (image: GeneratedImage) => {
    try {
      await generateVideo(image)
    } catch (error) {
      console.error("Video generation failed:", error)
    }
  }

  const handleViewImage = (image: GeneratedImage) => {
    setSelectedImage(image)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedImage(null)
  }

  const currentImages = generatedImages.slice((currentPage - 1) * imagesPerPage, currentPage * imagesPerPage)

  if (generatedImages.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
          <Wand2 className="w-12 h-12 text-slate-400" />
        </div>
        <h3 className="text-xl font-bold text-center text-slate-900 dark:text-white mb-2">
          {t("gallery.empty.title")}
        </h3>
        <p className="text-slate-600 dark:text-slate-300">{t("gallery.empty.subtitle")}</p>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-8">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white">{t("gallery.title")}</h2>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentImages.map((image) => (
            <div
              key={image.id}
              className={`group relative aspect-square overflow-hidden rounded-xl border-4 shadow-cartoon hover:shadow-none transition-all duration-300 cursor-pointer ${
                highlightImageId === image.id
                  ? "border-pink-500 dark:border-cyan-400 ring-4 ring-pink-200 dark:ring-cyan-400/30"
                  : "border-slate-900 dark:border-cyan-400"
              }`}
              onClick={() => handleViewImage(image)}
            >
              {/* Image */}
              <img
                src={image.url || "/placeholder.svg"}
                alt={image.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {/* View Button - Center */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <Button
                    size="icon"
                    className="p-4 rounded-full bg-white/90 text-slate-900 backdrop-blur-sm hover:bg-white transition-colors shadow-lg"
                    title="View Full Size"
                  >
                    <Eye className="w-6 h-6" />
                  </Button>
                </div>

                {/* Action Buttons - Bottom */}
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDownload(image)
                    }}
                    className="p-2 rounded-full bg-cyan-400/80 text-slate-900 backdrop-blur-sm hover:bg-cyan-400 transition-colors"
                    title={t("gallery.download")}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleShare(image)
                    }}
                    className="p-2 rounded-full bg-cyan-400/80 text-slate-900 backdrop-blur-sm hover:bg-cyan-400 transition-colors"
                    title={t("gallery.share")}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRetry(image)
                    }}
                    className="p-2 rounded-full bg-cyan-400/80 text-slate-900 backdrop-blur-sm hover:bg-cyan-400 transition-colors"
                    title={t("gallery.retry")}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleGenerateVideo(image)
                    }}
                    disabled={isGeneratingVideo}
                    className="p-2 rounded-full bg-purple-500/80 text-white backdrop-blur-sm hover:bg-purple-500 transition-colors disabled:opacity-50"
                    title="Generate Video"
                  >
                    <Video className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Image Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-sm font-medium truncate mb-8">{image.prompt}</p>
                <div className="flex items-center gap-2">
                  <span className="text-cyan-400 text-xs">{image.style}</span>
                  <span className="text-gray-300 text-xs">•</span>
                  <span className="text-cyan-400 text-xs">{image.quality}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center mt-8">
            <nav className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-cyan-400/20 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number
                if (totalPages <= 5) {
                  page = i + 1
                } else if (currentPage <= 3) {
                  page = i + 1
                } else if (currentPage >= totalPages - 2) {
                  page = totalPages - 4 + i
                } else {
                  page = currentPage - 2 + i
                }

                return (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "ghost"}
                    size="icon"
                    onClick={() => setCurrentPage(page)}
                    className={`h-10 w-10 rounded-full text-sm font-bold ${
                      currentPage === page
                        ? "bg-pink-500 dark:bg-cyan-400 text-white dark:text-slate-900 border-2 border-slate-900 dark:border-slate-900"
                        : "text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-cyan-400/20"
                    }`}
                  >
                    {page}
                  </Button>
                )
              })}

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="h-10 w-10 rounded-full text-slate-600 dark:text-slate-300 hover:bg-pink-100 dark:hover:bg-cyan-400/20 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </nav>
          </div>
        )}
      </div>

      {selectedImage && (
        <ImageModal
          image={selectedImage}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onDownload={handleDownload}
          onShare={handleShare}
          onRetry={handleRetry}
        />
      )}
    </>
  )
}
