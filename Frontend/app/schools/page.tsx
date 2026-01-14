"use client";

import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, Filter, MapPin, Users, Calendar, Shield, AlertCircle } from "lucide-react";
import Navigation from "../components/Navigation";
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

export default function Schools() {
  const { t } = useLanguage();
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [schools, setSchools] = useState<School[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<"All" | "Public" | "Private">("All");
  const [filterLevel, setFilterLevel] = useState<"All" | "Primary" | "Secondary">("All");
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
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Only load schools if user is authenticated and has proper role
    if (isAuthenticated && (user?.role === 'leader' || user?.role === 'admin')) {
      const loadSchools = async () => {
        try {
          const schoolsData = await fetchSchools();
          setSchools(schoolsData);
        } catch (error) {
          console.error("Error fetching schools:", error);
        }
      };
      loadSchools();
    }
  }, [isAuthenticated, user]);

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === "All" || school.type === filterType;
    const matchesLevel = filterLevel === "All" || school.level.includes(filterLevel);

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
    } catch (error) {
      alert("Unable to delete school. Please try again later.");
    }
  };

  const handleSaveSchool = async (schoolData: Omit<School, "id">, images: File[]) => {
    try {
      const newSchool = await addSchool(schoolData, images);
      setSchools((prev) => [...prev, newSchool]);
      setIsModalOpen(false);
    } catch (error) {
      alert("Unable to add school. Please try again later.");
    }
  };

  const handleUpdateSchool = async (schoolData: Omit<School, "id">, images: File[]) => {
    if (!editingSchool) return;
    try {
      // When editing from the schools page, treat all provided images as new,
      // and do not request deletion of any existing ones.
      const updatedSchool = await updateSchool(editingSchool.id, schoolData, images, []);
      setSchools((prev) =>
        prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s))
      );
      setIsModalOpen(false);
      setEditingSchool(null);
    } catch (error) {
      alert("Unable to update school. Please try again later.");
    }
  };

  // Show access denied message if user doesn't have permission
  if (!isAuthenticated || (user?.role !== 'leader' && user?.role !== 'admin')) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">{t("schools")}</h1>
          </div>
          <p className="text-gray-600">Manage and view all registered schools in Rwanda</p>
          <p className="text-sm text-gray-500 mt-1">Restricted to school leaders and administrators</p>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full lg:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t("search")}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center w-full lg:w-auto">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  aria-label="Filter by Type"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value as any)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                >
                  <option value="All">{t("all")}</option>
                  <option value="Public">{t("public")}</option>
                  <option value="Private">{t("private")}</option>
                </select>
              </div>

              <select
                aria-label="Filter by Type"
                value={filterLevel}
                onChange={(e) => setFilterLevel(e.target.value as any)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-auto"
              >
                <option value="All">{t("all")}</option>
                <option value="Primary">{t("primary")}</option>
                <option value="Secondary">{t("secondary")}</option>
              </select>

              <button
                onClick={handleAddSchool}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                {t("addSchool")}
              </button>
            </div>
          </div>
        </div>

        {/* Schools Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSchools.map((school) => (
            <div
              key={school.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">{school.name}</h3>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSchool(school)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t("edit")}
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteSchool(school)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t("delete")}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{school.location}</span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>
                      {school.students} {t("students")}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {t("established")} {school.established}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      school.type === "Public" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {school.type}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {school.level}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredSchools.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <Search className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No schools found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}

        {/* Modals */}
        {isModalOpen && (
          <SchoolModal school={editingSchool} onSave={editingSchool ? handleUpdateSchool : handleSaveSchool} onClose={() => setIsModalOpen(false)} />
        )}

        {deletingSchool && (
          <DeleteConfirmModal
            schoolName={deletingSchool.name}
            onConfirm={confirmDelete}
            onCancel={() => setDeletingSchool(null)}
          />
        )}
      </div>
    </div>
  );
}
