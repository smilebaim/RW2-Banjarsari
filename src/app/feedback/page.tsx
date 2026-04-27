'use client';

import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageSquare, Sparkles, ArrowDown } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-10 overflow-hidden border-b border-secondary/50">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[100px]"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                  <span className="w-6 h-[2px] bg-primary"></span>
                  <MessageSquare className="w-4 h-4" /> Saluran Warga
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                  Aspirasi <span className="text-gray-900">Digital</span>
                </h1>
                <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed max-w-lg">
                  Sampaikan saran, keluhan, atau pertanyaan Anda langsung kepada pengurus RW 02 melalui jalur komunikasi yang transparan.
                </p>
              </div>
              
              <div className="lg:mb-2">
                <div className="bg-zinc-900 px-6 py-5 rounded-3xl text-white shadow-xl flex items-center gap-4 max-w-sm border-t-2 border-primary">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center shrink-0 border border-white/10">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-bold uppercase text-[10px] tracking-widest text-accent">Koneksi Langsung</h3>
                    <p className="text-[10px] text-white/60 font-medium leading-tight uppercase tracking-wider">
                      Terhubung instan dengan WhatsApp pengurus terkait.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[9px] font-black uppercase tracking-[0.2em] text-primary/40">
              <span>Mulai Beraspirasi</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <FeedbackForm />
          </div>
        </section>
      </main>
    </div>
  );
}
