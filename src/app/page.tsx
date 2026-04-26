
'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Layers, Compass, Info, ShieldCheck, Globe, Map as MapIcon, Moon } from 'lucide-react';
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
} from '@/components/ui/dropdown-menu';

const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-[#0a0a0a] animate-pulse" />,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

type MapLayerType = 'satellite' | 'streets' | 'dark';

export default function Home() {
  const db = useFirestore();
  const [activeLayer, setActiveLayer] = useState<MapLayerType>('satellite');

  // Fetch geography settings from Firestore
  const mapSettingsRef = useMemoFirebase(() => doc(db, 'map_settings', 'rw02_boundary'), [db]);
  const { data: mapSettings } = useDoc(mapSettingsRef);

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <div className="absolute inset-0 z-0">
        <LeafletMap 
          center={COORDINATES} 
          zoom={ZOOM_LEVEL} 
          layer={activeLayer} 
          locked={true}
          showBoundary={true}
          polygonCoords={mapSettings?.polygon}
          lineCoords={mapSettings?.lines}
          markerCoords={mapSettings?.markers}
        />
      </div>

      <div className="absolute top-8 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="w-fit bg-white/5 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.5)] border border-white/10 rounded-full p-1.5 flex items-center gap-2 pointer-events-auto transition-all hover:bg-white/10">
          <div className="flex items-center gap-3 pl-5 pr-3 py-1">
            <div className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary shadow-[0_0_8px_rgba(var(--primary),0.8)]"></span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-black text-white uppercase tracking-[0.25em] leading-none mb-0.5">RW 02 BANJARSARI</span>
              <span className="text-[8px] font-bold text-white/40 uppercase tracking-widest leading-none">Sistem Monitoring Wilayah</span>
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

          {[
            { icon: Compass, label: 'Kompas', tooltip: 'Kalibrasi Orientasi' },
            { icon: Info, label: 'Info Wilayah', tooltip: 'Detail Geografis' }
          ].map((tool, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="secondary" 
                  className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/5 text-white/70 hover:bg-primary hover:text-white hover:border-primary/50 transition-all duration-500 group"
                >
                  <tool.icon className="w-5 h-5 transition-transform group-hover:scale-110" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-black/90 backdrop-blur-md text-white border border-white/10 font-bold text-[10px] uppercase tracking-widest ml-4 px-4 py-2 rounded-xl">
                {tool.tooltip}
              </TooltipContent>
            </Tooltip>
          ))}
        </TooltipProvider>
      </div>

      <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-black/40 to-transparent pointer-events-none z-[5]"></div>
      <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
