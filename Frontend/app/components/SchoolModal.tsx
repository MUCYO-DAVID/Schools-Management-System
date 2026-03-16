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
        nameRw: school.nameRw,
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
    }
  }, [school]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...formData, image_urls: formData.image_urls.filter(url => !imagesToDelete.includes(url)) }, selectedFiles, imagesToDelete);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">{school ? t("editSchool") : t("addSchool")}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("schoolName")} (English)</label>
            <input
              aria-label=""
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("schoolName")} (Kinyarwanda)</label>
            <input
              type="text"
              name="nameRw"
              value={formData.nameRw}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("location")}</label>
            <div className="space-y-2">
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="Enter school address or pick on map"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowMapPicker(!showMapPicker)}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors text-sm"
              >
                <MapPin className="w-4 h-4" />
                {showMapPicker ? "Hide Map" : "Pick Location on Map"}
              </button>
            </div>
          </div>

          {/* Simple Map Picker using Google Maps embed */}
          {showMapPicker && (
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 space-y-3">
              <p className="text-sm text-gray-700 font-medium">
                Click on the map to select school location
              </p>
              <div className="relative w-full h-96 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}&z=15&output=embed`}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="School Location Map"
                ></iframe>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.latitude || -1.9441}
                    onChange={(e) => {
                      const lat = parseFloat(e.target.value) || -1.9441;
                      handleMapClick(lat, formData.longitude || 30.0619);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="0.000001"
                    value={formData.longitude || 30.0619}
                    onChange={(e) => {
                      const lng = parseFloat(e.target.value) || 30.0619;
                      handleMapClick(formData.latitude || -1.9441, lng);
                    }}
                    className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                💡 Tip: Adjust the latitude and longitude values to precisely set the school location
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("type")}</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Public">{t("public")}</option>
              <option value="Private">{t("private")}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("level")}</label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Primary">{t("primary")}</option>
              <option value="Secondary">{t("secondary")}</option>
              <option value="Primary & Secondary">Primary & Secondary</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("students")}</label>
            <input
              type="number"
              name="students"
              value={formData.students}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t("established")}</label>
            <input
              type="number"
              name="established"
              value={formData.established}
              onChange={handleChange}
              min="1900"
              max={new Date().getFullYear()}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">School Images</label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {selectedFiles.length > 0 && (
              <p className="text-sm text-gray-500 mt-1">{selectedFiles.length} file(s) selected</p>
            )}
            {formData.image_urls && formData.image_urls.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {formData.image_urls.map((imageUrl, index) => (
                  <div key={index} className="relative w-24 h-24 rounded-lg overflow-hidden">
                    <img src={imageUrl} alt="School" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveExistingImage(imageUrl)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 py-2 px-4 rounded-lg transition-colors"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
