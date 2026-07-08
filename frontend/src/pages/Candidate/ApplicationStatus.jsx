import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { applications as initialApplications } from '../../data/mockData';
import { HiOutlineCheck, HiOutlineClock, HiOutlineChevronRight } from 'react-icons/hi';

export default function ApplicationStatus() {
  const [selectedAppIdx, setSelectedAppIdx] = useState(0);
  const activeApp = initialApplications[selectedAppIdx];

  // Simulated status stages
  const stages = [
    { label: 'Application Submitted', desc: 'Your profile has been delivered to the employer.', done: true, current: false },
    { label: 'Resume AI Vetting', desc: 'Extracted skills compatibility matched at 92%.', done: true, current: false },
    { label: 'Shortlist Assessment', desc: 'Vetted by hiring manager Marcus Vance.', done: activeApp?.status !== 'Applied', current: activeApp?.status === 'Shortlisted' },
    { label: 'Interview Telephony', desc: '1-on-1 technical conversation scheduled.', done: activeApp?.status === 'Interviewing', current: activeApp?.status === 'Interviewing' }
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">Application Tracker</h1>
          <p className="text-xs text-gray-500 mt-0.5">Observe real-time tracking checkpoints and interview timelines.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Applications list selector */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">Applications</h3>
            <div className="space-y-2">
              {initialApplications.map((app, idx) => (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppIdx(idx)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedAppIdx === idx
                      ? 'bg-blue-50/50 border-blue-300 shadow-sm'
                      : 'bg-white border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <h4 className="text-xs font-bold text-gray-400 uppercase">{app.companyName}</h4>
                  <p className="text-xs font-bold text-gray-805 truncate mt-0.5">{app.jobTitle}</p>
                  <span className="text-[10px] text-gray-400 block mt-1">Status: <span className="font-semibold text-blue-600">{app.status}</span></span>
                </button>
              ))}
            </div>
          </div>

          {/* Timeline Tracking Details */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 border border-gray-200 rounded-xl shadow-sm space-y-6">
            {activeApp ? (
              <>
                <div className="border-b border-gray-100 pb-4">
                  <h3 className="text-base font-bold text-gray-900">{activeApp.jobTitle}</h3>
                  <p className="text-xs text-gray-500">{activeApp.companyName} &bull; Mapped compatibility match score {activeApp.matchScore}%</p>
                </div>

                {/* Timeline */}
                <div className="relative border-l border-gray-200 ml-4 space-y-8 py-2">
                  {stages.map((stage, idx) => (
                    <div key={idx} className="relative pl-8">
                      {/* Checkpoint Bullet indicator */}
                      <span className={`absolute -left-3 top-0.5 flex items-center justify-center h-6 w-6 rounded-full ring-4 ring-white ${
                        stage.done ? 'bg-emerald-500 text-white' : stage.current ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {stage.done ? <HiOutlineCheck className="h-4 w-4" /> : <HiOutlineClock className="h-4 w-4" />}
                      </span>
                      
                      <div className="space-y-1">
                        <h4 className={`text-xs font-bold ${stage.done ? 'text-gray-800' : stage.current ? 'text-blue-600' : 'text-gray-400'}`}>
                          {stage.label}
                        </h4>
                        <p className="text-[11px] text-gray-500 leading-relaxed">{stage.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-6 text-xs text-gray-500">No active applications to display.</div>
            )}
          </div>

        </div>

      </div>
    </DashboardLayout>
  );
}
