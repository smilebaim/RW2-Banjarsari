
'use client';

import dynamic from 'next/dynamic';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Layers, Compass, Info, Newspaper } from 'lucide-react';
import {
  Tooltip,
  TooltipProvider,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

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

      {/* Top Identity Dock - Glassmorphism UI */}
      <div className="absolute top-6 inset-x-0 z-10 flex justify-center px-4 pointer-events-none">
        <div className="w-full max-w-xl bg-white/10 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/20 rounded-[2.5rem] p-2 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-3 sm:gap-4 pl-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
               <MapPin className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-black text-primary tracking-tighter leading-none mb-0.5 drop-shadow-md uppercase">Banjarsari Connect</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest leading-none">RW 2 Metro Utara, Lampung</p>
            </div>
          </div>
          <div className="flex gap-2 pr-1">
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-2xl w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                    <Link href="/news">
                      <Newspaper className="w-5 h-5" />
                    </Link>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest mb-2 px-4 py-2 rounded-xl">
                  Informasi Utama
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="icon" variant="ghost" className="rounded-2xl w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${COORDINATES[0]},${COORDINATES[1]}`} target="_blank" rel="noopener noreferrer">
                      <Navigation className="w-5 h-5" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest mb-2 px-4 py-2 rounded-xl">
                  Buka Rute
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* Left Floating Actions */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/20 text-primary hover:bg-primary hover:text-white transition-all">
                <Layers className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Lapisan Peta
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/20 text-primary hover:bg-primary hover:text-white transition-all">
                <Compass className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Kompas
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/20 text-primary hover:bg-primary hover:text-white transition-all">
                <Info className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Tentang Wilayah
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom Gradient Overlay */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
