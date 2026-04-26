
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  Route
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
  
  // Temporal drawing state
  const [tempData, setTempData] = useState<{
    polygon: [number, number][],
    lines: [number, number][][],
    markers: [number, number][]
  }>({
    polygon: [],
    lines: [],
    markers: []
  });

  // Fetch from Firestore
  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings, isLoading } = useDoc(mapSettingsRef);

  useEffect(() => {
    if (mapSettings) {
      setTempData({
        polygon: mapSettings.polygon || [],
        lines: mapSettings.lines || [],
        markers: mapSettings.markers || []
      });
    }
  }, [mapSettings]);

  const handleSaveMap = () => {
    updateDocumentNonBlocking(mapSettingsRef, {
      ...tempData,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    toast({
      title: "Peta Wilayah Diperbarui",
      description: "Semua elemen visual telah disimpan ke database.",
    });
  };

  const handleClearMap = () => {
    setTempData({ polygon: [], lines: [], markers: [] });
    toast({
      title: "Canvas Dibersihkan",
      description: "Klik Simpan jika ingin menghapus permanen dari database.",
    });
  };

  const handleCancel = () => {
    if (mapSettings) {
      setTempData({
        polygon: mapSettings.polygon || [],
        lines: mapSettings.lines || [],
        markers: mapSettings.markers || []
      });
    }
    setIsEditing(false);
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
          <p className="text-muted-foreground font-medium">Kelola batas wilayah, jalur jalan, dan titik lokasi penting.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="ghost" className="rounded-2xl gap-2 font-bold h-12 text-muted-foreground hover:bg-secondary">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleClearMap} variant="outline" className="rounded-2xl gap-2 font-bold h-12 border-orange-200 text-orange-600 hover:bg-orange-50">
                <Trash2 className="w-4 h-4" /> Reset Kanvas
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-2 font-bold h-12 px-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
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
                   key={isEditing ? 'editing' : 'viewing'} // Force remount for draw control
                   center={COORDINATES} 
                   zoom={ZOOM_LEVEL} 
                   layer={activeLayer} 
                   showBoundary={showBoundary}
                   editable={isEditing}
                   polygonCoords={tempData.polygon}
                   lineCoords={tempData.lines}
                   markerCoords={tempData.markers}
                   onDataChange={setTempData}
                 />
               )}
            </div>
            
            {isEditing && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-20 w-full px-4 flex justify-center pointer-events-none">
                <Badge className="bg-primary/95 backdrop-blur-md px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 border-white/20 animate-in fade-in slide-in-from-top-4 duration-500 pointer-events-auto">
                  <RefreshCcw className="w-4 h-4 mr-3 animate-spin" />
                  Gunakan toolbar di kiri peta untuk menggambar
                </Badge>
              </div>
            )}
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-black text-primary uppercase tracking-tighter">Visualisasi</h3>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-2xl transition-all duration-300 border-2 text-left",
                    activeLayer === layer.id 
                      ? "bg-primary border-primary text-white shadow-xl scale-[1.02]" 
                      : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary/50"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shadow-inner", activeLayer === layer.id ? "bg-white/20" : "bg-white")}>
                    <layer.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-black text-xs mb-1 uppercase tracking-tight">{layer.label}</p>
                    <p className="text-[10px] uppercase tracking-widest opacity-60 font-bold">{layer.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white flex-1 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl" />
            
            <div className="flex items-center justify-between mb-8 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Hexagon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-primary uppercase tracking-tighter">Inventaris</h3>
              </div>
              <Switch checked={showBoundary} onCheckedChange={setShowBoundary} disabled={isEditing} />
            </div>

            <div className="space-y-4 relative">
              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <AreaChart className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Poligon</span>
                </div>
                <span className="font-black text-primary text-sm">{tempData.polygon.length > 0 ? '1' : '0'} Area</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <Route className="w-4 h-4 text-blue-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Garis Jalur</span>
                </div>
                <span className="font-black text-blue-600 text-sm">{tempData.lines.length} Jalur</span>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/30 rounded-2xl">
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-red-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Penanda</span>
                </div>
                <span className="font-black text-red-600 text-sm">{tempData.markers.length} Titik</span>
              </div>

              <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 border border-primary/10 mt-4">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[9px] text-primary/80 font-bold uppercase tracking-tight leading-relaxed">
                  Tip: Gunakan Penanda untuk lokasi Balai RW, Pos Ronda, atau UMKM unggulan.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
