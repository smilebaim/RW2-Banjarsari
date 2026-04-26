
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
  Shield,
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

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a] animate-pulse flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Activity className="w-10 h-10 text-primary animate-bounce" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Sinkronisasi Peta...</p>
    </div>
  </div>,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

type MapLayerType = 'satellite' | 'streets' | 'dark';

// Helper to safely parse JSON strings from Firestore outside the component
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
  
  // Using "hidden" map instead of "visible" map to avoid useEffect initialization loops
  const [hiddenAreaIds, setHiddenAreaIds] = useState<Record<string, boolean>>({});

  // Fetch geography settings from Firestore
  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings } = useDoc(mapSettingsRef);

  // Stabilize parsed data to prevent unnecessary re-renders
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

  // Derived visibility data
  const polygonsData = useMemo(() => 
    allPolygons.filter((p: any) => !hiddenAreaIds[p.id]), 
    [allPolygons, hiddenAreaIds]
  );

  const totalInfra = 
    polygonsData.length + 
    (visibility.lines ? linesData.length : 0) + 
    (visibility.markers ? markersData.length : 0);

  const isAnyPolygonVisible = allPolygons.some(p => !hiddenAreaIds[p.id]);
  const isAnyLayerVisible = isAnyPolygonVisible || visibility.lines || visibility.markers;

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

  const toggleSinglePolygon = (id: string, isVisible: boolean) => {
    setHiddenAreaIds(prev => ({
      ...prev,
      [id]: !isVisible
    }));
  };

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
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

      {/* Top Header Navigation */}
      <div className="absolute top-8 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="w-fit bg-white/5 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 rounded-full p-1.5 flex items-center gap-2 pointer-events-auto transition-all hover:bg-white/10">
          <div className="flex items-center gap-3 pl-5 pr-3 py-1">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] leading-none mb-0.5">RW 02 BANJARSARI</span>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">Portal Koneksi Wilayah</span>
            </div>
          </div>
          
          <div className="h-8 w-px bg-white/10 mx-1" />
          
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full w-12 h-12 text-white hover:bg-primary hover:scale-105 transition-all duration-500" 
                  asChild
                >
                  <Link href="/login">
                    <ShieldCheck className="w-5 h-5" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white border-none font-black text-[10px] uppercase tracking-widest mb-4 px-4 py-2 rounded-xl shadow-2xl">
                Login Dashboard
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Map Control Tools (Left Side) */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-20">
        <TooltipProvider delayDuration={0}>
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5 text-white/70 hover:bg-primary hover:text-white hover:border-primary/50 transition-all duration-500 group"
                  >
                    <Layers className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-4 py-2 rounded-xl">
                Visual Peta
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="center" className="bg-white/10 backdrop-blur-3xl border-white/10 rounded-[1.5rem] p-2 min-w-[150px]">
              {[
                { id: 'satellite', label: 'Satelit', icon: Globe },
                { id: 'streets', label: 'Jalanan', icon: MapIcon },
                { id: 'dark', label: 'Mode Gelap', icon: Moon },
              ].map((layer) => (
                <DropdownMenuItem 
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayerType)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-widest ${
                    activeLayer === layer.id ? 'bg-primary text-white' : 'text-white/70 hover:bg-white/10'
                  }`}
                >
                  <layer.icon className="w-4 h-4" />
                  {layer.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Layer Selector Tool */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button 
                    size="icon" 
                    variant="secondary" 
                    className={`w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5 transition-all duration-500 group ${
                      isAnyLayerVisible ? 'text-primary' : 'text-white/30'
                    } hover:bg-primary hover:text-white`}
                  >
                    <Database className="w-5 h-5 transition-transform group-hover:scale-110" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-4 py-2 rounded-xl">
                Data Layer
              </TooltipContent>
            </Tooltip>
            <DropdownMenuContent side="right" align="center" className="bg-white/10 backdrop-blur-3xl border-white/10 rounded-[1.5rem] p-2 min-w-[220px]">
              <div className="px-4 py-2 mb-1 border-b border-white/10">
                <p className="text-[10px] font-black text-white/40 uppercase tracking-widest">Pilih Data Wilayah</p>
              </div>
              
              {/* Areas Sub-Menu */}
              <DropdownMenuSub>
                <DropdownMenuSubTrigger className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-widest text-white/70 focus:bg-primary focus:text-white">
                  <Hexagon className="w-4 h-4 text-green-500" />
                  Area Wilayah
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent className="bg-white/10 backdrop-blur-3xl border-white/10 rounded-2xl p-2 min-w-[180px]">
                   <DropdownMenuCheckboxItem
                    checked={isAnyPolygonVisible}
                    onCheckedChange={(checked) => toggleAllPolygons(!!checked)}
                    className="flex items-center gap-3 px-4 py-2 rounded-xl cursor-pointer font-black text-[9px] uppercase tracking-widest text-primary focus:bg-white/5"
                  >
                    Tampilkan Semua
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  {allPolygons.map((p: any) => (
                    <DropdownMenuCheckboxItem
                      key={p.id}
                      checked={!hiddenAreaIds[p.id]}
                      onCheckedChange={(checked) => toggleSinglePolygon(p.id, !!checked)}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer text-[10px] font-bold uppercase text-white/70"
                    >
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || '#22c55e' }} />
                      {p.name}
                    </DropdownMenuCheckboxItem>
                  ))}
                </DropdownMenuSubContent>
              </DropdownMenuSub>

              <DropdownMenuCheckboxItem
                checked={visibility.lines}
                onCheckedChange={(checked) => setVisibility(v => ({ ...v, lines: !!checked }))}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-widest text-white/70 focus:bg-primary focus:text-white"
              >
                <Route className="w-4 h-4 text-blue-500" />
                Jaringan Jalan
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem
                checked={visibility.markers}
                onCheckedChange={(checked) => setVisibility(v => ({ ...v, markers: !!checked }))}
                className="flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-colors font-bold text-[10px] uppercase tracking-widest text-white/70 focus:bg-primary focus:text-white"
              >
                <MapPin className="w-4 h-4 text-red-500" />
                Titik Fasilitas
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="secondary" 
                className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5 text-white/70 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Compass className="w-5 h-5 transition-transform group-hover:scale-110" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-4 py-2 rounded-xl">
              Kalibrasi Orientasi
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="secondary" 
                className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5 text-white/70 hover:bg-primary hover:text-white transition-all duration-500 group"
              >
                <Info className="w-5 h-5 transition-transform group-hover:scale-110" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-4 py-2 rounded-xl">
              Detail Geografis
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom Infrastructure Summary Bar */}
      {isAnyLayerVisible && totalInfra >= 0 && (
        <div className="absolute bottom-32 inset-x-0 z-20 flex justify-center pointer-events-none px-4">
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-6 pointer-events-auto animate-in slide-in-from-bottom-10 duration-700">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-black text-white uppercase tracking-widest">{totalInfra} Infrastruktur Terkoneksi</span>
             </div>
             <div className="h-4 w-px bg-white/10" />
             <div className="flex gap-4">
               {polygonsData.length > 0 && (
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-green-500/10 border-green-500/20 text-green-500 text-[8px] font-black uppercase tracking-widest px-2">
                     {polygonsData.length} Area
                   </Badge>
                 </div>
               )}
               {visibility.lines && linesData.length > 0 && (
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-blue-500/10 border-blue-500/20 text-blue-500 text-[8px] font-black uppercase tracking-widest px-2">
                     {linesData.length} Jalur
                   </Badge>
                 </div>
               )}
               {visibility.markers && markersData.length > 0 && (
                 <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-red-500/10 border-red-500/20 text-red-500 text-[8px] font-black uppercase tracking-widest px-2">
                     {markersData.length} Titik
                   </Badge>
                 </div>
               )}
             </div>
          </div>
        </div>
      )}

      {/* Decorative Gradients */}
      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
