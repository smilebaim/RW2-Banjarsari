import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FeedbackAnalysisView } from '@/components/admin/FeedbackAnalysisView';
import { BarChart3, Users, MessageSquare, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminDashboard() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
            <div>
              <h1 className="text-3xl font-bold text-primary mb-2">Dashboard Pengurus</h1>
              <p className="text-muted-foreground">Selamat datang kembali, Pengurus RW 2 Banjarsari.</p>
            </div>
            <div className="flex gap-4">
              <Card className="flex items-center gap-4 px-6 py-4 border-primary/20 bg-primary/5">
                <Users className="w-8 h-8 text-primary" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Total Warga</div>
                  <div className="text-2xl font-bold text-primary">1,240</div>
                </div>
              </Card>
              <Card className="flex items-center gap-4 px-6 py-4 border-accent/20 bg-accent/5">
                <MessageSquare className="w-8 h-8 text-accent-foreground" />
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase">Laporan Baru</div>
                  <div className="text-2xl font-bold text-accent-foreground">12</div>
                </div>
              </Card>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-12">
             <FeedbackAnalysisView />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
