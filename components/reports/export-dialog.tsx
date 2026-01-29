"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Download, Loader2, FileText, File } from "lucide-react"

interface ExportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ExportDialog({ open, onOpenChange }: ExportDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    dataset: "",
    format: "",
    dateRange: "",
    filters: {
      includeInactive: false,
      includePersonalData: false,
      includeAuditTrail: true,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate export generation
    await new Promise((resolve) => setTimeout(resolve, 3000))

    setIsLoading(false)
    onOpenChange(false)

    // Reset form
    setFormData({
      dataset: "",
      format: "",
      dateRange: "",
      filters: {
        includeInactive: false,
        includePersonalData: false,
        includeAuditTrail: true,
      },
    })
  }

  const handleFilterChange = (filter: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filter]: checked,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </DialogTitle>
          <DialogDescription>Generate and download a data export with your selected criteria.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataset">Dataset</Label>
            <Select
              value={formData.dataset}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, dataset: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select dataset to export" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="citizens">Citizens Data</SelectItem>
                <SelectItem value="visits">Visit Records</SelectItem>
                <SelectItem value="audit">Audit Logs</SelectItem>
                <SelectItem value="users">User Accounts</SelectItem>
                <SelectItem value="stations">Station Information</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <Select
              value={formData.format}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, format: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select export format" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="csv">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    CSV (Comma Separated Values)
                  </div>
                </SelectItem>
                <SelectItem value="pdf">
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4" />
                    PDF (Portable Document Format)
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dateRange">Date Range</Label>
            <Select
              value={formData.dateRange}
              onValueChange={(value) => setFormData((prev) => ({ ...prev, dateRange: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last3months">Last 3 months</SelectItem>
                <SelectItem value="last6months">Last 6 months</SelectItem>
                <SelectItem value="lastyear">Last year</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Export Options</Label>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeInactive"
                  checked={formData.filters.includeInactive}
                  onCheckedChange={(checked) => handleFilterChange("includeInactive", checked as boolean)}
                />
                <Label htmlFor="includeInactive" className="text-sm">
                  Include inactive records
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includePersonalData"
                  checked={formData.filters.includePersonalData}
                  onCheckedChange={(checked) => handleFilterChange("includePersonalData", checked as boolean)}
                />
                <Label htmlFor="includePersonalData" className="text-sm">
                  Include personal data (requires admin approval)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="includeAuditTrail"
                  checked={formData.filters.includeAuditTrail}
                  onCheckedChange={(checked) => handleFilterChange("includeAuditTrail", checked as boolean)}
                />
                <Label htmlFor="includeAuditTrail" className="text-sm">
                  Include audit trail
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading} className="hover-lift">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate Export
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
