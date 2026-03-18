'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../providers/AuthProvider'
import Link from 'next/link'
import { Shield, School, Clock, Loader } from 'lucide-react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import Alert from '@/components/ui/Alert'

export default function VerifyCodePage() {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [emailForVerification, setEmailForVerification] = useState<string | null>(null)
  const [requiresLeaderQuestions, setRequiresLeaderQuestions] = useState(false)
  const [leaderAnswer1, setLeaderAnswer1] = useState('')
  const [leaderAnswer2, setLeaderAnswer2] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)
  const router = useRouter()
  const { login } = useAuth()

  useEffect(() => {
    // In a real application, you'd likely get the email from a secure session or context
    // For this example, we'll assume it's passed via localStorage or a query param
    const storedEmail = localStorage.getItem('userEmailForVerification');
    const requiresLeader = localStorage.getItem('requiresLeaderQuestions') === 'true';
    
    if (storedEmail) {
      setEmailForVerification(storedEmail);
      setRequiresLeaderQuestions(requiresLeader);
    } else {
      // If no email is found, redirect back to sign-in
      router.push('/auth/signin');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    if (!emailForVerification) {
      setError('Email not found for verification. Please sign in again.')
      setIsLoading(false)
      return
    }

    try {
      let requestBody: any = { email: emailForVerification }

      if (requiresLeaderQuestions) {
        if (!leaderAnswer1.trim() || !leaderAnswer2.trim()) {
          setError('Please answer both verification questions.')
          setIsLoading(false)
          return
        }
        requestBody.leaderAnswers = {
          answer1: leaderAnswer1,
          answer2: leaderAnswer2,
        }
      } else {
        if (!code.trim()) {
          setError('Please enter the verification code.')
          setIsLoading(false)
          return
        }
        requestBody.code = code
      }

      const response = await fetch(`${backendUrl}/api/auth/verify-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Verification failed')
      }

      const { token, user } = await response.json()
      login(token, user)

      localStorage.removeItem('userEmailForVerification')
      localStorage.removeItem('requiresLeaderQuestions')

      const redirectPath = localStorage.getItem('redirectAfterVerification')
      localStorage.removeItem('redirectAfterVerification')

      const loginRedirect = localStorage.getItem('redirectAfterLogin')
      localStorage.removeItem('redirectAfterLogin')

      const finalRedirect = redirectPath || loginRedirect
      if (finalRedirect) {
        router.push(finalRedirect)
      } else if (user.role === 'admin') {
        router.push('/admin')
      } else if (user.role === 'leader') {
        router.push('/schools')
      } else if (user.role === 'student') {
        router.push('/student')
      } else {
        router.push('/home')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred during verification')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResendCode = async () => {
    setError('')
    if (!emailForVerification) {
      setError('Email not found to resend code.')
      return
    }

    if (requiresLeaderQuestions) {
      setError('Please answer the verification questions above.')
      return
    }

    setResendLoading(true)

    try {
      const response = await fetch(`${backendUrl}/api/auth/resend-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: emailForVerification }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to resend code')
      }

      setResendCooldown(60)
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred while resending code')
    } finally {
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4">
      <div className="w-full max-w-md">
        {/* Logo Section */}
        <div className="flex flex-col items-center gap-3 mb-8 text-center">
          <div className="p-3 bg-primary/10 rounded-lg">
            <School className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">SchoolHub</h1>
            <p className="text-muted-foreground text-sm mt-1">
              {requiresLeaderQuestions ? 'Leadership Verification' : 'Email Verification'}
            </p>
          </div>
        </div>

        {/* Verification Card */}
        <Card className="shadow-lg border-primary/10">
          <CardHeader className="space-y-2">
            <div className="flex items-center gap-2">
              {requiresLeaderQuestions ? (
                <Shield className="w-5 h-5 text-primary" />
              ) : (
                <Clock className="w-5 h-5 text-primary" />
              )}
              <CardTitle className="text-2xl">
                {requiresLeaderQuestions ? 'Verify Leadership' : 'Verify Email'}
              </CardTitle>
            </div>
            <CardDescription>
              {requiresLeaderQuestions
                ? 'Answer the verification questions to confirm your leadership role'
                : `A verification code has been sent to ${emailForVerification || 'your email'}`}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert
                variant="error"
                title="Verification Error"
                description={error}
                closeable
                onClose={() => setError('')}
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {requiresLeaderQuestions ? (
                <>
                  <Input
                    label="What is your primary responsibility at the school?"
                    placeholder="e.g., School management, Leadership"
                    value={leaderAnswer1}
                    onChange={(e) => setLeaderAnswer1(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Input
                    label="Are you authorized to manage school information?"
                    placeholder="Yes or No"
                    value={leaderAnswer2}
                    onChange={(e) => setLeaderAnswer2(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </>
              ) : (
                <Input
                  label="Verification Code"
                  placeholder="Enter the 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  disabled={isLoading}
                  maxLength={6}
                />
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={isLoading}
                className="w-full"
              >
                {isLoading
                  ? 'Verifying...'
                  : requiresLeaderQuestions
                    ? 'Verify Leadership'
                    : 'Verify Code'}
              </Button>

              {!requiresLeaderQuestions && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-2">Didn't receive the code?</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={resendCooldown > 0 || resendLoading}
                    onClick={handleResendCode}
                    className="w-full"
                  >
                    {resendCooldown > 0
                      ? `Resend in ${resendCooldown}s`
                      : resendLoading
                        ? 'Sending...'
                        : 'Resend Code'}
                  </Button>
                </div>
              )}

              <Link href="/auth/login">
                <Button type="button" variant="outline" size="md" className="w-full">
                  Back to Login
                </Button>
              </Link>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
