
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { 
  Layers, 
  Map as MapIcon, 
  Globe, 
  Moon, 
  Edit3,
  Check,
  X,
  AreaChart,
  Hexagon,
  Info,
  Loader2,
  Trash2,
  RefreshCcw,
  MapPin,
  Route,
  Type
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapObject } from '@/components/map/LeafletMap';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
  </div>,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

type MapLayer = 'satellite' | 'streets' | 'dark';

export function MapControlView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [showBoundary, setShowBoundary] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  
  const [tempData, setTempData] = useState<{
    polygon: MapObject | null,
    lines: MapObject[],
    markers: MapObject[]
  }>({
    polygon: null,
    lines: [],
    markers: []
  });

  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings, isLoading } = useDoc(mapSettingsRef);

  useEffect(() => {
    if (mapSettings) {
      const parseData = (val: any) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch (e) {
            return val;
          }
        }
        return val;
      };

      setTempData({
        polygon: parseData(mapSettings.polygon) || null,
        lines: parseData(mapSettings.lines) || [],
        markers: parseData(mapSettings.markers) || []
      });
    }
  }, [mapSettings]);

  const handleSaveMap = () => {
    // Use setDocumentNonBlocking with merge: true to avoid "permission-error" on non-existent documents or partial updates
    setDocumentNonBlocking(mapSettingsRef, {
      polygon: JSON.stringify(tempData.polygon),
      lines: JSON.stringify(tempData.lines),
      markers: JSON.stringify(tempData.markers),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setIsEditing(false);
    toast({
      title: "Peta Wilayah Diperbarui",
      description: "Semua elemen visual dan label telah disimpan.",
    });
  };

  const updateObjectName = (type: 'line' | 'marker' | 'polygon', id: string, newName: string) => {
    setTempData(prev => {
      if (type === 'polygon' && prev.polygon) {
        return { ...prev, polygon: { ...prev.polygon, name: newName } };
      }
      if (type === 'line') {
        return { ...prev, lines: prev.lines.map(l => l.id === id ? { ...l, name: newName } : l) };
      }
      if (type === 'marker') {
        return { ...prev, markers: prev.markers.map(m => m.id === id ? { ...m, name: newName } : m) };
      }
      return prev;
    });
  };

  const layers = [
    { id: 'satellite', label: 'Satelit', icon: Globe, description: 'Citra satelit resolusi tinggi' },
    { id: 'streets', label: 'Jalanan', icon: MapIcon, description: 'Peta jalan dan navigasi' },
    { id: 'dark', label: 'Mode Gelap', icon: Moon, description: 'Visualisasi malam hari' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Editor Infrastruktur Peta</h1>
          <p className="text-muted-foreground font-medium">Kelola batas, rute, dan label lokasi penting.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl gap-2 font-bold h-12 text-muted-foreground">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-2 font-bold h-12 px-6 text-white">
                <Check className="w-4 h-4" /> Simpan Perubahan
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-2 font-bold h-12 px-6">
              <Edit3 className="w-4 h-4" /> Buka Editor Peta
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[700px]">
        <div className="lg:col-span-8 h-full relative">
          <Card className="h-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white relative">
            <div className="absolute inset-0 z-0">
               {isLoading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40">Menyiapkan Mesin Peta...</p>
                 </div>
               ) : (
                 <LeafletMap 
                   key={isEditing ? 'editing' : 'viewing'}
                   center={COORDINATES} 
                   zoom={ZOOM_LEVEL} 
                   layer={activeLayer} 
                   showBoundary={showBoundary}
                   editable={isEditing}
                   polygonData={tempData.polygon}
                   linesData={tempData.lines}
                   markersData={tempData.markers}
                   onDataChange={setTempData}
                 />
               )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-2">
          {isEditing && (
            <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-white animate-in slide-in-from-right-4">
              <div className="flex items-center gap-3 mb-4">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="font-black text-primary uppercase text-sm">Labeling Objek</h3>
              </div>
              <div className="space-y-4">
                {tempData.polygon && (
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-2">Nama Poligon Utama</label>
                    <Input 
                      value={tempData.polygon.name} 
                      onChange={(e) => updateObjectName('polygon', tempData.polygon!.id, e.target.value)}
                      className="bg-secondary/30 border-none h-10 text-xs font-bold"
                    />
                  </div>
                )}
                {tempData.lines.map(line => (
                  <div key={line.id} className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-2 flex items-center gap-1">
                      <Route className="w-3 h-3" /> Nama Jalur
                    </label>
                    <Input 
                      value={line.name} 
                      onChange={(e) => updateObjectName('line', line.id, e.target.value)}
                      className="bg-blue-50/50 border-none h-10 text-xs font-bold"
                    />
                  </div>
                ))}
                {tempData.markers.map(marker => (
                  <div key={marker.id} className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-muted-foreground ml-2 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Nama Lokasi
                    </label>
                    <Input 
                      value={marker.name} 
                      onChange={(e) => updateObjectName('marker', marker.id, e.target.value)}
                      className="bg-red-50/50 border-none h-10 text-xs font-bold"
                    />
                  </div>
                ))}
                {tempData.lines.length === 0 && tempData.markers.length === 0 && !tempData.polygon && (
                  <p className="text-[10px] text-center text-muted-foreground italic py-4">Gambar objek di peta untuk memberi nama.</p>
                )}
              </div>
            </Card>
          )}

          <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-black text-primary uppercase text-sm">Visualisasi</h3>
            </div>
            <div className="space-y-2">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-all border-2 text-left",
                    activeLayer === layer.id ? "bg-primary border-primary text-white" : "bg-secondary/30 border-transparent text-muted-foreground"
                  )}
                >
                  <layer.icon className="w-4 h-4" />
                  <span className="font-black text-[10px] uppercase tracking-tighter">{layer.label}</span>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-primary text-white">
            <h3 className="font-black uppercase text-xs mb-4 flex items-center gap-2">
              <Info className="w-4 h-4" /> Info Editor
            </h3>
            <ul className="text-[10px] space-y-2 font-medium opacity-80 leading-relaxed">
              <li>• Klik ikon <b>Marker</b> untuk menambah titik lokasi.</li>
              <li>• Klik ikon <b>Polyline</b> untuk menggambar jalan/rute.</li>
              <li>• Klik ikon <b>Polygon</b> untuk area batas.</li>
              <li>• Beri nama pada daftar di atas agar muncul sebagai label di peta warga.</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
