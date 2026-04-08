'use client';

import Navigation from '../components/Navigation';
import SurveyCommentsFeed from '../components/SurveyCommentsFeed';
import { Users, MessageCircle, TrendingUp } from 'lucide-react';

export default function CommunityPage() {
    return (
        <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="w-full">
                <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page header */}
                    <div className="mb-8 rounded-[2rem] border border-white/10 bg-[linear-gradient(135deg,#0f172a_0%,#0c4a6e_40%,#059669_100%)] px-6 py-8 text-white shadow-[0_30px_90px_-60px_rgba(15,23,42,0.9)]">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="rounded-2xl bg-white/15 p-3 backdrop-blur-md">
                                <Users className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Rwanda Schools</p>
                                <h1 className="text-2xl font-semibold">Community Feedback</h1>
                            </div>
                        </div>
                        <p className="text-sm leading-6 text-white/80">
                            All school recommendations, reviews, and feedback from students, parents, and the wider community.
                            The most liked comments rise to the top.
                        </p>
                        <div className="mt-5 grid grid-cols-3 gap-3">
                            <div className="rounded-[1.25rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <p className="text-xs text-white/60">Sort order</p>
                                <p className="text-sm font-semibold">Most Liked First</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <div className="flex items-center gap-1.5">
                                    <MessageCircle className="h-4 w-4 text-blue-200" />
                                    <p className="text-sm font-semibold">Open to all</p>
                                </div>
                                <p className="text-xs text-white/60">Members can reply</p>
                            </div>
                            <div className="rounded-[1.25rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md">
                                <div className="flex items-center gap-1.5">
                                    <TrendingUp className="h-4 w-4 text-emerald-200" />
                                    <p className="text-sm font-semibold">Real-time</p>
                                </div>
                                <p className="text-xs text-white/60">Always up-to-date</p>
                            </div>
                        </div>
                    </div>

                    {/* Full feed */}
                    <SurveyCommentsFeed showAll />
                </div>
            </main>
        </div>
    );
}
