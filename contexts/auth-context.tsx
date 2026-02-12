"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect } from "react"
import { useRouter } from "next/navigation"
import apiClient from "@/lib/api-client"
import type { AuthState, AuthContextType, LoginCredentials, User } from "@/types/auth"
import { Role, RolePermissions, ROLE_LABELS, ROLE_LEVELS } from "@/types/auth"

const USER_STORAGE_KEY = "kutumb-app-user"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_ERROR"; payload: string }
  | { type: "LOGOUT" }
  | { type: "OTP_SEND_START" }
  | { type: "OTP_SENT"; payload: { mobile: string; badgeNumber?: string } }
  | { type: "OTP_SEND_ERROR"; payload: string }
  | { type: "OTP_VERIFY_START" }
  | { type: "UPDATE_RESEND_TIMER" }

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  otpState: null,
}

const normalizePermissions = (permissions: string[] | undefined): string[] => {
  if (!permissions || permissions.length === 0) return []
  if (permissions.includes("*")) {
    return ["*"] // full access
  }
  return permissions.map((permission) => permission.toLowerCase())
}

const mapUserFromResponse = (rawUser: any): User => {
  const roleKey = (rawUser?.role || Role.CITIZEN) as Role
  const fallbackPermissions = RolePermissions[roleKey] || []
  // Ensure permissions is always an array of strings
  const sanitizedRawPermissions = Array.isArray(rawUser.permissions)
    ? rawUser.permissions.filter((p: any) => typeof p === 'string')
    : []

  if (rawUser.permissions) {
  }

  const permissions = normalizePermissions(sanitizedRawPermissions.length > 0 ? sanitizedRawPermissions : fallbackPermissions)
  const mobile = rawUser?.mobile ?? rawUser?.phone ?? rawUser?.phoneNumber ?? ""
  const displayName =
    rawUser?.name || rawUser?.fullName || rawUser?.email?.split("@")[0] || mobile || "User"

  return {
    ...rawUser,
    id: rawUser?.id,
    email: rawUser?.email,
    name: displayName,
    mobile,
    phone: rawUser?.phone,
    role: roleKey,
    roleLabel: ROLE_LABELS[roleKey],
    roleLevel: ROLE_LEVELS[roleKey],
    permissions,
  }
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "string") return error
  if (error instanceof Error) return error.message
  if (typeof error === "object" && error && "message" in error) {
    return String((error as { message: unknown }).message)
  }
  return "Something went wrong. Please try again."
}

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN_START":
    case "OTP_VERIFY_START":
      return { ...state, isLoading: true, error: null }
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        otpState: null,
      }
    case "LOGIN_ERROR":
    case "OTP_SEND_ERROR":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      }
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        otpState: null,
      }
    case "OTP_SEND_START":
      return { ...state, isLoading: true, error: null }
    case "OTP_SENT":
      return {
        ...state,
        isLoading: false,
        error: null,
        otpState: {
          mobile: action.payload.mobile,
          badgeNumber: action.payload.badgeNumber,
          isOTPSent: true,
          isVerifying: false,
          resendCount: (state.otpState?.resendCount || 0) + 1,
          lastSentAt: Date.now(),
          canResend: false,
        },
      }
    case "UPDATE_RESEND_TIMER":
      if (!state.otpState) return state
      const timeSinceLastSent = Date.now() - (state.otpState.lastSentAt || 0)
      const canResend = timeSinceLastSent > 30000
      return {
        ...state,
        otpState: {
          ...state.otpState,
          canResend,
        },
      }
    default:
      return state
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState)
  const router = useRouter()

  useEffect(() => {
    let isMounted = true;
    let isFetching = false;

    const savedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser)
        if (isMounted) {
          dispatch({ type: "LOGIN_SUCCESS", payload: user })
        }
      } catch {
        localStorage.removeItem(USER_STORAGE_KEY)
      }
    }

    const token = localStorage.getItem("accessToken")
    if (!token) {
      if (isMounted) {
        dispatch({ type: "LOGOUT" })
      }
      return
    }

    const fetchProfile = async () => {
      if (isFetching || !isMounted) return;
      isFetching = true;

      dispatch({ type: "LOGIN_START" })
      try {
        const response = await apiClient.getCurrentUser()
        if (!isMounted) return;

        const formattedUser = mapUserFromResponse(response.data.user)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(formattedUser))
        dispatch({ type: "LOGIN_SUCCESS", payload: formattedUser })
      } catch (error) {
        if (!isMounted) return;

        apiClient.clearTokens()
        localStorage.removeItem(USER_STORAGE_KEY)
        dispatch({ type: "LOGIN_ERROR", payload: getErrorMessage(error) })
      } finally {
        isFetching = false;
      }
    }

    // Always fetch profile to ensure permissions are up to date
    if (token) {
      fetchProfile()
    }

    return () => {
      isMounted = false;
    }
  }, [])

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (!event.key) {
        dispatch({ type: "LOGOUT" })
        return
      }

      if (event.key === USER_STORAGE_KEY) {
        if (!event.newValue) {
          dispatch({ type: "LOGOUT" })
        } else {
          try {
            const parsedUser = JSON.parse(event.newValue)
            dispatch({ type: "LOGIN_SUCCESS", payload: parsedUser })
          } catch {
            dispatch({ type: "LOGOUT" })
          }
        }
      }

      if ((event.key === "accessToken" || event.key === "refreshToken") && !event.newValue) {
        dispatch({ type: "LOGOUT" })
      }
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  useEffect(() => {
    if (state.otpState?.isOTPSent) {
      const interval = setInterval(() => {
        dispatch({ type: "UPDATE_RESEND_TIMER" })
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [state.otpState?.isOTPSent])

  const sendOTP = async (mobile: string) => {
    dispatch({ type: "OTP_SEND_START" })

    try {
      if (!/^[6-9]\d{9}$/.test(mobile)) {
        throw new Error("Please enter a valid 10-digit mobile number")
      }

      await apiClient.sendOTP(mobile)
      dispatch({ type: "OTP_SENT", payload: { mobile } })
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch({ type: "OTP_SEND_ERROR", payload: message })
      throw new Error(message)
    }
  }

  const resendOTP = async () => {
    if (state.otpState?.badgeNumber) {
      await apiClient.sendOfficerOTP(state.otpState.badgeNumber)
    } else if (state.otpState?.mobile) {
      await sendOTP(state.otpState.mobile)
    }
  }

  const login = async (credentials: LoginCredentials) => {
    if (credentials.identifier && credentials.password) {
      dispatch({ type: "LOGIN_START" })
      try {
        const result = await apiClient.login(credentials.identifier, credentials.password)

        if (result.success || result.data?.user) {
          const userPayload = result.data?.user || result.user
          const formattedUser = mapUserFromResponse(userPayload)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(formattedUser))
          localStorage.setItem("userType", formattedUser.role === Role.CITIZEN ? "citizen" : "admin")
          dispatch({ type: "LOGIN_SUCCESS", payload: formattedUser })
        } else {
          throw new Error(result.error?.message || "Login failed")
        }
      } catch (error) {
        const message = getErrorMessage(error)
        dispatch({ type: "LOGIN_ERROR", payload: message })
        throw new Error(message)
      }
    } else if (credentials.otp && state.otpState?.mobile) {
      await verifyOTP(state.otpState.mobile, credentials.otp)
    } else if (credentials.mobile) {
      await sendOTP(credentials.mobile)
    }
  }

  const verifyOTP = async (mobile: string, otp: string) => {
    dispatch({ type: "OTP_VERIFY_START" })
    try {
      const result = await apiClient.verifyOTP(mobile, otp)
      const userPayload = result.data?.user ?? result.user ?? result?.data?.data?.user
      if (!userPayload) {
        throw new Error(result.message || "Unable to verify credentials")
      }
      const formattedUser = mapUserFromResponse(userPayload)
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(formattedUser))
      localStorage.setItem("userType", formattedUser.role === Role.CITIZEN ? "citizen" : "admin")
      dispatch({ type: "LOGIN_SUCCESS", payload: formattedUser })
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch({ type: "LOGIN_ERROR", payload: message })
      throw new Error(message)
    }
  }

  const loginAsOfficer = async (credentials: { badgeNumber: string; otp?: string }) => {
    if (credentials.otp) {
      // Verify OTP
      dispatch({ type: "OTP_VERIFY_START" })
      try {
        const result = await apiClient.verifyOfficerOTP(credentials.badgeNumber, credentials.otp)
        const userPayload = result.data?.user ?? result.user ?? result?.data?.data?.user
        if (!userPayload) {
          throw new Error(result.message || "Unable to verify credentials")
        }
        const formattedUser = mapUserFromResponse(userPayload)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(formattedUser))
        localStorage.setItem("userType", formattedUser.role === Role.CITIZEN ? "citizen" : "admin")
        dispatch({ type: "LOGIN_SUCCESS", payload: formattedUser })
      } catch (error) {
        const message = getErrorMessage(error)
        dispatch({ type: "LOGIN_ERROR", payload: message })
        throw new Error(message)
      }
    } else {
      // Send OTP
      dispatch({ type: "OTP_SEND_START" })
      try {
        await apiClient.sendOfficerOTP(credentials.badgeNumber)
        dispatch({ type: "OTP_SENT", payload: { mobile: "", badgeNumber: credentials.badgeNumber } })
      } catch (error) {
        const message = getErrorMessage(error)
        dispatch({ type: "OTP_SEND_ERROR", payload: message })
        throw new Error(message)
      }
    }
  }

  const logout = async () => {
    const role = state.user?.role
    // Prefer explicitly stored user type, fallback to role from state
    const savedUserType = localStorage.getItem("userType")

    try {
      await apiClient.logout()
    } catch {
      // ignore logout errors
    } finally {
      apiClient.clearTokens()
      localStorage.removeItem(USER_STORAGE_KEY)
      localStorage.removeItem("userType")
      dispatch({ type: "LOGOUT" })

      if (savedUserType === "citizen" || role === Role.CITIZEN) {
        router.push("/citizen-portal/login")
      } else {
        router.push("/admin/login")
      }
    }
  }

  const checkPermission = (resource: string, action: string): boolean => {
    if (!state.user) return false
    if (state.user.role === Role.SUPER_ADMIN) return true
    const permissionCode = `${resource}.${action}`.toLowerCase()
    const permissions = state.user.permissions || []
    if (permissions.includes("*")) return true
    return permissions.includes(permissionCode)
  }

  /**
   * NEW: Check permission by code (e.g., "citizens.read")
   * Supports dynamic permission system
   */
  const checkPermissionByCode = (permissionCode: string): boolean => {
    if (!state.user) return false
    if (state.user.role === Role.SUPER_ADMIN) return true
    const permissions = state.user.permissions || []
    if (permissions.includes("*")) return true
    return permissions.some(p => typeof p === 'string' && p.toLowerCase() === permissionCode.toLowerCase())
  }

  const loginCitizen = async (credentials: { mobileNumber: string; password: string }) => {
    dispatch({ type: "LOGIN_START" })
    try {
      const result = await apiClient.loginCitizen(credentials)
      if (result.success) {
        // Fetch profile to get user details since loginCitizen might not return full user object in same format
        const profileResult = await apiClient.getCurrentUser()
        if (profileResult.success && profileResult.data?.user) {
          const formattedUser = mapUserFromResponse(profileResult.data.user)
          localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(formattedUser))
          dispatch({ type: "LOGIN_SUCCESS", payload: formattedUser })
        } else {
          // Fallback if profile fetch fails but login succeeded (shouldn't happen usually)
          // We might need to construct a basic user object or throw
          throw new Error("Failed to retrieve user profile")
        }
      } else {
        throw new Error(result.message || "Login failed")
      }
    } catch (error) {
      const message = getErrorMessage(error)
      dispatch({ type: "LOGIN_ERROR", payload: message })
      throw new Error(message)
    }
  }

  const contextValue: AuthContextType = {
    ...state,
    login,
    logout,
    hasPermission: checkPermission,
    checkPermission: checkPermissionByCode, // NEW: Dynamic permission check
    sendOTP,
    verifyOTP,
    resendOTP,
    loginAsOfficer,
    loginCitizen,
    loginWithOTP: verifyOTP,
  }

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
