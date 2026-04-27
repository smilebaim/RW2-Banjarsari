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
  Baby
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
      <main className="flex-1 bg-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <header className="text-center max-w-3xl mx-auto mb-20">
              <div className="flex items-center justify-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                <span className="w-6 h-[2px] bg-primary"></span>
                <FileText className="w-4 h-4" /> Informasi Layanan
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                Administrasi <span className="text-gray-900">Kependudukan</span>
              </h1>
              <p className="text-base md:text-lg text-muted-foreground leading-relaxed font-medium italic border-l-4 border-accent pl-6 text-left mx-auto max-w-2xl">
                Panduan persyaratan pengurusan dokumen warga di tingkat RW 02 Banjarsari. Transparan, cepat, dan tanpa biaya tambahan.
              </p>
            </header>

            {/* Services Grid */}
            <div className="space-y-16">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                </div>
              ) : !adminServices || adminServices.length === 0 ? (
                <div className="text-center py-20 bg-secondary/5 rounded-[3rem] border-2 border-dashed border-secondary/20">
                  <p className="text-muted-foreground font-bold italic">Belum ada data layanan kependudukan.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {adminServices.map((service, idx) => {
                    const IconComp = ICON_MAP[service.icon || 'FileText'] || FileText;
                    return (
                      <Card key={idx} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white border border-secondary/20">
                        <CardContent className="p-8">
                          <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform", service.color || "bg-blue-500/10 text-blue-600")}>
                            <IconComp className="w-7 h-7" />
                          </div>
                          <h3 className="text-lg font-black text-primary uppercase tracking-tighter mb-3 leading-none">
                            {service.title}
                          </h3>
                          <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                            {service.description}
                          </p>
                          <div className="mt-6 pt-6 border-t border-secondary/50">
                            <Badge variant="ghost" className="text-[8px] font-black uppercase tracking-widest p-0 text-primary/40 group-hover:text-primary transition-colors">
                              Siapkan Berkas <ArrowRight className="inline ml-1 w-3 h-3" />
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}

              {/* Notice Card */}
              <div className="bg-zinc-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group shadow-2xl">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
                <div className="relative flex flex-col md:flex-row items-center gap-10">
                  <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-black shrink-0 shadow-2xl rotate-3">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <div className="space-y-4">
                    <h3 className="text-2xl font-black uppercase tracking-tighter text-accent">Penting untuk Diketahui</h3>
                    <p className="text-sm font-medium opacity-80 leading-relaxed max-w-3xl">
                      Setiap pengurusan administrasi kependudukan di tingkat RW 02 tidak dipungut biaya (Gratis). Pastikan Anda membawa dokumen asli dan fotokopi yang diperlukan saat menemui pengurus terkait untuk mempercepat proses verifikasi.
                    </p>
                    <div className="flex gap-4 pt-2">
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Transparan</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Akuntabel</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Tanpa Biaya</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
