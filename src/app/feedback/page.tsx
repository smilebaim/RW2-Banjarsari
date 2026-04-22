import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 py-24 bg-secondary/20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-20">
            <div className="flex-1">
              <h1 className="text-5xl font-black text-primary mb-8 uppercase tracking-tighter">Aspirasi Warga</h1>
              <p className="text-xl text-muted-foreground mb-12 leading-relaxed font-medium">
                Suara Anda adalah kunci kemajuan. Sampaikan keluhan, saran, atau apresiasi Anda untuk RW 2 yang lebih baik.
              </p>
              
              <div className="space-y-10">
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner">
                    <MessageSquare className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-primary mb-2 uppercase text-lg">Terbuka & Cepat</h3>
                    <p className="text-muted-foreground font-medium">Setiap laporan diverifikasi dan ditindaklanjuti oleh pengurus dalam rapat rutin.</p>
                  </div>
                </div>
                
                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner">
                    <ShieldCheck className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-primary mb-2 uppercase text-lg">Keamanan Data</h3>
                    <p className="text-muted-foreground font-medium">Identitas pelapor tetap aman dan hanya digunakan untuk kepentingan verifikasi internal.</p>
                  </div>
                </div>

                <div className="flex gap-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-[1.5rem] flex items-center justify-center shrink-0 shadow-inner">
                    <Heart className="text-primary w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-black text-primary mb-2 uppercase text-lg">Gotong Royong</h3>
                    <p className="text-muted-foreground font-medium">Membangun harmoni lingkungan melalui komunikasi yang sehat dan konstruktif.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <FeedbackForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
