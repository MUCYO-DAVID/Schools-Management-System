'use client';

import { useState, useEffect } from 'react';
import { Heart, MessageCircle, Star, MapPin, School, Reply, Send } from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';

interface Survey {
  id: number;
  school_id: string | null;
  school_name: string | null;
  school_location: string | null;
  rating: number | null;
  would_recommend: boolean | null;
  comments: string;
  created_at: string;
  likes_count: number;
  replies_count: number;
  is_liked: boolean;
}

interface Reply {
  id: number;
  survey_id: number;
  reply_text: string;
  created_at: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export default function SurveyCommentsFeed() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const [replies, setReplies] = useState<{ [key: number]: Reply[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: number]: boolean }>({});
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/surveys`, {
        headers: token ? {
          'Authorization': `Bearer ${token}`
        } : {}
      });

      if (!response.ok) throw new Error('Failed to fetch surveys');
      const data = await response.json();
      setSurveys(data);
    } catch (error) {
      console.error('Error fetching surveys:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReplies = async (surveyId: number) => {
    if (replies[surveyId]) return; // Already loaded

    try {
      setLoadingReplies(prev => ({ ...prev, [surveyId]: true }));
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/surveys/${surveyId}/replies`
      );

      if (!response.ok) throw new Error('Failed to fetch replies');
      const data = await response.json();
      setReplies(prev => ({ ...prev, [surveyId]: data }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies(prev => ({ ...prev, [surveyId]: false }));
    }
  };

  const toggleReplies = (surveyId: number) => {
    const isShowing = showReplies[surveyId];
    setShowReplies(prev => ({ ...prev, [surveyId]: !isShowing }));

    if (!isShowing && !replies[surveyId]) {
      fetchReplies(surveyId);
    }
  };

  const handleLike = async (surveyId: number) => {
    if (!isAuthenticated) {
      alert('Please sign in to like comments');
      return;
    }

    try {
      setLikingId(surveyId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/surveys/${surveyId}/like`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) throw new Error('Failed to like comment');

      const data = await response.json();

      // Update the survey in the list
      setSurveys(prevSurveys =>
        prevSurveys.map(survey =>
          survey.id === surveyId
            ? { ...survey, is_liked: data.liked, likes_count: data.likes_count }
            : survey
        ).sort((a, b) => {
          // Sort by likes count (descending), then by date (descending)
          if (b.likes_count !== a.likes_count) {
            return b.likes_count - a.likes_count;
          }
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        })
      );
    } catch (error) {
      console.error('Error liking comment:', error);
      alert('Failed to like comment. Please try again.');
    } finally {
      setLikingId(null);
    }
  };

  const handleReply = async (surveyId: number) => {
    if (!isAuthenticated) {
      alert('Please sign in to reply to comments');
      return;
    }

    const replyText = replyTexts[surveyId]?.trim();
    if (!replyText) {
      alert('Please enter a reply');
      return;
    }

    try {
      setReplyingTo(surveyId);
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/surveys/${surveyId}/replies`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reply_text: replyText })
        }
      );

      if (!response.ok) throw new Error('Failed to post reply');

      const newReply = await response.json();

      // Add reply to the list
      setReplies(prev => ({
        ...prev,
        [surveyId]: [...(prev[surveyId] || []), newReply]
      }));

      // Clear reply text
      setReplyTexts(prev => ({ ...prev, [surveyId]: '' }));

      // Update replies count
      setSurveys(prevSurveys =>
        prevSurveys.map(survey =>
          survey.id === surveyId
            ? { ...survey, replies_count: (survey.replies_count || 0) + 1 }
            : survey
        )
      );
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setReplyingTo(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-6">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (surveys.length === 0) {
    return (
      <div className="text-center py-6 bg-white rounded-lg border border-gray-200">
        <MessageCircle className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-xs text-gray-600">No comments yet. Be the first to share your thoughts!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {surveys.map((survey) => (
        <div
          key={survey.id}
          className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
        >
          {/* Main Comment - Chat-like design */}
          <div className="p-3">
            {/* Header */}
            <div className="flex items-start gap-2 mb-2">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                {survey.school_name ? survey.school_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                  {survey.school_name && (
                    <>
                      <School className="w-3 h-3 text-blue-600 flex-shrink-0" />
                      <span className="font-semibold text-xs text-gray-900 line-clamp-1">{survey.school_name}</span>
                    </>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                  </span>
                </div>
                {survey.rating && (
                  <div className="flex items-center gap-0.5 mb-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-2.5 h-2.5 ${star <= survey.rating!
                          ? 'text-yellow-400 fill-yellow-400'
                          : 'text-gray-300'
                          }`}
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-0.5">{survey.rating}/5</span>
                  </div>
                )}
              </div>
            </div>

            {/* Comment Text */}
            <div className="ml-9 mb-2">
              <p className="text-xs text-gray-800 leading-relaxed line-clamp-3">{survey.comments}</p>
              {survey.would_recommend !== null && (
                <div className="mt-1.5">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${survey.would_recommend
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                      }`}
                  >
                    {survey.would_recommend ? '✓ Recommend' : '✗ Not Recommend'}
                  </span>
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
              <button
                onClick={() => handleLike(survey.id)}
                disabled={likingId === survey.id}
                className={`flex items-center gap-1 px-2 py-1 rounded transition-all text-xs ${survey.is_liked
                  ? 'bg-red-50 text-red-600 hover:bg-red-100'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart
                  className={`w-3 h-3 ${survey.is_liked ? 'fill-red-600 text-red-600' : ''} ${likingId === survey.id ? 'animate-pulse' : ''
                    }`}
                />
                <span className="font-medium text-xs">{survey.likes_count}</span>
              </button>

              <button
                onClick={() => toggleReplies(survey.id)}
                className="flex items-center gap-1 px-2 py-1 rounded transition-all text-xs bg-gray-50 text-gray-600 hover:bg-gray-100"
              >
                <Reply className="w-3 h-3" />
                <span className="font-medium text-xs">{survey.replies_count || 0}</span>
              </button>
            </div>

            {/* Reply Input */}
            {isAuthenticated && (
              <div className="mt-2 pt-2 border-t border-gray-100">
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={replyTexts[survey.id] || ''}
                    onChange={(e) => setReplyTexts(prev => ({ ...prev, [survey.id]: e.target.value }))}
                    placeholder="Reply..."
                    className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent text-xs"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleReply(survey.id);
                      }
                    }}
                  />
                  <button
                    onClick={() => handleReply(survey.id)}
                    disabled={replyingTo === survey.id || !replyTexts[survey.id]?.trim()}
                    className="px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    <Send className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}

            {/* Replies Section */}
            {showReplies[survey.id] && (
              <div className="mt-2 pt-2 border-t border-gray-200">
                {loadingReplies[survey.id] ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {replies[survey.id] && replies[survey.id].length > 0 ? (
                      replies[survey.id].map((reply) => (
                        <div key={reply.id} className="flex gap-2 pl-3 border-l-2 border-gray-200">
                          <div className="w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                            {reply.first_name ? reply.first_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="font-semibold text-xs text-gray-900">
                                {reply.first_name} {reply.last_name}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-xs text-gray-700 leading-relaxed">{reply.reply_text}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-500 text-center py-1">No replies yet</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
