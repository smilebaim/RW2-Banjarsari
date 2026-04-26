'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Fix for default marker icons in Leaflet
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

export type MapLayerType = 'satellite' | 'streets' | 'dark';

export interface MapObject {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  coords: any;
  type: 'polygon' | 'line' | 'marker';
}

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  layer?: MapLayerType;
  showBoundary?: boolean;
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
  dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{y}/{x}{r}.png',
};

const ATTRIBUTIONS = {
  satellite: 'Tiles &copy; Esri',
  streets: '&copy; OpenStreetMap',
  dark: '&copy; OpenStreetMap &copy; CARTO',
};

// Helper to get SVG for specific icons
const getIconSVG = (iconName: string = 'pin', color: string = '#ef4444') => {
  const icons: Record<string, string> = {
    pin: `<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>`,
    home: `<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>`,
    info: `<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>`,
    shield: `<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>`,
    hospital: `<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M14 9v4"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>`,
    droplet: `<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5s-3 3.5-3 5.5a7 7 0 0 0 7 7z"/>`,
    zap: `<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>`,
    trees: `<path d="M10 10v.01"/><path d="M14 10v.01"/><path d="M10 14v.01"/><path d="M14 14v.01"/><path d="M18 10h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h1"/><path d="M12 2v8"/><path d="M9 2h6"/>`
  };

  const path = icons[iconName] || icons.pin;
  return `
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${iconName}">
      ${path}
    </svg>
  `;
};

