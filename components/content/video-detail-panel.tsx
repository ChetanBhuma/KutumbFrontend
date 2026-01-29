"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { X, Video, Calendar, Eye, ThumbsUp, BarChart3, Play, Edit, Trash2, ExternalLink } from "lucide-react"

const mockVideos = [
  {
    id: "1",
    title: "Senior Citizen Safety Tips",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Safety",
    publishDate: "2024-01-15",
    status: "published",
    views: 1250,
    likes: 89,
    completion: 78,
    description:
      "Comprehensive guide on safety measures for senior citizens including home security, personal safety, and emergency preparedness.",
    thumbnail: "/safety-tips-video.png",
  },
]

interface VideoDetailPanelProps {
  videoId: string
  onClose: () => void
}

export function VideoDetailPanel({ videoId, onClose }: VideoDetailPanelProps) {
  const video = mockVideos.find((v) => v.id === videoId) || mockVideos[0]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      case "draft":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
      case "archived":
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Safety":
        return "bg-primary text-primary-foreground"
      case "Education":
        return "bg-secondary text-secondary-foreground"
      case "Emergency":
        return "bg-destructive text-destructive-foreground"
      default:
        return "bg-muted text-muted-foreground"
    }
  }

  return (
    <Card className="hover-lift">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Video Details
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose} className="hover-wine">
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Complete video information and analytics</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Video Thumbnail */}
        <div className="relative">
          <img
            src={video.thumbnail || "/placeholder.svg?height=200&width=400&query=video thumbnail"}
            alt={video.title}
            className="w-full h-40 object-cover rounded-lg"
          />
          <div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
            <Play className="h-8 w-8 text-white" />
          </div>
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          <h3 className="font-semibold text-lg">{video.title}</h3>
          <div className="flex items-center gap-2">
            <Badge className={getCategoryColor(video.category)}>{video.category}</Badge>
            <Badge className={getStatusColor(video.status)}>{video.status}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{video.description}</p>
        </div>

        <Separator />

        {/* Metadata */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Publication Details
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span>Publish Date:</span>
              <span className="text-muted-foreground">{new Date(video.publishDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span>Video URL:</span>
              <Button variant="link" size="sm" className="h-auto p-0 text-xs">
                <ExternalLink className="h-3 w-3 mr-1" />
                Open YouTube
              </Button>
            </div>
          </div>
        </div>

        <Separator />

        {/* Analytics */}
        {video.status === "published" && (
          <>
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Performance Analytics
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <Eye className="h-3 w-3" />
                    Views
                  </div>
                  <div className="text-lg font-semibold">{video.views.toLocaleString()}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground mb-1">
                    <ThumbsUp className="h-3 w-3" />
                    Likes
                  </div>
                  <div className="text-lg font-semibold">{video.likes}</div>
                </div>
              </div>
              <div className="text-center p-3 bg-muted/50 rounded-lg">
                <div className="text-sm text-muted-foreground mb-1">Completion Rate</div>
                <div className="text-lg font-semibold">{video.completion}%</div>
                <div className="w-full bg-background rounded-full h-2 mt-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${video.completion}%` }}
                  />
                </div>
              </div>
            </div>
            <Separator />
          </>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button className="w-full hover-navy">
            <Edit className="h-4 w-4 mr-2" />
            Edit Video
          </Button>
          <Button variant="outline" className="w-full hover-wine bg-transparent">
            <Play className="h-4 w-4 mr-2" />
            Preview Video
          </Button>
          <Button variant="destructive" className="w-full">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Video
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
