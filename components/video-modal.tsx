"use client"

import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, Share2, RotateCcw, X } from "lucide-react"
import type { GeneratedVideo } from "@/lib/seedream-api"

interface VideoModalProps {
  video: GeneratedVideo | null
  isOpen: boolean
  onClose: () => void
  onDownload: (video: GeneratedVideo) => void
  onShare: (video: GeneratedVideo) => void
  onRetry: (video: GeneratedVideo) => void
}

export function VideoModal({ video, isOpen, onClose, onDownload, onShare, onRetry }: VideoModalProps) {
  if (!video) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full p-0 bg-slate-900 border-4 border-cyan-400">
        <div className="relative">
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/70 text-white rounded-full p-2"
          >
            <X className="w-4 h-4" />
          </Button>

          <div className="aspect-video bg-black rounded-t-lg overflow-hidden">
            <video
              src={video.url}
              controls
              autoPlay
              loop
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error("[v0] Video failed to load:", video.url)
              }}
            >
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="p-6 space-y-4">
            <div className="text-center">
              <p className="text-lg font-medium text-white mb-2">"{video.prompt}"</p>
              <div className="flex justify-center gap-4 text-sm text-slate-400">
                <span>{video.style}</span>
                <span>{video.dimension}</span>
                <span>{video.quality}</span>
              </div>
            </div>

            <div className="flex gap-3 justify-center">
              <Button
                onClick={() => onDownload(video)}
                className="bg-green-500 hover:bg-green-600 text-white border-2 border-slate-900 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button
                onClick={() => onShare(video)}
                className="bg-blue-500 hover:bg-blue-600 text-white border-2 border-slate-900 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
              >
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button
                onClick={() => onRetry(video)}
                className="bg-orange-500 hover:bg-orange-600 text-white border-2 border-slate-900 shadow-cartoon hover:shadow-none transition-all duration-200 transform hover:-translate-y-1"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Retry
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
