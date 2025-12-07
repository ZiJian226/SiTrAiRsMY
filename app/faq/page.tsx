"use client";

import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

const faqs = [
  {
    category: "General",
    questions: [
      {
        q: "What is StarMy?",
        a: "StarMy is Malaysia's premier platform connecting VTubers, artists, and fans. We provide a space for content creators to showcase their work, fans to discover new creators, and facilitate collaborations within the community.",
      },
      {
        q: "Is StarMy free to use?",
        a: "Yes! Creating an account and browsing content on StarMy is completely free. Some premium features may be introduced in the future with optional paid upgrades.",
      },
      {
        q: "How do I join StarMy?",
        a: "You can browse as a guest, or create an account to access additional features like saving favorites, requesting commissions, and interacting with creators.",
      },
    ],
  },
  {
    category: "For VTubers",
    questions: [
      {
        q: "How can I list my VTuber profile?",
        a: "Contact our team through the Career page to submit your VTuber profile. We'll review your application and add you to our platform. Make sure to include your streaming schedule, social media links, and a brief description.",
      },
      {
        q: "Can I update my streaming schedule?",
        a: "Yes! Once your profile is approved, you'll have access to an admin dashboard where you can update your schedule, social media links, and profile information anytime.",
      },
      {
        q: "Do you take a commission from donations or subscriptions?",
        a: "No. StarMy does not take any portion of donations, subscriptions, or revenue from your external platforms. We only provide visibility and connection opportunities.",
      },
    ],
  },
  {
    category: "For Artists",
    questions: [
      {
        q: "How do I create an artist profile?",
        a: "Submit an application through our Career page with your portfolio, specialties, and contact information. Our team will review and approve qualified artists.",
      },
      {
        q: "How does the commission system work?",
        a: "StarMy facilitates the connection between clients and artists. When someone requests a commission through your profile, you'll receive their details and can communicate directly to finalize the project details and payment.",
      },
      {
        q: "What commission types are supported?",
        a: "Artists can offer various commission types including character design, VTuber models, Live2D rigging, illustrations, emotes, overlays, and more. You set your own prices and terms.",
      },
      {
        q: "Does StarMy handle payments?",
        a: "Currently, payment arrangements are made directly between artists and clients. We recommend using secure payment platforms and having clear written agreements.",
      },
    ],
  },
  {
    category: "Commissions",
    questions: [
      {
        q: "How do I request a commission?",
        a: "Visit an artist's profile and fill out the commission request form. Include as many details as possible about your project, budget, and timeline. The artist will review and respond directly.",
      },
      {
        q: "What information should I include in a commission request?",
        a: "Be specific about what you want, your budget range, desired deadline, reference images (if applicable), and your preferred contact method. Clear communication leads to better results!",
      },
      {
        q: "What if there's a dispute with a commission?",
        a: "While StarMy facilitates connections, commission agreements are between you and the artist. We recommend clear communication, written agreements, and milestone-based payments. If issues arise, try to resolve them directly first.",
      },
    ],
  },
  {
    category: "Technical",
    questions: [
      {
        q: "What browsers are supported?",
        a: "StarMy works best on modern browsers including Chrome, Firefox, Safari, and Edge. Make sure your browser is up to date for the best experience.",
      },
      {
        q: "Is StarMy mobile-friendly?",
        a: "Yes! Our platform is fully responsive and works great on mobile devices, tablets, and desktops.",
      },
      {
        q: "I found a bug. How do I report it?",
        a: "We appreciate bug reports! Please email support@starmy.my with details about the issue, including your device, browser, and steps to reproduce the problem.",
      },
    ],
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        q: "How is my personal information protected?",
        a: "We take privacy seriously. Please review our Privacy Policy for detailed information about how we collect, use, and protect your data.",
      },
      {
        q: "Can I delete my account?",
        a: "Yes, you can request account deletion by contacting support@starmy.my. We'll remove your personal information according to our data retention policies.",
      },
      {
        q: "How do I report inappropriate content?",
        a: "If you see content that violates our Terms of Service, please report it to moderation@starmy.my with a link and description of the issue.",
      },
    ],
  },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-12 flex-grow">
          <h1 className="text-5xl font-bold text-center mb-4 text-primary">
            Frequently Asked Questions
          </h1>
          <p className="text-center text-lg mb-12 max-w-2xl mx-auto opacity-70">
            Find answers to common questions about StarMy. Can't find what you're looking for? Contact our support team!
          </p>

          <div className="max-w-4xl mx-auto space-y-8">
            {faqs.map((section, sectionIdx) => (
              <div key={sectionIdx} className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <h2 className="text-3xl font-bold mb-6 text-secondary">{section.category}</h2>
                  <div className="space-y-4">
                    {section.questions.map((faq, faqIdx) => (
                      <div key={faqIdx} className="collapse collapse-plus bg-base-100">
                        <input type="radio" name={`faq-${sectionIdx}`} defaultChecked={faqIdx === 0} />
                        <div className="collapse-title text-xl font-medium">
                          {faq.q}
                        </div>
                        <div className="collapse-content">
                          <p className="opacity-80">{faq.a}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="card bg-gradient-to-br from-primary/20 to-secondary/20 shadow-xl mt-12 max-w-4xl mx-auto">
            <div className="card-body text-center">
              <h2 className="text-3xl font-bold mb-4">Still Have Questions?</h2>
              <p className="mb-6 opacity-80">
                Our support team is here to help! Reach out and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <a href="mailto:support@starmy.my" className="btn btn-primary">
                  Email Support
                </a>
                <a href="/about" className="btn btn-secondary">
                  Learn More About Us
                </a>
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
