"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Container from "@/components/Container";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageBackground from "@/components/PageBackground";

interface CareerApplication {
  id: string;
  name: string;
  email: string;
  position: string;
  portfolio_url: string | null;
  motivation: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

interface CommunityApplication {
  id: string;
  name: string;
  email: string;
  country: string;
  discord_name?: string | null;
  is_malaysian?: boolean;
  supporting_info: string;
  status: "pending" | "reviewing" | "accepted" | "rejected";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ApplicationsPage() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"career" | "community">("career");
  const [careerApps, setCareerApps] = useState<CareerApplication[]>([]);
  const [communityApps, setCommunityApps] = useState<CommunityApplication[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<CareerApplication | CommunityApplication | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [editingStatus, setEditingStatus] = useState(false);
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    } else if (!loading && profile && profile.role !== "admin" && profile.role !== "staff") {
      router.push("/dashboard");
    }
  }, [loading, user, profile, router]);

  useEffect(() => {
    if (!user || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
      return;
    }

    const fetchApplications = async () => {
      try {
        setPageLoading(true);
        const careerRes = await fetch("/api/admin/applications?type=career");
        const communityRes = await fetch("/api/admin/applications?type=community");

        if (!careerRes.ok || !communityRes.ok) {
          throw new Error("Failed to fetch applications");
        }

        const careerData = await careerRes.json();
        const communityData = await communityRes.json();

        setCareerApps(careerData.data?.data || []);
        setCommunityApps(communityData.data?.data || []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setPageLoading(false);
      }
    };

    void fetchApplications();
  }, [user, profile]);

  const updateApplicationStatus = async (
    id: string,
    type: "career" | "community",
    newStatus: string,
    notes: string
  ) => {
    try {
      const response = await fetch("/api/admin/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, type, status: newStatus, adminNotes: notes }),
      });

      if (!response.ok) {
        throw new Error("Failed to update");
      }

      const updatedApp = await response.json();

      if (type === "career") {
        setCareerApps(careerApps.map((app) => (app.id === id ? updatedApp.data : app)));
      } else {
        setCommunityApps(communityApps.map((app) => (app.id === id ? updatedApp.data : app)));
      }

      setSelectedApp(updatedApp.data);
      setEditingStatus(false);
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const filteredApps = (activeTab === "career" ? careerApps : communityApps).filter((app) => {
    if (statusFilter === "all") return true;
    return app.status === statusFilter;
  });

  const selectedType = activeTab === "career" ? "career" : "community";

  if (loading || !user || !profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return (
      <div className="min-h-screen bg-base-100 flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base-100 relative flex flex-col">
      <PageBackground rotate={true} blur={true} opacity={50} />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />

        <Container className="py-8 flex-grow">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
            <div>
              <p className="text-sm uppercase tracking-wider opacity-70">Dashboard</p>
              <h1 className="text-4xl font-bold text-primary">Applications Management</h1>
              <p className="opacity-70 mt-2">Review career and community applications.</p>
            </div>
            <Link href="/dashboard" className="btn btn-outline btn-primary">
              ← Back to Dashboard
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Career Total</h3>
                <p className="text-3xl font-bold text-primary">{careerApps.length}</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Career Pending</h3>
                <p className="text-3xl font-bold text-warning">{careerApps.filter((a) => a.status === "pending").length}</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Community Total</h3>
                <p className="text-3xl font-bold text-secondary">{communityApps.length}</p>
              </div>
            </div>
            <div className="card bg-base-200 shadow">
              <div className="card-body">
                <h3 className="card-title text-sm">Community Pending</h3>
                <p className="text-3xl font-bold text-warning">{communityApps.filter((a) => a.status === "pending").length}</p>
              </div>
            </div>
          </div>

          <div className="tabs mb-6 border-b border-base-300">
            <button
              className={`tab ${activeTab === "career" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("career");
                setStatusFilter("all");
                setSelectedApp(null);
              }}
            >
              Career Applications ({careerApps.length})
            </button>
            <button
              className={`tab ${activeTab === "community" ? "tab-active" : ""}`}
              onClick={() => {
                setActiveTab("community");
                setStatusFilter("all");
                setSelectedApp(null);
              }}
            >
              Community Applications ({communityApps.length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="card bg-base-200 shadow-xl">
                <div className="card-body">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="card-title">Applications</h2>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="select select-bordered select-sm"
                    >
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="reviewing">Reviewing</option>
                      <option value="accepted">Accepted</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>

                  {pageLoading ? (
                    <div className="flex justify-center py-8">
                      <span className="loading loading-spinner loading-lg"></span>
                    </div>
                  ) : filteredApps.length === 0 ? (
                    <p className="text-center opacity-70">No applications found</p>
                  ) : (
                    <div className="space-y-2 max-h-[600px] overflow-y-auto">
                      {filteredApps.map((app) => (
                        <button
                          key={app.id}
                          onClick={() => {
                            setSelectedApp(app);
                            setEditNotes(app.admin_notes || "");
                          }}
                          className={`p-4 rounded-lg border-2 text-left transition-all ${
                            selectedApp?.id === app.id
                              ? "border-primary bg-primary/10"
                              : "border-base-300 bg-base-100 hover:border-primary/50"
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="font-semibold">{app.name}</p>
                              <p className="text-sm opacity-70">{app.email}</p>
                              {activeTab === "career" && (
                                <p className="text-xs opacity-60 mt-1">
                                  Position: {(app as CareerApplication).position}
                                </p>
                              )}
                            </div>
                            <div className={`badge ${
                              app.status === "pending"
                                ? "badge-warning"
                                : app.status === "reviewing"
                                ? "badge-info"
                                : app.status === "accepted"
                                ? "badge-success"
                                : "badge-error"
                            }`}>
                              {app.status}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              {selectedApp ? (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body">
                    <div className="flex justify-between items-center">
                      <button onClick={() => setSelectedApp(null)} className="btn btn-ghost btn-sm">
                        ← Back
                      </button>
                      <div></div>
                    </div>
                    <h3 className="card-title text-lg">{selectedApp.name}</h3>

                    <div className="divider my-2"></div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="opacity-70">Email</p>
                        <p className="font-semibold break-all">{selectedApp.email}</p>
                      </div>

                      {activeTab === "career" ? (
                        <>
                          <div>
                            <p className="opacity-70">Position</p>
                            <p className="font-semibold">{(selectedApp as CareerApplication).position}</p>
                          </div>

                          {(selectedApp as CareerApplication).portfolio_url && (
                            <div>
                              <p className="opacity-70">Portfolio</p>
                              <a
                                href={(selectedApp as CareerApplication).portfolio_url!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="link link-primary break-all"
                              >
                                View Portfolio
                              </a>
                            </div>
                          )}
                        </>
                      ) : (
                        <>
                          <div>
                            <p className="opacity-70">Discord</p>
                            <p className="font-semibold break-all">{(selectedApp as CommunityApplication).discord_name || "—"}</p>
                          </div>

                          <div>
                            <p className="opacity-70">Country</p>
                            <p className="font-semibold">{(selectedApp as CommunityApplication).country}</p>
                          </div>

                          <div>
                            <p className="opacity-70">Malaysia</p>
                            <p className="font-semibold">{(selectedApp as CommunityApplication).is_malaysian ? "Yes" : "No"}</p>
                          </div>
                        </>
                      )}

                      <div>
                        <p className="opacity-70">Applied</p>
                        <p className="font-semibold">{new Date(selectedApp.created_at).toLocaleDateString()}</p>
                      </div>

                      <div>
                        <p className="opacity-70 mb-2">{activeTab === "career" ? "Motivation" : "About"}</p>
                        <p className="bg-base-100 p-2 rounded text-xs leading-relaxed max-h-32 overflow-y-auto">
                          {activeTab === "career"
                            ? (selectedApp as CareerApplication).motivation
                            : (selectedApp as CommunityApplication).supporting_info}
                        </p>
                      </div>
                    </div>

                    <div className="divider my-2"></div>

                    {editingStatus ? (
                      <div className="space-y-2">
                        <select
                          value={selectedApp.status}
                          onChange={(e) => {
                            setSelectedApp({
                              ...selectedApp,
                              status: e.target.value as any,
                            });
                          }}
                          className="select select-bordered select-sm w-full"
                        >
                          <option value="pending">Pending</option>
                          <option value="reviewing">Reviewing</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>

                        <textarea
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Add admin notes..."
                          className="textarea textarea-bordered textarea-sm w-full"
                          rows={3}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              updateApplicationStatus(selectedApp.id, selectedType, selectedApp.status, editNotes);
                            }}
                            className="btn btn-sm btn-primary flex-1"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingStatus(false)}
                            className="btn btn-sm btn-ghost flex-1"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="bg-base-100 p-3 rounded">
                          <p className="text-xs opacity-70 mb-1">Status</p>
                          <div className={`badge ${
                            selectedApp.status === "pending"
                              ? "badge-warning"
                              : selectedApp.status === "reviewing"
                              ? "badge-info"
                              : selectedApp.status === "accepted"
                              ? "badge-success"
                              : "badge-error"
                          }`}>
                            {selectedApp.status}
                          </div>
                        </div>

                        {selectedApp.admin_notes && (
                          <div className="bg-base-100 p-3 rounded">
                            <p className="text-xs opacity-70 mb-1">Admin Notes</p>
                            <p className="text-sm">{selectedApp.admin_notes}</p>
                          </div>
                        )}

                        <button onClick={() => setEditingStatus(true)} className="btn btn-sm btn-primary w-full">
                          Update Status & Notes
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="card bg-base-200 shadow-xl">
                  <div className="card-body items-center text-center">
                    <p className="opacity-70">Select an application to view details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Container>

        <Footer />
      </div>
    </div>
  );
}
