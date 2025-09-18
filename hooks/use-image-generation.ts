"use client"

import { useState, useCallback, useEffect } from "react"
import { SeedreamAPI, type GeneratedImage, type GeneratedVideo, type GenerationRequest } from "@/lib/seedream-api"

const STORAGE_KEY = "generated-images"
const VIDEO_STORAGE_KEY = "generated-videos"

export function useImageGeneration() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([])
  const [error, setError] = useState<string | null>(null)

  const api = SeedreamAPI.getInstance()

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const parsedImages = JSON.parse(stored)
        setGeneratedImages(parsedImages)
      }

      const storedVideos = localStorage.getItem(VIDEO_STORAGE_KEY)
      if (storedVideos) {
        const parsedVideos = JSON.parse(storedVideos)
        setGeneratedVideos(parsedVideos)
      }
    } catch (err) {
      console.error("Failed to load stored data:", err)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(generatedImages))
    } catch (err) {
      console.error("Failed to save images to storage:", err)
    }
  }, [generatedImages])

  useEffect(() => {
    try {
      localStorage.setItem(VIDEO_STORAGE_KEY, JSON.stringify(generatedVideos))
    } catch (err) {
      console.error("Failed to save videos to storage:", err)
    }
  }, [generatedVideos])

  const generateImage = useCallback(
    async (request: GenerationRequest) => {
      setIsGenerating(true)
      setError(null)

      try {
        const generatedImage = await api.generateImage(request)
        const imageWithTimestamp = {
          ...generatedImage,
          createdAt: new Date().toISOString(),
        }
        setGeneratedImages((prev) => [imageWithTimestamp, ...prev])

        window.dispatchEvent(new CustomEvent("imageGenerated"))

        return imageWithTimestamp
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate image"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsGenerating(false)
      }
    },
    [api],
  )

  const downloadImage = useCallback(
    async (imageId: string) => {
      try {
        await api.downloadImage(imageId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to download image"
        setError(errorMessage)
      }
    },
    [api],
  )

  const shareImage = useCallback(
    async (imageId: string) => {
      try {
        await api.shareImage(imageId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to share image"
        setError(errorMessage)
      }
    },
    [api],
  )

  const retryGeneration = useCallback(
    async (originalImage: GeneratedImage) => {
      const request: GenerationRequest = {
        prompt: originalImage.prompt,
        style: originalImage.style,
        dimension: originalImage.dimension,
        quality: originalImage.quality,
      }
      return generateImage(request)
    },
    [generateImage],
  )

  const generateVideo = useCallback(
    async (image: GeneratedImage) => {
      setIsGeneratingVideo(true)
      setError(null)

      try {
        const generatedVideo = await api.generateVideo(image)
        const videoWithTimestamp = {
          ...generatedVideo,
          createdAt: new Date().toISOString(),
        }
        setGeneratedVideos((prev) => [videoWithTimestamp, ...prev])

        window.dispatchEvent(new CustomEvent("videoGenerated"))

        return videoWithTimestamp
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to generate video"
        setError(errorMessage)
        throw new Error(errorMessage)
      } finally {
        setIsGeneratingVideo(false)
      }
    },
    [api],
  )

  const downloadVideo = useCallback(
    async (videoId: string) => {
      try {
        await api.downloadVideo(videoId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to download video"
        setError(errorMessage)
      }
    },
    [api],
  )

  const shareVideo = useCallback(
    async (videoId: string) => {
      try {
        await api.shareVideo(videoId)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to share video"
        setError(errorMessage)
      }
    },
    [api],
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    isGenerating,
    isGeneratingVideo,
    generatedImages,
    generatedVideos,
    error,
    generateImage,
    generateVideo,
    downloadVideo,
    shareVideo,
    downloadImage,
    shareImage,
    retryGeneration,
    clearError,
  }
}
