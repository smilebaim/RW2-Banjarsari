import { FeedbackAnalysisView } from '@/components/admin/FeedbackAnalysisView';
import { Users, MessageSquare } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
            <div>
              <h1 className="text-4xl font-black text-primary mb-3 uppercase tracking-tighter">Portal Pengurus</h1>
              <p className="text-muted-foreground font-medium text-lg">Selamat bekerja, Pengurus RW 2 Banjarsari.</p>
            </div>
            <div className="flex gap-6">
              <Card className="flex items-center gap-5 px-8 py-5 border-none shadow-xl rounded-[2rem] bg-white">
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Total Warga</div>
                  <div className="text-3xl font-black text-primary">1.240</div>
                </div>
              </Card>
              <Card className="flex items-center gap-5 px-8 py-5 border-none shadow-xl rounded-[2rem] bg-accent/10">
                <div className="w-14 h-14 bg-accent/20 rounded-2xl flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 text-accent-foreground" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Laporan Baru</div>
                  <div className="text-3xl font-black text-accent-foreground">12</div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1">
             <FeedbackAnalysisView />
          </div>
        </div>
      </main>
    </div>
  );
}
