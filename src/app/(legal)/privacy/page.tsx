import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Tutor Me Good",
  description: "Privacy Policy for Tutor Me Good",
};

export default function PrivacyPage() {
  return (
    <div className="cntainer pox-4 mx-auto max-w-3xl py-8">
      <h1 className="mb-8 text-3xl font-bold">Privacy Policy</h1>

      <p className="lead">
        Your privacy is important to us. This Privacy Policy explains how we
        collect, use, disclose, and safeguard your information when you use
        Tutor Me Good.
      </p>

      <h2 className="text-lg font-bold">1. Information We Collect</h2>
      <p>We collect information that you provide directly to us, including:</p>
      <ul>
        <li>Account information (name, email, password)</li>
        <li>Profile information</li>
        <li>Usage data and learning progress</li>
        <li>Communication preferences</li>
      </ul>

      <h2 className="text-lg font-bold">2. How We Use Your Information</h2>
      <p>We use the information we collect to:</p>
      <ul>
        <li>Provide, maintain, and improve our services</li>
        <li>Process your transactions</li>
        <li>Send you technical notices and support messages</li>
        <li>Communicate with you about products, services, and events</li>
        <li>Monitor and analyze trends and usage</li>
      </ul>

      <h2 className="text-lg font-bold">3. Information Sharing</h2>
      <p>
        We do not sell, trade, or rent your personal information to third
        parties. We may share your information only in the following
        circumstances:
      </p>
      <ul>
        <li>With your consent</li>
        <li>To comply with legal obligations</li>
        <li>To protect our rights and property</li>
      </ul>

      <h2 className="text-lg font-bold">4. Data Security</h2>
      <p>
        We implement appropriate technical and organizational measures to
        protect your personal information against unauthorized access,
        alteration, disclosure, or destruction.
      </p>

      <h2 className="text-lg font-bold">5. Your Rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>Access your personal information</li>
        <li>Correct inaccurate data</li>
        <li>Request deletion of your data</li>
        <li>Object to data processing</li>
        <li>Data portability</li>
      </ul>

      <h2 className="text-lg font-bold">6. Cookies and Tracking</h2>
      <p>
        We use cookies and similar tracking technologies to track activity on
        our Service and hold certain information. You can instruct your browser
        to refuse all cookies or to indicate when a cookie is being sent.
      </p>

      <h2 className="text-lg font-bold">7. Children&apos;s Privacy</h2>
      <p>
        Our Service is not intended for children under 13. We do not knowingly
        collect personal information from children under 13.
      </p>

      <h2 className="text-lg font-bold">8. Changes to This Policy</h2>
      <p>
        We may update our Privacy Policy from time to time. We will notify you
        of any changes by posting the new Privacy Policy on this page and
        updating the &quot;Last updated&quot; date.
      </p>

      <h2 className="text-lg font-bold">9. Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, please contact us
        at privacy@tutormegood.com.
      </p>

      <p className="text-sm text-muted-foreground">
        Last updated: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
