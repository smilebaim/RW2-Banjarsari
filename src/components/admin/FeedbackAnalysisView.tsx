"use client";

import { useState } from 'react';
import { analyzeFeedback, AnalyzeFeedbackOutput } from '@/ai/flows/analyze-feedback';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, AlertCircle, TrendingUp, MessageCircle, Flag } from 'lucide-react';

const mockFeedbacks = [
  "Saya merasa lampu jalan di sekitar RT 02 banyak yang mati, mohon segera diperbaiki karena rawan kriminalitas di malam hari.",
  "Terima kasih atas kegiatan senam pagi minggu lalu, sangat bermanfaat buat ibu-ibu. Semoga rutin dilaksanakan tiap bulan.",
  "Saran untuk pengelolaan sampah agar lebih terjadwal, seringkali truk sampah datang terlambat dan menumpuk di depan rumah warga.",
  "Laporan adanya genangan air setiap hujan di jalan utama RW, sepertinya drainase tersumbat sampah.",
];

export function FeedbackAnalysisView() {
  const [analysis, setAnalysis] = useState<AnalyzeFeedbackOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const result = await analyzeFeedback({ feedbackText: mockFeedbacks[currentIndex] });
      setAnalysis(result);
    } catch (error) {
      console.error("Analysis failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'bg-green-100 text-green-700 border-green-200';
      case 'negative': return 'bg-red-100 text-red-700 border-red-200';
      case 'urgent': return 'bg-orange-100 text-orange-700 border-orange-200';
      default: return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
          <TrendingUp className="w-6 h-6" />
          Analisis Aspirasi Warga (AI)
        </h2>
        <div className="flex gap-2">
          {mockFeedbacks.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                setCurrentIndex(i);
                setAnalysis(null);
              }}
              className={`w-3 h-3 rounded-full transition-all ${currentIndex === i ? 'bg-primary w-8' : 'bg-gray-300'}`}
            />
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20">
            <CardTitle className="text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Laporan Masuk
            </CardTitle>
            <CardDescription>Pesan asli yang dikirimkan oleh warga</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <blockquote className="text-xl italic text-foreground/80 leading-relaxed border-l-4 border-primary pl-6">
              "{mockFeedbacks[currentIndex]}"
            </blockquote>
            <div className="mt-10">
              <Button 
                onClick={handleAnalyze} 
                className="w-full h-12 rounded-xl text-lg font-bold" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Menganalisis...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Analisis dengan AI
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {analysis ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <Card className="border-primary/20 shadow-md">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between mb-2">
                   <Badge className={getSentimentColor(analysis.sentiment)}>
                    SENTIMEN: {analysis.sentiment.toUpperCase()}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs font-bold text-primary/60">
                    <Sparkles className="w-3 h-3" /> ANALISIS AI
                  </div>
                </div>
                <CardTitle className="text-xl">Ringkasan Laporan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground leading-relaxed mb-6">
                  {analysis.summary}
                </p>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-bold text-sm text-primary mb-3 uppercase tracking-wider">Tema Utama:</h4>
                    <div className="flex flex-wrap gap-2">
                      {analysis.themes.map((theme, i) => (
                        <Badge key={i} variant="outline" className="bg-primary/5 border-primary/20 text-primary">
                          {theme}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {analysis.urgentIssues.length > 0 && (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-xl">
                      <h4 className="font-bold text-sm text-red-700 mb-2 flex items-center gap-2">
                        <Flag className="w-4 h-4" /> ISU MENDESAK:
                      </h4>
                      <ul className="list-disc list-inside text-sm text-red-600 space-y-1">
                        {analysis.urgentIssues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="border-2 border-dashed border-border rounded-3xl flex flex-col items-center justify-center p-12 text-center text-muted-foreground bg-gray-50/50">
            <Sparkles className="w-16 h-16 mb-4 opacity-20" />
            <p className="text-lg">Klik tombol analisis untuk mendapatkan wawasan cerdas dari laporan warga ini.</p>
          </div>
        )}
      </div>
    </div>
  );
}
