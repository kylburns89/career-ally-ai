import { PageContainer } from "../../../components/page-container";

export default function TermsOfService() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="space-y-6 text-gray-600">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p>
              By accessing or using Kareerly, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Use License</h2>
            <div className="space-y-4">
              <p>
                Permission is granted to temporarily access the materials (information or software) on Kareerly&apos;s website for personal, non-commercial transitory viewing only.
              </p>
              <p>This license shall automatically terminate if you violate any of these restrictions and may be terminated by Kareerly at any time.</p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
            <div className="space-y-4">
              <p>
                When you create an account with us, you must provide accurate, complete, and current information. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account.
              </p>
              <p>
                You are responsible for safeguarding the password that you use to access the service and for any activities or actions under your password.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Usage</h2>
            <p>You agree not to use Kareerly for any purpose that is prohibited by these Terms. You may not:</p>
            <ul className="list-disc ml-6 mt-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to any portion of the service</li>
              <li>Interfere with or disrupt the service</li>
              <li>Sell, resell, or exploit any portion of the service</li>
              <li>Copy or distribute any part of the service in any medium</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p>
              The service and its original content, features, and functionality are and will remain the exclusive property of Kareerly. The service is protected by copyright, trademark, and other laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Disclaimer</h2>
            <div className="space-y-4">
              <p>
                Your use of Kareerly is at your sole risk. The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The service is provided without warranties of any kind.
              </p>
              <p>
                We do not guarantee that the service will meet your specific requirements, be uninterrupted, timely, secure, or error-free.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p>
              In no event shall Kareerly be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <div className="space-y-4">
              <p>
                We reserve the right to modify or replace these Terms at any time. We will provide notice of any changes by posting the new Terms on this page.
              </p>
              <p>
                Your continued use of the service after any such changes constitutes your acceptance of the new Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p className="mt-2">
              Email: legal@careerally.ai
            </p>
          </section>

          <p className="mt-8">
            Last Updated: January 2024
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
