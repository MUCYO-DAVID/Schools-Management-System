"use client"

import { ChangeEvent } from "react"

import { useState, useEffect, useRef } from "react"
import { X, MapPin } from "lucide-react"
import { School } from "../types";
import { useLanguage } from "../providers/LanguageProvider"

interface SchoolModalProps {
  school: School | null
  onSave: (school: Omit<School, "id">, images: File[], imagesToDelete: string[]) => void
  onClose: () => void
}

export default function SchoolModal({ school, onSave, onClose }: SchoolModalProps) {
  const { t } = useLanguage()
  const [formData, setFormData] = useState<Omit<School, "id">>({
    name: "",
    nameRw: "",
    location: "",
    type: "Public",
    level: "Primary",
    students: 0,
    established: new Date().getFullYear(),
    image_urls: [],
    latitude: -1.9441, // Default to Kigali, Rwanda
    longitude: 30.0619,
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (school) {
      setFormData({
        name: school.name,
        nameRw: school.nameRw || "",
        location: school.location,
        type: school.type,
        level: school.level,
        students: school.students,
        established: school.established,
        image_urls: school.image_urls || [],
        latitude: school.latitude || -1.9441,
        longitude: school.longitude || 30.0619,
      });
      setImagesToDelete([]); // Reset images to delete when school changes
      setSelectedFiles([]); // Reset selected files
    }
  }, [school]);

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onSave({ ...formData, image_urls: formData.image_urls.filter(url => !imagesToDelete.includes(url)) }, selectedFiles, imagesToDelete);
    } catch (error) {
      console.error("Error saving school:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === "students" || name === "established" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleRemoveExistingImage = (imageUrl: string) => {
    setFormData((prev) => ({
      ...prev,
      image_urls: prev.image_urls.filter((url) => url !== imageUrl),
    }));
    setImagesToDelete((prev) => [...prev, imageUrl]);
  };

  const handleMapClick = async (lat: number, lng: number) => {
    try {
      // Get address from coordinates
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
      
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: address,
      }));
    } catch (error) {
      console.error("Error getting address:", error);
      setFormData((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        location: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600">
            {school ? t("editSchool") : t("addSchool")}
          </h2>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("schoolName")} (English)</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("schoolName")} (Kinyarwanda)</label>
              <input
                type="text"
                name="nameRw"
                value={formData.nameRw}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("location")}</label>
              <div className="space-y-2.5">
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  placeholder="Enter school address or pick on map"
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowMapPicker(!showMapPicker)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20 rounded-xl hover:bg-purple-100 dark:hover:bg-purple-500/20 transition-colors text-xs font-bold"
                >
                  <MapPin className="w-4 h-4" />
                  {showMapPicker ? "Hide Map" : "Pick Location on Map"}
                </button>
              </div>
            </div>

            {showMapPicker && (
              <div className="border border-slate-200 dark:border-slate-700 rounded-2xl p-4 bg-slate-50 dark:bg-slate-800/50 space-y-3">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  Select coordinates
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">LATITUDE</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.latitude || -1.9441}
                      onChange={(e) => {
                        const lat = parseFloat(e.target.value) || -1.9441;
                        handleMapClick(lat, formData.longitude || 30.0619);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 mb-1">LONGITUDE</label>
                    <input
                      type="number"
                      step="0.000001"
                      value={formData.longitude || 30.0619}
                      onChange={(e) => {
                        const lng = parseFloat(e.target.value) || 30.0619;
                        handleMapClick(formData.latitude || -1.9441, lng);
                      }}
                      className="w-full px-3 py-1.5 text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("type")}</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
                >
                  <option value="Public">{t("public")}</option>
                  <option value="Private">{t("private")}</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("level")}</label>
                <select
                  name="level"
                  value={formData.level}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm cursor-pointer"
                >
                  <option value="Primary">{t("primary")}</option>
                  <option value="Secondary">{t("secondary")}</option>
                  <option value="Primary & Secondary">Primary & Secondary</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("students")}</label>
                <input
                  type="number"
                  name="students"
                  value={formData.students}
                  onChange={handleChange}
                  min="0"
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">{t("established")}</label>
                <input
                  type="number"
                  name="established"
                  value={formData.established}
                  onChange={handleChange}
                  min="1900"
                  max={new Date().getFullYear()}
                  required
                  className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-purple-500 outline-none text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">School Images</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-2xl cursor-pointer bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border-slate-200 dark:border-slate-700">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
                    <p className="mb-2 text-sm">Click to upload photos</p>
                    <p className="text-xs">PNG, JPG or WEBP</p>
                  </div>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-3 flex items-center gap-2 text-xs font-bold text-purple-600 bg-purple-50 dark:bg-purple-500/10 p-2 rounded-lg border border-purple-100 dark:border-purple-500/20">
                   <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                   {selectedFiles.length} new file(s) ready to upload
                </div>
              )}

              {formData.image_urls && formData.image_urls.length > 0 && (
                <div className="mt-4 grid grid-cols-4 gap-2">
                  {formData.image_urls.map((imageUrl, index) => (
                    <div key={index} className="relative aspect-square rounded-xl overflow-hidden group border border-slate-200 dark:border-slate-700">
                      <img src={imageUrl} alt="School" className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                      <button
                        type="button"
                        onClick={() => handleRemoveExistingImage(imageUrl)}
                        className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-transform hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:scale-95 flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                t("save")
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-6 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold py-3 rounded-xl transition-all disabled:opacity-50"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
