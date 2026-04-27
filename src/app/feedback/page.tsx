'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  FileText, 
  CreditCard, 
  Users, 
  ClipboardList,
  Baby,
  Loader2
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
  ShieldCheck,
  Heart: Zap
};

export default function FeedbackPage() {
  const db = useFirestore();
  const servicesQuery = useMemoFirebase(() => query(collection(db, 'admin_services'), orderBy('createdAt', 'asc')), [db]);
  const { data: adminServices, isLoading } = useCollection(servicesQuery);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-accent/5 rounded-full blur-[80px] -ml-10 -mb-10"></div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-start mb-24">
              {/* Info Section */}
              <div className="flex-1 lg:pt-4">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                  <span className="w-6 h-[2px] bg-primary"></span>
                  <MessageSquare className="w-4 h-4" /> Koneksi Langsung
                </div>
                
                <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                  Aspirasi <span className="text-gray-900">Digital</span>
                </h1>
                
                <p className="text-base md:text-lg text-muted-foreground mb-12 leading-relaxed font-medium italic border-l-4 border-accent pl-6">
                  Sampaikan laporan atau saran Anda langsung ke pengurus terkait melalui WhatsApp. Layanan cepat dan transparan untuk seluruh warga RW 02.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Zap className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-primary uppercase text-sm tracking-tight">Tanpa Antrean</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Langsung terhubung ke ponsel pengurus tanpa birokrasi berbelit.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-primary uppercase text-sm tracking-tight">Respon Cepat</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Pengurus dapat merespon laporan Anda secara real-time melalui chat.</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mt-12">
                  Sistem Digital RW 02 Banjarsari <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Form Section */}
              <div className="flex-1 w-full lg:max-w-md">
                <FeedbackForm />
              </div>
            </div>

            {/* Administrasi Kependudukan Section */}
            <section className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="text-center max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
                  <FileText className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Layanan Dokumen</span>
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-primary uppercase tracking-tighter mb-4">
                  Administrasi <span className="text-gray-900">Kependudukan</span>
                </h2>
                <p className="text-muted-foreground font-medium text-sm italic">
                  Informasi persyaratan dasar untuk pengurusan dokumen warga di tingkat RW 02 Banjarsari.
                </p>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 animate-spin text-primary/20" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {adminServices?.map((service, idx) => {
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

              <div className="bg-zinc-900 rounded-[3rem] p-10 md:p-14 text-white relative overflow-hidden group">
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
                        <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">Cepat</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
