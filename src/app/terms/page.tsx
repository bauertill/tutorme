import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Tutor Me Good",
  description: "Terms of Service for Tutor Me Good",
};

export default function TermsPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold">Terms of Service</h1>

      <div className="">
        <h2 className="text-lg font-bold">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Tutor Me Good (&quot;the Service&quot;), you
          agree to be bound by these Terms of Service. If you do not agree to
          these terms, please do not use the Service.
        </p>

        <h2 className="text-lg font-bold">2. Description of Service</h2>
        <p>
          Tutor Me Good is an online tutoring platform that provides educational
          resources and assistance to users. The Service includes, but is not
          limited to, interactive learning materials, practice exercises, and
          educational content.
        </p>

        <h2 className="text-lg font-bold">3. User Responsibilities</h2>
        <p>You agree to:</p>
        <ul>
          <li>
            Provide accurate and complete information when using the Service
          </li>
          <li>
            Use the Service in compliance with all applicable laws and
            regulations
          </li>
          <li>Maintain the confidentiality of your account credentials</li>
          <li>Not share your account access with others</li>
        </ul>

        <h2 className="text-lg font-bold">4. Intellectual Property</h2>
        <p>
          All content, features, and functionality of the Service are owned by
          Tutor Me Good and are protected by international copyright, trademark,
          and other intellectual property laws.
        </p>

        <h2 className="text-lg font-bold">5. Privacy</h2>
        <p>
          Your use of the Service is also governed by our Privacy Policy. Please
          review our Privacy Policy to understand our practices.
        </p>

        <h2 className="text-lg font-bold">6. Modifications to Service</h2>
        <p>
          We reserve the right to modify or discontinue, temporarily or
          permanently, the Service with or without notice. You agree that we
          shall not be liable to you or any third party for any modification,
          suspension, or discontinuance of the Service.
        </p>

        <h2 className="text-lg font-bold">7. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, Tutor Me Good shall not be
          liable for any indirect, incidental, special, consequential, or
          punitive damages, or any loss of profits or revenues.
        </p>

        <h2 className="text-lg font-bold">8. Governing Law</h2>
        <p>
          These Terms shall be governed by and construed in accordance with the
          laws of the jurisdiction in which Tutor Me Good operates, without
          regard to its conflict of law provisions.
        </p>

        <h2 className="text-lg font-bold">9. Contact Information</h2>
        <p>
          For any questions about these Terms, please contact us at
          support@tutormegood.com.
        </p>

        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
