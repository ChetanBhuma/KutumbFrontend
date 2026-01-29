"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield, Loader2, Smartphone, ArrowLeft } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const demoUsers = [
  { role: "Super Admin", phone: "9999999999" },
  { role: "HQ Admin", phone: "9876543210" },
  { role: "Officer (DCP)", phone: "9876543211" },
  { role: "Officer (SHO)", phone: "9876543212" },
  { role: "Viewer", phone: "9876543213" },
  { role: "Citizen", phone: "9876543214" },
]

export function LoginForm() {
  const [mobile, setMobile] = useState("")
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(0)
  const { login, isLoading, error, otpState, resendOTP } = useAuth()

  // Resend timer countdown
  useEffect(() => {
    if (otpState?.lastSentAt) {
      const updateTimer = () => {
        const elapsed = Math.floor((Date.now() - otpState.lastSentAt!) / 1000)
        const remaining = Math.max(0, 30 - elapsed)
        setResendTimer(remaining)
      }

      updateTimer()
      const interval = setInterval(updateTimer, 1000)
      return () => clearInterval(interval)
    }
  }, [otpState?.lastSentAt])

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ mobile })
    } catch {
      // error handled via context state
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await login({ mobile, otp })
    } catch {
      // error handled via context state
    }
  }

  const handleResendOTP = async () => {
    try {
      await resendOTP()
      setOtp("")
    } catch {
      // ignore
    }
  }

  const handleBack = () => {
    setMobile("")
    setOtp("")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-primary rounded-full">
              <Shield className="h-8 w-8 text-primary-foreground" />
            </div>
          </div>

          <CardTitle className="text-2xl font-bold">Kutumb App</CardTitle>
          <CardDescription>
            {otpState?.isOTPSent
              ? "Enter the OTP sent to your mobile"
              : "Delhi Police - Senior Citizens Welfare Portal"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!otpState?.isOTPSent ? (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Enter 10-digit mobile number"
                    className="pl-10"
                    required
                    disabled={isLoading}
                    maxLength={10}
                  />
                </div>
                <p className="text-xs text-muted-foreground">We'll send you a 6-digit OTP to verify your identity</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || mobile.length !== 10}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send OTP"
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Button type="button" variant="ghost" size="sm" onClick={handleBack} className="p-1">
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Label htmlFor="otp">Enter OTP</Label>
                </div>
                <Input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="Enter 6-digit OTP"
                  required
                  disabled={isLoading}
                  maxLength={6}
                  className="text-center text-lg tracking-widest"
                />
                <p className="text-xs text-muted-foreground text-center">OTP sent to +91 {mobile}</p>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || otp.length !== 6}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>

              <div className="text-center">
                <Button
                  type="button"
                  variant="link"
                  onClick={handleResendOTP}
                  disabled={resendTimer > 0 || isLoading}
                  className="text-sm"
                >
                  {resendTimer > 0 ? `Resend OTP in ${resendTimer}s` : "Resend OTP"}
                </Button>
              </div>
            </form>
          )}

        </CardContent>
      </Card>
    </div>
  )
}
