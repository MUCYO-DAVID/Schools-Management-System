'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, Star } from 'lucide-react';
import { fetchSurveyTemplate, submitSurveyResponse, type SurveyTemplate, type SurveyResponse as SurveyResponseType } from '../api/surveyTemplates';

interface SurveyResponseProps {
  surveyId: number;
  onComplete?: () => void;
  onCancel?: () => void;
}

export default function SurveyResponse({ surveyId, onComplete, onCancel }: SurveyResponseProps) {
  const [survey, setSurvey] = useState<SurveyTemplate | null>(null);
  const [answers, setAnswers] = useState<{ [questionId: number]: any }>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    loadSurvey();
  }, [surveyId]);

  const loadSurvey = async () => {
    try {
      const data = await fetchSurveyTemplate(surveyId);
      setSurvey(data);
      
      // Initialize answers
      const initialAnswers: { [key: number]: any } = {};
      if (data.questions) {
        data.questions.forEach((q) => {
          if (q.question_type === 'multiple_choice') {
            initialAnswers[q.id!] = [];
          } else if (q.question_type === 'rating') {
            initialAnswers[q.id!] = null;
          } else {
            initialAnswers[q.id!] = '';
          }
        });
      }
      setAnswers(initialAnswers);
    } catch (err: any) {
      setError(err.message || 'Failed to load survey');
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (questionId: number, value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const toggleMultipleChoice = (questionId: number, option: string) => {
    setAnswers((prev) => {
      const current = prev[questionId] || [];
      const isSelected = current.includes(option);
      return {
        ...prev,
        [questionId]: isSelected
          ? current.filter((v: string) => v !== option)
          : [...current, option],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required questions
    if (survey?.questions) {
      for (const question of survey.questions) {
        if (question.is_required) {
          const answer = answers[question.id!];
          if (!answer || (Array.isArray(answer) && answer.length === 0) || answer === '') {
            setError(`Please answer the required question: "${question.question_text}"`);
            return;
          }
        }
      }
    }

    setSubmitting(true);
    try {
      const responseData: SurveyResponseType[] = Object.entries(answers).map(([questionId, value]) => ({
        question_id: parseInt(questionId),
        answer_text: typeof value === 'string' ? value : undefined,
        answer_value: Array.isArray(value) || typeof value === 'number' ? value : undefined,
      }));

      await submitSurveyResponse(surveyId, responseData);
      setSuccess(true);
      setTimeout(() => {
        if (onComplete) onComplete();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit survey');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading survey...</div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Survey not found
      </div>
    );
  }

  if (survey.has_responded) {
    return (
      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        You have already submitted a response to this survey.
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded flex items-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Survey submitted successfully! Thank you for your response.
      </div>
    );
  }

  const now = new Date();
  const startDate = survey.start_date ? new Date(survey.start_date) : null;
  const endDate = survey.end_date ? new Date(survey.end_date) : null;

  if (survey.status !== 'active') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        This survey is not currently active.
      </div>
    );
  }

  if (startDate && now < startDate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        This survey has not started yet. It will be available from {startDate.toLocaleDateString()}.
      </div>
    );
  }

  if (endDate && now > endDate) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
        This survey has ended. It was available until {endDate.toLocaleDateString()}.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{survey.title}</h2>
        {survey.description && (
          <p className="text-gray-600">{survey.description}</p>
        )}
        {survey.school_name && (
          <p className="text-sm text-gray-500 mt-1">School: {survey.school_name}</p>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {survey.questions?.map((question, index) => (
          <div key={question.id} className="border border-gray-200 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {index + 1}. {question.question_text}
              {question.is_required && <span className="text-red-500 ml-1">*</span>}
            </label>

            {question.question_type === 'text' && (
              <textarea
                value={answers[question.id!] || ''}
                onChange={(e) => updateAnswer(question.id!, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                required={question.is_required}
              />
            )}

            {question.question_type === 'yes_no' && (
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="yes"
                    checked={answers[question.id!] === 'yes'}
                    onChange={(e) => updateAnswer(question.id!, e.target.value)}
                    required={question.is_required}
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    value="no"
                    checked={answers[question.id!] === 'no'}
                    onChange={(e) => updateAnswer(question.id!, e.target.value)}
                    required={question.is_required}
                  />
                  <span>No</span>
                </label>
              </div>
            )}

            {question.question_type === 'rating' && (
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => updateAnswer(question.id!, rating)}
                    className={`p-2 rounded ${
                      answers[question.id!] === rating
                        ? 'bg-yellow-400 text-yellow-900'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <Star className={`w-6 h-6 ${answers[question.id!] === rating ? 'fill-current' : ''}`} />
                  </button>
                ))}
              </div>
            )}

            {question.question_type === 'single_choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name={`question-${question.id}`}
                      value={option}
                      checked={answers[question.id!] === option}
                      onChange={(e) => updateAnswer(question.id!, e.target.value)}
                      required={question.is_required}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}

            {question.question_type === 'multiple_choice' && question.options && (
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <label key={optIndex} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={(answers[question.id!] || []).includes(option)}
                      onChange={() => toggleMultipleChoice(question.id!, option)}
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-end gap-3 pt-4 border-t">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting...' : 'Submit Survey'}
          </button>
        </div>
      </form>
    </div>
  );
}
