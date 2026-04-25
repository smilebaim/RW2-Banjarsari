"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy, limit } from 'firebase/firestore';
import { analyzeFeedback, AnalyzeFeedbackOutput } from '@/ai/flows/analyze-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, TrendingUp, MessageCircle, Flag, Calendar, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function FeedbackAnalysisView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const feedbackQuery = useMemoFirebase(() => {
    return query(collection(db, 'resident_feedback'), orderBy('createdAt', 'desc'), limit(10));
  }, [db]);

  const { data: feedbacks, isLoading: isFetching } = useCollection(feedbackQuery);
  const currentFeedback = feedbacks?.[currentIndex];

  const handleAnalyze = async () => {
    if (!currentFeedback) return;
    setLoading(true);
    try {
      const result = await analyzeFeedback({ feedbackText: currentFeedback.message });
      
      // Update Firestore with AI analysis
      updateDocumentNonBlocking(doc(db, 'resident_feedback', currentFeedback.id), {
        aiAnalysisSummary: result.summary,
        aiSentiment: result.sentiment,
        aiIdentifiedThemes: result.themes,
        status: result.urgentIssues.length > 0 ? 'Urgent' : 'Received',
        updatedAt: new Date().toISOString()
      });

      toast({ title: "Analisis Selesai", description: "Hasil AI telah disimpan ke database." });
    } catch (error: any) {
      toast({ variant: "destructive", title: "Analisis Gagal", description: error.message });
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment?: string) => {
    switch (sentiment?.toLowerCase()) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      case 'mixed': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  if (isFetching) {
    return <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>;
  }

  if (!feedbacks || feedbacks.length === 0) {
    return (
      <div className="p-20 text-center border-4 border-dashed border-secondary rounded-[3rem] bg-white">
        <MessageCircle className="w-12 h-12 mx-auto text-secondary mb-4" />
        <h3 className="text-xl font-black text-primary uppercase">Belum ada laporan masuk</h3>
        <p className="text-muted-foreground font-medium">Aspirasi dari warga akan muncul di sini.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-2xl font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
          <TrendingUp className="w-6 h-6" />
          Analisis Aspirasi Warga (AI)
        </h2>
        <div className="flex flex-wrap gap-2">
          {feedbacks.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-3 h-3 rounded-full transition-all ${currentIndex === i ? 'bg-primary w-8' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white">
          <CardHeader className="bg-secondary/20 pb-8 pt-8">
            <div className="flex justify-between items-center mb-2">
              <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-primary/20 text-primary">
                {currentFeedback.type || 'Laporan'}
              </Badge>
              <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase">
                <Calendar className="w-3 h-3" />
                {new Date(currentFeedback.createdAt).toLocaleDateString('id-ID')}
              </div>
            </div>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {currentFeedback.name || 'Warga Anonim'}
            </CardTitle>
            <CardDescription className="font-bold text-primary/60">RT {currentFeedback.rt || '??'}</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <blockquote className="text-xl italic text-foreground/80 leading-relaxed border-l-4 border-primary pl-6 py-2">
              "{currentFeedback.message}"
            </blockquote>
            <div className="mt-10">
              <Button 
                onClick={handleAnalyze} 
                className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 gap-3" 
                disabled={loading}
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
                Analisis & Simpan Hasil AI
              </Button>
            </div>
          </CardContent>
        </Card>

        {currentFeedback.aiAnalysisSummary ? (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
              <div className="flex items-center justify-between mb-6">
                 <Badge className={getSentimentColor(currentFeedback.aiSentiment)}>
                  SENTIMEN: {currentFeedback.aiSentiment?.toUpperCase() || 'PROSES'}
                </Badge>
                <div className="flex items-center gap-1 text-[10px] font-black text-primary/40 uppercase tracking-widest">
                  <Sparkles className="w-3 h-3" /> Terakhir Dianalisis
                </div>
              </div>
              
              <h3 className="text-xl font-black text-primary mb-4 uppercase tracking-tighter">Ringkasan AI</h3>
              <p className="text-muted-foreground leading-relaxed mb-8 font-medium">
                {currentFeedback.aiAnalysisSummary}
              </p>
              
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-[10px] text-primary/60 mb-3 uppercase tracking-[0.2em]">Tema Teridentifikasi:</h4>
                  <div className="flex flex-wrap gap-2">
                    {currentFeedback.aiIdentifiedThemes?.map((theme: string, i: number) => (
                      <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary px-3 py-1 text-[10px] font-bold">
                        {theme}
                      </Badge>
                    ))}
                  </div>
                </div>

                {currentFeedback.status === 'Urgent' && (
                  <div className="p-5 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-4">
                    <Flag className="w-5 h-5 text-red-600 shrink-0 mt-1" />
                    <div>
                      <h4 className="font-black text-sm text-red-700 uppercase tracking-tight">Tindakan Mendesak</h4>
                      <p className="text-xs text-red-600/80 font-medium leading-relaxed">Sistem AI mendeteksi masalah ini memerlukan perhatian segera dari tim pengurus terkait.</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ) : (
          <div className="border-4 border-dashed border-secondary rounded-[3rem] flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-white shadow-inner">
            <Sparkles className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg font-bold text-primary/40 uppercase tracking-tighter">Butuh Wawasan AI?</p>
            <p className="text-sm">Klik tombol analisis pada laporan untuk mengaktifkan kecerdasan buatan.</p>
          </div>
        )}
      </div>
    </div>
  );
}