import type { SecurityEvent, SecurityAlert, AuditLog, SecurityMetrics, SecurityConfiguration } from "@/types/security"

// Security Configuration
export const defaultSecurityConfig: SecurityConfiguration = {
  passwordPolicy: {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    maxAge: 90,
    preventReuse: 5,
  },
  sessionPolicy: {
    maxDuration: 480, // 8 hours
    idleTimeout: 30, // 30 minutes
    maxConcurrentSessions: 3,
    requireReauth: true,
  },
  rateLimiting: {
    loginAttempts: {
      maxAttempts: 5,
      windowMinutes: 15,
      lockoutMinutes: 30,
    },
    apiRequests: {
      maxRequests: 100,
      windowMinutes: 1,
    },
  },
  auditSettings: {
    retentionDays: 365,
    logLevel: "DETAILED",
    enableRealTimeAlerts: true,
  },
  encryptionSettings: {
    algorithm: "AES-256-GCM",
    keyRotationDays: 90,
    enableDataEncryption: true,
  },
}

// Mock Security Data
export const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "evt-001",
    type: "LOGIN_SUCCESS",
    severity: "LOW",
    userId: "1",
    userEmail: "admin@delhipolice.gov.in",
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    details: { loginMethod: "password" },
    timestamp: "2024-01-25T09:30:00Z",
    sessionId: "sess-001",
    location: { country: "India", region: "Delhi", city: "New Delhi" },
  },
  {
    id: "evt-002",
    type: "LOGIN_FAILURE",
    severity: "MEDIUM",
    userEmail: "unknown@example.com",
    ipAddress: "203.0.113.45",
    userAgent: "curl/7.68.0",
    details: { reason: "invalid_credentials", attempts: 3 },
    timestamp: "2024-01-25T10:15:00Z",
    location: { country: "Unknown", region: "Unknown", city: "Unknown" },
  },
  {
    id: "evt-003",
    type: "ACCESS_DENIED",
    severity: "HIGH",
    userId: "2",
    userEmail: "sho@delhipolice.gov.in",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    resource: "users",
    action: "DELETE",
    details: { reason: "insufficient_permissions" },
    timestamp: "2024-01-25T11:00:00Z",
    sessionId: "sess-002",
  },
  {
    id: "evt-004",
    type: "SECURITY_VIOLATION",
    severity: "CRITICAL",
    ipAddress: "198.51.100.25",
    userAgent: "sqlmap/1.6.12",
    details: {
      violationType: "sql_injection_attempt",
      payload: "' OR 1=1 --",
      blockedBy: "WAF",
    },
    timestamp: "2024-01-25T12:30:00Z",
  },
]

export const mockSecurityAlerts: SecurityAlert[] = [
  {
    id: "alert-001",
    type: "BRUTE_FORCE",
    severity: "HIGH",
    title: "Multiple Failed Login Attempts",
    description: "Detected 15 failed login attempts from IP 203.0.113.45 in the last 10 minutes",
    affectedUsers: [],
    affectedResources: ["authentication"],
    detectedAt: "2024-01-25T10:20:00Z",
    status: "OPEN",
    metadata: {
      sourceIP: "203.0.113.45",
      attemptCount: 15,
      timeWindow: "10 minutes",
      actionTaken: "IP temporarily blocked",
    },
  },
  {
    id: "alert-002",
    type: "SUSPICIOUS_ACTIVITY",
    severity: "MEDIUM",
    title: "Unusual Access Pattern",
    description: "User accessing system from new location and device",
    affectedUsers: ["sho@delhipolice.gov.in"],
    affectedResources: ["citizens", "reports"],
    detectedAt: "2024-01-25T14:45:00Z",
    status: "INVESTIGATING",
    assignedTo: "Security Team",
    metadata: {
      newLocation: "Gurgaon, Haryana",
      previousLocation: "New Delhi, Delhi",
      newDevice: "Mobile Device",
      riskScore: 65,
    },
  },
  {
    id: "alert-003",
    type: "POLICY_VIOLATION",
    severity: "LOW",
    title: "Password Policy Violation",
    description: "User attempted to set weak password",
    affectedUsers: ["officer@delhipolice.gov.in"],
    affectedResources: ["user_management"],
    detectedAt: "2024-01-25T16:00:00Z",
    status: "RESOLVED",
    resolvedAt: "2024-01-25T16:05:00Z",
    resolution: "User educated on password policy and required to set compliant password",
    metadata: {
      violationType: "weak_password",
      passwordStrength: "weak",
      policyRequirement: "minimum 12 characters with mixed case, numbers, and symbols",
    },
  },
]

