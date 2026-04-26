
'use client';

import { NewsList } from '@/components/news/NewsList';
import { Sparkles, Newspaper, ArrowDown } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative pt-24 pb-12 overflow-hidden">
          <div className="absolute top-0 right-0 w-[60vw] h-[60vh] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[120px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
              <div className="max-w-3xl">
                <div className="flex items-center gap-3 text-accent-foreground font-black text-[10px] uppercase tracking-[0.4em] mb-6">
                  <span className="w-8 h-[2px] bg-accent"></span>
                  <Newspaper className="w-4 h-4" /> Informasi Resmi
                </div>
                <h1 className="text-6xl md:text-8xl font-black text-primary mb-8 uppercase tracking-tighter leading-[0.85]">
                  Warta <br/><span className="text-gray-900">Banjarsari</span>
                </h1>
                <p className="text-muted-foreground text-xl md:text-2xl font-medium leading-relaxed max-w-xl">
                  Update terbaru mengenai kegiatan, pembangunan, dan pengumuman penting di lingkungan RW 2.
                </p>
              </div>
              
              <div className="lg:mb-4">
                <div className="bg-zinc-900 p-8 rounded-[3rem] text-white shadow-2xl flex items-center gap-6 max-w-md border-t-4 border-primary">
                  <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                    <Sparkles className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="font-black uppercase text-xs tracking-widest mb-1 text-accent">AI Summarizer</h3>
                    <p className="text-[11px] text-white/60 font-medium leading-relaxed uppercase tracking-wider">
                      Dapatkan inti berita secara instan dengan teknologi cerdas kami.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 mb-12 text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
              <span>Scroll Explore</span>
              <ArrowDown className="w-3 h-3 animate-bounce" />
            </div>

            <NewsList />
          </div>
        </section>
      </main>
    </div>
  );
}
