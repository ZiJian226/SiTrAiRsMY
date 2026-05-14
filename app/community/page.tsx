"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function CommunityPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    discordName: "",
    supportingInfo: "",
    isMalaysian: true,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: `${formData.discordName.replace(/\s+/g, '.')}@starweaver.local`,
          discordName: formData.discordName,
          supportingInfo: formData.supportingInfo,
          isMalaysian: formData.isMalaysian,
          country: 'Malaysia',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
          setFormData({ name: "", discordName: "", supportingInfo: "", isMalaysian: true });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, type } = e.target as HTMLInputElement;
    const value = type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [name]: value });
  };

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        <Container className="py-8 md:py-12 flex-grow">
          <h1 className="text-3xl md:text-5xl font-bold text-center mb-2 md:mb-4 text-primary px-4">
            StarWeaver Community
          </h1>
          <p className="text-center text-base md:text-lg mb-8 md:mb-12 max-w-2xl mx-auto opacity-70 px-4">
            Join StarWeaver - our public community space for non-StarMyriad members, collaborations, and sharing creative content.
          </p>

          <div className="max-w-4xl mx-auto space-y-6 md:space-y-8 px-4">
            {/* About StarWeaver */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <h2 className="card-title text-xl md:text-2xl text-primary mb-4">What is StarWeaver?</h2>
                <p className="text-base md:text-lg opacity-80 leading-relaxed">
                  While StarMyriad is primarily for internal StarMyriad members (VTubers and artists), 
                  <span className="text-primary font-semibold"> StarWeaver</span> serves as our 
                  public community platform. It's a space where fans, aspiring creators, and 
                  collaborators can connect, share content, and participate in community activities.
                </p>
              </div>
            </div>

            {/* Community Features */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-4 md:p-6">
                  <h3 className="card-title text-sm md:text-base text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Connect & Collaborate
                  </h3>
                  <p className="opacity-70 text-sm">
                    Network with fellow creators, find collaboration opportunities, and participate in community events.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-4 md:p-6">
                  <h3 className="card-title text-sm md:text-base text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                    Share Your Content
                  </h3>
                  <p className="opacity-70 text-sm">
                    Post your artwork, stream highlights, fan creations, and more with the community.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-4 md:p-6">
                  <h3 className="card-title text-sm md:text-base text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                    Stay Updated
                  </h3>
                  <p className="opacity-70 text-sm">
                    Get the latest news, event announcements, and updates from StarMyriad talents.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body p-4 md:p-6">
                  <h3 className="card-title text-sm md:text-base text-primary">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 md:h-6 w-5 md:w-6 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Community Events
                  </h3>
                  <p className="opacity-70 text-sm">
                    Join exclusive community events, watch parties, and interactive sessions.
                  </p>
                </div>
              </div>
            </div>

            {/* Community Application */}
            <div className="card bg-gradient-to-br from-primary to-secondary shadow-2xl">
              <div className="card-body p-4 md:p-8">
                <div className="flex justify-center mb-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 71 55" fill="none" className="md:w-8 md:h-8">
                    <path 
                    d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" 
                    fill="currentColor"
                    />
                  </svg>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-center mb-1">
                  Join StarWeaver Discord
                </h2>
                <div className="text-center mb-6">
                  <p className="text-base md:text-lg opacity-90">Exclusive to Malaysia — please provide your Discord name to join.</p>
                </div>

                {submitted ? (
                  <div className="alert alert-success w-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm md:text-base">Application submitted successfully! We'll review your application and get back to you soon.</span>
                  </div>
                ) : (
                  <>
                    {error && (
                      <div className="alert alert-error w-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-sm md:text-base">{error}</span>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4 w-full">
                      <div className="form-control w-full">
                        <label className="label py-2">
                          <span className="label-text font-semibold text-white text-sm md:text-base">Full Name *</span>
                        </label>
                        <input 
                          type="text" 
                          name="name" 
                          placeholder="Your name" 
                          className="input input-bordered w-full text-sm md:text-base px-3 md:px-4" 
                          value={formData.name} 
                          onChange={handleChange} 
                          required 
                          disabled={loading}
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label py-2">
                          <span className="label-text font-semibold text-white text-sm md:text-base">Discord Name (e.g. Poffu#1234) *</span>
                        </label>
                        <input 
                          type="text" 
                          name="discordName" 
                          placeholder="Your Discord name" 
                          className="input input-bordered w-full text-sm md:text-base px-3 md:px-4" 
                          value={formData.discordName} 
                          onChange={handleChange} 
                          required 
                          disabled={loading}
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="label py-2">
                          <span className="label-text font-semibold text-white text-sm md:text-base">Tell us about yourself *</span>
                        </label>
                        <label className="label py-2">
                          <span className="label-text-alt text-white opacity-70 text-xs md:text-sm">Your background, interests, and why you want to join</span>
                        </label>
                        <textarea 
                          name="supportingInfo" 
                          placeholder="Share your experience, interests, and what you'd like to contribute to the community..." 
                          className="textarea textarea-bordered h-24 md:h-32 w-full text-sm md:text-base px-3 md:px-4" 
                          value={formData.supportingInfo} 
                          onChange={handleChange} 
                          required 
                          disabled={loading}
                        />
                      </div>

                      <div className="form-control w-full">
                        <label className="cursor-pointer label py-2 justify-start gap-3">
                          <input type="checkbox" name="isMalaysian" checked={formData.isMalaysian} onChange={handleChange} className="checkbox checkbox-primary" />
                          <span className="label-text text-white text-sm md:text-base">I confirm I am based in Malaysia *</span>
                        </label>
                      </div>

                      <div className="form-control w-full pt-2">
                        <p className="text-xs md:text-sm opacity-70 text-center mb-4 px-2">
                          By submitting this form, you agree to our <Link href="/terms" className="link link-primary">Terms of Service</Link> and <Link href="/privacy" className="link link-primary">Privacy Policy</Link>.
                        </p>
                        <button type="submit" className="btn btn-md md:btn-lg bg-white text-primary hover:bg-gray-100 border-none w-full text-sm md:text-base" disabled={loading}>
                          {loading ? (
                            <>
                              <span className="loading loading-spinner loading-sm"></span>
                              Submitting...
                            </>
                          ) : (
                            '✨ Join StarWeaver Community'
                          )}
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>

            {/* Community Guidelines */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body p-4 md:p-6">
                <h2 className="card-title text-xl md:text-2xl text-primary mb-4">Community Guidelines</h2>
                <ul className="space-y-2 opacity-80">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base">Be respectful and supportive to all community members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base">Give credit to original creators when sharing content</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1 flex-shrink-0">✓</span>
                    <span className="text-sm md:text-base">Follow Discord's Terms of Service and Community Guidelines</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}

