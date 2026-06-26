"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowRight,
    Award,
    BookOpen,
    MapPin,
    School as SchoolIcon,
    ShieldCheck,
    Sparkles,
    Star,
    Users,
    X,
} from "lucide-react"
import Navigation from "../components/Navigation"
import HomeCommunityPanel from "../components/HomeCommunityPanel"
import AdPlacement from "../components/AdPlacement"
import AdvertiseModal from "../components/AdvertiseModal"
import { useAuth } from "../providers/AuthProvider"
import { useLanguage } from "../providers/LanguageProvider"
import type { School } from "../types"
import { fetchNearbySchools, fetchTopSchools } from "@/api/school"
import SchoolDetailsModal from "../components/SchoolDetailsModal"
import dynamic from "next/dynamic"
import { getImageUrl } from "../../lib/image-utils"

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

const InteractiveSchoolMap = dynamic(
    () => import("../components/InteractiveSchoolMap"),
    {
        ssr: false,
        loading: () => (
            <div className="flex items-center justify-center h-96 bg-gray-100 rounded-lg">
                <p className="text-gray-600">{/* loading handled below via t() */}</p>
            </div>
        ),
    }
)

export default function Home() {
    const { t } = useLanguage()
    const { user } = useAuth()
    const router = useRouter()
    const [topSchools, setTopSchools] = useState<School[]>([])
    const [allSchools, setAllSchools] = useState<School[]>([])
    const [nearbySchools, setNearbySchools] = useState<School[]>([])
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [loadingTop, setLoadingTop] = useState(true)
    const [loadingMap, setLoadingMap] = useState(true)
    const [ratingSchoolId, setRatingSchoolId] = useState<string | null>(null)
    const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
    const [showAdvertise, setShowAdvertise] = useState(false)

    useEffect(() => {
        let mounted = true
        const loadTop = async () => {
            try {
                const data = await fetchTopSchools(5)
                if (mounted) {
                    setTopSchools(data)
                    setLoadingTop(false)
                }
            } catch (err) {
                console.error("Error loading top schools", err)
                if (mounted) setLoadingTop(false)
            }
        }
        loadTop()
        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        let mounted = true

        const setDefaultLocation = () => {
            if (mounted) {
                setUserLocation({ lat: -1.9441, lng: 30.0619 })
            }
        }

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    if (mounted) {
                        setUserLocation({
                            lat: position.coords.latitude,
                            lng: position.coords.longitude,
                        })
                    }
                },
                () => setDefaultLocation()
            )
        } else {
            setDefaultLocation()
        }

        return () => {
            mounted = false
        }
    }, [])

    useEffect(() => {
        if (!userLocation) return
        let mounted = true

        const loadNearby = async () => {
            setLoadingMap(true)
            try {
                // Try to fetch nearby schools first
                let data = await fetchNearbySchools(userLocation.lat, userLocation.lng, 500) // 500km radius

                // If no schools found nearby, fetch all schools as fallback
                if (data.length === 0) {
                    console.log("No nearby schools found, loading all schools...")
                    const { fetchSchools } = await import("@/api/school")
                    data = await fetchSchools()
                }

                if (mounted) {
                    const withCoords = data.filter((s) => s.latitude && s.longitude)
                    console.log(`Loaded ${data.length} total schools, ${withCoords.length} with coordinates`)
                    setAllSchools(withCoords)
                    setNearbySchools(withCoords.slice(0, 6))
                    setLoadingMap(false)
                }
            } catch (err) {
                console.error("Error loading nearby schools:", err)
                // Fallback: try to load all schools
                try {
                    const { fetchSchools } = await import("@/api/school")
                    const allData = await fetchSchools()
                    if (mounted) {
                        const withCoords = allData.filter((s: any) => s.latitude && s.longitude)
                        console.log(`Fallback: Loaded ${allData.length} schools, ${withCoords.length} with coordinates`)
                        setAllSchools(withCoords)
                        setNearbySchools(withCoords.slice(0, 6))
                        setLoadingMap(false)
                    }
                } catch (fallbackErr) {
                    console.error("Fallback also failed:", fallbackErr)
                    if (mounted) setLoadingMap(false)
                }
            }
        }

        loadNearby()

        return () => {
            mounted = false
        }
    }, [userLocation])

    const handleRate = (schoolId: string, value: number) => {
        setRatingSchoolId(schoolId)
        router.push(`/survey?schoolId=${schoolId}&rating=${value}`)
    }

    const features = [
        {
            icon: SchoolIcon,
            titleKey: "home.schoolManagement",
            descKey: "home.schoolManagementDesc",
        },
        {
            icon: Users,
            titleKey: "home.studentAccess",
            descKey: "home.studentAccessDesc",
        },
        {
            icon: BookOpen,
            titleKey: "home.educationalResources",
            descKey: "home.educationalResourcesDesc",
        },
        {
            icon: Award,
            titleKey: "home.qualityAssurance",
            descKey: "home.qualityAssuranceDesc",
        },
    ]

    const heroStats = [
        { value: "500+", label: "Registered Schools" },
        { value: "50,000+", label: "Students" },
        { value: "30", label: "Districts Covered" },
    ]

    const experienceHighlights = [
        {
            title: "Discover schools visually",
            description: "Browse schools with richer cards, location context, and quick actions.",
        },
        {
            title: "Move faster by role",
            description: "Students, parents, teachers, leaders, and admins keep the same flows with a cleaner path.",
        },
        {
            title: "Stay informed in one place",
            description: "Messages, feedback, maps, and profile actions now feel more connected.",
        },
    ]

    const rolePanels = [
        { title: "Students", description: "Search, compare, and apply with confidence." },
        { title: "Parents", description: "Track updates, results, and fee information." },
        { title: "Staff", description: "Manage school operations in a clearer workspace." },
    ]

    return (
        <div className="page-shell">
            <Navigation />
            <section className="w-full px-4 pb-4 pt-6 sm:px-6 lg:px-8">
                <div className="w-full mx-auto">
                    {/* Netflix Themed Hero Overlay */}
                    <div className="relative overflow-hidden rounded-[4px] bg-black shadow-2xl mx-auto min-h-[400px] sm:min-h-[350px] w-full flex items-center justify-center">
                        <video
                            autoPlay
                            loop
                            muted
                            playsInline
                            className="absolute top-0 left-0 w-full h-full object-cover opacity-60 pointer-events-none z-0"
                        >
                            {/* Educational/Library placeholder video */}
                            <source src="https://videos.pexels.com/video-files/3129957/3129957-uhd_2560_1440_25fps.mp4" type="video/mp4" />
                            {t("home.browserNoVideoSupport")}
                        </video>
                        <div className="absolute inset-0 bg-black/50 z-10" />

                        <div className="relative z-20 w-full px-6 py-12 text-center text-white flex flex-col items-center justify-center max-w-[1200px]">
                            <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl mb-4">
                                {t("home.heroTitle")}
                            </h1>
                            <h2 className="text-lg sm:text-xl font-medium mb-8">
                                {t("home.heroSubtitle")}
                            </h2>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full max-w-[500px]">
                                {(user?.role === "leader" || user?.role === "admin") && (
                                    <Link
                                        href="/schools"
                                        className="w-full sm:w-auto bg-[#e50914] hover:bg-[#c11119] text-white font-bold px-8 py-3.5 rounded-[4px] transition-colors flex items-center justify-center"
                                    >
                                        {t("schools")}
                                        <ArrowRight className="h-5 w-5 ml-2 font-bold" />
                                    </Link>
                                )}
                                {user?.role === "student" && (
                                    <Link
                                        href="/student"
                                        className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-purple-600/20"
                                    >
                                        {t("home.studentPortal")}
                                        <ArrowRight className="h-5 w-5 ml-2 font-bold" />
                                    </Link>
                                )}
                                {!user && (
                                    <>
                                        <Link
                                            href="/schools"
                                            className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3.5 rounded-2xl transition-all flex items-center justify-center backdrop-blur-md"
                                        >
                                            {t("schools")}
                                        </Link>
                                        <Link
                                          href="/auth/signin"
                                          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white font-bold px-8 py-3.5 rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-purple-600/20"
                                        >
                                          {t("nav.signIn")}
                                          <ArrowRight className="h-5 w-5 ml-2 font-bold" />
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="flex flex-col gap-6 w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:flex-row">
                <aside className="w-full lg:w-80 lg:flex-shrink-0 order-2 lg:order-1">
                    <div className="lg:sticky lg:top-20 space-y-4 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                        <AdPlacement placement="home" className="mx-auto lg:mx-0" />
                        <button
                            type="button"
                            onClick={() => setShowAdvertise(true)}
                            className="w-full max-w-[280px] mx-auto lg:mx-0 block text-center text-[10px] font-semibold text-amber-700 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                            {t("common.advertiseOnRsbs")}
                        </button>
                        <HomeCommunityPanel />
                    </div>
                </aside>

                <main className="flex-1 min-w-0 order-1 lg:order-2">
                    {!loadingMap && allSchools.length > 0 && (
                        <section className="mb-6 overflow-hidden rounded-[2rem] border border-slate-200 bg-white/85 px-4 py-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:px-6">
                            <div>
                                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                    <div>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700 dark:text-blue-300">
                                            <MapPin className="h-3.5 w-3.5" />
                                            {t("home.explore")}
                                        </div>
                                        <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
                                            {t("home.exploreSchoolsMapTitle")}
                                        </h2>
                                        <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                                            {nearbySchools.length > 0
                                                ? t("home.showingNearestSchools", { count: nearbySchools.length })
                                                : t("home.viewAllSchoolsOnMap")}
                                        </p>
                                    </div>
                                    {user?.role === "student" && (
                                        <Link
                                            href="/student"
                                            className="hidden sm:inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-purple-600/20 transition hover:bg-purple-700"
                                        >
                                            {t("home.exploreAndApply")}
                                            <ArrowRight className="h-3.5 w-3.5" />
                                        </Link>
                                    )}
                                </div>

                                {!loadingMap && allSchools.length === 0 ? (
                                    <div className="rounded-[1.5rem] border border-yellow-200 bg-yellow-50 p-6 text-center">
                                        <p className="mb-2 text-lg font-medium text-yellow-800">{t("home.noSchoolsFoundTitle")}</p>
                                        <p className="text-sm text-yellow-700">
                                            {t("home.noSchoolsFoundMessage")}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-hidden rounded-[1.75rem] border border-slate-200 dark:border-slate-800">
                                        <InteractiveSchoolMap
                                            schools={allSchools}
                                            userLocation={userLocation}
                                            height="420px"
                                        />
                                    </div>
                                )}

                            </div>
                        </section>
                    )}

                    {loadingMap && (
                        <section className="mb-6 rounded-[2rem] border border-slate-200 bg-white/85 px-4 py-10 text-center shadow-[0_30px_90px_-60px_rgba(15,23,42,0.7)] backdrop-blur-xl sm:px-6 dark:border-slate-800 dark:bg-slate-950/85">
                            <div>
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600">{t("home.loadingSchoolsAndMap")}</p>
                            </div>
                        </section>
                    )}

                    <section className="mb-6 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(241,245,249,0.92))] px-4 py-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.7)] sm:px-6 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(2,6,23,0.9))]">
                        <div>
                            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-amber-700 dark:text-amber-300">
                                        <Award className="h-3.5 w-3.5" />
                                        {t("home.spotlight")}
                                    </div>
                                    <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
                                        {t("home.mostRecommendedSchools")}
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">
                                        {t("home.mostRecommendedSubtitle")}
                                    </p>
                                </div>
                                <Link
                                    href="/schools"
                                    className="hidden sm:inline-flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-800 dark:text-blue-300"
                                >
                                    {t("home.viewAllSchools")}
                                    <ArrowRight className="h-3.5 w-3.5" />
                                </Link>
                            </div>

                            {loadingTop ? (
                                <p className="text-gray-500 text-xs">{t("home.loadingTopSchools")}</p>
                            ) : topSchools.length === 0 ? (
                                <p className="text-gray-500 text-xs">
                                    {t("home.noRatedSchoolsYet")}
                                </p>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {topSchools.map((school, index) => {
                                        const average =
                                            school.average_rating && school.average_rating > 0
                                                ? school.average_rating
                                                : 0
                                        const rounded = Math.round(average * 2) / 2

                                        // Ensure image URL is correctly parsed from stringified JSON if needed
                                        let schoolImage = null;
                                        if (school.image_urls) {
                                            if (typeof school.image_urls === 'string') {
                                                try {
                                                    const parsed = JSON.parse(school.image_urls as string);
                                                    schoolImage = Array.isArray(parsed) && parsed.length > 0 ? parsed[0] : parsed;
                                                } catch {
                                                    schoolImage = (school.image_urls as string).length > 5 ? school.image_urls : null;
                                                }
                                            } else if (Array.isArray(school.image_urls) && school.image_urls.length > 0) {
                                                schoolImage = school.image_urls[0];
                                            }
                                        }

                                        return (
                                            <div
                                                key={school.id}
                                                className="group overflow-hidden rounded-[1.6rem] border border-slate-200 bg-white/90 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.7)] transition duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/90"
                                            >
                                                {schoolImage ? (
                                                    <div className="relative h-40 w-full overflow-hidden shrink-0 bg-slate-900">
                                                        <div className="absolute inset-0 z-10 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-slate-950/10" />
                                                        <img
                                                            src={getImageUrl(schoolImage)}
                                                            alt=""
                                                            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.src = '/placeholder.jpg';
                                                            }}
                                                        />
                                                        <div className="absolute left-4 top-4 z-20 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                                            {t("home.ranked", { rank: index + 1 })}
                                                        </div>
                                                        <div className="absolute bottom-4 left-4 right-4 z-20">
                                                            <p className="text-lg font-semibold text-white line-clamp-2">
                                                                {school.name}
                                                            </p>
                                                            <div className="mt-2 flex items-center gap-2 text-xs text-white/80">
                                                                <MapPin className="h-3.5 w-3.5" />
                                                                <span className="line-clamp-1">{school.location}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex h-40 w-full shrink-0 items-end bg-[linear-gradient(135deg,#0f172a_0%,#0c4a6e_50%,#059669_100%)] p-4">
                                                        <div className="w-full">
                                                            <div className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                                                                {t("home.ranked", { rank: index + 1 })}
                                                            </div>
                                                            <p className="mt-2 text-base font-semibold text-white leading-snug" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                                                {school.name}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="p-3 flex-1 flex flex-col">
                                                    <div className="mb-3 flex items-center justify-between gap-2">
                                                        <span className="inline-flex rounded-full bg-purple-600/10 px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300">
                                                            {school.type}
                                                        </span>
                                                        <span className="text-[11px] font-medium text-slate-700 dark:text-slate-400">
                                                            {average > 0 ? `${average.toFixed(1)} / 5` : t("home.new")}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center mb-3">
                                                        {[1, 2, 3, 4, 5].map((star) => {
                                                            const canRate = !user || user.role === "student"
                                                            return canRate ? (
                                                                <button
                                                                    key={star}
                                                                    type="button"
                                                                    onClick={() => handleRate(school.id, star)}
                                                                    className="mr-0.5"
                                                                    aria-label={t(star > 1 ? "home.rateStars" : "home.rateStar", { count: star })}
                                                                >
                                                                    <Star
                                                                        className={`w-3 h-3 ${star <= rounded
                                                                            ? "text-yellow-400 fill-yellow-400"
                                                                            : "text-slate-300 dark:text-slate-600"
                                                                            }`}
                                                                    />
                                                                </button>
                                                            ) : (
                                                                <Star
                                                                    key={star}
                                                                    className={`w-3 h-3 mr-0.5 ${star <= rounded
                                                                        ? "text-yellow-400 fill-yellow-400"
                                                                        : "text-slate-300 dark:text-slate-600"
                                                                        }`}
                                                                />
                                                            )
                                                        })}
                                                        <span className="ml-1.5 text-xs text-slate-700 dark:text-slate-400">
                                                            {t((school.rating_count ?? 0) === 1 ? "home.review" : "home.reviews", { count: school.rating_count ?? 0 })}
                                                        </span>
                                                    </div>
                                                    <div className="rounded-[1.15rem] bg-slate-50/90 p-3 text-xs text-slate-800 dark:bg-slate-900/80 dark:text-slate-300 line-clamp-3">
                                                        {school.description || t("home.rateSchoolPrompt")}
                                                    </div>
                                                    <div className="mt-auto flex items-center justify-between pt-3">
                                                        <button
                                                            onClick={() => setSelectedSchool(school)}
                                                            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-600 hover:text-purple-800 dark:text-purple-400"
                                                        >
                                                            {t("home.viewDetails")}
                                                            <ArrowRight className="h-3 w-3" />
                                                        </button>
                                                        {ratingSchoolId === school.id && (
                                                            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-300">
                                                                {t("home.openingSurvey")}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="mb-6 rounded-[2rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(248,250,252,0.92),rgba(255,255,255,0.92))] px-4 py-8 shadow-[0_30px_90px_-60px_rgba(15,23,42,0.7)] sm:px-6 dark:border-slate-800 dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.94),rgba(2,6,23,0.88))]">
                        <div>
                            <div className="text-center mb-6">
                                <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700 dark:text-emerald-300">
                                    <BookOpen className="h-3.5 w-3.5" />
                                    {t("home.services")}
                                </div>
                                <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900 dark:text-white">{t("home.ourServices")}</h2>
                                <p className="mt-2 text-sm text-gray-600 dark:text-slate-400">{t("home.comprehensiveSolutions")}</p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {features.map((feature, index) => (
                                    <div
                                        key={index}
                                        className="group rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 text-center shadow-[0_24px_70px_-52px_rgba(15,23,42,0.65)] transition duration-300 hover:-translate-y-1 dark:border-slate-800 dark:bg-slate-950/90"
                                    >
                                        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-[linear-gradient(135deg,#581c87,#6b21a8,#9333ea)] text-white shadow-lg shadow-purple-900/10">
                                            <feature.icon className="h-6 w-6" />
                                        </div>
                                        <h3 className="text-[11px] font-bold text-gray-900 dark:text-white uppercase tracking-wider">{t(feature.titleKey)}</h3>
                                        <p className="mt-2 text-[10px] leading-5 text-gray-600 dark:text-slate-400">{t(feature.descKey)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-[2rem] border border-slate-200 dark:border-slate-800 bg-[linear-gradient(135deg,#f8fafc_0%,#e2e8f0_100%)] dark:bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_25%),linear-gradient(135deg,#020617_0%,#0f172a_35%,#0c4a6e_65%,#047857_100%)] px-4 py-8 text-slate-900 dark:text-white shadow-[0_40px_120px_-60px_rgba(2,6,23,0.9)] sm:px-6">
                        <div>
                            <div className="mb-8 max-w-2xl">
                                <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-white/70">
                                    {t("home.nationalImpact")}
                                </p>
                                <h2 className="mt-3 text-2xl font-semibold sm:text-3xl">
                                    {t("home.strongerDigitalExperience")}
                                </h2>
                                <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-white/80">
                                    {t("home.refreshedVisualSystem")}
                                </p>
                            </div>
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                                <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/10 p-5 backdrop-blur-md">
                                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-600 dark:bg-blue-400/10 dark:text-blue-200">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div className="text-base font-semibold text-slate-900 dark:text-white mb-1">{t("home.verifiedSchools")}</div>
                                    <div className="text-sm text-slate-600 dark:text-white/80">{t("home.verifiedSchoolsDesc")}</div>
                                </div>
                                <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/10 p-5 backdrop-blur-md">
                                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:bg-amber-400/10 dark:text-amber-200">
                                        <Star className="h-5 w-5" />
                                    </div>
                                    <div className="text-base font-semibold text-slate-900 dark:text-white mb-1">{t("home.topRated")}</div>
                                    <div className="text-sm text-slate-600 dark:text-white/80">{t("home.topRatedDesc")}</div>
                                </div>
                                <div className="rounded-[1.5rem] border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/10 p-5 backdrop-blur-md">
                                    <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-200">
                                        <MapPin className="h-5 w-5" />
                                    </div>
                                    <div className="text-base font-semibold text-slate-900 dark:text-white mb-1">{t("home.acrossRwanda")}</div>
                                    <div className="text-sm text-slate-600 dark:text-white/80">{t("home.acrossRwandaDesc")}</div>
                                </div>
                            </div>
                        </div>
                    </section>
                </main>
            </div>

            {/* School Details Modal */}
            {selectedSchool && (
                <SchoolDetailsModal
                    school={selectedSchool}
                    onClose={() => setSelectedSchool(null)}
                />
            )}

            {showAdvertise && <AdvertiseModal onClose={() => setShowAdvertise(false)} />}
        </div>
    )
}
