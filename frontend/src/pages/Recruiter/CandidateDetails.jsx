import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { candidateService } from '../../services/candidateService';
import { applicationService } from '../../services/applicationService';
import { interviewService } from '../../services/interviewService';
import { recommendationService } from '../../services/recommendationService';
import { HiOutlineChevronLeft, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiCheckCircle, HiOutlineDownload } from 'react-icons/hi';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function CandidateDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [status, setStatus] = useState('Applied');
  const [application, setApplication] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');
  const [scheduling, setScheduling] = useState(false);
  const [candidate, setCandidate] = useState(null);
  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Parse route ID parameter (which could be string or numeric)
    const queryId = Number.parseInt(id, 10);
    if (!Number.isInteger(queryId) || queryId < 1) {
      setLoading(false);
      return;
    }
    candidateService.getById(queryId)
      .then((data) => {
        setCandidate(data);
        return applicationService.getByCandidateId(data.id)
          .then(applications => ({ candidate: data, applications }));
      })
      .then(({ candidate: candidateData, applications }) => {
        const requestedApplicationId = searchParams.get('applicationId');
        const candidateApplication = Array.isArray(applications)
          ? applications.find(app => String(app.id) === requestedApplicationId)
            || [...applications].sort((first, second) => (second.matchScore || 0) - (first.matchScore || 0))[0]
          : null;
        setApplication(candidateApplication);
        if (candidateApplication?.status) setStatus(candidateApplication.status);
        if (candidateApplication?.jobId) {
          return recommendationService.getCandidateJobMatch(candidateData.id, candidateApplication.jobId)
            .then(matchData => setMatch(matchData));
        }
        setLoading(false);
      })
      .then(() => setLoading(false))
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id, searchParams]);

  if (loading) {
    return (
      <DashboardLayout>
        <LoadingSpinner fullPage />
      </DashboardLayout>
    );
  }

  if (!candidate) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h2 className="text-xl font-bold">Candidate Not Found</h2>
        </div>
      </DashboardLayout>
    );
  }

  const handleShortlist = async () => {
    if (!application) return;
    try {
      let updated = application;
      if (updated.status === 'Applied') {
        updated = await applicationService.updateStatus(application.id, 'Reviewing');
      }
      updated = await applicationService.updateStatus(application.id, 'Shortlisted');
      setApplication(updated);
      setStatus(updated.status);
      setToast({ message: `${candidate.name} has been successfully shortlisted!`, type: 'success' });
    } catch (error) {
      setToast({ message: error.response?.data?.message || 'Unable to shortlist candidate.', type: 'error' });
    }
  };

  const handleInterview = async () => {
    if (!application || !scheduledAt) {
      setToast({ message: 'Choose an interview date and time first.', type: 'error' });
      return;
    }
    setScheduling(true);
    try {
      const interview = await interviewService.schedule({
        applicationId: application.id,
        scheduledAt: new Date(scheduledAt).toISOString().slice(0, 19),
        durationMinutes: 60,
        type: 'TECHNICAL',
        meetingLink: meetingLink || null,
      });
      setStatus('Interviewing');
      setToast({ message: `Interview scheduled with ${candidate.name}.`, type: 'success' });
      setScheduling(false);
      return interview;
    } catch (error) {
      setScheduling(false);
      setToast({ message: error.response?.data?.message || 'Unable to schedule interview.', type: 'error' });
    }
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

      <div className="space-y-6">
        
        {/* Back link */}
        <div>
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-xs font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <HiOutlineChevronLeft className="mr-1 h-4 w-4" /> Back to Applicants
          </button>
        </div>

        {/* Candidate Summary Header */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center space-x-4">
            <span className="text-4xl p-3 bg-gray-50 border border-gray-150 rounded-xl select-none">
              {candidate.avatar}
            </span>
            <div className="space-y-1">
              <h1 className="text-xl md:text-2xl font-extrabold text-gray-905 leading-none">{candidate.name}</h1>
              <p className="text-xs font-semibold text-gray-500">{candidate.title}</p>
              
              <div className="flex flex-wrap gap-4 text-xs text-gray-500 pt-1">
                <span className="flex items-center"><HiOutlineLocationMarker className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.location}</span>
                <span className="flex items-center"><HiOutlineMail className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.email}</span>
                <span className="flex items-center"><HiOutlinePhone className="mr-1 h-4.5 w-4.5 text-gray-400" /> {candidate.phone}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3 w-full md:w-auto">
            <button
              onClick={handleShortlist}
              disabled={!application || ['Shortlisted', 'Interviewing', 'Interview Completed', 'Selected'].includes(status)}
              className={`flex-1 md:flex-none px-4 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-colors border ${
                ['Shortlisted', 'Interviewing', 'Interview Completed', 'Selected'].includes(status)
                  ? 'bg-gray-105 border-gray-200 text-gray-450 cursor-not-allowed'
                  : 'bg-white border-blue-200 hover:bg-blue-50 text-blue-600'
              }`}
            >
              {status === 'Shortlisted' || ['Interviewing', 'Interview Completed', 'Selected'].includes(status) ? 'Shortlisted' : 'Shortlist'}
            </button>
            <button
              onClick={handleInterview}
              disabled={!application || scheduling || ['Interviewing', 'Interview Completed', 'Selected'].includes(status)}
              className={`flex-1 md:flex-none px-5 py-2.5 text-xs font-bold rounded-lg shadow-sm transition-colors ${
                scheduling || ['Interviewing', 'Interview Completed', 'Selected'].includes(status)
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {scheduling ? 'Scheduling...' : ['Interviewing', 'Interview Completed', 'Selected'].includes(status) ? 'Interview Scheduled' : 'Schedule Interview'}
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 space-y-4">
          <h3 className="text-sm font-bold text-gray-900">Interview Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-xs font-semibold text-gray-700">
              Date and time
              <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            </label>
            <label className="text-xs font-semibold text-gray-700">
              Meeting link
              <input type="url" value={meetingLink} onChange={(e) => setMeetingLink(e.target.value)} placeholder="https://..."
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-xs" />
            </label>
          </div>
          {!application && <p className="text-xs text-amber-600">No application was found for this candidate.</p>}
        </div>

        {/* Evaluation and Match details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* AI Match circular indicator + parameters */}
          <div className="bg-white p-6 md:p-8 border border-gray-200 rounded-xl shadow-sm space-y-6 flex flex-col items-center">
            <h3 className="font-bold text-gray-905 text-sm text-center w-full pb-4 border-b border-gray-100">AI Compatibility Index</h3>
            
            {/* Circular score */}
            <div className="relative h-32 w-32 flex items-center justify-center">
              <svg className="absolute inset-0 h-full w-full transform -rotate-90">
                <circle cx="64" cy="64" r="54" className="stroke-gray-100 fill-none" strokeWidth="8" />
                <circle cx="64" cy="64" r="54" className="stroke-emerald-500 fill-none" strokeWidth="8" strokeDasharray="339.29" strokeDashoffset={339.29 - (339.29 * (match?.overallScore || 0)) / 100} />
              </svg>
              <span className="text-2xl font-black text-emerald-600">{match ? `${Math.round(match.overallScore)}%` : '—'}</span>
            </div>

            {/* Parameter Progress Bars */}
            <div className="w-full space-y-4 pt-4 border-t border-gray-100 text-xs">
              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Skills Compatibility</span>
                  <span>{match ? `${Math.round(match.skillScore)}%` : '—'}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `${match?.skillScore || 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Experience Alignment</span>
                  <span>{match ? `${Math.round(match.experienceScore)}%` : '—'}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${match?.experienceScore || 0}%` }}></div>
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between font-bold text-gray-600">
                  <span>Education Relevance</span>
                  <span>{match ? `${Math.round(match.educationScore)}%` : '—'}</span>
                </div>
                <div className="w-full bg-gray-100 h-1.5 rounded-full">
                  <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${match?.educationScore || 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Main profile evaluation details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Candidate summary bio & CV download */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-gray-905 text-sm">Professional Summary</h3>
                <button className="inline-flex items-center text-xs font-semibold text-blue-600 hover:underline">
                  <HiOutlineDownload className="mr-1 h-4 w-4" /> Download Resume
                </button>
              </div>
              <p className="text-xs text-gray-650 leading-relaxed">{candidate.summary}</p>
            </div>

            {/* Comparative lists for matching vs missing skills */}
            <div className="bg-white p-6 border border-gray-200 rounded-xl shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-600 mb-3 flex items-center">
                  <HiCheckCircle className="h-4 w-4 mr-1" /> Matching Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(match?.matchedSkills || []).map((skill) => (
                    <span key={skill} className="bg-emerald-50 text-emerald-700 border border-emerald-100 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-500 mb-3 flex items-center">
                  <span className="h-4 w-4 rounded-full bg-red-100 text-red-650 flex items-center justify-center font-bold text-[10px] mr-1">&times;</span>
                  Missing Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {(match?.missingSkills || []).map((skill) => (
                    <span key={skill} className="bg-red-50 text-red-750 border border-red-100 text-xs px-2.5 py-0.5 rounded-md font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
