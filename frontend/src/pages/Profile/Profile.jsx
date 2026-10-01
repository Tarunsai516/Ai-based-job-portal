import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineUser, HiOutlineMail, HiOutlinePhone,
  HiOutlineLocationMarker, HiPencil, HiOutlineDocumentText,
  HiOutlineAcademicCap, HiOutlineBriefcase, HiOutlineSparkles,
  HiOutlineCheckCircle, HiOutlineClock, HiOutlineExclamationCircle,
  HiOutlineChip, HiOutlineArrowRight, HiOutlineUpload,
  HiOutlineTrash, HiOutlineDownload
} from 'react-icons/hi';

// ── Strength meter helpers ────────────────────────────────────────────────────
function computeStrength(profile, resumes) {
  const sections = [
    { key: 'name',       label: 'Full name',          done: Boolean(profile?.name) },
    { key: 'title',      label: 'Professional title', done: Boolean(profile?.title) },
    { key: 'location',   label: 'Location',           done: Boolean(profile?.location) },
    { key: 'phone',      label: 'Phone number',       done: Boolean(profile?.phone) },
    { key: 'summary',    label: 'About / summary',    done: Boolean(profile?.summary) },
    { key: 'skills',     label: 'Skills added',       done: (profile?.skills?.length || 0) >= 3 },
    { key: 'experience', label: 'Work experience',    done: Boolean(profile?.experience) },
    { key: 'education',  label: 'Education',          done: Boolean(profile?.education) },
    { key: 'resume',     label: 'Resume uploaded',    done: (resumes?.length || 0) > 0 },
  ];
  const done = sections.filter(s => s.done).length;
  const pct  = Math.round((done / sections.length) * 100);
  return { sections, done, total: sections.length, pct };
}

function strengthLabel(pct) {
  if (pct >= 85) return { text: 'Strong', color: 'text-emerald-600' };
  if (pct >= 60) return { text: 'Good',   color: 'text-blue-600' };
  if (pct >= 35) return { text: 'Fair',   color: 'text-amber-500' };
  return             { text: 'Weak',    color: 'text-red-500' };
}

function strengthBarColor(pct) {
  if (pct >= 85) return 'bg-emerald-400';
  if (pct >= 60) return 'bg-blue-500';
  if (pct >= 35) return 'bg-amber-400';
  return 'bg-red-400';
}

// ── Resume status pill ────────────────────────────────────────────────────────
function ResumePill({ status }) {
  if (status === 'COMPLETED')  return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100"><HiOutlineCheckCircle className="h-3 w-3" />Processed</span>;
  if (status === 'PROCESSING') return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-100"><HiOutlineClock className="h-3 w-3" />Processing</span>;
  if (status === 'FAILED')     return <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-100"><HiOutlineExclamationCircle className="h-3 w-3" />Failed</span>;
  return                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 border border-gray-200"><HiOutlineClock className="h-3 w-3" />Uploaded</span>;
}

