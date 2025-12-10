"use client";

import { useState } from "react";
import type { Artist } from "@/lib/types";

export default function CommissionForm({ artist }: { artist: Artist }) {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    budget: "",
    deadline: "",
  });

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
  );
}
