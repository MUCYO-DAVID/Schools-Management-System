"use client"

import { useState, useEffect } from "react"
import { 
  Search, MapPin, Users, GraduationCap, Star, FileText, 
  MessageSquare, AlertCircle, Shield, Calendar, Award, 
  ChevronRight, Sparkles, Filter, Globe, School as SchoolIcon,
  ArrowRight, Inbox, Clock, CheckCircle, BookText, CheckCircle2,
  Trash2, Eye, Download
} from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import { useAuth } from "../providers/AuthProvider"
import type { School } from "../types"
import { fetchSchools, rateSchool } from "@/api/school"
import { getImageUrl } from "@/lib/image-utils"
import ApplicationForm from "../components/ApplicationForm"
import { toast } from "sonner"
import StudentDashboard from "../components/StudentDashboard"
import SchoolDetailsModal from "../components/SchoolDetailsModal"
import SurveyCommentsFeed from "../components/SurveyCommentsFeed"
import { useRouter, useSearchParams } from "next/navigation"
import { fetchGrades, fetchReportCards } from "../api/grades"
import { fetchEvents, rsvpToEvent } from "../api/events"
import EventCalendar from "../components/EventCalendar"
import { fetchScholarships, fetchMyApplications, applyForScholarship } from "../api/scholarships"
import { formatDistanceToNow } from "date-fns"

