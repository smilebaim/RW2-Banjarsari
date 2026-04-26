
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  Compass, 
  Info, 
  ShieldCheck, 
  Map as MapIcon, 
  Database,
  Activity,
  Hexagon,
  Route,
  MapPin,
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
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuTrigger,
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
  
  // Visibility States
  const [hiddenAreaIds, setHiddenAreaIds] = useState<Record<string, boolean>>({});
  const [hiddenLineIds, setHiddenLineIds] = useState<Record<string, boolean>>({});
  const [hiddenMarkerIds, setHiddenMarkerIds] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings } = useDoc(mapSettingsRef);

  // Memoized parsed data
  const allPolygons = useMemo(() => parseData(mapSettings?.polygons || mapSettings?.polygon, []), [mapSettings]);
  const allLines = useMemo(() => parseData(mapSettings?.lines, []), [mapSettings]);
  const allMarkers = useMemo(() => parseData(mapSettings?.markers, []), [mapSettings]);

  // Handle Initial Visibility: Show only areas by default
  useEffect(() => {
    if (!isInitialized && mapSettings && (allLines.length > 0 || allMarkers.length > 0)) {
      const initialHiddenLines: Record<string, boolean> = {};
      allLines.forEach((l: any) => { initialHiddenLines[l.id] = true; });
      
      const initialHiddenMarkers: Record<string, boolean> = {};
      allMarkers.forEach((m: any) => { initialHiddenMarkers[m.id] = true; });

      setHiddenLineIds(initialHiddenLines);
      setHiddenMarkerIds(initialHiddenMarkers);
      setIsInitialized(true);
    }
  }, [mapSettings, allLines, allMarkers, isInitialized]);

  // Filtered data based on visibility toggles
  const polygonsData = useMemo(() => allPolygons.filter((p: any) => !hiddenAreaIds[p.id]), [allPolygons, hiddenAreaIds]);
  const linesData = useMemo(() => allLines.filter((l: any) => !hiddenLineIds[l.id]), [allLines, hiddenLineIds]);
  const markersData = useMemo(() => allMarkers.filter((m: any) => !hiddenMarkerIds[m.id]), [allMarkers, hiddenMarkerIds]);

  const totalInfraVisible = polygonsData.length + linesData.length + markersData.length;

  const toggleAll = (type: 'area' | 'line' | 'marker', show: boolean) => {
    const next: Record<string, boolean> = {};
    const items = type === 'area' ? allPolygons : type === 'line' ? allLines : allMarkers;
    
    if (!show) {
      items.forEach((p: any) => { next[p.id] = true; });
    }

    if (type === 'area') setHiddenAreaIds(next);
    if (type === 'line') setHiddenLineIds(next);
    if (type === 'marker') setHiddenMarkerIds(next);
  };

  const toggleSingle = (type: 'area' | 'line' | 'marker', id: string, isChecked: boolean) => {
    const setter = type === 'area' ? setHiddenAreaIds : type === 'line' ? setHiddenLineIds : setHiddenMarkerIds;
    setter(prev => {
      const next = { ...prev };
      if (isChecked) delete next[id];
      else next[id] = true;
      return next;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#020403]">
      <div className="absolute inset-0 z-0">
        <LeafletMap 
          center={COORDINATES} 
          zoom={ZOOM_LEVEL} 
          layer="satellite" 
          locked={false}
          showBoundary={true}
          showPolygons={true}
          showLines={true}
          showMarkers={true}
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
          
          {/* Data Infrastructure Checklist HUD */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className={cn(
                      "w-14 h-14 rounded-2xl bg-black/40 backdrop-blur-3xl shadow-2xl border border-white/10 transition-all duration-500 group",
                      totalInfraVisible > 0 ? 'text-primary' : 'text-white/30'
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
            <DropdownMenuContent side="right" align="center" className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-4 min-w-[320px] shadow-2xl">
              <div className="px-4 py-3 mb-4 border-b border-white/5">
                <p className="text-[11px] font-black text-white uppercase tracking-[0.3em]">Inventaris Digital</p>
                <p className="text-[8px] font-bold text-white/30 uppercase tracking-widest mt-1">Kendalikan Layer Wilayah</p>
              </div>
              
              <div className="space-y-3">
                {/* 1. Areas (Polygons) */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-colors font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/5 data-[state=open]:bg-white/5">
                    <Hexagon className="w-4 h-4 text-green-500" />
                    Area Wilayah (RT)
                    <Badge className="ml-auto bg-green-500/10 text-green-500 border-none text-[8px]">{allPolygons.length}</Badge>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[240px] ml-2">
                    <div className="grid grid-cols-2 gap-2 mb-3 px-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', true)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-primary hover:text-white rounded-xl">Pilih Semua</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', false)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl">Sembunyikan</Button>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <ScrollArea className="h-[300px] mt-2">
                      <div className="space-y-1">
                        {allPolygons.map((p: any) => (
                          <DropdownMenuCheckboxItem
                            key={p.id}
                            checked={!hiddenAreaIds[p.id]}
                            onCheckedChange={(checked) => toggleSingle('area', p.id, !!checked)}
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/60 focus:bg-white/5 data-[state=checked]:text-white"
                          >
                            <div className="w-3 h-3 rounded-full border border-white/10 shadow-[0_0_8px_rgba(var(--primary),0.2)]" style={{ backgroundColor: p.color || '#22c55e' }} />
                            <span className="truncate flex-1 tracking-widest">{p.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 2. Lines (Roads/Infrastructure) */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-colors font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/5 data-[state=open]:bg-white/5">
                    <Route className="w-4 h-4 text-blue-500" />
                    Jalur & Drainase
                    <Badge className="ml-auto bg-blue-500/10 text-blue-500 border-none text-[8px]">{allLines.length}</Badge>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[240px] ml-2">
                    <div className="grid grid-cols-2 gap-2 mb-3 px-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('line', true)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-blue-500 hover:text-white rounded-xl">Pilih Semua</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('line', false)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl">Sembunyikan</Button>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <ScrollArea className="h-[300px] mt-2">
                      <div className="space-y-1">
                        {allLines.map((l: any) => (
                          <DropdownMenuCheckboxItem
                            key={l.id}
                            checked={!hiddenLineIds[l.id]}
                            onCheckedChange={(checked) => toggleSingle('line', l.id, !!checked)}
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/60 focus:bg-white/5 data-[state=checked]:text-white"
                          >
                            <div className="w-6 h-1 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.3)]" style={{ backgroundColor: l.color || '#3b82f6' }} />
                            <span className="truncate flex-1 tracking-widest">{l.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>

                {/* 3. Markers (Facilities) */}
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="flex items-center gap-4 px-4 py-4 rounded-2xl cursor-pointer transition-colors font-black text-[10px] uppercase tracking-widest text-white/70 focus:bg-white/5 data-[state=open]:bg-white/5">
                    <MapPin className="w-4 h-4 text-red-500" />
                    Titik Fasilitas
                    <Badge className="ml-auto bg-red-500/10 text-red-500 border-none text-[8px]">{allMarkers.length}</Badge>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2rem] p-3 min-w-[240px] ml-2">
                    <div className="grid grid-cols-2 gap-2 mb-3 px-1">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('marker', true)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-500 hover:text-white rounded-xl">Pilih Semua</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('marker', false)} className="h-9 text-[9px] font-black uppercase tracking-widest bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-xl">Sembunyikan</Button>
                    </div>
                    <DropdownMenuSeparator className="bg-white/5" />
                    <ScrollArea className="h-[300px] mt-2">
                      <div className="space-y-1">
                        {allMarkers.map((m: any) => (
                          <DropdownMenuCheckboxItem
                            key={m.id}
                            checked={!hiddenMarkerIds[m.id]}
                            onCheckedChange={(checked) => toggleSingle('marker', m.id, !!checked)}
                            className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/60 focus:bg-white/5 data-[state=checked]:text-white"
                          >
                            <MapPin className="w-3.5 h-3.5" style={{ color: m.color || '#ef4444' }} />
                            <span className="truncate flex-1 tracking-widest">{m.name}</span>
                          </DropdownMenuCheckboxItem>
                        ))}
                      </div>
                    </ScrollArea>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

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
             {linesData.length > 0 && (
               <Badge variant="outline" className="bg-blue-500/5 border-blue-500/20 text-blue-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                 {linesData.length} Jalur Jalan
               </Badge>
             )}
             {markersData.length > 0 && (
               <Badge variant="outline" className="bg-red-500/5 border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full">
                 {markersData.length} Titik Fasilitas
               </Badge>
             )}
             {totalInfraVisible === 0 && (
               <span className="text-[9px] font-black text-white/30 uppercase tracking-widest">Semua Layer Nonaktif</span>
             )}
           </div>
        </div>
      </div>

      {/* Ambient Gradient Overlays for Depth */}
      <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-b from-black/60 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-96 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
