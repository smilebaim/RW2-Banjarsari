
"use client";

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { 
  Layers, 
  Map as MapIcon, 
  Globe, 
  Moon, 
  Navigation,
  Maximize2,
  Info,
  Lock,
  Hexagon,
  AreaChart
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Load map dynamically
const LeafletMap = dynamic(() => import('@/components/map/LeafletMap'), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-secondary/20 animate-pulse rounded-[2.5rem]" />,
});

const COORDINATES: [number, number] = [-5.097673729554944, 105.2921561873565];
const ZOOM_LEVEL = 17;

type MapLayer = 'satellite' | 'streets' | 'dark';

export function MapControlView() {
  const [activeLayer, setActiveLayer] = useState<MapLayer>('satellite');
  const [showBoundary, setShowBoundary] = useState(true);

  const layers = [
    { id: 'satellite', label: 'Satelit', icon: Globe, description: 'Citra satelit resolusi tinggi' },
    { id: 'streets', label: 'Jalanan', icon: MapIcon, description: 'Peta jalan dan navigasi' },
    { id: 'dark', label: 'Mode Gelap', icon: Moon, description: 'Visualisasi malam hari' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Peta Wilayah</h1>
          <p className="text-muted-foreground font-medium">Monitoring geografis dan manajemen aset wilayah RW 02.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl gap-2 font-bold h-12">
            <Maximize2 className="w-4 h-4" /> Fullscreen
          </Button>
          <Button className="rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-2 font-bold h-12">
            <Navigation className="w-4 h-4" /> Fokus Wilayah
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[650px]">
        {/* Map Display */}
        <div className="lg:col-span-8 relative">
          <Card className="h-full border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <div className="absolute inset-0 z-0">
               <LeafletMap center={COORDINATES} zoom={ZOOM_LEVEL} layer={activeLayer} showBoundary={showBoundary} />
            </div>
            
            {/* Map Overlay Info */}
            <div className="absolute bottom-8 left-8 z-10">
              <div className="bg-white/80 backdrop-blur-xl p-6 rounded-[2rem] shadow-xl border border-white/20 max-w-xs">
                <div className="flex items-center gap-3 mb-3">
                  <Lock className="w-3 h-3 text-green-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-primary">Koordinat Terkunci</span>
                </div>
                <h4 className="font-black text-primary uppercase text-xs mb-1">Pusat Wilayah</h4>
                <p className="text-[10px] font-mono text-muted-foreground">5°05'51.6"S 105°17'31.8"E</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-6 flex flex-col h-full">
          {/* Layer Controls */}
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-black text-primary uppercase tracking-tighter">Kontrol Lapisan</h3>
            </div>

            <div className="space-y-3">
              {layers.map((layer) => (
                <button
                  key={layer.id}
                  onClick={() => setActiveLayer(layer.id as MapLayer)}
                  className={cn(
                    "w-full flex items-center gap-4 p-3 rounded-2xl transition-all duration-300 border-2 text-left group",
                    activeLayer === layer.id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-secondary/30 border-transparent hover:border-primary/20 text-muted-foreground"
                  )}
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                    activeLayer === layer.id ? "bg-white/20" : "bg-white"
                  )}>
                    <layer.icon className={cn("w-5 h-5", activeLayer === layer.id ? "text-white" : "text-primary")} />
                  </div>
                  <div>
                    <p className="font-bold text-xs leading-none mb-1">{layer.label}</p>
                    <p className={cn(
                      "text-[9px] uppercase tracking-widest font-medium",
                      activeLayer === layer.id ? "text-white/60" : "text-muted-foreground"
                    )}>
                      {layer.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Polygon / Boundary Tool */}
          <Card className="border-none shadow-xl rounded-[2.5rem] p-8 bg-white flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-green-600">
                  <Hexagon className="w-5 h-5" />
                </div>
                <h3 className="font-black text-primary uppercase tracking-tighter">Manajemen Batas</h3>
              </div>
              <Switch checked={showBoundary} onCheckedChange={setShowBoundary} />
            </div>

            <div className="space-y-6 flex-1">
              <div className="p-4 bg-secondary/50 rounded-2xl">
                <div className="flex items-center gap-3 mb-2">
                  <AreaChart className="w-4 h-4 text-primary" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Estimasi Luas</span>
                </div>
                <p className="text-2xl font-black text-primary">~4.2 Hektar</p>
              </div>

              <div className="space-y-3">
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Status Batas</span>
                    <Badge className="bg-green-100 text-green-700">Terverifikasi</Badge>
                 </div>
                 <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-muted-foreground">Tipe Polygon</span>
                    <span className="text-primary">Wilayah RW</span>
                 </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-secondary/50">
              <div className="bg-primary/5 p-4 rounded-2xl flex items-start gap-3 border border-primary/10">
                <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <p className="text-[10px] text-primary font-bold leading-relaxed uppercase tracking-tight">
                  Gunakan switch di atas untuk menampilkan batas administratif RW 02 Banjarsari pada peta.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
