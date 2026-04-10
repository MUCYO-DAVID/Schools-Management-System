"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Filter, MapPin, Users, Calendar,
import { Shield, AlertCircle, ArrowRight } from "lucide-react";
import Navigation from "../components/Navigation";
import { toast } from "sonner";
import { useLanguage } from "../providers/LanguageProvider";
import { useAuth } from "../providers/AuthProvider";
import { useRouter } from "next/navigation";
import type { School } from "../types";
import SchoolModal from "../components/SchoolModal";
import DeleteConfirmModal from "../components/DeleteConfirmModal";
import {
  fetchSchools,
  addSchool,
  updateSchool,
  deleteSchool,
} from "@/api/school";
import { getImageUrl } from "@/lib/image-utils";

export default function Schools() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Public" | "Private">("All");
  const [filterLevel, setFilterLevel] = useState<"All" | "Primary" | "Secondary" | "TVET">("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchool, setEditingSchool] = useState<School | null>(null);
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null);

  // Check authentication and role on mount
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }

    // Only leaders and admins can access this page
    if (user?.role !== 'leader' && user?.role !== 'admin') {
      // Redirect students to student dashboard
      if (user?.role === 'student') {
        router.push('/student');
      } else {
        router.push('/home');
      }
      return;
    }

    loadSchools();
  }, [isAuthenticated, user, router]);

  const loadSchools = async () => {
    try {
      const data = await fetchSchools();
      setSchools(data);
    } catch (error) {
      console.error("Error loading schools:", error);
    }
  };

  const filteredSchools = schools.filter((school) => {
    const matchesSearch = school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.nameRw.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "All" || school.type === filterType;
    const matchesLevel = filterLevel === "All" || school.level === filterLevel;

    return matchesSearch && matchesType && matchesLevel;
  });

  const handleAddSchool = () => {
    setEditingSchool(null);
    setIsModalOpen(true);
  };

  const handleEditSchool = (school: School) => {
    setEditingSchool(school);
    setIsModalOpen(true);
  };

  const handleDeleteSchool = (school: School) => {
    setDeletingSchool(school);
  };

  const confirmDelete = async () => {
    if (!deletingSchool) return;
    try {
      await deleteSchool(deletingSchool.id);
      setSchools((prev) => prev.filter((s) => s.id !== deletingSchool.id));
      setDeletingSchool(null);
      toast.success("School deleted successfully");
    } catch (error) {
      toast.error("Unable to delete school. Please try again later.");
    }
  };

  const handleSaveSchool = async (schoolData: Omit<School, "id">, images: File[], imagesToDelete: string[]) => {
    try {
      if (editingSchool) {
        // Update existing school
        const updatedSchool = await updateSchool(editingSchool.id, schoolData, images, imagesToDelete);
        setSchools((prev) =>
          prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s))
        );
        toast.success("School updated successfully");
      } else {
        // Add new school
        const newSchool = await addSchool(schoolData, images);
        setSchools((prev) => [...prev, newSchool]);
        toast.success("School added successfully");
      }
      setIsModalOpen(false);
      setEditingSchool(null);
    } catch (error) {
      toast.error("Unable to save school. Please try again later.");
    }
  };

  // Show access denied message if user doesn't have permission
  if (!isAuthenticated || (user?.role !== 'leader' && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="w-full">
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <AlertCircle className="w-16 h-16 mx-auto text-red-600 mb-4" />
              <h2 className="text-2xl font-bold text-red-900 mb-2">Access Denied</h2>
              <p className="text-red-700 mb-4">
                This page is only accessible to school leaders and administrators.
              </p>
              <p className="text-red-600 text-sm">
                If you are a student, please use the Student Access page to browse schools.
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 flex flex-col font-sans">
      <Navigation />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-8">
        <div className="w-full">
          {/* Header */}
          <div className="relative mb-12 py-10 rounded-[3rem] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 via-purple-900/20 to-transparent blur-3xl opacity-50" />
            <div className="relative z-10 flex flex-col items-center text-center">
              <div className="inline-flex items-center gap-2 bg-blue-600/10 border border-blue-500/20 px-4 py-1.5 rounded-full mb-4">
                <Shield className="w-4 h-4 text-blue-400" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-300">Management Console</span>
              </div>
              <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white italic mb-4">
                {t("schools")} <span className="text-blue-500">Registry</span>
              </h1>
              <p className="text-slate-400 max-w-2xl text-lg font-medium">
                Comprehensive oversight and management of Rwanda's educational institutions. 
                <span className="block text-sm text-slate-500 mt-2 font-bold uppercase tracking-widest">Authorized Personnel Only</span>
              </p>
            </div>
          </div>

          {/* Premium Controls */}
          <div className="relative mb-12 group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-[2.5rem] blur opacity-10 group-hover:opacity-20 transition duration-500" />
            <div className="relative bg-[#141418] rounded-[2.5rem] border border-white/5 p-6 shadow-2xl">
              <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                {/* Search */}
                <div className="relative flex-1 w-full lg:max-w-xl">
                  <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
                  <input
                    type="text"
                    placeholder={t("search")}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-black/40 border border-white/5 rounded-2xl pl-14 pr-6 py-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-600/50 transition-all placeholder:text-slate-600"
                  />
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4 items-center w-full lg:w-auto">
                  <div className="flex items-center gap-3 bg-black/40 border border-white/5 rounded-2xl px-4 py-2">
                    <Filter className="w-4 h-4 text-slate-500" />
                    <select
                      aria-label="Filter by Type"
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value as any)}
                      className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none cursor-pointer pr-4"
                    >
                      <option value="All" className="bg-[#141418]">{t("all")}</option>
                      <option value="Public" className="bg-[#141418]">{t("public")}</option>
                      <option value="Private" className="bg-[#141418]">{t("private")}</option>
                    </select>
                  </div>

                  <div className="bg-black/40 border border-white/5 rounded-2xl px-4 py-2">
                    <select
                      aria-label="Filter by Level"
                      value={filterLevel}
                      onChange={(e) => setFilterLevel(e.target.value as any)}
                      className="bg-transparent text-sm font-bold text-slate-300 focus:outline-none cursor-pointer pr-4"
                    >
                      <option value="All" className="bg-[#141418]">{t("all")}</option>
                      <option value="Primary" className="bg-[#141418]">{t("primary")}</option>
                      <option value="Secondary" className="bg-[#141418]">{t("secondary")}</option>
                      <option value="TVET" className="bg-[#141418]">TVET</option>
                    </select>
                  </div>

                  <button
                    onClick={handleAddSchool}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 transition-all font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 active:scale-95"
                  >
                    <Plus className="w-5 h-5" />
                    {t("addSchool")}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Schools Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSchools.map((school) => (
              <div
                key={school.id}
                className="group bg-[#141418] rounded-3xl border border-white/5 overflow-hidden flex flex-col hover:border-blue-500/40 transition-all duration-500 shadow-2xl relative"
              >
                {/* School Image Header - More Compact */}
                <div className="h-32 w-full relative overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#141418] via-transparent to-transparent z-10" />
                  <img 
                    src={getImageUrl(school.image_urls?.[0])} 
                    alt={school.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=600&auto=format&fit=crop';
                    }}
                  />
                  
                  {/* Floating Action Buttons - Smaller */}
                  <div className="absolute top-2 right-2 flex gap-1.5 z-20 opacity-0 group-hover:opacity-100 translate-y-1 group-hover:translate-y-0 transition-all duration-300">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-blue-600 rounded-xl shadow-2xl transition-all active:scale-90"
                      title={t("edit")}
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchool(school)}
                      className="p-2 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-red-600 rounded-xl shadow-2xl transition-all active:scale-90"
                      title={t("delete")}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Badges Overlay - Tiny */}
                  <div className="absolute bottom-2 left-4 flex gap-1.5 z-20">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.15em] backdrop-blur-md border border-white/10 shadow-sm ${
                        school.type === "Public" 
                          ? "bg-emerald-500/20 text-emerald-300" 
                          : "bg-blue-600/20 text-blue-300"
                      }`}
                    >
                      {school.type}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-[7px] font-black uppercase tracking-[0.15em] bg-white/10 backdrop-blur-md text-slate-300 border border-white/10 shadow-sm">
                      {school.level}
                    </span>
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col">
                  <div className="mb-3">
                    <h3 className="text-lg font-black text-white line-clamp-1 group-hover:text-blue-500 transition-colors italic tracking-tight">
                      {school.name}
                    </h3>
                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] mt-1 line-clamp-1">
                      {school.nameRw}
                    </p>
                  </div>

                  <div className="space-y-2 border-t border-white/5 pt-3 flex-1">
                    <div className="flex items-center gap-2.5 text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <MapPin className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold line-clamp-1">{school.location}</span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <Users className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold">
                        {school.students.toLocaleString()} {t("students")}
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5 text-slate-400">
                      <div className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center border border-white/5 shrink-0">
                        <Calendar className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="text-[10px] font-bold">
                        {t("established")} {school.established}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-white/5 flex justify-between items-center">
                    <button 
                      onClick={() => router.push(`/schools/${school.id}`)}
                      className="text-[8px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-500 transition-colors flex items-center gap-1.5 group/btn"
                    >
                      Analytics
                      <ArrowRight className="w-2.5 h-2.5 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex -space-x-1">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-4 h-4 rounded-full border border-[#141418] bg-slate-800 flex items-center justify-center text-[6px] font-bold text-slate-400">
                          {String.fromCharCode(64 + i)}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSchools.length === 0 && (
            <div className="text-center py-24 bg-[#141418] rounded-[3rem] border border-dashed border-white/10">
              <div className="text-slate-700 mb-6">
                <Search className="w-20 h-20 mx-auto opacity-20" />
              </div>
              <h3 className="text-xl font-black text-slate-400 mb-2 uppercase tracking-widest">No schools found</h3>
              <p className="text-slate-600 font-medium">Try adjusting your search or filter criteria</p>
            </div>
          )}

          {/* Modals */}
          {isModalOpen && (
            <SchoolModal school={editingSchool} onSave={handleSaveSchool} onClose={() => setIsModalOpen(false)} />
          )}

          {deletingSchool && (
            <DeleteConfirmModal
              schoolName={deletingSchool.name}
              onConfirm={confirmDelete}
              onCancel={() => setDeletingSchool(null)}
            />
          )}
        </div>
      </main>

      <footer className="py-10 border-t border-white/5 text-center bg-black/40">
         <p className="text-[10px] uppercase font-black tracking-[0.4em] text-slate-700">© 2026 RSBS • SCHOOL REGISTRY SYSTEM</p>
      </footer>
    </div>
  );
}
