
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
  Layers,
  Check,
  Eye,
  EyeOff,
  ChevronRight
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
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#020403] animate-pulse flex items-center justify-center">
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
  
  // Visibility States: Stores IDs of items that should be HIDDEN
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

  // Initial Visibility Logic: 
  // - Show Polygons (Batas Wilayah RW) by default (hiddenAreaIds remains empty)
  // - Uncheck/Hide all Lines and Markers by default
  useEffect(() => {
    if (!isInitialized && mapSettings && (allPolygons.length > 0 || allLines.length > 0 || allMarkers.length > 0)) {
      // Hide all lines by default
      const initialHiddenLines: Record<string, boolean> = {};
      allLines.forEach((l: any) => { initialHiddenLines[l.id] = true; });
      
      // Hide all markers by default
      const initialHiddenMarkers: Record<string, boolean> = {};
      allMarkers.forEach((m: any) => { initialHiddenMarkers[m.id] = true; });

      setHiddenLineIds(initialHiddenLines);
      setHiddenMarkerIds(initialHiddenMarkers);
      setHiddenAreaIds({}); // Ensure areas are shown (checked)
      setIsInitialized(true);
    }
  }, [mapSettings, allPolygons, allLines, allMarkers, isInitialized]);

  // Filtered data based on visibility toggles (Checklists)
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
      if (isChecked) {
        delete next[id]; // Show item
      } else {
        next[id] = true; // Hide item
      }
      return next;
    });
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#020403]">
      {/* Basemap: Locked to Satellite only */}
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

      {/* Modern Floating Header HUD */}
      <div className="absolute top-10 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="w-fit bg-black/40 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.8)] border border-white/10 rounded-[2rem] p-1.5 flex items-center gap-2 pointer-events-auto transition-all hover:bg-black/60 hover:border-primary/30 group">
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

      {/* Interactive Control Sidebar */}
      <div className="absolute left-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        <TooltipProvider delayDuration={0}>
          
          {/* Main Layer Checklist Tool */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className={cn(
                      "w-16 h-16 rounded-2xl bg-black/50 backdrop-blur-3xl shadow-2xl border border-white/10 transition-all duration-500 group relative",
                      totalInfraVisible > 0 ? 'text-primary' : 'text-white/30'
                    )}
                  >
                    <Layers className="w-7 h-7 transition-transform group-hover:scale-110" />
                    {totalInfraVisible > 0 && (
                      <span className="absolute top-3 right-3 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/95 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl shadow-2xl">
                Data Infrastruktur
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent side="right" align="center" className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[2.5rem] p-4 min-w-[340px] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="px-5 py-4 mb-4 border-b border-white/5">
                <p className="text-[12px] font-black text-white uppercase tracking-[0.3em]">Inventaris Wilayah</p>
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest mt-1">Checklist untuk menampilkan data</p>
              </div>
              
              <div className="space-y-4">
                {/* 1. Batas Wilayah RW (CHECKED BY DEFAULT) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-3">
                      <Hexagon className="w-4 h-4 text-green-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Batas Wilayah RW</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', true)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-green-500 hover:text-white rounded-lg">Pilih Semua</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', false)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg">Reset</Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[150px] pr-2">
                    <div className="space-y-1">
                      {allPolygons.map((p: any) => (
                        <DropdownMenuCheckboxItem
                          key={p.id}
                          checked={!hiddenAreaIds[p.id]}
                          onCheckedChange={(checked) => toggleSingle('area', p.id, !!checked)}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <div className="w-3 h-3 rounded-full shadow-[0_0_10px_rgba(var(--primary),0.2)] group-hover:scale-110 transition-transform" style={{ backgroundColor: p.color || '#22c55e' }} />
                          <span className="truncate flex-1 tracking-[0.2em]">{p.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <DropdownMenuSeparator className="bg-white/5" />

                {/* 2. Jalur & Drainase (UNCHECKED BY DEFAULT) */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-3">
                      <Route className="w-4 h-4 text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Jalur & Drainase</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('line', true)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-blue-500 hover:text-white rounded-lg">Aktifkan</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('line', false)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg">Sembunyikan</Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[120px] pr-2">
                    <div className="space-y-1">
                      {allLines.map((l: any) => (
                        <DropdownMenuCheckboxItem
                          key={l.id}
                          checked={!hiddenLineIds[l.id]}
                          onCheckedChange={(checked) => toggleSingle('line', l.id, !!checked)}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <div className="w-6 h-1 rounded-full group-hover:scale-x-110 transition-transform" style={{ backgroundColor: l.color || '#3b82f6' }} />
                          <span className="truncate flex-1 tracking-[0.2em]">{l.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <DropdownMenuSeparator className="bg-white/5" />

                {/* 3. Fasilitas (UNCHECKED BY DEFAULT) */}
                <div className="space-y-2">
                   <div className="flex items-center justify-between px-2 mb-2">
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-red-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/80">Titik Fasilitas</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('marker', true)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-red-500 hover:text-white rounded-lg">Aktifkan</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('marker', false)} className="h-6 px-3 text-[8px] font-black uppercase bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-lg">Sembunyikan</Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[120px] pr-2">
                    <div className="space-y-1">
                      {allMarkers.map((m: any) => (
                        <DropdownMenuCheckboxItem
                          key={m.id}
                          checked={!hiddenMarkerIds[m.id]}
                          onCheckedChange={(checked) => toggleSingle('marker', m.id, !!checked)}
                          className="flex items-center gap-4 px-4 py-3 rounded-2xl cursor-pointer text-[10px] font-black uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <MapPin className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" style={{ color: m.color || '#ef4444' }} />
                          <span className="truncate flex-1 tracking-[0.2em]">{m.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Compass / Focus Calibration */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                onClick={() => window.location.reload()}
                className="w-16 h-16 rounded-2xl bg-black/50 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/40 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Compass className="w-7 h-7 transition-transform group-hover:rotate-180 duration-1000" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/95 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
              Kalibrasi Fokus
            </TooltipContent>
          </Tooltip>

          {/* Geographical Info */}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                className="w-16 h-16 rounded-2xl bg-black/50 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/40 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Info className="w-7 h-7 transition-transform group-hover:scale-110" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/95 text-white border border-white/10 font-black text-[10px] uppercase tracking-widest ml-4 px-5 py-2.5 rounded-2xl">
              Info Geografis
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Futuristic Connection HUD Panel (Bottom) */}
      <div className="absolute bottom-32 inset-x-0 z-20 flex justify-center pointer-events-none px-6">
        <div className="bg-black/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] px-10 py-5 flex flex-col md:flex-row items-center gap-10 pointer-events-auto animate-in slide-in-from-bottom-20 duration-1000 shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
           <div className="flex items-center gap-5">
             <div className="relative flex h-4 w-4">
               <div className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-20" />
               <div className="relative w-4 h-4 rounded-full bg-green-500 shadow-[0_0_15px_#22c55e]" />
             </div>
             <div className="flex flex-col">
               <span className="text-[12px] font-black text-white uppercase tracking-[0.2em] leading-none mb-1">{totalInfraVisible} Sistem Aktif</span>
               <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">Sinkronisasi Layer Berhasil</span>
             </div>
           </div>

           <div className="hidden md:block h-12 w-px bg-white/10" />

           <div className="flex flex-wrap justify-center gap-5">
             <Badge variant="outline" className={cn(
               "transition-all duration-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full",
               polygonsData.length > 0 ? "bg-green-500/10 border-green-500/30 text-green-500" : "bg-white/5 border-white/5 text-white/20"
             )}>
               {polygonsData.length} Area RT
             </Badge>
             <Badge variant="outline" className={cn(
               "transition-all duration-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full",
               linesData.length > 0 ? "bg-blue-500/10 border-blue-500/30 text-blue-500" : "bg-white/5 border-white/5 text-white/20"
             )}>
               {linesData.length} Jalur Jalan
             </Badge>
             <Badge variant="outline" className={cn(
               "transition-all duration-500 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-full",
               markersData.length > 0 ? "bg-red-500/10 border-red-500/30 text-red-500" : "bg-white/5 border-white/5 text-white/20"
             )}>
               {markersData.length} Fasilitas
             </Badge>
           </div>
        </div>
      </div>

      {/* Ambient Depth Overlays */}
      <div className="absolute inset-x-0 top-0 h-80 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-[30rem] bg-gradient-to-t from-black/95 via-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}

