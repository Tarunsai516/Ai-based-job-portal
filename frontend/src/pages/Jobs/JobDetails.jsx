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
  HiOutlineUser, HiOutlineChip, HiOutlineBriefcase, HiOutlineAcademicCap, HiOutlineTerminal,
  HiPlus, HiTrash, HiCheck, HiDownload, HiRefresh, HiSparkles, HiDocumentText, HiQuestionMarkCircle, HiPencilAlt } from 'react-icons/hi';
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
  const [interviewQuestions, setInterviewQuestions] = useState(null);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  // Application Suite & Tailoring Studio State
  const [activeApplyTab, setActiveApplyTab] = useState('apply'); // 'apply' | 'tailor' | 'interview'
  const [tailorPreview, setTailorPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generatingResume, setGeneratingResume] = useState(false);
  const [tailorFormat, setTailorFormat] = useState('docx'); // 'docx' | 'pdf'
  const [generatedResumeInfo, setGeneratedResumeInfo] = useState(null);

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

  const openApplyPanel = (defaultTab = 'apply') => {
    if (applied) return;
    setActiveApplyTab(defaultTab);
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

  const handleLoadTailorPreview = async () => {
    if (!selectedResumeId) return;
    setPreviewLoading(true);
    try {
      const preview = await candidateService.previewTailorResume(selectedResumeId, job.id);
      setTailorPreview(preview);
      setToast({ message: 'AI tailoring analysis complete! Review and customize sections below.', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to load tailoring preview.', type: 'error' });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleSaveCustomTailoredResume = async () => {
    if (!selectedResumeId || !tailorPreview) return;
    setGeneratingResume(true);
    try {
      const newResume = await candidateService.generateCustomTailoredResume(
        selectedResumeId,
        job.id,
        tailorPreview,
        tailorFormat
      );
      const updatedResumes = await candidateService.getResumes();
      const completedResumes = updatedResumes.filter(r => r.status === 'COMPLETED' || r.status === 'PROCESSED');
      setResumes(completedResumes);
      setSelectedResumeId(String(newResume.resumeId));
      setGeneratedResumeInfo(newResume);
      setToast({
        message: `Tailored ${tailorFormat.toUpperCase()} resume created and saved to your library!`,
        type: 'success'
      });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Failed to create tailored resume.', type: 'error' });
    } finally {
      setGeneratingResume(false);
    }
  };

  const handleSummaryChange = (e) => {
    setTailorPreview(prev => ({ ...prev, summary: e.target.value }));
  };

  const handleSkillsChange = (skillsText) => {
    const skillsArr = skillsText.split(',').map(s => s.trim()).filter(Boolean);
    setTailorPreview(prev => ({ ...prev, skills: skillsArr }));
  };

  const handleExpFieldChange = (index, field, value) => {
    setTailorPreview(prev => {
      const nextExp = [...(prev.experience || [])];
      nextExp[index] = { ...nextExp[index], [field]: value };
      return { ...prev, experience: nextExp };
    });
  };

  const handleExpBulletChange = (expIdx, bulletIdx, value) => {
    setTailorPreview(prev => {
      const nextExp = [...(prev.experience || [])];
      const bullets = [...(nextExp[expIdx].bullets || [])];
      bullets[bulletIdx] = value;
      nextExp[expIdx] = { ...nextExp[expIdx], bullets };
      return { ...prev, experience: nextExp };
    });
  };

  const handleAddExpBullet = (expIdx) => {
    setTailorPreview(prev => {
      const nextExp = [...(prev.experience || [])];
      const bullets = [...(nextExp[expIdx].bullets || []), ''];
      nextExp[expIdx] = { ...nextExp[expIdx], bullets };
      return { ...prev, experience: nextExp };
    });
  };

  const handleRemoveExpBullet = (expIdx, bulletIdx) => {
    setTailorPreview(prev => {
      const nextExp = [...(prev.experience || [])];
      const bullets = [...(nextExp[expIdx].bullets || [])].filter((_, i) => i !== bulletIdx);
      nextExp[expIdx] = { ...nextExp[expIdx], bullets };
      return { ...prev, experience: nextExp };
    });
  };

  const handleAddExpEntry = () => {
    setTailorPreview(prev => ({
      ...prev,
      experience: [
        ...(prev.experience || []),
        { title: '', company: '', duration: '', bullets: [''] }
      ]
    }));
  };

  const handleRemoveExpEntry = (index) => {
    setTailorPreview(prev => ({
      ...prev,
      experience: (prev.experience || []).filter((_, i) => i !== index)
    }));
  };

  const handleProjectChange = (index, field, value) => {
    setTailorPreview(prev => {
      const nextProj = [...(prev.projects || [])];
      nextProj[index] = { ...nextProj[index], [field]: value };
      return { ...prev, projects: nextProj };
    });
  };

  const handleAddProject = () => {
    setTailorPreview(prev => ({
      ...prev,
      projects: [
        ...(prev.projects || []),
        { name: '', description: '', technologies: [] }
      ]
    }));
  };

  const handleRemoveProject = (index) => {
    setTailorPreview(prev => ({
      ...prev,
      projects: (prev.projects || []).filter((_, i) => i !== index)
    }));
  };

  const handleEduChange = (index, field, value) => {
    setTailorPreview(prev => {
      const nextEdu = [...(prev.education || [])];
      nextEdu[index] = { ...nextEdu[index], [field]: value };
      return { ...prev, education: nextEdu };
    });
  };

  const handleAddEdu = () => {
    setTailorPreview(prev => ({
      ...prev,
      education: [
        ...(prev.education || []),
        { degree: '', institution: '', year: '' }
      ]
    }));
  };

  const handleRemoveEdu = (index) => {
    setTailorPreview(prev => ({
      ...prev,
      education: (prev.education || []).filter((_, i) => i !== index)
    }));
  };

  const handleGenerateQuestions = async () => {
    if (!selectedResumeId) return;
    setQuestionsLoading(true);
    try {
      const qList = await candidateService.getInterviewQuestions(selectedResumeId, job.id);
      setInterviewQuestions(qList);
      setToast({ message: 'Interview preparation questions generated!', type: 'success' });
    } catch (err) {
      setToast({ message: err.response?.data?.message || 'Could not generate interview questions.', type: 'error' });
    } finally {
      setQuestionsLoading(false);
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
          <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm p-4 flex items-center justify-center overflow-y-auto" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800">
              
              {/* Modal Top Header */}
              <div className="bg-white dark:bg-slate-900 border-b border-slate-150 dark:border-slate-800 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Career Application Suite</p>
                  <h2 className="text-lg md:text-xl font-extrabold text-slate-900 dark:text-white mt-0.5">
                    {job.title} <span className="text-slate-400 font-normal">at {job.companyName}</span>
                  </h2>
                </div>
                <button
                  onClick={() => setShowApplyPanel(false)}
                  className="text-slate-400 hover:text-slate-800 dark:hover:text-white text-2xl font-bold p-1 rounded-lg leading-none"
                  aria-label="Close"
                >
                  &times;
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-6">
                <button
                  onClick={() => setActiveApplyTab('apply')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    activeApplyTab === 'apply'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 dark:border-blue-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  <span>🚀</span> Fast Apply
                </button>
                <button
                  onClick={() => setActiveApplyTab('tailor')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    activeApplyTab === 'tailor'
                      ? 'border-purple-600 text-purple-600 dark:text-purple-400 dark:border-purple-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  <span>✍️</span> AI Resume Studio & Section Editor
                </button>
                <button
                  onClick={() => setActiveApplyTab('interview')}
                  className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
                    activeApplyTab === 'interview'
                      ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400 bg-white dark:bg-slate-900'
                      : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-300'
                  }`}
                >
                  <span>🎯</span> AI Interview Prep
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1">
                {resumes.length === 0 ? (
                  <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-5 text-sm text-amber-800 dark:text-amber-300 text-center">
                    <p className="font-semibold">No processed resumes found.</p>
                    <p className="text-xs mt-1">Please upload at least one resume to apply or tailor.</p>
                    <Link to="/resume/upload" className="mt-3 inline-block font-bold underline text-xs">
                      Upload resume now &rarr;
                    </Link>
                  </div>
                ) : (
                  <>
                    {/* Common Resume Selector */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <div className="space-y-0.5 flex-1">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300" htmlFor="active-resume-select">
                          Select Base Resume:
                        </label>
                        <select
                          id="active-resume-select"
                          value={selectedResumeId}
                          onChange={(e) => {
                            setSelectedResumeId(e.target.value);
                            setResumeAnalysis(null);
                            setTailorPreview(null);
                            setGeneratedResumeInfo(null);
                          }}
                          className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                        >
                          {resumes.map(r => (
                            <option key={r.resumeId} value={r.resumeId}>{r.filename}</option>
                          ))}
                        </select>
                      </div>
                      <Link to="/resume/library" className="text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline flex-shrink-0 self-end sm:self-center">
                        Manage Resumes &rarr;
                      </Link>
                    </div>

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 1: FAST APPLY
                    ───────────────────────────────────────────────────────────── */}
                    {activeApplyTab === 'apply' && (
                      <div className="space-y-5">
                        <div className="flex flex-col sm:flex-row gap-3">
                          <button
                            onClick={analyzeSelectedResume}
                            disabled={!selectedResumeId || analysisLoading}
                            className="flex-1 py-3 rounded-xl border-2 border-blue-200 text-blue-700 dark:text-blue-300 dark:border-blue-800 text-xs font-bold hover:bg-blue-50 dark:hover:bg-blue-950/40 disabled:opacity-40 transition-all flex items-center justify-center gap-2"
                          >
                            {analysisLoading ? (
                              <>
                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-700 border-t-transparent" />
                                Analyzing resume against job...
                              </>
                            ) : resumeAnalysis ? (
                              '↺ Re-analyze with this resume'
                            ) : (
                              '✦ Run AI Match & ATS Analysis'
                            )}
                          </button>
                        </div>

                        {/* Analysis Score Breakdown */}
                        {resumeAnalysis && (
                          <div className="space-y-4">
                            <div className="bg-slate-950 text-white rounded-2xl p-5 shadow-sm">
                              <div className="flex items-center justify-between mb-3">
                                <div>
                                  <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-teal-300">ATS Match Score</p>
                                  <p className="text-xs text-slate-400 mt-0.5">Section-by-section alignment with {job.title}</p>
                                </div>
                                <div className="text-right">
                                  <span className="text-4xl font-black text-teal-300">{resumeAnalysis.resumeScore}</span>
                                  <span className="text-sm text-slate-400">/100</span>
                                </div>
                              </div>
                              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all duration-700"
                                  style={{
                                    width: `${resumeAnalysis.resumeScore}%`,
                                    background: resumeAnalysis.resumeScore >= 75 ? '#34d399' : resumeAnalysis.resumeScore >= 50 ? '#60a5fa' : '#fbbf24'
                                  }}
                                />
                              </div>
                            </div>

                            {/* Section breakdown */}
                            {resumeAnalysis.sectionScores && (
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {Object.entries(resumeAnalysis.sectionScores).map(([section, score]) => {
                                  const pct = Math.min(100, Math.max(0, Number(score)));
                                  return (
                                    <div key={section} className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3">
                                      <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 truncate block">{section}</span>
                                      <div className="flex items-baseline justify-between mt-1">
                                        <span className="text-lg font-black text-slate-900 dark:text-white">{pct}%</span>
                                        <span className={`text-[10px] font-bold uppercase ${pct >= 75 ? 'text-emerald-600' : pct >= 50 ? 'text-blue-600' : 'text-amber-600'}`}>
                                          {pct >= 75 ? 'Strong' : pct >= 50 ? 'Good' : 'Needs work'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Missing keywords */}
                            {resumeAnalysis.missingKeywords?.length > 0 && (
                              <div className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                                <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Recommended keywords to add</p>
                                <div className="flex flex-wrap gap-1.5">
                                  {resumeAnalysis.missingKeywords.map(kw => (
                                    <span key={kw} className="text-xs px-2 py-0.5 rounded border border-red-200 bg-red-50 text-red-700 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 font-medium">
                                      {kw}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Submit Application Button */}
                        <div className="pt-3">
                          <button
                            onClick={handleApply}
                            disabled={!selectedResumeId}
                            className="w-full py-3.5 rounded-xl bg-primary text-white text-sm font-bold hover:opacity-90 disabled:opacity-40 transition-all shadow-md flex items-center justify-center gap-2"
                          >
                            <span>🚀</span> Submit Application with Selected Resume
                          </button>
                        </div>
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 2: AI RESUME STUDIO & SECTION EDITOR
                    ───────────────────────────────────────────────────────────── */}
                    {activeApplyTab === 'tailor' && (
                      <div className="space-y-6">
                        
                        {!tailorPreview ? (
                          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-200 dark:border-purple-800 rounded-2xl p-6 text-center space-y-4">
                            <div className="h-12 w-12 rounded-2xl bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300 flex items-center justify-center text-2xl mx-auto shadow-inner">
                              ✨
                            </div>
                            <div className="max-w-md mx-auto space-y-1">
                              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">AI Resume Section-by-Section Studio</h3>
                              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                                Our AI analyzes each section of your resume against <strong>{job.title}</strong>, prepares tailored recommendations with strong action verbs & metrics, and lets you review & edit before generating a polished DOCX or PDF.
                              </p>
                            </div>
                            <button
                              onClick={handleLoadTailorPreview}
                              disabled={previewLoading || !selectedResumeId}
                              className="px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 inline-flex items-center gap-2"
                            >
                              {previewLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-white border-t-transparent" />
                                  Analyzing & structuring sections...
                                </>
                              ) : (
                                <>
                                  <span>✨</span> Review & Edit Resume Sections
                                </>
                              )}
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-6">
                            
                            {/* Summary of Improvements per Section */}
                            {tailorPreview.sectionImprovements && tailorPreview.sectionImprovements.length > 0 && (
                              <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 dark:from-slate-800 dark:to-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl p-5 space-y-3">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">💡</span>
                                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-indigo-900 dark:text-indigo-300">
                                      Section Improvements Summary
                                    </h4>
                                  </div>
                                  <button
                                    onClick={handleLoadTailorPreview}
                                    disabled={previewLoading}
                                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                                  >
                                    ↺ Re-run AI Analysis
                                  </button>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
                                  {tailorPreview.sectionImprovements.map((imp, idx) => (
                                    <div key={idx} className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-slate-700 rounded-xl p-3 space-y-1.5 shadow-xs">
                                      <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-400 block">{imp.section}</span>
                                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">{imp.whyImproved}</p>
                                      {imp.keyChanges && (
                                        <p className="text-[10px] text-indigo-600 dark:text-indigo-300/80 bg-indigo-50/60 dark:bg-slate-800 rounded px-1.5 py-0.5 font-medium">
                                          ✓ {imp.keyChanges}
                                        </p>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Section-by-Section Interactive Editor */}
                            <div className="space-y-5">
                              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                                  <span>✏️</span> Interactive Section Editor
                                </h4>
                                <span className="text-[11px] text-slate-500">Edit any section directly before finalizing</span>
                              </div>

                              {/* 1. Personal & Contact Info */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                  1. Personal & Contact Header
                                </h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Full Name
                                    <input
                                      type="text"
                                      value={tailorPreview.name || ''}
                                      onChange={(e) => setTailorPreview(prev => ({ ...prev, name: e.target.value }))}
                                      className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Email
                                    <input
                                      type="email"
                                      value={tailorPreview.email || ''}
                                      onChange={(e) => setTailorPreview(prev => ({ ...prev, email: e.target.value }))}
                                      className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Phone
                                    <input
                                      type="text"
                                      value={tailorPreview.phone || ''}
                                      onChange={(e) => setTailorPreview(prev => ({ ...prev, phone: e.target.value }))}
                                      className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                  </label>
                                  <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                                    Location
                                    <input
                                      type="text"
                                      value={tailorPreview.location || ''}
                                      onChange={(e) => setTailorPreview(prev => ({ ...prev, location: e.target.value }))}
                                      className="mt-1 w-full border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                    />
                                  </label>
                                </div>
                              </div>

                              {/* 2. Professional Summary */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    2. Professional Summary
                                  </h5>
                                  <span className="text-[10px] text-slate-400">{(tailorPreview.summary || '').length} characters</span>
                                </div>
                                <textarea
                                  rows={4}
                                  value={tailorPreview.summary || ''}
                                  onChange={handleSummaryChange}
                                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-3 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white leading-relaxed focus:ring-2 focus:ring-purple-500"
                                  placeholder="Concise, impact-driven professional summary..."
                                />
                              </div>

                              {/* 3. Core Skills */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-2">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    3. Core Competencies & Skills
                                  </h5>
                                  <span className="text-[10px] text-slate-400">Comma-separated</span>
                                </div>
                                <input
                                  type="text"
                                  value={(tailorPreview.skills || []).join(', ')}
                                  onChange={(e) => handleSkillsChange(e.target.value)}
                                  className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white focus:ring-2 focus:ring-purple-500"
                                  placeholder="e.g. Java, Spring Boot, React, AWS, Docker..."
                                />
                                <div className="flex flex-wrap gap-1.5 pt-1">
                                  {(tailorPreview.skills || []).map((skill, sIdx) => (
                                    <span key={sIdx} className="text-[11px] bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-800 px-2 py-0.5 rounded font-medium">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {/* 4. Work Experience */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-4">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    4. Professional Work Experience
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={handleAddExpEntry}
                                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <HiPlus className="h-3.5 w-3.5" /> Add Role
                                  </button>
                                </div>

                                <div className="space-y-4">
                                  {(tailorPreview.experience || []).map((exp, expIdx) => (
                                    <div key={expIdx} className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700/80 rounded-xl p-3.5 space-y-3">
                                      <div className="flex justify-between items-start gap-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 flex-1">
                                          <input
                                            type="text"
                                            value={exp.title || ''}
                                            onChange={(e) => handleExpFieldChange(expIdx, 'title', e.target.value)}
                                            placeholder="Job Title"
                                            className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                                          />
                                          <input
                                            type="text"
                                            value={exp.company || ''}
                                            onChange={(e) => handleExpFieldChange(expIdx, 'company', e.target.value)}
                                            placeholder="Company Name"
                                            className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                          />
                                          <input
                                            type="text"
                                            value={exp.duration || ''}
                                            onChange={(e) => handleExpFieldChange(expIdx, 'duration', e.target.value)}
                                            placeholder="e.g. 2021 - Present"
                                            className="border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                          />
                                        </div>
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveExpEntry(expIdx)}
                                          className="text-red-500 hover:text-red-700 p-1 rounded"
                                          title="Delete this role"
                                        >
                                          <HiTrash className="h-4 w-4" />
                                        </button>
                                      </div>

                                      {/* Bullet points for this role */}
                                      <div className="space-y-2 pl-1 border-l-2 border-purple-200 dark:border-purple-800 ml-1">
                                        {(exp.bullets || []).map((bullet, bIdx) => (
                                          <div key={bIdx} className="flex items-start gap-2">
                                            <span className="text-slate-400 font-bold text-xs mt-1.5">&bull;</span>
                                            <textarea
                                              rows={2}
                                              value={bullet || ''}
                                              onChange={(e) => handleExpBulletChange(expIdx, bIdx, e.target.value)}
                                              className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white leading-normal focus:ring-1 focus:ring-purple-500"
                                              placeholder="Action verb + achievement + quantifiable metric..."
                                            />
                                            <button
                                              type="button"
                                              onClick={() => handleRemoveExpBullet(expIdx, bIdx)}
                                              className="text-slate-400 hover:text-red-600 p-1"
                                              title="Remove bullet"
                                            >
                                              <HiTrash className="h-3.5 w-3.5" />
                                            </button>
                                          </div>
                                        ))}
                                        <button
                                          type="button"
                                          onClick={() => handleAddExpBullet(expIdx)}
                                          className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline pl-4 inline-flex items-center gap-1"
                                        >
                                          <HiPlus className="h-3 w-3" /> Add Achievement Bullet
                                        </button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 5. Projects */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    5. Projects & Key Contributions
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={handleAddProject}
                                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <HiPlus className="h-3.5 w-3.5" /> Add Project
                                  </button>
                                </div>
                                <div className="space-y-3">
                                  {(tailorPreview.projects || []).map((proj, pIdx) => (
                                    <div key={pIdx} className="bg-slate-50 dark:bg-slate-900/70 border border-slate-200 dark:border-slate-700 rounded-xl p-3 space-y-2">
                                      <div className="flex justify-between items-center gap-2">
                                        <input
                                          type="text"
                                          value={proj.name || ''}
                                          onChange={(e) => handleProjectChange(pIdx, 'name', e.target.value)}
                                          placeholder="Project Name"
                                          className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1 text-xs bg-white dark:bg-slate-800 font-bold text-slate-900 dark:text-white"
                                        />
                                        <button
                                          type="button"
                                          onClick={() => handleRemoveProject(pIdx)}
                                          className="text-red-500 hover:text-red-700 p-1"
                                        >
                                          <HiTrash className="h-4 w-4" />
                                        </button>
                                      </div>
                                      <textarea
                                        rows={2}
                                        value={proj.description || ''}
                                        onChange={(e) => handleProjectChange(pIdx, 'description', e.target.value)}
                                        placeholder="Project architecture and measurable impact..."
                                        className="w-full border border-slate-300 dark:border-slate-600 rounded-lg p-2 text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {/* 6. Education */}
                              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 space-y-3">
                                <div className="flex justify-between items-center">
                                  <h5 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-400">
                                    6. Education
                                  </h5>
                                  <button
                                    type="button"
                                    onClick={handleAddEdu}
                                    className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1"
                                  >
                                    <HiPlus className="h-3.5 w-3.5" /> Add Degree
                                  </button>
                                </div>
                                <div className="space-y-2">
                                  {(tailorPreview.education || []).map((edu, eduIdx) => (
                                    <div key={eduIdx} className="flex items-center gap-2">
                                      <input
                                        type="text"
                                        value={edu.degree || ''}
                                        onChange={(e) => handleEduChange(eduIdx, 'degree', e.target.value)}
                                        placeholder="Degree"
                                        className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white font-semibold"
                                      />
                                      <input
                                        type="text"
                                        value={edu.institution || ''}
                                        onChange={(e) => handleEduChange(eduIdx, 'institution', e.target.value)}
                                        placeholder="University"
                                        className="flex-1 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                      />
                                      <input
                                        type="text"
                                        value={edu.year || ''}
                                        onChange={(e) => handleEduChange(eduIdx, 'year', e.target.value)}
                                        placeholder="Year"
                                        className="w-24 border border-slate-300 dark:border-slate-600 rounded-lg px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => handleRemoveEdu(eduIdx)}
                                        className="text-red-500 hover:text-red-700 p-1"
                                      >
                                        <HiTrash className="h-4 w-4" />
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>

                            {/* Format selection & Final Generation Action */}
                            <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl p-5 space-y-4">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <p className="text-xs font-bold text-slate-900 dark:text-white">Choose Target File Format:</p>
                                  <p className="text-[11px] text-slate-500">Pick DOCX for editable Word or PDF for standard viewing</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setTailorFormat('docx')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                      tailorFormat === 'docx'
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    📄 DOCX (Word)
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setTailorFormat('pdf')}
                                    className={`px-4 py-2 text-xs font-bold rounded-lg border transition-all ${
                                      tailorFormat === 'pdf'
                                        ? 'bg-red-600 text-white border-red-600 shadow-sm'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                                    }`}
                                  >
                                    📑 PDF Document
                                  </button>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={handleSaveCustomTailoredResume}
                                disabled={generatingResume}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-extrabold shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                              >
                                {generatingResume ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                    Creating & Saving {tailorFormat.toUpperCase()} Resume...
                                  </>
                                ) : (
                                  <>
                                    <span>💾</span> Generate & Save Tailored {tailorFormat.toUpperCase()} Resume
                                  </>
                                )}
                              </button>

                              {/* Success state with direct apply option */}
                              {generatedResumeInfo && (
                                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 animate-fadeIn">
                                  <div className="space-y-0.5 text-center sm:text-left">
                                    <p className="text-xs font-bold text-emerald-900 dark:text-emerald-300">
                                      ✓ Ready: {generatedResumeInfo.filename}
                                    </p>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                      Saved to your resume library and automatically selected.
                                    </p>
                                  </div>
                                  <button
                                    onClick={handleApply}
                                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-all whitespace-nowrap"
                                  >
                                    🚀 Apply with this new resume now
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* ─────────────────────────────────────────────────────────────
                        TAB 3: AI INTERVIEW PREP
                    ───────────────────────────────────────────────────────────── */}
                    {activeApplyTab === 'interview' && (
                      <div className="space-y-5">
                        <div className="bg-gradient-to-br from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-900 border border-indigo-100 dark:border-slate-700 rounded-2xl p-6 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <h4 className="text-sm font-extrabold text-indigo-950 dark:text-indigo-300 flex items-center gap-2">
                                <span>🎯</span> AI Interview Questions & Prep Guide
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Practice realistic interview questions generated specifically from your resume and the requirements for <strong>{job.title}</strong>.
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={handleGenerateQuestions}
                              disabled={questionsLoading || !selectedResumeId}
                              className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md disabled:opacity-40 whitespace-nowrap inline-flex items-center gap-2"
                            >
                              {questionsLoading ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                                  Generating...
                                </>
                              ) : (
                                <>
                                  <span>↺</span> {interviewQuestions ? 'Regenerate Questions' : 'Generate Practice Questions'}
                                </>
                              )}
                            </button>
                          </div>

                          {interviewQuestions && interviewQuestions.length > 0 ? (
                            <div className="space-y-3 pt-2">
                              {interviewQuestions.map((q, idx) => (
                                <div key={idx} className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-xl p-4 flex items-start gap-3 shadow-xs">
                                  <span className="h-6 w-6 bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 rounded-lg flex items-center justify-center text-xs font-black flex-shrink-0 mt-0.5">
                                    {idx + 1}
                                  </span>
                                  <div className="space-y-1 flex-1">
                                    <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                                      {q}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="border border-dashed border-indigo-200 dark:border-indigo-800 rounded-xl p-8 text-center text-xs text-slate-500 dark:text-slate-400 space-y-1">
                              <p className="font-semibold text-indigo-900 dark:text-indigo-300">No questions generated yet.</p>
                              <p>Click "Generate Practice Questions" above to get started.</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
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
