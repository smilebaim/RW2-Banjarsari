import { NewsList } from '@/components/news/NewsList';
import { Sparkles } from 'lucide-react';

export default function NewsPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1">
        <section className="bg-primary py-20 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-accent/20 rounded-full -mr-32 -mt-32 blur-3xl"></div>
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-4xl font-black mb-4 uppercase tracking-tighter">Berita & Pengumuman</h1>
            <p className="text-white/80 max-w-2xl text-lg font-medium">
              Update terbaru mengenai kegiatan, pembangunan, dan informasi penting di lingkungan RW 2 Banjarsari.
            </p>
          </div>
        </section>

        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
               <div className="bg-accent/10 border border-accent/20 p-5 rounded-3xl flex items-start gap-4 max-w-3xl">
                <div className="w-10 h-10 bg-accent rounded-2xl flex items-center justify-center shrink-0 shadow-lg">
                  <Sparkles className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-black text-primary mb-1 uppercase text-sm">AI News Summarizer</h3>
                  <p className="text-sm text-muted-foreground font-medium">
                    Gunakan asisten AI kami untuk mendapatkan ringkasan singkat artikel dalam hitungan detik.
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
