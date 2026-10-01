import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import {
  HiChevronLeft,
  HiDocumentText,
  HiOutlineDownload,
  HiOutlineEye,
  HiOutlineTrash
} from 'react-icons/hi';

export default function ResumeDetail() {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    candidateService.getResume(resumeId)
      .then(setResume)
      .catch(() => setResume(null))
      .finally(() => setLoading(false));
  }, [resumeId]);

  const openResume = async () => {
    try {
      const blob = await candidateService.downloadResume(resumeId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setToast({ message: 'Failed to download resume.', type: 'error' });
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await candidateService.deleteResume(resumeId);
      navigate('/resume/library', { replace: true });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete resume.', type: 'error' });
      setIsDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (loading) return <DashboardLayout><div className="surface h-64 animate-pulse" /></DashboardLayout>;
  if (!resume) return (
    <DashboardLayout>
      <div className="surface p-8 text-center space-y-4">
        <p className="text-slate-600">Resume not found or has been deleted.</p>
        <Link to="/resume/library" className="inline-flex px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-bold">Back to Library</Link>
      </div>
    </DashboardLayout>
  );

  const parsed = resume.parsedData || {};
  const education = parsed.education || [];
  const experience = parsed.experience || [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {toast && (
          <div className="p-4 rounded-xl text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center justify-between">
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        <Link to="/resume/library" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600">
          <HiChevronLeft /> Resume library
        </Link>

        <div className="surface p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-center gap-4">
              <span className="h-14 w-14 grid place-items-center rounded-xl bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400">
                <HiDocumentText className="h-8 w-8" />
              </span>
              <div>
                <p className="eyebrow">Resume overview</p>
                <h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white break-all">{resume.filename}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  {resume.status} {resume.processedAt ? `· analyzed ${new Date(resume.processedAt).toLocaleDateString()}` : ''}
                  {resume.fileSize ? ` · ${(resume.fileSize / 1024).toFixed(0)} KB` : ''}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={openResume}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <HiOutlineEye className="h-4 w-4" /> Preview
              </button>
              <button
                type="button"
                onClick={openResume}
                className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <HiOutlineDownload className="h-4 w-4" /> Download
              </button>

              {confirmDelete ? (
                <div className="inline-flex items-center gap-1.5 ml-2 p-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-lg">
                  <span className="text-[11px] text-rose-600 font-bold px-1">Delete resume?</span>
                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={handleDelete}
                    className="px-2.5 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] transition-colors disabled:opacity-50"
                  >
                    {isDeleting ? 'Deleting...' : 'Confirm'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[11px] transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 transition-colors"
                >
                  <HiOutlineTrash className="h-4 w-4" /> Delete Resume
                </button>
              )}
            </div>
          </div>
        </div>

        {resume.status !== 'COMPLETED' ? (
          <div className="surface p-6 text-sm text-amber-700">
            This resume is still being analyzed. Refresh this page when processing is complete.
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-3 gap-5">
              <section className="surface p-6 lg:col-span-2 space-y-5">
                <div>
                  <p className="eyebrow">AI summary</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed mt-2">
                    {parsed.summary || 'No summary was extracted.'}
                  </p>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                  <p className="eyebrow">Skills found</p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    {(parsed.skills || []).map(skill => (
                      <span key={skill} className="px-2.5 py-1 rounded-md bg-blue-50 dark:bg-slate-800 border border-blue-100 dark:border-slate-700 text-blue-700 dark:text-blue-300 text-xs font-bold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </section>
              <section className="surface p-6 space-y-4">
                <p className="eyebrow">Profile signals</p>
                <div>
                  <p className="text-xs text-slate-400">Estimated experience</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{parsed.estimatedYearsOfExperience || 0} years</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Education</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{education[0]?.degree || 'Not specified'}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Projects</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{(parsed.projects || []).length}</p>
                </div>
              </section>
            </div>
            <section className="surface p-6 space-y-4">
              <p className="eyebrow">Experience and projects</p>
              {experience.length === 0 && (parsed.projects || []).length === 0 && (
                <p className="text-sm text-slate-500">No detailed entries were extracted.</p>
              )}
              {experience.map((item, index) => (
                <div key={`${item.title}-${index}`} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4 space-y-1">
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{item.title || 'Experience'}</p>
                  <p className="text-xs text-slate-500">{item.company} {item.duration ? `· ${item.duration}` : ''}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">{item.description}</p>
                </div>
              ))}
              {(parsed.projects || []).map(project => (
                <div key={project} className="border-l-2 border-teal-200 dark:border-teal-800 pl-4 text-sm text-slate-600 dark:text-slate-300">
                  {project}
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
