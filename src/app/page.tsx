import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Compass, Layers, Info } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      {/* Background Map - Full Screen Satellite View centered on specified location */}
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

      {/* Top Identity Dock - Unified for Mobile & Desktop */}
      <div className="absolute top-6 inset-x-0 z-10 flex justify-center px-4">
        <div className="w-full max-w-xl bg-white/5 backdrop-blur-3xl shadow-[0_10px_40px_rgba(0,0,0,0.3)] border border-white/10 rounded-[2.5rem] p-2 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4 pl-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary/80 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30">
               <MapPin className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-sm sm:text-base font-black text-primary tracking-tighter leading-none mb-0.5 drop-shadow-md uppercase">Banjarsari Connect</h1>
              <p className="text-[9px] sm:text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none">RW 2 Metro Utara, Lampung</p>
            </div>
          </div>
          <div className="flex gap-2 pr-1">
             <Button size="icon" variant="ghost" className="rounded-2xl w-10 h-10 sm:w-12 sm:h-12 bg-primary/10 text-primary hover:bg-primary hover:text-white transition-all shadow-sm" asChild>
                <a href="https://maps.app.goo.gl/acYJX9R7R7HXbv618" target="_blank" rel="noopener noreferrer">
                   <Navigation className="w-5 h-5" />
                </a>
             </Button>
          </div>
        </div>
      </div>

      {/* Desktop Feature Info - Minimalist Card */}
      <div className="absolute bottom-32 left-8 z-10 max-w-[320px] hidden md:block animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <Card className="bg-white/5 backdrop-blur-3xl shadow-[0_20px_60px_-12px_rgba(0,0,0,0.5)] border border-white/10 rounded-[2rem] overflow-hidden">
           <CardHeader className="pb-3 pt-6 px-6">
             <div className="flex items-center gap-2 mb-2">
               <span className="w-6 h-1 bg-accent rounded-full"></span>
               <span className="text-[10px] font-black text-primary uppercase tracking-widest">Informasi Utama</span>
             </div>
             <CardTitle className="text-2xl font-black text-primary leading-tight tracking-tighter drop-shadow-md">
               Portal Warga <span className="text-accent-foreground">RW 02</span>
             </CardTitle>
           </CardHeader>
           <CardContent className="px-6 pb-6">
             <p className="text-xs font-semibold text-primary/80 leading-relaxed mb-4">
               Akses cepat layanan pengaduan, berita terkini, dan kontak pengurus lingkungan dalam satu aplikasi.
             </p>
             <Button variant="outline" className="w-full border-primary/20 bg-primary/10 hover:bg-primary hover:text-white rounded-xl h-10 text-xs font-black uppercase tracking-widest transition-all" asChild>
               <a href="/news">Lihat Update Terbaru</a>
             </Button>
           </CardContent>
        </Card>
      </div>

      {/* Right Floating Actions */}
      <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-3 z-10">
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
          <Layers className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
          <Compass className="w-5 h-5" />
        </Button>
        <Button size="icon" variant="secondary" className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-3xl shadow-xl border border-white/10 text-primary hover:bg-primary hover:text-white transition-all">
          <Info className="w-5 h-5" />
        </Button>
      </div>

      {/* Bottom Gradient Overlay for Clarity */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent pointer-events-none z-[5]"></div>
    </div>
  );
}
