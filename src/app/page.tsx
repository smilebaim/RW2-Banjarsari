
'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  Layers, 
  Compass, 
  Info, 
  ShieldCheck, 
  Globe, 
  Map as MapIcon, 
  Moon,
  Database,
  Activity,
  Hexagon,
  Route,
  MapPin,
  Check,
  ChevronDown,
  ChevronRight,
  X,
  Zap,
} from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a] animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <Activity className="w-12 h-12 text-primary animate-pulse" />
        <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse"></div>
      </div>
      <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 animate-pulse">Sinkronisasi Peta Wilayah...</p>
    </div>
  </div>,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

type MapLayerType = 'satellite' | 'streets' | 'dark';

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

export default function Home() {
  const db = useFirestore();
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');
  const [visibility, setVisibility] = useState({
    lines: true,
    markers: true
  });
  
  // State for hidden polygons (area per RT)
  const [hiddenAreaIds, setHiddenAreaIds] = useState<Record<string, boolean>>({});

  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings } = useDoc(mapSettingsRef);

  const allPolygons = useMemo(() => 
    parseData(mapSettings?.polygons || mapSettings?.polygon, []), 
    [mapSettings?.polygons, mapSettings?.polygon]
  );
  
  const linesData = useMemo(() => 
    parseData(mapSettings?.lines, []), 
    [mapSettings?.lines]
  );
  
  const markersData = useMemo(() => 
    parseData(mapSettings?.markers, []), 
    [mapSettings?.markers]
  );

  // Filter out polygons based on hiddenAreaIds
  const polygonsData = useMemo(() => 
    allPolygons.filter((p: any) => !hiddenAreaIds[p.id]), 
    [allPolygons, hiddenAreaIds]
  );

  const totalInfraVisible = 
    polygonsData.length + 
    (visibility.lines ? linesData.length : 0) + 
    (visibility.markers ? markersData.length : 0);

  const isAnyPolygonVisible = allPolygons.length > 0 && allPolygons.some(p => !hiddenAreaIds[p.id]);
  const isAnyLayerActive = isAnyPolygonVisible || visibility.lines || visibility.markers;

  const toggleAllPolygons = (show: boolean) => {
    if (show) {
      setHiddenAreaIds({});
    } else {
      const next: Record<string, boolean> = {};
      allPolygons.forEach((p: any) => {
        next[p.id] = true;
      });
      setHiddenAreaIds(next);
    }
  };

  const toggleSinglePolygon = (id: string, isChecked: boolean) => {
    setHiddenAreaIds(prev => {
      const next = { ...prev };
      if (isChecked) {
        delete next[id];
      } else {
        next[id] = true;
      }
      return next;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#020403]">
      <div className="absolute inset-0 z-0">
        <LeafletMap 
          center={COORDINATES} 
          zoom={ZOOM_LEVEL} 
          layer={activeLayer} 
          locked={false}
          showBoundary={true}
          showPolygons={true}
          showLines={visibility.lines}
          showMarkers={visibility.markers}
          polygonsData={polygonsData}
          linesData={linesData}
          markersData={markersData}
        />
      </div>

      {/* Modern Floating Header */}
      <div className="absolute top-10 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="w-fit bg-black/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] p-1.5 flex items-center gap-2 pointer-events-auto transition-all hover:bg-black/60 hover:border-primary/30">
          <div className="flex items-center gap-4 pl-6 pr-4 py-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-primary shadow-[0_0_12px_rgba(var(--primary),1)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black text-white uppercase tracking-[0.3em] leading-none mb-1">RW 02 Banjarsari</span>
              <span className="text-[9px] font-bold text-primary tracking-widest leading-none flex items-center gap-1.5 uppercase">
                <Zap className="w-2.5 h-2.5" /> Portal Digital Wilayah
              </span>
            </div>
          </div>
          
          <div className="h-10 w-px bg-white/10 mx-1" />
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full w-12 h-12 text-white/50 hover:bg-primary hover:text-white transition-all duration-500" 
                  asChild
                >
                  <Link href="/login">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest mb-4 px-5 py-2.5 rounded-2xl shadow-2xl">
                Login Dashboard
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Interactive Cyber-Control Sidebar */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        <TooltipProvider delayDuration={0}>
          
          {/* Visual Layer Switcher */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/60 hover:bg-primary hover:text-white hover:border-primary/50 transition-all duration-500 group"
                  >
                    <Layers className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
                Visual Peta
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="center" className="bg-black/80 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[180px] shadow-2xl">
              {[
                { id: 'satellite', label: 'Satelit Esri', icon: Globe, color: 'text-blue-400' },
                { id: 'streets', label: 'Peta Jalan', icon: MapIcon, color: 'text-green-400' },
                { id: 'dark', label: 'Mode Malam', icon: Moon, color: 'text-purple-400' },
              ].map((layer) => (
                <DropdownMenuItem 
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayerType)}
                  className={cn(
                    "flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest mb-1",
                    activeLayer === layer.id ? 'bg-primary text-white shadow-lg' : 'text-white/60 hover:bg-white/5'
                  )}
                >
                  <layer.icon className={cn("w-4 h-4", layer.color)} />
                  {layer.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Granular Data Layer Checklist */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl border border-white/10 transition-all duration-500 group",
                      isAnyLayerActive ? 'text-primary' : 'text-white/30'
                    )}
                  >
                    <Database className="w-6 h-6 transition-transform group-hover:scale-110" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
                Data Infrastruktur
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="center" className="bg-black/90 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[280px] shadow-2xl">
              <div className="px-5 py-4 mb-2 border-b border-white/5">
                <p className="text-[11px] font-black text-white/30 uppercase tracking-[0.2em]">Inventaris Digital</p>
              </div>
              
              {/* Hierarchical Area per RT selection */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-colors font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/10">
                  <Hexagon className="w-4 h-4 text-green-500" />
                  Pilih Area (Per RT)
                  <ChevronRight className="ml-auto w-3 h-3 text-white/30" />
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[240px] ml-2">
                   <div className="grid grid-cols-2 gap-2 mb-3">
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleAllPolygons(true)}
                        className="h-10 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-primary hover:text-white rounded-xl"
                      >
                       Pilih Semua
                     </Button>
                     <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => toggleAllPolygons(false)}
                        className="h-10 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl"
                      >
                       Sembunyikan
                     </Button>
                   </div>
                  <DropdownMenuSeparator className="bg-white/5" />
                  <ScrollArea className="h-[350px] mt-2">
                    <div className="space-y-1.5">
                      {allPolygons.length > 0 ? (
                        allPolygons.map((p: any) => (
                          <DropdownMenuCheckboxItem
                            key={p.id}
                            checked={!hiddenAreaIds[p.id]}
                            onCheckedChange={(checked) => toggleSinglePolygon(p.id, checked)}
                            className="flex items-center gap-4 px-4 py-3.5 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/60 focus:bg-white/5 data-[state=checked]:text-white"
                          >
                            <div className="relative flex h-3 w-3 mr-1">
                              <div className="absolute inset-0 rounded-full blur-sm opacity-50" style={{ backgroundColor: p.color || '#22c55e' }} />
                              <div className="relative w-3 h-3 rounded-full border border-white/20" style={{ backgroundColor: p.color || '#22c55e' }} />
                            </div>
                            <span className="truncate flex-1 tracking-widest">{p.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <p className="text-[9px] font-black text-white/20 uppercase tracking-widest italic">Data area belum tersedia</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              {/* Static Infrastructure Filters */}
              <DropdownMenuCheckboxItem
                checked={visibility.lines}
                onCheckedChange={(checked) => setVisibility(v => ({ ...v, lines: !!checked }))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/10 mb-1"
              >
                <Route className="w-4 h-4 text-blue-500" />
                Jalur & Drainase
              </DropdownMenuCheckboxItem>
              
              <DropdownMenuCheckboxItem
                checked={visibility.markers}
                onCheckedChange={(checked) => setVisibility(v => ({ ...v, markers: !!checked }))}
                className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-all font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/10"
              >
                <MapPin className="w-4 h-4 text-red-500" />
                Titik Fasilitas
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Quick Action Tools */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/40 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Compass className="w-6 h-6 transition-transform group-hover:scale-110" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
              Kalibrasi Fokus
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                className="w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/40 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Info className="w-6 h-6 transition-transform group-hover:scale-110" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
              Informasi Geografis
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Futuristic Connection HUD Panel */}
      {isAnyLayerActive && (
        <div className="absolute bottom-32 inset-x-0 z-20 flex justify-center pointer-events-none px-6">
          <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-8 py-4 flex flex-col md:flex-row items-center gap-8 pointer-events-auto animate-in slide-in-from-bottom-20 duration-1000">
             <div className="flex items-center gap-4">
               <div className="relative flex h-3 w-3">
                 <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
                 <div className="relative w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-[11px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">{totalInfraVisible} Infrastruktur Aktif</span>
                 <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest">Sistem Pemetaan Terkoneksi</span>
               </div>
             </div>

             <div className="hidden md:block h-10 w-px bg-white/10" />

             <div className="flex flex-wrap justify-center gap-4">
               {polygonsData.length > 0 && (
                 <Badge variant="outline" className="bg-green-500/5 border-green-500/20 text-green-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                   {polygonsData.length} Area RT
                 </Badge>
               )}
               {visibility.lines && linesData.length > 0 && (
                 <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                   {linesData.length} Jaringan Jalan
                 </Badge>
               )}
               {visibility.markers && markersData.length > 0 && (
                 <Badge variant="outline" className="bg-red-500/5 border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                   {markersData.length} Fasum / Titik Penting
                 </Badge>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Ambient Gradient Overlays for Depth */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
