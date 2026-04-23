import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation } from 'lucide-react';

export default function Home() {
  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
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
          className="w-full h-full brightness-[0.9] saturate-[1.2] grayscale-[0.2]"
        ></iframe>
      </div>

      {/* Floating UI Elements */}
      <div className="absolute top-8 left-8 z-10 hidden md:block">
        <div className="flex items-center gap-4 p-3 pr-6 bg-white/80 backdrop-blur-xl shadow-2xl rounded-3xl border border-white/20">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
             <MapPin className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-tighter">RW 2 Banjarsari</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Metro Utara, Kota Metro</p>
          </div>
        </div>
      </div>

      {/* Main Feature Card - Floating Desktop */}
      <div className="absolute top-32 left-8 z-10 max-w-[360px] hidden md:block animate-in fade-in slide-in-from-left-8 duration-1000">
        <Card className="bg-white/90 backdrop-blur-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] border-white/20 rounded-[2.5rem] overflow-hidden">
           <div className="h-2 bg-accent w-full"></div>
           <CardHeader className="pb-4 pt-8 px-8">
             <CardTitle className="text-4xl font-black text-primary leading-tight mb-3 tracking-tighter">
               Banjarsari <span className="text-accent-foreground">Connect</span>
             </CardTitle>
             <CardDescription className="text-sm font-semibold text-muted-foreground/80 leading-relaxed">
               Selamat datang di portal warga digital. Kami mempermudah akses informasi dan layanan untuk seluruh warga RW 02.
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

      {/* Mobile Top View */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-10">
        <Card className="bg-white/90 backdrop-blur-xl shadow-2xl border-white/20 rounded-3xl p-5 flex items-center justify-between border">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
               <MapPin className="text-white w-6 h-6" />
            </div>
            <div className="text-left">
              <h1 className="text-lg font-black text-primary tracking-tighter">Banjarsari Connect</h1>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">RW 2 Metro Utara</p>
            </div>
          </div>
          <Button size="icon" variant="outline" className="rounded-2xl border-primary w-12 h-12 text-primary shadow-lg" asChild>
             <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                <Navigation className="w-5 h-5" />
             </a>
          </Button>
        </Card>
      </div>

      {/* Decorative Gradient Overlays */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white/20 via-transparent to-black/10 z-[5]"></div>
    </div>
  );
}
