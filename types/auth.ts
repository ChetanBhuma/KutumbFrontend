export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  OFFICER = "OFFICER",
  CITIZEN = "CITIZEN",
  VIEWER = "VIEWER",
  CONTROL_ROOM = "CONTROL_ROOM",
  DATA_ENTRY = "DATA_ENTRY",
}

export type RoleLevel = "ADMIN" | "RANGE" | "DISTRICT" | "SHO" | "CONSTABLE"

export const ROLE_LABELS: Record<Role, string> = {
  [Role.SUPER_ADMIN]: "Super Admin",
  [Role.ADMIN]: "Administrator",
  [Role.OFFICER]: "Officer",
  [Role.CITIZEN]: "Citizen",
  [Role.VIEWER]: "Viewer",
  [Role.CONTROL_ROOM]: "Control Room Operator",
  [Role.DATA_ENTRY]: "Data Entry Operator",
}

export const ROLE_LEVELS: Record<Role, RoleLevel> = {
  [Role.SUPER_ADMIN]: "ADMIN",
  [Role.ADMIN]: "ADMIN",
  [Role.OFFICER]: "SHO",
  [Role.CITIZEN]: "CONSTABLE",
  [Role.VIEWER]: "CONSTABLE",
  [Role.CONTROL_ROOM]: "ADMIN",
  [Role.DATA_ENTRY]: "CONSTABLE",
}

export const RolePermissions: Record<Role, string[]> = {
  [Role.SUPER_ADMIN]: ["*"],
  [Role.ADMIN]: [
    "citizens.read",
    "citizens.write",
    "hierarchy.read",
    "operations.roster",
    "officers.read",
    "officers.write",
    "officers.manage",
    "stations.read",
    "visits.read",
    "visits.schedule",
    "visits.complete",
    "sos.read",
    "sos.respond",
    "sos.resolve",
    "reports.read",
    "reports.generate",
    "reports.export",
    "audit_logs.read",
    "vulnerability_config.read",
    "users.read",
    "users.manage",
    "notifications.read",
    "content.read",
    "security.read",
    "masters.read",
    "settings.read",
  ],
  [Role.OFFICER]: [
    "citizens.read",
    "visits.read",
    "visits.complete",
    "sos.read",
    "sos.respond",
    "reports.read",
  ],
  [Role.CITIZEN]: ["citizens.read", "visits.read", "sos.read"],
  [Role.VIEWER]: ["citizens.read", "officers.read", "visits.read", "reports.read"],
  [Role.CONTROL_ROOM]: [
    "sos.read",
    "sos.respond",
    "sos.resolve",
    "officers.read",
    "citizens.read",
    "visits.read",
  ],
  [Role.DATA_ENTRY]: ["citizens.read", "citizens.write", "documents.upload"],
}

export interface User {
  id: string
  email: string
  mobile?: string
  phone?: string
  name: string
  role: Role
  roleLabel?: string
  roleLevel?: RoleLevel
  permissions: string[]
  stationId?: string
  districtId?: string
  rangeId?: string
  createdAt?: string
  updatedAt?: string
  [key: string]: any
}

export interface OTPState {
  mobile: string
  badgeNumber?: string
  isOTPSent: boolean
  isVerifying: boolean
  resendCount: number
  lastSentAt: number | null
  canResend: boolean
}

export interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  otpState: OTPState | null
}

export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  hasPermission: (resource: string, action: string) => boolean
  checkPermission: (permissionCode: string) => boolean // NEW: Dynamic permission check
  sendOTP: (mobile: string) => Promise<void>
  verifyOTP: (mobile: string, otp: string) => Promise<void>
  resendOTP: () => Promise<void>
  loginAsOfficer: (credentials: { badgeNumber: string; otp?: string }) => Promise<void>
  loginCitizen: (credentials: { mobileNumber: string; password: string }) => Promise<void>
  loginWithOTP: (mobile: string, otp: string) => Promise<void>
}

export interface LoginCredentials {
  mobile?: string
  badgeNumber?: string
  otp?: string
  identifier?: string
  password?: string
}
