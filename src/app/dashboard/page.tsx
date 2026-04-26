
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { FeedbackAnalysisView } from '@/components/admin/FeedbackAnalysisView';
import { AdminNewsManager } from '@/components/admin/AdminNewsManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { MapControlView } from '@/components/admin/MapControlView';
import { ManagementMemberManager } from '@/components/admin/ManagementMemberManager';
import { doc, setDoc, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import { 
  Users, 
  MessageSquare, 
  Newspaper, 
  LogOut, 
  LayoutDashboard, 
  Phone, 
  Settings,
  Loader2,
  ShieldCheck,
  Map as MapIcon,
  Database,
  Lock,
  Zap,
  Menu,
  Trash2,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const NAV_ITEMS = [
  { id: 'overview', label: 'Ringkasan', icon: LayoutDashboard },
  { id: 'map', label: 'Peta Wilayah', icon: MapIcon },
  { id: 'news', label: 'Kelola Berita', icon: Newspaper },
  { id: 'feedback', label: 'Kontrol Aspirasi', icon: MessageCircle },
  { id: 'contacts', label: 'Kontak Penting', icon: Phone },
  { id: 'users', label: 'Struktur Pengurus', icon: Users },
];

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const newsRef = useMemoFirebase(() => user ? query(collection(db, 'announcements_management')) : null, [db, user]);
  const feedbackRef = useMemoFirebase(() => user ? query(collection(db, 'resident_feedback')) : null, [db, user]);
  const contactsRef = useMemoFirebase(() => query(collection(db, 'important_contacts')), [db]);
  const membersRef = useMemoFirebase(() => query(collection(db, 'rw_management_members')), [db]);

  const { data: newsItems } = useCollection(newsRef);
  const { data: feedbackItems } = useCollection(feedbackRef);
  const { data: contactItems } = useCollection(contactsRef);
  const { data: memberItems } = useCollection(membersRef);

  const adminRoleRef = useMemoFirebase(() => user ? doc(db, 'admin_roles', user.uid) : null, [db, user]);
  const { data: adminRole, isLoading: isAdminRoleLoading } = useDoc(adminRoleRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/');
  };

  const clearAllData = async () => {
    setIsProcessing(true);
    try {
      const collections = [
        'announcements_management',
        'announcements_public',
        'rw_management_members',
        'important_contacts',
        'resident_feedback',
        'map_settings',
        'system_settings'
      ];

      for (const colName of collections) {
        const querySnapshot = await getDocs(collection(db, colName));
        const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);
      }

      toast({
        title: "Data Dihapus",
        description: "Semua data telah berhasil dihapus.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal Menghapus",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImportDummyData = async () => {
    if (!user) return;
    setIsProcessing(true);
    try {
      await setDoc(doc(db, 'admin_roles', user.uid), {
        id: user.uid,
        username: user.email?.split('@')[0] || 'admin',
        email: user.email,
        role: 'SuperAdmin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      await setDoc(doc(db, 'map_settings', 'rw02_boundary'), {
        polygons: JSON.stringify([{ id: 'initial-poly', name: 'RW 02 Banjarsari', description: 'Area utama RW 02 Banjarsari.', color: '#22c55e', coords: [[-5.097, 105.292], [-5.098, 105.293], [-5.099, 105.291]], type: 'polygon' }]),
        lines: "[]",
        markers: "[]",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Inisialisasi Berhasil",
        description: "Dashboard dan data contoh telah siap digunakan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message,
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isUserLoading || isAdminRoleLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/10">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="font-black text-primary animate-pulse uppercase tracking-[0.2em] text-xs">Menyiapkan Dashboard...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!adminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] p-4">
        <Card className="max-w-xl w-full border-none shadow-2xl rounded-[3rem] overflow-hidden">
          <div className="h-4 bg-primary" />
          <CardContent className="p-12 text-center space-y-8">
            <div className="w-24 h-24 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto">
              <Lock className="w-12 h-12 text-primary" />
            </div>
            <div className="space-y-3">
              <h1 className="text-2xl font-black text-primary uppercase tracking-tighter">Inisialisasi Sistem</h1>
              <p className="text-muted-foreground font-medium text-sm">Aktifkan dashboard Anda untuk mulai mengelola wilayah.</p>
            </div>
            <Button 
              onClick={handleImportDummyData} 
              disabled={isProcessing}
              className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-4"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
              Aktifkan Portal Admin
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground font-bold">
              Keluar Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 mb-12">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
          <LayoutDashboard className="text-white w-6 h-6" />
        </div>
        <div>
          <h2 className="font-black text-primary leading-none text-xl tracking-tighter uppercase">Dashboard</h2>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">RW 02 Banjarsari</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-xl shadow-primary/20' 
                : 'text-muted-foreground hover:bg-secondary/50 hover:text-primary'
            }`}
          >
            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-accent' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-bold text-xs uppercase tracking-widest">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-8 border-t border-secondary/50 space-y-4">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full justify-start gap-4 px-6 py-4 rounded-2xl text-orange-600 hover:bg-orange-50 font-bold transition-all">
              <Trash2 className="w-5 h-5" />
              <span className="text-[10px] uppercase tracking-widest">Kosongkan Data</span>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[2.5rem] p-10">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-xl font-black uppercase tracking-tighter">Hapus Semua Data?</AlertDialogTitle>
              <AlertDialogDescription className="font-medium">
                Tindakan ini akan menghapus semua berita, kontak, pengurus, dan data infrastruktur secara permanen.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-8 gap-4">
              <AlertDialogCancel className="rounded-xl h-12 font-bold">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllData} className="rounded-xl h-12 bg-red-600 hover:bg-red-700 font-bold text-white">Hapus Sekarang</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-4 px-6 py-6 rounded-2xl text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-bold"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-[10px] uppercase tracking-widest">Keluar Sistem</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      <aside className="w-80 bg-white border-r border-secondary/50 p-8 hidden lg:flex flex-col shadow-sm sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-32">
        <header className="h-24 bg-white/80 backdrop-blur-md border-b border-secondary/50 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl bg-secondary/50">
                  <Menu className="w-6 h-6 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-8">
                <SheetHeader className="mb-8">
                  <SheetTitle className="sr-only">Navigasi Dashboard</SheetTitle>
                </SheetHeader>
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="relative w-48 md:w-96 group hidden sm:block">
              <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
              <Input placeholder="Cari data wilayah..." className="pl-12 bg-secondary/30 border-none h-12 rounded-2xl" />
            </div>
          </div>

          <div className="flex items-center gap-4 lg:gap-6">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50 hidden md:flex" onClick={handleImportDummyData} disabled={isProcessing}>
                <Database className={`w-5 h-5 text-primary ${isProcessing ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="h-10 w-px bg-secondary/50 hidden lg:block" />
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-black text-primary uppercase leading-none mb-1">{user.email?.split('@')[0]}</p>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground">{adminRole?.role || 'Admin'}</Badge>
              </div>
              <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden">
                <Users className="w-5 h-5 lg:w-6 lg:h-6 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 lg:p-10 container mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-10 lg:space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                  <h1 className="text-3xl lg:text-4xl font-black text-primary mb-2 uppercase tracking-tighter">Ringkasan Aktivitas</h1>
                  <p className="text-muted-foreground font-medium text-sm lg:text-base">Monitoring aktivitas wilayah RW 02 secara real-time.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                {[
                  { label: 'Total Pengurus', value: memberItems?.length || 0, sub: 'Anggota Aktif', icon: Users, color: 'bg-blue-500' },
                  { label: 'Warta Wilayah', value: newsItems?.length || 0, sub: 'Berita Terpublikasi', icon: Newspaper, color: 'bg-primary' },
                  { label: 'Kontak Publik', value: contactItems?.length || 0, sub: 'Layanan Terdaftar', icon: Phone, color: 'bg-green-600' },
                  { label: 'Status Peta', value: 'Aktif', sub: 'Infrastruktur OK', icon: MapIcon, color: 'bg-orange-500' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white">
                    <CardContent className="p-6 lg:p-8">
                      <div className="flex items-start justify-between mb-6">
                        <div className={`w-12 h-12 lg:w-14 lg:h-14 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                          <stat.icon className="w-6 h-6 lg:w-7 lg:h-7" />
                        </div>
                        <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest border-secondary">{stat.sub}</Badge>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                      <h3 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tighter">{stat.value}</h3>
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
                      <h3 className="text-lg font-black uppercase tracking-tighter mb-4">Pengumuman Cepat</h3>
                      <p className="text-white/70 text-xs mb-6 leading-relaxed">Gunakan fitur ini untuk merilis berita mendesak ke aplikasi warga.</p>
                      <Button onClick={() => setActiveTab('news')} className="w-full h-14 bg-accent text-accent-foreground font-black uppercase tracking-widest text-[10px] rounded-2xl hover:bg-accent/90">Buat Pengumuman Baru</Button>
                   </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'map' && <MapControlView />}
          {activeTab === 'news' && <AdminNewsManager />}
          {activeTab === 'contacts' && <ContactManager />}
          {activeTab === 'feedback' && <FeedbackAnalysisView />}
          {activeTab === 'users' && <ManagementMemberManager />}
        </div>
      </main>
    </div>
  );
}
