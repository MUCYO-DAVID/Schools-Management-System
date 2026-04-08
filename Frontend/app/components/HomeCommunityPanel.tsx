'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Heart,
    MessageCircle,
    Send,
    Star,
    ThumbsUp,
    TrendingUp,
    Users,
    ChevronRight,
    Sparkles,
    School,
    CheckCircle2,
    XCircle,
} from 'lucide-react';
import { useAuth } from '../providers/AuthProvider';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

interface Survey {
    id: number;
    school_id: string | null;
    school_name: string | null;
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

interface SchoolOption {
    id: string;
    name: string;
}

const BACKEND =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'https://rwandaschoolsbridgesystem.onrender.com';

function Avatar({ firstName, lastName, avatarUrl, size = 8 }: { firstName?: string; lastName?: string; avatarUrl?: string; size?: number }) {
    const initials = ((firstName?.[0] || '') + (lastName?.[0] || '')).toUpperCase() || 'U';
    const sizeClass = `h-${size} w-${size}`;

    if (avatarUrl) {
        return (
            <img
                src={avatarUrl.startsWith('http') ? avatarUrl : `${BACKEND}${avatarUrl}`}
                alt={`${firstName} ${lastName}`}
                className={`${sizeClass} rounded-full object-cover border-2 border-white/20 flex-shrink-0`}
                onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                }}
            />
        );
    }
    return (
        <div className={`${sizeClass} rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0`}>
            {initials}
        </div>
    );
}

