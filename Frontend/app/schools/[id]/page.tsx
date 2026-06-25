"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, MapPin, Users, Calendar, BookOpen, GraduationCap, Star,
  Mail, Phone, Globe, Clock, User, Building2, DollarSign, FileText,
  CheckCircle, Shirt, Image as ImageIcon, ChevronRight, ChevronLeft, X,
} from "lucide-react";
import Navigation from "../../components/Navigation";
import { useLanguage } from "../../providers/LanguageProvider";
import { fetchSchools } from "@/api/school";
import { fetchGalleries, fetchGallery } from "../../api/galleries";
import { getImageUrl } from "@/lib/image-utils";
import { BACKEND_URL } from "@/lib/backend";
import type { School } from "../../types";

interface SchoolDetails {
  description?: string;
  facilities?: string;
  programs?: string;
  admission_requirements?: string;
  fees_info?: string;
  uniform_info?: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  working_hours?: string;
  principal_name?: string;
}

export default function SchoolDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useLanguage();
  const id = params.id as string;

  const [school, setSchool] = useState<School | null>(null);
  const [pageLoading, setPageLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [details, setDetails] = useState<SchoolDetails | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "gallery" | "details" | "contact">("overview");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [currentImagePage, setCurrentImagePage] = useState(0);
  const imagesPerPage = 12;

  useEffect(() => {
    if (!id) return;
    fetchSchools()
      .then((schools) => {
        const found = schools.find((s) => s.id === id);
        if (found) {
          setSchool(found);
          fetchSchoolDetails(found.id);
          fetchGalleryImages(found.id);
        } else {
          setNotFound(true);
          setDetailsLoading(false);
        }
      })
      .catch(() => {
        setNotFound(true);
        setDetailsLoading(false);
      })
      .finally(() => setPageLoading(false));
  }, [id]);

  const fetchSchoolDetails = async (schoolId: string) => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/schools/${schoolId}/details`);
      if (response.ok) setDetails(await response.json());
    } catch {}
    finally { setDetailsLoading(false); }
  };

  const fetchGalleryImages = async (schoolId: string) => {
    try {
      const galleries = await fetchGalleries({ school_id: schoolId });
      const allImages: string[] = [];
      for (const gallery of galleries) {
        try {
          const g = await fetchGallery(gallery.id);
          if (g.items) {
            g.items.forEach((item: any) => {
              if (item.media_type === "photo" && item.media_url) allImages.push(item.media_url);
            });
          }
        } catch {}
      }
      setGalleryImages(allImages);
    } catch {}
  };

  const schoolImageUrls = useMemo(() => {
    if (!school?.image_urls) return [];
    if (typeof school.image_urls === "string") {
      try {
        const parsed = JSON.parse(school.image_urls);
        return Array.isArray(parsed) ? parsed : [parsed];
      } catch { return [school.image_urls as unknown as string]; }
    }
    return Array.isArray(school.image_urls) ? school.image_urls : [school.image_urls as unknown as string];
  }, [school?.image_urls]);

  const allImages = galleryImages.length > 0 ? galleryImages : schoolImageUrls;
  const totalImagePages = Math.ceil(allImages.length / imagesPerPage);
  const currentImages = allImages.slice(currentImagePage * imagesPerPage, (currentImagePage + 1) * imagesPerPage);
  const heroImage = allImages[0] || "";

  if (pageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-[3px] border-purple-600 border-t-transparent" />
            <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t("common.loading")}</p>
          </div>
        </main>
      </div>
    );
  }

  if (notFound || !school) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1 flex items-center justify-center p-8">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-4">{t("schools.schoolNotFound")}</h2>
            <button onClick={() => router.back()} className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors">
              {t("common.back")}
            </button>
          </div>
        </main>
      </div>
    );
  }

  const average = school.average_rating && school.average_rating > 0 ? school.average_rating : 0;
  const rounded = Math.round(average * 2) / 2;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
      <Navigation />

      <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-6 sm:py-10">
        <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col">

          {/* Hero Header */}
          <div className="relative h-64 w-full shrink-0">
            <img src={getImageUrl(heroImage)} alt={school.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-900 via-transparent to-black/20" />

            <button
              onClick={() => router.back()}
              className="absolute top-6 left-6 h-10 w-10 bg-black/20 backdrop-blur-md border border-white/30 text-white rounded-full flex items-center justify-center hover:bg-black/40 transition-all z-20"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="absolute bottom-6 left-8 right-8 z-10">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">{school.name}</h1>
                  <div className="flex items-center gap-4 text-xs font-medium">
                    <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400">
                      <MapPin className="w-3.5 h-3.5 text-purple-500" />
                      <span>{school.location}</span>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      school.type === "Public"
                        ? "bg-purple-100 text-purple-800 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20"
                        : "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/10 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-500/20"
                    }`}>{school.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl px-3 py-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xl">
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= rounded ? "text-amber-400 fill-amber-400" : "text-slate-300 dark:text-slate-600"}`} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-gray-900 dark:text-white">{average.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-5 md:p-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-purple-100 dark:bg-purple-500/10 rounded-lg flex items-center justify-center mb-2">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white">{school.students.toLocaleString()}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("schools.students")}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-indigo-100 dark:bg-indigo-500/10 rounded-lg flex items-center justify-center mb-2">
                  <Calendar className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white">{school.established}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("schools.established")}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-pink-100 dark:bg-pink-500/10 rounded-lg flex items-center justify-center mb-2">
                  <Star className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white">{school.rating_count || 0}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("schools.reviews")}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3 border border-slate-100 dark:border-slate-800 hover:scale-[1.02] transition-transform">
                <div className="w-8 h-8 bg-violet-100 dark:bg-violet-500/10 rounded-lg flex items-center justify-center mb-2">
                  <GraduationCap className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="text-lg font-black text-gray-900 dark:text-white leading-tight truncate">{school.level}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t("schools.level")}</div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="mb-6 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl inline-flex text-xs">
              {(["overview", "gallery", "details", "contact"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => { setActiveTab(tab); if (tab === "gallery") setCurrentImagePage(0); }}
                  className={`px-4 py-1.5 rounded-lg font-bold transition-all ${
                    activeTab === tab
                      ? "bg-white dark:bg-slate-700 text-purple-600 dark:text-white shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300"
                  }`}
                >
                  {t(`schools.${tab}`)}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-500/10 dark:to-indigo-500/10 p-4 rounded-2xl border border-purple-100 dark:border-purple-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-purple-600 rounded-lg flex items-center justify-center text-white">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">{t("schools.academicProfile")}</h4>
                      </div>
                      <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed mb-2">
                        {t("schools.academicProfileText").replace("{{type}}", school.type.toLowerCase()).replace("{{level}}", school.level.toLowerCase()).replace("{{students}}", String(school.students))}
                      </p>
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-purple-700 dark:text-purple-400">
                        <CheckCircle className="w-3 h-3" />
                        <span>{t("schools.rwandaEducationCertified")}</span>
                      </div>
                    </div>
                    <div className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-500/10 dark:to-purple-500/10 p-4 rounded-2xl border border-violet-100 dark:border-violet-500/20">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white">
                          <Building2 className="w-3.5 h-3.5" />
                        </div>
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-wider text-[10px]">{t("schools.keyFeatures")}</h4>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {[t("schools.verified"), t("schools.communityRated"), school.type].map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-white/50 dark:bg-slate-900/50 rounded-full text-[9px] font-bold text-violet-700 dark:text-violet-400 border border-violet-200 dark:border-violet-500/20">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  {details?.description && (
                    <div>
                      <h4 className="text-sm font-black text-gray-900 dark:text-white mb-2">{t("schools.missionStatement")}</h4>
                      <div className="bg-slate-50 dark:bg-slate-800/30 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed italic">"{details.description}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "gallery" && (
                <div className="space-y-6">
                  {allImages.length > 0 ? (
                    <>
                      <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                        {currentImages.map((imageUrl, index) => {
                          const globalIndex = currentImagePage * imagesPerPage + index;
                          return (
                            <div
                              key={globalIndex}
                              className="relative group cursor-pointer overflow-hidden rounded-2xl aspect-square border border-slate-200/70 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
                              onClick={() => setSelectedImageIndex(globalIndex)}
                            >
                              <img src={getImageUrl(imageUrl)} alt={`${school.name} ${globalIndex}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent flex items-end p-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ImageIcon className="w-4 h-4 text-white" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                      {totalImagePages > 1 && (
                        <div className="flex items-center justify-center gap-6 mt-8">
                          <button onClick={() => setCurrentImagePage((p) => Math.max(0, p - 1))} disabled={currentImagePage === 0} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95">
                            <ChevronLeft className="w-6 h-6" />
                          </button>
                          <span className="text-sm font-black text-slate-500 tracking-[0.2em] uppercase">{currentImagePage + 1} / {totalImagePages}</span>
                          <button onClick={() => setCurrentImagePage((p) => Math.min(totalImagePages - 1, p + 1))} disabled={currentImagePage === totalImagePages - 1} className="w-12 h-12 flex items-center justify-center bg-slate-100 dark:bg-slate-800 rounded-full text-slate-600 dark:text-slate-300 disabled:opacity-30 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95">
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border border-dashed border-slate-200 dark:border-slate-700">
                      <ImageIcon className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t("schools.visualsComingSoon")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div className="space-y-8">
                  {detailsLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                      <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent" />
                      <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{t("schools.gatheringDetails")}</p>
                    </div>
                  ) : details ? (
                    <div className="space-y-8">
                      {details.description && (
                        <div className="p-6 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900/40 rounded-[2rem] border border-slate-100 dark:border-slate-800">
                          <h5 className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] mb-4">
                            <FileText className="w-4 h-4 text-purple-500" />
                            {t("schools.description")}
                          </h5>
                          <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{details.description}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: t("schools.facilities"), icon: Building2, content: details.facilities },
                          { label: t("schools.academicPrograms"), icon: BookOpen, content: details.programs },
                          { label: t("schools.admission"), icon: CheckCircle, content: details.admission_requirements },
                          { label: t("schools.investmentFees"), icon: DollarSign, content: details.fees_info },
                          { label: t("schools.uniformDressCode"), icon: Shirt, content: details.uniform_info },
                        ].filter((s) => s.content).map((section) => (
                          <div key={section.label}>
                            <h5 className="flex items-center gap-2 text-sm font-black text-gray-900 dark:text-white uppercase tracking-[0.1em] mb-4">
                              <section.icon className="w-4 h-4 text-purple-500" />
                              {section.label}
                            </h5>
                            <div className="p-6 bg-white dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
                              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed whitespace-pre-wrap">{section.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-20 bg-slate-50 dark:bg-slate-800/30 rounded-[3rem] border border-slate-200 dark:border-slate-700">
                      <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">{t("schools.detailedDataUnavailable")}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "contact" && (
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: t("schools.principal"), value: details?.principal_name, icon: User, type: "text" },
                      { label: t("schools.emailAddress"), value: details?.contact_email, icon: Mail, type: "email" },
                      { label: t("schools.contactNumber"), value: details?.contact_phone, icon: Phone, type: "tel" },
                      { label: t("schools.officialWebsite"), value: details?.website, icon: Globe, type: "url" },
                      { label: t("schools.operatingHours"), value: details?.working_hours, icon: Clock, type: "text" },
                    ].filter((c) => c.value).map((contact) => (
                      <div key={contact.label} className="flex items-center gap-4 p-5 bg-slate-50 dark:bg-slate-800/50 rounded-[1.5rem] border border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-200 dark:border-slate-700 shadow-sm">
                          <contact.icon className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{contact.label}</p>
                          {contact.type === "email" ? (
                            <a href={`mailto:${contact.value}`} className="text-sm font-bold text-blue-600 truncate block hover:underline">{contact.value}</a>
                          ) : contact.type === "tel" ? (
                            <a href={`tel:${contact.value}`} className="text-sm font-bold text-gray-900 dark:text-white block hover:text-blue-600 transition-colors">{contact.value}</a>
                          ) : contact.type === "url" ? (
                            <a href={contact.value} target="_blank" rel="noopener noreferrer" className="text-sm font-bold text-blue-600 truncate block hover:underline">{contact.value}</a>
                          ) : (
                            <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{contact.value}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  {details?.address && (
                    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-950 rounded-[2rem] text-white">
                      <h5 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest mb-4">
                        <MapPin className="w-4 h-4 text-rose-500" />
                        {t("schools.physicalLocation")}
                      </h5>
                      <p className="text-slate-300 font-medium leading-relaxed">{details.address}</p>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Bottom Bar */}
          <div className="p-5 md:p-8 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 backdrop-blur-xl shrink-0">
            <button
              onClick={() => router.back()}
              className="px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-bold text-sm transition-all hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {t("schools.returnHome")}
            </button>
          </div>
        </div>
      </main>

      {/* Fullscreen Image Viewer */}
      {selectedImageIndex !== null && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center z-[60] p-8">
          <button
            onClick={() => setSelectedImageIndex(null)}
            className="absolute top-8 right-8 text-white hover:text-slate-400 z-10 bg-white/10 backdrop-blur-md rounded-full p-4 border border-white/20 transition-all"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative max-w-6xl w-full h-full flex items-center justify-center group">
            <img
              src={getImageUrl(allImages[selectedImageIndex])}
              className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl"
              alt={school.name}
            />
            {allImages.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex((selectedImageIndex - 1 + allImages.length) % allImages.length)}
                  className="absolute left-0 h-16 w-16 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 transition-all -translate-x-full group-hover:translate-x-0 ml-4 lg:-ml-12"
                >
                  <ChevronLeft className="w-8 h-8" />
                </button>
                <button
                  onClick={() => setSelectedImageIndex((selectedImageIndex + 1) % allImages.length)}
                  className="absolute right-0 h-16 w-16 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-full flex items-center justify-center border border-white/20 transition-all translate-x-full group-hover:translate-x-0 mr-4 lg:-mr-12"
                >
                  <ChevronRight className="w-8 h-8" />
                </button>
              </>
            )}
            <div className="absolute bottom-8 px-6 py-2 bg-white/10 backdrop-blur-md text-white rounded-full border border-white/20 font-black text-sm tracking-widest lowercase">
              {selectedImageIndex + 1} // {allImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
