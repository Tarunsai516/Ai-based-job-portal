import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { useAuth } from '../../context/AuthContext';

export default function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);

  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [experience, setExperience] = useState('');
  const [type, setType] = useState('Remote');
  const [skills, setSkills] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !location || !salary || !experience || !skills || !description) {
      setToast({ message: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      await jobService.create({
        title,
        location,
        salary,
        experience,
        type,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        description,
        companyName: user?.companyName || user?.name || 'Company',
        recruiterId: user?.id ? String(user.id) : '',
        recruiterEmail: user?.email || '',
        recruiterName: user?.name || 'Recruiter',
      });

      setToast({ message: 'Job posted successfully! Candidates can now apply.', type: 'success' });
      setTimeout(() => navigate('/recruiter/manage-jobs'), 1000);
    } catch (err) {
      setToast({ message: 'Failed to post job. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Post a Job</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Fill in the job details. Skills you tag will be used by TalentSync AI to match candidates automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Job Title <span className="text-red-500">*</span></label>
              <input type="text" required value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior Frontend Developer"
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
              <label className="block text-xs font-semibold text-gray-700">Location <span className="text-red-500">*</span></label>
              <input type="text" required value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Salary Range <span className="text-red-500">*</span></label>
              <input type="text" required value={salary} onChange={e => setSalary(e.target.value)}
                placeholder="e.g. $120,000 – $140,000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Experience Required <span className="text-red-500">*</span></label>
              <input type="text" required value={experience} onChange={e => setExperience(e.target.value)}
                placeholder="e.g. 3+ years"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700">Skills Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <input type="text" required value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="React, JavaScript, Tailwind CSS"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Detailed Description <span className="text-red-500">*</span></label>
              <textarea rows={5} required value={description} onChange={e => setDescription(e.target.value)}
                placeholder="Describe responsibilities, tech stack, expectations, and benefits..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/recruiter')}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors">
              {loading ? 'Posting...' : 'Post Job'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
