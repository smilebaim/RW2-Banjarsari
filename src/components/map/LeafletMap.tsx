
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
}

export default function LeafletMap({ center, zoom }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      // Initialize map with full locking options for a "Locked" feel
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false, // Map is locked, cannot be dragged
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false,
        keyboard: false,
        tap: false,
      }).setView(center, zoom);

      // Satellite Imagery (Esri World Imagery)
      L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 19,
        attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
      }).addTo(mapInstance.current);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapRef} className="w-full h-full z-0 grayscale-[0.2] contrast-[1.1]" />
      {/* Cinematic Color Grading Overlay */}
      <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-10" />
    </div>
  );
}
