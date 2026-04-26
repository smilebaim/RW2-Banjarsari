
'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';

// Importing leaflet-draw only on client side
if (typeof window !== 'undefined') {
  require('leaflet-draw');
}

export type MapLayerType = 'satellite' | 'streets' | 'dark';

interface LeafletMapProps {
  center: [number, number];
  zoom: number;
  layer?: MapLayerType;
  showBoundary?: boolean;
  editable?: boolean;
  polygonCoords?: [number, number][];
  onPolygonChange?: (coords: [number, number][]) => void;
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
  showBoundary = false, 
  editable = false,
  polygonCoords,
  onPolygonChange,
  locked = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<L.Map | null>(null);
  const tileLayerInstance = useRef<L.TileLayer | null>(null);
  const boundaryInstance = useRef<L.Polygon | null>(null);
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

      if (editable) {
        const drawControl = new (L as any).Control.Draw({
          edit: {
            featureGroup: drawItems.current,
            poly: {
              allowIntersection: false
            }
          },
          draw: {
            polygon: {
              allowIntersection: false,
              showArea: true,
              drawError: {
                color: '#e11d48',
                message: '<strong>Error:<strong> Garis tidak boleh berpotongan!'
              },
              shapeOptions: {
                color: '#22c55e'
              }
            },
            polyline: false,
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false
          }
        });

        mapInstance.current.addControl(drawControl);

        const handleDrawChange = () => {
          if (!drawItems.current) return;
          const layers = drawItems.current.getLayers();
          if (layers.length > 0) {
            const layer = layers[0] as L.Polygon;
            const latlngs = layer.getLatLngs();
            // Handle multi-dimensional array from getLatLngs() for polygons
            const coords = (Array.isArray(latlngs[0]) ? latlngs[0] : latlngs).map((ll: any) => [ll.lat, ll.lng]);
            onPolygonChange?.(coords as [number, number][]);
          } else {
            onPolygonChange?.([]);
          }
        };

        mapInstance.current.on((L as any).Draw.Event.CREATED, (e: any) => {
          const layer = e.layer;
          drawItems.current?.clearLayers();
          drawItems.current?.addLayer(layer);
          handleDrawChange();
        });

        mapInstance.current.on((L as any).Draw.Event.EDITED, () => {
          handleDrawChange();
        });

        mapInstance.current.on((L as any).Draw.Event.DELETED, () => {
          handleDrawChange();
        });
      }
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

  // Sync Polygon Data
  useEffect(() => {
    if (!mapInstance.current) return;

    if (!editable) {
      // Non-editable view (Public or Dashboard Summary)
      if (boundaryInstance.current) {
        mapInstance.current.removeLayer(boundaryInstance.current);
        boundaryInstance.current = null;
      }

      if (showBoundary && polygonCoords && polygonCoords.length > 0) {
        boundaryInstance.current = L.polygon(polygonCoords as any, {
          color: '#22c55e',
          fillColor: '#22c55e',
          fillOpacity: 0.2,
          weight: 3,
          dashArray: '5, 10'
        }).addTo(mapInstance.current);
      }
    } else if (drawItems.current) {
      // Editable mode
      const currentLayers = drawItems.current.getLayers();
      
      // If no layers in feature group but we have coords, populate it
      if (currentLayers.length === 0 && polygonCoords && polygonCoords.length > 0) {
        const poly = L.polygon(polygonCoords as any, {
          color: '#22c55e'
        });
        drawItems.current.addLayer(poly);
      } 
      // If we have coords in props and they differ from what's in drawItems (e.g. after a reset)
      // we don't want to force sync because user is currently drawing.
      // But we can clear it if polygonCoords becomes empty from outside
      if ((!polygonCoords || polygonCoords.length === 0) && currentLayers.length > 0) {
        drawItems.current.clearLayers();
      }
    }
  }, [showBoundary, polygonCoords, editable]);

  return (
    <div className="w-full h-full relative group">
      <div ref={mapRef} className="w-full h-full z-0 contrast-[1.1]" />
      {!editable && <div className="absolute inset-0 pointer-events-none bg-primary/5 mix-blend-overlay z-10" />}
    </div>
  );
}