export default function LeafletMap({ 
  center, 
  zoom, 
  layer = 'satellite', 
  showBoundary = true, 
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
      const existingName = l.options.name || 'Objek Tanpa Nama';
      const existingDesc = l.options.description || '';
      const existingColor = l.options.color || (l instanceof L.Marker ? '#ef4444' : '#22c55e');
      const existingIcon = l.options.icon || 'pin';

      if (l instanceof L.Polygon && !(l instanceof L.Rectangle)) {
        const latlngs = l.getLatLngs();
        const coords = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map((ll: any) => [ll.lat, ll.lng]);
        polygons.push({ id: existingId, name: existingName, description: existingDesc, color: existingColor, coords, type: 'polygon' });
      } else if (l instanceof L.Polyline && !(l instanceof L.Polygon)) {
        const latlngs = l.getLatLngs();
        const coords = (latlngs as any).map((ll: any) => [ll.lat, ll.lng]);
        lines.push({ id: existingId, name: existingName, description: existingDesc, color: existingColor, coords, type: 'line' });
      } else if (l instanceof L.Marker) {
        const ll = l.getLatLng();
        markers.push({ id: existingId, name: existingName, description: existingDesc, color: existingColor, icon: existingIcon, coords: [ll.lat, ll.lng], type: 'marker' });
      }
    });

    onDataChange({ polygons, lines, markers });
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: !locked,
        attributionControl: false,
        scrollWheelZoom: !locked,
        dragging: !locked,
      }).setView(center, zoom);

      drawItems.current = new L.FeatureGroup().addTo(mapInstance.current);
      featureGroupInstance.current = new L.FeatureGroup().addTo(mapInstance.current);

      if (editable) {
        // @ts-ignore
        const drawControl = new L.Control.Draw({
          edit: {
            featureGroup: drawItems.current,
            poly: { allowIntersection: false }
          },
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              shapeOptions: { color: '#22c55e', fillOpacity: 0.3 }
            },
            polyline: {
              shapeOptions: { color: '#3b82f6', weight: 4 }
            },
            marker: true,
            circle: false,
            rectangle: false,
            circlemarker: false
          }
        });

        mapInstance.current.addControl(drawControl);

        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          const type = layer instanceof L.Polygon ? 'polygon' : layer instanceof L.Marker ? 'marker' : 'line';
          layer.options.id = `obj-${Date.now()}`;
          layer.options.name = type === 'polygon' ? 'Area Baru' : type === 'marker' ? 'Lokasi Baru' : 'Jalur Baru';
          layer.options.description = '';
          layer.options.color = type === 'polygon' ? '#22c55e' : type === 'line' ? '#3b82f6' : '#ef4444';
          layer.options.icon = 'pin';
          drawItems.current?.addLayer(layer);
          handleDrawChange();
        });

        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.EDITED, handleDrawChange);
        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.DELETED, handleDrawChange);
      }

      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 200);
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
      if (tileLayerInstance.current) {
        mapInstance.current.removeLayer(tileLayerInstance.current);
      }
      tileLayerInstance.current = L.tileLayer(TILE_LAYERS[layer], {
        maxZoom: 19,
        attribution: ATTRIBUTIONS[layer],
      }).addTo(mapInstance.current);
    }
  }, [layer]);

  useEffect(() => {
    if (!mapInstance.current) return;

    const createPopupContent = (name: string, desc?: string) => {
      return `
        <div class="p-3 min-w-[200px]">
          <h4 class="font-black text-primary uppercase text-sm mb-1">${name}</h4>
          ${desc ? `<p class="text-xs text-muted-foreground font-medium italic">${desc}</p>` : ''}
        </div>
      `;
    };

    const createIcon = (iconName: string = 'pin', color: string = '#ef4444') => {
      return L.divIcon({
        html: `
          <div class="flex items-center justify-center w-10 h-10 bg-white rounded-2xl shadow-xl border-2 border-white transform -translate-x-1/2 -translate-y-1/2">
            ${getIconSVG(iconName, color)}
          </div>
        `,
        className: 'custom-map-icon',
        iconSize: [40, 40],
        iconAnchor: [20, 20]
      });
    };

    if (!editable && featureGroupInstance.current) {
      featureGroupInstance.current.clearLayers();
      if (!showBoundary) return;

      polygonsData?.forEach(poly => {
        if (poly.coords && poly.coords.length > 0) {
          L.polygon(poly.coords as any, {
            color: poly.color || '#22c55e',
            fillColor: poly.color || '#22c55e',
            fillOpacity: 0.2,
            weight: 3,
            dashArray: '5, 10'
          })
          .bindPopup(createPopupContent(poly.name, poly.description))
          .addTo(featureGroupInstance.current!);
        }
      });

      linesData?.forEach(item => {
        L.polyline(item.coords as any, { 
          color: item.color || '#3b82f6', 
          weight: 4 
        })
        .bindPopup(createPopupContent(item.name, item.description))
        .addTo(featureGroupInstance.current!);
      });

      markersData?.forEach(item => {
        L.marker(item.coords as any, {
          icon: createIcon(item.icon, item.color)
        })
        .bindPopup(createPopupContent(item.name, item.description))
        .addTo(featureGroupInstance.current!);
      });

    } else if (drawItems.current && editable) {
      const currentLayers = drawItems.current.getLayers();
      if (currentLayers.length === 0) {
        polygonsData?.forEach(poly => {
          const p = L.polygon(poly.coords as any, { color: poly.color || '#22c55e', fillOpacity: 0.3 });
          // @ts-ignore
          p.options.id = poly.id; 
          p.options.name = poly.name; 
          p.options.description = poly.description;
          p.options.color = poly.color;
          p.addTo(drawItems.current!);
        });
        linesData?.forEach(item => {
          const l = L.polyline(item.coords as any, { color: item.color || '#3b82f6', weight: 4 });
          // @ts-ignore
          l.options.id = item.id; 
          l.options.name = item.name; 
          l.options.description = item.description;
          l.options.color = item.color;
          l.addTo(drawItems.current!);
        });
        markersData?.forEach(item => {
          const m = L.marker(item.coords as any, {
            icon: createIcon(item.icon, item.color)
          });
          // @ts-ignore
          m.options.id = item.id; 
          m.options.name = item.name; 
          m.options.description = item.description;
          m.options.color = item.color;
          m.options.icon = item.icon;
          m.addTo(drawItems.current!);
        });
      }
    }
  }, [showBoundary, polygonsData, linesData, markersData, editable]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-secondary/5">
      <div ref={mapRef} className="w-full h-full z-0 contrast-[1.1]" />
      {!editable && <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-[10]" />}
    </div>
  );
}
