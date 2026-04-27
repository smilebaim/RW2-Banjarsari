'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { 
  FileText, 
  ShieldCheck, 
  ArrowRight, 
  Loader2,
  Users,
  CreditCard,
  ClipboardList,
  Baby,
  ChevronRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const ICON_MAP: Record<string, any> = {
  Users,
  CreditCard,
  ClipboardList,
  Baby,
  FileText,
  ShieldCheck
};

export default function ServicesPage() {
  const db = useFirestore();
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'admin_services'), orderBy('createdAt', 'asc')), [db]);
  const { data: adminServices, isLoading } = useCollection(servicesQuery);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-10 overflow-hidden border-b border-secondary/50">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                <span className="w-6 h-[2px] bg-primary"></span>
                <FileText className="w-4 h-4" /> Informasi Layanan
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                Administrasi <span className="text-gray-900">Kependudukan</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed italic border-l-4 border-accent pl-6">
                Panduan persyaratan pengurusan dokumen warga di tingkat RW 02 Banjarsari. Transparan, cepat, dan tanpa biaya tambahan.
              </p>
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="container mx-auto px-6 py-16 space-y-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-black text-primary/30 uppercase tracking-[0.4em] text-[10px]">Menyusun Data Layanan...</p>
            </div>
          ) : !adminServices || adminServices.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-secondary/30 max-w-2xl mx-auto">
              <FileText className="w-12 h-12 mx-auto text-secondary mb-4" />
              <h3 className="text-xl font-black text-primary uppercase">Data belum tersedia</h3>
              <p className="text-muted-foreground text-sm mt-2">Sedang dalam proses pembaruan informasi oleh admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {adminServices.map((service, idx) => {
                const IconComp = ICON_MAP[service.icon || 'FileText'] || FileText;
                return (
                  <Card key={idx} className="rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 group bg-white border border-secondary/20 hover:-translate-y-2">
                    <CardContent className="p-10 flex flex-col h-full">
                      <div className={cn(
                        "w-16 h-16 rounded-3xl flex items-center justify-center mb-8 transition-all shadow-inner group-hover:scale-110 group-hover:rotate-3", 
                        service.color || "bg-blue-500/10 text-blue-600"
                      )}>
                        <IconComp className="w-8 h-8" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <h3 className="text-xl font-black text-primary uppercase tracking-tighter leading-none">
                          {service.title}
                        </h3>
                        <p className="text-[11px] text-muted-foreground font-medium leading-relaxed italic">
                          {service.description}
                        </p>
                      </div>
                      <div className="mt-10 pt-6 border-t border-secondary/50">
                        <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-primary/40 group-hover:text-primary transition-colors">
                          Siapkan Berkas <ChevronRight className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}

          {/* Important Notice HUD */}
          <div className="relative group overflow-hidden rounded-[4rem] bg-zinc-900 shadow-2xl transition-all duration-500 hover:shadow-primary/20">
            <div className="absolute top-0 right-0 w-[40%] h-full bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 group-hover:bg-primary/20 transition-all duration-700"></div>
            <div className="relative p-12 md:p-16 flex flex-col md:flex-row items-center gap-12">
              <div className="w-24 h-24 bg-accent rounded-[2rem] flex items-center justify-center text-black shrink-0 shadow-2xl rotate-3 group-hover:rotate-0 transition-transform duration-500">
                <ShieldCheck className="w-12 h-12" />
              </div>
              <div className="space-y-6">
                <h3 className="text-3xl font-black uppercase tracking-tighter text-accent leading-none">Penting untuk Diketahui</h3>
                <p className="text-white/70 text-base font-medium leading-relaxed max-w-4xl italic border-l-2 border-accent/30 pl-6">
                  Setiap pengurusan administrasi kependudukan di tingkat RW 02 tidak dipungut biaya (Gratis). Pastikan Anda membawa dokumen asli dan fotokopi yang diperlukan saat menemui pengurus terkait untuk mempercepat proses verifikasi di lapangan.
                </p>
                <div className="flex flex-wrap gap-6 pt-4">
                  {[
                    { label: 'Transparan', color: 'bg-accent' },
                    { label: 'Akuntabel', color: 'bg-primary' },
                    { label: 'Tanpa Biaya', color: 'bg-accent' }
                  ].map((tag, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={cn("w-2 h-2 rounded-full animate-pulse", tag.color)}></div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-white/40">{tag.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
