import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { HiOutlinePlusCircle, HiOutlineTrash } from 'react-icons/hi';

// Helper: inline list editor (add / remove items)
function ListEditor({ label, placeholder, items, onChange }) {
  const [draft, setDraft] = useState('');

  const addItem = () => {
    const trimmed = draft.trim();
    if (!trimmed) return;
    onChange([...items, trimmed]);
    setDraft('');
  };

  const removeItem = (idx) => onChange(items.filter((_, i) => i !== idx));

  return (
    <div className="space-y-2">
      {label && <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</label>}
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addItem(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white"
        />
        <button
          type="button"
          onClick={addItem}
          className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
        >
          <HiOutlinePlusCircle className="h-4 w-4" /> Add
        </button>
      </div>
      {items.length > 0 && (
        <ul className="space-y-1.5">
          {items.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs text-gray-700 dark:text-slate-300"
            >
              <span className="flex-1">{item}</span>
              <button
                type="button"
                onClick={() => removeItem(idx)}
                className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0 mt-0.5"
                aria-label="Remove item"
              >
                <HiOutlineTrash className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

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
  const [responsibilities, setResponsibilities] = useState([]);
  const [qualifications, setQualifications] = useState([]);
  const [benefits, setBenefits] = useState([]);

  const inputCls = 'mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-slate-800 dark:border-slate-600 dark:text-white';

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
        setResponsibilities(Array.isArray(job.responsibilities) ? job.responsibilities : []);
        setQualifications(Array.isArray(job.qualifications) ? job.qualifications : []);
        setBenefits(Array.isArray(job.benefits) ? job.benefits : []);
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
        responsibilities,
        qualifications,
        benefits,
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
        <div className="max-w-3xl mx-auto animate-pulse space-y-4">
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

      <div className="max-w-3xl mx-auto space-y-6">
        <div>
          <p className="eyebrow">Recruiter tools</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">Edit Job Post</h1>
          <p className="text-xs text-gray-500 mt-0.5">Modify requirements, skills tagging, responsibilities, or location preferences.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Core Details ───────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-6 md:p-8 space-y-5">
            <h2 className="text-sm font-bold text-gray-800 dark:text-white border-b border-gray-100 dark:border-slate-700 pb-3">Core Job Details</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Job Title</label>
                <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Job Type</label>
                <select value={type} onChange={e => setType(e.target.value)} className={inputCls}>
                  <option value="Remote">Remote</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Onsite">Onsite</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Location</label>
                <input type="text" required value={location} onChange={e => setLocation(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Salary Range</label>
                <input type="text" required value={salary} onChange={e => setSalary(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Experience Required</label>
                <input type="text" required value={experience} onChange={e => setExperience(e.target.value)} className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Skills (comma separated)</label>
                <input type="text" required value={skills} onChange={e => setSkills(e.target.value)} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">Job Description</label>
                <textarea rows={4} required value={description} onChange={e => setDescription(e.target.value)}
                  className={`${inputCls} resize-none`} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Responsibilities ─────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-6 md:p-8 space-y-4">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Key Responsibilities</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Press Enter or click Add after each item.</p>
            </div>
            <ListEditor
              placeholder="e.g. Lead architecture decisions for the frontend platform"
              items={responsibilities}
              onChange={setResponsibilities}
            />
          </div>

          {/* ── Section 3: Qualifications ──────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-6 md:p-8 space-y-4">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Requirements & Qualifications</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">Specific qualifications candidates must have. This drives AI matching accuracy.</p>
            </div>
            <ListEditor
              placeholder="e.g. 3+ years of React experience in production environments"
              items={qualifications}
              onChange={setQualifications}
            />
          </div>

          {/* ── Section 4: Benefits ────────────────────────────────────── */}
          <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-sm p-6 md:p-8 space-y-4">
            <div className="border-b border-gray-100 dark:border-slate-700 pb-3">
              <h2 className="text-sm font-bold text-gray-800 dark:text-white">Benefits & Perks</h2>
              <p className="text-[11px] text-gray-400 mt-0.5">What makes this role compelling?</p>
            </div>
            <ListEditor
              placeholder="e.g. Fully remote with flexible hours"
              items={benefits}
              onChange={setBenefits}
            />
          </div>

          {/* ── Footer Actions ─────────────────────────────────────────── */}
          <div className="flex justify-end space-x-3 pb-6">
            <button type="button" onClick={() => navigate('/recruiter/manage-jobs')}
              className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-6 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 rounded-lg shadow-sm transition-colors">
              {loading ? 'Saving...' : 'Save Updates'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
}
