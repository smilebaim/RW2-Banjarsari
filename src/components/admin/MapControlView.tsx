
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
  Type,
  PlusCircle,
  MousePointer2
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

  const removeObject = (type: 'line' | 'marker' | 'polygon', id: string) => {
    setTempData(prev => {
      if (type === 'polygon') return { ...prev, polygon: null };
      if (type === 'line') return { ...prev, lines: prev.lines.filter(l => l.id !== id) };
      if (type === 'marker') return { ...prev, markers: prev.markers.filter(m => m.id !== id) };
      return prev;
    });
    toast({ title: "Objek dihapus", description: "Elemen telah dihapus dari daftar sementara." });
  };

  const layers = [
    { id: 'satellite', label: 'Satelit', icon: Globe },
    { id: 'streets', label: 'Jalanan', icon: MapIcon },
    { id: 'dark', label: 'Mode Gelap', icon: Moon },
  ];

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Infrastruktur Wilayah</h1>
          <p className="text-muted-foreground font-medium">Kelola batas RT, jalur evakuasi, dan titik fasilitas umum.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl gap-2 font-bold h-12 text-muted-foreground">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-2 font-bold h-12 px-6 text-white">
                <Check className="w-4 h-4" /> Simpan Konfigurasi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-2 font-bold h-12 px-6">
              <Edit3 className="w-4 h-4" /> Buka Mode Gambar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[750px]">
        <div className="lg:col-span-8 h-full relative">
          <Card className="h-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white relative group">
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
            
            {/* Map Overlay Badge */}
            <div className="absolute bottom-8 left-8 z-10 flex gap-2">
               <Badge className="bg-white/80 backdrop-blur-md text-primary border-none shadow-lg px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="font-black text-[10px] uppercase tracking-widest">Sistem Aktif</span>
               </Badge>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-6 flex flex-col h-full overflow-y-auto pr-2">
          {isEditing && (
            <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-primary text-white animate-in slide-in-from-right-4">
               <div className="flex items-center gap-3 mb-4">
                  <PlusCircle className="w-5 h-5 text-accent" />
                  <h3 className="font-black uppercase text-sm tracking-tight">Kotak Alat Gambar</h3>
               </div>
               <div className="grid grid-cols-1 gap-3">
                  <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3 border border-white/10">
                     <Hexagon className="w-6 h-6 text-accent shrink-0" />
                     <div>
                        <p className="text-[10px] font-black uppercase mb-1">Poligon Area</p>
                        <p className="text-[9px] opacity-70 leading-tight">Gunakan ikon segi-banyak di peta untuk menggambar batas RT atau area khusus.</p>
                     </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3 border border-white/10">
                     <Route className="w-6 h-6 text-blue-300 shrink-0" />
                     <div>
                        <p className="text-[10px] font-black uppercase mb-1">Garis Jalur</p>
                        <p className="text-[9px] opacity-70 leading-tight">Gunakan ikon garis di peta untuk menandai jalan utama atau jalur evakuasi.</p>
                     </div>
                  </div>
                  <div className="bg-white/10 p-4 rounded-2xl flex items-start gap-3 border border-white/10">
                     <MapPin className="w-6 h-6 text-red-300 shrink-0" />
                     <div>
                        <p className="text-[10px] font-black uppercase mb-1">Penanda Lokasi</p>
                        <p className="text-[9px] opacity-70 leading-tight">Gunakan ikon pin untuk menandai fasilitas seperti Balai RW atau Masjid.</p>
                     </div>
                  </div>
               </div>
            </Card>
          )}

          <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-white flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Type className="w-5 h-5 text-primary" />
                <h3 className="font-black text-primary uppercase text-sm">Daftar Objek</h3>
              </div>
              <Badge variant="secondary" className="font-black text-[9px]">{tempData.lines.length + tempData.markers.length + (tempData.polygon ? 1 : 0)} Item</Badge>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {tempData.polygon && (
                  <div className="p-4 bg-green-50 rounded-2xl space-y-2 border border-green-100 group">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-green-700 flex items-center gap-1">
                        <Hexagon className="w-3 h-3" /> Area Batas
                      </label>
                      <Button onClick={() => removeObject('polygon', tempData.polygon!.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input 
                      value={tempData.polygon.name} 
                      onChange={(e) => updateObjectName('polygon', tempData.polygon!.id, e.target.value)}
                      disabled={!isEditing}
                      className="bg-white border-none h-9 text-xs font-bold shadow-sm"
                      placeholder="Nama Area..."
                    />
                  </div>
                )}

                {tempData.lines.map(line => (
                  <div key={line.id} className="p-4 bg-blue-50 rounded-2xl space-y-2 border border-blue-100 group">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-blue-700 flex items-center gap-1">
                        <Route className="w-3 h-3" /> Jalur / Rute
                      </label>
                      <Button onClick={() => removeObject('line', line.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input 
                      value={line.name} 
                      onChange={(e) => updateObjectName('line', line.id, e.target.value)}
                      disabled={!isEditing}
                      className="bg-white border-none h-9 text-xs font-bold shadow-sm"
                      placeholder="Nama Jalur..."
                    />
                  </div>
                ))}

                {tempData.markers.map(marker => (
                  <div key={marker.id} className="p-4 bg-red-50 rounded-2xl space-y-2 border border-red-100 group">
                    <div className="flex justify-between items-center">
                      <label className="text-[9px] font-black uppercase text-red-700 flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> Titik Lokasi
                      </label>
                      <Button onClick={() => removeObject('marker', marker.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Input 
                      value={marker.name} 
                      onChange={(e) => updateObjectName('marker', marker.id, e.target.value)}
                      disabled={!isEditing}
                      className="bg-white border-none h-9 text-xs font-bold shadow-sm"
                      placeholder="Nama Lokasi..."
                    />
                  </div>
                ))}

                {!tempData.polygon && tempData.lines.length === 0 && tempData.markers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center opacity-30">
                    <MousePointer2 className="w-10 h-10 mb-2" />
                    <p className="text-[10px] font-black uppercase tracking-widest">Peta Kosong</p>
                    <p className="text-[8px] max-w-[150px] leading-tight mt-1">Gunakan alat gambar untuk menambahkan objek ke wilayah.</p>
                  </div>
                )}
            </div>
          </Card>

          <Card className="border-none shadow-xl rounded-[2.5rem] p-6 bg-white">
            <div className="flex items-center gap-3 mb-4">
              <Layers className="w-5 h-5 text-primary" />
              <h3 className="font-black text-primary uppercase text-sm">Visual Lapisan</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 p-3 rounded-2xl transition-all border-2",
                    activeLayer === layer.id ? "bg-primary border-primary text-white shadow-lg" : "bg-secondary/30 border-transparent text-muted-foreground hover:bg-secondary"
                  )}
                >
                  <layer.icon className="w-4 h-4" />
                  <span className="font-black text-[8px] uppercase">{layer.label}</span>
                </button>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
