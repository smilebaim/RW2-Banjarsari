
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

if (typeof window !== 'undefined') {
  // @ts-ignore
  import('leaflet-draw');
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}

export type MapLayerType = 'satellite' | 'streets';

export interface MapObject {
  id: string;
  name: string;
  description?: string;
  category?: string;
  color?: string;
  icon?: string;
  imageUrl?: string;
  coords: any;
  type: 'polygon' | 'line' | 'marker';
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  layer?: MapLayerType;
  showBoundary?: boolean;
  showPolygons?: boolean;
  showLines?: boolean;
  showMarkers?: boolean;
  editable?: boolean;
  polygonsData?: MapObject[];
  linesData?: MapObject[];
  markersData?: MapObject[];
  onDataChange?: (data: { 
    polygons: MapObject[], 
    lines: MapObject[], 
    markers: MapObject[] 
  }) => void;
  locked?: boolean;
}

const TILE_LAYERS = {
  satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  streets: 'https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png',
};

const getIconSVG = (iconName: string = 'pin', color: string = '#ef4444') => {
  const icons: Record<string, string> = {
    pin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
    home: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    hospital: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M14 9v4"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>`,
    droplet: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    trees: `<path d="M10 10v.01"/><path d="M14 10v.01"/><path d="M10 14v.01"/><path d="M14 14v.01"/><path d="M18 10h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1"/><path d="M12 2v8"/><path d="M9 2h6"/>`,
    school: `<path d="M12 3 2 8.2l10 5.2 10-5.2Z"/><path d="M22 11v6"/><path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5"/>`,
    shopping: `<circle cx="6" cy="19" r="2"/><circle cx="17" cy="19" r="2"/><path d="M17 17H6V3H4"/><path d="M6 5h15l-2 7H6"/>`,
    dining: `<path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/>`,
    cctv: `<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/><circle cx="12" cy="10" r="3"/>`,
    wifi: `<path d="M5 12.55a11 11 0 0 1 14.08 0"/><path d="M1.42 9a16 16 0 0 1 21.16 0"/><path d="M8.53 16.11a6 6 0 0 1 6.95 0"/><line x1="12" y1="20" x2="12.01" y2="20"/>`,
    trash: `<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>`,
    parking: `<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/>`,
    social: `<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>`,
    office: `<rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>`
  };
  const path = icons[iconName] || icons.pin;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
};

const createLeafletIcon = (iconName: string = 'pin', color: string = '#ef4444') => {
  if (typeof window === 'undefined') return L.divIcon();
  return L.divIcon({
    html: `
      <div class="relative flex flex-col items-center group">
        <div class="flex items-center justify-center w-10 h-10 bg-black/80 backdrop-blur-md rounded-2xl transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-110 shadow-2xl border border-white/20">
          ${getIconSVG(iconName, color)}
        </div>
        <div class="w-2 h-2 rounded-full mt-2 animate-pulse" style="background-color: ${color}; box-shadow: 0 0 15px ${color};"></div>
      </div>
    `,
    className: 'custom-map-icon',
    iconSize: [40, 52],
    iconAnchor: [20, 52]
  });
};

