'use client';

import { useState } from 'react';
import { FileText, AlertCircle, CheckCircle, X, Mail } from 'lucide-react';

interface BulkReportCardGeneratorProps {
  schoolId: string;
  term: string;
  academicYear: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function BulkReportCardGenerator({ schoolId, term, academicYear, onClose, onSuccess }: BulkReportCardGeneratorProps) {
  const [studentIds, setStudentIds] = useState<string>('');
  const [sendEmails, setSendEmails] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handleGenerate = async () => {
    if (!schoolId || !term || !academicYear) {
      setError('Please fill in all required fields');
      return;
    }

    setGenerating(true);
    setError('');

    try {
      const payload: any = {
        school_id: schoolId,
        term: term,
        academic_year: academicYear,
        send_emails: sendEmails,
      };

      // If specific student IDs provided, parse them
      if (studentIds.trim()) {
        const ids = studentIds.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id));
        if (ids.length > 0) {
          payload.student_ids = ids;
        }
      }

      const token = localStorage.getItem('token');
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
      const res = await fetch(`${backendUrl}/api/report-cards/bulk-generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Generation failed');
      }

      setResult(data);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.message || 'Failed to generate report cards');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Bulk Generate Report Cards</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              This will generate report cards for all students with grades in the selected term and academic year.
              Leave "Student IDs" empty to generate for all students, or enter comma-separated student IDs for specific students.
            </p>
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
                <h3 className="font-semibold text-green-900">Generation Complete!</h3>
              </div>
              <div className="text-sm text-green-800 space-y-1">
                <p>✅ Successfully generated: <strong>{result.generated}</strong> report cards</p>
                {result.errors > 0 && (
                  <p>⚠️ Errors: <strong>{result.errors}</strong> report cards failed</p>
                )}
                {sendEmails && (
                  <p className="flex items-center gap-1">
                    <Mail className="w-4 h-4" />
                    Emails sent to students and parents
                  </p>
                )}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Student IDs (Optional)
            </label>
            <input
              type="text"
              value={studentIds}
              onChange={(e) => setStudentIds(e.target.value)}
              placeholder="Leave empty for all students, or enter comma-separated IDs (e.g., 1, 2, 3)"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">Leave empty to generate for all students with grades</p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sendEmails"
              checked={sendEmails}
              onChange={(e) => setSendEmails(e.target.checked)}
              className="rounded"
            />
            <label htmlFor="sendEmails" className="text-sm text-gray-700 cursor-pointer flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Send report cards via email to students and parents
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              disabled={generating}
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Generating...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Report Cards
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
