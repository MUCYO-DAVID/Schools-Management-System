"use client"

import { useEffect, useRef, useState } from "react"
import { MapPin, Navigation2, Loader2 } from "lucide-react"
import type { School } from "../types"

interface InteractiveSchoolMapProps {
  schools: School[]
  userLocation?: { lat: number; lng: number } | null
  height?: string
}

export default function InteractiveSchoolMap({
  schools,
  userLocation,
  height = "500px",
}: InteractiveSchoolMapProps) {
  const mapRef = useRef<HTMLDivElement | null>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedSchool, setSelectedSchool] = useState<School | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Only run on client side
    if (typeof window === "undefined") return
    
    // Ensure mapRef is available
    if (!mapRef.current) {
      console.error("Map container ref is not available")
      setError("Map container not found")
      setIsLoading(false)
      return
    }

    // If map already exists, don't reinitialize
    if (mapInstanceRef.current) {
      return
    }

    let L: any
    let map: any
    let userMarker: any
    let schoolMarkers: any[] = []

    const initMap = async () => {
      try {
        // Check if we have schools with coordinates
        const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude)
        
        if (schoolsWithCoords.length === 0 && !userLocation) {
          setError("No schools with location data available. Schools need latitude and longitude coordinates to display on the map.")
          setIsLoading(false)
          return
        }

        // Dynamically import Leaflet
        L = (await import("leaflet")).default

        // Fix icon paths for Next.js
        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        })

        // Load Leaflet CSS
        if (!document.querySelector('link[href*="leaflet.css"]')) {
          const link = document.createElement("link")
          link.rel = "stylesheet"
          link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          document.head.appendChild(link)
        }

        // Ensure map container still exists
        if (!mapRef.current) {
          setError("Map container not found")
          setIsLoading(false)
          return
        }

        // Create map - default to Kigali, Rwanda
        const defaultCenter = userLocation || { lat: -1.9441, lng: 30.0619 }
        map = L.map(mapRef.current, {
          zoomControl: true,
          attributionControl: true
        }).setView([defaultCenter.lat, defaultCenter.lng], userLocation ? 12 : 11)
        mapInstanceRef.current = map

        // Add tile layer (OpenStreetMap)
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map)

        // Custom icon for user location
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `<div style="background: #3b82f6; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
          iconSize: [24, 24],
          iconAnchor: [12, 12],
        })

        // Custom icon for schools
        const schoolIcon = L.divIcon({
          className: 'custom-school-marker',
          html: `<div style="background: #ef4444; width: 32px; height: 32px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center;">
            <div style="transform: rotate(45deg); color: white; font-size: 16px;">📚</div>
          </div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        })

        // Add user location marker
        if (userLocation) {
          userMarker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
            .addTo(map)
            .bindPopup("<b>Your Location</b>")
        }

        // Add school markers
        const bounds: any[] = []
        
        schoolsWithCoords.forEach((school) => {
          const marker = L.marker([school.latitude, school.longitude], { icon: schoolIcon })
            .addTo(map)
            .bindPopup(`
              <div style="min-width: 200px;">
                <h3 style="font-weight: bold; font-size: 16px; margin-bottom: 8px;">${school.name}</h3>
                <p style="font-size: 12px; color: #666; margin-bottom: 4px;">
                  📍 ${school.location}
                </p>
                ${school.distance ? `<p style="font-size: 12px; color: #666; margin-bottom: 4px;">
                  🚗 ${school.distance.toFixed(1)} km away
                </p>` : ''}
                <div style="display: flex; gap: 4px; margin-bottom: 8px; flex-wrap: wrap;">
                  <span style="background: #dbeafe; color: #1e40af; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${school.type}</span>
                  <span style="background: #dcfce7; color: #166534; padding: 2px 8px; border-radius: 12px; font-size: 11px;">${school.level}</span>
                </div>
                ${school.students ? `<p style="font-size: 12px; color: #666;">👥 ${school.students} students</p>` : ''}
                ${userLocation ? `
                  <button onclick="window.open('https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${school.latitude},${school.longitude}', '_blank')" 
                    style="margin-top: 8px; background: #3b82f6; color: white; padding: 6px 12px; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; width: 100%;">
                    🧭 Get Directions
                  </button>
                ` : ''}
              </div>
            `)

          marker.on('click', () => {
            setSelectedSchool(school)
          })

          schoolMarkers.push(marker)
          bounds.push([school.latitude, school.longitude])
        })

        // Add user location to bounds
        if (userLocation) {
          bounds.push([userLocation.lat, userLocation.lng])
        }

        // Fit map to show all markers, or use default zoom if no markers
        if (bounds.length > 0 && map && mapRef.current) {
          try {
            // Use setTimeout to ensure map is fully initialized
            setTimeout(() => {
              if (map && mapRef.current && !map._destroyed) {
                try {
                  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 })
                } catch (e) {
                  console.warn("Error fitting bounds:", e)
                  // Fallback to center view
                  const center = userLocation || { lat: -1.9441, lng: 30.0619 }
                  map.setView([center.lat, center.lng], 12)
                }
              }
            }, 100)
          } catch (e) {
            console.warn("Error in fitBounds timeout:", e)
            // Fallback to center view
            const center = userLocation || { lat: -1.9441, lng: 30.0619 }
            if (map && mapRef.current) {
              map.setView([center.lat, center.lng], 12)
            }
          }
        }

        setIsLoading(false)
        setError(null)
      } catch (error) {
        console.error("Error initializing map:", error)
        setError("Failed to load map. Please refresh the page.")
        setIsLoading(false)
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        try {
          // Check if map container still exists before removing
          if (mapRef.current && mapInstanceRef.current._container) {
            mapInstanceRef.current.remove()
          }
        } catch (error) {
          console.warn('Error cleaning up map:', error)
        } finally {
          mapInstanceRef.current = null
        }
      }
    }
  }, [schools, userLocation])

  // Filter schools with coordinates
  const schoolsWithCoords = schools.filter(s => s.latitude && s.longitude)
  const schoolsWithoutCoords = schools.filter(s => !s.latitude || !s.longitude)

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Loading interactive map...</p>
          </div>
        </div>
      )}

      {error && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-lg z-10">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600 mb-2">{error}</p>
            {schoolsWithoutCoords.length > 0 && (
              <p className="text-xs text-gray-500">
                {schoolsWithoutCoords.length} school{schoolsWithoutCoords.length !== 1 ? 's' : ''} need{schoolsWithoutCoords.length === 1 ? 's' : ''} location coordinates to appear on the map.
              </p>
            )}
          </div>
        </div>
      )}
      
      <div
        ref={mapRef}
        style={{ height, width: "100%" }}
        className="rounded-lg shadow-lg border border-gray-200"
      />

      {/* Map Legend */}
      {!error && !isLoading && (
        <>
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000]">
            <div className="font-semibold mb-2">Map Legend</div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white"></div>
              <span>Your Location</span>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
              <span>Schools ({schoolsWithCoords.length})</span>
            </div>
            {schoolsWithoutCoords.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-gray-500 text-[10px]">
                  ⚠️ {schoolsWithoutCoords.length} school{schoolsWithoutCoords.length !== 1 ? 's' : ''} hidden (no coordinates)
                </p>
              </div>
            )}
          </div>

          {/* Map Controls Info */}
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 text-xs z-[1000] max-w-xs">
            <div className="font-semibold mb-1">🗺️ Map Controls</div>
            <ul className="space-y-1 text-gray-600">
              <li>• Click markers for details</li>
              <li>• Use + / - to zoom</li>
              <li>• Drag to move around</li>
              <li>• Click "Get Directions" for routes</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
