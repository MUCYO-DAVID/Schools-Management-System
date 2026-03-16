'use client';

import { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X } from 'lucide-react';

interface BulkGradeUploadProps {
  schoolId: string;
  term: string;
  academicYear: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkGradeUpload({ schoolId, term, academicYear, onClose, onSuccess }: BulkGradeUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a CSV file');
      return;
    }

    if (!schoolId || !term || !academicYear) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('school_id', schoolId);
      formData.append('term', term);
      formData.append('academic_year', academicYear);

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/grades/bulk-upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to upload grades');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `student_email,subject,grade,score,max_score,comments
student1@example.com,Mathematics,A,95,100,Excellent work
student2@example.com,Mathematics,B,85,100,Good progress
student3@example.com,English,A,92,100,Well done`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grade_upload_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bulk Upload Grades</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">CSV Format Required:</h3>
            <p className="text-sm text-blue-800 mb-2">Your CSV file should have the following columns:</p>
            <ul className="text-sm text-blue-800 list-disc list-inside space-y-1">
              <li><strong>student_email</strong> - Student's email address</li>
              <li><strong>subject</strong> - Subject name (e.g., Mathematics, English)</li>
              <li><strong>grade</strong> - Letter grade (A, B, C, D, F)</li>
              <li><strong>score</strong> - Numeric score (optional)</li>
              <li><strong>max_score</strong> - Maximum score (default: 100)</li>
              <li><strong>comments</strong> - Teacher comments (optional)</li>
            </ul>
            <button
              onClick={downloadTemplate}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline flex items-center gap-1"
            >
              <FileText className="w-4 h-4" />
              Download Template CSV
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h3 className="font-semibold text-green-900">Upload Complete!</h3>
              </div>
              <div className="text-sm text-green-800 space-y-1">
                <p>✅ Successfully uploaded: <strong>{result.uploaded}</strong> grades</p>
                {result.errors > 0 && (
                  <p>⚠️ Errors: <strong>{result.errors}</strong> rows failed</p>
                )}
              </div>
              {result.errors > 0 && result.errors && (
                <div className="mt-3 max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-red-700 mb-1">Error Details:</p>
                  {result.errors.map((err: any, idx: number) => (
                    <p key={idx} className="text-xs text-red-600">Row {err.row}: {err.error}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-blue-500 transition-colors">
                  {file ? (
                    <div className="flex items-center justify-center gap-2 text-blue-600">
                      <FileText className="w-5 h-5" />
                      <span className="font-medium">{file.name}</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-500">
                      <Upload className="w-8 h-8" />
                      <span>Click to select CSV file</span>
                    </div>
                  )}
                </div>
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={uploading}
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  Upload Grades
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
