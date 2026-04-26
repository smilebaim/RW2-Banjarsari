
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
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse rounded-[2.5rem]" />,
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
  const [tempCoords, setTempCoords] = useState<[number, number][]>([]);

  // Fetch polygon from Firestore
  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings, isLoading } = useDoc(mapSettingsRef);

  useEffect(() => {
    if (mapSettings?.polygon) {
      setTempCoords(mapSettings.polygon);
    }
  }, [mapSettings]);

  const handleSavePolygon = () => {
    updateDocumentNonBlocking(mapSettingsRef, {
      polygon: tempCoords,
      updatedAt: new Date().toISOString()
    });
    setIsEditing(false);
    toast({
      title: "Batas Wilayah Disimpan",
      description: "Koordinat poligon telah berhasil diperbarui di database.",
    });
  };

  const handleClearPolygon = () => {
    setTempCoords([]);
    toast({
      title: "Area Dibersihkan",
      description: "Poligon telah dihapus dari canvas edit. Jangan lupa simpan untuk menerapkan.",
    });
  };

  const handleCancel = () => {
    setTempCoords(mapSettings?.polygon || []);
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
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Editor Peta Wilayah</h1>
          <p className="text-muted-foreground font-medium">Definisikan batas administratif RW 02 secara digital.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={handleCancel} variant="ghost" className="rounded-2xl gap-2 font-bold h-12 text-muted-foreground hover:bg-secondary">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleClearPolygon} variant="outline" className="rounded-2xl gap-2 font-bold h-12 border-orange-200 text-orange-600 hover:bg-orange-50">
                <Trash2 className="w-4 h-4" /> Reset Area
              </Button>
              <Button onClick={handleSavePolygon} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-2 font-bold h-12 px-6">
                <Check className="w-4 h-4" /> Simpan Batas
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-2 font-bold h-12 px-6">
              <Edit3 className="w-4 h-4" /> Edit Poligon
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
        <div className="lg:col-span-8 relative">
          <Card className="h-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white group">
            <div className="absolute inset-0 z-0">
               {isLoading ? (
                 <div className="w-full h-full flex items-center justify-center bg-secondary/20">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                 </div>
               ) : (
                 <LeafletMap 
                   center={COORDINATES} 
                   zoom={ZOOM_LEVEL} 
                   layer={activeLayer} 
                   showBoundary={showBoundary}
                   editable={isEditing}
                   polygonCoords={tempCoords}
                   onPolygonChange={setTempCoords}
                 />
               )}
            </div>
            
            {isEditing && (
              <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10 w-full px-4 flex justify-center">
                <Badge className="bg-primary/95 backdrop-blur-md px-8 py-4 rounded-3xl text-[10px] font-black uppercase tracking-widest shadow-2xl border-2 border-white/20 animate-in fade-in slide-in-from-top-4 duration-500">
                  <RefreshCcw className="w-4 h-4 mr-3 animate-spin" />
                  Mode Edit Aktif: Klik peta untuk menarik garis atau geser titik yang ada
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
            
            <div className="flex items-center justify-between mb-10 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Hexagon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-primary uppercase tracking-tighter">Detail Wilayah</h3>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Tampilkan</span>
                <Switch checked={showBoundary} onCheckedChange={setShowBoundary} disabled={isEditing} className="data-[state=checked]:bg-green-500" />
              </div>
            </div>

            <div className="space-y-6 relative">
              <div className="p-6 bg-secondary/40 rounded-[2rem] border border-secondary/50">
                <div className="flex items-center gap-3 mb-3">
                  <AreaChart className="w-5 h-5 text-primary" />
                  <span className="text-[11px] font-black uppercase tracking-[0.2em] text-muted-foreground">Luas Wilayah</span>
                </div>
                <p className="text-3xl font-black text-primary tracking-tighter">
                  {tempCoords.length > 2 ? '± 4.2 Hektar' : 'Belum Ditentukan'}
                </p>
                <div className="mt-4 flex gap-2">
                  <Badge variant="secondary" className="bg-white/50 text-[9px] font-black uppercase tracking-widest">{tempCoords.length} Titik Koordinat</Badge>
                </div>
              </div>

              <div className="bg-primary/5 p-5 rounded-[1.5rem] flex items-start gap-4 border border-primary/10">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-[11px] text-primary/80 font-bold leading-relaxed uppercase tracking-tight">
                  Pemetaan digital membantu dalam manajemen aset, perencanaan infrastruktur, dan identifikasi lokasi laporan warga secara presisi.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
