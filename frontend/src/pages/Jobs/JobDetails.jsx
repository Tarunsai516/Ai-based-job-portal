import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { jobService } from '../../services/jobService';
import { applicationService } from '../../services/applicationService';
import { candidateService } from '../../services/candidateService';
import { recommendationService } from '../../services/recommendationService';
import { useAuth } from '../../context/AuthContext';
import { HiLocationMarker, HiCurrencyDollar, HiBriefcase, HiMail, HiChevronLeft, HiShare } from 'react-icons/hi';
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
        const completedResumes = (resumeData || []).filter(resume => resume.status === 'COMPLETED');
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
                    ? 'bg-gray-100 text-gray-400 border border-gray-250 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {applied ? 'Applied' : 'Apply with resume'}
              </button>
            )}
          </div>
        </div>

        {showApplyPanel && user?.role?.toLowerCase() === 'seeker' && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 p-4 flex items-center justify-center" role="dialog" aria-modal="true" aria-label="Choose resume for application">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-start justify-between gap-4"><div><p className="eyebrow">Application ready</p><h2 className="text-2xl font-bold text-slate-950 mt-1">Choose the right resume.</h2><p className="text-sm text-slate-500 mt-2">TalentSync will analyze this version against {job.title} before you submit.</p></div><button onClick={() => setShowApplyPanel(false)} className="text-slate-400 hover:text-slate-900 text-xl" aria-label="Close">×</button></div>
              {resumes.length === 0 ? <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">Upload and finish processing at least one resume before applying to this role. <Link to="/resume/upload" className="font-bold underline">Upload resume</Link></div> : <>
                <div className="space-y-2"><label className="eyebrow" htmlFor="application-resume">Resume for this application</label><select id="application-resume" value={selectedResumeId} onChange={event => { setSelectedResumeId(event.target.value); setResumeAnalysis(null); }} className="w-full border border-slate-200 rounded-lg px-3 py-3 text-sm text-slate-900"><option value="">Select a resume</option>{resumes.map(resume => <option key={resume.resumeId} value={resume.resumeId}>{resume.filename}</option>)}</select></div>
                <button onClick={analyzeSelectedResume} disabled={!selectedResumeId || analysisLoading} className="w-full py-3 rounded-lg border border-blue-200 text-blue-700 text-sm font-bold hover:bg-blue-50 disabled:opacity-50">{analysisLoading ? 'Analyzing resume for this job...' : resumeAnalysis ? 'Re-analyze selected resume' : 'Analyze resume for this job'}</button>
                {resumeAnalysis && <div className="bg-slate-950 text-white rounded-xl p-5 space-y-4"><div className="flex items-center justify-between"><div><p className="eyebrow text-teal-300">Job-specific AI review</p><p className="text-sm text-slate-300 mt-1">How this resume presents you for {job.title}</p></div><span className="text-3xl font-bold text-teal-300">{resumeAnalysis.resumeScore}<span className="text-xs text-slate-400">/100</span></span></div>{resumeAnalysis.weakSections?.length > 0 && <div><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Improve these sections</p><div className="flex flex-wrap gap-2 mt-2">{resumeAnalysis.weakSections.map(section => <span key={section} className="text-xs px-2 py-1 rounded bg-amber-400/10 text-amber-200">{section}</span>)}</div></div>}{resumeAnalysis.missingKeywords?.length > 0 && <div><p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Job keywords to consider</p><p className="text-sm text-slate-200 mt-2">{resumeAnalysis.missingKeywords.join(', ')}</p></div>}{resumeAnalysis.suggestions?.slice(0, 3).map((suggestion, index) => <div key={`${suggestion.section}-${index}`} className="border-t border-slate-800 pt-3"><p className="text-sm font-bold text-white">{suggestion.section || 'Improvement'}</p><p className="text-xs text-slate-300 mt-1">{suggestion.reason}</p>{suggestion.suggestedText && <p className="text-xs text-teal-200 mt-2">{suggestion.suggestedText}</p>}</div>)}</div>}
                <button onClick={handleApply} disabled={!selectedResumeId} className="w-full py-3 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50">Submit application with this resume</button>
              </>}
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
