"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";
import type { AgencyRequirement, AgencyBenefit } from "@/lib/types";

export default function JoinUsPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requirements, setRequirements] = useState<AgencyRequirement[]>([]);
  const [benefits, setBenefits] = useState<AgencyBenefit[]>([]);
  const [requirementsLoading, setRequirementsLoading] = useState(true);
  const [benefitsLoading, setBenefitsLoading] = useState(true);
  const [expandedRequirement, setExpandedRequirement] = useState<string | null>(null);
  
  const [showRequirementsModal, setShowRequirementsModal] = useState(false);
  const [showBenefitsModal, setShowBenefitsModal] = useState(false);
  const [selectedRequirementRole, setSelectedRequirementRole] = useState<'general' | 'artist' | 'talent'>('general');
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    portfolio: "",
    tiktokUsername: "",
    description: "",
    position: "",
  });

  // Fetch requirements and benefits on mount
  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await fetch('/api/content/requirements');
        const data = await res.json();
        setRequirements(data.data || []);
      } catch (error) {
        console.error('Error fetching requirements:', error);
      } finally {
        setRequirementsLoading(false);
      }
    };

    const fetchBenefits = async () => {
      try {
        const res = await fetch('/api/content/benefits');
        const data = await res.json();
        setBenefits(data.data || []);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      } finally {
        setBenefitsLoading(false);
      }
    };

    fetchRequirements();
    fetchBenefits();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/applications/career', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          position: formData.position,
          motivation: formData.description,
          portfolioUrl: formData.portfolio || null,
          tiktokUsername: formData.tiktokUsername || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: "", email: "", portfolio: "", tiktokUsername: "", description: "", position: "" });
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectPosition = (position: string) => {
    window.open("https://docs.google.com/forms/d/e/1FAIpQLScUV4FqPl2mQhgi8P8-nGWl_RAEqbHviVWrC92AGrm-aU1u_g/viewform?usp=header", "_blank", "noopener,noreferrer");
  };

  // Staff positions
  const staffPositions = [
    {
      title: "Community Moderator",
      department: "Community & Relations",
      description: "Support daily community moderation, fan support tickets, and event chat operations.",
      icon: "👥"
    },
    {
      title: "Talent Support Coordinator",
      department: "Talent Development",
      description: "Assist talents with stream prep, briefing notes, and content publishing workflows.",
      icon: "🎯"
    },
    {
      title: "Graphic Designer",
      department: "Creative",
      description: "Produce stream overlays, thumbnails, and campaign visual assets.",
      icon: "🎨"
    },
    {
      title: "Event Operations Assistant",
      department: "Events & Sponsorship",
      description: "Coordinate run sheets, sponsor assets, and day-of-show logistics.",
      icon: "🎪"
    },
    {
      title: "Social Media Specialist",
      department: "Marketing & Promotion",
      description: "Drive the agency's social media presence across all platforms.",
      icon: "📱"
    },
    {
      title: "Video Editor",
      department: "Production",
      description: "Edit streams, create highlight reels, and produce promotional videos.",
      icon: "🎬"
    },
    {
      title: "Music Producer / Audio Engineer",
      department: "Creative",
      description: "Create original music and ensure high-quality audio production.",
      icon: "🎵"
    },
    {
      title: "Partnerships Coordinator",
      department: "Strategy & Growth",
      description: "Source and coordinate sponsorship opportunities with partner brands.",
      icon: "🤝"
    }
  ];

  const groupedRequirements = {
    general: requirements.filter(r => r.role === 'general'),
    artist: requirements.filter(r => r.role === 'artist'),
    talent: requirements.filter(r => r.role === 'talent'),
  };

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        
        <div className="hero min-h-[400px] bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
          <div className="hero-content text-center">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Join Our Agency
              </h1>
              <p className="text-xl opacity-90">
                StarMyriad is a free, non-profit agency dedicated to growing the Malaysia VTuber community. Join as a Talent, Artist, or Volunteer Staff!
              </p>
            </div>
          </div>
        </div>

        <Container className="py-16 flex-grow">
          {/* Talent & Artist Applications */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="card bg-base-200 shadow-xl border-2 border-primary">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🎤</div>
                <h3 className="card-title text-primary text-2xl">Join as Talent</h3>
                <p className="opacity-80 mb-4">Are you a VTuber or content creator? Share your passion and join our talent roster!</p>
                <button type="button" onClick={() => handleSelectPosition("Talent")} className="btn btn-primary">Apply as Talent</button>
              </div>
            </div>

            <div className="card bg-base-200 shadow-xl border-2 border-secondary">
              <div className="card-body items-center text-center">
                <div className="text-5xl mb-4">🎨</div>
                <h3 className="card-title text-secondary text-2xl">Join as Artist</h3>
                <p className="opacity-80 mb-4">Show off your art! We collaborate with talented illustrators and character designers.</p>
                <button type="button" onClick={() => handleSelectPosition("Artist")} className="btn btn-secondary">Apply as Artist</button>
              </div>
            </div>
          </div>

          {/* Benefits & Requirements Buttons */}
          {!benefitsLoading && benefits.length > 0 && !requirementsLoading && requirements.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-2xl mx-auto">
              <button 
                onClick={() => setShowBenefitsModal(true)}
                className="btn btn-lg btn-primary gap-2 text-lg"
              >
                <span className="text-2xl">✨</span>
                Why Join?
              </button>
              <button 
                onClick={() => setShowRequirementsModal(true)}
                className="btn btn-lg btn-secondary gap-2 text-lg"
              >
                <span className="text-2xl">📋</span>
                Requirements
              </button>
            </div>
          )}

          {/* Staff Positions Section */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold text-center mb-4 text-primary">Open Volunteer Positions</h2>
            <p className="text-center text-lg opacity-80 mb-3">We're growing and looking for team members across various departments.</p>
            <p className="text-center text-sm opacity-70 mb-8">StarMyriad is a free agency - all staff are volunteers. This is a great opportunity to contribute to the Malaysian VTuber community!</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffPositions.map((position, idx) => (
                <div key={idx} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow hover:bg-base-300">
                  <div className="card-body">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-4xl mb-2">{position.icon}</div>
                        <h3 className="card-title text-lg text-primary">{position.title}</h3>
                      </div>
                    </div>
                    <div className="badge badge-outline badge-sm">{position.department}</div>
                    <p className="text-sm opacity-80 mt-2">{position.description}</p>
                    <div className="card-actions justify-start mt-4">
                      <a href="#application-form" className="btn btn-sm btn-primary">
                        Apply
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div id="application-form" className="max-w-3xl mx-auto">
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
                  <>
                    {error && (
                      <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l-2-2m0 0l-2-2m2 2l2-2m-2 2l-2 2m2-2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                      </div>
                    )}
                    <form onSubmit={handleSubmit} className="two-column-form-layout max-w-10xl mx-auto">
                      <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Full Name *</span></label>
                        <input type="text" name="name" placeholder="Your name" className="input input-bordered max-w-md w-full" value={formData.name} onChange={handleChange} required disabled={loading} />
                      </div>

                      <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Email Address *</span></label>
                        <input type="email" name="email" placeholder="your.email@example.com" className="input input-bordered max-w-md w-full" value={formData.email} onChange={handleChange} required disabled={loading} />
                      </div>

                      <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Position Applying For *</span></label>
                        <select name="position" className="select select-bordered max-w-md w-full" value={formData.position} onChange={handleChange} required disabled={loading}>
                          <option value="">Select a position</option>
                          {staffPositions.map((pos) => (
                            <option key={pos.title} value={pos.title}>{pos.title}</option>
                          ))}
                          <option value="other">Other</option>
                        </select>
                      </div>

                      <div className="form-control">
                        <label className="label"><span className="label-text-alt opacity-70">Optional but recommended</span></label>
                        <input type="text" name="portfolio" placeholder="LinkedIn profile, resume link, or portfolio URL" className="input input-bordered max-w-md w-full" value={formData.portfolio} onChange={handleChange} disabled={loading} />
                      </div>

                      <div className="form-control">
                        <label className="label"><span className="label-text-alt opacity-70">Optional</span></label>
                        <input type="text" name="tiktokUsername" placeholder="@yourtiktokusername" className="input input-bordered max-w-md w-full" value={formData.tiktokUsername} onChange={handleChange} disabled={loading} />
                      </div>

                      <div className="form-control">
                        <label className="label"><span className="label-text font-semibold">Why do you want to join StarMyriad? *</span></label>
                        <textarea name="description" placeholder="Share your experience, skills, and why you'd be a great fit for StarMyriad..." className="textarea textarea-bordered h-30 max-w-md w-full" value={formData.description} onChange={handleChange} required disabled={loading} />
                      </div>

                      <div className="form-control">
                        <label className="label">
                          <p className="text-sm opacity-70 whitespace-normal">By submitting this form, you agree to our <Link href="/terms" className="link link-primary">Terms of Service</Link> and <Link href="/privacy" className="link link-primary">Privacy Policy</Link>.</p>
                        </label>
                        <div className="flex flex-col gap-3 max-w-md">
                          <button type="submit" className="btn btn-primary btn-lg whitespace-normal" disabled={loading}>
                            {loading ? (
                              <>
                                <span className="loading loading-spinner loading-sm"></span>
                                Submitting...
                              </>
                            ) : (
                              'Submit Application'
                            )}
                          </button>
                          <a href="https://www.tiktok.com/messages?u=7502661742087619592" target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-lg btn-info whitespace-normal">
                            Message us on TikTok instead
                          </a>
                        </div>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </Container>

        {/* Benefits Modal */}
        {showBenefitsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-base-100 rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-primary to-secondary p-6 text-white flex justify-between items-center gap-4">
                <h2 className="text-3xl font-bold">Why Join StarMyriad?</h2>
                <button onClick={() => setShowBenefitsModal(false)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {benefits.map((benefit) => (
                    <div key={benefit.id} className="card bg-base-200 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="card-body">
                        <div className="text-4xl mb-2">{benefit.emoji}</div>
                        <h3 className="card-title text-lg text-primary">{benefit.title}</h3>
                        <p className="text-sm opacity-80">{benefit.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Requirements Modal */}
        {showRequirementsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-base-100 rounded-xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-secondary to-accent p-6 text-white flex justify-between items-center gap-4">
                <h2 className="text-3xl font-bold">Requirements</h2>
                <button onClick={() => setShowRequirementsModal(false)} className="btn btn-sm btn-circle btn-ghost text-white hover:bg-white/20">
                  ✕
                </button>
              </div>
              
              <div className="p-6">
                {/* Role Tabs */}
                <div className="tabs tabs-boxed mb-6 flex flex-wrap gap-1">
                  {(['general', 'artist', 'talent'] as const).map((role) => (
                    <button 
                      key={role}
                      onClick={() => setSelectedRequirementRole(role)}
                      className={`tab font-semibold ${selectedRequirementRole === role ? 'tab-active' : ''}`}
                    >
                      {role === 'general' && '🌟 General'}
                      {role === 'artist' && '🎨 Artist'}
                      {role === 'talent' && '🎥 Talent'}
                    </button>
                  ))}
                </div>

                {/* Requirements List */}
                <div className="space-y-2">
                  {groupedRequirements[selectedRequirementRole].map((req) => (
                    <div key={req.id} className="collapse collapse-arrow bg-base-200 border border-base-300 hover:bg-base-300 transition-colors">
                      <input 
                        type="checkbox" 
                        checked={expandedRequirement === req.id}
                        onChange={() => setExpandedRequirement(expandedRequirement === req.id ? null : req.id)}
                      />
                      <div className="collapse-title text-base font-semibold flex items-center gap-2">
                        {req.emoji && <span className="text-xl">{req.emoji}</span>}
                        {req.title}
                      </div>
                      <div className="collapse-content pt-4">
                        <p className="opacity-80">{req.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider my-6"></div>
                <p className="text-center text-sm opacity-70">
                  ✨ These requirements ensure a professional, safe, and supportive environment for all StarMyriad talents.
                </p>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
