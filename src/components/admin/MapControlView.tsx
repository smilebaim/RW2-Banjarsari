
"use client";

import { useState, useEffect, useMemo } from 'react';
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
  Image as ImageIcon,
  Save,
  Eye,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapObject } from '@/components/map/LeafletMap';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <p className="text-[10px] font-black uppercase tracking-widest text-primary/50">Memuat Antarmuka Peta...</p>
    </div>
  </div>,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

const COLOR_PALETTE = [
  { value: '#22c55e', label: 'Hijau' },
  { value: '#3b82f6', label: 'Biru' },
  { value: '#ef4444', label: 'Merah' },
  { value: '#f59e0b', label: 'Oranye' },
  { value: '#8b5cf6', label: 'Ungu' },
  { value: '#06b6d4', label: 'Sian' },
  { value: '#000000', label: 'Hitam' },
];

const ICON_LIST = [
  { value: 'pin', label: 'Default' },
  { value: 'home', label: 'Hunian' },
  { value: 'shield', label: 'Keamanan' },
  { value: 'hospital', label: 'Medis' },
  { value: 'zap', label: 'Listrik' },
  { value: 'droplet', label: 'Air' },
  { value: 'trees', label: 'Taman' },
  { value: 'school', label: 'Sekolah' },
  { value: 'shopping', label: 'Pasar' },
  { value: 'dining', label: 'Kuliner' },
  { value: 'cctv', label: 'Kamera' },
  { value: 'wifi', label: 'Internet' },
  { value: 'trash', label: 'Kebersihan' },
  { value: 'parking', label: 'Parkir' },
  { value: 'social', label: 'Balai Warga' },
  { value: 'office', label: 'Sekretariat' },
];

const CATEGORIES = {
  polygon: ['Batas Wilayah', 'Fasilitas Umum', 'Area Hijau', 'Pemukiman', 'Lahan Kosong', 'Lainnya'],
  line: ['Jalan Utama', 'Jalan Lingkungan', 'Drainase / Selokan', 'Jalur Kabel Optik', 'Jalur Pipa Air', 'Lainnya'],
  marker: ['Keamanan (Pos)', 'Kesehatan', 'Ibadah', 'Pendidikan', 'Niaga/Warung', 'Sosial/Budaya', 'Infrastruktur IT', 'Lainnya']
};

