
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

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  layer?: MapLayerType;
  showBoundary?: boolean;
  editable?: boolean;
  polygonCoords?: [number, number][];
  lineCoords?: [number, number][][];
  markerCoords?: [number, number][];
  onDataChange?: (data: { 
    polygon: [number, number][], 
    lines: [number, number][][], 
    markers: [number, number][] 
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

export default function LeafletMap({ 
  center, 
  zoom, 
  layer = 'satellite', 
  showBoundary = true, 
  editable = false,
  polygonCoords = [],
  lineCoords = [],
  markerCoords = [],
  onDataChange,
  locked = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);
  const featureGroupInstance = useRef<L.FeatureGroup | null>(null);
  const drawItems = useRef<L.FeatureGroup | null>(null);

  // Initialize Map
  useEffect(() => {
    if (typeof window !== 'undefined' && mapRef.current && !mapInstance.current) {
      mapInstance.current = L.map(mapRef.current, {
        zoomControl: !locked,
        attributionControl: false,
        scrollWheelZoom: !locked,
        dragging: !locked,
        doubleClickZoom: !locked,
        boxZoom: !locked,
        touchZoom: !locked,
        keyboard: !locked,
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

        const handleDrawChange = () => {
          if (!drawItems.current) return;
          const layers = drawItems.current.getLayers();
          
          let polygon: [number, number][] = [];
          const lines: [number, number][][] = [];
          const markers: [number, number][] = [];

          layers.forEach((l: any) => {
            if (l instanceof L.Polygon && !(l instanceof L.Rectangle)) {
              const latlngs = l.getLatLngs();
              polygon = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map((ll: any) => [ll.lat, ll.lng]);
            } else if (l instanceof L.Polyline && !(l instanceof L.Polygon)) {
              const latlngs = l.getLatLngs();
              lines.push((latlngs as any).map((ll: any) => [ll.lat, ll.lng]));
            } else if (l instanceof L.Marker) {
              const ll = l.getLatLng();
              markers.push([ll.lat, ll.lng]);
            }
          });

          onDataChange?.({ polygon, lines, markers });
        };

        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          if (layer instanceof L.Polygon) {
             // Logic specific to app: we might only want one boundary or specific management
          }
          drawItems.current?.addLayer(layer);
          handleDrawChange();
        });

        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.EDITED, handleDrawChange);
        // @ts-ignore
        mapInstance.current.on(L.Draw.Event.DELETED, handleDrawChange);
      }

      // Important: force Leaflet to recalculate container size
      setTimeout(() => {
        mapInstance.current?.invalidateSize();
      }, 100);
    }

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [center, zoom, editable, locked]);

  // Handle Tile Layer updates
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

  // Sync Features
  useEffect(() => {
    if (!mapInstance.current) return;

    if (!editable && featureGroupInstance.current) {
      featureGroupInstance.current.clearLayers();
      if (!showBoundary) return;

      if (polygonCoords && polygonCoords.length > 0) {
        L.polygon(polygonCoords as any, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.2,
          weight: 3,
          dashArray: '5, 10'
        }).addTo(featureGroupInstance.current);
      }

      lineCoords?.forEach(coords => {
        L.polyline(coords as any, { color: '#3b82f6', weight: 4 }).addTo(featureGroupInstance.current);
      });

      markerCoords?.forEach(pos => {
        L.marker(pos as any).addTo(featureGroupInstance.current);
      });

    } else if (drawItems.current && editable) {
      const currentLayers = drawItems.current.getLayers();
      if (currentLayers.length === 0) {
        if (polygonCoords && polygonCoords.length > 0) {
          L.polygon(polygonCoords as any, { color: '#22c55e', fillOpacity: 0.3 }).addTo(drawItems.current);
        }
        lineCoords?.forEach(coords => {
          L.polyline(coords as any, { color: '#3b82f6', weight: 4 }).addTo(drawItems.current);
        });
        markerCoords?.forEach(pos => {
          L.marker(pos as any).addTo(drawItems.current);
        });
      }
    }
  }, [showBoundary, polygonCoords, lineCoords, markerCoords, editable]);

  return (
    <div className="w-full h-full relative overflow-hidden bg-secondary/5">
      <div ref={mapRef} className="w-full h-full z-0 contrast-[1.1]" />
      {!editable && <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-[10]" />}
    </div>
  );
}
