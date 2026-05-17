'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import PageLayout from '@/components/PageLayout';
import Container from '@/components/Container';
import RequirementsEditor from '@/components/admin/RequirementsEditor';
import BenefitsEditor from '@/components/admin/BenefitsEditor';

export default function AgencySettingsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'requirements' | 'benefits'>('requirements');
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        const res = await fetch('/api/admin/requirements');
        if (res.status === 403) {
          // Not authorized
          router.push('/dashboard');
        } else {
          setIsAdmin(true);
        }
      } catch {
        // Error occurred, likely not authorized
        router.push('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();
  }, [router]);

  if (loading) {
    return (
      <PageLayout>
        <Container>
          <div className="py-12 text-center">Loading...</div>
        </Container>
      </PageLayout>
    );
  }

  if (!isAdmin) {
    return (
      <PageLayout>
        <Container>
          <div className="py-12 text-center text-error">
            You don't have permission to access this page.
          </div>
        </Container>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <Container>
        <div className="py-12">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-4xl font-bold">Agency Content Management</h1>
              <Link href="/dashboard" className="btn btn-sm">Back to dashboard</Link>
            </div>
          </div>

          <div className="tabs tabs-bordered mb-8">
            <button
              onClick={() => setActiveTab('requirements')}
              className={`tab ${activeTab === 'requirements' ? 'tab-active' : ''}`}
            >
              Requirements
            </button>
            <button
              onClick={() => setActiveTab('benefits')}
              className={`tab ${activeTab === 'benefits' ? 'tab-active' : ''}`}
            >
              Benefits
            </button>
          </div>

          {activeTab === 'requirements' && (
            <RequirementsEditor />
          )}

          {activeTab === 'benefits' && (
            <BenefitsEditor />
          )}

          <div className="divider my-8"></div>

          <div className="card bg-base-200">
            <div className="card-body">
              <h2 className="card-title">Quick Guide</h2>
              <ul className="list-disc list-inside space-y-2 opacity-80">
                <li>Requirements are shown on the Join page when people apply as talents or artists</li>
                <li>Benefits highlight what applicants will gain by joining StarMyriad</li>
                <li>Both requirements and benefits can be edited in real-time</li>
                <li>All changes are logged in the audit log for transparency</li>
                <li>Emoji support: Use 1-2 characters per field for visual appeal</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </PageLayout>
  );
}