export default function StudentAccess() {
  const { t, language } = useLanguage()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'comments' | 'grades' | 'events' | 'scholarships'>('browse')
  const [schools, setSchools] = useState<School[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [showApplicationForm, setShowApplicationForm] = useState(false)
  const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)
  const [applicationSuccess, setApplicationSuccess] = useState(false)
  const [myGrades, setMyGrades] = useState<any[]>([])
  const [myReportCards, setMyReportCards] = useState<any[]>([])
  const [events, setEvents] = useState<any[]>([])
  const [scholarships, setScholarships] = useState<any[]>([])
  const [myScholarshipApps, setMyScholarshipApps] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const filteredSchools = schools.filter(
    (school) =>
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  useEffect(() => {
    if (authLoading) return;
    if (isAuthenticated && user) {
      if (user.role === 'leader') { router.push('/schools'); return; }
      if (user.role === 'admin') { router.push('/admin'); return; }
    }
  }, [isAuthenticated, user, router, authLoading])

  useEffect(() => {
    if (authLoading) return;
    const loadSchools = async () => {
      setLoading(true);
      try {
        const data = await fetchSchools()
        setSchools(data || [])
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false);
      }
    }
    loadSchools()
  }, [authLoading])

  useEffect(() => {
    const tabParam = searchParams?.get('tab')
    if (tabParam) setActiveTab(tabParam as any)
    const searchParam = searchParams?.get('search')
    if (searchParam) setSearchTerm(searchParam)
  }, [searchParams])

  useEffect(() => {
    if (applicationSuccess) {
      setActiveTab('applications')
      setApplicationSuccess(false)
    }
  }, [applicationSuccess])

  const handleApplyClick = (school: School) => {
    if (!isAuthenticated) { router.push('/auth/signin'); return; }
    // Only students can apply to schools
    if (user?.role !== 'student') {
      toast.error('Only students can apply to schools.');
      return;
    }
    setSelectedSchool(school)
    setShowApplicationForm(true)
  }

  const tabs = [
    { id: 'browse' as const, label: 'Find Schools', icon: Search },
    { id: 'applications' as const, label: 'Applications', icon: FileText },
    { id: 'grades' as const, label: 'Grades', icon: GraduationCap },
    { id: 'events' as const, label: 'Events Hub', icon: Calendar },
    { id: 'scholarships' as const, label: 'Scholarships', icon: Award },
    { id: 'comments' as const, label: 'Reviews', icon: MessageSquare },
  ]

  useEffect(() => {
    if (activeTab === 'grades' && user?.id) {
      setLoading(true)
      Promise.all([fetchGrades({ student_id: user.id }), fetchReportCards(user.id)])
        .then(([g, r]) => { setMyGrades(g); setMyReportCards(r); })
        .finally(() => setLoading(false))
    }
    if (activeTab === 'events') {
      setLoading(true)
      fetchEvents().then(setEvents).finally(() => setLoading(false))
    }
    if (activeTab === 'scholarships') {
      setLoading(true)
      Promise.all([fetchScholarships({ status: 'active' }), fetchMyApplications()])
        .then(([s, a]) => { setScholarships(s); setMyScholarshipApps(a); })
        .finally(() => setLoading(false))
    }
  }, [activeTab, user?.id])

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-4">
        {/* Header Section - More Compact */}
        <div className="relative mb-6 py-6 rounded-[2rem] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-900/30 via-indigo-900/30 to-transparent blur-2xl opacity-50 pointer-events-none" />
          <div className="relative z-10 text-center space-y-2">
            <div className="inline-flex items-center gap-2 bg-purple-600/10 border border-purple-500/20 px-3 py-1 rounded-full mb-1">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-purple-300">Hub</span>
            </div>
            <h1 className="text-2xl lg:text-4xl font-black tracking-tight text-white italic">
              Academic <span className="text-purple-500">Workspace</span>
            </h1>
          </div>
        </div>

        {/* Cinematic Tabs - Smaller & Tighter */}
        <div className="flex flex-wrap justify-center gap-1.5 mb-8 sticky top-[80px] z-30 p-1.5 bg-black/60 backdrop-blur-xl border border-white/5 rounded-full shadow-2xl overflow-x-auto no-scrollbar max-w-fit mx-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all duration-300 relative shrink-0 ${
                  active 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' 
                    : 'text-slate-500 hover:text-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${active ? 'animate-pulse' : ''}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="min-h-[600px]">
          {activeTab === 'browse' && (
            <div className="space-y-6">
              {/* Premium Search */}
              <div className="max-w-3xl mx-auto relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition" />
                <div className="relative flex items-center bg-[#141418] border border-white/10 rounded-[2rem] shadow-2xl p-0.5">
                  <Search className="ml-5 text-slate-500 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search schools..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-600 py-3 px-4 text-xs font-medium"
                  />
                </div>
              </div>

              {/* School Grid */}
              {loading && schools.length === 0 ? (
                <div className="flex justify-center py-40">
                  <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin shadow-[0_0_10px_rgba(147,51,234,0.3)]" />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pb-10">
                  {filteredSchools.map((school) => (
                    <div
                      key={school.id}
                      className="group bg-[#141418] rounded-3xl border border-white/5 overflow-hidden flex flex-col hover:border-purple-500/40 transition-all duration-500 shadow-xl"
                    >
                      <div className="relative h-32 w-full overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent z-10" />
                        <img
                          src={getImageUrl(school.image_urls?.[0])}
                          alt={school.name}
                          className="absolute h-full w-full object-cover group-hover:scale-110 transition-transform duration-1000"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop';
                          }}
                        />
                        <div className="absolute top-3 left-3 z-20">
                           <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest backdrop-blur-md border border-white/10 ${school.type === "Public" ? "bg-emerald-500/20 text-emerald-300" : "bg-purple-500/20 text-purple-300"}`}>
                            {school.type}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-sm font-black text-slate-100 mb-1 truncate group-hover:text-purple-400 transition-colors">
                          {language === "rw" ? school.nameRw : school.name}
                        </h3>

                        <div className="flex items-center gap-1 mb-3">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-2 h-2 ${star <= Math.round(school.average_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-white/5"}`}
                            />
                          ))}
                          <span className="text-[8px] font-bold text-slate-500 ml-1 italic">{school.rating_count || 0} reviews</span>
                        </div>

                        <div className="space-y-1.5 mb-6">
                          <div className="flex items-center gap-2 text-slate-400 opacity-80">
                            <MapPin className="w-3 h-3 text-purple-500/70" />
                            <span className="text-[10px] font-bold truncate">{school.location}</span>
                          </div>
                          <div className="flex items-center gap-2 text-slate-400 opacity-80">
                            <GraduationCap className="w-3 h-3 text-indigo-500/70" />
                            <span className="text-[10px] font-bold truncate">{school.level}</span>
                          </div>
                        </div>

                        <div className="mt-auto flex items-center gap-2">
                          <button
                            onClick={() => setSelectedSchool(school)}
                            className="flex-1 px-3 py-2 rounded-xl border border-white/5 text-[9px] font-black uppercase tracking-widest hover:bg-white/5 transition-all text-slate-400"
                          >
                            Info
                          </button>
                          <button
                            onClick={() => handleApplyClick(school)}
                            className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest shadow-lg shadow-purple-600/10 transition-all active:scale-95"
                          >
                            Apply
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'applications' && (
            <div className="bg-[#141418] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tighter uppercase">My Status</h2>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Enrollment Lifecycle</p>
              </div>
              {isAuthenticated ? (
                <StudentDashboard />
              ) : (
                <div className="text-center py-24 space-y-6">
                  <div className="w-16 h-16 bg-purple-600/10 rounded-2xl flex items-center justify-center mx-auto border border-purple-500/20">
                    <FileText className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-black text-slate-100">Portal Locked</h3>
                  <button
                    onClick={() => router.push('/auth/signin')}
                    className="bg-purple-600 text-white px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[9px] hover:bg-purple-700 transition-all"
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'grades' && (
            <div className="bg-[#141418] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-100 italic tracking-tighter uppercase">Academic Status</h2>
                  <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Official Records</p>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl">
                    <Shield className="w-3 h-3 text-emerald-500" />
                    <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Verified</span>
                  </div>
                )}
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : myGrades.length === 0 ? (
                <div className="py-20 text-center bg-black/20 rounded-2xl border border-dashed border-white/5">
                  <BookText className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-xs text-slate-500">No grades recorded yet</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Report Cards Summary */}
                  {myReportCards.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {myReportCards.slice(0, 3).map((report) => (
                        <div key={report.id} className="bg-white/5 border border-white/5 rounded-2xl p-4">
                          <div className="flex justify-between items-start mb-4">
                            <h4 className="text-[11px] font-bold text-slate-200 truncate">{report.school_name}</h4>
                            <span className="text-lg font-black text-purple-400">{report.overall_grade}</span>
                          </div>
                          <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                             <div className="h-full bg-purple-600" style={{ width: `${report.overall_percentage}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Detailed Table */}
                  <div className="overflow-hidden bg-black/20 rounded-2xl border border-white/5">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-white/5">
                          <th className="px-4 py-3 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Subject</th>
                          <th className="px-4 py-3 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Status</th>
                          <th className="px-4 py-3 text-[8px] font-black uppercase text-slate-500 tracking-[0.2em]">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {myGrades.map((grade) => (
                          <tr key={grade.id} className="hover:bg-white/5 transition-all">
                            <td className="px-4 py-3 text-[11px] font-bold text-slate-200">{grade.subject}</td>
                            <td className="px-4 py-3">
                              {grade.is_document ? (
                                <a 
                                  href={grade.document_url} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 text-[10px] font-black uppercase text-blue-400 hover:text-blue-300 transition-colors"
                                >
                                  <FileText className="w-3 h-3" />
                                  View Grade Doc
                                </a>
                              ) : (
                                <span className="text-[10px] font-black uppercase text-purple-400">Graded {grade.grade}</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[10px] font-black text-slate-500">
                                {grade.is_document ? 'N/A' : `${grade.score}/${grade.max_score}`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'events' && (
            <div className="bg-[#141418] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tighter uppercase">Calendar</h2>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Schedules</p>
              </div>
              <div className="p-2 bg-white/5 rounded-2xl border border-white/5">
                <EventCalendar onEventClick={() => {}} />
              </div>
            </div>
          )}

          {activeTab === 'scholarships' && (
            <div className="bg-[#141418] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tighter uppercase">Scholarships</h2>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Opportunities</p>
              </div>
              {loading ? (
                 <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {scholarships.map((s) => {
                    const applied = myScholarshipApps.some(app => app.scholarship_id === s.id);
                    return (
                      <div key={s.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 hover:border-amber-500/20 transition-all group">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-[11px] font-bold text-slate-100 italic truncate w-32">{s.title}</h4>
                          <Award className={`w-4 h-4 ${applied ? 'text-emerald-500' : 'text-amber-500/20'}`} />
                        </div>
                        <p className="text-[9px] text-slate-500 line-clamp-2 italic mb-4">{s.description}</p>
                        <div className="flex items-center justify-between text-[10px] mb-4">
                           <span className="text-amber-500 font-black">{s.amount?.toLocaleString()} {s.currency}</span>
                           <span className="text-slate-600">Available</span>
                        </div>
                        <button
                          onClick={() => router.push(`/scholarships/${s.id}/apply`)}
                          disabled={applied}
                          className={`w-full py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${
                            applied ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-600 text-white'
                          }`}
                        >
                          {applied ? 'Applied' : 'Apply'}
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'comments' && (
            <div className="bg-[#141418] rounded-3xl border border-white/5 p-6 shadow-2xl">
              <div className="mb-6">
                <h2 className="text-xl font-black text-slate-100 italic tracking-tighter uppercase">Community</h2>
                <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Verified Feedback</p>
              </div>
              <SurveyCommentsFeed showAll={true} />
            </div>
          )}
        </div>

        {/* Modals */}
        {selectedSchool && !showApplicationForm && (
          <SchoolDetailsModal
            school={selectedSchool}
            onClose={() => setSelectedSchool(null)}
            onApply={() => {
              if (isAuthenticated) { 
                if (user?.role !== 'student') {
                  toast.error('Only students can apply to schools.');
                  return;
                }
                setShowApplicationForm(true) 
              } else { 
                router.push('/auth/signin') 
              }
            }}
          />
        )}
        {showApplicationForm && selectedSchool && (
          <ApplicationForm
            school={selectedSchool}
            onClose={() => { setShowApplicationForm(false); setSelectedSchool(null); }}
            onSuccess={() => { setApplicationSuccess(true); setShowApplicationForm(false); }}
          />
        )}
      </main>

      <footer className="mt-20 py-8 border-t border-white/5 text-center">
         <p className="text-[8px] uppercase font-black tracking-[0.4em] text-slate-800">© 2026 RSBS ECOSYSTEM</p>
      </footer>
    </div>
  )
}
