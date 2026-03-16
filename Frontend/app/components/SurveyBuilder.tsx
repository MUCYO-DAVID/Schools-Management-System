'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X, AlertCircle } from 'lucide-react';
import {
  fetchSurveyTemplates,
  createSurveyTemplate,
  updateSurveyTemplate,
  deleteSurveyTemplate,
  type SurveyTemplate,
  type SurveyQuestion,
} from '../api/surveyTemplates';
import { fetchSchools } from '@/api/school';

interface SurveyBuilderProps {
  onClose: () => void;
  surveyId?: number;
  schoolId?: string;
}

export default function SurveyBuilder({ onClose, surveyId, schoolId: initialSchoolId }: SurveyBuilderProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId || '');
  const [audienceRole, setAudienceRole] = useState('all');
  const [status, setStatus] = useState<'draft' | 'active' | 'closed'>('draft');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadSchools();
    if (surveyId) {
      loadSurvey();
    }
  }, [surveyId]);

  const loadSchools = async () => {
    try {
      const data = await fetchSchools();
      setSchools(data);
    } catch (err: any) {
      console.error('Error loading schools:', err);
    }
  };

  const loadSurvey = async () => {
    if (!surveyId) return;
    setLoading(true);
    try {
      const survey = await fetchSurveyTemplates({});
      const found = survey.find((s: SurveyTemplate) => s.id === surveyId);
      if (found) {
        const fullSurvey = await fetchSurveyTemplates({});
        const full = fullSurvey.find((s: SurveyTemplate) => s.id === surveyId);
        if (full) {
          setTitle(full.title);
          setDescription(full.description || '');
          setSelectedSchoolId(full.school_id || '');
          setAudienceRole(full.audience_role);
          setStatus(full.status);
          setStartDate(full.start_date || '');
          setEndDate(full.end_date || '');
          setQuestions(full.questions || []);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question_text: '',
        question_type: 'text',
        is_required: false,
        order_index: questions.length,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: keyof SurveyQuestion, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addOption = (questionIndex: number) => {
    const updated = [...questions];
    const options = updated[questionIndex].options || [];
    updated[questionIndex].options = [...options, ''];
    setQuestions(updated);
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    const updated = [...questions];
    if (!updated[questionIndex].options) updated[questionIndex].options = [];
    updated[questionIndex].options![optionIndex] = value;
    setQuestions(updated);
  };

  const removeOption = (questionIndex: number, optionIndex: number) => {
    const updated = [...questions];
    if (updated[questionIndex].options) {
      updated[questionIndex].options = updated[questionIndex].options!.filter((_, i) => i !== optionIndex);
    }
    setQuestions(updated);
  };

  const handleSave = async () => {
    setError('');
    if (!title.trim()) {
      setError('Survey title is required');
      return;
    }
    if (questions.length === 0) {
      setError('At least one question is required');
      return;
    }
    for (let i = 0; i < questions.length; i++) {
      if (!questions[i].question_text.trim()) {
        setError(`Question ${i + 1} text is required`);
        return;
      }
      if ((questions[i].question_type === 'multiple_choice' || questions[i].question_type === 'single_choice') && 
          (!questions[i].options || questions[i].options.length < 2)) {
        setError(`Question ${i + 1} needs at least 2 options`);
        return;
      }
    }

    setSaving(true);
    try {
      const data = {
        title: title.trim(),
        description: description.trim() || undefined,
        school_id: selectedSchoolId || undefined,
        audience_role: audienceRole,
        status,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        questions: questions.map((q, i) => ({
          ...q,
          order_index: i,
        })),
      };

      if (surveyId) {
        await updateSurveyTemplate(surveyId, data);
      } else {
        await createSurveyTemplate(data);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save survey');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6">Loading...</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">{surveyId ? 'Edit Survey' : 'Create New Survey'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Survey Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter survey title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Enter survey description"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">School (Optional)</label>
              <select
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school.id} value={school.id}>
                    {school.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
              <select
                value={audienceRole}
                onChange={(e) => setAudienceRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Users</option>
                <option value="student">Students</option>
                <option value="parent">Parents</option>
                <option value="teacher">Teachers</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'closed')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">Questions *</label>
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            <div className="space-y-4">
              {questions.map((question, qIndex) => (
                <div key={qIndex} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-sm font-medium text-gray-600">Question {qIndex + 1}</span>
                    <button
                      onClick={() => removeQuestion(qIndex)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <input
                        type="text"
                        value={question.question_text}
                        onChange={(e) => updateQuestion(qIndex, 'question_text', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter question text"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Question Type</label>
                        <select
                          value={question.question_type}
                          onChange={(e) => updateQuestion(qIndex, 'question_type', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                        >
                          <option value="text">Text</option>
                          <option value="single_choice">Single Choice</option>
                          <option value="multiple_choice">Multiple Choice</option>
                          <option value="rating">Rating (1-5)</option>
                          <option value="yes_no">Yes/No</option>
                        </select>
                      </div>

                      <div className="flex items-center pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={question.is_required || false}
                            onChange={(e) => updateQuestion(qIndex, 'is_required', e.target.checked)}
                            className="rounded"
                          />
                          <span className="text-sm text-gray-600">Required</span>
                        </label>
                      </div>
                    </div>

                    {(question.question_type === 'multiple_choice' || question.question_type === 'single_choice') && (
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Options</label>
                        <div className="space-y-2">
                          {(question.options || []).map((option, oIndex) => (
                            <div key={oIndex} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                                className="flex-1 px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                                placeholder={`Option ${oIndex + 1}`}
                              />
                              <button
                                onClick={() => removeOption(qIndex, oIndex)}
                                className="text-red-500 hover:text-red-700"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => addOption(qIndex)}
                            className="text-sm text-blue-500 hover:text-blue-700 flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" />
                            Add Option
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Survey'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
