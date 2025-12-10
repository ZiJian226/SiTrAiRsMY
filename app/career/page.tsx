"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

export default function CareerPage() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    description: "",
    position: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: "", email: "", portfolio: "", description: "", position: "" });
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
        <div className="hero min-h-[400px] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join Our Team
              </h1>
              <p className="text-xl opacity-90">
                Help us grow StarMy! We're looking for passionate individuals to join our team.
              </p>
            </div>
          </div>
        </div>
        <Container className="py-16 flex-grow">
          <div className="alert alert-info mb-12 max-w-4xl mx-auto">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <div>
              <h3 className="font-bold">Talent Applications Currently Closed</h3>
              <div className="text-sm">We are not currently accepting new VTuber or Artist applications. We are only considering staff positions at this time.</div>
            </div>
          </div>
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-10 text-primary">Why Join Our Team?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">💡</div>
                  <h3 className="card-title text-primary">Innovation</h3>
                  <p className="opacity-80">Be part of building cutting-edge features for Malaysia's premier VTuber platform.</p>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🤝</div>
                  <h3 className="card-title text-secondary">Collaboration</h3>
                  <p className="opacity-80">Work with talented creators, artists, and a dedicated team passionate about the community.</p>
                </div>
              </div>
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body items-center text-center">
                  <div className="text-5xl mb-4">🌱</div>
                  <h3 className="card-title text-accent">Growth</h3>
                  <p className="opacity-80">Develop your skills in a fast-paced environment with room for growth.</p>
                </div>
              </div>
            </div>
          </div>
          <div id="application-form" className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-8 text-secondary">Staff Application Form</h2>
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
                  <form onSubmit={handleSubmit} className="space-y-5 max-w-10xl mx-auto">
                    <div className="form-control">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <label className="label"><span className="label-text font-semibold">Full Name *</span></label>
                        <input type="text" name="name" placeholder="Your name" className="input input-bordered max-w-md w-full" value={formData.name} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-control">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <label className="label"><span className="label-text font-semibold">Email Address *</span></label>
                        <input type="email" name="email" placeholder="your.email@example.com" className="input input-bordered max-w-md w-full" value={formData.email} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-control">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <label className="label"><span className="label-text font-semibold">Position Applying For *</span></label>
                        <select name="position" className="select select-bordered max-w-md w-full" value={formData.position} onChange={handleChange} required>
                          <option value="">Select a position</option>
                          <option value="developer">Full Stack Developer</option>
                          <option value="designer">UI/UX Designer</option>
                          <option value="community">Community Manager</option>
                          <option value="marketing">Marketing Specialist</option>
                          <option value="moderator">Content Moderator</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-control">
                      <div className="flex justify-end pr-35">
                        <label className="label"><span className="label-text-alt opacity-70">Optional but recommended</span></label>
                      </div>
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <label className="label"><span className="label-text font-semibold">LinkedIn / Resume / Portfolio</span></label>
                        <input type="text" name="portfolio" placeholder="LinkedIn profile, resume link, or portfolio URL" className="input input-bordered max-w-md w-full" value={formData.portfolio} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="form-control">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <label className="label"><span className="label-text font-semibold">Why do you want to join StarMy? *</span></label>
                        <textarea name="description" placeholder="Share your experience, skills, and why you'd be a great fit for StarMy..." className="textarea textarea-bordered h-30 max-w-md w-full" value={formData.description} onChange={handleChange} required />
                      </div>
                    </div>
                    <div className="form-control">
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-10">
                        <p className="text-sm opacity-70 text-center sm:text-left">
                          By submitting this form, you agree to our <a href="/terms" className="link link-primary">Terms of Service</a> and <a href="/privacy" className="link link-primary">Privacy Policy</a>.
                        </p>
                        <button type="submit" className="btn btn-primary btn-lg whitespace-nowrap">Submit Application</button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            </div>
          </div>
        </Container>
        <Footer />
      </div>
    </div>
  );
}
