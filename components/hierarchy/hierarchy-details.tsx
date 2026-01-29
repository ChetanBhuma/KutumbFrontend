"use client"

import { useState } from "react"
import apiClient from "@/lib/api-client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Edit, Save, X, MapPin, Info } from "lucide-react"
import type { HierarchyNode } from "@/types/hierarchy"

interface HierarchyDetailsProps {
  node: HierarchyNode | null
}

export function HierarchyDetails({ node }: HierarchyDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>({})

  if (!node) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <Info className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a node from the hierarchy tree to view details</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleEdit = () => {
    setEditData({ ...node.data })
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      const endpoint = `/masters/${node.type}s/${node.id}`;
      await apiClient.put(endpoint, editData);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save changes");
    }
  }

  const handleCancel = () => {
    setEditData({})
    setIsEditing(false)
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "range":
        return "Range"
      case "district":
        return "District"
      case "subdivision":
        return "Sub-Division"
      case "station":
        return "Police Station"
      case "post":
        return "Police Post (Chowki)"
      case "beat":
        return "Beat"
      default:
        return type
    }
  }

  const hasLocation = "lat" in node.data && "lng" in node.data

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            {node.name}
            <Badge variant="outline">{getTypeLabel(node.type)}</Badge>
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">Code: {node.code}</p>
        </div>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button variant="outline" size="sm" onClick={handleEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          ) : (
            <>
              <Button variant="outline" size="sm" onClick={handleSave}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="map" disabled={!hasLocation}>
              Map
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    value={editData.name || ""}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{node.data.name}</p>
                )}
              </div>

              <div>
                <Label htmlFor="code">Code</Label>
                {isEditing ? (
                  <Input
                    id="code"
                    value={editData.code || ""}
                    onChange={(e) => setEditData({ ...editData, code: e.target.value })}
                  />
                ) : (
                  <p className="text-sm font-medium mt-1">{node.data.code}</p>
                )}
              </div>
            </div>

            {"address" in node.data && (
              <div>
                <Label htmlFor="address">Address</Label>
                {isEditing ? (
                  <Textarea
                    id="address"
                    value={editData.address || ""}
                    onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                    rows={3}
                  />
                ) : (
                  <p className="text-sm mt-1">{node.data.address}</p>
                )}
              </div>
            )}

            {hasLocation && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  {isEditing ? (
                    <Input
                      id="lat"
                      type="number"
                      step="any"
                      value={editData.lat || ""}
                      onChange={(e) => setEditData({ ...editData, lat: Number.parseFloat(e.target.value) })}
                    />
                  ) : (
                    <p className="text-sm font-mono mt-1">{('lat' in node.data) ? node.data.lat : ''}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  {isEditing ? (
                    <Input
                      id="lng"
                      type="number"
                      step="any"
                      value={editData.lng || ""}
                      onChange={(e) => setEditData({ ...editData, lng: Number.parseFloat(e.target.value) })}
                    />
                  ) : (
                    <p className="text-sm font-mono mt-1">{('lng' in node.data) ? node.data.lng : ''}</p>
                  )}
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <Label>Created</Label>
                <p className="mt-1">{new Date(node.data.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <Label>Updated</Label>
                <p className="mt-1">{new Date(node.data.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="map" className="space-y-4">
            {hasLocation ? (
              <div className="bg-muted rounded-lg p-8 text-center">
                <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Map integration will be implemented here</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Location: {('lat' in node.data) ? node.data.lat : ''}, {('lng' in node.data) ? node.data.lng : ''}
                </p>
              </div>
            ) : (
              <div className="text-center text-muted-foreground">
                <p>No location data available for this node</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
