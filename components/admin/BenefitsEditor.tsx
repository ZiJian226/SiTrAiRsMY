'use client';

import { useEffect, useState } from 'react';
import type { AgencyBenefit } from '@/lib/types';

const BENEFIT_CATEGORIES = [
  { value: 'identity', label: '✨ Build Identity' },
  { value: 'connection', label: '🤝 Connection' },
  { value: 'guidance', label: '📚 Guidance' },
  { value: 'freedom', label: '🆓 Freedom' },
  { value: 'promotion', label: '📢 Promotion Support' },
  { value: 'opportunities', label: '💰 Future Opportunities' },
  { value: 'safety', label: '🛡️ Safe Environment' },
  { value: 'experience', label: '🌌 Special Experience' },
];

export default function BenefitsEditor() {
  const [benefits, setBenefits] = useState<AgencyBenefit[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    category: 'identity',
    title: '',
    description: '',
    emoji: '',
    order: 0,
  });

  useEffect(() => {
    const fetchBenefits = async () => {
      try {
        const res = await fetch('/api/admin/benefits');
        const data = await res.json();
        setBenefits(data.data || []);
      } catch (error) {
        console.error('Error fetching benefits:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchBenefits();
  }, []);

  const handleOpenModal = (benefit?: AgencyBenefit) => {
    if (benefit) {
      setEditingId(benefit.id);
      setFormData({
        category: benefit.category,
        title: benefit.title,
        description: benefit.description,
        emoji: benefit.emoji || '',
        order: benefit.order,
      });
    } else {
      setEditingId(null);
      setFormData({
        category: 'identity',
        title: '',
        description: '',
        emoji: '',
        order: benefits.length,
      });
    }
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = '/api/admin/benefits';
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
        const updatedRes = await fetch('/api/admin/benefits', { credentials: 'same-origin' });
        const updatedData = await updatedRes.json();
        setBenefits(updatedData.data || []);
      } else {
        const err = await res.json().catch(() => null);
        alert('Failed to save benefit: ' + (err?.error || res.statusText || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error saving benefit:', error);
      alert('Error saving benefit. See console for details.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/benefits?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setDeleteConfirm(null);
        setBenefits(benefits.filter((b) => b.id !== id));
      }
    } catch (error) {
      console.error('Error deleting benefit:', error);
    }
  };

  const groupedBenefits = BENEFIT_CATEGORIES.reduce(
    (acc, cat) => {
      acc[cat.value] = benefits.filter((b) => b.category === cat.value);
      return acc;
    },
    {} as Record<string, AgencyBenefit[]>
  );

  if (loading) {
    return <div className="py-12 text-center">Loading...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-bold">Agency Benefits</h1>
          <p className="text-sm opacity-70 mt-2">Edit the benefits shown on the join page to attract applicants.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition"
        >
          + Add Benefit
        </button>
      </div>

      {BENEFIT_CATEGORIES.map((category) => (
        <div key={category.value} className="mb-12">
          <h2 className="text-2xl font-bold mb-4">{category.label}</h2>
          <div className="space-y-3">
            {groupedBenefits[category.value].length > 0 ? (
              groupedBenefits[category.value].map((benefit) => (
                <div
                  key={benefit.id}
                  className="flex items-start justify-between p-4 bg-gray-900 rounded-lg border border-gray-800 hover:border-gray-700"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {benefit.emoji && <span className="text-2xl">{benefit.emoji}</span>}
                      <h3 className="font-bold text-lg">{benefit.title}</h3>
                    </div>
                    <p className="text-gray-300 text-sm">{benefit.description}</p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleOpenModal(benefit)}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(benefit.id)}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No benefits in this category yet</p>
            )}
          </div>
        </div>
      ))}

      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">
              {editingId ? 'Edit Benefit' : 'Add Benefit'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                >
                  {BENEFIT_CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>
                      {cat.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Enter benefit title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
                  placeholder="Enter benefit description"
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

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full border border-gray-800">
            <h2 className="text-2xl font-bold mb-4">Delete Benefit?</h2>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this benefit? This action cannot be undone.
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
