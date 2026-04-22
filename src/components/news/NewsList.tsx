"use client";

import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, User, Sparkles, Loader2 } from 'lucide-react';
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
    <div className="grid grid-cols-1 gap-12">
      {mockNews.map((item) => (
        <Card key={item.id} className="overflow-hidden border-border/50 shadow-sm flex flex-col md:flex-row min-h-[300px]">
          <div className="relative w-full md:w-1/3 min-h-[250px] md:min-h-full">
            <Image
              src={item.image}
              alt={item.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 flex flex-col p-8">
            <CardHeader className="p-0 mb-4">
              <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {item.date}</span>
                <span className="flex items-center gap-1"><User className="w-3 h-3" /> {item.author}</span>
              </div>
              <CardTitle className="text-2xl font-bold text-primary mb-4 leading-tight">
                {item.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              {summaries[item.id] ? (
                <div className="bg-secondary/40 p-5 rounded-xl border border-primary/10 mb-6 animate-in fade-in slide-in-from-top-4">
                  <div className="flex items-center gap-2 text-primary font-bold text-sm mb-2">
                    <Sparkles className="w-4 h-4" /> RINGKASAN AI
                  </div>
                  <p className="text-sm leading-relaxed italic text-foreground/80">
                    "{summaries[item.id]}"
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {item.content}
                </p>
              )}
            </CardContent>
            <CardFooter className="p-0 flex flex-wrap gap-3">
              <Button 
                variant="outline" 
                className="rounded-full border-primary text-primary hover:bg-primary/5"
                onClick={() => handleSummarize(item.id, item.content)}
                disabled={loadingIds.has(item.id)}
              >
                {loadingIds.has(item.id) ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Meringkas...
                  </>
                ) : summaries[item.id] ? 'Sudah Diringkas' : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Ringkas dengan AI
                  </>
                )}
              </Button>
              <Button className="rounded-full">Baca Detail</Button>
            </CardFooter>
          </div>
        </Card>
      ))}
    </div>
  );
}
