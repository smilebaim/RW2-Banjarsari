"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth } from '@/firebase';
import { signOut } from 'firebase/auth';
import { FeedbackAnalysisView } from '@/components/admin/FeedbackAnalysisView';
import { AdminNewsManager } from '@/components/admin/AdminNewsManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { 
  Users, 
  MessageSquare, 
  Newspaper, 
  LogOut, 
  LayoutDashboard, 
  Phone, 
  Settings,
  Bell,
  Search,
  Loader2
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/10">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-bold text-primary animate-pulse uppercase tracking-[0.2em]">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      {/* Sidebar Modern */}
      <aside className="w-80 bg-white border-r border-secondary/50 p-8 hidden lg:flex flex-col shadow-sm">
        <div className="flex items-center gap-3 mb-12">
          <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <LayoutDashboard className="text-white w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-primary leading-none text-xl tracking-tighter uppercase">Admin Panel</h2>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">RW 02 Banjarsari</p>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          {[
            { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
            { id: 'news', label: 'Manajemen Berita', icon: Newspaper },
            { id: 'feedback', label: 'Aspirasi & Laporan', icon: MessageSquare },
            { id: 'contacts', label: 'Kontak Penting', icon: Phone },
            { id: 'users', label: 'Struktur Pengurus', icon: Users },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
                activeTab === item.id 
                  ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
              }`}
            >
              <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-accent' : 'group-hover:scale-110 transition-transform'}`} />
              <span className="font-bold text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="pt-8 border-t border-secondary/50">
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="w-full justify-start gap-4 px-6 py-6 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
          >
            <LogOut className="w-5 h-5" />
            Keluar Sistem
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-32">
        {/* Header Bar */}
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-secondary/50 px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="relative w-96 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Cari data warga atau laporan..." className="pl-12 bg-secondary/30 border-none h-12 rounded-2xl focus-visible:ring-1 focus-visible:ring-primary/20" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50 relative">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="h-10 w-px bg-secondary/50" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary uppercase leading-none mb-1">{user.email?.split('@')[0]}</p>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground">Super Admin</Badge>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                <Users className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="p-10 container mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-4xl font-black text-primary mb-2 uppercase tracking-tighter">Dashboard Utama</h1>
                  <p className="text-muted-foreground font-medium">Monitoring aktivitas wilayah RW 02 secara real-time.</p>
                </div>
                <div className="text-primary font-black text-xs uppercase tracking-[0.3em] bg-white px-6 py-3 rounded-2xl shadow-sm border border-secondary/50">
                  {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Total Warga', value: '1,240', sub: '+12 Bulan ini', icon: Users, color: 'bg-blue-500' },
                  { label: 'Laporan Baru', value: '12', sub: '3 Perlu tindak lanjut', icon: MessageSquare, color: 'bg-orange-500' },
                  { label: 'Berita Aktif', value: '8', sub: '2 Draft belum rilis', icon: Newspaper, color: 'bg-primary' },
                  { label: 'Keamanan', value: '100%', sub: 'Sistem Terpantau', icon: ShieldCheck, color: 'bg-green-600' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-xl shadow-gray-200/50 rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500">
                    <CardContent className="p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-7 h-7" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-secondary">{stat.sub}</Badge>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <h3 className="text-4xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8">
                  <FeedbackAnalysisView />
                </div>
                <div className="lg:col-span-4 space-y-8">
                   <Card className="border-none shadow-xl rounded-[2.5rem] bg-primary text-white overflow-hidden p-8">
                      <h3 className="text-xl font-black uppercase tracking-tighter mb-4">Pengumuman Cepat</h3>
                      <p className="text-white/70 text-sm mb-6 leading-relaxed">Gunakan fitur ini untuk merilis berita mendesak ke aplikasi warga dalam hitungan detik.</p>
                      <Button className="w-full h-14 bg-accent text-accent-foreground font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-accent/90">Buat Pengumuman Baru</Button>
                   </Card>
                   <Card className="border-none shadow-xl rounded-[2.5rem] bg-white p-8">
                      <h3 className="text-xl font-black text-primary uppercase tracking-tighter mb-6">Sapaan Pengurus</h3>
                      <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-bold text-primary">P</div>
                            <div className="flex-1">
                              <p className="text-sm font-bold leading-none mb-1">Pengurus RT 0{i}</p>
                              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Baru saja login</p>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          </div>
                        ))}
                      </div>
                   </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'news' && (
            <div className="animate-in fade-in zoom-in-95 duration-500">
               <AdminNewsManager />
            </div>
          )}

          {activeTab === 'contacts' && (
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
               <ContactManager />
            </div>
          )}

          {activeTab === 'feedback' && (
             <div className="space-y-8">
               <h1 className="text-4xl font-black text-primary uppercase tracking-tighter">Kotak Aspirasi</h1>
               <FeedbackAnalysisView />
             </div>
          )}
          
          {activeTab === 'users' && (
             <div className="p-20 text-center border-4 border-dashed border-secondary rounded-[3rem]">
               <Users className="w-20 h-20 mx-auto text-secondary mb-6" />
               <h2 className="text-2xl font-black text-primary uppercase mb-2">Manajemen Pengurus</h2>
               <p className="text-muted-foreground font-medium">Fitur ini sedang dalam pengembangan untuk integrasi profil pengurus.</p>
             </div>
          )}
        </div>
      </main>
    </div>
  );
}
