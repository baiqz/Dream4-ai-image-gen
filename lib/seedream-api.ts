// Seedream 4.0 API Integration
export interface GenerationRequest {
  prompt: string
  style: string
  dimension: string
  quality: string
}

export interface GeneratedImage {
  id: string
  url: string
  prompt: string
  style: string
  dimension: string
  quality: string
  createdAt: Date
}

export interface GeneratedVideo {
  id: string
  url: string
  imageId: string
  imageUrl: string
  prompt: string
  style: string
  dimension: string
  quality: string
  createdAt: Date
}

interface BackendResponse {
  imageUrl: string
}

interface VideoBackendResponse {
  videoUrl: string
}

// Mock API for demonstration - replace with actual Seedream 4.0 API
export class SeedreamAPI {
  private static instance: SeedreamAPI
  private generatedImages: GeneratedImage[] = []
  private generatedVideos: GeneratedVideo[] = []

  static getInstance(): SeedreamAPI {
    if (!SeedreamAPI.instance) {
      SeedreamAPI.instance = new SeedreamAPI()
    }
    return SeedreamAPI.instance
  }

  async generateImage(request: GenerationRequest): Promise<GeneratedImage> {
    try {
      console.log("[v0] Sending request to webhook:", request)

      const webhookResponse = await fetch("https://qb123.app.n8n.cloud/webhook-test/dream2image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        body: JSON.stringify({
          prompt: request.prompt,
          style: request.style,
          dimension: request.dimension,
          quality: request.quality,
          timestamp: new Date().toISOString(),
        }),
      })

      console.log("[v0] Response status:", webhookResponse.status)
      console.log("[v0] Response headers:", Object.fromEntries(webhookResponse.headers.entries()))

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error("[v0] Webhook error response:", errorText)
        throw new Error(`Webhook request failed: ${webhookResponse.status} - ${errorText}`)
      }

      const webhookData = await webhookResponse.json()
      console.log("[v0] Webhook response:", webhookData)
      console.log("[v0] Response type:", Array.isArray(webhookData) ? "array" : typeof webhookData)
      console.log("[v0] Response length:", Array.isArray(webhookData) ? webhookData.length : "N/A")

      let imageUrl: string
      if (Array.isArray(webhookData) && webhookData.length > 0) {
        imageUrl = webhookData[0].imageUrl
        console.log("[v0] Extracted imageUrl from array:", imageUrl)
      } else if (webhookData.imageUrl) {
        imageUrl = webhookData.imageUrl
        console.log("[v0] Extracted imageUrl from object:", imageUrl)
      } else {
        console.error("[v0] No imageUrl found in response:", webhookData)
        throw new Error("No image URL in response")
      }

      const generatedImage: GeneratedImage = {
        id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageUrl,
        prompt: request.prompt,
        style: request.style,
        dimension: request.dimension,
        quality: request.quality,
        createdAt: new Date(),
      }

      this.generatedImages.unshift(generatedImage)
      console.log("[v0] Generated image added:", generatedImage)
      return generatedImage
    } catch (error) {
      console.error("[v0] Image generation failed:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to image generation service. Please check your internet connection and try again.",
        )
      }
      throw new Error("Failed to generate image. Please try again.")
    }
  }

  async retryGeneration(imageId: string): Promise<GeneratedImage> {
    const originalImage = this.generatedImages.find((img) => img.id === imageId)
    if (!originalImage) {
      throw new Error("Original image not found")
    }

    const request: GenerationRequest = {
      prompt: originalImage.prompt,
      style: originalImage.style,
      dimension: originalImage.dimension,
      quality: originalImage.quality,
    }

    return this.generateImage(request)
  }

  getGeneratedImages(): GeneratedImage[] {
    return [...this.generatedImages]
  }

  async downloadImage(imageId: string): Promise<void> {
    const image = this.generatedImages.find((img) => img.id === imageId)
    if (!image) throw new Error("Image not found")

    try {
      const response = await fetch(image.url, {
        mode: "cors",
      })
      const blob = await response.blob()

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.crossOrigin = "anonymous"

      await new Promise((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width
          canvas.height = img.height
          ctx?.drawImage(img, 0, 0)
          resolve(void 0)
        }
        img.onerror = reject
        img.src = URL.createObjectURL(blob)
      })

      // Convert canvas to PNG blob
      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob!)
          },
          "image/png",
          1.0,
        )
      })

      const url = window.URL.createObjectURL(pngBlob)
      const link = document.createElement("a")
      link.href = url

      const cleanPrompt = image.prompt
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .substring(0, 30)
        .trim()
        .replace(/\s+/g, "-")
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `seedream-${cleanPrompt}-${timestamp}.png`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Download failed:", error)
      window.open(image.url, "_blank")
    }
  }

  async shareImage(imageId: string): Promise<void> {
    const image = this.generatedImages.find((img) => img.id === imageId)
    if (!image) throw new Error("Image not found")

    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: "Generated with Seedream 4.0",
          text: image.prompt,
          url: image.url,
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      await navigator.clipboard.writeText(image.url)

      const notification = document.createElement("div")
      notification.textContent = "Image URL copied to clipboard!"
      notification.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      document.body.appendChild(notification)

      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    } catch (error) {
      console.error("Share failed:", error)
      throw new Error("Failed to share image")
    }
  }

  async generateVideo(image: GeneratedImage): Promise<GeneratedVideo> {
    try {
      console.log("[v0] Sending video generation request:", image)

      const webhookResponse = await fetch("https://qb123.app.n8n.cloud/webhook-test/gen_video", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        mode: "cors", // Explicitly set CORS mode
        body: JSON.stringify({
          type: "video",
          imageUrl: image.url,
          imageId: image.id,
          prompt: image.prompt,
          style: image.style,
          dimension: image.dimension,
          quality: image.quality,
          timestamp: new Date().toISOString(),
          userInputData: {
            originalPrompt: image.prompt,
            selectedStyle: image.style,
            selectedDimension: image.dimension,
            selectedQuality: image.quality,
            generatedImageUrl: image.url,
            createdAt: image.createdAt.toISOString(),
          },
        }),
      })

      console.log("[v0] Video response status:", webhookResponse.status)

      if (!webhookResponse.ok) {
        const errorText = await webhookResponse.text()
        console.error("[v0] Video webhook error response:", errorText)
        throw new Error(`Video generation webhook failed: ${webhookResponse.status} - ${errorText}`)
      }

      const webhookData = await webhookResponse.json()
      console.log("[v0] Video webhook response:", webhookData)

      let videoUrl: string
      if (Array.isArray(webhookData) && webhookData.length > 0) {
        videoUrl = webhookData[0].videoUrl
      } else if (webhookData.videoUrl) {
        videoUrl = webhookData.videoUrl
      } else {
        throw new Error("No video URL in response")
      }

      const generatedVideo: GeneratedVideo = {
        id: `vid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: videoUrl,
        imageId: image.id,
        imageUrl: image.url,
        prompt: image.prompt,
        style: image.style,
        dimension: image.dimension,
        quality: image.quality,
        createdAt: new Date(),
      }

      this.generatedVideos.unshift(generatedVideo)
      console.log("[v0] Generated video added:", generatedVideo)
      return generatedVideo
    } catch (error) {
      console.error("[v0] Video generation failed:", error)
      if (error instanceof TypeError && error.message.includes("fetch")) {
        throw new Error(
          "Network error: Unable to connect to video generation service. Please check your internet connection and try again.",
        )
      }
      throw new Error("Failed to generate video. Please try again.")
    }
  }

  async downloadVideo(videoId: string): Promise<void> {
    const video = this.generatedVideos.find((vid) => vid.id === videoId)
    if (!video) throw new Error("Video not found")

    try {
      const response = await fetch(video.url, {
        mode: "cors",
      })
      const blob = await response.blob()

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url

      const cleanPrompt = video.prompt
        .replace(/[^a-zA-Z0-9\s]/g, "")
        .substring(0, 30)
        .trim()
        .replace(/\s+/g, "-")
      const timestamp = new Date().toISOString().slice(0, 10)
      link.download = `seedream-video-${cleanPrompt}-${timestamp}.mp4`

      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Video download failed:", error)
      window.open(video.url, "_blank")
    }
  }

  async shareVideo(videoId: string): Promise<void> {
    const video = this.generatedVideos.find((vid) => vid.id === videoId)
    if (!video) throw new Error("Video not found")

    try {
      if (navigator.share && navigator.canShare) {
        const shareData = {
          title: "Generated Video with Seedream 4.0",
          text: video.prompt,
          url: video.url,
        }

        if (navigator.canShare(shareData)) {
          await navigator.share(shareData)
          return
        }
      }

      await navigator.clipboard.writeText(video.url)

      const notification = document.createElement("div")
      notification.textContent = "Video URL copied to clipboard!"
      notification.className = "fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50"
      document.body.appendChild(notification)

      setTimeout(() => {
        document.body.removeChild(notification)
      }, 3000)
    } catch (error) {
      console.error("Video share failed:", error)
      throw new Error("Failed to share video")
    }
  }

  getGeneratedVideos(): GeneratedVideo[] {
    return [...this.generatedVideos]
  }
}

// Dimension mapping for Seedream 4.0 API
export const DIMENSION_MAPPING = {
  square: "square",
  square_hd: "square_hd",
  portrait_4_3: "portrait_4_3",
  portrait_16_9: "portrait_16_9",
  landscape_4_3: "landscape_4_3",
  landscape_16_9: "landscape_16_9",
} as const

// Quality mapping for Seedream 4.0 API
export const QUALITY_MAPPING = {
  "1K": "1024",
  "2K": "2048",
  "4K": "4096",
} as const