export const mockAuditLogs: AuditLog[] = [
  {
    id: "audit-001",
    userId: "1",
    userEmail: "admin@delhipolice.gov.in",
    action: "CREATE",
    resource: "citizen",
    resourceId: "CTZ004",
    newValue: { name: "New Senior Citizen", status: "PENDING" },
    ipAddress: "192.168.1.100",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: "2024-01-25T09:45:00Z",
    sessionId: "sess-001",
    success: true,
    metadata: { module: "kutumb_app_citizens" },
  },
  {
    id: "audit-002",
    userId: "2",
    userEmail: "sho@delhipolice.gov.in",
    action: "UPDATE",
    resource: "citizen",
    resourceId: "CTZ001",
    oldValue: { riskScore: 25 },
    newValue: { riskScore: 30 },
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: "2024-01-25T11:30:00Z",
    sessionId: "sess-002",
    success: true,
    metadata: { module: "kutumb_app_citizens", reason: "welfare_assessment_update" },
  },
  {
    id: "audit-003",
    userId: "2",
    userEmail: "sho@delhipolice.gov.in",
    action: "DELETE",
    resource: "user",
    resourceId: "USR005",
    ipAddress: "192.168.1.101",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    timestamp: "2024-01-25T13:15:00Z",
    sessionId: "sess-002",
    success: false,
    errorMessage: "Insufficient permissions to delete user",
    metadata: { module: "user_management", attemptedAction: "delete_user" },
  },
]

// Security Utility Functions
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = []
  const config = defaultSecurityConfig.passwordPolicy

  if (password.length < config.minLength) {
    errors.push(`Password must be at least ${config.minLength} characters long`)
  }

  if (config.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter")
  }

  if (config.requireLowercase && !/[a-z]/.test(password)) {
    errors.push("Password must contain at least one lowercase letter")
  }

  if (config.requireNumbers && !/\d/.test(password)) {
    errors.push("Password must contain at least one number")
  }

  if (config.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push("Password must contain at least one special character")
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, "") // Remove potential HTML tags
    .replace(/['"]/g, "") // Remove quotes
    .replace(/[;]/g, "") // Remove semicolons
    .trim()
}

export function generateSecurityToken(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function calculateRiskScore(events: SecurityEvent[]): number {
  let score = 0
  events.forEach((event) => {
    switch (event.severity) {
      case "LOW":
        score += 1
        break
      case "MEDIUM":
        score += 3
        break
      case "HIGH":
        score += 7
        break
      case "CRITICAL":
        score += 15
        break
    }
  })
  return Math.min(score, 100)
}

export function getSecurityMetrics(): SecurityMetrics {
  return {
    totalEvents: mockSecurityEvents.length,
    criticalAlerts: mockSecurityAlerts.filter((alert) => alert.severity === "CRITICAL").length,
    activeThreats: mockSecurityAlerts.filter((alert) => alert.status === "OPEN").length,
    blockedAttempts: mockSecurityEvents.filter((event) => event.type === "LOGIN_FAILURE").length,
    successfulLogins: mockSecurityEvents.filter((event) => event.type === "LOGIN_SUCCESS").length,
    failedLogins: mockSecurityEvents.filter((event) => event.type === "LOGIN_FAILURE").length,
    dataAccessEvents: mockSecurityEvents.filter((event) => event.type === "DATA_ACCESS").length,
    policyViolations: mockSecurityAlerts.filter((alert) => alert.type === "POLICY_VIOLATION").length,
    systemUptime: 99.8,
    lastSecurityScan: "2024-01-25T08:00:00Z",
    vulnerabilitiesFound: 2,
    complianceScore: 94,
  }
}

export function logSecurityEvent(event: Omit<SecurityEvent, "id" | "timestamp">): void {
  const securityEvent: SecurityEvent = {
    ...event,
    id: generateSecurityToken(),
    timestamp: new Date().toISOString(),
  }

  // In a real implementation, this would send to a security monitoring system


  // Check if event should trigger an alert
  if (event.severity === "CRITICAL" || event.type === "SECURITY_VIOLATION") {
    // Trigger immediate alert

  }
}

export function logAuditEvent(event: Omit<AuditLog, "id" | "timestamp">): void {
  const auditEvent: AuditLog = {
    ...event,
    id: generateSecurityToken(),
    timestamp: new Date().toISOString(),
  }

  // In a real implementation, this would be stored in an audit database

}
