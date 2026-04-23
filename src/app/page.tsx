import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Layers, Compass, Info, Newspaper } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Background Map - Full Screen Satellite View centered on coordinate Masjid Al-Hidayah */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://maps.google.com/maps?ll=-5.094194,105.300143&t=k&z=19&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full brightness-[0.85] contrast-[1.1] saturate-[1.1]"
        ></iframe>
      </div>

      {/* Top Identity Dock - Unified Ultra-Glassmorphism */}
      <div className="absolute top-6 inset-x-0 z-10 flex justify-center px-4">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between">
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
                    <a href="https://maps.app.goo.gl/acYJX9R7R7HXbv618" target="_blank" rel="noopener noreferrer">
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

      {/* Left Floating Actions with Tooltips */}
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
                <Layers className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Lapisan Peta
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
                <Compass className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Kompas
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
                <Info className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right" className="bg-primary text-white border-none font-bold text-[10px] uppercase tracking-widest ml-2 px-4 py-2 rounded-xl">
              Tentang Wilayah
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Bottom Gradient Overlay for Clarity */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