export default function LeafletMap({ 
  center, 
  zoom, 
  layer = 'satellite', 
  showBoundary = true, 
  showPolygons = true,
  showLines = true,
  showMarkers = true,
  editable = false,
  polygonsData = [],
  linesData = [],
  markersData = [],
  onDataChange,
  locked = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);
  const featureGroupInstance = useRef<L.FeatureGroup | null>(null);
  const drawItems = useRef<L.FeatureGroup | null>(null);

  const handleDrawChange = () => {
    if (!drawItems.current || !onDataChange) return;
    const layers = drawItems.current.getLayers();
    
    const polygons: MapObject[] = [];
    const lines: MapObject[] = [];
    const markers: MapObject[] = [];

    layers.forEach((l: any, index: number) => {
      const existingId = l.options.id || `obj-${Date.now()}-${index}`;
      const existingName = l.options.name || 'Objek Baru';
      const existingDesc = l.options.description || '';
      const existingCat = l.options.category || 'Lainnya';
      const existingColor = l.options.color || (l instanceof L.Marker ? '#ef4444' : (l instanceof L.Polygon ? '#22c55e' : '#3b82f6'));
      const existingIconName = l.options.iconName || 'pin';
      const existingImageUrl = l.options.imageUrl || '';

      if (l instanceof L.Polygon && !(l instanceof L.Rectangle)) {
        const latlngs = l.getLatLngs();
        const coords = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map((ll: any) => [ll.lat, ll.lng]);
        polygons.push({ id: existingId, name: existingName, description: existingDesc, category: existingCat, color: existingColor, imageUrl: existingImageUrl, coords, type: 'polygon' });
      } else if (l instanceof L.Polyline && !(l instanceof L.Polygon)) {
        const latlngs = l.getLatLngs();
        const coords = (latlngs as any).map((ll: any) => [ll.lat, ll.lng]);
        lines.push({ id: existingId, name: existingName, description: existingDesc, category: existingCat, color: existingColor, imageUrl: existingImageUrl, coords, type: 'line' });
      } else if (l instanceof L.Marker) {
        const ll = l.getLatLng();
        markers.push({ id: existingId, name: existingName, description: existingDesc, category: existingCat, color: existingColor, icon: existingIconName, imageUrl: existingImageUrl, coords: [ll.lat, ll.lng], type: 'marker' });
      }
    });

    onDataChange({ polygons, lines, markers });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: false, 
        attributionControl: false,
        scrollWheelZoom: !locked,
        dragging: !locked,
      }).setView(center, zoom);

      drawItems.current = new L.FeatureGroup().addTo(mapInstance.current);
      featureGroupInstance.current = new L.FeatureGroup().addTo(mapInstance.current);

      if (editable) {
        // @ts-ignore
        const drawControl = new L.Control.Draw({
          edit: { featureGroup: drawItems.current, poly: { allowIntersection: false } },
          draw: {
            polygon: { allowIntersection: false, shapeOptions: { color: '#22c55e', fillOpacity: 0.3, weight: 3 } },
            polyline: { shapeOptions: { color: '#3b82f6', weight: 5 } },
            marker: { icon: createLeafletIcon('pin', '#ef4444') },
            circle: false, rectangle: false, circlemarker: false
          }
        });
        mapInstance.current.addControl(drawControl);
        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          const type = layer instanceof L.Polygon ? 'polygon' : layer instanceof L.Marker ? 'marker' : 'line';
          layer.options.id = `obj-${Date.now()}`;
          layer.options.name = type === 'polygon' ? 'Area Baru' : type === 'marker' ? 'Lokasi Baru' : 'Jalur Baru';
          layer.options.color = type === 'polygon' ? '#22c55e' : type === 'line' ? '#3b82f6' : '#ef4444';
          if (type === 'marker') layer.options.iconName = 'pin';
          drawItems.current?.addLayer(layer);
          handleDrawChange();
        });
        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.EDITED, handleDrawChange);
        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.DELETED, handleDrawChange);
      }

      setTimeout(() => mapInstance.current?.invalidateSize(), 250);
    }
    return () => {
      if (mapInstance.current) {
        mapInstance.current.off();
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom, editable, locked]);

  useEffect(() => {
    if (mapInstance.current) {
      mapInstance.current.flyTo(center, zoom, { duration: 1.5 });
    }
  }, [center, zoom]);

  useEffect(() => {
    if (mapInstance.current) {
      if (tileLayerInstance.current) mapInstance.current.removeLayer(tileLayerInstance.current);
      tileLayerInstance.current = L.tileLayer(TILE_LAYERS[layer], {
        maxZoom: 19,
      }).addTo(mapInstance.current);
    }
  }, [layer]);

  useEffect(() => {
    if (!mapInstance.current) return;

    const createPopup = (item: MapObject) => {
      const accentColor = item.color || '#22c55e';
      return `
        <div class="p-0 min-w-[320px] bg-black/80 text-white rounded-[2rem] shadow-2xl backdrop-blur-3xl overflow-hidden border border-white/20">
          <div class="h-2 w-full" style="background-color: ${accentColor}; shadow: 0 0 20px ${accentColor};"></div>
          ${item.imageUrl ? `
            <div class="relative h-48 w-full overflow-hidden">
              <img src="${item.imageUrl}" class="w-full h-full object-cover" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
            </div>
          ` : ''}
          <div class="p-8">
            <div class="flex items-center justify-between mb-6">
              <span class="text-[9px] font-black uppercase tracking-[0.3em] bg-white/10 text-white/90 px-4 py-2 rounded-xl">
                ${item.category || 'INFRASTRUKTUR'}
              </span>
              <div class="h-2 w-2 rounded-full animate-pulse" style="background-color: ${accentColor};"></div>
            </div>
            <h4 class="font-black text-white uppercase text-2xl mb-4 tracking-tighter leading-none">${item.name}</h4>
            ${item.description ? `
              <div class="space-y-2 mt-6 pt-6 border-t border-white/10">
                <span class="text-[8px] font-bold text-white/40 uppercase tracking-widest">Detail Wilayah</span>
                <p class="text-[12px] text-white/90 font-medium leading-relaxed italic">${item.description}</p>
              </div>
            ` : ''}
            <div class="mt-8 pt-6 border-t border-white/10 flex items-center justify-between">
               <span class="text-[8px] font-black text-white/20 uppercase tracking-[0.5em] font-mono">SYS // ${item.id.substring(0, 8)}</span>
               <span class="text-[8px] font-black text-primary/50 uppercase tracking-[0.2em]">RW 02 CONNECT</span>
            </div>
          </div>
        </div>
      `;
    };

    if (!editable && featureGroupInstance.current) {
      featureGroupInstance.current.clearLayers();
      if (showPolygons) {
        polygonsData?.forEach(p => {
          if (p.coords?.length) L.polygon(p.coords, { color: p.color || '#22c55e', fillOpacity: 0.2, weight: 3, dashArray: '5, 10' }).bindPopup(createPopup(p)).addTo(featureGroupInstance.current!);
        });
      }
      if (showLines) {
        linesData?.forEach(l => {
          if (l.coords?.length) L.polyline(l.coords, { color: l.color || '#3b82f6', weight: 5 }).bindPopup(createPopup(l)).addTo(featureGroupInstance.current!);
        });
      }
      if (showMarkers) {
        markersData?.forEach(m => {
          if (m.coords) {
            const markerIcon = createLeafletIcon(m.icon, m.color);
            L.marker(m.coords as any, { icon: markerIcon }).bindPopup(createPopup(m)).addTo(featureGroupInstance.current!);
          }
        });
      }
    } else if (drawItems.current && editable) {
      // In editing mode, we manually sync drawItems with the incoming props if drawItems is empty
      if (drawItems.current.getLayers().length === 0) {
        polygonsData?.forEach(poly => {
          const p = L.polygon(poly.coords as any, { color: poly.color || '#22c55e', fillOpacity: 0.3, weight: 3 });
          p.options.id = poly.id; p.options.name = poly.name; p.options.description = poly.description; p.options.category = poly.category; p.options.color = poly.color; p.options.imageUrl = poly.imageUrl;
          p.addTo(drawItems.current!);
        });
        linesData?.forEach(item => {
          const l = L.polyline(item.coords as any, { color: item.color || '#3b82f6', weight: 5 });
          l.options.id = item.id; l.options.name = item.name; l.options.description = item.description; l.options.category = item.category; l.options.color = item.color; l.options.imageUrl = item.imageUrl;
          l.addTo(drawItems.current!);
        });
        markersData?.forEach(item => {
          const mIcon = createLeafletIcon(item.icon, item.color);
          const m = L.marker(item.coords as any, { icon: mIcon });
          m.options.id = item.id; m.options.name = item.name; m.options.description = item.description; m.options.category = item.category; m.options.color = item.color; m.options.iconName = item.icon; m.options.imageUrl = item.imageUrl;
          m.addTo(drawItems.current!);
        });
      }
    }
  }, [showPolygons, showLines, showMarkers, polygonsData, linesData, markersData, editable]);

  return (
    <>
      <style>{`
        .leaflet-popup-content-wrapper {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
        }
        .leaflet-popup-tip-container { display: none !important; }
        .leaflet-popup-content { margin: 0 !important; border: none !important; }
        .leaflet-container a.leaflet-popup-close-button {
          color: rgba(255,255,255,0.5) !important;
          padding: 20px !important;
          font-size: 24px !important;
        }
        .custom-map-icon { background: transparent !important; border: none !important; }
        .leaflet-draw-toolbar a {
          background-color: rgba(0,0,0,0.8) !important;
          border-bottom: 1px solid rgba(255,255,255,0.1) !important;
          color: white !important;
        }
        .leaflet-draw-toolbar .leaflet-draw-draw-polygon { background-position: -31px -2px !important; }
        .leaflet-draw-toolbar .leaflet-draw-draw-polyline { background-position: -2px -2px !important; }
        .leaflet-draw-toolbar .leaflet-draw-draw-marker { background-position: -122px -2px !important; }
      `}</style>
      <div ref={mapRef} className="w-full h-full relative overflow-hidden" />
    </>
  );
}
