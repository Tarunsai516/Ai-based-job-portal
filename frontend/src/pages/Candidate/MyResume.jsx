import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { HiDocumentText, HiOutlineDownload, HiOutlineEye, HiCloudUpload, HiOutlineTrash } from 'react-icons/hi';

export default function MyResume() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const openResume = async () => {
    if (!profile?.resumeId) return;
    try {
      const blob = await candidateService.downloadResume(profile.resumeId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      setToast({ message: 'Failed to download resume.', type: 'error' });
    }
  };

  const loadData = () => {
    setLoading(true);
    Promise.all([candidateService.getMyProfile(), candidateService.getLatestResume()])
      .then(async ([data, resume]) => {
        setProfile({ ...data, resumeId: resume?.resumeId });
        if (resume?.status === 'COMPLETED') {
          setReviewLoading(true);
          try { setReview(await candidateService.reviewLatestResume()); } catch (_) { setReview(null); }
          setReviewLoading(false);
        } else {
          setReview(null);
        }
        setLoading(false);
      })
      .catch(() => { setProfile(null); setLoading(false); });
  };

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  const handleDelete = async () => {
    if (!profile?.resumeId) return;
    setIsDeleting(true);
    try {
      await candidateService.deleteResume(profile.resumeId);
      setToast({ message: 'Resume deleted successfully.', type: 'success' });
      setConfirmDelete(false);
      loadData();
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to delete resume.', type: 'error' });
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {toast && (
          <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between shadow-sm transition-all ${
            toast.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
          }`}>
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} className="ml-4 text-slate-400 hover:text-slate-600">✕</button>
          </div>
        )}

        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">My Resume</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your active CV and view AI-parsed sections.</p>
          </div>
          <Link
            to="/resume/upload"
            className="inline-flex items-center space-x-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
          >
            <HiCloudUpload className="h-4 w-4" />
            <span>{profile?.resumeUrl ? 'Replace Resume' : 'Upload Resume'}</span>
          </Link>
        </div>

        {loading ? (
          <div className="bg-white dark:bg-slate-900 p-6 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm animate-pulse space-y-4">
            <div className="flex space-x-3">
              <div className="h-14 w-14 bg-gray-100 dark:bg-slate-800 rounded-xl" />
              <div className="flex-1 space-y-2 pt-2">
                <div className="h-3 bg-gray-200 dark:bg-slate-700 rounded w-1/2" />
                <div className="h-2 bg-gray-100 dark:bg-slate-800 rounded w-1/3" />
              </div>
            </div>
          </div>
        ) : !profile?.resumeUrl ? (
          <div className="bg-white dark:bg-slate-900 border border-dashed border-gray-300 dark:border-slate-700 rounded-xl p-12 text-center space-y-4">
            <HiDocumentText className="h-14 w-14 text-gray-200 dark:text-slate-700 mx-auto" />
            <div>
              <h3 className="text-sm font-bold text-gray-700 dark:text-gray-200">No Resume Uploaded</h3>
              <p className="text-xs text-gray-400 mt-1">Upload a PDF or DOCX resume to let TalentSync AI parse your skills and suggest roles.</p>
            </div>
            <Link
              to="/resume/upload"
              className="inline-block px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
            >
              Upload Your Resume
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-900 p-6 border border-gray-200 dark:border-slate-800 rounded-xl shadow-sm space-y-6">
            {/* File Info */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-gray-100 dark:border-slate-800">
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <span className="p-3 bg-blue-50 text-blue-600 dark:bg-slate-800 dark:text-blue-400 rounded-xl border border-blue-100 dark:border-slate-700 text-sm font-black select-none flex-shrink-0">
                  CV
                </span>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-bold text-gray-800 dark:text-white truncate" title={profile.resumeUrl}>
                    {profile.resumeUrl}
                  </h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">AI parsed · Auto-matched to job listings</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={openResume}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  <HiOutlineEye className="mr-1 h-4 w-4" /> Preview
                </button>
                <button
                  type="button"
                  onClick={openResume}
                  className="flex-1 sm:flex-none inline-flex items-center justify-center px-3 py-2 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800 text-xs font-semibold rounded-lg transition-colors"
                >
                  <HiOutlineDownload className="mr-1 h-4 w-4" /> Download
                </button>

                {confirmDelete ? (
                  <div className="flex items-center gap-1.5 p-1 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 rounded-lg">
                    <span className="text-[10px] text-rose-600 font-bold px-1">Delete?</span>
                    <button
                      type="button"
                      disabled={isDeleting}
                      onClick={handleDelete}
                      className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-700 text-white font-bold text-[10px] transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? '...' : 'Confirm'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-2 py-1 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-[10px] transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center justify-center px-3 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold rounded-lg transition-colors"
                    title="Delete resume"
                  >
                    <HiOutlineTrash className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Parsed Summary */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400">Parsed Profile Summary</h4>

              {profile.summary && (
                <p className="text-xs text-gray-600 dark:text-slate-300 leading-relaxed bg-gray-50 dark:bg-slate-800 p-4 rounded-lg border border-gray-100 dark:border-slate-700">
                  {profile.summary}
                </p>
              )}

              <div className="grid grid-cols-2 gap-6 pt-4 text-xs text-gray-700 dark:text-gray-300">
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block mb-1">Education</span>
                  <p>{profile.education || <span className="text-gray-400 italic">Not specified</span>}</p>
                </div>
                <div>
                  <span className="font-bold text-gray-800 dark:text-white block mb-1">Experience</span>
                  <p>{profile.experience || <span className="text-gray-400 italic">Not specified</span>}</p>
                </div>
              </div>

              {profile.skills?.length > 0 && (
                <div className="pt-4 border-t border-gray-100 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-2">Extracted Skills</span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map(skill => (
                      <span key={skill} className="bg-blue-50 dark:bg-slate-800 text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-slate-700 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {(reviewLoading || review) && (
                <div className="pt-5 border-t border-gray-100 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-400">TalentSync AI Resume Review</span>
                    {review && <span className="text-2xl font-black text-emerald-600">{review.resumeScore}<span className="text-xs">/100</span></span>}
                  </div>
                  {reviewLoading && <p className="text-xs text-gray-500">Reading your experience, impact, and skills...</p>}
                  {review?.weakSections?.length > 0 && <div><p className="text-[10px] font-bold uppercase text-gray-400 mb-2">Focus areas</p><div className="flex flex-wrap gap-2">{review.weakSections.map(section => <span key={section} className="text-xs px-2 py-1 rounded bg-amber-50 border border-amber-100 text-amber-700">{section}</span>)}</div></div>}
                  {review?.suggestions?.length > 0 && <div className="space-y-2">{review.suggestions.slice(0, 4).map((suggestion, index) => <div key={`${suggestion.section}-${index}`} className="bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-lg p-3"><p className="text-xs font-bold text-gray-800 dark:text-white">{suggestion.section || 'Resume improvement'}</p><p className="text-[11px] text-gray-600 dark:text-slate-300 mt-1 leading-relaxed">{suggestion.reason}</p>{suggestion.suggestedText && <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-2 leading-relaxed">{suggestion.suggestedText}</p>}</div>)}</div>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
