"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Play, X, ImageIcon, Video } from "lucide-react"
import type { GeneratedImage, GeneratedVideo } from "@/lib/seedream-api"
import { useImageGeneration } from "@/hooks/use-image-generation"
import { VideoModal } from "@/components/video-modal"
import { ImageModal } from "@/components/image-modal"
import { SeedreamAPI } from "@/lib/seedream-api"

interface GenerationSidebarProps {
  isOpen: boolean
  onClose: () => void
}

export function GenerationSidebar({ isOpen, onClose }: GenerationSidebarProps) {
  const [images, setImages] = useState<GeneratedImage[]>([])
  const [videos, setVideos] = useState<GeneratedVideo[]>([])
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null)
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [currentImageForModal, setCurrentImageForModal] = useState<GeneratedImage | null>(null)
  const [isImageModalOpen, setIsImageModalOpen] = useState(false)

  const { isGeneratingVideo, generateVideo, downloadVideo, shareVideo, clearError } = useImageGeneration()

  useEffect(() => {
    const loadHistory = () => {
      try {
        const savedImages = localStorage.getItem("generated-images")
        const savedVideos = localStorage.getItem("generated-videos")

        if (savedImages) {
          setImages(JSON.parse(savedImages))
        }

        if (savedVideos) {
          setVideos(JSON.parse(savedVideos))
        }
      } catch (error) {
        console.error("Failed to load history:", error)
      }
    }

    loadHistory()

    const handleStorageChange = () => loadHistory()
    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("imageGenerated", handleStorageChange)
    window.addEventListener("videoGenerated", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("imageGenerated", handleStorageChange)
      window.removeEventListener("videoGenerated", handleStorageChange)
    }
  }, [])

  const handleGenerateVideo = async (image: GeneratedImage) => {
    setSelectedImage(image)
    clearError()
    setCurrentVideo(null)

    try {
      const generatedVideo = await generateVideo(image)
      setCurrentVideo(generatedVideo)

      const updatedVideos = [...videos, generatedVideo]
      setVideos(updatedVideos)
      localStorage.setItem("generated-videos", JSON.stringify(updatedVideos))

      window.dispatchEvent(new CustomEvent("videoGenerated"))
    } catch (err) {
      console.error("Video generation failed:", err)
    }
  }

  const handleVideoClick = (video: GeneratedVideo) => {
    setCurrentVideo(video)
    setIsVideoModalOpen(true)
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

  const handleImageClick = (image: GeneratedImage) => {
    setCurrentImageForModal(image)
    setIsImageModalOpen(true)
  }

  const handleImageModalDownload = async (image: GeneratedImage) => {
    try {
      const api = SeedreamAPI.getInstance()
      await api.downloadImage(image.id)
    } catch (err) {
      console.error("Download failed:", err)
    }
  }

  const handleImageModalShare = async (image: GeneratedImage) => {
    try {
      const api = SeedreamAPI.getInstance()
      await api.shareImage(image.id)
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleImageModalRetry = async (image: GeneratedImage) => {
    console.log("Retry generation for:", image)
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-slate-800 border-l-4 border-slate-900 dark:border-cyan-400 shadow-2xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-2 border-slate-200 dark:border-slate-700">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-cyan-400">Generation History</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 p-6">
          {/* Images Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <ImageIcon className="w-5 h-5 text-pink-500 dark:text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Images</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">({images.length})</span>
            </div>

            {images.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No images generated yet</p>
            ) : (
              <div className="space-y-4">
                {images
                  .slice()
                  .reverse()
                  .map((image) => (
                    <div
                      key={image.id}
                      className="group relative bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-600 hover:border-pink-500 dark:hover:border-cyan-400 transition-all duration-200"
                    >
                      <div className="flex gap-3">
                        <img
                          src={image.url || "/placeholder.svg"}
                          alt={image.prompt}
                          className="w-16 h-16 object-cover rounded-lg border-2 border-slate-300 dark:border-slate-500 cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => handleImageClick(image)}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
                            {image.prompt}
                          </p>
                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <div>Style: {image.style}</div>
                            <div>Quality: {image.quality}</div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => handleGenerateVideo(image)}
                          disabled={isGeneratingVideo && selectedImage?.id === image.id}
                          className="flex-1 bg-purple-500 hover:bg-purple-600 text-white text-xs py-1 px-2 rounded border-2 border-slate-900 dark:border-slate-900"
                        >
                          {isGeneratingVideo && selectedImage?.id === image.id ? (
                            <>
                              <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                              Generating...
                            </>
                          ) : (
                            <>
                              <Play className="w-3 h-3 mr-1" />
                              Generate Video
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Videos Section */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Video className="w-5 h-5 text-purple-500 dark:text-cyan-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generated Videos</h3>
              <span className="text-sm text-slate-500 dark:text-slate-400">({videos.length})</span>
            </div>

            {videos.length === 0 ? (
              <p className="text-slate-500 dark:text-slate-400 text-center py-8">No videos generated yet</p>
            ) : (
              <div className="space-y-4">
                {videos
                  .slice()
                  .reverse()
                  .map((video) => (
                    <div
                      key={video.id}
                      className="group relative bg-slate-50 dark:bg-slate-700 rounded-lg p-4 border-2 border-slate-200 dark:border-slate-600 hover:border-purple-500 dark:hover:border-cyan-400 transition-all duration-200 cursor-pointer"
                      onClick={() => handleVideoClick(video)}
                    >
                      <div className="flex gap-3">
                        <div className="relative w-16 h-16">
                          <img
                            src={video.imageUrl || "/placeholder.svg"}
                            alt={video.prompt}
                            className="w-full h-full object-cover rounded-lg border-2 border-slate-300 dark:border-slate-500"
                          />
                          <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                            <Play className="w-6 h-6 text-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate mb-1">
                            {video.prompt}
                          </p>
                          <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1">
                            <div>Style: {video.style}</div>
                            <div>Quality: {video.quality}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {currentImageForModal && (
        <ImageModal
          image={currentImageForModal}
          isOpen={isImageModalOpen}
          onClose={() => setIsImageModalOpen(false)}
          onDownload={handleImageModalDownload}
          onShare={handleImageModalShare}
          onRetry={handleImageModalRetry}
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
