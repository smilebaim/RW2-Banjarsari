
"use client";

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useFirestore, useDoc, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Layers, 
  Map as MapIcon, 
  Globe, 
  Moon, 
  Edit3,
  Check,
  X,
  Hexagon,
  Loader2,
  Trash2,
  MapPin,
  Route,
  Type,
  Maximize2,
  Info,
  Pencil,
  Palette,
  Home,
  Shield,
  Hospital,
  Droplet,
  Zap,
  Trees,
  Tag
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapObject } from '@/components/map/LeafletMap';
import { ScrollArea } from '@/components/ui/scroll-area';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse flex items-center justify-center">
    <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
  </div>,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

const COLOR_PALETTE = [
  { value: '#22c55e', label: 'Green' },
  { value: '#3b82f6', label: 'Blue' },
  { value: '#ef4444', label: 'Red' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#06b6d4', label: 'Cyan' },
];

const ICON_PALETTE = [
  { value: 'pin', icon: MapPin },
  { value: 'home', icon: Home },
  { value: 'info', icon: Info },
  { value: 'shield', icon: Shield },
  { value: 'hospital', icon: Hospital },
  { value: 'droplet', icon: Droplet },
  { value: 'zap', icon: Zap },
  { value: 'trees', icon: Trees },
];

const CATEGORIES = {
  polygon: ['Batas Wilayah', 'Fasilitas Umum', 'Area Hijau', 'Pemukiman', 'Lainnya'],
  line: ['Jalan Utama', 'Jalan Lingkungan', 'Drainase', 'Jalur Kabel', 'Lainnya'],
  marker: ['Keamanan', 'Kesehatan', 'Ibadah', 'Pendidikan', 'Niaga', 'Sosial', 'Lainnya']
};

type MapLayer = 'satellite' | 'streets' | 'dark';

export function MapControlView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [showBoundary, setShowBoundary] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState<{ coords: [number, number], zoom: number } | null>(null);
  
  const [tempData, setTempData] = useState<{
    polygons: MapObject[],
    lines: MapObject[],
    markers: MapObject[]
  }>({
    polygons: [],
    lines: [],
    markers: []
  });

  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings, isLoading } = useDoc(mapSettingsRef);

  useEffect(() => {
    if (mapSettings) {
      const parseData = (val: any, fallback: any = []) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch (e) {
            return fallback;
          }
        }
        return val || fallback;
      };

      setTempData({
        polygons: parseData(mapSettings.polygons || mapSettings.polygon, []),
        lines: parseData(mapSettings.lines, []),
        markers: parseData(mapSettings.markers, [])
      });
    }
  }, [mapSettings]);

  const handleSaveMap = () => {
    setDocumentNonBlocking(mapSettingsRef, {
      polygons: JSON.stringify(tempData.polygons),
      lines: JSON.stringify(tempData.lines),
      markers: JSON.stringify(tempData.markers),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setIsEditing(false);
    toast({
      title: "Konfigurasi Disimpan",
      description: "Seluruh elemen infrastruktur telah diperbarui.",
    });
  };

  const updateObjectProperty = (type: 'line' | 'marker' | 'polygon', id: string, property: keyof MapObject, value: any) => {
    setTempData(prev => {
      if (type === 'polygon') {
        return { ...prev, polygons: prev.polygons.map(p => p.id === id ? { ...p, [property]: value } : p) };
      }
      if (type === 'line') {
        return { ...prev, lines: prev.lines.map(l => l.id === id ? { ...l, [property]: value } : l) };
      }
      if (type === 'marker') {
        return { ...prev, markers: prev.markers.map(m => m.id === id ? { ...m, [property]: value } : m) };
      }
      return prev;
    });
  };

  const removeObject = (type: 'line' | 'marker' | 'polygon', id: string) => {
    setTempData(prev => {
      if (type === 'polygon') return { ...prev, polygons: prev.polygons.filter(p => p.id !== id) };
      if (type === 'line') return { ...prev, lines: prev.lines.filter(l => l.id !== id) };
      if (type === 'marker') return { ...prev, markers: prev.markers.filter(m => m.id !== id) };
      return prev;
    });
  };

  const focusOnObject = (coords: any) => {
    if (!coords) return;
    let target: [number, number];
    if (Array.isArray(coords[0])) {
      target = coords[0] as [number, number];
    } else {
      target = coords as [number, number];
    }
    setFocusTrigger({ coords: target, zoom: 19 });
  };

  const startEditObject = (coords: any) => {
    focusOnObject(coords);
    setIsEditing(true);
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-primary uppercase tracking-tighter mb-1">Editor Infrastruktur</h1>
          <p className="text-muted-foreground font-medium text-xs">Kelola batas area, jalur jalan, dan titik lokasi penting.</p>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-xl gap-2 font-bold h-10 text-xs text-muted-foreground">
                <X className="w-3.5 h-3.5" /> Batal
              </Button>
              <Button onClick={handleSaveMap} className="rounded-xl bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 gap-2 font-bold h-10 px-4 text-xs text-white">
                <Check className="w-3.5 h-3.5" /> Simpan
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-xl bg-primary shadow-lg shadow-primary/20 gap-2 font-bold h-10 px-4 text-xs">
              <Edit3 className="w-3.5 h-3.5" /> Aktifkan Gambar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        <div className="lg:col-span-8 h-[500px] lg:h-full relative">
          <Card className="h-full border-none shadow-2xl rounded-[2.5rem] overflow-hidden bg-white relative">
            <div className="absolute inset-0 z-0">
               {isLoading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10">
                    <Loader2 className="w-8 h-8 animate-spin text-primary mb-3" />
                    <p className="text-[8px] font-black uppercase tracking-widest text-primary/40">Inisialisasi Peta...</p>
                 </div>
               ) : (
                 <LeafletMap 
                   key={isEditing ? 'editing' : 'viewing'}
                   center={focusTrigger?.coords || COORDINATES} 
                   zoom={focusTrigger?.zoom || ZOOM_LEVEL} 
                   layer={activeLayer} 
                   showBoundary={showBoundary}
                   editable={isEditing}
                   polygonsData={tempData.polygons}
                   linesData={tempData.lines}
                   markersData={tempData.markers}
                   onDataChange={(data) => setTempData({ polygons: data.polygons, lines: data.lines, markers: data.markers })}
                 />
               )}
            </div>
          </Card>
        </div>

        <div className="lg:col-span-4 space-y-4 flex flex-col h-full">
          <Card className="border-none shadow-xl rounded-[2rem] p-4 bg-white flex-1 overflow-hidden flex flex-col max-h-[700px]">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-secondary/50">
              <div className="flex items-center gap-2">
                <Type className="w-4 h-4 text-primary" />
                <h3 className="font-black text-primary uppercase text-[11px] tracking-tight">Inventaris Objek</h3>
              </div>
              <Badge variant="secondary" className="font-black text-[8px] px-2 py-0.5">
                {tempData.polygons.length + tempData.lines.length + tempData.markers.length} Elemen
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 pr-3">
              <div className="space-y-3">
                {tempData.polygons.map(poly => (
                  <div key={poly.id} className={cn("p-3 rounded-2xl space-y-2 border transition-all group relative", isEditing ? "bg-green-50/50 border-green-100" : "bg-secondary/10 border-transparent")}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Hexagon className="w-3 h-3 text-green-700" />
                        <span className="text-[9px] font-black uppercase text-green-700 tracking-tighter">Area</span>
                        <Badge variant="outline" className="text-[7px] border-green-200 text-green-600 bg-white h-4 px-1">
                          {poly.category || 'Umum'}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => focusOnObject(poly.coords)} size="icon" variant="ghost" className="h-6 w-6 text-green-600 bg-white/50 rounded-lg">
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                        {!isEditing && (
                          <Button onClick={() => startEditObject(poly.coords)} size="icon" variant="ghost" className="h-6 w-6 text-primary bg-white/50 rounded-lg">
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                        <Button onClick={() => removeObject('polygon', poly.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 bg-white/50 rounded-lg">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input 
                          value={poly.name} 
                          onChange={(e) => updateObjectProperty('polygon', poly.id, 'name', e.target.value)}
                          disabled={!isEditing}
                          className="bg-white border-none h-8 text-[10px] font-bold shadow-sm"
                          placeholder="Nama Area"
                        />
                        <Select 
                          disabled={!isEditing} 
                          value={poly.category || 'Lainnya'} 
                          onValueChange={(val) => updateObjectProperty('polygon', poly.id, 'category', val)}
                        >
                          <SelectTrigger className="h-8 bg-white border-none text-[10px] font-bold shadow-sm px-2">
                            <SelectValue placeholder="Kategori" />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.polygon.map(cat => (
                              <SelectItem key={cat} value={cat} className="text-[10px]">{cat}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {isEditing && (
                        <div className="flex items-center gap-2 px-2 py-1 bg-white rounded-lg shadow-sm border border-secondary/30">
                          <Palette className="w-3 h-3 text-muted-foreground" />
                          <div className="flex gap-1">
                            {COLOR_PALETTE.map(color => (
                              <button
                                key={color.value}
                                onClick={() => updateObjectProperty('polygon', poly.id, 'color', color.value)}
                                className={cn(
                                  "w-3.5 h-3.5 rounded-full border transition-transform hover:scale-110",
                                  poly.color === color.value ? "border-primary scale-110" : "border-transparent"
                                )}
                                style={{ backgroundColor: color.value }}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {tempData.lines.map(line => (
                  <div key={line.id} className={cn("p-3 rounded-2xl space-y-2 border transition-all group relative", isEditing ? "bg-blue-50/50 border-blue-100" : "bg-secondary/10 border-transparent")}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <Route className="w-3 h-3 text-blue-700" />
                        <span className="text-[9px] font-black uppercase text-blue-700 tracking-tighter">Jalur</span>
                        <Badge variant="outline" className="text-[7px] border-blue-200 text-blue-600 bg-white h-4 px-1">
                          {line.category || 'Umum'}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => focusOnObject(line.coords)} size="icon" variant="ghost" className="h-6 w-6 text-blue-600 bg-white/50 rounded-lg">
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                        {!isEditing && (
                          <Button onClick={() => startEditObject(line.coords)} size="icon" variant="ghost" className="h-6 w-6 text-primary bg-white/50 rounded-lg">
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                        <Button onClick={() => removeObject('line', line.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 bg-white/50 rounded-lg">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        value={line.name} 
                        onChange={(e) => updateObjectProperty('line', line.id, 'name', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white border-none h-8 text-[10px] font-bold shadow-sm"
                        placeholder="Nama Jalur"
                      />
                      <Select 
                        disabled={!isEditing} 
                        value={line.category || 'Lainnya'} 
                        onValueChange={(val) => updateObjectProperty('line', line.id, 'category', val)}
                      >
                        <SelectTrigger className="h-8 bg-white border-none text-[10px] font-bold shadow-sm px-2">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.line.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-[10px]">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                {tempData.markers.map(marker => (
                  <div key={marker.id} className={cn("p-3 rounded-2xl space-y-2 border transition-all group relative", isEditing ? "bg-red-50/50 border-red-100" : "bg-secondary/10 border-transparent")}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-red-700" />
                        <span className="text-[9px] font-black uppercase text-red-700 tracking-tighter">Titik</span>
                        <Badge variant="outline" className="text-[7px] border-red-200 text-red-600 bg-white h-4 px-1">
                          {marker.category || 'Umum'}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button onClick={() => focusOnObject(marker.coords)} size="icon" variant="ghost" className="h-6 w-6 text-red-600 bg-white/50 rounded-lg">
                          <Maximize2 className="w-3 h-3" />
                        </Button>
                        {!isEditing && (
                          <Button onClick={() => startEditObject(marker.coords)} size="icon" variant="ghost" className="h-6 w-6 text-primary bg-white/50 rounded-lg">
                            <Pencil className="w-3 h-3" />
                          </Button>
                        )}
                        <Button onClick={() => removeObject('marker', marker.id)} size="icon" variant="ghost" className="h-6 w-6 text-red-400 bg-white/50 rounded-lg">
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Input 
                        value={marker.name} 
                        onChange={(e) => updateObjectProperty('marker', marker.id, 'name', e.target.value)}
                        disabled={!isEditing}
                        className="bg-white border-none h-8 text-[10px] font-bold shadow-sm"
                        placeholder="Nama Lokasi"
                      />
                      <Select 
                        disabled={!isEditing} 
                        value={marker.category || 'Lainnya'} 
                        onValueChange={(val) => updateObjectProperty('marker', marker.id, 'category', val)}
                      >
                        <SelectTrigger className="h-8 bg-white border-none text-[10px] font-bold shadow-sm px-2">
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORIES.marker.map(cat => (
                            <SelectItem key={cat} value={cat} className="text-[10px]">{cat}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}

                {tempData.polygons.length === 0 && tempData.lines.length === 0 && tempData.markers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-12 text-center opacity-30">
                    <Loader2 className="w-10 h-10 mb-2 animate-pulse" />
                    <p className="text-[9px] font-black uppercase tracking-[0.2em]">Peta Kosong</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>
      </div>
    </div>
  );
}

