import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';

export default function EditProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [summary, setSummary] = useState('');
  const [skills, setSkills] = useState('');
  const [experience, setExperience] = useState('');
  const [education, setEducation] = useState('');

  useEffect(() => {
    const candidateId = user?.id || 1;
    candidateService.getById(candidateId)
      .then(data => {
        setName(data.name || user?.name || '');
        setTitle(data.title || '');
        setLocation(data.location || '');
        setEmail(data.email || user?.email || '');
        setPhone(data.phone || '');
        setSummary(data.summary || '');
        setSkills((data.skills || []).join(', '));
        setExperience(data.experience || '');
        setEducation(data.education || '');
        setFetching(false);
      })
      .catch(() => {
        // Fallback to auth user data
        setName(user?.name || '');
        setEmail(user?.email || '');
        setFetching(false);
      });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await candidateService.updateProfile({
        name,
        title,
        location,
        email,
        phone,
        summary,
        skills: skills.split(',').map(s => s.trim()).filter(Boolean),
        experience,
        education,
      });
      setToast({ message: 'Profile updated successfully!', type: 'success' });
      setTimeout(() => navigate('/profile'), 1000);
    } catch (err) {
      setToast({ message: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3" />
          <div className="bg-white border border-gray-200 rounded-xl p-8 space-y-4">
            {[1,2,3,4,5].map(i => <div key={i} className="h-10 bg-gray-100 rounded" />)}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
          <p className="text-xs text-gray-500 mt-0.5">Update your bio, skills, and contact information. Changes are saved to the database.</p>
        </div>

        <form onSubmit={handleSave} className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-gray-700">Full Name</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Professional Title</label>
              <input type="text" value={title} onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Senior React Developer"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Email Address</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Phone Number</label>
              <input type="text" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Location</label>
              <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700">Years of Experience</label>
              <input type="text" value={experience} onChange={e => setExperience(e.target.value)}
                placeholder="e.g. 3 years"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Education</label>
              <input type="text" value={education} onChange={e => setEducation(e.target.value)}
                placeholder="e.g. B.S. in Computer Science"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Professional Summary</label>
              <textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)}
                placeholder="Describe your background, expertise, and career goals..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white resize-none" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700">Skills <span className="text-gray-400 font-normal">(comma separated)</span></label>
              <input type="text" value={skills} onChange={e => setSkills(e.target.value)}
                placeholder="React, JavaScript, Tailwind CSS, Node.js"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100">
            <button type="button" onClick={() => navigate('/profile')}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
