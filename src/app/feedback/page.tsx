
'use client';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageSquare, ShieldCheck, Heart, Sparkles, TrendingUp } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[100px] -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-0 w-[30vw] h-[30vh] bg-accent/5 rounded-full blur-[80px] -ml-10 -mb-10"></div>

        <div className="container mx-auto px-4 py-24 md:py-32 relative z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-16 lg:gap-32">
              {/* Info Column */}
              <div className="flex-1">
                <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                  <span className="w-8 h-[2px] bg-primary"></span>
                  <MessageSquare className="w-4 h-4" /> Suara Warga
                </div>
                
                <h1 className="text-6xl md:text-8xl font-black text-primary mb-10 uppercase tracking-tighter leading-[0.85]">
                  Aspirasi <br/><span className="text-gray-900">Digital</span>
                </h1>
                
                <p className="text-xl md:text-2xl text-muted-foreground mb-16 leading-relaxed font-medium border-l-[6px] border-accent pl-10 italic">
                  Suara Anda adalah kunci kemajuan. Sampaikan keluhan, saran, atau apresiasi Anda untuk RW 02 yang lebih baik dan transparan.
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                  <div className="group space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <TrendingUp className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-primary uppercase text-lg tracking-tight">Analisis AI</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">Sistem kami menggunakan AI untuk mengelompokkan tema aspirasi agar lebih cepat diproses oleh pengurus.</p>
                  </div>
                  
                  <div className="group space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-primary uppercase text-lg tracking-tight">Privasi Aman</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">Identitas pelapor tetap terlindungi dan hanya digunakan untuk keperluan verifikasi internal pengurus.</p>
                  </div>

                  <div className="group space-y-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shadow-xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                      <Heart className="w-8 h-8" />
                    </div>
                    <h3 className="font-black text-primary uppercase text-lg tracking-tight">Aksi Nyata</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">Setiap laporan diverifikasi secara manual dan dibahas dalam rapat rutin bulanan pengurus RW.</p>
                  </div>

                  <div className="group space-y-4">
                    <div className="w-16 h-16 bg-accent/10 rounded-[1.5rem] flex items-center justify-center shadow-xl">
                      <Sparkles className="w-8 h-8 text-accent-foreground" />
                    </div>
                    <h3 className="font-black text-primary uppercase text-lg tracking-tight">Digital First</h3>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">Mempercepat birokrasi tradisional melalui platform digital yang terintegrasi dan efisien.</p>
                  </div>
                </div>
              </div>

              {/* Form Column */}
              <div className="flex-1 lg:max-w-xl">
                <div className="sticky top-32">
                  <FeedbackForm />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