// ── Section wrapper ────────────────────────────────────────────────────────────
function Section({ title, icon: Icon, iconColor = 'text-blue-600 bg-blue-50 border-blue-100', children, actionTo, actionLabel }) {
  return (
    <div className="surface p-6 md:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className={`h-8 w-8 flex items-center justify-center rounded-lg border ${iconColor}`}>
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-sm font-bold text-gray-800 dark:text-white">{title}</h2>
        </div>
        {actionTo && (
          <Link to={actionTo} className="text-xs font-bold text-blue-600 hover:underline flex items-center gap-1">
            {actionLabel || 'Edit'} <HiOutlineArrowRight className="h-3 w-3" />
          </Link>
        )}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────
export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [resumes, setResumes]  = useState([]);
  const [loading, setLoading]  = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    Promise.all([
      candidateService.getMyProfile().catch(() => null),
      candidateService.getResumes().catch(() => []),
    ]).then(([profileData, resumeData]) => {
      setProfile(profileData || {
        name: user?.name || '',
        email: user?.email || '',
        title: '', location: '', phone: '', summary: '',
        skills: [], experience: '', education: '',
      });
      setResumes(Array.isArray(resumeData) ? resumeData : []);
      setLoading(false);
    });
  }, [user]);

  const handleDownloadResume = async (resumeId) => {
    try {
      const blob = await candidateService.downloadResume(resumeId);
      const url = URL.createObjectURL(blob);
      window.open(url, '_blank', 'noopener,noreferrer');
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      // ignore
    }
  };

  const handleDeleteResume = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;
    try {
      await candidateService.deleteResume(resumeId);
      setResumes(prev => prev.filter(r => r.resumeId !== resumeId));
      const updatedProfile = await candidateService.getMyProfile().catch(() => null);
      if (updatedProfile) setProfile(updatedProfile);
    } catch {
      // ignore
    }
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto space-y-5 animate-pulse">
          {/* Hero skeleton */}
          <div className="surface p-8">
            <div className="flex gap-5 items-start">
              <div className="h-20 w-20 rounded-2xl bg-gray-200 flex-shrink-0" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="h-5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-100 rounded w-1/4" />
                <div className="h-3 bg-gray-100 rounded w-1/2" />
              </div>
            </div>
          </div>
          {[1,2,3].map(i => (
            <div key={i} className="surface p-8 space-y-3">
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      </DashboardLayout>
    );
  }

  const { sections: strengthSections, done: strengthDone, total: strengthTotal, pct: strengthPct } = computeStrength(profile, resumes);
  const { text: strengthText, color: strengthTextColor } = strengthLabel(strengthPct);
  const barColor = strengthBarColor(strengthPct);
  const initials = (profile?.name || user?.name || 'U').slice(0, 2).toUpperCase();
  const missing  = strengthSections.filter(s => !s.done);

  return (
    <DashboardLayout>
      <div className="space-y-5 max-w-4xl mx-auto">

        {/* ── Page header ──────────────────────────────────────────────────── */}
        <div>
          <p className="eyebrow">Career profile</p>
          <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Your professional identity.</h1>
          <p className="text-sm text-slate-500 mt-2">Keep your profile complete so TalentSync can surface stronger matches and explain them to recruiters.</p>
        </div>

        {/* ── Hero / Identity Card ─────────────────────────────────────────── */}
        <div className="relative surface overflow-hidden">
          {/* Gradient banner strip */}
          <div className="h-24 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-t-xl" />

          <div className="px-6 md:px-8 pb-6">
            {/* Avatar & Edit button row */}
            <div className="flex items-end justify-between -mt-10 mb-4">
              <div className="h-20 w-20 rounded-2xl bg-slate-950 text-white flex items-center justify-center text-2xl font-bold select-none ring-4 ring-white dark:ring-slate-900 shadow-lg">
                {initials}
              </div>
              <Link
                to="/profile/edit"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors bg-white"
              >
                <HiPencil className="h-3.5 w-3.5" />
                Edit Profile
              </Link>
            </div>

            {/* Name & Meta */}
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-none">
                {profile?.name || user?.name || 'Your Name'}
              </h2>
              <p className="text-sm font-medium text-gray-500">
                {profile?.title || <span className="italic text-gray-400">No title — <Link to="/profile/edit" className="text-blue-600 hover:underline">add one</Link></span>}
              </p>
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                {profile?.location && (
                  <span className="flex items-center gap-1"><HiOutlineLocationMarker className="h-3.5 w-3.5" />{profile.location}</span>
                )}
                <span className="flex items-center gap-1">
                  <HiOutlineMail className="h-3.5 w-3.5" />{profile?.email || user?.email}
                </span>
                {profile?.phone && (
                  <span className="flex items-center gap-1"><HiOutlinePhone className="h-3.5 w-3.5" />{profile.phone}</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Two-column grid below ─────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">

          {/* LEFT COLUMN (2/3) ─────────────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-5">

            {/* About */}
            <Section title="About Me" icon={HiOutlineUser} actionTo="/profile/edit" actionLabel="Edit">
              {profile?.summary
                ? <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{profile.summary}</p>
                : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-5 text-center">
                    <p className="text-xs text-gray-400 mb-2">No summary added yet. A compelling summary gets you noticed.</p>
                    <Link to="/profile/edit" className="text-xs font-bold text-blue-600 hover:underline">Add your summary →</Link>
                  </div>
                )
              }
            </Section>

            {/* Skills */}
            <Section
              title="Technical Skills"
              icon={HiOutlineChip}
              iconColor="text-purple-600 bg-purple-50 border-purple-100"
              actionTo="/profile/edit"
              actionLabel="Edit skills"
            >
              {profile?.skills?.length > 0
                ? (
                  <div className="flex flex-wrap gap-2">
                    {profile.skills.map((skill) => (
                      <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1.5 rounded-lg font-semibold">
                        {skill}
                      </span>
                    ))}
                  </div>
                )
                : (
                  <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-5 text-center">
                    <p className="text-xs text-gray-400 mb-2">No skills listed. Skills are used for AI matching.</p>
                    <Link to="/profile/edit" className="text-xs font-bold text-blue-600 hover:underline">Add skills →</Link>
                  </div>
                )
              }
            </Section>

            {/* Experience & Education */}
            <Section
              title="Experience & Education"
              icon={HiOutlineBriefcase}
              iconColor="text-emerald-600 bg-emerald-50 border-emerald-100"
              actionTo="/profile/edit"
              actionLabel="Edit"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Experience card */}
                <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineBriefcase className="h-4 w-4 text-emerald-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Experience</p>
                  </div>
                  {profile?.experience
                    ? <p className="text-sm font-bold text-gray-800 dark:text-white">{profile.experience}</p>
                    : <p className="text-xs text-gray-400 italic">Not specified — <Link to="/profile/edit" className="text-blue-600 hover:underline">add it</Link></p>
                  }
                </div>

                {/* Education card */}
                <div className="bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl p-4 space-y-1">
                  <div className="flex items-center gap-2 mb-2">
                    <HiOutlineAcademicCap className="h-4 w-4 text-blue-600" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Education</p>
                  </div>
                  {profile?.education
                    ? <p className="text-sm font-bold text-gray-800 dark:text-white">{profile.education}</p>
                    : <p className="text-xs text-gray-400 italic">Not specified — <Link to="/profile/edit" className="text-blue-600 hover:underline">add it</Link></p>
                  }
                </div>
              </div>
            </Section>

            {/* Resume Library */}
            <Section
              title="Resume Library"
              icon={HiOutlineDocumentText}
              iconColor="text-amber-600 bg-amber-50 border-amber-100"
              actionTo="/resume/upload"
              actionLabel="Upload new"
            >
              {resumes.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 dark:border-slate-700 rounded-xl p-6 text-center">
                  <HiOutlineUpload className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-gray-500 mb-1">No resumes yet</p>
                  <p className="text-xs text-gray-400 mb-3">Upload a PDF or DOCX and TalentSync will parse your skills automatically.</p>
                  <Link to="/resume/upload" className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors">
                    <HiOutlineUpload className="h-3.5 w-3.5" /> Upload Resume
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {resumes.map((resume, idx) => (
                    <div
                      key={resume.resumeId || idx}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-blue-300 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="h-9 w-9 bg-red-50 border border-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <HiOutlineDocumentText className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-gray-800 dark:text-white truncate">{resume.filename || `Resume ${idx + 1}`}</p>
                          {resume.createdAt && (
                            <p className="text-[10px] text-gray-400 mt-0.5">
                              Uploaded {new Date(resume.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                        {resume.fileSize && (
                          <span className="text-[10px] text-gray-400 hidden sm:block">
                            {(resume.fileSize / 1024).toFixed(0)} KB
                          </span>
                        )}
                        <ResumePill status={resume.status} />
                        {resume.resumeId && (
                          <div className="flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleDownloadResume(resume.resumeId)}
                              className="p-1 text-slate-400 hover:text-blue-600 rounded transition-colors"
                              title="Download resume"
                            >
                              <HiOutlineDownload className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteResume(resume.resumeId)}
                              className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                              title="Delete resume"
                            >
                              <HiOutlineTrash className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  <Link
                    to="/resume/upload"
                    className="flex items-center justify-center gap-2 w-full py-2.5 border border-dashed border-blue-300 hover:border-blue-500 text-blue-600 hover:text-blue-700 text-xs font-bold rounded-xl transition-colors mt-1"
                  >
                    <HiOutlineUpload className="h-3.5 w-3.5" /> Upload another resume
                  </Link>
                </div>
              )}
            </Section>
          </div>

          {/* RIGHT COLUMN (1/3) ─────────────────────────────────────────────── */}
          <div className="space-y-5">

            {/* Profile Strength Card */}
            <div className="surface p-6 space-y-4">
              <div className="flex items-center gap-2">
                <HiOutlineSparkles className="h-4 w-4 text-blue-600" />
                <h3 className="text-sm font-bold text-gray-800 dark:text-white">Profile Strength</h3>
              </div>

              {/* Score donut-style display */}
              <div className="flex items-center gap-4">
                <div className="relative h-16 w-16 flex-shrink-0">
                  <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9"
                      fill="none"
                      stroke={strengthPct >= 85 ? '#34d399' : strengthPct >= 60 ? '#3b82f6' : strengthPct >= 35 ? '#fbbf24' : '#f87171'}
                      strokeWidth="3"
                      strokeDasharray={`${strengthPct} ${100 - strengthPct}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-black text-gray-900 dark:text-white leading-none">{strengthPct}%</span>
                  </div>
                </div>
                <div>
                  <p className={`text-base font-extrabold ${strengthTextColor}`}>{strengthText}</p>
                  <p className="text-[11px] text-gray-400">{strengthDone} of {strengthTotal} sections complete</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${strengthPct}%` }} />
              </div>

              {/* What's missing */}
              {missing.length > 0 && (
                <div className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Complete these</p>
                  {missing.slice(0, 4).map(s => (
                    <Link
                      key={s.key}
                      to={s.key === 'resume' ? '/resume/upload' : '/profile/edit'}
                      className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 hover:text-blue-600 transition-colors group"
                    >
                      <span className="h-4 w-4 rounded-full border-2 border-gray-300 group-hover:border-blue-500 flex-shrink-0 transition-colors" />
                      <span>{s.label}</span>
                    </Link>
                  ))}
                </div>
              )}

              {strengthPct === 100 && (
                <p className="text-xs text-emerald-600 font-bold flex items-center gap-1.5">
                  <HiOutlineCheckCircle className="h-4 w-4" /> Profile complete!
                </p>
              )}

              <Link
                to="/profile/edit"
                className="flex items-center justify-center gap-2 w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <HiPencil className="h-3.5 w-3.5" /> Improve Profile
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="surface p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Contact Info</h3>
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                  <HiOutlineMail className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  <span className="truncate">{profile?.email || user?.email || '—'}</span>
                </div>
                {profile?.phone && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <HiOutlinePhone className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{profile.phone}</span>
                  </div>
                )}
                {profile?.location && (
                  <div className="flex items-center gap-2.5 text-xs text-gray-600 dark:text-gray-300">
                    <HiOutlineLocationMarker className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <span>{profile.location}</span>
                  </div>
                )}
              </div>
              {(!profile?.phone || !profile?.location) && (
                <Link to="/profile/edit" className="text-xs text-blue-600 font-bold hover:underline">
                  Add missing contact info →
                </Link>
              )}
            </div>

            {/* Resume count pill */}
            <div className="surface p-6 space-y-3">
              <h3 className="text-sm font-bold text-gray-800 dark:text-white">Resume Status</h3>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-amber-50 border border-amber-100 rounded-xl flex items-center justify-center">
                  <HiOutlineDocumentText className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xl font-black text-gray-900 dark:text-white">{resumes.length}</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                    {resumes.length === 1 ? 'Resume' : 'Resumes'} on file
                  </p>
                </div>
              </div>
              {resumes.length > 0 && (
                <div className="text-[10px] text-gray-400 space-y-1">
                  <p>{resumes.filter(r => r.status === 'COMPLETED').length} processed · {resumes.filter(r => r.status === 'PROCESSING').length} processing · {resumes.filter(r => r.status === 'FAILED').length} failed</p>
                </div>
              )}
              <Link
                to="/resume/upload"
                className="flex items-center justify-center gap-2 w-full py-2.5 border border-amber-200 hover:bg-amber-50 text-amber-700 text-xs font-bold rounded-lg transition-colors"
              >
                <HiOutlineUpload className="h-3.5 w-3.5" /> Upload Resume
              </Link>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
