import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-base-100 flex flex-col">
      <Navbar />

      <Container className="py-12 flex-grow">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-8 text-primary">Terms of Service</h1>
          <p className="text-sm opacity-70 mb-8">Last updated: December 6, 2025</p>

          <div className="prose max-w-none space-y-8">
            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">1. Acceptance of Terms</h2>
              <p className="opacity-80">
                By accessing and using StarMy ("the Platform"), you accept and agree to be bound by these Terms of Service
                and our Privacy Policy. If you do not agree to these terms, please do not use our services.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">2. Description of Service</h2>
              <p className="opacity-80 mb-4">
                StarMy provides a platform that:
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Connects VTubers with their audience</li>
                <li>Showcases artists and their portfolios</li>
                <li>Facilitates commission requests between users and artists</li>
                <li>Provides news and community updates</li>
                <li>Offers career opportunities within the community</li>
              </ul>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">3. User Accounts</h2>
              <h3 className="text-xl font-semibold mb-3">Registration</h3>
              <p className="opacity-80 mb-4">
                To access certain features, you may need to create an account. You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Provide accurate and complete information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized access</li>
                <li>Be responsible for all activities under your account</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Account Termination</h3>
              <p className="opacity-80">
                We reserve the right to suspend or terminate accounts that violate these terms or engage in
                fraudulent, abusive, or illegal activities.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">4. User Content and Conduct</h2>
              <h3 className="text-xl font-semibold mb-3">Acceptable Use</h3>
              <p className="opacity-80 mb-4">
                You agree not to:
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Post illegal, harmful, or offensive content</li>
                <li>Harass, threaten, or intimidate other users</li>
                <li>Infringe on intellectual property rights</li>
                <li>Engage in spam or unauthorized advertising</li>
                <li>Attempt to hack or disrupt the platform</li>
                <li>Impersonate others or misrepresent your identity</li>
              </ul>

              <h3 className="text-xl font-semibold mb-3 mt-6">Content License</h3>
              <p className="opacity-80">
                By posting content on StarMy, you grant us a non-exclusive, worldwide, royalty-free license to
                use, display, and distribute your content on the platform.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">5. Commission Agreements</h2>
              <p className="opacity-80 mb-4">
                StarMy facilitates connections between users and artists but is not party to commission agreements.
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Commission terms are between the client and artist</li>
                <li>Payment disputes should be resolved directly between parties</li>
                <li>StarMy is not responsible for the quality or delivery of commissioned work</li>
                <li>Users should maintain clear communication and documented agreements</li>
              </ul>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">6. Intellectual Property</h2>
              <p className="opacity-80 mb-4">
                All content on StarMy, including but not limited to:
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Platform design and functionality</li>
                <li>StarMy branding and logos</li>
                <li>Original content created by StarMy</li>
              </ul>
              <p className="opacity-80 mt-4">
                ...are owned by StarMy or our licensors and protected by copyright and trademark laws.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">7. Payment and Fees</h2>
              <p className="opacity-80 mb-4">
                Currently, StarMy is free to use for basic features. We reserve the right to:
              </p>
              <ul className="list-disc list-inside space-y-2 opacity-80 ml-4">
                <li>Introduce premium features with associated fees</li>
                <li>Charge commission fees on transactions facilitated through the platform</li>
                <li>Modify pricing with advance notice to users</li>
              </ul>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">8. Disclaimers and Limitations</h2>
              <h3 className="text-xl font-semibold mb-3">Service "As Is"</h3>
              <p className="opacity-80 mb-4">
                StarMy is provided "as is" without warranties of any kind, express or implied.
              </p>

              <h3 className="text-xl font-semibold mb-3">Limitation of Liability</h3>
              <p className="opacity-80">
                To the maximum extent permitted by law, StarMy shall not be liable for any indirect, incidental,
                special, or consequential damages arising from your use of the platform.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">9. Indemnification</h2>
              <p className="opacity-80">
                You agree to indemnify and hold StarMy harmless from any claims, damages, or expenses arising from
                your use of the platform, violation of these terms, or infringement of any third-party rights.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">10. Governing Law</h2>
              <p className="opacity-80">
                These Terms shall be governed by and construed in accordance with the laws of Malaysia, without
                regard to its conflict of law provisions.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">11. Changes to Terms</h2>
              <p className="opacity-80">
                We reserve the right to modify these Terms at any time. We will notify users of significant changes
                via email or platform notification. Continued use of StarMy after changes constitutes acceptance
                of the modified terms.
              </p>
            </section>

            <section className="card bg-base-200 p-6">
              <h2 className="text-3xl font-bold mb-4 text-secondary">12. Contact Information</h2>
              <p className="opacity-80 mb-4">
                For questions about these Terms of Service, contact us:
              </p>
              <ul className="space-y-2 opacity-80">
                <li><strong>Email:</strong> legal@starmy.my</li>
                <li><strong>Address:</strong> Kuala Lumpur, Malaysia</li>
              </ul>
            </section>
          </div>
        </div>
      </Container>

      <Footer />
    </div>
  );
}
