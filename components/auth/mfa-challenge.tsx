'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { verifyMFA } from '@/app/auth/actions'
import type { FactorList } from '@/types/auth'

interface MFAChallengeProps {
  factors: FactorList
  redirectTo?: string
}

export function MFAChallenge({ factors, redirectTo = '/' }: MFAChallengeProps) {
  const router = useRouter()
  const [error, setError] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')
  const [loading, setLoading] = useState(false)

  // Use the first available TOTP factor
  const factor = factors.totp[0]

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      setError('Please enter a verification code')
      return
    }

    setLoading(true)
    try {
      if (!factor) throw new Error('No TOTP factor available')
      const { error: verifyError } = await verifyMFA(factor.id, verificationCode.trim())
      if (verifyError) throw new Error(verifyError)
      router.push(redirectTo)
    } catch (err: any) {
      setError('Invalid verification code. Please try again.')
      console.error('MFA verification error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleVerify()
    }
  }

  if (!factor) {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Error</h2>
        <p className="text-red-500">No authentication factors found. Please contact support.</p>
      </Card>
    )
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Two-Factor Authentication Required</h2>
      <p className="mb-6 text-gray-600">
        Please enter the verification code from your authenticator app to continue.
      </p>
      
      <div className="space-y-4">
        <div>
          <Label htmlFor="code">Verification Code</Label>
          <Input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={verificationCode}
            onChange={(e) => {
              setError('')
              setVerificationCode(e.target.value.trim())
            }}
            onKeyPress={handleKeyPress}
            placeholder="Enter 6-digit code"
            className="text-center text-2xl tracking-wide"
            maxLength={6}
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm">{error}</div>
        )}

        <Button 
          onClick={handleVerify} 
          disabled={loading || !verificationCode.trim()}
          className="w-full"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              <span>Verifying...</span>
            </div>
          ) : (
            'Verify'
          )}
        </Button>

        <p className="text-sm text-gray-500 text-center mt-4">
          Having trouble? Contact support for assistance.
        </p>
      </div>
    </Card>
  )
}
