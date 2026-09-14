import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { HiDocumentText, HiCloudUpload, HiChevronRight, HiCheckCircle, HiClock } from 'react-icons/hi';

export default function ResumeLibrary() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    candidateService.getResumes()
      .then(setResumes)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-7">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Career profile</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">Your resume library.</h1>
            <p className="text-sm text-slate-500 mt-2">Keep different versions ready for different roles. TalentSync analyzes the resume you choose for each application.</p>
          </div>
          <Link to="/resume/upload" className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold hover:bg-blue-700">
            <HiCloudUpload className="h-4 w-4" /> Upload resume
          </Link>
        </div>

        {loading && <div className="grid md:grid-cols-2 gap-4">{[1, 2].map(item => <div key={item} className="surface h-40 animate-pulse" />)}</div>}
        {error && <div className="surface p-8 text-center text-sm text-rose-600">We could not load your resumes. Please try again.</div>}
        {!loading && !error && resumes.length === 0 && (
          <div className="surface p-12 text-center space-y-4">
            <HiDocumentText className="h-12 w-12 text-slate-300 mx-auto" />
            <div><h2 className="text-lg font-bold text-slate-900">No resumes yet</h2><p className="text-sm text-slate-500 mt-1">Upload your first resume and TalentSync will extract your skills and experience.</p></div>
            <Link to="/resume/upload" className="inline-flex px-4 py-2.5 bg-blue-600 text-white rounded-lg text-xs font-bold">Upload your first resume</Link>
          </div>
        )}
        {!loading && !error && resumes.length > 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {resumes.map(resume => (
              <button key={resume.resumeId} onClick={() => navigate(`/resume/${resume.resumeId}`)} className="surface text-left p-5 hover:border-blue-300 hover:-translate-y-0.5 transition-all group">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="h-11 w-11 shrink-0 grid place-items-center rounded-xl bg-blue-50 text-blue-600"><HiDocumentText className="h-6 w-6" /></span>
                    <div className="min-w-0"><h2 className="font-bold text-slate-900 dark:text-white truncate">{resume.filename}</h2><p className="text-xs text-slate-500 mt-1">Uploaded {resume.createdAt ? new Date(resume.createdAt).toLocaleDateString() : 'recently'}</p></div>
                  </div>
                  <HiChevronRight className="h-5 w-5 text-slate-300 group-hover:text-blue-600 shrink-0" />
                </div>
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className={`inline-flex items-center gap-1 font-bold ${resume.status === 'COMPLETED' ? 'text-emerald-600' : resume.status === 'FAILED' ? 'text-rose-600' : 'text-amber-600'}`}>
                    {resume.status === 'COMPLETED' ? <HiCheckCircle /> : <HiClock />} {resume.status === 'COMPLETED' ? 'AI analyzed' : resume.status.toLowerCase()}
                  </span>
                  <span className="text-slate-400">Open overview</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
