"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Citizen } from "@/types/citizen"
import { Phone, MapPin, Calendar, AlertTriangle } from "lucide-react"

interface CitizenCardProps {
  citizen: Citizen
  isSelected?: boolean
  onClick?: () => void
}

export function CitizenCard({ citizen, isSelected, onClick }: CitizenCardProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-100 text-green-800 border-green-200"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "HIGH":
        return "bg-orange-100 text-orange-800 border-orange-200"
      case "CRITICAL":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getVerificationColor = (status: string) => {
    switch (status) {
      case "VERIFIED":
        return "bg-green-100 text-green-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const age = new Date().getFullYear() - new Date(citizen.personalInfo.dateOfBirth).getFullYear()

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? "ring-2 ring-primary shadow-md" : ""}`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={citizen.photos.profilePhoto || "/placeholder.svg"}
              alt={`${citizen.personalInfo.firstName} photo`}
            />
            <AvatarFallback>
              {citizen.personalInfo.firstName.charAt(0)}
              {citizen.personalInfo.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          {/* Main Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm truncate">
                  {citizen.personalInfo.firstName} {citizen.personalInfo.middleName} {citizen.personalInfo.lastName}
                </h3>
                <p className="text-xs text-muted-foreground">ID: {citizen.id}</p>
              </div>
              <div className="flex flex-col gap-1">
                <Badge variant="outline" className={getRiskColor(citizen.riskScore.level)}>
                  {citizen.riskScore.level}
                </Badge>
                <Badge variant="secondary" className={getVerificationColor(citizen.metadata.verificationStatus)}>
                  {citizen.metadata.verificationStatus}
                </Badge>
              </div>
            </div>

            {/* Contact Info */}
            <div className="space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Phone className="h-3 w-3" />
                <span>{citizen.contactInfo.phone}</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span className="truncate">
                  {citizen.contactInfo.address.city}, {citizen.contactInfo.address.district}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>
                  Age: {age} • {citizen.personalInfo.gender}
                </span>
              </div>
            </div>

            {/* Risk Indicators */}
            {citizen.riskScore.score > 50 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-orange-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Risk Score: {citizen.riskScore.score}/100</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
