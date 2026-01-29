import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import type { Citizen } from "@/types/citizen"
import { User, Phone, Mail, MapPin, CreditCard, Ruler, AlertTriangle, Edit, Camera } from "lucide-react"

interface CitizenDetailsProps {
  citizen: Citizen
}

export function CitizenDetails({ citizen }: CitizenDetailsProps) {
  const age = new Date().getFullYear() - new Date(citizen.personalInfo.dateOfBirth).getFullYear()

  const getRiskColor = (level: string) => {
    switch (level) {
      case "LOW":
        return "bg-green-100 text-green-800"
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-800"
      case "HIGH":
        return "bg-orange-100 text-orange-800"
      case "CRITICAL":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Photo and Basic Info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-20 w-20">
                <AvatarImage
                  src={citizen.photos.profilePhoto || "/placeholder.svg"}
                  alt={`${citizen.personalInfo.firstName} photo`}
                />
                <AvatarFallback className="text-lg">
                  {citizen.personalInfo.firstName.charAt(0)}
                  {citizen.personalInfo.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-xl">
                  {citizen.personalInfo.firstName} {citizen.personalInfo.middleName} {citizen.personalInfo.lastName}
                </CardTitle>
                <CardDescription className="mt-1">
                  Citizen ID: {citizen.id} • Age: {age} • {citizen.personalInfo.gender}
                </CardDescription>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className={getRiskColor(citizen.riskScore.level)}>
                    Risk: {citizen.riskScore.level} ({citizen.riskScore.score}/100)
                  </Badge>
                  <Badge variant="secondary">{citizen.metadata.verificationStatus}</Badge>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Camera className="h-4 w-4 mr-2" />
                Photos
              </Button>
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-muted-foreground">Date of Birth</p>
                <p>{new Date(citizen.personalInfo.dateOfBirth).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Nationality</p>
                <p>{citizen.personalInfo.nationality}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Religion</p>
                <p>{citizen.personalInfo.religion || "Not specified"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Marital Status</p>
                <p>{citizen.personalInfo.maritalStatus}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{citizen.contactInfo.phone}</span>
              </div>
              {citizen.contactInfo.alternatePhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{citizen.contactInfo.alternatePhone}</span>
                </div>
              )}
              {citizen.contactInfo.email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{citizen.contactInfo.email}</span>
                </div>
              )}
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p>{citizen.contactInfo.address.street}</p>
                  <p>
                    {citizen.contactInfo.address.city}, {citizen.contactInfo.address.district}
                  </p>
                  <p>
                    {citizen.contactInfo.address.state} - {citizen.contactInfo.address.pincode}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Identification Documents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Identification Documents
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {citizen.identification.aadharNumber && (
              <div>
                <p className="font-medium text-muted-foreground">Aadhar Number</p>
                <p>{citizen.identification.aadharNumber}</p>
              </div>
            )}
            {citizen.identification.panNumber && (
              <div>
                <p className="font-medium text-muted-foreground">PAN Number</p>
                <p>{citizen.identification.panNumber}</p>
              </div>
            )}
            {citizen.identification.voterIdNumber && (
              <div>
                <p className="font-medium text-muted-foreground">Voter ID</p>
                <p>{citizen.identification.voterIdNumber}</p>
              </div>
            )}
            {citizen.identification.drivingLicenseNumber && (
              <div>
                <p className="font-medium text-muted-foreground">Driving License</p>
                <p>{citizen.identification.drivingLicenseNumber}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Physical Attributes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Ruler className="h-5 w-5" />
              Physical Attributes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid grid-cols-2 gap-4">
              {citizen.physicalAttributes.height && (
                <div>
                  <p className="font-medium text-muted-foreground">Height</p>
                  <p>{citizen.physicalAttributes.height} cm</p>
                </div>
              )}
              {citizen.physicalAttributes.weight && (
                <div>
                  <p className="font-medium text-muted-foreground">Weight</p>
                  <p>{citizen.physicalAttributes.weight} kg</p>
                </div>
              )}
              {citizen.physicalAttributes.eyeColor && (
                <div>
                  <p className="font-medium text-muted-foreground">Eye Color</p>
                  <p>{citizen.physicalAttributes.eyeColor}</p>
                </div>
              )}
              {citizen.physicalAttributes.complexion && (
                <div>
                  <p className="font-medium text-muted-foreground">Complexion</p>
                  <p>{citizen.physicalAttributes.complexion}</p>
                </div>
              )}
            </div>
            {citizen.physicalAttributes.identificationMarks &&
              citizen.physicalAttributes.identificationMarks.length > 0 && (
                <div>
                  <p className="font-medium text-muted-foreground mb-1">Identification Marks</p>
                  <div className="flex flex-wrap gap-1">
                    {citizen.physicalAttributes.identificationMarks.map((mark, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {mark}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Risk Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Risk Level: {citizen.riskScore.level}</p>
                <p className="text-sm text-muted-foreground">Score: {citizen.riskScore.score}/100</p>
              </div>
              <Badge className={getRiskColor(citizen.riskScore.level)}>{citizen.riskScore.level}</Badge>
            </div>
            <div>
              <p className="font-medium text-sm mb-2">Risk Factors:</p>
              <div className="flex flex-wrap gap-1">
                {citizen.riskScore.factors.map((factor, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {factor}
                  </Badge>
                ))}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Last updated: {new Date(citizen.riskScore.lastUpdated).toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Records Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Criminal History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizen.records.criminalHistory.length}</div>
            <p className="text-xs text-muted-foreground">Total records</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizen.records.complaints.length}</div>
            <p className="text-xs text-muted-foreground">Total complaints</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Interactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{citizen.records.interactions.length}</div>
            <p className="text-xs text-muted-foreground">Police interactions</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
