
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, User, Sparkles, Loader2, ArrowRight } from 'lucide-react';
import { summarizeNews } from '@/ai/flows/summarize-news-flow';

export function NewsList() {
  const db = useFirestore();
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  const publicNewsQuery = useMemoFirebase(() => {
    return query(collection(db, 'announcements_public'), orderBy('publicationDate', 'desc'));
  }, [db]);

  const { data: news, isLoading } = useCollection(publicNewsQuery);

  const handleSummarize = async (id: string, content: string) => {
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

  if (isLoading) {
    return <div className="p-20 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary" /></div>;
  }

  if (!news || news.length === 0) {
    return (
      <div className="p-20 text-center border-4 border-dashed border-secondary rounded-[3rem]">
        <h3 className="text-2xl font-black text-primary uppercase">Belum ada warta terbaru</h3>
        <p className="text-muted-foreground font-medium">Silakan cek kembali nanti untuk informasi terkini.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-16">
      {news.map((item) => (
        <div key={item.id} className="group grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-5 relative h-[400px] overflow-hidden rounded-[3rem] shadow-2xl">
            <Image
              src={item.imageUrl || PlaceHolderImages[Math.floor(Math.random() * 3) + 1].imageUrl}
              alt={item.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute top-6 left-6 flex gap-2">
              <span className="bg-white/90 backdrop-blur-md text-primary text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                {item.category.toUpperCase()}
              </span>
            </div>
          </div>
          
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center gap-6 text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-accent-foreground" /> 
                {new Date(item.publicationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-2">
                <User className="w-4 h-4 text-accent-foreground" /> 
                Sekretariat RW
              </span>
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
                Baca Selengkapnya
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
