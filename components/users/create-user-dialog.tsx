"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus, Loader2 } from "lucide-react"
import apiClient from "@/lib/api-client"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MultiSelect } from "@/components/ui/multi-select"

interface RoleOption {
  id: string
  code: string
  name: string
  isActive: boolean
  jurisdictionLevel: string
  isMultiSelect: boolean
}

interface MasterData {
  ranges: any[]
  districts: any[]
  subDivisions: any[]
  policeStations: any[]
  beats: any[]
}

interface CreateUserDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  roles: RoleOption[]
  onCreated: () => void
}

export function CreateUserDialog({ open, onOpenChange, roles, onCreated }: CreateUserDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  // const [successMessage, setSuccessMessage] = useState("") // Not currently used

  // Basic User Data
  const [formData, setFormData] = useState({
    email: "",
    mobile: "",
    role: "",
    password: "",
  })

  // Officer Specific Data
  const [officerData, setOfficerData] = useState({
    fullName: "",
    badgeNumber: "",
  })

  // Jurisdiction Data (Arrays to support Multi-Select)
  const [jurisdiction, setJurisdiction] = useState({
    rangeIds: [] as string[],
    districtIds: [] as string[],
    subDivisionIds: [] as string[],
    policeStationIds: [] as string[],
    beatIds: [] as string[],
  })

  const [masterData, setMasterData] = useState<MasterData>({
    ranges: [],
    districts: [],
    subDivisions: [],
    policeStations: [],
    beats: [],
  })

  // Fetch Master Data on Mount
  useEffect(() => {
    const fetchMasters = async () => {
      try {
        const response = await apiClient.getAllMasters();
        if (response.success) {
          setMasterData({
            ranges: response.data.ranges || [],
            districts: response.data.districts || [],
            subDivisions: response.data.subDivisions || [],
            policeStations: response.data.policeStations || [],
            beats: response.data.beats || []
          })
        }
      } catch (err) {
        console.error("Failed to load master data for user creation", err)
      }
    }
    if (open) {
      fetchMasters()
    }
  }, [open])


  const resetForm = () => {
    setFormData({
      email: "",
      mobile: "",
      role: "",
      password: "",
    })
    setOfficerData({ fullName: "", badgeNumber: "" })
    setJurisdiction({
      rangeIds: [],
      districtIds: [],
      subDivisionIds: [],
      policeStationIds: [],
      beatIds: []
    })
    setError("")
    // setSuccessMessage("")
  }

  const selectedRole = roles.find(r => r.code === formData.role);
  const requiredLevel = selectedRole?.jurisdictionLevel || 'NONE';
  const isMultiSelect = selectedRole?.isMultiSelect || false;
  const showOfficerFields = requiredLevel !== 'NONE';

  // Helper to determine if a level is "active" (needed or parent of needed)
  const isLevelActive = (level: string) => {
    const hierarchy = ['RANGE', 'DISTRICT', 'SUB_DIVISION', 'POLICE_STATION', 'BEAT'];
    const targetIndex = hierarchy.indexOf(requiredLevel);
    const levelIndex = hierarchy.indexOf(level);
    return targetIndex >= levelIndex; // Show if it's the target or a parent
  };

  // Filtered Options for Dropdowns
  const filteredDistricts = useMemo(() => {
    if (jurisdiction.rangeIds.length === 0) return [];
    return masterData.districts.filter((d: any) => jurisdiction.rangeIds.includes(d.rangeId));
  }, [masterData.districts, jurisdiction.rangeIds]);

  const filteredSubDivisions = useMemo(() => {
    if (jurisdiction.districtIds.length === 0) return [];
    return masterData.subDivisions.filter((s: any) => jurisdiction.districtIds.includes(s.districtId));
  }, [masterData.subDivisions, jurisdiction.districtIds]);

  const filteredStations = useMemo(() => {
    if (jurisdiction.subDivisionIds.length === 0) return [];
    return masterData.policeStations.filter((ps: any) => jurisdiction.subDivisionIds.includes(ps.subDivisionId));
  }, [masterData.policeStations, jurisdiction.subDivisionIds]);

  const filteredBeats = useMemo(() => {
    if (jurisdiction.policeStationIds.length === 0) return [];
    return masterData.beats.filter((b: any) => jurisdiction.policeStationIds.includes(b.policeStationId));
  }, [masterData.beats, jurisdiction.policeStationIds]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.role) {
      setError("Please select a role")
      return
    }

    // Validate Officer Fields
    if (showOfficerFields) {
      if (!officerData.fullName || !officerData.badgeNumber) {
        setError("Officer Name and Badge Number are required for this role.");
        return;
      }

      // Dynamic Validation
      if (isLevelActive('RANGE') && jurisdiction.rangeIds.length === 0) { setError("Range is required"); return; }
      if (isLevelActive('DISTRICT') && jurisdiction.districtIds.length === 0) { setError("District is required"); return; }
      if (isLevelActive('SUB_DIVISION') && jurisdiction.subDivisionIds.length === 0) { setError("Sub-Division is required"); return; }
      if (isLevelActive('POLICE_STATION') && jurisdiction.policeStationIds.length === 0) { setError("Police Station is required"); return; }

      // Beat level validation (optional Strictness)
      if (requiredLevel === 'BEAT' && jurisdiction.beatIds.length === 0) {
        // setError("Beat is required"); return;
      }
    }

    try {
      setIsLoading(true)
      setError("")

      const payload: any = {
        email: formData.email,
        phone: formData.mobile,
        roleCode: formData.role,
        password: formData.password || undefined,
      };

      if (showOfficerFields) {
        payload.name = officerData.fullName;
        payload.badgeNumber = officerData.badgeNumber;
        payload.jurisdiction = {
          rangeIds: jurisdiction.rangeIds,
          districtIds: jurisdiction.districtIds,
          subDivisionIds: jurisdiction.subDivisionIds,
          policeStationIds: jurisdiction.policeStationIds,
          beatIds: jurisdiction.beatIds
        };
      }

      const response = await apiClient.createUser(payload);

      resetForm()
      onOpenChange(false)
      onCreated()
      if (response.data?.tempPassword) {
        alert(`User created. Temporary password: ${response.data.tempPassword}`)
      }
    } catch (err: any) {
      console.error("Failed to create user", err)
      setError(err.response?.data?.message || "Failed to create user")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Create New User
          </DialogTitle>
          <DialogDescription>Add a new user to the system with appropriate role and permissions.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Account Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                placeholder="officer@delhipolice.gov.in"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile Number <span className="text-red-500">*</span></Label>
              <Input
                id="mobile"
                type="tel"
                value={formData.mobile}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                }
                placeholder="10-digit mobile"
                maxLength={10}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Temporary Password (optional)</Label>
            <Input
              id="password"
              type="text"
              value={formData.password}
              onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
              placeholder="Leave blank to auto-generate"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role <span className="text-red-500">*</span></Label>
            <Select value={formData.role} onValueChange={(value) => {
              setFormData((prev) => ({ ...prev, role: value }));
              // Reset jurisdiction on role change to avoid invalid states
              setJurisdiction({ rangeIds: [], districtIds: [], subDivisionIds: [], policeStationIds: [], beatIds: [] });
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                {roles
                  .filter((role) => role.isActive)
                  .map((role) => (
                    <SelectItem key={role.id} value={role.code}>
                      {role.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {showOfficerFields && (
            <div className="border-t pt-4 mt-4 space-y-4">
              <h4 className="font-medium text-sm text-muted-foreground">Officer Details & Jurisdiction</h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Officer Name <span className="text-red-500">*</span></Label>
                  <Input
                    value={officerData.fullName}
                    onChange={(e) => setOfficerData(p => ({ ...p, fullName: e.target.value }))}
                    placeholder="Full Name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>PIS Number <span className="text-red-500">*</span></Label>
                  <Input
                    value={officerData.badgeNumber}
                    onChange={(e) => setOfficerData(p => ({ ...p, badgeNumber: e.target.value }))}
                    placeholder="PIS Number"
                    required
                  />
                </div>
              </div>

              {/* Dynamic Jurisdiction Fields */}
              {isLevelActive('RANGE') && (
                <div className="space-y-2">
                  <Label>Range</Label>
                  <MultiSelect
                    options={masterData.ranges.map((r: any) => ({ label: r.name, value: r.id }))}
                    selected={jurisdiction.rangeIds}
                    onChange={(vals) => setJurisdiction(p => ({
                      ...p,
                      rangeIds: vals,
                      districtIds: [], subDivisionIds: [], policeStationIds: [], beatIds: []
                    }))}
                    placeholder="Select Ranges"
                    maxCount={isMultiSelect ? undefined : 1}
                  />
                </div>
              )}

              {isLevelActive('DISTRICT') && (
                <div className="space-y-2">
                  <Label>District</Label>
                  <MultiSelect
                    options={filteredDistricts.map((d: any) => ({ label: d.name, value: d.id }))}
                    selected={jurisdiction.districtIds}
                    onChange={(vals) => setJurisdiction(p => ({
                      ...p,
                      districtIds: vals,
                      subDivisionIds: [], policeStationIds: [], beatIds: []
                    }))}
                    placeholder="Select Districts"
                    maxCount={isMultiSelect ? undefined : 1}
                  />
                </div>
              )}

              {isLevelActive('SUB_DIVISION') && (
                <div className="space-y-2">
                  <Label>Sub-Division</Label>
                  <MultiSelect
                    options={filteredSubDivisions.map((s: any) => ({ label: s.name, value: s.id }))}
                    selected={jurisdiction.subDivisionIds}
                    onChange={(vals) => setJurisdiction(p => ({
                      ...p,
                      subDivisionIds: vals,
                      policeStationIds: [], beatIds: []
                    }))}
                    placeholder="Select Sub-Divisions"
                    maxCount={isMultiSelect ? undefined : 1}
                  />
                </div>
              )}

              {isLevelActive('POLICE_STATION') && (
                <div className="space-y-2">
                  <Label>Police Station</Label>
                  <MultiSelect
                    options={filteredStations.map((ps: any) => ({ label: ps.name, value: ps.id }))}
                    selected={jurisdiction.policeStationIds}
                    onChange={(vals) => setJurisdiction(p => ({
                      ...p,
                      policeStationIds: vals,
                      beatIds: []
                    }))}
                    placeholder="Select Police Stations"
                    maxCount={isMultiSelect ? undefined : 1}
                  />
                </div>
              )}

              {isLevelActive('BEAT') && (
                <div className="space-y-2">
                  <Label>Beat</Label>
                  <MultiSelect
                    options={filteredBeats.map((b: any) => ({ label: b.name, value: b.id }))}
                    selected={jurisdiction.beatIds}
                    onChange={(vals) => setJurisdiction(p => ({ ...p, beatIds: vals }))}
                    placeholder="Select Beats"
                    maxCount={isMultiSelect ? undefined : 1}
                  />
                </div>
              )}

            </div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
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
                "Create User"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
