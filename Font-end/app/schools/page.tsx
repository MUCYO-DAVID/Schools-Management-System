"use client"

import { useState } from "react"
import { Search, Plus, Edit, Trash2, Filter, MapPin, Users, Calendar } from "lucide-react"
import Navigation from "../components/Navigation"
import { useLanguage } from "../providers/LanguageProvider"
import type { School } from "../types"
import SchoolModal from "../components/SchoolModal"
import DeleteConfirmModal from "../components/DeleteConfirmModal"
import React, { useEffect } from 'react';

export default function Schools() {
  const { t } = useLanguage()
  const [schools, setSchools] = useState<School[]>([]) // Removed initialSchools
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState<"All" | "Public" | "Private">("All")
  const [filterLevel, setFilterLevel] = useState<"All" | "Primary" | "Secondary">("All")
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSchool, setEditingSchool] = useState<School | null>(null)
  const [deletingSchool, setDeletingSchool] = useState<School | null>(null)

  const filteredSchools = schools.filter((school) => {
    const matchesSearch =
      school.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      school.location.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = filterType === "All" || school.type === filterType
    const matchesLevel = filterLevel === "All" || school.level.includes(filterLevel)

    return matchesSearch && matchesType && matchesLevel
  })

  const handleAddSchool = () => {
    setEditingSchool(null)
    setIsModalOpen(true)
  }

  const handleEditSchool = (school: School) => {
    setEditingSchool(school)
    setIsModalOpen(true)
  }

  const handleDeleteSchool = (school: School) => {
    setDeletingSchool(school)
  }

  const confirmDelete = async () => {
    if (!deletingSchool) return;
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schools/${deletingSchool.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete school');
      setSchools((prev) => prev.filter((s) => s.id !== deletingSchool.id));
      setDeletingSchool(null);
    } catch (error) {
      alert('Unable to delete school. Please try again later.');
    }
  };

  const handleSaveSchool = async (schoolData: Omit<School, "id">) => {
    try {
      const schoolWithId = {
        ...schoolData,
        id: crypto.randomUUID(),
        name_rw: schoolData.nameRw, // Map to backend field
      };
      delete schoolWithId.nameRw; // Remove camelCase field
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schools`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolWithId),
      });
      if (!response.ok) throw new Error('Failed to add school');
      const newSchool = await response.json();
      setSchools((prev) => [...prev, newSchool]);
      setIsModalOpen(false);
    } catch (error) {
      alert('Unable to add school. Please try again later.');
    }
  };

  const handleUpdateSchool = async (schoolData: Omit<School, "id">) => {
    if (!editingSchool) return;
    try {
      const schoolToUpdate = {
        ...schoolData,
        name_rw: schoolData.nameRw,
      };
      delete schoolToUpdate.nameRw;
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schools/${editingSchool.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(schoolToUpdate),
      });
      if (!response.ok) throw new Error('Failed to update school');
      const updatedSchool = await response.json();
      setSchools((prev) => prev.map((s) => (s.id === updatedSchool.id ? updatedSchool : s)));
      setIsModalOpen(false);
      setEditingSchool(null);
    } catch (error) {
      alert('Unable to update school. Please try again later.');
    }
  };

  // Removed redundant handleSubmit function

  useEffect(() => {
      const fetchSchools = async () => {
          try {
              const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/schools`);
              if (!response.ok) throw new Error('Failed to fetch schools');
  
              const schoolsData = await response.json();
              setSchools(schoolsData);
          } catch (error) {
              console.error('Error fetching schools:', error);
          }
      };
  
      fetchSchools();
  }, []);

  return (
    <div className="min-h-screen">
      <Navigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("schools")}</h1>
          <p className="text-gray-600">Manage and view all registered schools in Rwanda</p>
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
  )
}
