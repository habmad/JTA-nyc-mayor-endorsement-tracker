'use client';

import { useState } from 'react';

interface AddEndorserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface EndorserFormData {
  name: string;
  display_name: string;
  title: string;
  organization: string;
  category: string;
  subcategory: string;
  borough: string;
  influence_score: number;
  twitter_handle: string;
  instagram_handle: string;
  linkedin_url: string;
  personal_website: string;
  is_organization: boolean;
}

const CATEGORIES = [
  { value: 'politician', label: 'Politician' },
  { value: 'union', label: 'Union' },
  { value: 'celebrity', label: 'Celebrity' },
  { value: 'media', label: 'Media' },
  { value: 'business', label: 'Business' },
  { value: 'nonprofit', label: 'Nonprofit' },
  { value: 'academic', label: 'Academic' },
  { value: 'religious', label: 'Religious' }
];

const BOROUGHS = [
  'Manhattan',
  'Brooklyn', 
  'Queens',
  'Bronx',
  'Staten Island',
  'Citywide'
];

export default function AddEndorserModal({ isOpen, onClose, onSuccess }: AddEndorserModalProps) {
  const [formData, setFormData] = useState<EndorserFormData>({
    name: '',
    display_name: '',
    title: '',
    organization: '',
    category: '',
    subcategory: '',
    borough: '',
    influence_score: 50,
    twitter_handle: '',
    instagram_handle: '',
    linkedin_url: '',
    personal_website: '',
    is_organization: false
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (field: keyof EndorserFormData, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/endorsers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add endorser');
      }

      // Reset form
      setFormData({
        name: '',
        display_name: '',
        title: '',
        organization: '',
        category: '',
        subcategory: '',
        borough: '',
        influence_score: 50,
        twitter_handle: '',
        instagram_handle: '',
        linkedin_url: '',
        personal_website: '',
        is_organization: false
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">Add New Endorser</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Full Name *
                 </label>
                 <input
                   type="text"
                   required
                   value={formData.name}
                   onChange={(e) => handleInputChange('name', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., Alexandria Ocasio-Cortez"
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Display Name
                 </label>
                 <input
                   type="text"
                   value={formData.display_name}
                   onChange={(e) => handleInputChange('display_name', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., AOC"
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Title
                 </label>
                 <input
                   type="text"
                   value={formData.title}
                   onChange={(e) => handleInputChange('title', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., U.S. Representative"
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Organization
                 </label>
                 <input
                   type="text"
                   value={formData.organization}
                   onChange={(e) => handleInputChange('organization', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., U.S. House of Representatives"
                 />
              </div>
            </div>
          </div>

          {/* Category and Classification */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Category & Classification</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                             <div>
                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Category *
                 </label>
                 <select
                   required
                   value={formData.category}
                   onChange={(e) => handleInputChange('category', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                 >
                  <option value="">Select category</option>
                  {CATEGORIES.map(category => (
                    <option key={category.value} value={category.value}>
                      {category.label}
                    </option>
                  ))}
                </select>
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Subcategory
                 </label>
                 <input
                   type="text"
                   value={formData.subcategory}
                   onChange={(e) => handleInputChange('subcategory', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., federal_representative"
                 />
              </div>

                             <div>
                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Borough
                 </label>
                 <select
                   value={formData.borough}
                   onChange={(e) => handleInputChange('borough', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                 >
                  <option value="">Select borough</option>
                  {BOROUGHS.map(borough => (
                    <option key={borough} value={borough}>
                      {borough}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="is_organization"
                checked={formData.is_organization}
                onChange={(e) => handleInputChange('is_organization', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
                             <label htmlFor="is_organization" className="text-sm text-gray-900">
                 This is an organization (not an individual)
               </label>
            </div>
          </div>

          {/* Influence Score */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Influence Assessment</h3>
            
                         <div>
               <label className="block text-sm font-medium text-gray-900 mb-1">
                 Influence Score * ({formData.influence_score}/100)
               </label>
              <input
                type="range"
                min="0"
                max="100"
                required
                value={formData.influence_score}
                onChange={(e) => handleInputChange('influence_score', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>Low (0-30)</span>
                <span>Medium (31-70)</span>
                <span>High (71-100)</span>
              </div>
            </div>
          </div>

          {/* Social Media & Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Social Media & Contact</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Twitter Handle
                 </label>
                 <input
                   type="text"
                   value={formData.twitter_handle}
                   onChange={(e) => handleInputChange('twitter_handle', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., @AOC"
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Instagram Handle
                 </label>
                 <input
                   type="text"
                   value={formData.instagram_handle}
                   onChange={(e) => handleInputChange('instagram_handle', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="e.g., @ocasio_cortez"
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   LinkedIn URL
                 </label>
                 <input
                   type="url"
                   value={formData.linkedin_url}
                   onChange={(e) => handleInputChange('linkedin_url', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="https://linkedin.com/in/..."
                 />
              </div>

              <div>
                                 <label className="block text-sm font-medium text-gray-900 mb-1">
                   Personal Website
                 </label>
                 <input
                   type="url"
                   value={formData.personal_website}
                   onChange={(e) => handleInputChange('personal_website', e.target.value)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white"
                   placeholder="https://..."
                 />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isSubmitting ? 'Adding...' : 'Add Endorser'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 