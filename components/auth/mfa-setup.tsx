'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { enrollMFA, verifyMFA } from '@/app/auth/actions'
import { QRCodeSVG } from 'qrcode.react'

export function MFASetup({ redirectTo = '/' }: { redirectTo?: string }) {
  const router = useRouter()
  const [step, setStep] = useState<'initial' | 'verify'>('initial')
  const [error, setError] = useState<string>('')
  const [factorId, setFactorId] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [secret, setSecret] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState<string>('')

  const handleSetup = async () => {
    try {
      const result = await enrollMFA()
      if ('error' in result) throw new Error(result.error)
      if (!result.data) throw new Error('Failed to enroll TOTP')
      
      setFactorId(result.data.id)
      setQrCode(result.data.totp.qr_code)
      setSecret(result.data.totp.secret)
      setStep('verify')
    } catch (err: any) {
      setError('Failed to set up MFA. Please try again.')
      console.error('MFA setup error:', err)
    }
  }

  const handleVerify = async () => {
    try {
      const result = await verifyMFA(factorId, verificationCode)
      if ('error' in result) throw new Error(result.error)
      router.push(redirectTo)
    } catch (err: any) {
      setError('Invalid verification code. Please try again.')
      console.error('MFA verification error:', err)
    }
  }

  if (step === 'initial') {
    return (
      <Card className="p-6 max-w-md mx-auto">
        <h2 className="text-2xl font-bold mb-4">Set Up Two-Factor Authentication</h2>
        <p className="mb-4">
          Enhance your account security by setting up two-factor authentication.
          You&apos;ll need an authenticator app like Google Authenticator or Authy.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <Button onClick={handleSetup}>Begin Setup</Button>
      </Card>
    )
  }

  return (
    <Card className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-4">Verify Your Authenticator</h2>
      <div className="mb-4">
        <p className="mb-2">1. Scan this QR code with your authenticator app:</p>
        <div className="flex justify-center mb-4">
          {qrCode && <QRCodeSVG value={qrCode} size={200} />}
        </div>
        <p className="mb-2">Or manually enter this code:</p>
        <code className="block bg-gray-100 p-2 rounded mb-4">{secret}</code>
      </div>
      <div className="mb-4">
        <p className="mb-2">2. Enter the verification code from your app:</p>
        <Label htmlFor="code">Verification Code</Label>
        <Input
          id="code"
          type="text"
          value={verificationCode}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVerificationCode(e.target.value.trim())}
          className="mb-2"
          placeholder="Enter 6-digit code"
        />
      </div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <Button onClick={handleVerify}>Verify and Complete Setup</Button>
    </Card>
  )
}
