
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
  Edit3,
  Check,
  X,
  Hexagon,
  Loader2,
  Trash2,
  MapPin,
  Route,
  Maximize2,
  Pencil,
  Palette,
  Info,
  Settings2,
  Link as LinkIcon,
  Image as ImageIcon
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

const ICON_LIST = [
  { value: 'pin', icon: MapPin },
  { value: 'home', icon: MapPin }, // Fallback to MapPin for consistency in this example
  { value: 'shield', icon: MapPin },
  { value: 'hospital', icon: MapPin },
  { value: 'zap', icon: MapPin },
  { value: 'droplet', icon: MapPin },
  { value: 'trees', icon: MapPin },
  { value: 'school', icon: MapPin },
  { value: 'shopping', icon: MapPin },
  { value: 'dining', icon: MapPin },
  { value: 'cctv', icon: MapPin },
  { value: 'wifi', icon: MapPin },
  { value: 'trash', icon: MapPin },
  { value: 'parking', icon: MapPin },
  { value: 'bus', icon: MapPin },
  { value: 'social', icon: MapPin },
  { value: 'office', icon: MapPin },
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
  
  const [stateData, setStateData] = useState({
    polygons: [] as MapObject[],
    lines: [] as MapObject[],
    markers: [] as MapObject[]
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

      setStateData({
        polygons: parseData(mapSettings.polygons || mapSettings.polygon, []),
        lines: parseData(mapSettings.lines, []),
        markers: parseData(mapSettings.markers, [])
      });
    }
  }, [mapSettings]);

  const handleSaveMap = () => {
    setDocumentNonBlocking(mapSettingsRef, {
      polygons: JSON.stringify(stateData.polygons),
      lines: JSON.stringify(stateData.lines),
      markers: JSON.stringify(stateData.markers),
      updatedAt: new Date().toISOString()
    }, { merge: true });
    
    setIsEditing(false);
    toast({
      title: "Konfigurasi Disimpan",
      description: "Seluruh elemen infrastruktur telah diperbarui.",
    });
  };

  const updateObjectProperty = (type: 'line' | 'marker' | 'polygon', id: string, property: keyof MapObject, value: any) => {
    setStateData(prev => {
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
    setStateData(prev => {
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

  const ObjectCard = ({ item, type }: { item: MapObject, type: 'polygon' | 'line' | 'marker' }) => {
    const Icon = type === 'polygon' ? Hexagon : type === 'line' ? Route : MapPin;
    const accentColor = type === 'polygon' ? 'text-green-600' : type === 'line' ? 'text-blue-600' : 'text-red-600';
    const bgAccent = type === 'polygon' ? 'bg-green-50/50 border-green-100' : type === 'line' ? 'bg-blue-50/50 border-blue-100' : 'bg-red-50/50 border-red-100';

    return (
      <div className={cn(
        "p-6 rounded-[2.5rem] space-y-5 border transition-all duration-300 group bg-white",
        isEditing ? bgAccent : "border-secondary shadow-sm hover:shadow-md"
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner", isEditing ? "bg-white" : "bg-secondary")}>
              <Icon className={cn("w-5 h-5", accentColor)} />
            </div>
            <div>
              <span className={cn("text-[10px] font-black uppercase tracking-widest block leading-none mb-1", accentColor)}>
                {type === 'polygon' ? 'Area Wilayah' : type === 'line' ? 'Jalur Utilitas' : 'Titik Fasilitas'}
              </span>
              <Badge variant="outline" className="text-[8px] border-none bg-black/5 h-5 px-2 font-black uppercase tracking-widest">
                {item.category || 'Umum'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => focusOnObject(item.coords)} size="icon" variant="ghost" className="h-10 w-10 rounded-2xl bg-white/80 hover:bg-white shadow-sm transition-all">
              <Maximize2 className="w-4 h-4" />
            </Button>
            {!isEditing && (
              <Button onClick={() => startEditObject(item.coords)} size="icon" variant="ghost" className="h-10 w-10 rounded-2xl bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm transition-all">
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            <Button onClick={() => removeObject(type, item.id)} size="icon" variant="ghost" className="h-10 w-10 rounded-2xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm transition-all">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Nama Objek Infrastruktur</label>
              <Input 
                value={item.name} 
                onChange={(e) => updateObjectProperty(type, item.id, 'name', e.target.value)}
                disabled={!isEditing}
                className="bg-secondary/30 border-none h-12 text-xs font-bold shadow-inner rounded-xl"
                placeholder="Masukkan nama objek..."
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Klasifikasi Kategori</label>
              <Select 
                disabled={!isEditing} 
                value={item.category || 'Lainnya'} 
                onValueChange={(val) => updateObjectProperty(type, item.id, 'category', val)}
              >
                <SelectTrigger className="h-12 bg-secondary/30 border-none text-xs font-bold shadow-inner rounded-xl">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {CATEGORIES[type].map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'marker' && isEditing && (
              <div className="space-y-1.5">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Ikon Penanda</label>
                <div className="grid grid-cols-6 gap-2 p-3 bg-secondary/20 rounded-xl shadow-inner border border-secondary/30">
                  {ICON_LIST.map((iconObj, idx) => (
                    <button
                      key={idx}
                      onClick={() => updateObjectProperty('marker', item.id, 'icon', iconObj.value)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                        item.icon === iconObj.value 
                          ? "bg-primary text-white shadow-lg scale-110" 
                          : "bg-white text-muted-foreground hover:bg-secondary shadow-sm"
                      )}
                    >
                      <iconObj.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isEditing && (
              <div className="flex items-center justify-between gap-4 px-4 py-3 bg-secondary/20 rounded-xl shadow-inner border border-secondary/30">
                <div className="flex items-center gap-3">
                  <Palette className="w-4 h-4 text-muted-foreground" />
                  <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Warna Identitas</span>
                </div>
                <div className="flex gap-2">
                  {COLOR_PALETTE.map(color => (
                    <button
                      key={color.value}
                      onClick={() => updateObjectProperty(type, item.id, 'color', color.value)}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 transition-all hover:scale-125",
                        item.color === color.value ? "border-white shadow-lg scale-125" : "border-transparent"
                      )}
                      style={{ backgroundColor: color.value }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Keterangan & Detail Objek</label>
              <Textarea 
                value={item.description || ''} 
                onChange={(e) => updateObjectProperty(type, item.id, 'description', e.target.value)}
                disabled={!isEditing}
                className="bg-secondary/30 border-none text-[11px] font-medium shadow-inner rounded-2xl min-h-[108px] leading-relaxed p-4"
                placeholder="Berikan keterangan mendalam mengenai objek infrastruktur ini..."
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">URL Foto Pendukung (HTTPS)</label>
                {item.imageUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => updateObjectProperty(type, item.id, 'imageUrl', '')}
                    className="h-6 px-3 text-[8px] font-black uppercase text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    Hapus Foto
                  </Button>
                )}
              </div>
              <div className="relative group/img">
                <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                <Input 
                  value={item.imageUrl || ''} 
                  onChange={(e) => updateObjectProperty(type, item.id, 'imageUrl', e.target.value)}
                  disabled={!isEditing}
                  className="pl-12 bg-secondary/30 border-none h-12 text-[10px] font-bold shadow-inner rounded-xl"
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>
        </div>

        {item.imageUrl && (
          <div className="relative h-48 w-full rounded-[2rem] overflow-hidden mt-2 border-4 border-secondary/20 shadow-inner group">
            <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
              <ImageIcon className="text-white w-8 h-8 drop-shadow-xl" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-12 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div>
          <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-4">
            <span className="w-8 h-[2px] bg-primary"></span>
            <Settings2 className="w-4 h-4" /> Konfigurasi Geospasial
          </div>
          <h1 className="text-4xl lg:text-5xl font-black text-primary uppercase tracking-tighter mb-2 leading-none">Editor Infrastruktur</h1>
          <p className="text-muted-foreground font-medium text-base italic border-l-4 border-accent pl-6">Visualisasikan batas wilayah, jalur utilitas, dan titik layanan publik di RW 02 Banjarsari.</p>
        </div>
        <div className="flex gap-4">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-10 border border-secondary bg-white shadow-sm transition-all hover:scale-105">
                <X className="w-5 h-5" /> Batal
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-2xl shadow-green-600/20 gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-10 text-white transition-all hover:scale-105">
                <Check className="w-5 h-5" /> Simpan Konfigurasi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-primary shadow-2xl shadow-primary/30 gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-10 text-white transition-all hover:scale-105">
              <Edit3 className="w-5 h-5" /> Aktifkan Mode Gambar
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-10">
        {/* Map Canvas (Top) */}
        <Card className="h-[600px] border-none shadow-2xl rounded-[3.5rem] overflow-hidden bg-white relative animate-in fade-in duration-1000">
          <div className="absolute inset-0 z-0">
             {isLoading ? (
               <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10">
                  <Loader2 className="w-12 h-12 animate-spin text-primary/20 mb-6" />
                  <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30 animate-pulse">Menghubungkan ke Satelit...</p>
               </div>
             ) : (
               <LeafletMap 
                 key={isEditing ? 'editing' : 'viewing'}
                 center={focusTrigger?.coords || COORDINATES} 
                 zoom={focusTrigger?.zoom || ZOOM_LEVEL} 
                 layer={activeLayer} 
                 showBoundary={showBoundary}
                 editable={isEditing}
                 polygonsData={stateData.polygons}
                 linesData={stateData.lines}
                 markersData={stateData.markers}
                 onDataChange={(data) => setStateData({ polygons: data.polygons, lines: data.lines, markers: data.markers })}
               />
             )}
          </div>

          {/* Layer HUD Overlay */}
          <div className="absolute top-8 right-8 z-10 flex flex-col gap-3">
            <div className="bg-white/80 backdrop-blur-3xl p-2 rounded-3xl shadow-2xl border border-white/50 flex flex-col gap-2">
              <Button size="icon" variant={activeLayer === 'satellite' ? 'default' : 'ghost'} onClick={() => setActiveLayer('satellite')} className="rounded-2xl h-12 w-12 transition-all">
                <Layers className="w-5 h-5" />
              </Button>
              <Button size="icon" variant={activeLayer === 'streets' ? 'default' : 'ghost'} onClick={() => setActiveLayer('streets')} className="rounded-2xl h-12 w-12 transition-all">
                <MapIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </Card>

        {/* Object Inspector (Bottom - Wide Layout) */}
        <div className="space-y-8 animate-in slide-in-from-bottom-8 duration-700 delay-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 px-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                <Settings2 className="w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-primary uppercase text-xl tracking-tighter leading-none mb-1.5">Inventaris Objek Infrastruktur</h3>
                <p className="text-muted-foreground font-medium text-xs">Daftar lengkap elemen geospasial yang terdaftar di wilayah RW 02.</p>
              </div>
            </div>
            <Badge className="bg-secondary text-primary font-black text-[11px] px-6 py-2.5 border-none shadow-sm rounded-2xl uppercase tracking-[0.2em]">
              {stateData.polygons.length + stateData.lines.length + stateData.markers.length} Elemen Terdaftar
            </Badge>
          </div>

          <div className="grid grid-cols-1 gap-12">
            {/* Polygons Grid */}
            {stateData.polygons.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4">
                  <Hexagon className="w-4 h-4 text-green-600" /> Area & Wilayah
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {stateData.polygons.map(poly => (
                    <ObjectCard key={poly.id} item={poly} type="polygon" />
                  ))}
                </div>
              </div>
            )}

            {/* Lines Grid */}
            {stateData.lines.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4">
                  <Route className="w-4 h-4 text-blue-600" /> Jalur Utilitas & Drainase
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {stateData.lines.map(line => (
                    <ObjectCard key={line.id} item={line} type="line" />
                  ))}
                </div>
              </div>
            )}

            {/* Markers Grid */}
            {stateData.markers.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] px-4">
                  <MapPin className="w-4 h-4 text-red-600" /> Titik Layanan Publik
                </div>
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                  {stateData.markers.map(marker => (
                    <ObjectCard key={marker.id} item={marker} type="marker" />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State HUD */}
            {stateData.polygons.length === 0 && stateData.lines.length === 0 && stateData.markers.length === 0 && (
              <Card className="border-none shadow-xl rounded-[3rem] bg-secondary/20 p-24 text-center">
                <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center text-primary/20 mx-auto mb-8 shadow-inner">
                  <MapIcon className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-black text-primary/40 uppercase tracking-[0.3em]">Basis Data Geospasial Kosong</h3>
                <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto italic font-medium">Aktifkan mode gambar di pojok kanan atas untuk mulai memetakan aset dan infrastruktur wilayah.</p>
              </Card>
            )}
          </div>

          {/* Info Card Tooltip Style */}
          <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-900 text-white p-10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full -mr-48 -mt-48 blur-[100px] group-hover:bg-primary/30 transition-all duration-1000"></div>
            <div className="relative flex flex-col md:flex-row items-center gap-10">
              <div className="w-20 h-20 bg-accent rounded-[1.75rem] flex items-center justify-center text-black shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <Info className="w-10 h-10" />
              </div>
              <div className="space-y-3 flex-1 text-center md:text-left">
                <h4 className="text-xl font-black uppercase tracking-tighter text-accent leading-none">Panduan Pemetaan Digital</h4>
                <p className="text-sm text-white/60 leading-relaxed font-medium italic border-l-2 border-accent/30 pl-6 hidden md:block">
                  Setiap objek yang Anda tambahkan akan langsung terlihat oleh warga di halaman beranda. Pastikan memberikan deskripsi yang informatif seperti jam operasional fasilitas atau rincian jalur drainase untuk transparansi data wilayah.
                </p>
                <p className="text-xs text-white/60 leading-relaxed md:hidden">
                  Data yang Anda masukkan di sini akan tampil secara real-time di peta publik untuk seluruh warga RW 02 Banjarsari.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
