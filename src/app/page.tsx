
'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { 
  Compass, 
  ShieldCheck, 
  Activity,
  Hexagon,
  MapPin,
  Zap,
  Layers,
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
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

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
  
  const [hiddenAreaIds, setHiddenAreaIds] = useState<Record<string, boolean>>({});
  const [hiddenLineIds, setHiddenLineIds] = useState<Record<string, boolean>>({});
  const [hiddenMarkerIds, setHiddenMarkerIds] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings } = useDoc(mapSettingsRef);

  const allPolygons = useMemo(() => parseData(mapSettings?.polygons || mapSettings?.polygon, []), [mapSettings]);
  const allLines = useMemo(() => parseData(mapSettings?.lines, []), [mapSettings]);
  const allMarkers = useMemo(() => parseData(mapSettings?.markers, []), [mapSettings]);

  useEffect(() => {
    if (!isInitialized && mapSettings && (allPolygons.length > 0 || allLines.length > 0 || allMarkers.length > 0)) {
      const initialHiddenAreas: Record<string, boolean> = {};
      allPolygons.forEach((p: any) => {
        const name = p.name?.toLowerCase() || '';
        // Only show "Batas Wilayah RW 2" and exclude anything with "RT"
        const isRW2Boundary = (name.includes('rw 2') || name.includes('rw 02') || name.includes('batas')) && !name.includes('rt');
        
        if (!isRW2Boundary) {
          initialHiddenAreas[p.id] = true;
        }
      });
      
      const initialHiddenLines: Record<string, boolean> = {};
      allLines.forEach((l: any) => { initialHiddenLines[l.id] = true; });
      
      const initialHiddenMarkers: Record<string, boolean> = {};
      allMarkers.forEach((m: any) => { initialHiddenMarkers[m.id] = true; });

      setHiddenAreaIds(initialHiddenAreas);
      setHiddenLineIds(initialHiddenLines);
      setHiddenMarkerIds(initialHiddenMarkers);
      setIsInitialized(true);
    }
  }, [mapSettings, allPolygons, allLines, allMarkers, isInitialized]);

  const polygonsData = useMemo(() => allPolygons.filter((p: any) => !hiddenAreaIds[p.id]), [allPolygons, hiddenAreaIds]);
  const linesData = useMemo(() => allLines.filter((l: any) => !hiddenLineIds[l.id]), [allLines, hiddenLineIds]);
  const markersData = useMemo(() => allMarkers.filter((m: any) => !hiddenMarkerIds[m.id]), [allMarkers, hiddenMarkerIds]);

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

      <TooltipProvider delayDuration={0}>
        {/* Floating Header HUD (Top) - Smaller Version */}
        <div className="absolute top-6 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
          <div className="w-fit bg-black/40 backdrop-blur-3xl shadow-[0_4px_24px_0_rgba(0,0,0,0.8)] border border-white/10 rounded-[1.2rem] p-0.5 flex items-center gap-1.5 pointer-events-auto transition-all hover:bg-black/60 hover:border-primary/30 group">
            <div className="flex items-center gap-2 pl-3 pr-2 py-1">
              <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary shadow-[0_0_6px_rgba(var(--primary),1)]"></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-black text-white uppercase tracking-[0.1em] leading-none mb-0.5">RW 02 Banjarsari</span>
                <span className="text-[7px] font-bold text-primary tracking-widest leading-none flex items-center gap-1 uppercase">
                  <Zap className="w-1.5 h-1.5" /> Portal Digital
                </span>
              </div>
            </div>
            
            <div className="h-4 w-px bg-white/10 mx-0.5" />
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full w-8 h-8 text-white/50 hover:bg-primary hover:text-white transition-all duration-500" 
                  asChild
                >
                  <Link href="/login">
                    <ShieldCheck className="w-3.5 h-3.5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white border-none font-black text-[8px] uppercase tracking-widest mb-4 px-3 py-1.5 rounded-lg shadow-2xl">
                Dashboard
              </TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Sidebar Controls (Left) - Smaller Icons */}
        <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-2 z-20">
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    className="w-11 h-11 rounded-xl bg-black/50 backdrop-blur-3xl shadow-2xl border border-white/10 transition-all duration-500 group relative text-primary"
                  >
                    <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/95 text-white border border-white/10 font-black text-[8px] uppercase tracking-widest ml-3 px-3 py-1.5 rounded-lg shadow-2xl">
                Data Layer
              </TooltipContent>
            </Tooltip>
            
            <DropdownMenuContent side="right" align="center" className="bg-black/95 backdrop-blur-3xl border-white/10 rounded-[1.5rem] p-4 min-w-[300px] shadow-2xl animate-in zoom-in-95 duration-300">
              <div className="px-4 py-3 mb-3 border-b border-white/5">
                <p className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Infrastruktur</p>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Area Wilayah</span>
                    <div className="flex gap-1.5">
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', true)} className="h-5 px-2 text-[7px] font-black uppercase bg-white/5 hover:bg-primary hover:text-white rounded">Semua</Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleAll('area', false)} className="h-5 px-2 text-[7px] font-black uppercase bg-white/5 hover:bg-red-500/20 rounded">Reset</Button>
                    </div>
                  </div>
                  <ScrollArea className="h-[140px]">
                    <div className="space-y-0.5">
                      {allPolygons.map((p: any) => (
                        <DropdownMenuCheckboxItem
                          key={p.id}
                          checked={!hiddenAreaIds[p.id]}
                          onCheckedChange={(checked) => toggleSingle('area', p.id, !!checked)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-[9px] font-bold uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color || '#22c55e' }} />
                          <span className="truncate flex-1">{p.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <DropdownMenuSeparator className="bg-white/5" />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Jalur & Drainase</span>
                    <Button variant="ghost" size="sm" onClick={() => toggleAll('line', true)} className="h-5 px-2 text-[7px] font-black uppercase bg-white/5 hover:bg-primary rounded">Aktifkan</Button>
                  </div>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-0.5">
                      {allLines.map((l: any) => (
                        <DropdownMenuCheckboxItem
                          key={l.id}
                          checked={!hiddenLineIds[l.id]}
                          onCheckedChange={(checked) => toggleSingle('line', l.id, !!checked)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-[9px] font-bold uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <div className="w-5 h-0.5 rounded-full" style={{ backgroundColor: l.color || '#3b82f6' }} />
                          <span className="truncate flex-1">{l.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <DropdownMenuSeparator className="bg-white/5" />

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2 mb-1">
                    <span className="text-[9px] font-black uppercase tracking-widest text-white/50">Titik Fasilitas</span>
                    <Button variant="ghost" size="sm" onClick={() => toggleAll('marker', true)} className="h-5 px-2 text-[7px] font-black uppercase bg-white/5 hover:bg-primary rounded">Tampilkan</Button>
                  </div>
                  <ScrollArea className="h-[100px]">
                    <div className="space-y-0.5">
                      {allMarkers.map((m: any) => (
                        <DropdownMenuCheckboxItem
                          key={m.id}
                          checked={!hiddenMarkerIds[m.id]}
                          onCheckedChange={(checked) => toggleSingle('marker', m.id, !!checked)}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl cursor-pointer text-[9px] font-bold uppercase text-white/50 focus:bg-white/5 data-[state=checked]:text-white transition-all group"
                        >
                          <MapPin className="w-3 h-3" style={{ color: m.color || '#ef4444' }} />
                          <span className="truncate flex-1">{m.name}</span>
                        </DropdownMenuCheckboxItem>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                onClick={() => window.location.reload()}
                className="w-11 h-11 rounded-xl bg-black/50 backdrop-blur-3xl shadow-2xl border border-white/10 text-white/40 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Compass className="w-5 h-5 transition-transform group-hover:rotate-180" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/95 text-white border border-white/10 font-black text-[8px] uppercase tracking-widest ml-3 px-3 py-1.5 rounded-lg shadow-2xl">
              Focus
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>

      <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/80 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/95 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
