import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { companies } from '../../data/mockData';

export default function CompanyProfile() {
  const [company, setCompany] = useState(companies[0]);
  const [name, setName] = useState(company.name);
  const [location, setLocation] = useState(company.location);
  const [industry, setIndustry] = useState(company.industry);
  const [size, setSize] = useState(company.employees);
  const [website, setWebsite] = useState(company.website);
  const [description, setDescription] = useState(company.description);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSave = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      // Save updates to mock object
      company.name = name;
      company.location = location;
      company.industry = industry;
      company.employees = size;
      company.website = website;
      company.description = description;

      setToast({ message: 'Company Profile updated successfully!', type: 'success' });
      setLoading(false);
    }, 800);
  };

  return (
    <DashboardLayout>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">Company Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your corporate branding, logo, and active employee sizes.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
            <span className="text-4xl p-3 bg-gray-50 border border-gray-150 rounded-xl select-none">
              {company.logo || '🏢'}
            </span>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{name || 'Company Name'}</h3>
              <p className="text-xs text-gray-500">{industry || 'Industry'} &bull; {location || 'Location'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Company Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Industry Segment</label>
              <input
                type="text"
                required
                value={industry}
                onChange={(e) => setIndustry(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">HQ Location</label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Company Size (employees)</label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Website URL</label>
              <input
                type="url"
                required
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">About the Company</label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white resize-none"
              />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors focus:outline-none"
            >
              {loading ? 'Saving updates...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
