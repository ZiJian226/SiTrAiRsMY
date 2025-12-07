import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-5xl font-bold mb-8 text-primary">Privacy Policy</h1>
            <p className="text-sm opacity-70 mb-8">Last updated: December 6, 2025</p>

            <div className="prose max-w-none space-y-8">
              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">1. Introduction</h2>
                <p className="opacity-80">
                  Welcome to StarMy ("we," "our," or "us"). We are committed to protecting your personal information
                  and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard
                  your information when you visit our website and use our services.
                </p>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold mb-3">Personal Information</h3>
                <p className="opacity-80 mb-4">
                  We may collect personal information that you provide to us, including:
                </p>
                <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                  <li>Name and contact information (email address)</li>
                  <li>Profile information for VTubers and Artists</li>
                  <li>Commission request details</li>
                  <li>Career application information</li>
                  <li>Payment information (processed securely through third-party providers)</li>
                </ul>

                <h3 className="text-xl font-semibold mb-3 mt-6">Automatically Collected Information</h3>
                <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                  <li>IP address and browser type</li>
                  <li>Device information</li>
                  <li>Usage data and analytics</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">3. How We Use Your Information</h2>
                <p className="opacity-80 mb-4">
                  We use the information we collect to:
                </p>
                <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Improve and personalize user experience</li>
                  <li>Process commission requests and transactions</li>
                  <li>Send administrative information and updates</li>
                  <li>Respond to inquiries and provide customer support</li>
                  <li>Analyze usage patterns and trends</li>
                  <li>Prevent fraud and enhance security</li>
                </ul>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">4. Information Sharing</h2>
                <p className="opacity-80 mb-4">
                  We may share your information in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                  <li><strong>With VTubers and Artists:</strong> When you request a commission or interaction</li>
                  <li><strong>Service Providers:</strong> Third-party vendors who assist in operating our platform</li>
                  <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business Transfers:</strong> In connection with mergers or acquisitions</li>
                </ul>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">5. Data Security</h2>
                <p className="opacity-80">
                  We implement appropriate technical and organizational security measures to protect your personal
                  information. However, no method of transmission over the Internet is 100% secure, and we cannot
                  guarantee absolute security.
                </p>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">6. Your Rights</h2>
                <p className="opacity-80 mb-4">
                  Depending on your location, you may have the following rights:
                </p>
                <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                  <li>Access your personal information</li>
                  <li>Correct inaccurate data</li>
                  <li>Request deletion of your data</li>
                  <li>Object to or restrict processing</li>
                  <li>Data portability</li>
                  <li>Withdraw consent</li>
                </ul>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">7. Cookies</h2>
                <p className="opacity-80">
                  We use cookies and similar tracking technologies to improve your browsing experience, analyze
                  site traffic, and personalize content. You can control cookies through your browser settings.
                </p>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">8. Children's Privacy</h2>
                <p className="opacity-80">
                  Our services are not intended for children under 13 years of age. We do not knowingly collect
                  personal information from children under 13.
                </p>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">9. Changes to This Policy</h2>
                <p className="opacity-80">
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting
                  the new Privacy Policy on this page and updating the "Last updated" date.
                </p>
              </section>

              <section className="card bg-base-200 p-6">
                <h2 className="text-3xl font-bold mb-4 text-secondary">10. Contact Us</h2>
                <p className="opacity-80 mb-4">
                  If you have any questions about this Privacy Policy, please contact us:
                </p>
                <ul className="space-y-2 opacity-80">
                  <li><strong>Email:</strong> privacy@starmy.my</li>
                  <li><strong>Address:</strong> Kuala Lumpur, Malaysia</li>
                </ul>
              </section>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
