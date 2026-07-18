import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { candidateService } from '../../services/candidateService';
import { useAuth } from '../../context/AuthContext';
import { HiCloudUpload, HiDocumentText, HiOutlineSparkles, HiCheckCircle, HiOutlineTrash } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function ResumeUpload() {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [parsedResult, setParsedResult] = useState(null);
  const [toast, setToast] = useState(null);
  const [existingResume, setExistingResume] = useState(null);

  // Fetch existing resume info from profile
  useEffect(() => {
    const candidateId = user?.id || 1;
    candidateService.getById(candidateId)
      .then(data => {
        if (data?.resumeUrl) setExistingResume(data.resumeUrl);
      })
      .catch(() => {});
  }, [user]);

  const handleDragOver = (e) => e.preventDefault();

  const handleDrop = (e) => {
    e.preventDefault();
    validateAndSetFile(e.dataTransfer.files[0]);
  };

  const handleFileSelect = (e) => validateAndSetFile(e.target.files[0]);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const ext = selectedFile.name.split('.').pop().toLowerCase();
    if (ext !== 'pdf' && ext !== 'docx') {
      setToast({ message: 'Invalid format. Upload PDF or DOCX only.', type: 'error' });
      return;
    }
    setFile(selectedFile);
    setParsedResult(null);
    setProgress(0);
  };

  const triggerUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    // Simulate upload progress UI
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 85) { clearInterval(interval); return 85; }
        return prev + 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const result = await candidateService.uploadResume(formData);
      clearInterval(interval);
      setProgress(100);
      setUploading(false);
      setParsedResult(result);
      setExistingResume(result?.resumeUrl || file.name);
      setToast({ message: 'Resume uploaded and parsed by AI successfully!', type: 'success' });
    } catch (err) {
      clearInterval(interval);
      setProgress(0);
      setUploading(false);
      setToast({ message: 'Upload failed. Please try again.', type: 'error' });
    }
  };

  return (
    <DashboardLayout>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">AI Resume Parser</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Upload your CV to extract technical keywords, years of experience, and get instant AI-powered job compatibility matches.
          </p>
        </div>

        {/* Existing resume notice */}
        {existingResume && !parsedResult && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center space-x-3">
            <HiCheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-emerald-800">Resume on file</p>
              <p className="text-[10px] text-emerald-600 mt-0.5">{existingResume}</p>
            </div>
          </div>
        )}

        {/* Drag & Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-200 hover:border-blue-400 bg-white rounded-2xl p-8 text-center transition-all duration-300 relative group flex flex-col items-center justify-center cursor-pointer min-h-[200px]"
        >
          <input
            type="file"
            id="resume-file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <HiCloudUpload className="h-12 w-12 text-gray-300 group-hover:text-blue-500 transition-colors duration-300" />
          <h3 className="mt-3 text-sm font-bold text-gray-800">Drag & drop your resume here</h3>
          <p className="text-[10px] text-gray-400 mt-1">Accepted: PDF or DOCX · Max 10MB</p>
          <span className="mt-4 px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg">
            Select File
          </span>
        </div>

        {/* Selected file */}
        {file && (
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <HiDocumentText className="h-8 w-8 text-blue-600 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-800 truncate">{file.name}</p>
                <p className="text-[10px] text-gray-400 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && !parsedResult && (
                <button
                  onClick={triggerUpload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Upload & Analyze
                </button>
              )}
              {!uploading && parsedResult && (
                <button onClick={() => { setFile(null); setParsedResult(null); setProgress(0); }}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors" title="Remove file">
                  <HiOutlineTrash className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Progress */}
            {(uploading || progress > 0) && !parsedResult && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>{uploading ? 'Analyzing with AI...' : 'Complete'}</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Parsed Results */}
        {parsedResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 md:p-8 space-y-6"
          >
            <div className="flex items-center space-x-2 pb-4 border-b border-gray-100">
              <HiOutlineSparkles className="h-6 w-6 text-emerald-500 animate-pulse" />
              <h3 className="font-bold text-gray-900 text-sm">AI Extraction Insights</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Experience</p>
                <p className="text-lg font-black text-gray-800 mt-1">{parsedResult.experience || 'N/A'}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Match Score</p>
                <p className="text-lg font-black text-emerald-600 mt-1">
                  {parsedResult.compatibilityScore != null ? `${parsedResult.compatibilityScore}%` : '—'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Format</p>
                <p className="text-lg font-black text-gray-800 mt-1">{file?.name.split('.').pop().toUpperCase()}</p>
              </div>
            </div>

            {parsedResult.skills?.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Extracted Skills</span>
                <div className="flex flex-wrap gap-1.5">
                  {parsedResult.skills.map((skill) => (
                    <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {parsedResult.suggestedRoles?.length > 0 && (
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recommended Roles</span>
                <div className="space-y-2">
                  {parsedResult.suggestedRoles.map((role) => (
                    <div key={role} className="flex items-center space-x-2 text-xs text-gray-700">
                      <HiCheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                      <span className="font-medium">{role}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {parsedResult.analysisNotes && (
              <div className="pt-4 border-t border-gray-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">AI Analysis</span>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">{parsedResult.analysisNotes}</p>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </DashboardLayout>
  );
}
