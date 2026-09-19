import React from 'react';
import { HiCheck, HiOutlineDocumentText, HiOutlineChat, HiOutlineX } from 'react-icons/hi';

export default function ApplicationTimeline({ currentStatus }) {
  const steps = [
    { id: 'applied', label: 'Application Submitted', desc: 'Your resume has been sent to the recruiter.', icon: HiCheck, color: 'text-indigo-600', bg: 'bg-indigo-100', border: 'border-indigo-600' },
    { id: 'analyzed', label: 'AI Resume Analysis', desc: 'TalentSync AI has scored your profile.', icon: HiOutlineDocumentText, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-600' },
    { id: 'shortlisted', label: 'Shortlisted', desc: 'You made it to the next round!', icon: HiCheck, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-600' },
    { id: 'interview', label: 'Interview Scheduled', desc: 'Get ready for your interview.', icon: HiOutlineChat, color: 'text-purple-600', bg: 'bg-purple-100', border: 'border-purple-600' },
  ];

  let currentStepIndex = steps.findIndex(s => s.id === currentStatus?.toLowerCase());
  if (currentStepIndex === -1) currentStepIndex = 1; // Default mock state for demo
  
  if (currentStatus?.toLowerCase() === 'rejected') {
    steps[2] = { id: 'rejected', label: 'Application Closed', desc: 'The company went with another candidate. AI Feedback: "Requires 2 more years of React experience."', icon: HiOutlineX, color: 'text-red-600', bg: 'bg-red-100', border: 'border-red-600' };
    steps.pop();
    currentStepIndex = 2;
  }

  return (
    <div className="surface p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-900 mb-6">Application Status Tracker</h3>
      <div className="relative border-l-2 border-slate-200 ml-4 space-y-8">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentStepIndex;
          const isCurrent = idx === currentStepIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="relative pl-6">
              <span className={`absolute -left-[17px] top-1 h-8 w-8 rounded-full flex items-center justify-center border-2 bg-white transition-all duration-500 ${isCompleted ? step.border : 'border-slate-300'}`}>
                <Icon className={`h-4 w-4 ${isCompleted ? step.color : 'text-slate-300'}`} />
              </span>
              <div className={`transition-all duration-500 ${isCompleted ? 'opacity-100 translate-x-0' : 'opacity-40 -translate-x-2'}`}>
                <h4 className={`text-sm font-bold ${isCurrent ? 'text-slate-900' : 'text-slate-600'}`}>{step.label}</h4>
                <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                {isCurrent && currentStatus?.toLowerCase() !== 'rejected' && (
                  <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-lg p-3 inline-block">
                    <p className="text-xs text-indigo-700 font-medium">Currently in progress. Check back soon!</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
