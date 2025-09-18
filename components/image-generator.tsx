"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles, Wand2, AlertCircle, Play, ChevronDown, ChevronUp } from "lucide-react"
import { useImageGeneration } from "@/hooks/use-image-generation"
import { useLanguage } from "@/hooks/use-language"
import type { GenerationRequest, GeneratedImage, GeneratedVideo } from "@/lib/seedream-api"
import { SeedreamAPI } from "@/lib/seedream-api"
import { ImageModal } from "@/components/image-modal"
import { VideoModal } from "@/components/video-modal"

const STYLES = ["Cinematic", "Photography", "Anime", "Cartoon", "Comic Book", "Oil Painting"]

const DIMENSIONS = [
  { label: "Square", value: "square" },
  { label: "Square HD", value: "square_hd" },
  { label: "Portrait 3:4", value: "portrait_4_3" },
  { label: "Portrait 9:16", value: "portrait_16_9" },
  { label: "Landscape 4:3", value: "landscape_4_3" },
  { label: "Landscape 9:16", value: "landscape_16_9" },
]

const QUALITIES = ["1K", "2K", "4K"]

interface ImageGeneratorProps {
  onImageGenerated?: (imageId: string) => void
}

export function ImageGenerator({ onImageGenerated }: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [selectedStyle, setSelectedStyle] = useState("Cartoon")
  const [selectedDimension, setSelectedDimension] = useState("square")
  const [selectedQuality, setSelectedQuality] = useState("2K")
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [lastRequest, setLastRequest] = useState<GenerationRequest | null>(null)
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isPromptExpanded, setIsPromptExpanded] = useState(false)

  const {
    isGenerating,
    isGeneratingVideo,
    error,
    generateImage,
    generateVideo,
    downloadVideo,
    shareVideo,
    clearError,
  } = useImageGeneration()
  const { t } = useLanguage()

  const handleGenerate = async () => {
    if (!prompt.trim()) return

    clearError()
    setCurrentImage(null)

    const request: GenerationRequest = {
      prompt: prompt.trim(),
      style: selectedStyle,
      dimension: selectedDimension,
      quality: selectedQuality,
    }

    setLastRequest(request)

    try {
      const generatedImage = await generateImage(request)
      setCurrentImage(generatedImage)
      onImageGenerated?.(generatedImage.id)
    } catch (err) {
      console.error("Generation failed:", err)
    }
  }

  const handleRetry = async () => {
    if (!lastRequest) return

    clearError()
    setCurrentImage(null)

    try {
      const generatedImage = await generateImage(lastRequest)
      setCurrentImage(generatedImage)
      onImageGenerated?.(generatedImage.id)
    } catch (err) {
      console.error("Retry failed:", err)
    }
  }

  const handleDownload = async () => {
    if (!currentImage) return

    try {
      const api = SeedreamAPI.getInstance()
      await api.downloadImage(currentImage.id)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const handleShare = async () => {
    if (!currentImage) return

    try {
      const api = SeedreamAPI.getInstance()
      await api.shareImage(currentImage.id)
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleGenerate()
    }
  }

  const getStyleLabel = (style: string) => {
    const styleKey = `style.${style.toLowerCase().replace(" ", "_")}`
    return t(styleKey)
  }

  const getDimensionLabel = (dimension: { label: string; value: string }) => {
    const dimensionKey = `dimension.${dimension.value}`
    return t(dimensionKey)
  }

  const handleImageClick = () => {
    if (currentImage) {
      setIsModalOpen(true)
    }
  }

  const handleModalDownload = async (image: GeneratedImage) => {
    try {
      const api = SeedreamAPI.getInstance()
      await api.downloadImage(image.id)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const handleModalShare = async (image: GeneratedImage) => {
    try {
      const api = SeedreamAPI.getInstance()
      await api.shareImage(image.id)
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleModalRetry = async (image: GeneratedImage) => {
    if (!image) return

    clearError()
    setCurrentImage(null)

    const request: GenerationRequest = {
      prompt: image.prompt,
      style: image.style,
      dimension: image.dimension,
      quality: image.quality,
    }

    setLastRequest(request)

    try {
      const generatedImage = await generateImage(request)
      setCurrentImage(generatedImage)
      onImageGenerated?.(generatedImage.id)
      setIsModalOpen(false) // Close modal after successful retry
    } catch (err) {
      console.error("Retry failed:", err)
    }
  }

  const handleGenerateVideo = async () => {
    if (!currentImage) return

    clearError()
    setCurrentVideo(null)

    try {
      const generatedVideo = await generateVideo(currentImage)
      setCurrentVideo(generatedVideo)
    } catch (err) {
      console.error("Video generation failed:", err)
    }
  }

  const handleVideoClick = () => {
    if (currentVideo) {
      setIsVideoModalOpen(true)
    }
  }

  const handleVideoModalDownload = async (video: GeneratedVideo) => {
    try {
      await downloadVideo(video.id)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const handleVideoModalShare = async (video: GeneratedVideo) => {
    try {
      await shareVideo(video.id)
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleVideoModalRetry = async (video: GeneratedVideo) => {
    if (!video) return

    clearError()
    setCurrentVideo(null)

    try {
      const originalImage = { ...video, id: video.imageId, url: video.imageUrl }
      const newVideo = await generateVideo(originalImage as GeneratedImage)
      setCurrentVideo(newVideo)
      setIsVideoModalOpen(false)
    } catch (err) {
      console.error("Video retry failed:", err)
    }
  }

  return (
    <>
      <div className="space-y-8 mb-16 floating-particles">
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <p className="text-red-700 dark:text-red-300 font-medium">{error}</p>
            <Button variant="ghost" size="sm" onClick={clearError} className="ml-auto text-red-500 hover:text-red-700">
              ×
            </Button>
          </div>
        )}

        {(isGenerating || isGeneratingVideo) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border-4 border-slate-900 dark:border-cyan-400 shadow-cartoon p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">
              {isGenerating ? t("generator.generating") : "Generating Video..."}
            </h3>

            <div className="aspect-square max-w-md mx-auto bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden relative">
              <div className="w-full h-full flex items-center justify-center">
                <div className="text-center">
                  <div
                    className={`animate-spin rounded-full h-16 w-16 border-b-4 mx-auto mb-4 ${
                      isGenerating ? "border-pink-500 dark:border-cyan-400" : "border-purple-500 dark:border-cyan-400"
                    }`}
                  ></div>
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {isGenerating ? "Creating your masterpiece..." : "Creating your video..."}
                  </p>
                  <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    {isGenerating ? "This may take a few moments" : "This may take a few minutes"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="relative">
          <div className="relative w-full h-6 sm:max-w-2xl sm:h-auto mx-auto px-1 sm:px-0">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={t("generator.placeholder")}
              disabled={isGenerating || isGeneratingVideo}
              rows={isPromptExpanded ? 6 : 1}
              className={`w-full text-base sm:text-lg font-medium bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-500 dark:placeholder:text-slate-400 border-4 border-slate-900 dark:border-cyan-400 rounded-xl shadow-cartoon focus:shadow-none focus:ring-4 focus:ring-pink-500 dark:focus:ring-cyan-400 transition-all duration-200 disabled:opacity-50 pr-16 sm:pr-20 py-1 sm:py-4 px-2 sm:px-4 resize-none text-center sm:text-left overflow-hidden ${
                isPromptExpanded ? "min-h-[150px] sm:min-h-[150px]" : "min-h-[24px] sm:min-h-[100px]"
              }`}
            />

            <button
              onClick={() => setIsPromptExpanded(!isPromptExpanded)}
              className="absolute right-10 sm:right-16 top-1 sm:top-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isPromptExpanded ? "收起提示词" : "展开提示词"}
            >
              {isPromptExpanded ? (
                <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" />
              ) : (
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-slate-500 dark:text-slate-400" />
              )}
            </button>

            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating || isGeneratingVideo}
              className="absolute right-2 sm:right-4 top-1 sm:top-4 p-1.5 sm:p-2 rounded-lg hover:bg-pink-100 dark:hover:bg-cyan-400/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-pink-500 dark:text-cyan-400 animate-pulse" />
            </button>
          </div>
        </div>

        {currentImage && !isGenerating && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border-4 border-slate-900 dark:border-cyan-400 shadow-cartoon p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">Generated Image</h3>

            <div className="max-w-md mx-auto">
              <img
                src={currentImage.url || "/placeholder.svg"}
                alt={currentImage.prompt}
                className="w-full rounded-lg border-2 border-slate-300 dark:border-slate-500 cursor-pointer hover:opacity-90 transition-opacity"
                onClick={handleImageClick}
              />

              <div className="mt-4 flex gap-2">
                <Button
                  onClick={handleDownload}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900"
                >
                  Download
                </Button>
                <Button
                  onClick={handleShare}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900"
                >
                  Share
                </Button>
                <Button
                  onClick={handleGenerateVideo}
                  disabled={isGeneratingVideo}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900 disabled:opacity-50"
                >
                  {isGeneratingVideo ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Play className="w-4 h-4 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {currentVideo && !isGeneratingVideo && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border-4 border-slate-900 dark:border-cyan-400 shadow-cartoon p-6">
            <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">Generated Video</h3>

            <div className="w-full max-w-md mx-auto">
              <div
                className="relative cursor-pointer hover:opacity-90 transition-opacity w-full"
                onClick={handleVideoClick}
              >
                <img
                  src={currentVideo.imageUrl || "/placeholder.svg"}
                  alt={currentVideo.prompt}
                  className="w-full h-auto rounded-lg border-2 border-slate-300 dark:border-slate-500 object-contain"
                />
                <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                  <Play className="w-8 h-8 sm:w-12 sm:h-12 text-white" />
                </div>
              </div>

              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => handleVideoModalDownload(currentVideo)}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900 text-sm sm:text-base"
                >
                  Download
                </Button>
                <Button
                  onClick={() => handleVideoModalShare(currentVideo)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900 text-sm sm:text-base"
                >
                  Share
                </Button>
                <Button
                  onClick={() => handleVideoModalRetry(currentVideo)}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-4 rounded-lg border-2 border-slate-900 dark:border-slate-900 disabled:opacity-50 text-sm sm:text-base"
                >
                  Retry
                </Button>
              </div>
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">{t("generator.style")}</h3>
          <div className="flex flex-wrap gap-3">
            {STYLES.map((style) => (
              <Button
                key={style}
                variant={selectedStyle === style ? "default" : "outline"}
                onClick={() => setSelectedStyle(style)}
                disabled={isGenerating || isGeneratingVideo}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 ${
                  selectedStyle === style
                    ? "bg-pink-500 dark:bg-cyan-400 text-white dark:text-slate-900 border-slate-900 dark:border-slate-900 shadow-cartoon"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900 dark:border-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20"
                }`}
              >
                {getStyleLabel(style)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">{t("generator.dimensions")}</h3>
          <div className="flex flex-wrap gap-3">
            {DIMENSIONS.map((dimension) => (
              <Button
                key={dimension.value}
                variant={selectedDimension === dimension.value ? "default" : "outline"}
                onClick={() => setSelectedDimension(dimension.value)}
                disabled={isGenerating || isGeneratingVideo}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 ${
                  selectedDimension === dimension.value
                    ? "bg-pink-500 dark:bg-cyan-400 text-white dark:text-slate-900 border-slate-900 dark:border-slate-900 shadow-cartoon"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900 dark:border-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20"
                }`}
              >
                {getDimensionLabel(dimension)}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-cyan-400">{t("generator.quality")}</h3>
          <div className="flex flex-wrap gap-3">
            {QUALITIES.map((quality) => (
              <Button
                key={quality}
                variant={selectedQuality === quality ? "default" : "outline"}
                onClick={() => setSelectedQuality(quality)}
                disabled={isGenerating || isGeneratingVideo}
                className={`px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all duration-200 transform hover:-translate-y-1 disabled:transform-none disabled:opacity-50 ${
                  selectedQuality === quality
                    ? "bg-pink-500 dark:bg-cyan-400 text-white dark:text-slate-900 border-slate-900 dark:border-slate-900 shadow-cartoon"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white border-slate-900 dark:border-cyan-400 hover:bg-pink-100 dark:hover:bg-cyan-400/20"
                }`}
              >
                {quality}
              </Button>
            ))}
          </div>
        </div>

        <div className="text-center pt-6">
          <Button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating || isGeneratingVideo}
            className="w-full md:w-auto group bg-gradient-to-r from-pink-500 to-purple-600 dark:from-cyan-400 dark:to-blue-500 text-white dark:text-slate-900 font-bold text-xl px-12 py-4 rounded-xl border-4 border-slate-900 dark:border-slate-900 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-slate-900 mr-2"></div>
                {t("generator.generating")}
              </>
            ) : isGeneratingVideo ? (
              <>
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white dark:border-slate-900 mr-2"></div>
                Generating Video...
              </>
            ) : (
              <>
                <Wand2 className="w-6 h-6 mr-2" />
                {t("generator.generate")}
              </>
            )}
          </Button>
        </div>
      </div>

      {currentImage && (
        <ImageModal
          image={currentImage}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onDownload={handleModalDownload}
          onShare={handleModalShare}
          onRetry={handleModalRetry}
        />
      )}

      {currentVideo && (
        <VideoModal
          video={currentVideo}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
          onDownload={handleVideoModalDownload}
          onShare={handleVideoModalShare}
          onRetry={handleVideoModalRetry}
        />
      )}
    </>
  )
}