export function MapControlView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [activeLayer, setActiveLayer] = useState<'satellite' | 'streets'>('satellite');
  const [isEditing, setIsEditing] = useState(false);
  const [focusTrigger, setFocusTrigger] = useState<{ coords: [number, number], zoom: number } | null>(null);
  const [selectedObjectId, setSelectedObjectId] = useState<string | null>(null);
  
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
      title: "Data Disimpan",
      description: "Seluruh perubahan peta wilayah telah diperbarui secara publik.",
    });
  };

  const updateObjectProperty = (type: 'line' | 'marker' | 'polygon', id: string, property: keyof MapObject, value: any) => {
    setStateData(prev => {
      const target = type === 'polygon' ? 'polygons' : type === 'line' ? 'lines' : 'markers';
      return { 
        ...prev, 
        [target]: prev[target].map(obj => obj.id === id ? { ...obj, [property]: value } : obj) 
      };
    });
  };

  const removeObject = (type: 'line' | 'marker' | 'polygon', id: string) => {
    setStateData(prev => {
      const target = type === 'polygon' ? 'polygons' : type === 'line' ? 'lines' : 'markers';
      return { ...prev, [target]: prev[target].filter(obj => obj.id !== id) };
    });
    if (selectedObjectId === id) setSelectedObjectId(null);
  };

  const focusOnObject = (coords: any, id: string) => {
    if (!coords) return;
    let target: [number, number];
    if (Array.isArray(coords[0])) {
      target = (Array.isArray(coords[0][0]) ? coords[0][0] : coords[0]) as [number, number];
    } else {
      target = coords as [number, number];
    }
    setFocusTrigger({ coords: target, zoom: 19 });
    setSelectedObjectId(id);
  };

  const ObjectCard = ({ item, type }: { item: MapObject, type: 'polygon' | 'line' | 'marker' }) => {
    const isFocused = selectedObjectId === item.id;
    const Icon = type === 'polygon' ? Hexagon : type === 'line' ? Route : MapPin;
    const accentColor = type === 'polygon' ? 'text-green-600' : type === 'line' ? 'text-blue-600' : 'text-red-600';
    const bgAccent = type === 'polygon' ? 'bg-green-50' : type === 'line' ? 'bg-blue-50' : 'bg-red-50';

    return (
      <Card 
        className={cn(
          "rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden group bg-white",
          isFocused ? "border-primary shadow-2xl ring-4 ring-primary/5" : "border-secondary hover:border-primary/20 shadow-sm"
        )}
      >
        <CardContent className="p-0">
          {/* Card Header HUD */}
          <div className={cn("p-6 flex items-center justify-between border-b", isFocused ? "bg-primary/5 border-primary/10" : "bg-secondary/10 border-secondary")}>
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-white")}>
                <Icon className={cn("w-6 h-6", accentColor)} />
              </div>
              <div>
                <span className={cn("text-[10px] font-black uppercase tracking-widest block leading-none mb-1", accentColor)}>
                  {type === 'polygon' ? 'Area Wilayah' : type === 'line' ? 'Jalur Infrastruktur' : 'Titik Fasilitas'}
                </span>
                <p className="text-sm font-black uppercase tracking-tighter text-gray-900 leading-none">{item.name || 'Tanpa Nama'}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => focusOnObject(item.coords, item.id)} 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 rounded-xl bg-white shadow-sm hover:bg-primary hover:text-white transition-all"
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
              <Button 
                onClick={() => removeObject(type, item.id)} 
                size="icon" 
                variant="ghost" 
                className="h-10 w-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white shadow-sm transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Label / Identitas Objek</label>
                  <Input 
                    value={item.name} 
                    onChange={(e) => updateObjectProperty(type, item.id, 'name', e.target.value)}
                    className="bg-secondary/40 border-none h-12 text-xs font-bold rounded-xl focus:ring-primary shadow-inner"
                    placeholder="Contoh: Balai Warga RW 02"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Kategori Geospasial</label>
                  <Select 
                    value={item.category || 'Lainnya'} 
                    onValueChange={(val) => updateObjectProperty(type, item.id, 'category', val)}
                  >
                    <SelectTrigger className="h-12 bg-secondary/40 border-none text-xs font-bold rounded-xl shadow-inner">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl">
                      {CATEGORIES[type].map(cat => (
                        <SelectItem key={cat} value={cat} className="text-xs font-medium">{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-4 p-4 bg-secondary/30 rounded-2xl shadow-inner">
                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest">Warna Peta</span>
                  </div>
                  <div className="flex gap-1.5">
                    {COLOR_PALETTE.map(color => (
                      <button
                        key={color.value}
                        onClick={() => updateObjectProperty(type, item.id, 'color', color.value)}
                        className={cn(
                          "w-6 h-6 rounded-full border-2 transition-all hover:scale-125",
                          item.color === color.value ? "border-white shadow-lg scale-125 ring-2 ring-primary/20" : "border-transparent"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Detail & Keterangan</label>
                  <Textarea 
                    value={item.description || ''} 
                    onChange={(e) => updateObjectProperty(type, item.id, 'description', e.target.value)}
                    className="bg-secondary/40 border-none text-[11px] font-medium rounded-2xl min-h-[108px] leading-relaxed p-4 shadow-inner"
                    placeholder="Informasi operasional, kondisi fisik, atau catatan teknis..."
                  />
                </div>
                {type === 'marker' && (
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Ikon Penanda</label>
                    <div className="grid grid-cols-8 gap-1.5 p-2 bg-secondary/40 rounded-2xl shadow-inner border border-secondary/20">
                      {ICON_LIST.map((iconObj) => (
                        <button
                          key={iconObj.value}
                          onClick={() => updateObjectProperty('marker', item.id, 'icon', iconObj.value)}
                          className={cn(
                            "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                            item.icon === iconObj.value 
                              ? "bg-primary text-white shadow-lg" 
                              : "bg-white/50 text-muted-foreground hover:bg-white"
                          )}
                          title={iconObj.label}
                        >
                          <MapPin className="w-3.5 h-3.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Media HUD Section */}
            <div className="pt-6 border-t border-secondary">
               <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-[9px] font-black uppercase text-muted-foreground tracking-widest px-1">Tautan Foto Pendukung (HTTPS)</label>
                    {item.imageUrl && (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 text-[8px] font-black">Media Aktif</Badge>
                    )}
                  </div>
                  <div className="relative group/img">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      value={item.imageUrl || ''} 
                      onChange={(e) => updateObjectProperty(type, item.id, 'imageUrl', e.target.value)}
                      className="pl-12 bg-secondary/40 border-none h-12 text-[10px] font-bold rounded-xl shadow-inner"
                      placeholder="https://images.unsplash.com/photo-..."
                    />
                  </div>
                  {item.imageUrl && (
                    <div className="relative h-48 w-full rounded-[2rem] overflow-hidden mt-4 border-4 border-secondary/20 shadow-2xl group/prev bg-secondary/10">
                      <img src={item.imageUrl} alt="Pratinjau" className="w-full h-full object-cover transition-transform duration-700 group-hover/prev:scale-110" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/prev:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                        <ImageIcon className="text-white w-10 h-10" />
                      </div>
                    </div>
                  )}
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12 pb-40">
      {/* Page Header HUD */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <span className="w-8 h-[2px] bg-primary"></span>
            <Settings2 className="w-4 h-4 animate-spin-slow" /> Geospasial Intelligence
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary uppercase tracking-tighter leading-none">Editor <span className="text-gray-900">Wilayah</span></h1>
          <p className="text-muted-foreground font-medium text-base italic border-l-4 border-accent pl-6 max-w-2xl">
            Sistem pemetaan digital untuk mengelola inventaris aset, infrastruktur, dan batas administratif RW 02 Banjarsari.
          </p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {isEditing ? (
            <>
              <Button onClick={() => setIsEditing(false)} variant="ghost" className="rounded-2xl gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-8 bg-white border border-secondary shadow-sm hover:bg-red-50 hover:text-red-600 transition-all">
                <X className="w-5 h-5" /> Batal Edit
              </Button>
              <Button onClick={handleSaveMap} className="rounded-2xl bg-primary hover:bg-primary/90 shadow-2xl shadow-primary/30 gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-10 text-white transition-all hover:scale-105">
                <Save className="w-5 h-5" /> Simpan Konfigurasi
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)} className="rounded-2xl bg-zinc-900 text-white shadow-2xl gap-3 font-black uppercase tracking-widest text-[10px] h-16 px-10 transition-all hover:scale-105">
              <Pencil className="w-5 h-5 text-accent" /> Masuk Mode Gambar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Map Canvas - Main Left */}
        <div className="lg:col-span-12 xl:col-span-8 space-y-8">
          <Card className="h-[650px] border-none shadow-2xl rounded-[4rem] overflow-hidden bg-white relative group/map">
            <div className="absolute inset-0 z-0">
               {isLoading ? (
                 <div className="w-full h-full flex flex-col items-center justify-center bg-secondary/10">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary animate-pulse">Menghubungkan ke Jaringan Satelit...</p>
                 </div>
               ) : (
                 <LeafletMap 
                   key={isEditing ? 'editing' : 'viewing'}
                   center={focusTrigger?.coords || COORDINATES} 
                   zoom={focusTrigger?.zoom || ZOOM_LEVEL} 
                   layer={activeLayer} 
                   showBoundary={true}
                   editable={isEditing}
                   polygonsData={stateData.polygons}
                   linesData={stateData.lines}
                   markersData={stateData.markers}
                   onDataChange={(data) => setStateData({ polygons: data.polygons, lines: data.lines, markers: data.markers })}
                 />
               )}
            </div>

            {/* Layer Controls HUD */}
            <div className="absolute top-10 right-10 z-10 flex flex-col gap-4">
              <div className="bg-black/80 backdrop-blur-2xl p-2.5 rounded-[2rem] shadow-2xl border border-white/20 flex flex-col gap-3">
                <Button size="icon" variant={activeLayer === 'satellite' ? 'default' : 'ghost'} onClick={() => setActiveLayer('satellite')} className="rounded-2xl h-14 w-14 transition-all">
                  <Layers className="w-6 h-6" />
                </Button>
                <Button size="icon" variant={activeLayer === 'streets' ? 'default' : 'ghost'} onClick={() => setActiveLayer('streets')} className="rounded-2xl h-14 w-14 transition-all text-white/50 hover:text-white">
                  <MapIcon className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Editing Warning HUD */}
            {isEditing && (
              <div className="absolute bottom-10 inset-x-10 z-10 pointer-events-none">
                <div className="max-w-md mx-auto bg-primary/90 backdrop-blur-3xl text-white p-6 rounded-[2rem] flex items-center gap-6 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-8">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shrink-0">
                    <Pencil className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-1.5">Mode Gambar Aktif</p>
                    <p className="text-xs font-medium opacity-80 italic">Gunakan alat di sisi kiri peta untuk menambah area, jalur, atau titik baru.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Total Area', value: stateData.polygons.length, icon: Hexagon, color: 'bg-green-600' },
              { label: 'Jalur Utilitas', value: stateData.lines.length, icon: Route, color: 'bg-blue-600' },
              { label: 'Titik Fasilitas', value: stateData.markers.length, icon: MapPin, color: 'bg-red-600' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl rounded-[2.5rem] bg-white p-8 group hover:shadow-2xl transition-all duration-500">
                <div className="flex items-center gap-5">
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:rotate-6", stat.color)}>
                    <stat.icon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-3xl font-black text-gray-900 leading-none">{stat.value}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Object Inspector - Sidebar Right */}
        <div className="lg:col-span-12 xl:col-span-4 space-y-8 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
               <Eye className="w-5 h-5 text-primary" />
               <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Inspektor Objek</h3>
             </div>
             <Badge className="bg-secondary text-primary font-black px-4 py-1.5 rounded-full uppercase text-[9px] tracking-widest">
               {stateData.polygons.length + stateData.lines.length + stateData.markers.length} Objek
             </Badge>
          </div>

          <div className="space-y-6 h-[850px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-secondary">
             {/* Polygons */}
             {stateData.polygons.map(obj => <ObjectCard key={obj.id} item={obj} type="polygon" />)}
             {/* Lines */}
             {stateData.lines.map(obj => <ObjectCard key={obj.id} item={obj} type="line" />)}
             {/* Markers */}
             {stateData.markers.map(obj => <ObjectCard key={obj.id} item={obj} type="marker" />)}

             {/* Empty State */}
             {stateData.polygons.length === 0 && stateData.lines.length === 0 && stateData.markers.length === 0 && (
               <div className="py-32 text-center bg-secondary/10 rounded-[3rem] border-4 border-dashed border-secondary/20">
                  <div className="w-20 h-20 bg-white rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-inner opacity-40">
                    <MapIcon className="w-10 h-10 text-primary" />
                  </div>
                  <h4 className="text-lg font-black uppercase text-primary/30 tracking-widest leading-none mb-4">Basis Data Kosong</h4>
                  <p className="text-xs text-muted-foreground px-10 italic">Aktifkan mode gambar untuk memetakan aset wilayah Anda.</p>
               </div>
             )}
          </div>

          {/* Quick Guide HUD */}
          <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-900 text-white p-10 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/40 transition-all duration-1000"></div>
             <div className="relative space-y-6">
                <div className="w-14 h-14 bg-accent rounded-2xl flex items-center justify-center text-black shadow-2xl">
                  <Info className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tighter text-accent leading-none">Panduan Editor</h3>
                <div className="space-y-4">
                  {[
                    "Klik objek di peta untuk mengunci fokus.",
                    "Isi deskripsi detail untuk setiap infrastruktur.",
                    "Gunakan HTTPS untuk tautan gambar pendukung.",
                    "Selalu 'Simpan Konfigurasi' setelah perubahan."
                  ].map((text, i) => (
                    <div key={i} className="flex gap-4">
                      <Check className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                      <p className="text-[11px] font-medium text-white/70 italic leading-tight">{text}</p>
                    </div>
                  ))}
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
