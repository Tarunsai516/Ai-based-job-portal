import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function CompanyProfile() {
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [industry, setIndustry] = useState('');
  const [size, setSize] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    // Try to fetch recruiter's company profile from backend
    api.get('/companies/me')
      .then(res => {
        const c = res.data;
        setName(c.name || user?.companyName || user?.name || '');
        setLocation(c.location || '');
        setIndustry(c.industry || '');
        setSize(c.employees || '');
        setWebsite(c.website || '');
        setDescription(c.description || '');
        setFetching(false);
      })
      .catch(() => {
        // Prefill from user auth data if no company record yet
        setName(user?.companyName || user?.name || '');
        setFetching(false);
      });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/companies/me', { name, location, industry, employees: size, website, description });
      setToast({ message: 'Company profile updated successfully!', type: 'success' });
    } catch {
      setToast({ message: 'Failed to save. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4" />
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Company Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your company branding visible to job seekers.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="flex items-center space-x-4 pb-6 border-b border-gray-100">
            <span className="text-4xl p-3 bg-gray-50 border border-gray-150 rounded-xl select-none">🏢</span>
            <div>
              <h3 className="text-sm font-bold text-gray-800">{name || 'Your Company'}</h3>
              <p className="text-xs text-gray-500">{industry || 'Industry'} &bull; {location || 'Location'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Company Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Industry</label>
              <input type="text" value={industry} onChange={e => setIndustry(e.target.value)}
                placeholder="e.g. Software & Technology"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">HQ Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Company Size</label>
              <input type="text" value={size} onChange={e => setSize(e.target.value)}
                placeholder="e.g. 50–200 employees"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Website URL</label>
              <input type="url" value={website} onChange={e => setWebsite(e.target.value)}
                placeholder="https://yourcompany.com"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">About the Company</label>
              <textarea rows={4} value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe your company culture, mission, and the type of talent you're looking for..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none" />
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-gray-100">
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors">
              {loading ? 'Saving...' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
