"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { HierarchyTree } from "@/components/hierarchy/hierarchy-tree"
import { HierarchyDetails } from "@/components/hierarchy/hierarchy-details"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Upload, Download, RefreshCw } from "lucide-react" // Added Refresh icon
import { fetchHierarchyTree } from "@/lib/hierarchy-data" // Updated import
import type { HierarchyNode, HierarchyLevel } from "@/types/hierarchy"
import { useToast } from "@/components/ui/use-toast"

export default function HierarchyPage() {
  const [hierarchyData, setHierarchyData] = useState<HierarchyNode[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNode, setSelectedNode] = useState<HierarchyNode | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterLevel, setFilterLevel] = useState<HierarchyLevel | "all">("all")
  const { toast } = useToast()

  // Load Data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHierarchyTree();
      setHierarchyData(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error fetching hierarchy",
        description: "Could not load organizational data."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleNodeSelect = (node: HierarchyNode) => {
    setSelectedNode(node)
  }

  // Recursive Filter for nested tree structure
  const filterTree = (nodes: HierarchyNode[]): HierarchyNode[] => {
    return nodes.map(node => {
      // Check if current node matches
      const matchesSearch = searchTerm === "" ||
        node.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        node.code.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel = filterLevel === "all" || node.type === filterLevel;

      // If children exist, filter them recursively
      let filteredChildren: HierarchyNode[] = [];
      if (node.children) {
        filteredChildren = filterTree(node.children);
      }

      // Keep node if it matches criteria OR has matching children
      if ((matchesSearch && matchesLevel) || filteredChildren.length > 0) {
        return { ...node, children: filteredChildren };
      }
      return null;
    }).filter(Boolean) as HierarchyNode[];
  };

  const filteredData = Array.isArray(hierarchyData) ? filterTree(hierarchyData) : [];

  return (
    <DashboardLayout title="Hierarchy" description="Manage organizational structure and reporting lines">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hierarchy Manager</h1>
            <p className="text-muted-foreground">
              Manage Delhi Police organizational hierarchy from Range to Beat level
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Search & Filter</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name or code..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterLevel} onValueChange={(value) => setFilterLevel(value as HierarchyLevel | "all")}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="range">Range</SelectItem>
                  <SelectItem value="district">District</SelectItem>
                  <SelectItem value="station">Station</SelectItem>
                  <SelectItem value="beat">Beat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[600px]">
          <div>
            <h2 className="text-lg font-semibold mb-4">
              Hierarchy Tree
              {loading && <span className="text-sm font-normal text-muted-foreground ml-2">(Loading...)</span>}
            </h2>
            <HierarchyTree nodes={filteredData} onNodeSelect={handleNodeSelect} selectedNodeId={selectedNode?.id} />
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Details</h2>
            {selectedNode ? (
              <HierarchyDetails node={selectedNode} />
            ) : (
              <div className="h-full flex items-center justify-center border rounded-lg p-10 text-muted-foreground bg-muted/20">
                Select a node to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
