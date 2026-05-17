'use client';

import { useEffect, useState } from 'react';
import type { AgencyRequirement } from '@/lib/types';

export default function RequirementsEditor() {
  const [requirements, setRequirements] = useState<AgencyRequirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    role: 'general',
    title: '',
    description: '',
    emoji: '',
    order: 0,
  });

  useEffect(() => {
    const fetchRequirements = async () => {
      try {
        const res = await fetch('/api/admin/requirements');
        const data = await res.json();
        setRequirements(data.data || []);
      } catch (error) {
        console.error('Error fetching requirements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequirements();
  }, []);

  const handleOpenModal = (requirement?: AgencyRequirement) => {
    if (requirement) {
      setEditingId(requirement.id);
      setFormData({
        role: requirement.role,
        title: requirement.title,
        description: requirement.description,
        emoji: requirement.emoji || '',
        order: requirement.order,
      });
    } else {
      setEditingId(null);
      setFormData({
        role: 'general',
        title: '',
        description: '',
        emoji: '',
        order: requirements.length,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = '/api/admin/requirements';
      const method = editingId ? 'PATCH' : 'POST';
      const payload = editingId ? { id: editingId, ...formData } : formData;

      const res = await fetch(url, {
        method,
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setShowModal(false);
        const updatedRes = await fetch('/api/admin/requirements', { credentials: 'same-origin' });
        const updatedData = await updatedRes.json();
        setRequirements(updatedData.data || []);
      } else {
        const err = await res.json().catch(() => null);
        alert('Failed to save requirement: ' + (err?.error || res.statusText || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving requirement:', error);
      alert('Error saving requirement. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/requirements?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteConfirm(null);
        setRequirements(requirements.filter((r) => r.id !== id));
      }
    } catch (error) {
      console.error('Error deleting requirement:', error);
    }
  };

  const groupedRequirements = {
    general: requirements.filter((r) => r.role === 'general'),
    artist: requirements.filter((r) => r.role === 'artist'),
    talent: requirements.filter((r) => r.role === 'talent'),
  };

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">Agency Requirements</h1>
          <p className="text-sm opacity-70 mt-2">Edit the join page requirements shown to talents and artists.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
        >
          + Add Requirement
        </button>
      </div>

      {/* General Requirements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">General Requirements</h2>
        <div className="space-y-3">
          {groupedRequirements.general.length > 0 ? (
            groupedRequirements.general.map((req) => (
              <div
                key={req.id}
                className="flex items-start justify-between p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {req.emoji && <span className="text-2xl">{req.emoji}</span>}
                    <h3 className="font-bold text-lg">{req.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{req.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(req)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(req.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No general requirements yet</p>
          )}
        </div>
      </div>

      {/* Artist Requirements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🎨 Artist Requirements</h2>
        <div className="space-y-3">
          {groupedRequirements.artist.length > 0 ? (
            groupedRequirements.artist.map((req) => (
              <div
                key={req.id}
                className="flex items-start justify-between p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {req.emoji && <span className="text-2xl">{req.emoji}</span>}
                    <h3 className="font-bold text-lg">{req.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{req.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(req)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(req.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No artist requirements yet</p>
          )}
        </div>
      </div>

      {/* Talent Requirements */}
      <div className="mb-12">
        <h2 className="text-2xl font-bold mb-4">🎥 Talent Requirements</h2>
        <div className="space-y-3">
          {groupedRequirements.talent.length > 0 ? (
            groupedRequirements.talent.map((req) => (
              <div
                key={req.id}
                className="flex items-start justify-between p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {req.emoji && <span className="text-2xl">{req.emoji}</span>}
                    <h3 className="font-bold text-lg">{req.title}</h3>
                  </div>
                  <p className="text-gray-300 text-sm">{req.description}</p>
                </div>
                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => handleOpenModal(req)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(req.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-400">No talent requirements yet</p>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Requirement' : 'Add Requirement'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Role</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  <option value="general">General</option>
                  <option value="artist">Artist</option>
                  <option value="talent">Talent</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Enter requirement title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Enter requirement description"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Emoji</label>
                <input
                  type="text"
                  value={formData.emoji}
                  onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Optional emoji"
                  maxLength={8}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Order</label>
                <input
                  type="number"
                  value={formData.order}
                  onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex-1 px-4 py-2 text-white rounded ${saving ? 'bg-purple-400' : 'bg-purple-600 hover:bg-purple-700'}`}
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Delete Requirement?</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this requirement? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