export default function HomeCommunityPanel() {
    const { user, isAuthenticated } = useAuth();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [schools, setSchools] = useState<SchoolOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [posting, setPosting] = useState(false);
    const [likingId, setLikingId] = useState<number | null>(null);

    // Post form state
    const [comment, setComment] = useState('');
    const [selectedSchool, setSelectedSchool] = useState('');
    const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [showForm, setShowForm] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        fetchSurveys();
        fetchSchools();
    }, []);

    const fetchSurveys = async () => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
            const res = await fetch(`${BACKEND}/api/surveys`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setSurveys(data.slice(0, 6));
        } catch (e) {
            console.error(e);
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

    const handleLike = async (surveyId: number) => {
        if (!isAuthenticated) {
            alert('Please sign in to like comments');
            return;
        }
        setLikingId(surveyId);
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${BACKEND}/api/surveys/${surveyId}/like`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!res.ok) throw new Error('Failed');
            const data = await res.json();
            setSurveys((prev) =>
                prev.map((s) =>
                    s.id === surveyId ? { ...s, is_liked: data.liked, likes_count: data.likes_count } : s
                ).sort((a, b) => b.likes_count - a.likes_count)
            );
        } catch (e) {
            console.error(e);
        } finally {
            setLikingId(null);
        }
    };

    return (
        <div className="flex flex-col gap-3">
            {/* Header Card */}
            <div className="rounded-[1.75rem] border border-slate-200 bg-white/85 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.55)] backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/85">
                <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Community Feedback</h3>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            Share your school experience. Most liked shown first.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-purple-600/10 p-2.5 text-purple-600 dark:text-purple-300">
                        <Users className="h-5 w-5" />
                    </div>
                </div>

                {/* Post Form Toggle */}
                {!showForm ? (
                    <button
                        onClick={() => {
                            if (!isAuthenticated) {
                                alert('Please sign in to share your feedback.');
                                return;
                            }
                            setShowForm(true);
                            setTimeout(() => textareaRef.current?.focus(), 100);
                        }}
                        className="w-full flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-400 hover:border-purple-300 hover:bg-purple-50/60 hover:text-purple-600 transition-all dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500 dark:hover:border-purple-500/40 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
                    >
                        <Sparkles className="h-4 w-4 flex-shrink-0" />
                        <span>Share your school experience...</span>
                    </button>
                ) : (
                    <div className="space-y-3 rounded-2xl border border-purple-200 bg-purple-50/60 p-4 dark:border-purple-500/20 dark:bg-purple-500/5">
                        {/* School selector */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                Which school? (optional)
                            </label>
                            <select
                                value={selectedSchool}
                                onChange={(e) => setSelectedSchool(e.target.value)}
                                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
                            >
                                <option value="">General feedback</option>
                                {schools.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Star rating */}
                        {selectedSchool && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                    Your rating
                                </label>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Star
                                                className={`h-5 w-5 ${star <= (hoverRating || rating)
                                                        ? 'text-yellow-400 fill-yellow-400'
                                                        : 'text-slate-300'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Recommend options */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
                                Would you recommend?
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setWouldRecommend(wouldRecommend === true ? null : true)}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${wouldRecommend === true
                                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                        }`}
                                >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Yes, recommend
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWouldRecommend(wouldRecommend === false ? null : false)}
                                    className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${wouldRecommend === false
                                            ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                                            : 'border border-slate-200 bg-white text-slate-600 hover:border-rose-300 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
                                        }`}
                                >
                                    <XCircle className="h-3.5 w-3.5" />
                                    Not recommend
                                </button>
                            </div>
                        </div>

                        {/* Comment */}
                        <textarea
                            ref={textareaRef}
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={3}
                            placeholder="Share your thoughts about the school or platform..."
                            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder-slate-500"
                        />

                        {/* Actions */}
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
                                className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                <Send className="h-3.5 w-3.5" />
                                {posting ? 'Posting...' : 'Share'}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Feed */}
            <div className="space-y-2.5">
                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
                    </div>
                ) : surveys.length === 0 ? (
                    <div className="rounded-[1.5rem] border border-slate-200 bg-white/80 p-6 text-center dark:border-slate-800 dark:bg-slate-950/80">
                        <MessageCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs text-slate-500 dark:text-slate-400">No comments yet. Be the first to share!</p>
                    </div>
                ) : (
                    surveys.map((survey, idx) => (
                        <div
                            key={survey.id}
                            className="group relative overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90 p-4 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-950/85"
                        >
                            {/* Top liked badge */}
                            {idx === 0 && survey.likes_count > 0 && (
                                <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-amber-400/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-300">
                                    <TrendingUp className="h-3 w-3" />
                                    Top
                                </div>
                            )}

                            {/* Header */}
                            <div className="flex items-start gap-2.5 mb-2">
                                <Avatar
                                    firstName={survey.first_name}
                                    lastName={survey.last_name}
                                    avatarUrl={survey.avatar_url}
                                    size={8}
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="text-xs font-semibold text-slate-900 dark:text-white">
                                            {survey.first_name && survey.last_name
                                                ? `${survey.first_name} ${survey.last_name}`
                                                : 'Community Member'}
                                        </span>
                                        {survey.school_name && (
                                            <>
                                                <span className="text-slate-300 dark:text-slate-600">·</span>
                                                <span className="flex items-center gap-1 text-[11px] text-purple-600 dark:text-purple-400 font-medium">
                                                    <School className="h-3 w-3" />
                                                    <span className="max-w-[120px] truncate">{survey.school_name}</span>
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {survey.rating && (
                                            <div className="flex items-center gap-0.5">
                                                {[1, 2, 3, 4, 5].map((s) => (
                                                    <Star
                                                        key={s}
                                                        className={`h-2.5 w-2.5 ${s <= survey.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200 dark:text-slate-700'}`}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                        <span className="text-[11px] text-slate-400">
                                            {formatDistanceToNow(new Date(survey.created_at), { addSuffix: true })}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Comment */}
                            <p className="text-xs text-slate-700 leading-relaxed line-clamp-3 dark:text-slate-300 mb-2.5 pl-10">
                                {survey.comments}
                            </p>

                            {/* Recommend tag */}
                            {survey.would_recommend !== null && (
                                <div className="pl-10 mb-2.5">
                                    <span
                                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${survey.would_recommend
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
                                                : 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300'
                                            }`}
                                    >
                                        {survey.would_recommend ? (
                                            <><CheckCircle2 className="h-3 w-3" /> Recommends</>
                                        ) : (
                                            <><XCircle className="h-3 w-3" /> Not recommended</>
                                        )}
                                    </span>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 pl-10">
                                <button
                                    onClick={() => handleLike(survey.id)}
                                    disabled={likingId === survey.id}
                                    className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-medium transition-all ${survey.is_liked
                                            ? 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400'
                                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Heart
                                        className={`h-3.5 w-3.5 transition-transform ${survey.is_liked ? 'fill-rose-500 text-rose-500 scale-110' : ''} ${likingId === survey.id ? 'animate-pulse' : ''}`}
                                    />
                                    <span>{survey.likes_count}</span>
                                </button>
                                {survey.replies_count > 0 && (
                                    <span className="flex items-center gap-1 text-xs text-slate-400">
                                        <MessageCircle className="h-3.5 w-3.5" />
                                        {survey.replies_count}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}

                {/* View all link */}
                <Link
                    href="/community"
                    className="flex items-center justify-center gap-2 rounded-[1.5rem] border border-dashed border-slate-200 bg-slate-50/80 py-3.5 text-xs font-semibold text-blue-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 transition-all dark:border-slate-700 dark:bg-slate-900/60 dark:text-blue-400 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/5"
                >
                    <Users className="h-4 w-4" />
                    View all community feedback
                    <ChevronRight className="h-3.5 w-3.5" />
                </Link>
            </div>
        </div>
    );
}
