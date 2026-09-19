import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';
import { HiLocationMarker, HiCurrencyDollar, HiBriefcase, HiMail, HiChevronLeft, HiShare,
  HiOutlineUser, HiOutlineChip, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineTerminal } from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [toast, setToast] = useState(null);
  const [applied, setApplied] = useState(false);
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);
  const [candidateProfile, setCandidateProfile] = useState(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState(false);
  const [resumes, setResumes] = useState([]);
  const [showApplyPanel, setShowApplyPanel] = useState(false);
  const [selectedResumeId, setSelectedResumeId] = useState('');
  const [resumeAnalysis, setResumeAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);

  useEffect(() => {
    setLoading(true);
    jobService.getById(id)
      .then((data) => {
        setJob(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    if (!user || user.role?.toLowerCase() !== 'seeker') return;

    // Check if the authenticated candidate already applied.
    setMatchLoading(true);
    candidateService.getMyProfile()
      .then(profile => {
        setCandidateProfile(profile);
        return Promise.all([
          applicationService.getByCandidateId(profile.id),
          recommendationService.getCandidateJobMatch(profile.id, id),
          candidateService.getResumes()
        ]);
      })
      .then(([apps, matchData, resumeData]) => {
        const hasApplied = apps.some((app) => String(app.jobId) === String(id));
        setApplied(hasApplied);
        setMatch(matchData);
        const completedResumes = (resumeData || []).filter(resume => resume.status === 'COMPLETED' || resume.status === 'PROCESSED');
        setResumes(completedResumes);
        setSelectedResumeId(String(completedResumes[0]?.resumeId || ''));
      })
      .catch((err) => {
        console.error(err);
        setMatchError(true);
      })
      .finally(() => setMatchLoading(false));
  }, [id, user]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage />
      </DashboardLayout>
    );
  }

  if (!job) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Job Not Found</h2>
          <p className="text-sm text-gray-500 mt-2">The job post you requested does not exist or has expired.</p>
          <Link to="/jobs" className="mt-4 inline-block text-sm text-blue-600 font-semibold hover:underline">
            Back to Job Listings
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const openApplyPanel = () => {
    if (applied) return;
    setShowApplyPanel(true);
  };

  const analyzeSelectedResume = async () => {
    if (!selectedResumeId) return;
    setAnalysisLoading(true);
    try {
      setResumeAnalysis(await candidateService.reviewResumeForJob(selectedResumeId, job.id));
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not analyze this resume for the job.', type: 'error' });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleTailor = async () => {
    if (!selectedResumeId) return;
    setIsTailoring(true);
    setToast({ message: 'AI is tailoring your resume... This may take a few seconds.', type: 'info' });
    try {
      const newResume = await candidateService.tailorResume(selectedResumeId, job.id);
      
      const updatedResumes = await candidateService.getResumes();
      const completedResumes = updatedResumes.filter(r => r.status === 'COMPLETED' || r.status === 'PROCESSED');
      setResumes(completedResumes);
      setSelectedResumeId(String(newResume.resumeId));
      
      setToast({ message: 'Resume tailored successfully! It is now selected.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to tailor resume.', type: 'error' });
    } finally {
      setIsTailoring(false);
    }
  };

  const handleApply = async () => {
    if (applied || !selectedResumeId) return;
    try {
      await applicationService.apply({
        jobId: job.id.toString(),
        jobTitle: job.title,
        companyName: job.companyName,
        status: 'Applied',
        candidateId: candidateProfile?.id,
        candidateName: user.name,
        recruiterId: job.recruiterId,
        recruiterEmail: job.recruiterEmail,
        matchScore: match?.overallScore ?? null,
        resumeId: Number(selectedResumeId)
      });
      setApplied(true);
      setShowApplyPanel(false);
      setToast({
        message: `Application submitted successfully for ${job.title}!`,
        type: 'success'
      });
    } catch (err) {
      setToast({
        message: 'Failed to submit application. Try again.',
        type: 'error'
      });
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setToast({
      message: 'Job link copied to clipboard!',
      type: 'info'
    });
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

      <div className="space-y-7">
        
        {/* Back Link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <HiChevronLeft className="mr-1 h-4 w-4" /> Back to Listings
          </button>
        </div>

        {/* Job Header Info */}
        <div className="surface p-6 md:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl p-3 bg-gray-50 rounded-xl border border-gray-150 select-none">
              {job.companyLogo || '🏢'}
            </span>
            <div className="space-y-1">
              <h4 className="eyebrow">{job.companyName}</h4>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-950 dark:text-white leading-tight mt-1">{job.title}</h1>
              
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 pt-1">
                <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{job.type}</span>
                <span className="flex items-center"><HiLocationMarker className="mr-1 h-4 w-4" /> {job.location}</span>
                <span className="flex items-center"><HiCurrencyDollar className="mr-1 h-4 w-4" /> {job.salary}</span>
                <span className="flex items-center"><HiBriefcase className="mr-1 h-4 w-4" /> {job.experience}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 md:flex-none inline-flex items-center justify-center p-2.5 border border-gray-205 text-gray-500 hover:text-blue-600 hover:bg-gray-50 rounded-lg shadow-sm transition-all focus:outline-none"
              title="Share Job"
            >
              <HiShare className="h-5 w-5" />
            </button>
            {user?.role?.toLowerCase() === 'seeker' && (
              <button
                onClick={openApplyPanel}
                disabled={applied}
                className={`flex-1 md:flex-none px-6 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-all ${
                  applied
                    ? 'bg-slate-100 text-slate-400 border border-slate-250 cursor-not-allowed'
                    : 'bg-primary hover:opacity-90 text-white hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {applied ? 'Applied' : 'Apply with resume'}
              </button>
            )}
          </div>
        </div>

        {showApplyPanel && user?.role?.toLowerCase() === 'seeker' && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Choose resume for application">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-slate-100 px-6 py-5 flex items-start justify-between gap-4 rounded-t-2xl z-10">
                <div>
                  <p className="eyebrow">Application ready</p>
                  <h2 className="text-xl font-bold text-slate-950 mt-1">Pick the best resume for this role.</h2>
                  <p className="text-xs text-slate-500 mt-1">TalentSync analyzes your resume section-by-section against <strong>{job.title}</strong> and shows exactly where to improve.</p>
                </div>
                <button onClick={() => setShowApplyPanel(false)} className="text-slate-400 hover:text-slate-900 text-2xl flex-shrink-0 leading-none" aria-label="Close">×</button>
              </div>

              <div className="p-6 md:p-8 space-y-6">
                {resumes.length === 0 ? (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                    Upload and finish processing at least one resume before applying. <Link to="/resume/upload" className="font-bold underline">Upload resume →</Link>
                  </div>
                ) : (
                  <>
                    {/* Resume selector */}
                    <div className="space-y-2">
                      <label className="eyebrow" htmlFor="application-resume">Select a resume to apply with</label>
                      <select
                        id="application-resume"
                        value={selectedResumeId}
                        onChange={event => { setSelectedResumeId(event.target.value); setResumeAnalysis(null); }}
                        className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Choose a resume...</option>
                        {resumes.map(resume => (
                          <option key={resume.resumeId} value={resume.resumeId}>{resume.filename}</option>
                        ))}
                      </select>
                    </div>

                    {/* Analyze button */}
                    <button
                      onClick={analyzeSelectedResume}
                      disabled={!selectedResumeId || analysisLoading}
                      className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-50 hover:border-blue-400 disabled:opacity-40 transition-all"
                    >
                      {analysisLoading
                        ? '🔍 Analyzing your resume against this job...'
                        : resumeAnalysis
                          ? '↺ Re-analyze with this resume'
                          : '✦ Analyze resume for this specific job'}
                    </button>

                    {/* ── Analysis Results ───────────────────────────────── */}
                    {resumeAnalysis && (
                      <div className="space-y-4">

                        {/* Overall score banner */}
                        <div className="bg-slate-950 text-white rounded-2xl p-5">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-teal-300">Resume Score</p>
                              <p className="text-xs text-slate-400 mt-0.5">How well this resume matches {job.title}</p>
                            </div>
                            <div className="text-right">
                              <span className="text-4xl font-black text-teal-300">{resumeAnalysis.resumeScore}</span>
                              <span className="text-sm text-slate-400">/100</span>
                            </div>
                          </div>
                          {/* Overall score bar */}
                          <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{
                                width: `${resumeAnalysis.resumeScore}%`,
                                background: resumeAnalysis.resumeScore >= 75 ? '#34d399'
                                          : resumeAnalysis.resumeScore >= 50 ? '#60a5fa'
                                          : '#fbbf24'
                              }}
                            />
                          </div>
                          <p className="text-[10px] text-slate-400 mt-1.5">
                            {resumeAnalysis.resumeScore >= 80 ? '✓ Strong match — submit with confidence'
                           : resumeAnalysis.resumeScore >= 60 ? '~ Good match — a few improvements will help'
                           : '⚠ Low match — review the suggestions below before submitting'}
                          </p>
                        </div>

                        {/* Section-wise scores */}
                        {resumeAnalysis.sectionScores && Object.keys(resumeAnalysis.sectionScores).length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Section-by-Section Breakdown</p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {Object.entries(resumeAnalysis.sectionScores).map(([section, score]) => {
                                const pct = Math.min(100, Math.max(0, Number(score)));
                                const color = pct >= 75 ? '#34d399' : pct >= 50 ? '#60a5fa' : '#fbbf24';
                                const bg = pct >= 75 ? 'bg-emerald-50 border-emerald-100' : pct >= 50 ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100';
                                const textColor = pct >= 75 ? 'text-emerald-700' : pct >= 50 ? 'text-blue-700' : 'text-amber-700';
                                const weakLabel = pct < 50 ? 'Needs work' : pct < 75 ? 'Good' : 'Strong';
                                
                                let Icon = HiOutlineUser;
                                if (section.toLowerCase().includes('skill')) Icon = HiOutlineChip;
                                else if (section.toLowerCase().includes('exp')) Icon = HiOutlineBriefcase;
                                else if (section.toLowerCase().includes('edu')) Icon = HiOutlineAcademicCap;
                                else if (section.toLowerCase().includes('proj')) Icon = HiOutlineTerminal;

                                return (
                                  <div key={section} className={`border rounded-xl p-3 flex flex-col justify-between ${bg}`}>
                                    <div className="flex items-center gap-2 mb-2">
                                      <Icon className={`h-4 w-4 ${textColor}`} />
                                      <span className={`text-xs font-bold ${textColor}`}>{section}</span>
                                    </div>
                                    <div className="flex items-end justify-between mt-1">
                                      <span className={`text-xl font-black ${textColor}`}>{pct}<span className="text-[10px] font-semibold opacity-70">/100</span></span>
                                      <span className={`text-[10px] font-bold ${textColor} opacity-80 uppercase`}>{weakLabel}</span>
                                    </div>
                                    <div className="h-1 bg-black/10 rounded-full overflow-hidden mt-2">
                                      <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Weak sections pills */}
                        {resumeAnalysis.weakSections?.length > 0 && (
                          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-amber-600 font-bold">Sections to improve</p>
                            <div className="flex flex-wrap gap-2">
                              {resumeAnalysis.weakSections.map(section => (
                                <span key={section} className="text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                                  {section}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Missing keywords */}
                        {resumeAnalysis.missingKeywords?.length > 0 && (
                          <div className="border border-slate-200 rounded-xl p-4 space-y-2">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Job keywords not in your resume</p>
                            <div className="flex flex-wrap gap-1.5">
                              {resumeAnalysis.missingKeywords.map(kw => (
                                <span key={kw} className="text-xs px-2 py-0.5 rounded border border-red-200 text-red-600 bg-red-50 font-medium">
                                  {kw}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Per-section suggestions */}
                        {resumeAnalysis.suggestions?.length > 0 && (
                          <div className="space-y-3">
                            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Targeted Improvements</p>
                            {resumeAnalysis.suggestions.map((suggestion, index) => (
                              <div key={`${suggestion.section}-${index}`} className="border border-slate-200 rounded-xl p-4 space-y-2 hover:border-blue-300 transition-colors">
                                <div className="flex items-center gap-2">
                                  <span className="h-5 w-5 bg-blue-50 border border-blue-100 rounded flex items-center justify-center text-[9px] font-black text-blue-600">{index + 1}</span>
                                  <p className="text-xs font-bold text-slate-800">{suggestion.section || 'General'}</p>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{suggestion.reason}</p>
                                {suggestion.suggestedText && (
                                  <div className="bg-teal-50 border border-teal-100 rounded-lg px-3 py-2">
                                    <p className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1">Suggested rewrite</p>
                                    <p className="text-xs text-teal-800 leading-relaxed italic">"{suggestion.suggestedText}"</p>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submit & Tailor buttons */}
                    <div className="space-y-3 mt-6">
                      <button
                        type="button"
                        onClick={handleTailor}
                        disabled={isTailoring || !selectedResumeId}
                        className="w-full py-3.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 text-sm font-bold hover:bg-purple-100 transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {isTailoring ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-2 border-purple-700 border-t-transparent" />
                             Tailoring...
                           </>
                        ) : (
                           <>
                             <span className="text-lg">✨</span> 1-Click AI Resume Tailor
                           </>
                        )}
                      </button>
                      <button
                        onClick={handleApply}
                        disabled={!selectedResumeId}
                        className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-colors shadow-sm hover:shadow-md"
                      >
                        Submit application with this resume
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Job Body content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-7 surface p-6 md:p-8">
            <div className="space-y-3">
              <h2 className="text-lg font-bold text-gray-905">Job Description</h2>
              <p className="text-xs text-gray-600 leading-relaxed">{job.description}</p>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Key Responsibilities</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.responsibilities.map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Qualifications */}
            {job.qualifications && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Requirements & Qualifications</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.qualifications.map((qual, index) => (
                    <li key={index}>{qual}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && (
              <div className="space-y-3 pt-6 border-t border-gray-100">
                <h2 className="text-lg font-bold text-gray-905">Benefits & Perks</h2>
                <ul className="list-disc pl-5 space-y-2 text-xs text-gray-600 leading-relaxed">
                  {job.benefits.map((benefit, index) => (
                    <li key={index}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Culture Bites */}
            <div className="space-y-4 pt-8 border-t border-slate-100 mt-8">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                Culture & Day-in-the-Life <span className="bg-accent/10 text-accent text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">Video</span>
              </h2>
              <div className="relative rounded-3xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center group cursor-pointer shadow-lg border border-slate-200/50">
                <img src={`https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80`} alt="Culture Video" className="absolute inset-0 w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent"></div>
                <div className="relative z-10 w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 group-hover:bg-accent transition-all duration-300 group-hover:scale-110 shadow-2xl">
                   <div className="w-0 h-0 border-t-[10px] border-t-transparent border-l-[18px] border-l-white border-b-[10px] border-b-transparent ml-2"></div>
                </div>
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white font-bold text-lg leading-tight">Hear directly from the engineering team you'll be joining.</p>
                  <p className="text-slate-300 text-xs mt-1">2:45 min • Behind the scenes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar Info (Skills, Recruiter Details) */}
          <div className="space-y-6">

            {user?.role?.toLowerCase() === 'seeker' && (
              <div className="bg-slate-950 text-white p-6 rounded-xl shadow-sm space-y-5">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-emerald-300 font-bold">AI Match Analysis</p>
                    <p className="text-xs text-slate-400 mt-1">A deterministic profile comparison with explainable signals.</p>
                  </div>
                  {match && <span className="text-[10px] font-bold text-emerald-300">{match.matchLevel?.replace('_', ' ')}</span>}
                </div>

                {matchLoading && <p className="text-sm text-slate-300">Analyzing your profile...</p>}
                {matchError && <p className="text-sm text-amber-300">Match analysis is temporarily unavailable. You can still apply normally.</p>}
                {match && !matchLoading && (
                  <>
                    <div className="flex items-end gap-2">
                      <span className="text-5xl font-black text-white">{Math.round(match.overallScore)}%</span>
                      <span className="text-xs text-slate-400 pb-2">overall fit</span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                      {[
                        ['Skills', match.skillScore],
                        ['Semantic', match.semanticScore],
                        ['Experience', match.experienceScore],
                        ['Education', match.educationScore],
                        ['Location', match.locationScore],
                        ['Keywords', match.keywordScore]
                      ].map(([label, value]) => (
                        <div key={label}>
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>{label}</span><span>{Math.round(value || 0)}%</span></div>
                          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-400 rounded-full" style={{ width: `${Math.min(100, Math.max(0, value || 0))}%` }} /></div>
                        </div>
                      ))}
                    </div>
                    {match.matchedSkills?.length > 0 && <div><h4 className="text-[10px] uppercase tracking-wider text-emerald-300 font-bold mb-2">Matched skills</h4><div className="flex flex-wrap gap-2">{match.matchedSkills.map(skill => <span key={skill} className="text-xs bg-emerald-400/10 text-emerald-200 border border-emerald-400/20 px-2 py-1 rounded">{skill}</span>)}</div></div>}
                    {match.skillGaps?.length > 0 && <div><h4 className="text-[10px] uppercase tracking-wider text-amber-300 font-bold mb-2">Skill gaps</h4><div className="space-y-2">{match.skillGaps.map(gap => <div key={gap.skill} className="flex justify-between text-xs"><span className="text-slate-200">{gap.skill}</span><span className="text-amber-300">{gap.severity}</span></div>)}</div></div>}
                    <div className="border-t border-slate-800 pt-4 space-y-2"><h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Why this job?</h4><p className="text-xs text-slate-200 leading-relaxed">{match.whyMatch || match.explanation}</p></div>
                    {match.learningPlan?.length > 0 && <div className="border-t border-slate-800 pt-4"><h4 className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-2">How to improve</h4><ol className="list-decimal pl-4 space-y-1 text-xs text-slate-300">{match.learningPlan.map(step => <li key={step}>{step}</li>)}</ol></div>}
                  </>
                )}
              </div>
            )}
            
            {/* Required Skills card */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-905 text-sm">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-3 py-1 rounded-lg font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Recruiter contact card */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-4">
              <h3 className="font-bold text-gray-905 text-sm">Recruiter Information</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-gray-100 text-gray-600 rounded-full flex items-center justify-center font-bold text-sm">
                    {job.recruiterName ? job.recruiterName.charAt(0) : 'R'}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-800">{job.recruiterName || 'HR Manager'}</p>
                    <p className="text-[10px] text-gray-500">Talent Acquisition Partner</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-600 pt-2 border-t border-gray-50">
                  <HiMail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${job.recruiterEmail}`} className="hover:underline text-blue-600 font-semibold">{job.recruiterEmail || 'hr@company.com'}</a>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
