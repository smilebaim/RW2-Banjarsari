
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
  Image as ImageIcon,
  Save,
  Eye,
  Crosshair,
  Type,
  Tag,
  Hash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapObject } from '@/components/map/LeafletMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  { value: '#22c55e', label: 'Hijau (Area/Taman)' },
  { value: '#3b82f6', label: 'Biru (Jalan/Drainase)' },
  { value: '#ef4444', label: 'Merah (Darurat/Pos)' },
  { value: '#f59e0b', label: 'Oranye (Utilitas)' },
  { value: '#8b5cf6', label: 'Ungu (Sosial)' },
  { value: '#06b6d4', label: 'Sian (IT/Internet)' },
  { value: '#000000', label: 'Hitam (Batas)' },
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
      title: "Konfigurasi Berhasil Disimpan",
      description: "Data geospasial telah diperbarui dan kini sinkron secara publik.",
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
          "rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden bg-white",
          isFocused ? "border-primary shadow-2xl ring-4 ring-primary/5" : "border-secondary hover:border-primary/20 shadow-sm"
        )}
      >
        <CardContent className="p-0">
          <div className={cn("p-6 flex items-center justify-between border-b", isFocused ? "bg-primary/5 border-primary/10" : "bg-secondary/5 border-secondary")}>
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner bg-white")}>
                <Icon className={cn("w-6 h-6", accentColor)} />
              </div>
              <div>
                <span className={cn("text-[9px] font-black uppercase tracking-widest block leading-none mb-1 opacity-70")}>
                  {type === 'polygon' ? 'Area Wilayah' : type === 'line' ? 'Infrastruktur Jalur' : 'Titik Fasilitas'}
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

          <div className="p-0">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="w-full h-14 bg-secondary/30 rounded-none border-b border-secondary p-0">
                <TabsTrigger value="info" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black uppercase text-[9px] tracking-widest gap-2">
                  <Type className="w-3.5 h-3.5" /> Detail
                </TabsTrigger>
                <TabsTrigger value="style" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black uppercase text-[9px] tracking-widest gap-2">
                  <Palette className="w-3.5 h-3.5" /> Gaya
                </TabsTrigger>
                <TabsTrigger value="media" className="flex-1 h-full rounded-none data-[state=active]:bg-white data-[state=active]:text-primary font-black uppercase text-[9px] tracking-widest gap-2">
                  <ImageIcon className="w-3.5 h-3.5" /> Media
                </TabsTrigger>
              </TabsList>

              <div className="p-8">
                <TabsContent value="info" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-1 flex items-center gap-2">
                        <Tag className="w-3 h-3" /> Label Nama Objek
                      </label>
                      <Input 
                        value={item.name} 
                        onChange={(e) => updateObjectProperty(type, item.id, 'name', e.target.value)}
                        className="bg-secondary/40 border-none h-12 text-xs font-bold rounded-xl focus:ring-primary shadow-inner"
                        placeholder="Contoh: Balai Warga RW 02"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-1 flex items-center gap-2">
                        <Layers className="w-3 h-3" /> Kategori
                      </label>
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
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black uppercase text-muted-foreground tracking-[0.2em] px-1 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Deskripsi Tambahan
                      </label>
                      <Textarea 
                        value={item.description || ''} 
                        onChange={(e) => updateObjectProperty(type, item.id, 'description', e.target.value)}
                        className="bg-secondary/40 border-none text-[11px] font-medium rounded-2xl min-h-[100px] leading-relaxed p-4 shadow-inner"
                        placeholder="Catatan kondisi, kapasitas, atau informasi lainnya..."
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="style" className="mt-0 space-y-6">
                  <div className="space-y-6">
                    <div className="p-5 bg-secondary/30 rounded-3xl space-y-4 shadow-inner">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <Palette className="w-3.5 h-3.5" /> Warna Identitas
                        </label>
                        <div className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                      </div>
                      <div className="flex flex-wrap gap-2.5">
                        {COLOR_PALETTE.map(color => (
                          <button
                            key={color.value}
                            onClick={() => updateObjectProperty(type, item.id, 'color', color.value)}
                            className={cn(
                              "w-7 h-7 rounded-full border-2 transition-all hover:scale-110",
                              item.color === color.value ? "border-white shadow-lg ring-2 ring-primary/20 scale-110" : "border-transparent opacity-60 hover:opacity-100"
                            )}
                            style={{ backgroundColor: color.value }}
                            title={color.label}
                          />
                        ))}
                      </div>
                    </div>

                    {type === 'marker' && (
                      <div className="p-5 bg-secondary/30 rounded-3xl space-y-4 shadow-inner">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5" /> Ikon Penanda
                        </label>
                        <div className="grid grid-cols-6 gap-2">
                          {ICON_LIST.map((iconObj) => (
                            <button
                              key={iconObj.value}
                              onClick={() => updateObjectProperty('marker', item.id, 'icon', iconObj.value)}
                              className={cn(
                                "h-10 rounded-xl flex items-center justify-center transition-all border",
                                item.icon === iconObj.value 
                                  ? "bg-primary text-white border-primary shadow-md" 
                                  : "bg-white/50 border-secondary text-muted-foreground hover:bg-white"
                              )}
                              title={iconObj.label}
                            >
                              <Crosshair className="w-4 h-4" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="p-4 border-2 border-dashed border-secondary rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        <Hash className="w-3 h-3" /> Data Koordinat (Auto)
                      </div>
                      <p className="text-[9px] font-mono text-muted-foreground leading-none truncate bg-white p-2 rounded border border-secondary shadow-inner">
                        {JSON.stringify(item.coords)}
                      </p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="media" className="mt-0 space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between px-1">
                        <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest flex items-center gap-2">
                          <LinkIcon className="w-3 h-3" /> URL Foto Lapangan
                        </label>
                        {item.imageUrl && <Badge className="bg-green-500/10 text-green-600 text-[8px] border-none">Media Aktif</Badge>}
                      </div>
                      <Input 
                        value={item.imageUrl || ''} 
                        onChange={(e) => updateObjectProperty(type, item.id, 'imageUrl', e.target.value)}
                        className="bg-secondary/40 border-none h-12 text-[10px] font-bold rounded-xl shadow-inner"
                        placeholder="Tempel tautan gambar (HTTPS)..."
                      />
                    </div>
                    
                    {item.imageUrl ? (
                      <div className="relative h-56 w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-2xl bg-secondary/10 group/img">
                        <img 
                          src={item.imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
                          onError={(e) => (e.currentTarget.src = 'https://placehold.co/600x400?text=Tautan+Gambar+Salah')}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                          <Maximize2 className="text-white w-8 h-8" />
                        </div>
                      </div>
                    ) : (
                      <div className="h-56 w-full rounded-[2.5rem] bg-secondary/20 border-2 border-dashed border-secondary flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <ImageIcon className="w-10 h-10 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Belum ada foto</p>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-12 pb-40">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em]">
            <span className="w-8 h-[2px] bg-primary"></span>
            <Settings2 className="w-4 h-4 animate-spin-slow" /> Geospasial Intelligence
          </div>
          <h1 className="text-4xl lg:text-6xl font-black text-primary uppercase tracking-tighter leading-none">Editor <span className="text-gray-900">Wilayah</span></h1>
          <p className="text-muted-foreground font-medium text-base italic border-l-4 border-accent pl-6 max-w-2xl leading-relaxed">
            Sistem pemetaan digital untuk mengelola inventaris aset, jalur utilitas, dan batas administratif RW 02 Banjarsari secara presisi.
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

            {isEditing && (
              <div className="absolute bottom-10 inset-x-10 z-10 pointer-events-none">
                <div className="max-w-md mx-auto bg-primary/95 backdrop-blur-3xl text-white p-6 rounded-[2.5rem] flex items-center gap-6 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-8 duration-500">
                  <div className="w-14 h-14 bg-white rounded-3xl flex items-center justify-center shrink-0 shadow-lg">
                    <Pencil className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest leading-none mb-2 text-white">Mode Gambar Aktif</p>
                    <p className="text-[11px] font-medium opacity-80 italic leading-tight">Gunakan alat gambar di sisi kiri peta untuk menambah objek baru.</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              { label: 'Luasan Area', value: stateData.polygons.length, icon: Hexagon, color: 'bg-green-600' },
              { label: 'Infrastruktur Jalur', value: stateData.lines.length, icon: Route, color: 'bg-blue-600' },
              { label: 'Titik Fasilitas', value: stateData.markers.length, icon: MapPin, color: 'bg-red-600' },
            ].map((stat, i) => (
              <Card key={i} className="border-none shadow-xl rounded-[3rem] bg-white p-8 group hover:shadow-2xl transition-all duration-700">
                <div className="flex items-center gap-6">
                  <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-2xl transition-all group-hover:rotate-12", stat.color)}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground mb-1">{stat.label}</p>
                    <h3 className="text-4xl font-black text-gray-900 leading-none">{stat.value}</h3>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="lg:col-span-12 xl:col-span-4 space-y-8 animate-in fade-in duration-1000 delay-300">
          <div className="flex items-center justify-between px-4">
             <div className="flex items-center gap-3">
               <Eye className="w-5 h-5 text-primary" />
               <h3 className="text-xl font-black uppercase tracking-tighter text-primary">Inspektor Objek</h3>
             </div>
             <Badge className="bg-primary/10 text-primary border-none font-black px-5 py-2 rounded-full uppercase text-[9px] tracking-widest shadow-inner">
               {stateData.polygons.length + stateData.lines.length + stateData.markers.length} Data Terdaftar
             </Badge>
          </div>

          <div className="space-y-6 h-[850px] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-secondary">
             {/* List of Objects */}
             {stateData.polygons.map(obj => <ObjectCard key={obj.id} item={obj} type="polygon" />)}
             {stateData.lines.map(obj => <ObjectCard key={obj.id} item={obj} type="line" />)}
             {stateData.markers.map(obj => <ObjectCard key={obj.id} item={obj} type="marker" />)}

             {stateData.polygons.length === 0 && stateData.lines.length === 0 && stateData.markers.length === 0 && (
               <div className="py-32 text-center bg-secondary/10 rounded-[4rem] border-4 border-dashed border-secondary/20">
                  <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-inner opacity-30">
                    <MapIcon className="w-12 h-12 text-primary" />
                  </div>
                  <h4 className="text-xl font-black uppercase text-primary/30 tracking-[0.3em] leading-none mb-4">Basis Data Kosong</h4>
                  <p className="text-xs text-muted-foreground px-14 italic font-medium">Masuk ke mode gambar untuk mulai memetakan infrastruktur wilayah Anda.</p>
               </div>
             )}
          </div>

          <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-900 text-white p-10 overflow-hidden relative group">
             <div className="absolute top-0 right-0 w-40 h-40 bg-primary/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-primary/40 transition-all duration-1000"></div>
             <div className="relative space-y-8">
                <div className="w-16 h-16 bg-accent rounded-3xl flex items-center justify-center text-black shadow-2xl rotate-3">
                  <Info className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-2xl font-black uppercase tracking-tighter text-accent leading-none mb-6">Panduan Input</h3>
                  <div className="space-y-5">
                    {[
                      "Gunakan TAB Media untuk memantau foto lokasi.",
                      "Pilih warna yang sesuai dengan standar kategori.",
                      "Isi deskripsi dengan instruksi pemeliharaan.",
                      "Fokus ke objek menggunakan tombol ikon kacamata."
                    ].map((text, i) => (
                      <div key={i} className="flex gap-4">
                        <Check className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <p className="text-xs font-medium text-white/70 italic leading-snug">{text}</p>
                      </div>
                    ))}
                  </div>
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

