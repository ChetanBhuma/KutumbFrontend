"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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
import { MessageSquare, Loader2, Eye } from "lucide-react"

interface CreateTemplateDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateTemplateDialog({ open, onOpenChange }: CreateTemplateDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    subject: "",
    body: "",
    channels: {
      sms: false,
      email: false,
      push: false,
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    onOpenChange(false)

    // Reset form
    setFormData({
      name: "",
      type: "",
      subject: "",
      body: "",
      channels: {
        sms: false,
        email: false,
        push: false,
      },
    })
  }

  const handleChannelChange = (channel: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      channels: {
        ...prev.channels,
        [channel]: checked,
      },
    }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Create Notification Template
          </DialogTitle>
          <DialogDescription>
            Create a reusable template for notifications with placeholders and channel selection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Template Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter template name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Template Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="reminder">Reminder</SelectItem>
                  <SelectItem value="alert">Alert</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="notification">General Notification</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="subject">Subject Line</Label>
            <Input
              id="subject"
              value={formData.subject}
              onChange={(e) => setFormData((prev) => ({ ...prev, subject: e.target.value }))}
              placeholder="Enter subject (for email/push notifications)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Message Body</Label>
            <Textarea
              id="body"
              value={formData.body}
              onChange={(e) => setFormData((prev) => ({ ...prev, body: e.target.value }))}
              placeholder="Enter message body. Use {{citizenName}}, {{visitDate}}, etc. for placeholders"
              rows={4}
              required
            />
            <p className="text-xs text-muted-foreground">
              Available placeholders: {"{citizenName}"}, {"{visitDate}"}, {"{officerName}"}, {"{stationName}"}
            </p>
          </div>

          <div className="space-y-3">
            <Label>Delivery Channels</Label>
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="sms"
                  checked={formData.channels.sms}
                  onCheckedChange={(checked) => handleChannelChange("sms", checked as boolean)}
                />
                <Label htmlFor="sms" className="text-sm">
                  SMS
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="email"
                  checked={formData.channels.email}
                  onCheckedChange={(checked) => handleChannelChange("email", checked as boolean)}
                />
                <Label htmlFor="email" className="text-sm">
                  Email
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="push"
                  checked={formData.channels.push}
                  onCheckedChange={(checked) => handleChannelChange("push", checked as boolean)}
                />
                <Label htmlFor="push" className="text-sm">
                  Push Notification
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" className="hover-navy bg-transparent">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading} className="hover-lift">
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Template"
                )}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
