
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export type MapLayerType = 'satellite' | 'streets' | 'dark';

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  layer?: MapLayerType;
}

const TILE_LAYERS = {
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png',
};

const ATTRIBUTIONS = {
  satellite: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
  streets: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  dark: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
};

export default function LeafletMap({ center, zoom, layer = 'satellite' }: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false,
        attributionControl: false,
        scrollWheelZoom: false,
        dragging: false,
        doubleClickZoom: false,
        boxZoom: false,
        touchZoom: false,
        keyboard: false,
        tap: false,
      }).setView(center, zoom);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
        tileLayerInstance.current = null;
      }
    };
  }, [center, zoom]);

  // Handle Layer Changes
  useEffect(() => {
    if (mapInstance.current) {
      if (tileLayerInstance.current) {
        mapInstance.current.removeLayer(tileLayerInstance.current);
      }

      tileLayerInstance.current = L.tileLayer(TILE_LAYERS[layer], {
        maxZoom: 19,
        attribution: ATTRIBUTIONS[layer],
      }).addTo(mapInstance.current);
    }
  }, [layer]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapRef} className="w-full h-full z-0 grayscale-[0.2] contrast-[1.1]" />
      <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-10" />
    </div>
  );
}
