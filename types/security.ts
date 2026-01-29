export interface SecurityEvent {
  id: string
  type:
    | "LOGIN_ATTEMPT"
    | "LOGIN_SUCCESS"
    | "LOGIN_FAILURE"
    | "LOGOUT"
    | "ACCESS_DENIED"
    | "DATA_ACCESS"
    | "DATA_MODIFICATION"
    | "SYSTEM_ERROR"
    | "SECURITY_VIOLATION"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  userId?: string
  userEmail?: string
  ipAddress: string
  userAgent: string
  resource?: string
  action?: string
  details: Record<string, any>
  timestamp: string
  sessionId?: string
  location?: {
    country?: string
    region?: string
    city?: string
  }
}

export interface SecurityAlert {
  id: string
  type:
    | "BRUTE_FORCE"
    | "SUSPICIOUS_ACTIVITY"
    | "UNAUTHORIZED_ACCESS"
    | "DATA_BREACH"
    | "SYSTEM_COMPROMISE"
    | "POLICY_VIOLATION"
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  title: string
  description: string
  affectedUsers: string[]
  affectedResources: string[]
  detectedAt: string
  status: "OPEN" | "INVESTIGATING" | "RESOLVED" | "FALSE_POSITIVE"
  assignedTo?: string
  resolvedAt?: string
  resolution?: string
  metadata: Record<string, any>
}

export interface SecurityPolicy {
  id: string
  name: string
  category: "AUTHENTICATION" | "AUTHORIZATION" | "DATA_PROTECTION" | "AUDIT" | "NETWORK" | "COMPLIANCE"
  description: string
  rules: SecurityRule[]
  enabled: boolean
  createdAt: string
  updatedAt: string
  createdBy: string
}

export interface SecurityRule {
  id: string
  name: string
  condition: string
  action: "ALLOW" | "DENY" | "LOG" | "ALERT" | "BLOCK"
  parameters: Record<string, any>
  enabled: boolean
}

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  oldValue?: any
  newValue?: any
  ipAddress: string
  userAgent: string
  timestamp: string
  sessionId: string
  success: boolean
  errorMessage?: string
  metadata: Record<string, any>
}

export interface SecurityMetrics {
  totalEvents: number
  criticalAlerts: number
  activeThreats: number
  blockedAttempts: number
  successfulLogins: number
  failedLogins: number
  dataAccessEvents: number
  policyViolations: number
  systemUptime: number
  lastSecurityScan: string
  vulnerabilitiesFound: number
  complianceScore: number
}

export interface SecurityConfiguration {
  passwordPolicy: {
    minLength: number
    requireUppercase: boolean
    requireLowercase: boolean
    requireNumbers: boolean
    requireSpecialChars: boolean
    maxAge: number // days
    preventReuse: number // last N passwords
  }
  sessionPolicy: {
    maxDuration: number // minutes
    idleTimeout: number // minutes
    maxConcurrentSessions: number
    requireReauth: boolean
  }
  rateLimiting: {
    loginAttempts: {
      maxAttempts: number
      windowMinutes: number
      lockoutMinutes: number
    }
    apiRequests: {
      maxRequests: number
      windowMinutes: number
    }
  }
  auditSettings: {
    retentionDays: number
    logLevel: "BASIC" | "DETAILED" | "VERBOSE"
    enableRealTimeAlerts: boolean
  }
  encryptionSettings: {
    algorithm: string
    keyRotationDays: number
    enableDataEncryption: boolean
  }
}
