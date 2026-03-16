'use client';

import { useState, useEffect } from 'react';
import { BarChart3, Users, TrendingUp, AlertCircle } from 'lucide-react';
import { fetchSurveyAnalytics, type SurveyTemplate } from '../api/surveyTemplates';

interface SurveyAnalyticsProps {
  surveyId: number;
}

interface AnalyticsData {
  survey: SurveyTemplate;
  total_responses: number;
  analytics: Array<{
    question: any;
    answers: Array<{
      answer_text: string | null;
      answer_value: string | null;
      count: number;
    }>;
    total_responses: number;
  }>;
}

export default function SurveyAnalytics({ surveyId }: SurveyAnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, [surveyId]);

  const loadAnalytics = async () => {
    try {
      const analytics = await fetchSurveyAnalytics(surveyId);
      setData(analytics);
    } catch (err: any) {
      setError(err.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        {error}
      </div>
    );
  }

  if (!data) {
    return <div>No data available</div>;
  }

  const getMaxCount = (answers: any[]) => {
    return Math.max(...answers.map((a) => parseInt(a.count)), 1);
  };

  const parseAnswerValue = (value: string | null) => {
    if (!value) return null;
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{data.survey.title}</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <Users className="w-5 h-5" />
              <span className="font-medium">{data.total_responses} Responses</span>
            </div>
          </div>
        </div>

        {data.survey.description && (
          <p className="text-gray-600 mb-4">{data.survey.description}</p>
        )}

        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-1">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">Total Questions</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">{data.analytics.length}</div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-600 mb-1">
              <Users className="w-5 h-5" />
              <span className="text-sm font-medium">Total Responses</span>
            </div>
            <div className="text-2xl font-bold text-green-900">{data.total_responses}</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center gap-2 text-purple-600 mb-1">
              <TrendingUp className="w-5 h-5" />
              <span className="text-sm font-medium">Response Rate</span>
            </div>
            <div className="text-2xl font-bold text-purple-900">
              {data.total_responses > 0 ? '100%' : '0%'}
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {data.analytics.map((item, index) => {
          const maxCount = getMaxCount(item.answers);
          const question = item.question;

          return (
            <div key={question.id} className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {index + 1}. {question.question_text}
                {question.is_required && <span className="text-red-500 ml-1">*</span>}
              </h3>

              {item.answers.length === 0 ? (
                <div className="text-gray-500 text-sm">No responses yet</div>
              ) : (
                <div className="space-y-3">
                  {item.answers.map((answer, aIndex) => {
                    const count = parseInt(answer.count);
                    const percentage = item.total_responses > 0 
                      ? ((count / item.total_responses) * 100).toFixed(1) 
                      : 0;
                    const barWidth = maxCount > 0 ? (count / maxCount) * 100 : 0;

                    let displayText = '';
                    if (answer.answer_text) {
                      displayText = answer.answer_text;
                    } else if (answer.answer_value) {
                      const parsed = parseAnswerValue(answer.answer_value);
                      if (Array.isArray(parsed)) {
                        displayText = parsed.join(', ');
                      } else if (typeof parsed === 'number') {
                        if (question.question_type === 'rating') {
                          displayText = `${parsed} star${parsed !== 1 ? 's' : ''}`;
                        } else {
                          displayText = String(parsed);
                        }
                      } else {
                        displayText = String(parsed);
                      }
                    }

                    return (
                      <div key={aIndex} className="space-y-1">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-gray-700 font-medium">{displayText || 'N/A'}</span>
                          <span className="text-gray-600">
                            {count} ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                          <div
                            className="bg-blue-500 h-4 rounded-full transition-all"
                            style={{ width: `${barWidth}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {question.question_type === 'text' && item.answers.length > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Sample Responses:</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {item.answers.slice(0, 5).map((answer, aIndex) => (
                      <div key={aIndex} className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                        "{answer.answer_text || 'N/A'}"
                      </div>
                    ))}
                    {item.answers.length > 5 && (
                      <div className="text-xs text-gray-500">
                        ... and {item.answers.length - 5} more responses
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
