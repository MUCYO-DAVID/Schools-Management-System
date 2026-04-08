'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Heart,
  MessageCircle,
  Star,
  School,
  Reply,
  Send,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Sparkles,
} from 'lucide-react';
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
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
}

interface SurveyReply {
  id: number;
  survey_id: number;
  reply_text: string;
  created_at: string;
  user_id: number;
  first_name: string;
  last_name: string;
  email: string;
  avatar_url?: string;
}

interface SchoolOption {
  id: string;
  name: string;
}

const BACKEND =
  process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';

function Avatar({
  firstName,
  lastName,
  avatarUrl,
  size = 8,
  gradient = 'from-blue-500 to-indigo-600',
}: {
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  size?: number;
  gradient?: string;
}) {
  const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'U';
  const sizeClass = `h-${size} w-${size}`;
  if (avatarUrl) {
    return (
      <img
        src={avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND}${avatarUrl}`}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClass} rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 flex-shrink-0`}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}
    >
      {initials}
    </div>
  );
}

interface Props {
  showAll?: boolean;
}

export default function SurveyCommentsFeed({ showAll = false }: Props) {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [schools, setSchools] = useState<SchoolOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [likingId, setLikingId] = useState<number | null>(null);
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [replyTexts, setReplyTexts] = useState<{ [key: number]: string }>({});
  const [showReplies, setShowReplies] = useState<{ [key: number]: boolean }>({});
  const [replies, setReplies] = useState<{ [key: number]: SurveyReply[] }>({});
  const [loadingReplies, setLoadingReplies] = useState<{ [key: number]: boolean }>({});

  // Post form
  const [showForm, setShowForm] = useState(false);
  const [comment, setComment] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [posting, setPosting] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    fetchSurveys();
    fetchSchools();
  }, []);

  const fetchSurveys = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch(`${BACKEND}/api/surveys`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
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

  const fetchSchools = async () => {
    try {
      const res = await fetch(`${BACKEND}/api/schools`);
      if (!res.ok) return;
      const data = await res.json();
      const list = Array.isArray(data) ? data : data.schools || [];
      setSchools(list.map((s: any) => ({ id: s.id, name: s.name })));
    } catch (e) {
      console.error(e);
    }
  };

  const fetchReplies = async (surveyId: number) => {
    if (replies[surveyId]) return;
    try {
      setLoadingReplies((prev) => ({ ...prev, [surveyId]: true }));
      const response = await fetch(`${BACKEND}/api/surveys/${surveyId}/replies`);
      if (!response.ok) throw new Error('Failed to fetch replies');
      const data = await response.json();
      setReplies((prev) => ({ ...prev, [surveyId]: data }));
    } catch (error) {
      console.error('Error fetching replies:', error);
    } finally {
      setLoadingReplies((prev) => ({ ...prev, [surveyId]: false }));
    }
  };

  const toggleReplies = (surveyId: number) => {
    const isShowing = showReplies[surveyId];
    setShowReplies((prev) => ({ ...prev, [surveyId]: !isShowing }));
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
      const response = await fetch(`${BACKEND}/api/surveys/${surveyId}/like`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) throw new Error('Failed to like comment');
      const data = await response.json();
      setSurveys((prevSurveys) =>
        prevSurveys
          .map((survey) =>
            survey.id === surveyId
              ? { ...survey, is_liked: data.liked, likes_count: data.likes_count }
              : survey
          )
          .sort((a, b) => {
            if (b.likes_count !== a.likes_count) return b.likes_count - a.likes_count;
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
      alert('Please sign in to reply');
      return;
    }
    const replyText = replyTexts[surveyId]?.trim();
    if (!replyText) return;

    try {
      setReplyingTo(surveyId);
      const token = localStorage.getItem('token');
      const response = await fetch(`${BACKEND}/api/surveys/${surveyId}/replies`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reply_text: replyText }),
      });
      if (!response.ok) throw new Error('Failed to post reply');
      const newReply = await response.json();
      setReplies((prev) => ({
        ...prev,
        [surveyId]: [...(prev[surveyId] || []), newReply],
      }));
      setReplyTexts((prev) => ({ ...prev, [surveyId]: '' }));
      setSurveys((prevSurveys) =>
        prevSurveys.map((survey) =>
          survey.id === surveyId
            ? { ...survey, replies_count: (survey.replies_count || 0) + 1 }
            : survey
        )
      );
      // Show replies after posting
      setShowReplies((prev) => ({ ...prev, [surveyId]: true }));
    } catch (error) {
      console.error('Error posting reply:', error);
      alert('Failed to post reply. Please try again.');
    } finally {
      setReplyingTo(null);
    }
  };

  const handlePost = async () => {
    if (!comment.trim()) return;
    if (!isAuthenticated) {
      alert('Please sign in to share your feedback.');
      return;
    }
    setPosting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${BACKEND}/api/surveys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          school_id: selectedSchool || null,
          rating: rating || null,
          would_recommend: wouldRecommend,
          comments: comment.trim(),
        }),
      });
      if (!res.ok) throw new Error('Failed to post');
      setComment('');
      setSelectedSchool('');
      setWouldRecommend(null);
      setRating(0);
      setShowForm(false);
      await fetchSurveys();
    } catch (e) {
      console.error(e);
      alert('Failed to post. Please try again.');
    } finally {
      setPosting(false);
    }
  };

  const displayedSurveys = showAll ? surveys : surveys.slice(0, 6);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* ── Post new comment (community page only) ── */}
      {showAll && (
        <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950/85 mb-4">
          {!showForm ? (
            <button
              onClick={() => {
                if (!isAuthenticated) {
                  alert('Please sign in to share feedback.');
                  return;
                }
                setShowForm(true);
                setTimeout(() => textareaRef.current?.focus(), 100);
              }}
              className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-400 hover:border-blue-300 hover:bg-blue-50/60 hover:text-blue-600 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10 dark:hover:text-blue-300"
            >
              <Sparkles className="h-4 w-4 flex-shrink-0" />
              <span>Share your school experience or recommendation...</span>
            </button>
          ) : (
            <div className="space-y-3 rounded-2xl border border-blue-200 bg-blue-50/60 p-4 dark:border-blue-500/20 dark:bg-blue-500/5">
              <select
                value={selectedSchool}
                onChange={(e) => setSelectedSchool(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
              >
                <option value="">General feedback (no specific school)</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {selectedSchool && (
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                    >
                      <Star
                        className={`h-5 w-5 transition-colors ${star <= (hoverRating || rating)
                            ? 'text-yellow-400 fill-yellow-400'
                            : 'text-slate-300'
                          }`}
                      />
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWouldRecommend(wouldRecommend === true ? null : true)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${wouldRecommend === true
                      ? 'bg-emerald-500 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Recommend
                </button>
                <button
                  type="button"
                  onClick={() => setWouldRecommend(wouldRecommend === false ? null : false)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${wouldRecommend === false
                      ? 'bg-rose-500 text-white'
                      : 'border border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                    }`}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  Not recommend
                </button>
              </div>

              <textarea
                ref={textareaRef}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
                placeholder="Share your thoughts about the school or platform..."
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
              />

              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => { setShowForm(false); setComment(''); setWouldRecommend(null); setRating(0); }}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePost}
                  disabled={posting || !comment.trim()}
                  className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  <Send className="h-3.5 w-3.5" />
                  {posting ? 'Posting...' : 'Share'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Empty state ── */}
      {displayedSurveys.length === 0 && (
        <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 py-10 text-center dark:border-slate-800 dark:bg-slate-950/80">
          <MessageCircle className="h-9 w-9 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">No comments yet.</p>
          <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Be the first to share your thoughts!</p>
        </div>
      )}

      {/* ── Survey Cards ── */}
      {displayedSurveys.map((survey, idx) => (
        <div
          key={survey.id}
          className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-950"
        >
          <div className="p-4">
            {/* Header */}
            <div className="flex items-start gap-2.5 mb-3">
              {survey.avatar_url ? (
                <img
                  src={
                    survey.avatar_url.startsWith('http')
                      ? survey.avatar_url
                      : `${BACKEND}${survey.avatar_url}`
                  }
                  alt={`${survey.first_name || ''} ${survey.last_name || ''}`}
                  className="w-8 h-8 rounded-full object-cover border-2 border-slate-200 dark:border-slate-700 flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
                  {(
                    (survey.first_name?.[0] || '') + (survey.last_name?.[0] || '')
                  ).toUpperCase() ||
                    survey.school_name?.[0]?.toUpperCase() ||
                    'U'}
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {survey.first_name && survey.last_name
                      ? `${survey.first_name} ${survey.last_name}`
                      : 'Community Member'}
                  </span>
                  {survey.school_name && (
                    <>
                      <span className="text-slate-300 dark:text-slate-600 text-xs">·</span>
                      <span className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 font-medium">
                        <School className="h-3 w-3 flex-shrink-0" />
                        <span className="truncate max-w-[150px]">{survey.school_name}</span>
                      </span>
                    </>
                  )}
                  {idx === 0 && survey.likes_count > 0 && (
                    <span className="ml-auto flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-500/15 dark:text-amber-300">
                      <TrendingUp className="h-2.5 w-2.5" />
                      Top
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {survey.rating && (
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${star <= survey.rating!
                              ? 'text-yellow-400 fill-yellow-400'
                              : 'text-slate-200 dark:text-slate-700'
                            }`}
                        />
                      ))}
                      <span className="text-xs text-slate-500 ml-0.5">{survey.rating}/5</span>
                    </div>
                  )}
                  <span className="text-xs text-slate-400">
                    {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>

            {/* Comment */}
            <div className="pl-10 mb-3">
              <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                {survey.comments}
              </p>

              {survey.would_recommend !== null && (
                <div className="mt-2">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${survey.would_recommend
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                      }`}
                  >
                    {survey.would_recommend ? (
                      <>
                        <CheckCircle2 className="h-3 w-3" /> Recommends this school
                      </>
                    ) : (
                      <>
                        <XCircle className="h-3 w-3" /> Does not recommend
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2.5 border-t border-slate-100 dark:border-slate-800 pl-10">
              <button
                onClick={() => handleLike(survey.id)}
                disabled={likingId === survey.id}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl transition-all text-xs font-medium ${survey.is_liked
                    ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                    : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                  } ${!isAuthenticated ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Heart
                  className={`h-3.5 w-3.5 ${survey.is_liked ? 'fill-rose-500 text-rose-500' : ''
                    } ${likingId === survey.id ? 'animate-pulse' : ''}`}
                />
                <span>{survey.likes_count}</span>
              </button>

              <button
                onClick={() => toggleReplies(survey.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              >
                <Reply className="h-3.5 w-3.5" />
                <span>{survey.replies_count || 0} {survey.replies_count === 1 ? 'reply' : 'replies'}</span>
              </button>
            </div>

            {/* Reply Input */}
            {isAuthenticated && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 pl-10">
                <div className="flex gap-2">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                    {(
                      (user?.first_name?.[0] || '') + (user?.last_name?.[0] || '')
                    ).toUpperCase() || 'U'}
                  </div>
                  <div className="flex-1 flex gap-1.5">
                    <input
                      type="text"
                      value={replyTexts[survey.id] || ''}
                      onChange={(e) =>
                        setReplyTexts((prev) => ({ ...prev, [survey.id]: e.target.value }))
                      }
                      placeholder="Write a reply..."
                      className="flex-1 px-3 py-1.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs bg-slate-50 dark:bg-slate-900 dark:border-slate-700 dark:text-white dark:placeholder-slate-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleReply(survey.id);
                        }
                      }}
                    />
                    <button
                      onClick={() => handleReply(survey.id)}
                      disabled={replyingTo === survey.id || !replyTexts[survey.id]?.trim()}
                      className="px-2.5 py-1.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      <Send className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Replies Section */}
            {showReplies[survey.id] && (
              <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 pl-10">
                {loadingReplies[survey.id] ? (
                  <div className="flex justify-center py-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {replies[survey.id] && replies[survey.id].length > 0 ? (
                      replies[survey.id].map((reply) => (
                        <div key={reply.id} className="flex gap-2 pl-2 border-l-2 border-slate-200 dark:border-slate-700">
                          {reply.avatar_url ? (
                            <img
                              src={
                                reply.avatar_url.startsWith('http')
                                  ? reply.avatar_url
                                  : `${BACKEND}${reply.avatar_url}`
                              }
                              alt={`${reply.first_name} ${reply.last_name}`}
                              className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 flex-shrink-0"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold text-[10px] flex-shrink-0">
                              {reply.first_name?.[0]?.toUpperCase() || 'U'}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                {reply.first_name} {reply.last_name}
                              </span>
                              <span className="text-[11px] text-slate-400">
                                {formatDistanceToNow(new Date(reply.created_at), {
                                  addSuffix: true,
                                })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                              {reply.reply_text}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 text-center py-1">No replies yet</p>
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
