import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';

export default function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [notFound, setNotFound] = useState(false);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [type, setType] = useState('Remote');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    jobService.getById(id)
      .then(job => {
        if (!job) { setNotFound(true); setFetching(false); return; }
        setTitle(job.title || '');
        setLocation(job.location || '');
        setSalary(job.salary || '');
        setExperience(job.experience || '');
        setType(job.type || 'Remote');
        setSkills((job.skills || []).join(', '));
        setDescription(job.description || '');
        setFetching(false);
      })
      .catch(() => { setNotFound(true); setFetching(false); });
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await jobService.update(id, {
        title, location, salary, experience, type,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        description,
      });
      setToast({ message: 'Job updated successfully!', type: 'success' });
      setTimeout(() => navigate('/recruiter/manage-jobs'), 1000);
    } catch {
      setToast({ message: 'Failed to update job. Please try again.', type: 'error' });
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

  if (notFound) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="text-xs text-gray-500 mt-2">This job post may have been removed or doesn't exist.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Job Post</h1>
          <p className="text-xs text-gray-500 mt-0.5">Modify requirements, skills tagging, or location preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Job Title</label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Job Type</label>
              <select value={type} onChange={e => setType(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
                <option value="Remote">Remote</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Location</label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Salary Range</label>
              <input type="text" required value={salary} onChange={e => setSalary(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Experience Required</label>
              <input type="text" required value={experience} onChange={e => setExperience(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Skills (comma separated)</label>
              <input type="text" required value={skills} onChange={e => setSkills(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Detailed Description</label>
              <textarea rows={5} required value={description} onChange={e => setDescription(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/recruiter/manage-jobs')}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors">
              {loading ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
