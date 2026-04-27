
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
  Home,
  Shield,
  Hospital,
  Droplet,
  Zap,
  Trees,
  School,
  ShoppingBag,
  Coffee,
  Video,
  Wifi,
  Trash,
  Car,
  Bus,
  Heart,
  Building,
  Image as ImageIcon,
  Link as LinkIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapObject } from '@/components/map/LeafletMap';
import { ScrollArea } from '@/components/ui/scroll-area';
import Image from 'next/image';

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
  { value: 'home', icon: Home },
  { value: 'shield', icon: Shield },
  { value: 'hospital', icon: Hospital },
  { value: 'zap', icon: Zap },
  { value: 'droplet', icon: Droplet },
  { value: 'trees', icon: Trees },
  { value: 'school', icon: School },
  { value: 'shopping', icon: ShoppingBag },
  { value: 'dining', icon: Coffee },
  { value: 'cctv', icon: Video },
  { value: 'wifi', icon: Wifi },
  { value: 'trash', icon: Trash },
  { value: 'parking', icon: Car },
  { value: 'bus', icon: Bus },
  { value: 'social', icon: Heart },
  { value: 'office', icon: Building },
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
    const bgAccent = type === 'polygon' ? 'bg-green-50 border-green-100' : type === 'line' ? 'bg-blue-50 border-blue-100' : 'bg-red-50 border-red-100';

    return (
      <div className={cn(
        "p-5 rounded-[2.5rem] space-y-4 border transition-all duration-300 group relative",
        isEditing ? bgAccent : "bg-white border-secondary shadow-sm hover:shadow-md"
      )}>
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className={cn("w-8 h-8 rounded-xl flex items-center justify-center", isEditing ? "bg-white" : "bg-secondary")}>
              <Icon className={cn("w-4 h-4", accentColor)} />
            </div>
            <div>
              <span className={cn("text-[9px] font-black uppercase tracking-widest block", accentColor)}>
                {type === 'polygon' ? 'Area' : type === 'line' ? 'Jalur' : 'Titik'}
              </span>
              <Badge variant="outline" className="text-[7px] border-none bg-black/5 h-4 px-1 font-bold uppercase">
                {item.category || 'Umum'}
              </Badge>
            </div>
          </div>
          <div className="flex gap-1.5">
            <Button onClick={() => focusOnObject(item.coords)} size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-white/80 hover:bg-white shadow-sm">
              <Maximize2 className="w-3.5 h-3.5" />
            </Button>
            {!isEditing && (
              <Button onClick={() => startEditObject(item.coords)} size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-primary/10 text-primary hover:bg-primary hover:text-white shadow-sm">
                <Pencil className="w-3.5 h-3.5" />
              </Button>
            )}
            <Button onClick={() => removeObject(type, item.id)} size="icon" variant="ghost" className="h-8 w-8 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shadow-sm">
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3">
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Nama Objek</label>
              <Input 
                value={item.name} 
                onChange={(e) => updateObjectProperty(type, item.id, 'name', e.target.value)}
                disabled={!isEditing}
                className="bg-white/80 border-none h-10 text-xs font-bold shadow-inner rounded-xl"
                placeholder="Nama..."
              />
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Kategori</label>
              <Select 
                disabled={!isEditing} 
                value={item.category || 'Lainnya'} 
                onValueChange={(val) => updateObjectProperty(type, item.id, 'category', val)}
              >
                <SelectTrigger className="h-10 bg-white/80 border-none text-xs font-bold shadow-inner rounded-xl">
                  <SelectValue placeholder="Kategori" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  {CATEGORIES[type].map(cat => (
                    <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {type === 'marker' && isEditing && (
              <div className="space-y-1">
                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Pilih Ikon</label>
                <div className="grid grid-cols-6 gap-2 p-2 bg-white/50 rounded-xl shadow-inner border border-secondary/30">
                  {ICON_LIST.map((iconObj) => (
                    <button
                      key={iconObj.value}
                      onClick={() => updateObjectProperty('marker', item.id, 'icon', iconObj.value)}
                      className={cn(
                        "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                        item.icon === iconObj.value 
                          ? "bg-primary text-white shadow-md scale-110" 
                          : "bg-white text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <iconObj.icon className="w-4 h-4" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1">
              <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest px-1">Keterangan / Deskripsi</label>
              <Textarea 
                value={item.description || ''} 
                onChange={(e) => updateObjectProperty(type, item.id, 'description', e.target.value)}
                disabled={!isEditing}
                className="bg-white/80 border-none text-[10px] font-medium shadow-inner rounded-xl min-h-[60px] leading-relaxed"
                placeholder="Berikan keterangan lengkap objek ini..."
              />
            </div>

            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between px-1">
                <label className="text-[8px] font-black uppercase text-muted-foreground tracking-widest">Foto Pendukung</label>
                {item.imageUrl && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => updateObjectProperty(type, item.id, 'imageUrl', '')}
                    className="h-5 px-2 text-[7px] font-black uppercase text-red-500 hover:bg-red-50"
                  >
                    Hapus Foto
                  </Button>
                )}
              </div>
              <div className="relative group/img">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
                <Input 
                  value={item.imageUrl || ''} 
                  onChange={(e) => updateObjectProperty(type, item.id, 'imageUrl', e.target.value)}
                  disabled={!isEditing}
                  className="pl-9 bg-white/80 border-none h-10 text-[10px] font-bold shadow-inner rounded-xl"
                  placeholder="Paste URL gambar (HTTPS)..."
                />
              </div>
              {item.imageUrl && (
                <div className="relative h-28 w-full rounded-2xl overflow-hidden mt-2 border-2 border-white shadow-md group">
                  <img src={item.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ImageIcon className="text-white w-6 h-6 drop-shadow-lg" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center justify-between gap-2 px-3 py-2 bg-white/50 rounded-xl shadow-inner border border-secondary/30">
              <div className="flex items-center gap-2">
                <Palette className="w-3 h-3 text-muted-foreground" />
                <span className="text-[8px] font-bold uppercase text-muted-foreground">Warna</span>
              </div>
              <div className="flex gap-1.5">
                {COLOR_PALETTE.map(color => (
                  <button
                    key={color.value}
                    onClick={() => updateObjectProperty(type, item.id, 'color', color.value)}
                    className={cn(
                      "w-4 h-4 rounded-full border-2 transition-transform hover:scale-125",
                      item.color === color.value ? "border-white shadow-md scale-125" : "border-transparent"
                    )}
                    style={{ backgroundColor: color.value }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-2">
            <span className="w-6 h-[2px] bg-primary"></span>
            <Settings2 className="w-4 h-4" /> Konfigurasi Wilayah
          </div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-1">Editor Infrastruktur</h1>
          <p className="text-muted-foreground font-medium text-sm">Visualisasikan batas wilayah, jalur utilitas, dan titik layanan publik.</p>
        </div>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] h-14 px-8 border border-secondary">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-green-600 hover:bg-green-700 shadow-xl shadow-green-200 gap-3 font-black uppercase tracking-widest text-[10px] h-14 px-8 text-white">
                <Check className="w-4 h-4" /> Simpan Perubahan
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-[10px] h-14 px-8 text-white">
              <Edit3 className="w-4 h-4" /> Aktifkan Mode Gambar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[700px]">
        {/* Map Canvas */}
        <div className="lg:col-span-8 h-[600px] lg:h-auto relative">
          <Card className="h-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white relative">
            <div className="absolute inset-0 z-0">
               {isLoading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10">
                    <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-primary/40 animate-pulse">Sinkronisasi Peta...</p>
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
            <div className="absolute top-6 right-6 z-10 flex flex-col gap-2">
              <div className="bg-white/80 backdrop-blur-md p-1.5 rounded-2xl shadow-xl border border-white/50 flex flex-col gap-1">
                <Button size="icon" variant={activeLayer === 'satellite' ? 'default' : 'ghost'} onClick={() => setActiveLayer('satellite')} className="rounded-xl h-10 w-10"><Layers className="w-4 h-4" /></Button>
                <Button size="icon" variant={activeLayer === 'streets' ? 'default' : 'ghost'} onClick={() => setActiveLayer('streets')} className="rounded-xl h-10 w-10"><MapIcon className="w-4 h-4" /></Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Object Inspector Sidebar */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card className="border-none shadow-xl rounded-[3rem] p-8 bg-white flex-1 flex flex-col max-h-[850px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                  <Settings2 className="w-5 h-5" />
                </div>
                <h3 className="font-black text-primary uppercase text-sm tracking-widest">Inventaris Objek</h3>
              </div>
              <Badge className="bg-secondary text-primary font-black text-[9px] px-3 py-1 border-none uppercase tracking-widest">
                {stateData.polygons.length + stateData.lines.length + stateData.markers.length} Objek
              </Badge>
            </div>
            
            <ScrollArea className="flex-1 -mr-4 pr-4">
              <div className="space-y-6">
                {/* Polygons Section */}
                {stateData.polygons.length > 0 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
                      <Hexagon className="w-3 h-3" /> Area Wilayah
                    </div>
                    {stateData.polygons.map(poly => (
                      <ObjectCard key={poly.id} item={poly} type="polygon" />
                    ))}
                  </div>
                )}

                {/* Lines Section */}
                {stateData.lines.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-secondary/50">
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
                      <Route className="w-3 h-3" /> Jalur & Utilitas
                    </div>
                    {stateData.lines.map(line => (
                      <ObjectCard key={line.id} item={line} type="line" />
                    ))}
                  </div>
                )}

                {/* Markers Section */}
                {stateData.markers.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-secondary/50">
                    <div className="flex items-center gap-2 text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] px-2">
                      <MapPin className="w-3 h-3" /> Titik Layanan
                    </div>
                    {stateData.markers.map(marker => (
                      <ObjectCard key={marker.id} item={marker} type="marker" />
                    ))}
                  </div>
                )}

                {/* Empty State */}
                {stateData.polygons.length === 0 && stateData.lines.length === 0 && stateData.markers.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                    <div className="w-20 h-20 bg-secondary rounded-[2.5rem] flex items-center justify-center text-secondary-foreground/20">
                      <MapIcon className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-xs font-black uppercase tracking-widest text-primary/30">Peta Belum Memiliki Objek</p>
                      <p className="text-[10px] text-muted-foreground mt-2 max-w-[200px] mx-auto">Gunakan mode gambar untuk mulai memetakan wilayah RW 02.</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>

          {/* Tips Card */}
          <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 text-white p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/40 transition-all duration-700"></div>
            <div className="relative flex gap-4">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                <Info className="w-5 h-5 text-accent" />
              </div>
              <div className="space-y-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-accent">Tips Editor</h4>
                <p className="text-[10px] text-white/60 leading-relaxed italic">
                  Gunakan "Keterangan" untuk memberikan info mendalam seperti jadwal buka fasilitas atau detail ukuran drainase.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
