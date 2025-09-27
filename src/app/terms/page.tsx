import LegalPage from "@/components/LegalPage";

export const metadata = {
  title: "Terms and Conditions - Finsync",
  description: "Terms and Conditions for Finsync",
};

export default function TermsPage() {
  return (
    <LegalPage
      title="Terms and Conditions for Finsync"
      lastUpdated="September 19, 2025"
      description="Please read these Terms carefully before using the Finsync application and related services."
    >
      <section className="space-y-6">
        <p>Welcome to Finsync!</p>
        <p>
          These Terms and Conditions ("Terms") govern your access to and use of
          the Finsync mobile application and related services (the "Service")
          provided by Finsync Digital Services ("Company", "We", "Us", or
          "Our").
        </p>
        <p>
          By downloading, registering, or using the Service, You ("You", "User")
          agree to be bound by these Terms. If You do not agree, please do not
          use the Service.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">1. Eligibility</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>You must be at least 18 years old to use the Service.</li>
          <li>
            By using the Service, You represent that all information provided is
            accurate and complete.
          </li>
          <li>
            You may be required to provide sensitive identifiers such as Bank
            Verification Number (BVN) and National Identification Number (NIN)
            to verify your identity.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          2. Use of the Service
        </h2>
        <p>
          The Service is provided solely for personal and lawful purposes. You
          agree not to:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            Use the Service for unlawful, fraudulent, or harmful activities.
          </li>
          <li>Share false, misleading, or incomplete information.</li>
          <li>
            Interfere with or disrupt the Service’s security or functionality.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          3. Account Registration and Security
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            You are responsible for maintaining the confidentiality of your
            account credentials.
          </li>
          <li>
            You agree to notify Us immediately of any unauthorized access or
            security breach.
          </li>
          <li>
            We are not liable for losses resulting from unauthorized use of your
            account where You failed to safeguard your login details.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          4. Collection and Use of Data
        </h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>
            By using the Service, You consent to the collection and processing
            of personal data, including BVN and NIN, as outlined in Our Privacy
            Policy.
          </li>
          <li>
            BVN and NIN are collected strictly for identity verification,
            compliance with financial regulations, and fraud prevention.
          </li>
          <li>We do not sell or use BVN/NIN for marketing purposes.</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          5. Third-Party Services
        </h2>
        <p>
          The Service may integrate with licensed financial institutions,
          payment processors, and verification providers. We are not responsible
          for the availability, accuracy, or practices of third-party services.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          6. Intellectual Property
        </h2>
        <p>
          The Service and its content (software, trademarks, logos, etc.) remain
          the property of Finsync Digital Services. You may not copy, modify,
          distribute, or exploit any part of the Service without prior written
          consent.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          7. Limitation of Liability
        </h2>
        <p>
          The Service is provided on an “as is” and “as available” basis. To the
          maximum extent permitted by law, We are not liable for:
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Indirect, incidental, or consequential damages.</li>
          <li>Loss of profits, data, or goodwill.</li>
          <li>
            Errors or interruptions in the Service beyond Our reasonable
            control.
          </li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">8. Termination</h2>
        <p>We may suspend or terminate your account if You:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Violate these Terms,</li>
          <li>Provide false or fraudulent information, or</li>
          <li>Engage in illegal activities through the Service.</li>
        </ul>
        <p>
          Upon termination, your right to use the Service will immediately
          cease.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          9. Governing Law
        </h2>
        <p>
          These Terms shall be governed by and construed under the laws of
          Nigeria.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">
          10. Changes to Terms
        </h2>
        <p>
          We may update these Terms from time to time. Updates will be posted
          within the Service or on our website. Continued use after updates
          constitutes acceptance of the new Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">11. Contact Us</h2>
        <p>If you have questions about these Terms, please contact us:</p>
        <p>
          📧 Email:{" "}
          <a
            href="mailto:finsyncdigitalservice@gmail.com"
            className="underline hover:no-underline"
          >
            finsyncdigitalservice@gmail.com
          </a>
        </p>
      </section>
    </LegalPage>
  );
}
