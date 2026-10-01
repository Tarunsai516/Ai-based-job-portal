import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import {
  HiDocumentText,
  HiCloudUpload,
  HiChevronRight,
  HiCheckCircle,
  HiClock,
  HiOutlineTrash,
  HiOutlineDownload,
  HiOutlineEye
} from 'react-icons/hi';

export default function ResumeLibrary() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const fetchResumes = () => {
    setLoading(true);
    candidateService.getResumes()
      .then(setResumes)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const openResume = async (e, resumeId) => {
    e.stopPropagation();
    try {
      const blob = await candidateService.downloadResume(resumeId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setToast({ message: 'Failed to download resume.', type: 'error' });
    }
  };

  const handleDelete = async (e, resumeId) => {
    e.stopPropagation();
    setDeletingId(resumeId);
    try {
      await candidateService.deleteResume(resumeId);
      setResumes(prev => prev.filter(r => r.resumeId !== resumeId));
      setToast({ message: 'Resume deleted successfully.', type: 'success' });
      setConfirmDeleteId(null);
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete resume.', type: 'error' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-7">
        {/* Toast notification */}
        {toast && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Career profile</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Your resume library.</h1>
            <p className="text-sm text-slate-500 mt-2">Manage all versions of your CV. Delete outdated resumes or upload specialized versions for different roles.</p>
          </div>
          <Link to="/resume/upload" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm">
            <HiCloudUpload className="h-4 w-4" /> Upload resume
          </Link>
        </div>

        {loading && <div className="grid md:grid-cols-2 gap-4">{[1, 2].map(item => <div key={item} className="surface h-40 animate-pulse" />)}</div>}
        {error && <div className="surface p-8 text-center text-sm text-rose-600">We could not load your resumes. Please try again.</div>}
        {!loading && !error && resumes.length === 0 && (
          <div className="surface p-12 text-center space-y-4">
            <HiDocumentText className="h-12 w-12 text-slate-300 mx-auto" />
            <div><h2 className="text-lg font-bold text-slate-900 dark:text-white">No resumes yet</h2><p className="text-sm text-slate-500 mt-1">Upload your first resume and TalentSync will extract your skills and experience.</p></div>
            <Link to="/resume/upload" className="inline-flex px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold shadow-sm hover:bg-blue-700 transition-colors">Upload your first resume</Link>
          </div>
        )}
        {!loading && !error && resumes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {resumes.map(resume => (
              <div
                key={resume.resumeId}
                onClick={() => navigate(`/resume/${resume.resumeId}`)}
                className="surface text-left p-5 hover:border-blue-300 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <span className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                        <HiDocumentText className="h-6 w-6" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <h2 className="font-bold text-slate-900 dark:text-white truncate" title={resume.filename}>
                          {resume.filename}
                        </h2>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Uploaded {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'recently'}
                          {resume.fileSize ? ` · ${(resume.fileSize / 1024).toFixed(0)} KB` : ''}
                        </p>
                      </div>
                    </div>
                    <HiChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 shrink-0 transition-colors" />
                  </div>

                  {/* Status pill */}
                  <div className="mt-3">
                    <span className={`inline-flex items-center gap-1 text-[11px] font-bold ${
                      resume.status === 'COMPLETED' ? 'text-emerald-600' : resume.status === 'FAILED' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {resume.status === 'COMPLETED' ? <HiCheckCircle /> : <HiClock />} {resume.status === 'COMPLETED' ? 'AI analyzed' : resume.status.toLowerCase()}
                    </span>
                  </div>
                </div>

                {/* Bottom Action Toolbar */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs" onClick={e => e.stopPropagation()}>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => openResume(e, resume.resumeId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] transition-colors"
                      title="Preview / Download"
                    >
                      <HiOutlineEye className="h-3.5 w-3.5" /> Preview
                    </button>
                    <button
                      type="button"
                      onClick={(e) => openResume(e, resume.resumeId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold text-[11px] transition-colors"
                      title="Download resume file"
                    >
                      <HiOutlineDownload className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {confirmDeleteId === resume.resumeId ? (
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-rose-600 font-bold">Delete?</span>
                      <button
                        type="button"
                        disabled={deletingId === resume.resumeId}
                        onClick={(e) => handleDelete(e, resume.resumeId)}
                        className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50"
                      >
                        {deletingId === resume.resumeId ? '...' : 'Yes, delete'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[10px] transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(resume.resumeId)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-[11px] transition-colors"
                      title="Delete resume"
                    >
                      <HiOutlineTrash className="h-3.5 w-3.5" /> Delete
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
