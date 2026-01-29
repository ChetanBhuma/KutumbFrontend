"use client"

import { useState } from "react"
import { ChevronRight, ChevronDown, MapPin, Building, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { HierarchyNode } from "@/types/hierarchy"

interface HierarchyTreeProps {
  nodes: HierarchyNode[]
  onNodeSelect: (node: HierarchyNode) => void
  selectedNodeId?: string
}

const getNodeIcon = (type: string) => {
  switch (type) {
    case "range":
      return <Shield className="h-4 w-4 text-blue-600" />
    case "district":
      return <Building className="h-4 w-4 text-green-600" />
    case "subdivision":
      return <Users className="h-4 w-4 text-purple-600" />
    case "station":
      return <MapPin className="h-4 w-4 text-red-600" />
    case "post":
      return <MapPin className="h-4 w-4 text-orange-600" />
    case "beat":
      return <MapPin className="h-4 w-4 text-gray-600" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

const getNodeColor = (type: string) => {
  switch (type) {
    case "range":
      return "bg-blue-50 border-blue-200"
    case "district":
      return "bg-green-50 border-green-200"
    case "subdivision":
      return "bg-purple-50 border-purple-200"
    case "station":
      return "bg-red-50 border-red-200"
    case "post":
      return "bg-orange-50 border-orange-200"
    case "beat":
      return "bg-gray-50 border-gray-200"
    default:
      return "bg-gray-50 border-gray-200"
  }
}

function TreeNode({
  node,
  level = 0,
  onNodeSelect,
  selectedNodeId,
}: {
  node: HierarchyNode
  level?: number
  onNodeSelect: (node: HierarchyNode) => void
  selectedNodeId?: string
}) {
  const [isExpanded, setIsExpanded] = useState(level < 2)
  const hasChildren = node.children && node.children.length > 0
  const isSelected = selectedNodeId === node.id

  return (
    <div className="select-none">
      <div
        className={`flex items-center gap-2 p-2 rounded-md cursor-pointer hover:bg-muted/50 transition-colors ${
          isSelected ? "bg-primary/10 border border-primary/20" : ""
        }`}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onNodeSelect(node)}
      >
        {hasChildren && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
          </Button>
        )}
        {!hasChildren && <div className="w-6" />}

        {getNodeIcon(node.type)}

        <span className="font-medium text-sm">{node.name}</span>

        <Badge variant="outline" className="text-xs">
          {node.code}
        </Badge>

        {hasChildren && (
          <Badge variant="secondary" className="text-xs ml-auto">
            {node.children!.length}
          </Badge>
        )}
      </div>

      {hasChildren && isExpanded && (
        <div>
          {node.children!.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              onNodeSelect={onNodeSelect}
              selectedNodeId={selectedNodeId}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export function HierarchyTree({ nodes, onNodeSelect, selectedNodeId }: HierarchyTreeProps) {
  return (
    <Card className="h-full">
      <CardContent className="p-4">
        <div className="space-y-1">
          {nodes.map((node) => (
            <TreeNode key={node.id} node={node} onNodeSelect={onNodeSelect} selectedNodeId={selectedNodeId} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
