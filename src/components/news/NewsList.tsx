
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Calendar, User, Sparkles, Loader2, ArrowRight, Share2 } from 'lucide-react';
import { summarizeNews } from '@/ai/flows/summarize-news-flow';
import { Badge } from '@/components/ui/badge';

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
    return (
      <div className="py-32 flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary/30">Menyusun Warta...</p>
      </div>
    );
  }

  if (!news || news.length === 0) {
    return (
      <div className="p-20 text-center border-4 border-dashed border-secondary rounded-[4rem] bg-secondary/5">
        <h3 className="text-3xl font-black text-primary uppercase tracking-tighter mb-4">Belum ada warta terbaru</h3>
        <p className="text-muted-foreground font-medium max-w-sm mx-auto">Informasi terkini dari lingkungan RW 02 akan segera muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-32">
      {news.map((item, idx) => (
        <article key={item.id} className="group relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            {/* Image Section */}
            <div className="lg:col-span-5 order-1">
              <div className="relative h-[400px] md:h-[550px] overflow-hidden rounded-[3rem] shadow-2xl transition-transform duration-700 group-hover:-translate-y-2">
                <Image
                  src={item.imageUrl || PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl}
                  alt={item.title}
                  fill
                  className="object-cover scale-105 group-hover:scale-110 transition-transform duration-1000"
                  data-ai-hint="news event"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute top-8 left-8">
                  <Badge className="bg-white/90 backdrop-blur-md text-primary hover:bg-white text-[10px] font-black px-5 py-2 rounded-full uppercase tracking-[0.2em] shadow-xl border-none">
                    {item.category || 'WARTA'}
                  </Badge>
                </div>
              </div>
            </div>
            
            {/* Content Section */}
            <div className="lg:col-span-7 order-2 lg:pt-8">
              <div className="flex items-center gap-6 text-[10px] font-black text-primary/40 uppercase tracking-[0.3em] mb-8">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> 
                  {new Date(item.publicationDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
                <span className="w-1 h-1 bg-primary/20 rounded-full"></span>
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" /> 
                  Sekretariat RW 02
                </span>
              </div>
              
              <h2 className="text-4xl md:text-6xl font-black text-primary leading-[0.95] tracking-tighter mb-8 group-hover:text-accent-foreground transition-colors duration-500">
                {item.title}
              </h2>
              
              <div className="relative">
                {summaries[item.id] ? (
                  <div className="bg-accent/5 border-l-[6px] border-accent p-8 rounded-r-[2.5rem] animate-in slide-in-from-left-8 duration-700 shadow-inner">
                    <div className="flex items-center gap-3 text-accent-foreground font-black text-[10px] mb-4 uppercase tracking-[0.3em]">
                      <Sparkles className="w-4 h-4" /> Ringkasan Cerdas AI
                    </div>
                    <p className="text-xl md:text-2xl leading-relaxed text-foreground/80 italic font-bold tracking-tight">
                      "{summaries[item.id]}"
                    </p>
                  </div>
                ) : (
                  <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed font-medium line-clamp-4 tracking-tight">
                    {item.content}
                  </p>
                )}
              </div>
              
              <div className="flex flex-wrap items-center gap-6 mt-12">
                <Button 
                  className="h-16 px-10 rounded-full bg-primary text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/20 hover:scale-105 transition-all group/btn"
                >
                  Baca Detail <ArrowRight className="ml-2 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Button>
                
                <Button 
                  variant="ghost" 
                  className="h-16 px-10 rounded-full border-2 border-primary/10 text-primary font-black uppercase tracking-widest text-[10px] hover:bg-primary/5 transition-all gap-3"
                  onClick={() => handleSummarize(item.id, item.content)}
                  disabled={loadingIds.has(item.id)}
                >
                  {loadingIds.has(item.id) ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Ringkas AI <Sparkles className="w-4 h-4" /></>
                  )}
                </Button>

                <Button variant="ghost" size="icon" className="w-16 h-16 rounded-full bg-secondary/30 text-primary hover:bg-primary hover:text-white transition-all">
                  <Share2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
          {/* Decorative Divider */}
          <div className="absolute -bottom-16 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/10 to-transparent"></div>
        </article>
      ))}
    </div>
  );
}
