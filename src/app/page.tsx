import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MapPin, Navigation, Info } from 'lucide-react';

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
          className="w-full h-full brightness-[0.9] saturate-[1.2]"
        ></iframe>
      </div>

      {/* Floating Header info */}
      <div className="absolute top-6 left-6 z-10 hidden md:block">
        <div className="flex items-center gap-3 p-2 pr-4 bg-white/90 backdrop-blur shadow-2xl rounded-2xl border border-white/20">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
             <MapPin className="text-white w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-black text-primary uppercase tracking-tight">RW 2 Banjarsari</h1>
            <p className="text-[10px] font-bold text-muted-foreground">Kec. Metro Utara, Kota Metro</p>
          </div>
        </div>
      </div>

      {/* Main Info Card - Floating Desktop */}
      <div className="absolute top-24 left-6 z-10 max-w-[340px] hidden md:block animate-in fade-in slide-in-from-left-4 duration-1000">
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-white/20 rounded-[2rem] overflow-hidden border">
           <div className="h-2 bg-accent w-full"></div>
           <CardHeader className="pb-4">
             <CardTitle className="text-3xl font-black text-primary leading-none mb-2">
               Banjarsari <span className="text-accent-foreground">Connect</span>
             </CardTitle>
             <CardDescription className="text-xs font-semibold text-muted-foreground leading-relaxed">
               Layanan digital terpadu untuk warga RW 2 Banjarsari. Temukan info, kontak, dan sampaikan aspirasi Anda.
             </CardDescription>
           </CardHeader>
           <CardContent className="space-y-3">
             <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-12 font-bold shadow-lg shadow-primary/20" asChild>
               <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                 <Navigation className="w-4 h-4 mr-2" />
                 Petunjuk Arah
               </a>
             </Button>
           </CardContent>
        </Card>
      </div>

      {/* Mobile view top card */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 w-[90%] md:hidden z-10">
        <Card className="bg-white/95 backdrop-blur shadow-xl border-white/20 rounded-2xl p-4 flex items-center justify-between border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
               <MapPin className="text-white w-5 h-5" />
            </div>
            <div className="text-left">
              <h1 className="text-sm font-black text-primary">Banjarsari Connect</h1>
              <p className="text-[10px] font-bold text-muted-foreground">RW 2 Metro Utara</p>
            </div>
          </div>
          <Button size="icon" variant="outline" className="rounded-xl border-primary text-primary" asChild>
             <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                <Navigation className="w-4 h-4" />
             </a>
          </Button>
        </Card>
      </div>
    </div>
  );
}
