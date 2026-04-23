import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Background Map - Full Screen Satellite View */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://maps.google.com/maps?q=-5.094553,105.300262&t=k&z=18&ie=UTF8&iwloc=&output=embed"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full brightness-[0.85] contrast-[1.1] saturate-[1.1]"
        ></iframe>
      </div>

      {/* Desktop Floating UI - Ultra Transparent Glassmorphism */}
      <div className="absolute top-8 left-8 z-10 hidden md:block">
        <div className="flex items-center gap-4 p-3 pr-6 bg-white/5 backdrop-blur-2xl shadow-2xl rounded-3xl border border-white/10">
          <div className="w-12 h-12 bg-primary/90 rounded-2xl flex items-center justify-center shadow-lg">
             <MapPin className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-tighter drop-shadow-sm">RW 2 Banjarsari</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metro Utara, Kota Metro</p>
          </div>
        </div>
      </div>

      {/* Desktop Feature Card - Ultra Transparent Glassmorphism */}
      <div className="absolute top-32 left-8 z-10 max-w-[360px] hidden md:block animate-in fade-in slide-in-from-left-8 duration-1000">
        <Card className="bg-white/5 backdrop-blur-3xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] border-white/10 rounded-[2.5rem] overflow-hidden">
           <div className="h-2 bg-accent w-full opacity-50"></div>
           <CardHeader className="pb-4 pt-8 px-8">
             <CardTitle className="text-4xl font-black text-primary leading-tight mb-3 tracking-tighter drop-shadow-md">
               Banjarsari <span className="text-accent-foreground">Connect</span>
             </CardTitle>
             <CardDescription className="text-sm font-semibold text-primary/90 leading-relaxed">
               Portal digital terpadu warga RW 02. Akses informasi, layanan, dan pengaduan dalam satu genggaman.
             </CardDescription>
           </CardHeader>
           <CardContent className="px-8 pb-8 space-y-4">
             <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black shadow-xl shadow-primary/30 text-lg uppercase tracking-tight" asChild>
               <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                 <Navigation className="w-5 h-5 mr-3" />
                 Petunjuk Arah
               </a>
             </Button>
           </CardContent>
        </Card>
      </div>

      {/* Mobile Optimized UI - Ultra Transparent Glassmorphism */}
      <div className="absolute top-6 inset-x-4 md:hidden z-10">
        <div className="bg-white/5 backdrop-blur-2xl shadow-2xl border border-white/10 rounded-[2rem] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/90 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary/30">
               <MapPin className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-black text-primary tracking-tighter leading-none mb-0.5 drop-shadow-md">Banjarsari Connect</h1>
              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">RW 2 Metro Utara</p>
            </div>
          </div>
          <Button size="icon" variant="ghost" className="rounded-2xl w-11 h-11 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
             <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                <Navigation className="w-5 h-5" />
             </a>
          </Button>
        </div>
      </div>

      {/* Floating Action Buttons */}
      <div className="absolute right-4 top-24 flex flex-col gap-3 z-10">
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl border border-white/10 text-primary hover:bg-white/20">
          <Layers className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/5 backdrop-blur-md shadow-xl border border-white/10 text-primary hover:bg-white/20">
          <Compass className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Gradient Overlay for Mobile Dock Clarity */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/50 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
