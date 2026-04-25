import { NewsList } from '@/components/news/NewsList';
import { Sparkles, Newspaper } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        <section className="relative py-24 overflow-hidden">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 rounded-full -mr-32 -mt-32 blur-[120px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-20">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 text-accent-foreground font-black text-xs uppercase tracking-[0.3em] mb-4">
                  <Newspaper className="w-4 h-4" /> Informasi Resmi
                </div>
                <h1 className="text-7xl font-black text-primary mb-6 uppercase tracking-tighter leading-[0.85]">
                  Warta <br/>Banjarsari
                </h1>
                <p className="text-muted-foreground text-xl font-medium leading-relaxed">
                  Update terbaru mengenai kegiatan, pembangunan, dan pengumuman penting di lingkungan RW 2.
                </p>
              </div>
              
              <div className="bg-primary p-8 rounded-[2.5rem] text-white shadow-2xl shadow-primary/30 flex items-center gap-6 max-w-md border-t-4 border-white/20">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center shrink-0 border border-white/10">
                  <Sparkles className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="font-black uppercase text-sm tracking-widest mb-1">AI Summarizer</h3>
                  <p className="text-xs text-white/70 font-medium leading-relaxed">
                    Dapatkan poin penting dari setiap pengumuman secara instan dengan teknologi AI kami.
                  </p>
                </div>
              </div>
            </div>

            <NewsList />
          </div>
        </section>
      </main>
    </div>
  );
}