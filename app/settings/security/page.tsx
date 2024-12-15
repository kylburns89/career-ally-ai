import { getAuthLevel, listFactors } from '@/lib/auth'
import { MFAManagement } from '../../../components/auth/mfa-management'
import { MFASetup } from '../../../components/auth/mfa-setup'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react'

export default async function SecuritySettingsPage() {
  const { currentLevel } = await getAuthLevel()
  const factors = await listFactors()
  
  const hasMFA = factors.totp.length > 0 || factors.phone.length > 0
  const isMFAVerified = currentLevel === 'aal2'

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-2">
        <Shield className="h-8 w-8" />
        <h1 className="text-3xl font-bold">Security Settings</h1>
      </div>
      <p className="text-gray-600 mb-8">
        Manage your account security settings and two-factor authentication.
      </p>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">Two-Factor Authentication</h2>
          <p className="text-gray-600 mb-4">
            Add an extra layer of security to your account by enabling two-factor authentication.
          </p>
          
          <div className="mb-6">
            <div className="flex items-center space-x-2">
              {hasMFA ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500" />
              )}
              <span className="font-medium">
                {hasMFA ? 'MFA is enabled' : 'MFA is not enabled'}
              </span>
            </div>
            
            {hasMFA && !isMFAVerified && (
              <div className="flex items-start space-x-2 mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-yellow-800">Verification Required</p>
                  <p className="text-yellow-700 text-sm">
                    Your MFA setup needs to be verified. Please complete the verification process.
                  </p>
                </div>
              </div>
            )}
          </div>

          <Separator className="my-6" />

          {!hasMFA ? (
            <div>
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
                <h3 className="font-medium text-blue-900 mb-2">Why enable two-factor authentication?</h3>
                <ul className="list-disc list-inside text-blue-800 text-sm space-y-1">
                  <li>Protect against unauthorized access even if your password is compromised</li>
                  <li>Receive alerts when someone tries to access your account</li>
                  <li>Meet security best practices for sensitive operations</li>
                </ul>
              </div>
              <MFASetup redirectTo="/settings/security" />
            </div>
          ) : (
            <MFAManagement />
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">Recent Security Activity</h2>
          <p className="text-gray-600 mb-4">
            Monitor recent security-related activities on your account.
          </p>
          <div className="text-sm text-gray-500 italic">
            Security activity logging will be available soon.
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-2xl font-bold mb-2">Security Recommendations</h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              {hasMFA ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-1" />
              )}
              <div>
                <p className="font-medium">Two-Factor Authentication</p>
                <p className="text-gray-600 text-sm">
                  {hasMFA 
                    ? 'Your account is protected with two-factor authentication.'
                    : 'Enable two-factor authentication to add an extra layer of security.'}
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Secure Password</p>
                <p className="text-gray-600 text-sm">
                  Your password meets our security requirements.
                </p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle className="h-5 w-5 text-green-500 mt-1" />
              <div>
                <p className="font-medium">Email Verification</p>
                <p className="text-gray-600 text-sm">
                  Your email address has been verified.
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
