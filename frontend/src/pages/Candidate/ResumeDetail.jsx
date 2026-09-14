import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { candidateService } from '../../services/candidateService';
import { HiChevronLeft, HiDocumentText, HiOutlineDownload, HiOutlineEye } from 'react-icons/hi';

export default function ResumeDetail() {
  const { resumeId } = useParams();
  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    candidateService.getResume(resumeId).then(setResume).finally(() => setLoading(false));
  }, [resumeId]);

  const openResume = async () => {
    const blob = await candidateService.downloadResume(resumeId);
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank', 'noopener,noreferrer');
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  if (loading) return <DashboardLayout><div className="surface h-64 animate-pulse" /></DashboardLayout>;
  if (!resume) return <DashboardLayout><div className="surface p-8 text-center">Resume not found.</div></DashboardLayout>;

  const parsed = resume.parsedData || {};
  const education = parsed.education || [];
  const experience = parsed.experience || [];

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/resume/library" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-blue-600"><HiChevronLeft /> Resume library</Link>
        <div className="surface p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
            <div className="flex items-center gap-4"><span className="h-14 w-14 grid place-items-center rounded-xl bg-blue-50 text-blue-600"><HiDocumentText className="h-8 w-8" /></span><div><p className="eyebrow">Resume overview</p><h1 className="mt-1 text-2xl font-bold text-slate-950 dark:text-white break-all">{resume.filename}</h1><p className="text-xs text-slate-500 mt-1">{resume.status} {resume.processedAt ? `· analyzed ${new Date(resume.processedAt).toLocaleDateString()}` : ''}</p></div></div>
            <div className="flex gap-2"><button onClick={openResume} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><HiOutlineEye /> Preview</button><button onClick={openResume} className="inline-flex items-center gap-1.5 px-3 py-2 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50"><HiOutlineDownload /> Download</button></div>
          </div>
        </div>

        {resume.status !== 'COMPLETED' ? <div className="surface p-6 text-sm text-amber-700">This resume is still being analyzed. Refresh this page when processing is complete.</div> : <>
          <div className="grid lg:grid-cols-3 gap-5">
            <section className="surface p-6 lg:col-span-2 space-y-5"><div><p className="eyebrow">AI summary</p><p className="text-sm text-slate-600 leading-relaxed mt-2">{parsed.summary || 'No summary was extracted.'}</p></div><div className="border-t border-slate-100 pt-5"><p className="eyebrow">Skills found</p><div className="flex flex-wrap gap-2 mt-3">{(parsed.skills || []).map(skill => <span key={skill} className="px-2.5 py-1 rounded-md bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold">{skill}</span>)}</div></div></section>
            <section className="surface p-6 space-y-4"><p className="eyebrow">Profile signals</p><div><p className="text-xs text-slate-400">Estimated experience</p><p className="text-lg font-bold text-slate-900 mt-1">{parsed.estimatedYearsOfExperience || 0} years</p></div><div><p className="text-xs text-slate-400">Education</p><p className="text-sm font-bold text-slate-900 mt-1">{education[0]?.degree || 'Not specified'}</p></div><div><p className="text-xs text-slate-400">Projects</p><p className="text-lg font-bold text-slate-900 mt-1">{(parsed.projects || []).length}</p></div></section>
          </div>
          <section className="surface p-6 space-y-4"><p className="eyebrow">Experience and projects</p>{experience.length === 0 && (parsed.projects || []).length === 0 && <p className="text-sm text-slate-500">No detailed entries were extracted.</p>}{experience.map((item, index) => <div key={`${item.title}-${index}`} className="border-l-2 border-blue-200 pl-4"><p className="text-sm font-bold text-slate-900">{item.title || 'Experience'}</p><p className="text-xs text-slate-500">{item.company} {item.duration ? `· ${item.duration}` : ''}</p><p className="text-sm text-slate-600 mt-1">{item.description}</p></div>)}{(parsed.projects || []).map(project => <div key={project} className="border-l-2 border-teal-200 pl-4 text-sm text-slate-600">{project}</div>)}</section>
        </>}
      </div>
    </DashboardLayout>
  );
}
