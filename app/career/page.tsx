"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function CareerPage() {
  const [activeForm, setActiveForm] = useState<"vtuber" | "artist" | "team">("vtuber");
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    socialLinks: "",
    portfolio: "",
    description: "",
    specialty: "",
    experience: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In production, this would send to API/Supabase
    console.log("Form submitted:", { type: activeForm, ...formData });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({
        name: "",
        email: "",
        socialLinks: "",
        portfolio: "",
        description: "",
        specialty: "",
        experience: "",
      });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10">
        <Navbar />

        {/* Hero Section */}
        <div className="hero min-h-[400px] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join StarMy
              </h1>
              <p className="text-xl">
                Be part of Malaysia's most exciting VTuber and artist community. Let's create something amazing together!
              </p>
            </div>
          </div>
        </div>

        <Container className="py-16 flex-grow">
          {/* Benefits Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-10 text-primary">Why Join Us?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="card-title text-primary">Visibility</h3>
                  <p className="opacity-80">
                    Get discovered by thousands of fans actively looking for new content creators and artists.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">💼</div>
                  <h3 className="card-title text-secondary">Opportunities</h3>
                  <p className="opacity-80">
                    Connect with brands, collaborate with other creators, and access exclusive partnership opportunities.
                  </p>
                </div>
              </div>

              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🌟</div>
                  <h3 className="card-title text-accent">Support</h3>
                  <p className="opacity-80">
                    Join a supportive community with dedicated team support, resources, and promotional assistance.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Application Form Section */}
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8 text-secondary">Apply Now</h2>

            {/* Form Type Tabs */}
            <div className="tabs tabs-boxed mb-8 justify-center">
              <a
                className={`tab tab-lg ${activeForm === "vtuber" ? "tab-active" : ""}`}
                onClick={() => setActiveForm("vtuber")}
              >
                Join as VTuber
              </a>
              <a
                className={`tab tab-lg ${activeForm === "artist" ? "tab-active" : ""}`}
                onClick={() => setActiveForm("artist")}
              >
                Join as Artist
              </a>
              <a
                className={`tab tab-lg ${activeForm === "team" ? "tab-active" : ""}`}
                onClick={() => setActiveForm("team")}
              >
                Join Our Team
              </a>
            </div>

            {/* Application Form */}
            <div className="card bg-base-200 shadow-xl">
              <div className="card-body">
                {submitted ? (
                  <div className="alert alert-success">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Application submitted successfully! We'll review and get back to you soon.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Common Fields */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Full Name *</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        placeholder="Your name"
                        className="input input-bordered"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">Email Address *</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        placeholder="your.email@example.com"
                        className="input input-bordered"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* VTuber Specific Fields */}
                    {activeForm === "vtuber" && (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Social Media Links *</span>
                          </label>
                          <textarea
                            name="socialLinks"
                            placeholder="YouTube, Twitch, TikTok, Twitter, etc. (one per line)"
                            className="textarea textarea-bordered h-24"
                            value={formData.socialLinks}
                            onChange={handleChange}
                            required
                          />
                          <label className="label">
                            <span className="label-text-alt">Please provide links to your streaming platforms</span>
                          </label>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Content Type</span>
                          </label>
                          <select
                            name="specialty"
                            className="select select-bordered"
                            value={formData.specialty}
                            onChange={handleChange}
                          >
                            <option value="">Select your primary content type</option>
                            <option value="gaming">Gaming</option>
                            <option value="singing">Singing/Music</option>
                            <option value="art">Art Streams</option>
                            <option value="chatting">Chatting/Just Chat</option>
                            <option value="asmr">ASMR</option>
                            <option value="variety">Variety</option>
                          </select>
                        </div>
                      </>
                    )}

                    {/* Artist Specific Fields */}
                    {activeForm === "artist" && (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Portfolio Link *</span>
                          </label>
                          <input
                            type="url"
                            name="portfolio"
                            placeholder="https://your-portfolio.com"
                            className="input input-bordered"
                            value={formData.portfolio}
                            onChange={handleChange}
                            required
                          />
                          <label className="label">
                            <span className="label-text-alt">Link to your portfolio, ArtStation, Instagram, etc.</span>
                          </label>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Specialty *</span>
                          </label>
                          <select
                            name="specialty"
                            className="select select-bordered"
                            value={formData.specialty}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select your specialty</option>
                            <option value="character-design">Character Design</option>
                            <option value="vtuber-models">VTuber Models</option>
                            <option value="live2d">Live2D Rigging</option>
                            <option value="illustration">Illustration</option>
                            <option value="emotes">Emotes & Badges</option>
                            <option value="overlays">Stream Overlays</option>
                            <option value="3d-modeling">3D Modeling</option>
                            <option value="animation">Animation</option>
                          </select>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Years of Experience</span>
                          </label>
                          <input
                            type="text"
                            name="experience"
                            placeholder="e.g., 3 years"
                            className="input input-bordered"
                            value={formData.experience}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {/* Team Specific Fields */}
                    {activeForm === "team" && (
                      <>
                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">Position Applying For *</span>
                          </label>
                          <select
                            name="specialty"
                            className="select select-bordered"
                            value={formData.specialty}
                            onChange={handleChange}
                            required
                          >
                            <option value="">Select a position</option>
                            <option value="developer">Full Stack Developer</option>
                            <option value="designer">UI/UX Designer</option>
                            <option value="community">Community Manager</option>
                            <option value="marketing">Marketing Specialist</option>
                            <option value="content">Content Creator</option>
                            <option value="moderator">Moderator</option>
                          </select>
                        </div>

                        <div className="form-control">
                          <label className="label">
                            <span className="label-text font-semibold">LinkedIn / Resume</span>
                          </label>
                          <input
                            type="text"
                            name="portfolio"
                            placeholder="LinkedIn profile or resume link"
                            className="input input-bordered"
                            value={formData.portfolio}
                            onChange={handleChange}
                          />
                        </div>
                      </>
                    )}

                    {/* Common Description Field */}
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text font-semibold">
                          {activeForm === "team" ? "Why do you want to join StarMy?" : "Tell us about yourself"} *
                        </span>
                      </label>
                      <textarea
                        name="description"
                        placeholder={
                          activeForm === "vtuber"
                            ? "Describe your content, streaming schedule, and what makes you unique..."
                            : activeForm === "artist"
                              ? "Tell us about your art style, commission experience, and what you'd like to offer..."
                              : "Share your experience, skills, and why you'd be a great fit for StarMy..."
                        }
                        className="textarea textarea-bordered h-32"
                        value={formData.description}
                        onChange={handleChange}
                        required
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="form-control mt-6">
                      <button type="submit" className="btn btn-primary btn-lg">
                        Submit Application
                      </button>
                    </div>

                    <p className="text-sm text-center opacity-70 mt-4">
                      By submitting this form, you agree to our{" "}
                      <a href="/terms" className="link link-primary">Terms of Service</a> and{" "}
                      <a href="/privacy" className="link link-primary">Privacy Policy</a>.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>

          {/* Open Positions Section for Team */}
          {activeForm === "team" && (
            <div className="mt-12 max-w-4xl mx-auto hidden">
              <h3 className="text-3xl font-bold text-center mb-8 text-primary">Open Positions</h3>
              <div className="space-y-4">
                {[
                  { title: "Full Stack Developer", type: "Full-time", location: "Remote" },
                  { title: "Community Manager", type: "Full-time", location: "Kuala Lumpur / Remote" },
                  { title: "UI/UX Designer", type: "Contract", location: "Remote" },
                  { title: "Content Moderator", type: "Part-time", location: "Remote" },
                ].map((job, idx) => (
                  <div key={idx} className="card bg-base-200 shadow-xl">
                    <div className="card-body">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="card-title text-xl">{job.title}</h4>
                          <div className="flex gap-2 mt-2">
                            <span className="badge badge-primary badge-sm">{job.type}</span>
                            <span className="badge badge-secondary badge-sm">{job.location}</span>
                          </div>
                        </div>
                        <button className="btn btn-primary btn-sm" onClick={() => setActiveForm("team")}>
                          Apply Now
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Container>

        <Footer />
      </div>
    </div>
  );
}
