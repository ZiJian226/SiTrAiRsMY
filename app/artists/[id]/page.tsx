"use client";

import { useState, use } from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import { artists } from "@/data/mockData";

export default function ArtistProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const artist = artists.find((a) => a.id === id);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    budget: "",
    deadline: "",
  });

  if (!artist) {
    notFound();
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send data to an API
    console.log("Commission request:", formData);
    setFormSubmitted(true);
    setTimeout(() => {
      setFormSubmitted(false);
      setFormData({ name: "", email: "", description: "", budget: "", deadline: "" });
    }, 3000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <Link href="/artists" className="btn btn-ghost mb-6">
          ← Back to Artists
        </Link>

        {/* Profile Header */}
        <div className="card bg-base-200 shadow-xl mb-8">
          <div className="card-body">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <div className="avatar">
                <div className="w-48 rounded-full ring ring-secondary ring-offset-base-100 ring-offset-4">
                  <img src={artist.avatar} alt={artist.name} />
                </div>
              </div>
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-bold text-secondary mb-4">
                  {artist.name}
                </h1>
                <p className="text-lg mb-6">{artist.description}</p>
                <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                  {artist.specialty.map((spec) => (
                    <span key={spec} className="badge badge-accent badge-lg">
                      {spec}
                    </span>
                  ))}
                </div>
                <div className="text-lg font-semibold mb-4">
                  Price Range: {artist.priceRange}
                </div>
                <div className="mb-6">
                  {artist.commissionsOpen ? (
                    <div className="badge badge-success badge-lg">Open for Commissions</div>
                  ) : (
                    <div className="badge badge-error badge-lg">Commissions Closed</div>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  {artist.socialLinks?.website && (
                    <a
                      href={artist.socialLinks.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-secondary btn-sm"
                    >
                      Website
                    </a>
                  )}
                  {artist.socialLinks?.twitter && (
                    <a
                      href={artist.socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm"
                    >
                      Twitter
                    </a>
                  )}
                  {artist.socialLinks?.instagram && (
                    <a
                      href={artist.socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-accent btn-sm"
                    >
                      Instagram
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Portfolio Section */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Portfolio</h2>
              <div className="grid grid-cols-2 gap-4">
                {artist.portfolio.map((image, index) => (
                  <div key={index} className="aspect-[3/4] overflow-hidden rounded-lg">
                    <img
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-full object-cover hover:scale-110 transition-transform"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commission Form */}
          <div className="card bg-base-200 shadow-xl">
            <div className="card-body">
              <h2 className="card-title text-2xl mb-4">Request a Commission</h2>
              
              {!artist.commissionsOpen ? (
                <div className="alert alert-warning">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>This artist is currently not accepting commissions.</span>
                </div>
              ) : formSubmitted ? (
                <div className="alert alert-success">
                  <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>Your commission request has been submitted!</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Your Name</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter your name"
                      className="input input-bordered input-secondary"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Email</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      placeholder="your@email.com"
                      className="input input-bordered input-secondary"
                      value={formData.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Project Description</span>
                    </label>
                    <textarea
                      name="description"
                      placeholder="Describe your commission request in detail..."
                      className="textarea textarea-bordered textarea-secondary h-24"
                      value={formData.description}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Budget</span>
                    </label>
                    <input
                      type="text"
                      name="budget"
                      placeholder="e.g., $200"
                      className="input input-bordered input-secondary"
                      value={formData.budget}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Deadline (Optional)</span>
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      className="input input-bordered input-secondary"
                      value={formData.deadline}
                      onChange={handleChange}
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary w-full">
                    Submit Request
                  </button>
                </form>
              )}

              <div className="divider">OR</div>
              <a
                href={`mailto:${artist.contactEmail}`}
                className="btn btn-outline btn-secondary w-full"
              >
                Email Directly
              </a>
            </div>
          </div>
        </div>
      </Container>

      <footer className="footer footer-center p-10 bg-base-300 text-base-content mt-16">
        <aside>
          <p className="font-bold text-xl text-primary">⭐ StarMy</p>
          <p className="mt-2">Connecting VTubers, Artists, and Fans</p>
        </aside>
      </footer>
    </div>
  );
}
