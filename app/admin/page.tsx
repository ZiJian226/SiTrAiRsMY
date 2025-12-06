"use client";

import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Container from "@/components/Container";
import { vtubers, artists } from "@/data/mockData";
import { VTuber, Artist } from "@/lib/types";

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<"vtubers" | "artists">("vtubers");
  const [vtuberList, setVtuberList] = useState<VTuber[]>(vtubers);
  const [artistList, setArtistList] = useState<Artist[]>(artists);

  const handleDeleteVTuber = (id: string) => {
    if (confirm("Are you sure you want to delete this VTuber?")) {
      setVtuberList(vtuberList.filter((v) => v.id !== id));
    }
  };

  const handleDeleteArtist = (id: string) => {
    if (confirm("Are you sure you want to delete this artist?")) {
      setArtistList(artistList.filter((a) => a.id !== id));
    }
  };

  const handleToggleFeatured = (id: string) => {
    setVtuberList(
      vtuberList.map((v) => (v.id === id ? { ...v, featured: !v.featured } : v))
    );
  };

  const handleToggleCommissions = (id: string) => {
    setArtistList(
      artistList.map((a) =>
        a.id === id ? { ...a, commissionsOpen: !a.commissionsOpen } : a
      )
    );
  };

  return (
    <div className="min-h-screen bg-base-100">
      <Navbar />

      <Container className="py-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-5xl font-bold text-primary">Admin Panel</h1>
          <Link href="/" className="btn btn-ghost">
            ← Back to Home
          </Link>
        </div>

        <div className="alert alert-info mb-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span>This is a demo admin panel. In production, this would be protected by authentication.</span>
        </div>

        {/* Tabs */}
        <div className="tabs tabs-boxed mb-8">
          <a
            className={`tab tab-lg ${activeTab === "vtubers" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("vtubers")}
          >
            VTubers ({vtuberList.length})
          </a>
          <a
            className={`tab tab-lg ${activeTab === "artists" ? "tab-active" : ""}`}
            onClick={() => setActiveTab("artists")}
          >
            Artists ({artistList.length})
          </a>
        </div>

        {/* VTubers Management */}
        {activeTab === "vtubers" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Manage VTubers</h2>
              <button className="btn btn-primary">
                + Add New VTuber
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Tags</th>
                    <th>Featured</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vtuberList.map((vtuber) => (
                    <tr key={vtuber.id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img src={vtuber.avatar} alt={vtuber.name} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold">{vtuber.name}</div>
                        <div className="text-sm opacity-70 truncate max-w-xs">
                          {vtuber.description}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {vtuber.tags.map((tag) => (
                            <span key={tag} className="badge badge-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-primary"
                          checked={vtuber.featured}
                          onChange={() => handleToggleFeatured(vtuber.id)}
                        />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-ghost">Edit</button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteVTuber(vtuber.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Artists Management */}
        {activeTab === "artists" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Manage Artists</h2>
              <button className="btn btn-secondary">
                + Add New Artist
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="table table-zebra">
                <thead>
                  <tr>
                    <th>Avatar</th>
                    <th>Name</th>
                    <th>Specialty</th>
                    <th>Price Range</th>
                    <th>Commissions</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {artistList.map((artist) => (
                    <tr key={artist.id}>
                      <td>
                        <div className="avatar">
                          <div className="w-12 rounded-full">
                            <img src={artist.avatar} alt={artist.name} />
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="font-bold">{artist.name}</div>
                        <div className="text-sm opacity-70 truncate max-w-xs">
                          {artist.description}
                        </div>
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {artist.specialty.slice(0, 2).map((spec) => (
                            <span key={spec} className="badge badge-sm">
                              {spec}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="text-sm">{artist.priceRange}</td>
                      <td>
                        <input
                          type="checkbox"
                          className="toggle toggle-secondary"
                          checked={artist.commissionsOpen}
                          onChange={() => handleToggleCommissions(artist.id)}
                        />
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button className="btn btn-sm btn-ghost">Edit</button>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDeleteArtist(artist.id)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Container>

      <footer className="footer footer-center p-10 bg-base-300 text-base-content mt-16">
        <aside>
          <p className="font-bold text-xl text-primary">⭐ StarMy</p>
          <p className="mt-2">Admin Panel</p>
        </aside>
      </footer>
    </div>
  );
}
