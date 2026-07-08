import React, { useState } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import Toast from '../../components/common/Toast';
import { HiCloudUpload, HiDocumentText, HiOutlineSparkles, HiCheckCircle } from 'react-icons/hi';
import { motion } from 'framer-motion';

export default function ResumeUpload() {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploaded, setUploaded] = useState(false);
  const [toast, setToast] = useState(null);

  // Simulated Parsed Results
  const parsedResults = {
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Next.js', 'Redux', 'Git'],
    experience: '5.5 Years',
    suggestedRoles: ['Senior React Developer', 'Frontend Engineer', 'UI/UX Developer'],
    compatibilityScore: 92
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    validateAndSetFile(droppedFile);
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    validateAndSetFile(selectedFile);
  };

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;
    const extension = selectedFile.name.split('.').pop().toLowerCase();
    if (extension !== 'pdf' && extension !== 'docx') {
      setToast({
        message: 'Invalid file format. Please upload PDF or DOCX only.',
        type: 'error'
      });
      return;
    }
    setFile(selectedFile);
    setUploaded(false);
    setProgress(0);
  };

  const triggerUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);

    // Simulate progress updates
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setUploading(false);
          setUploaded(true);
          setToast({
            message: 'Resume uploaded and parsed successfully by AI!',
            type: 'success'
          });
          return 100;
        }
        return prev + 20;
      });
    }, 200);
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

      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-905">AI Resume Parser</h1>
          <p className="text-xs text-gray-500 mt-0.5">Upload your CV to extract technical keywords and generate instant AI compatibility matches.</p>
        </div>

        {/* Drag Drop Area */}
        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className="border-2 border-dashed border-gray-250 hover:border-blue-400 bg-white rounded-2xl p-8 text-center transition-all duration-300 relative group flex flex-col items-center justify-center cursor-pointer min-h-[220px]"
        >
          <input
            type="file"
            id="resume-file"
            accept=".pdf,.docx"
            onChange={handleFileSelect}
            className="absolute inset-0 opacity-0 cursor-pointer"
          />
          <HiCloudUpload className="h-12 w-12 text-gray-400 group-hover:text-blue-500 transition-colors duration-300" />
          <h3 className="mt-3 text-sm font-bold text-gray-800">Drag and drop your resume here</h3>
          <p className="text-[10px] text-gray-400 mt-1">Accepted formats: PDF or DOCX up to 10MB</p>
          <button
            type="button"
            className="mt-4 px-4 py-2 border border-gray-205 text-gray-650 hover:bg-gray-50 text-xs font-semibold rounded-lg shadow-sm transition-colors relative z-10 pointer-events-none"
          >
            Select File
          </button>
        </div>

        {/* Selected File Details */}
        {file && (
          <div className="bg-white p-5 border border-gray-200 rounded-xl shadow-sm space-y-4">
            <div className="flex items-center space-x-3">
              <HiDocumentText className="h-8 w-8 text-blue-600" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-gray-850 truncate">{file.name}</p>
                <p className="text-[10px] text-gray-450 mt-0.5">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              {!uploading && !uploaded && (
                <button
                  onClick={triggerUpload}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                >
                  Upload & Analyze
                </button>
              )}
            </div>

            {/* Upload Progress Bar */}
            {uploading && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-500">
                  <span>Uploading File...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Parsed AI Results preview */}
        {uploaded && (
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
                <p className="text-lg font-black text-gray-805 mt-1">{parsedResults.experience}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Match Compatibility</p>
                <p className="text-lg font-black text-emerald-600 mt-1">{parsedResults.compatibilityScore}%</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 col-span-1 sm:col-span-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase">Extracted Format</p>
                <p className="text-lg font-black text-gray-805 mt-1">{file?.name.split('.').pop().toUpperCase()}</p>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Extracted Skills</span>
              <div className="flex flex-wrap gap-1.5">
                {parsedResults.skills.map((skill) => (
                  <span key={skill} className="bg-blue-50 text-blue-700 border border-blue-100 text-xs px-2.5 py-0.5 rounded-lg font-semibold">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Recommended Roles</span>
              <div className="space-y-2">
                {parsedResults.suggestedRoles.map((role) => (
                  <div key={role} className="flex items-center space-x-2 text-xs text-gray-700">
                    <HiCheckCircle className="h-5 w-5 text-emerald-500" />
                    <span className="font-medium">{role}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}
