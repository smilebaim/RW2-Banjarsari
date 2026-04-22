import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';
import { MessageSquare, ShieldCheck, Heart } from 'lucide-react';

export default function FeedbackPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl mx-auto flex flex-col lg:flex-row gap-16">
            <div className="flex-1">
              <h1 className="text-4xl font-bold text-primary mb-6">Aspirasi & Laporan Warga</h1>
              <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
                Suara Anda sangat berarti bagi kemajuan RW 2 Banjarsari. Sampaikan saran, keluhan, atau aspirasi Anda secara langsung melalui formulir ini.
              </p>
              
              <div className="space-y-8">
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <MessageSquare className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">Terbuka & Transparan</h3>
                    <p className="text-muted-foreground">Setiap masukan akan dicatat dan dibahas dalam rapat rutin pengurus.</p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <ShieldCheck className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">Privasi Terjaga</h3>
                    <p className="text-muted-foreground">Informasi pribadi Anda hanya digunakan untuk kepentingan verifikasi laporan.</p>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center shrink-0">
                    <Heart className="text-primary w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-primary mb-1">Gotong Royong</h3>
                    <p className="text-muted-foreground">Membangun lingkungan yang lebih baik dimulai dari komunikasi yang sehat.</p>
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
      <Footer />
    </div>
  );
}
