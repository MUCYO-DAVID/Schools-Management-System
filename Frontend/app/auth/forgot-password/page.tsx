'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { School, ArrowLeft, Mail } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function ForgotPasswordPage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com'
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(`${backendUrl}/api/auth/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send reset link')
      }

      setSuccess(true)
      localStorage.setItem('resetEmail', email)
      
      // Redirect to reset password page after 3 seconds
      setTimeout(() => {
        router.push('/auth/reset-password')
      }, 3000)
    } catch (err: any) {
      setError(err.message || 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-lg border-primary/10">
            <CardContent className="pt-12 text-center">
              <div className="flex justify-center mb-4">
                <div className="p-4 bg-green-100 rounded-full">
                  <Mail className="w-8 h-8 text-green-600" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Check your email</h2>
              <p className="text-muted-foreground mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <Alert
                variant="info"
                title="What's next?"
                description="Click the link in your email to reset your password. The link expires in 24 hours."
              />
              <div className="mt-8 space-y-3">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full"
                  onClick={() => setSuccess(false)}
                >
                  Didn't receive the email? Try again
                </Button>
                <Link href="/auth/login">
                  <Button variant="ghost" size="md" className="w-full">
                    Back to login
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link href="/auth/login" className="inline-flex items-center gap-2 text-primary hover:underline mb-6">
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>

        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="p-3 bg-primary/10 rounded-lg">
            <School className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">SchoolHub</h1>
            <p className="text-muted-foreground text-sm mt-1">Reset your password</p>
          </div>
        </div>

        {/* Forgot Password Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <CardDescription>
              Enter your email address and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert
                variant="error"
                title="Error"
                description={error}
                closeable
                onClose={() => setError('')}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full"
              >
                Send Reset Link
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-card text-muted-foreground">Remember your password?</span>
                </div>
              </div>

              <Link href="/auth/login">
                <Button type="button" variant="outline" size="md" className="w-full">
                  Return to Login
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="text-center text-xs text-muted-foreground mt-6">
          Need help? Contact{' '}
          <a href="mailto:support@schoolhub.rw" className="text-primary hover:underline">
            support@schoolhub.rw
          </a>
        </p>
      </div>
    </div>
  )
}
