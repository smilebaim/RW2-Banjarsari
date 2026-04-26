
'use client';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageSquare, ShieldCheck, Heart, Zap, ArrowRight } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white relative overflow-hidden">
        {/* Background Accents */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[80px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-accent/5 rounded-full blur-[80px] -ml-10 -mb-10"></div>

        <div className="container mx-auto px-6 py-20 relative z-10">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 items-center">
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

                  <div className="space-y-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                      <Heart className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-primary uppercase text-sm tracking-tight">Privasi Aman</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">Percakapan terjadi secara pribadi antara warga dan pengurus pilihan.</p>
                  </div>

                  <div className="flex items-center gap-2 text-[10px] font-black text-primary uppercase tracking-widest mt-4">
                    Sistem Digital RW 02 Banjarsari <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="flex-1 w-full lg:max-w-md">
                <FeedbackForm />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
