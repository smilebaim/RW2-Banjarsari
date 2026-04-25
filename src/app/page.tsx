
'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { Navigation, Layers, Compass, Info, MapPin } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// Load map dynamically to avoid hydration issues with Leaflet
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary animate-pulse" />,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Leaflet Map - Full Screen Satellite View */}
      <div className="absolute inset-0 z-0">
        <LeafletMap center={COORDINATES} zoom={ZOOM_LEVEL} />
      </div>

      {/* Top Floating Dock - Minimal Identity */}
      <div className="absolute top-8 inset-x-0 z-20 flex justify-center px-4 pointer-events-none">
        <div className="w-fit bg-white/5 backdrop-blur-2xl shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] border border-white/10 rounded-full p-1.5 flex items-center gap-1.5 pointer-events-auto">
          <div className="flex items-center gap-3 pl-4 pr-3">
            <div className="w-2.5 h-2.5 bg-primary rounded-full animate-pulse shadow-[0_0_10px_rgba(var(--primary),0.8)]" />
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-white uppercase tracking-[0.2em] leading-none mb-0.5">RW 02 Banjarsari</span>
              <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">Metro Utara, Lampung</span>
            </div>
          </div>
          <div className="h-6 w-px bg-white/10 mx-1" />
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  size="icon" 
                  variant="ghost" 
                  className="rounded-full w-11 h-11 bg-primary/20 text-white hover:bg-primary hover:scale-105 transition-all duration-300" 
                  asChild
                >
                  <a href={`https://www.google.com/maps/search/?api=1&query=${COORDINATES[0]},${COORDINATES[1]}`} target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-5 h-5" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest mb-4 px-4 py-2 rounded-xl shadow-2xl">
                Buka Rute Navigasi
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Left Sidebar Tools */}
      <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-20">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group">
                <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none font-bold text-[10px] uppercase tracking-widest ml-3 px-4 py-2 rounded-xl">
              Lapisan Peta
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group">
                <Compass className="w-5 h-5 group-hover:rotate-45 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none font-bold text-[10px] uppercase tracking-widest ml-3 px-4 py-2 rounded-xl">
              Kalibrasi Kompas
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-12 h-12 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-2xl border border-white/10 text-white hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 group">
                <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-black/80 backdrop-blur-md text-white border-none font-bold text-[10px] uppercase tracking-widest ml-3 px-4 py-2 rounded-xl">
              Informasi Wilayah
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Ambient Bottom Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/60 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
