"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { summarizeNews } from '@/ai/flows/summarize-news-flow';

const mockNews = [
  {
    id: 1,
    title: "Program Imunisasi Anak Nasional di Balai RW",
    date: "12 Juni 2024",
    author: "Sekretariat RW",
    content: "Dalam rangka menyukseskan Bulan Imunisasi Anak Nasional, RW 2 Banjarsari bekerjasama dengan Puskesmas Metro Utara akan mengadakan kegiatan imunisasi gratis. Kegiatan ini ditujukan bagi anak usia 9 bulan hingga 12 tahun. Harap membawa buku KIA. Kami menghimbau seluruh orang tua yang memiliki balita dan anak-anak untuk hadir tepat waktu demi kesehatan generasi masa depan kita. Tersedia juga vitamin A gratis untuk balita.",
    image: PlaceHolderImages[1].imageUrl
  },
  {
    id: 2,
    title: "Update Perbaikan Jalan Gang Melati",
    date: "10 Juni 2024",
    author: "Bagian Pembangunan",
    content: "Pengerjaan perbaikan jalan di Gang Melati akan dimulai pada hari Senin depan. Mohon kepada warga yang memarkir kendaraannya di area tersebut untuk sementara memindahkan kendaraannya guna kelancaran alat berat. Perbaikan ini diperkirakan memakan waktu 4 hari kerja. Kami memohon maaf atas ketidaknyamanan yang ditimbulkan selama proses konstruksi berlangsung. Kerjasama warga sangat kami harapkan.",
    image: PlaceHolderImages[2].imageUrl
  },
  {
    id: 3,
    title: "Lomba Kebersihan Lingkungan Antar RT",
    date: "5 Juni 2024",
    author: "Ketua RW",
    content: "Menyambut HUT Kemerdekaan RI, RW 2 akan mengadakan lomba kebersihan dan keasrian lingkungan antar RT. Penilaian akan dilakukan mulai tanggal 1 Agustus. Kriteria penilaian meliputi pengelolaan sampah, penghijauan, dan ketertiban administrasi. Hadiah menarik menanti bagi RT pemenang! Ayo tunjukkan semangat kebersamaan dan kecintaan kita pada lingkungan sekitar.",
    image: PlaceHolderImages[3].imageUrl
  }
];

export function NewsList() {
  const [summaries, setSummaries] = useState<Record<number, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  const handleSummarize = async (id: number, content: string) => {
    if (summaries[id]) return;
    
    setLoadingIds(prev => new Set(prev).add(id));
    try {
      const result = await summarizeNews({ newsArticle: content });
      setSummaries(prev => ({ ...prev, [id]: result.summary }));
    } catch (error) {
      console.error("Failed to summarize:", error);
    } finally {
      setLoadingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-16">
      {mockNews.map((item) => (
        <div key={item.id} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative h-[400px] overflow-hidden rounded-[3rem] shadow-2xl">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                PENTING
              </span>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-accent-foreground" /> {item.date}</span>
              <span className="flex items-center gap-2"><User className="w-4 h-4 text-accent-foreground" /> {item.author}</span>
            </div>
            
            <h2 className="text-4xl font-black text-primary leading-[1.1] tracking-tighter group-hover:text-accent-foreground transition-colors">
              {item.title}
            </h2>
            
            {summaries[item.id] ? (
              <div className="bg-accent/10 border-l-4 border-accent p-6 rounded-r-3xl animate-in fade-in slide-in-from-left-4">
                <div className="flex items-center gap-2 text-accent-foreground font-black text-xs mb-3 uppercase tracking-widest">
                  <Sparkles className="w-4 h-4" /> AI Summary
                </div>
                <p className="text-lg leading-relaxed text-foreground/80 italic font-medium">
                  "{summaries[item.id]}"
                </p>
              </div>
            ) : (
              <p className="text-xl text-muted-foreground leading-relaxed font-medium line-clamp-3">
                {item.content}
              </p>
            )}
            
            <div className="flex flex-wrap gap-4 pt-4">
              <Button 
                variant="outline" 
                className="h-14 px-8 rounded-full border-2 border-primary text-primary hover:bg-primary hover:text-white font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:shadow-primary/20"
                onClick={() => handleSummarize(item.id, item.content)}
                disabled={loadingIds.has(item.id)}
              >
                {loadingIds.has(item.id) ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>Ringkas Artikel <Sparkles className="ml-2 w-4 h-4" /></>
                )}
              </Button>
              <Button className="h-14 px-8 rounded-full bg-primary text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                Baca Selengkapnya <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}