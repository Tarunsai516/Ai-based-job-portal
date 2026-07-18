import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import EmptyState from '../../components/common/EmptyState';
import { HiOutlineCheck, HiOutlineClock } from 'react-icons/hi';

const buildStages = (status) => [
  {
    label: 'Application Submitted',
    desc: 'Your profile was successfully delivered to the employer.',
    done: true,
  },
  {
    label: 'AI Resume Vetting',
    desc: 'TalentSync AI parsed your resume and calculated your compatibility score.',
    done: ['Shortlisted', 'Interviewing', 'Hired'].includes(status),
    current: status === 'Applied',
  },
  {
    label: 'Shortlisted by Recruiter',
    desc: 'The hiring manager reviewed your profile and added you to the shortlist.',
    done: ['Interviewing', 'Hired'].includes(status),
    current: status === 'Shortlisted',
  },
  {
    label: 'Interview Stage',
    desc: 'You have been invited for a technical or HR interview.',
    done: status === 'Hired',
    current: status === 'Interviewing',
  },
];

export default function ApplicationStatus() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const candidateId = user?.id || 1;
    applicationService.getByCandidateId(candidateId)
      .then(data => {
        setApplications(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => {
        setApplications([]);
        setLoading(false);
      });
  }, [user]);

  const activeApp = applications[selectedIdx] || null;
  const stages = activeApp ? buildStages(activeApp.status) : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Application Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5">Monitor your application pipeline and interview progress in real time.</p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-pulse">
            <div className="space-y-3">
              {[1,2,3].map(i => <div key={i} className="h-20 bg-gray-100 rounded-xl" />)}
            </div>
            <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-8 space-y-6">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-3 bg-gray-100 rounded w-1/3" />
              <div className="space-y-4 mt-6">
                {[1,2,3,4].map(i => <div key={i} className="h-12 bg-gray-100 rounded-lg" />)}
              </div>
            </div>
          </div>
        ) : applications.length === 0 ? (
          <EmptyState
            title="No Applications Tracked"
            message="Apply to jobs first, then check back here to track your progress."
            actionText="Browse Jobs"
            onAction={() => window.location.replace('/jobs')}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Applications Sidebar */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Your Applications</h3>
              <div className="space-y-2">
                {applications.map((app, idx) => (
                  <button
                    key={app.id}
                    onClick={() => setSelectedIdx(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedIdx === idx
                        ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <h4 className="text-xs font-bold text-gray-400 uppercase">{app.companyName}</h4>
                    <p className="text-xs font-bold text-gray-800 truncate mt-0.5">{app.jobTitle}</p>
                    <span className="text-[10px] text-gray-400 block mt-1">
                      Status: <span className="font-semibold text-blue-600">{app.status}</span>
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Timeline Detail */}
            <div className="lg:col-span-2 bg-white p-6 md:p-8 border border-gray-200 rounded-xl shadow-sm space-y-6">
              {activeApp ? (
                <>
                  <div className="border-b border-gray-100 pb-4">
                    <h3 className="text-base font-bold text-gray-900">{activeApp.jobTitle}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      {activeApp.companyName}
                      {activeApp.matchScore != null && ` · AI Match Score: ${activeApp.matchScore}%`}
                    </p>
                  </div>

                  <div className="relative border-l border-gray-200 ml-4 space-y-8 py-2">
                    {stages.map((stage, idx) => (
                      <div key={idx} className="relative pl-8">
                        <span className={`absolute -left-3 top-0.5 flex items-center justify-center h-6 w-6 rounded-full ring-4 ring-white ${
                          stage.done ? 'bg-emerald-500 text-white' :
                          stage.current ? 'bg-blue-500 text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {stage.done ? <HiOutlineCheck className="h-4 w-4" /> : <HiOutlineClock className="h-4 w-4" />}
                        </span>
                        <div className="space-y-1">
                          <h4 className={`text-xs font-bold ${
                            stage.done ? 'text-gray-800' : stage.current ? 'text-blue-600' : 'text-gray-400'
                          }`}>
                            {stage.label}
                          </h4>
                          <p className="text-[11px] text-gray-500 leading-relaxed">{stage.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-6 text-xs text-gray-500">Select an application to view its status.</div>
              )}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
