import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Compass, Layers } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Background Map - Full Screen */}
      <div className="absolute inset-0 z-0">
        <iframe
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3973.402432857502!2d105.3002621758955!3d-5.094553594882352!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40bf6c30e79603%3A0x4039147e0996840!2sKantor%20RW%2002%20Kelurahan%20Banjarsari!5e0!3m2!1sid!2sid!4v1716550000000!5m2!1sid!2sid"
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="w-full h-full brightness-[0.95] saturate-[1.1]"
        ></iframe>
      </div>

      {/* Desktop Floating UI - Transparent Glassmorphism */}
      <div className="absolute top-8 left-8 z-10 hidden md:block">
        <div className="flex items-center gap-4 p-3 pr-6 bg-white/40 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20">
          <div className="w-12 h-12 bg-primary/80 rounded-2xl flex items-center justify-center shadow-lg">
             <MapPin className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-tighter">RW 2 Banjarsari</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metro Utara, Kota Metro</p>
          </div>
        </div>
      </div>

      {/* Desktop Feature Card - Transparent Glassmorphism */}
      <div className="absolute top-32 left-8 z-10 max-w-[360px] hidden md:block animate-in fade-in slide-in-from-left-8 duration-1000">
        <Card className="bg-white/40 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border-white/20 rounded-[2.5rem] overflow-hidden">
           <div className="h-2 bg-accent w-full"></div>
           <CardHeader className="pb-4 pt-8 px-8">
             <CardTitle className="text-4xl font-black text-primary leading-tight mb-3 tracking-tighter">
               Banjarsari <span className="text-accent-foreground">Connect</span>
             </CardTitle>
             <CardDescription className="text-sm font-semibold text-muted-foreground/80 leading-relaxed">
               Portal digital terpadu warga RW 02. Akses informasi, layanan, dan pengaduan dalam satu genggaman.
             </CardDescription>
           </CardHeader>
           <CardContent className="px-8 pb-8 space-y-4">
             <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black shadow-xl shadow-primary/20 text-lg uppercase tracking-tight" asChild>
               <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                 <Navigation className="w-5 h-5 mr-3" />
                 Petunjuk Arah
               </a>
             </Button>
           </CardContent>
        </Card>
      </div>

      {/* Mobile Optimized UI - Transparent Glassmorphism */}
      <div className="absolute top-6 inset-x-4 md:hidden z-10">
        <div className="bg-white/40 backdrop-blur-xl shadow-2xl border border-white/20 rounded-[2rem] p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 bg-primary/80 rounded-[1.25rem] flex items-center justify-center shadow-lg shadow-primary/20">
               <MapPin className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-base font-black text-primary tracking-tighter leading-none mb-0.5">Banjarsari Connect</h1>
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

      {/* Floating Action Buttons (Mobile View Look) */}
      <div className="absolute right-4 top-24 flex flex-col gap-3 md:hidden z-10">
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/40 backdrop-blur-md shadow-xl border border-white/20 text-primary">
          <Layers className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/40 backdrop-blur-md shadow-xl border border-white/20 text-primary">
          <Compass className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Gradient Overlay for Mobile Dock Clarity */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-[5] md:hidden"></div>
    </div>
  );
}
