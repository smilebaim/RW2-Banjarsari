
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { signOut } from 'firebase/auth';
import { AdminNewsManager } from '@/components/admin/AdminNewsManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { MapControlView } from '@/components/admin/MapControlView';
import { ManagementMemberManager } from '@/components/admin/ManagementMemberManager';
import { AdminServiceManager } from '@/components/admin/AdminServiceManager';
import { doc, setDoc, deleteDoc, collection, getDocs, query } from 'firebase/firestore';
import { 
  Users, 
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
  FileText
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
  { id: 'map', label: 'Infrastruktur', icon: MapIcon },
  { id: 'news', label: 'Informasi & Pengumuman', icon: Newspaper },
  { id: 'services', label: 'Administrasi Kependudukan', icon: FileText },
  { id: 'contacts', label: 'Kontak Penting', icon: Phone },
  { id: 'users', label: 'Struktur Pejabat Pamong', icon: Users },
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
  const contactsRef = useMemoFirebase(() => query(collection(db, 'important_contacts')), [db]);
  const membersRef = useMemoFirebase(() => query(collection(db, 'rw_management_members')), [db]);

  const { data: newsItems } = useCollection(newsRef);
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
        'admin_services',
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
      const roleData = {
        id: user.uid,
        username: user.email?.split('@')[0] || 'admin',
        email: user.email,
        role: 'SuperAdmin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'admin_roles', user.uid), roleData);

      await setDoc(doc(db, 'map_settings', 'rw02_boundary'), {
        polygons: "[]",
        lines: "[]",
        markers: "[]",
        updatedAt: new Date().toISOString()
      }, { merge: true });

      toast({
        title: "Inisialisasi Berhasil",
        description: "Dashboard dan peran admin telah siap digunakan.",
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
        <Loader2 className="w-16 h-16 text-primary animate-spin mb-6" />
        <p className="font-black text-primary animate-pulse uppercase tracking-[0.4em] text-[10px]">Menyiapkan Dashboard Admin...</p>
      </div>
    );
  }

  if (!user) return null;

  if (!adminRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8FAF9] p-6">
        <Card className="max-w-xl w-full border-none shadow-2xl rounded-[3.5rem] overflow-hidden">
          <div className="h-4 bg-primary" />
          <CardContent className="p-16 text-center space-y-10">
            <div className="w-28 h-28 bg-primary/10 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-inner">
              <Lock className="w-14 h-14 text-primary" />
            </div>
            <div className="space-y-4">
              <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Inisialisasi Sistem</h1>
              <p className="text-muted-foreground font-medium text-sm italic">Aktifkan dashboard Anda untuk mulai mengelola infrastruktur dan informasi wilayah RW 02.</p>
            </div>
            <Button 
              onClick={handleImportDummyData} 
              disabled={isProcessing}
              className="w-full h-18 rounded-[1.5rem] bg-primary text-white text-lg font-black uppercase tracking-widest shadow-2xl shadow-primary/30 gap-4 transition-all hover:scale-105 py-6"
            >
              {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
              Aktifkan Portal Admin
            </Button>
            <Button variant="ghost" onClick={handleLogout} className="text-muted-foreground font-black uppercase tracking-widest text-[10px] hover:text-primary">
              Keluar Akun
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-4 mb-16">
        <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shadow-2xl shadow-primary/30">
          <LayoutDashboard className="text-white w-7 h-7" />
        </div>
        <div>
          <h2 className="font-black text-primary leading-none text-2xl tracking-tighter uppercase">Admin</h2>
          <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mt-1.5 opacity-50">RW 02 Banjarsari</p>
        </div>
      </div>

      <nav className="flex-1 space-y-3">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              setActiveTab(item.id);
              setIsMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-5 px-6 py-5 rounded-[1.5rem] transition-all duration-500 group ${
              activeTab === item.id 
                ? 'bg-primary text-white shadow-2xl shadow-primary/30' 
                : 'text-muted-foreground hover:bg-secondary/80 hover:text-primary'
            }`}
          >
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'text-accent' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="font-black text-[10px] uppercase tracking-[0.2em]">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="pt-10 border-t border-secondary/50 space-y-5">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button className="w-full flex items-center gap-5 px-6 py-4 rounded-[1.5rem] text-orange-600 hover:bg-orange-50 font-black transition-all group">
              <Trash2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
              <span className="text-[10px] uppercase tracking-widest">Kosongkan Data</span>
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-[3rem] p-12 border-none shadow-2xl">
            <AlertDialogHeader className="space-y-4">
              <AlertDialogTitle className="text-2xl font-black uppercase tracking-tighter">Hapus Seluruh Data?</AlertDialogTitle>
              <AlertDialogDescription className="font-medium text-sm italic">
                Tindakan ini permanen. Semua berita, kontak, profil pengurus, dan data infrastruktur peta akan dihapus secara menyeluruh.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="mt-10 gap-4">
              <AlertDialogCancel className="rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]">Batal</AlertDialogCancel>
              <AlertDialogAction onClick={clearAllData} className="rounded-2xl h-14 bg-red-600 hover:bg-red-700 font-black uppercase tracking-widest text-[10px] text-white">Hapus Permanen</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full justify-start gap-5 px-6 py-8 rounded-[1.5rem] text-red-500 hover:bg-red-50 hover:text-red-600 transition-all font-black"
        >
          <LogOut className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-widest">Keluar Sistem</span>
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#F8FAF9]">
      <aside className="w-80 bg-white border-r border-secondary/50 p-10 hidden lg:flex flex-col shadow-xl sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto pb-32">
        <header className="h-28 bg-white/80 backdrop-blur-3xl border-b border-secondary/50 px-8 lg:px-12 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-6">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl bg-secondary shadow-inner w-12 h-12">
                  <Menu className="w-6 h-6 text-primary" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-10 border-none shadow-2xl">
                <SidebarContent />
              </SheetContent>
            </Sheet>

            <div className="relative w-64 md:w-96 group hidden sm:block">
              <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-primary w-5 h-5 opacity-40 group-focus-within:opacity-100 transition-opacity" />
              <Input placeholder="Cari data wilayah..." className="pl-14 bg-secondary/50 border-none h-14 rounded-[1.5rem] font-medium shadow-inner" />
            </div>
          </div>

          <div className="flex items-center gap-6 lg:gap-10">
            <div className="flex gap-3">
              <Button size="icon" variant="ghost" className="rounded-2xl bg-secondary/80 w-12 h-12 shadow-sm hidden md:flex" onClick={handleImportDummyData} disabled={isProcessing}>
                <Database className={`w-6 h-6 text-primary ${isProcessing ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-2xl bg-secondary/80 w-12 h-12 shadow-sm">
                <Settings className="w-6 h-6 text-muted-foreground" />
              </Button>
            </div>
            <div className="h-10 w-px bg-secondary/80 hidden lg:block" />
            <div className="flex items-center gap-4 lg:gap-6">
              <div className="text-right hidden lg:block">
                <p className="text-base font-black text-primary uppercase leading-none mb-1.5">{user.email?.split('@')[0]}</p>
                <Badge variant="secondary" className="text-[9px] font-black uppercase tracking-widest bg-accent/20 text-accent-foreground px-3 py-1 border-none shadow-sm">{adminRole?.role || 'Admin'}</Badge>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center overflow-hidden shadow-inner">
                <Users className="w-7 h-7 text-primary" />
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 lg:p-12 container mx-auto">
          {activeTab === 'overview' && (
            <div className="space-y-12 lg:space-y-16 animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-primary mb-4 uppercase tracking-tighter">Ringkasan Aktivitas</h1>
                <p className="text-muted-foreground font-medium text-base md:text-lg italic border-l-4 border-accent pl-6">Monitoring aktivitas dan statistik wilayah RW 02 Banjarsari secara real-time.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
                {[
                  { label: 'Total Pamong', value: memberItems?.length || 0, sub: 'Anggota Aktif', icon: Users, color: 'bg-blue-600' },
                  { label: 'Informasi Terbit', value: newsItems?.length || 0, sub: 'Warta Wilayah', icon: Newspaper, color: 'bg-primary' },
                  { label: 'Kontak Publik', value: contactItems?.length || 0, sub: 'Instansi Terdaftar', icon: Phone, color: 'bg-green-600' },
                  { label: 'Status Peta', value: 'OK', sub: 'Geospasial Aktif', icon: MapIcon, color: 'bg-orange-600' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-2xl rounded-[3rem] overflow-hidden group hover:-translate-y-3 transition-all duration-700 bg-white">
                    <CardContent className="p-10">
                      <div className="flex items-start justify-between mb-8">
                        <div className={`w-16 h-16 ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-2xl group-hover:rotate-6 transition-transform`}>
                          <stat.icon className="w-8 h-8" />
                        </div>
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-[0.2em] border-secondary/50 px-3 py-1">{stat.sub}</Badge>
                      </div>
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-2">{stat.label}</p>
                      <h3 className="text-4xl font-black text-gray-900 tracking-tighter leading-none">{stat.value}</h3>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'map' && <MapControlView />}
          {activeTab === 'news' && <AdminNewsManager />}
          {activeTab === 'services' && <AdminServiceManager />}
          {activeTab === 'contacts' && <ContactManager />}
          {activeTab === 'users' && <ManagementMemberManager />}
        </div>
      </main>
    </div>
  );
}
