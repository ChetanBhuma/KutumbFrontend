"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Video, Plus, Search, Eye, Edit, Trash2, Play, Calendar, BarChart3, MoreHorizontal } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AddVideoDialog } from "./add-video-dialog"
import { VideoDetailPanel } from "./video-detail-panel"

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
    thumbnail: "/safety-tips-video.png",
  },
  {
    id: "2",
    title: "How to Report Incidents",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Education",
    publishDate: "2024-01-12",
    status: "published",
    views: 890,
    likes: 67,
    completion: 85,
    thumbnail: "/report-incidents-tutorial.png",
  },
  {
    id: "3",
    title: "Emergency Contact Procedures",
    url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Emergency",
    publishDate: "2024-01-20",
    status: "draft",
    views: 0,
    likes: 0,
    completion: 0,
    thumbnail: "/emergency-contact-procedures.png",
  },
]

export function ContentManagement() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)

  const filteredVideos = mockVideos.filter(
    (video) =>
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.category.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 sm:w-80">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search videos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="hover-lift">
          <Plus className="h-4 w-4 mr-2" />
          Add Video
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Card className="hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Library
              </CardTitle>
              <CardDescription>Manage educational videos and learning resources</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredVideos.map((video) => (
                  <Card
                    key={video.id}
                    className="hover-lift cursor-pointer hover:shadow-md transition-all"
                    onClick={() => setSelectedVideo(video.id)}
                  >
                    <div className="relative">
                      <img
                        src={video.thumbnail || "/placeholder.svg?height=200&width=300&query=video thumbnail"}
                        alt={video.title}
                        className="w-full h-32 object-cover rounded-t-lg"
                      />
                      <div className="absolute inset-0 bg-black/20 rounded-t-lg flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <Play className="h-8 w-8 text-white" />
                      </div>
                      <Badge className={`absolute top-2 right-2 ${getStatusColor(video.status)}`}>{video.status}</Badge>
                    </div>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <h4 className="font-medium line-clamp-2">{video.title}</h4>
                        <div className="flex items-center gap-2">
                          <Badge className={getCategoryColor(video.category)}>{video.category}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(video.publishDate).toLocaleDateString()}
                          </span>
                        </div>
                        {video.status === "published" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3 mr-1" />
                              {video.views}
                            </span>
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3 mr-1" />
                              {video.completion}%
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <Button size="sm" variant="outline" className="hover-navy bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          Preview
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="hover-wine">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Video
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <BarChart3 className="h-4 w-4 mr-2" />
                              View Analytics
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Video
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Panel */}
        <div className="lg:col-span-1">
          {selectedVideo ? (
            <VideoDetailPanel videoId={selectedVideo} onClose={() => setSelectedVideo(null)} />
          ) : (
            <Card className="hover-lift">
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-muted-foreground">
                  <Video className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a video to view details</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <AddVideoDialog open={showAddDialog} onOpenChange={setShowAddDialog} />
    </div>
  )
}
