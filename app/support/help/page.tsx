import { PageContainer } from "../../../components/page-container";

export default function HelpCenter() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Help Center</h1>
        
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-medium mb-2">How do I get started?</h3>
                <p className="text-gray-600">
                  Getting started with Career Ally AI is easy. Simply sign up for an account and you&apos;ll have access to all our career development tools including resume building, interview preparation, and job tracking features.
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">What features are available?</h3>
                <p className="text-gray-600">
                  Our platform offers comprehensive career development tools including:
                </p>
                <ul className="list-disc ml-6 mt-2 text-gray-600">
                  <li>Resume builder and analyzer</li>
                  <li>Cover letter generator</li>
                  <li>Interview simulator</li>
                  <li>Job application tracker</li>
                  <li>Technical challenge practice</li>
                  <li>Salary negotiation coach</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">How can I get support?</h3>
                <p className="text-gray-600">
                  If you need assistance, you can reach our support team at support@careerally.ai. We typically respond within 24 hours during business days.
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-gray-600 mb-4">
              Have a question that&apos;s not answered above? We&apos;re here to help!
            </p>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="font-medium mb-2">Email Support:</p>
              <p className="text-gray-600">support@careerally.ai</p>
              
              <p className="font-medium mb-2 mt-4">Business Hours:</p>
              <p className="text-gray-600">Monday - Friday: 9:00 AM - 5:00 PM PST</p>
            </div>
          </section>
        </div>
      </div>
    </PageContainer>
  );
}
