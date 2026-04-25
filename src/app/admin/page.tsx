"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useAuth, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { signOut } from 'firebase/auth';
import { FeedbackAnalysisView } from '@/components/admin/FeedbackAnalysisView';
import { AdminNewsManager } from '@/components/admin/AdminNewsManager';
import { ContactManager } from '@/components/admin/ContactManager';
import { MapControlView } from '@/components/admin/MapControlView';
import { ManagementMemberManager } from '@/components/admin/ManagementMemberManager';
import { doc, setDoc } from 'firebase/firestore';
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
  TrendingUp
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export default function AdminDashboard() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('overview');
  const [isSeeding, setIsSeeding] = useState(false);

  // Check if user has an admin role document in Firestore
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

  const handleImportDummyData = async () => {
    if (!user) return;
    setIsSeeding(true);
    try {
      // 1. Create Admin Role for self (Bootstrap)
      await setDoc(doc(db, 'admin_roles', user.uid), {
        id: user.uid,
        username: user.email?.split('@')[0] || 'admin',
        email: user.email,
        role: 'SuperAdmin',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // 2. Dummy Announcements (News & Events)
      const announcements = [
        {
          id: 'news-1',
          title: 'Peresmian Portal Digital Banjarsari Connect',
          content: 'Kami dengan bangga memperkenalkan portal Banjarsari Connect untuk memudahkan komunikasi antar warga. Portal ini mencakup fitur berita, aspirasi, dan peta wilayah.',
          summary: 'RW 02 Banjarsari resmi meluncurkan portal digital untuk transparansi layanan.',
          publicationDate: new Date().toISOString(),
          status: 'Published',
          category: 'Informasi',
          authorAdminUserId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'news-2',
          title: 'Agenda Gotong Royong Kebersihan Saluran Air',
          content: 'Dihimbau kepada seluruh warga RW 02 untuk mengikuti kegiatan gotong royong pada hari Minggu besok pukul 07.00 WIB guna mengantisipasi musim penghujan.',
          summary: 'Kegiatan gotong royong rutin warga untuk kebersihan lingkungan.',
          publicationDate: new Date().toISOString(),
          status: 'Published',
          category: 'Kegiatan',
          authorAdminUserId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'news-3',
          title: 'Sosialisasi Keamanan Lingkungan (Siskamling)',
          content: 'Rapat koordinasi keamanan akan dilaksanakan di Balai RW untuk membahas jadwal ronda baru dan pengadaan CCTV di titik-titik rawan.',
          summary: 'Peningkatan sistem keamanan lingkungan melalui koordinasi warga.',
          publicationDate: new Date().toISOString(),
          status: 'Published',
          category: 'Keamanan',
          authorAdminUserId: user.uid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const item of announcements) {
        await setDoc(doc(db, 'announcements_management', item.id), item);
        await setDoc(doc(db, 'announcements_public', item.id), item);
      }

      // 3. Dummy Members (Management Structure)
      const members = [
        {
          id: 'member-1',
          name: 'H. Sutrisno, S.E.',
          role: 'Ketua RW 02',
          contactNumber: '081234567890',
          email: 'sutrisno@banjarsari.id',
          description: 'Berkomitmen pada transparansi pengelolaan dana dan inovasi digital wilayah.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'member-2',
          name: 'Budi Hartono',
          role: 'Sekretaris',
          contactNumber: '081299887766',
          email: 'budi@banjarsari.id',
          description: 'Mengelola administrasi dan persuratan warga dengan tertib dan terdigitalisasi.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'member-3',
          name: 'Siti Aminah',
          role: 'Bendahara',
          contactNumber: '081255443322',
          email: 'siti@banjarsari.id',
          description: 'Bertanggung jawab atas laporan keuangan dan iuran rutin bulanan warga secara transparan.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const member of members) {
        await setDoc(doc(db, 'rw_management_members', member.id), member);
      }

      // 4. Dummy Contacts (Public Services)
      const contacts = [
        {
          id: 'contact-1',
          name: 'Puskesmas Banjarsari',
          category: 'Kesehatan',
          phoneNumber: '0725-41234',
          address: 'Jl. Ahmad Yani No. 10, Banjarsari',
          description: 'Layanan kesehatan masyarakat terdekat.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'contact-2',
          name: 'Polsek Metro Utara',
          category: 'Keamanan',
          phoneNumber: '0725-45678',
          address: 'Jl. Jendral Sudirman, Metro Utara',
          description: 'Layanan pengamanan dan laporan kepolisian.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'contact-3',
          name: 'Call Center PLN Metro',
          category: 'Utilitas',
          phoneNumber: '123 / 0725-55555',
          description: 'Layanan gangguan listrik 24 jam.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const contact of contacts) {
        await setDoc(doc(db, 'important_contacts', contact.id), contact);
      }

      // 5. Dummy Resident Feedback
      const feedbacks = [
        {
          id: 'fb-1',
          name: 'Bpk. Ahmad Fauzi',
          rt: '02',
          phone: '085211112222',
          type: 'Issue Report',
          subject: 'Lampu Jalan Padam',
          message: 'Lampu penerangan jalan di gang Mawar RT 02 padam sudah 3 hari, mohon segera ditindaklanjuti demi keamanan.',
          status: 'New',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'fb-2',
          name: 'Ibu Ratna',
          rt: '01',
          phone: '085233334444',
          type: 'Aspiration',
          subject: 'Usulan Taman Bermain',
          message: 'Usul untuk pemanfaatan lahan kosong di belakang balai RW untuk dijadikan taman bermain ramah anak.',
          status: 'New',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      for (const fb of feedbacks) {
        await setDoc(doc(db, 'resident_feedback', fb.id), fb);
      }

      toast({
        title: "Import Berhasil",
        description: "Data dummy lengkap (Berita, Pengurus, Kontak, Aspirasi) telah dimuat.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: error.message,
      });
    } finally {
      setIsSeeding(false);
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
              <h1 className="text-3xl font-black text-primary uppercase tracking-tighter">Inisialisasi Sistem</h1>
              <p className="text-muted-foreground font-medium">Aktifkan dashboard Anda dan muat data infrastruktur wilayah untuk pertama kali.</p>
            </div>
            <Button 
              onClick={handleImportDummyData} 
              disabled={isSeeding}
              className="w-full h-16 rounded-2xl bg-primary text-white text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-4"
            >
              {isSeeding ? <Loader2 className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6" />}
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
            { id: 'map', label: 'Peta Wilayah', icon: MapIcon },
            { id: 'news', label: 'Kelola Berita', icon: Newspaper },
            { id: 'feedback', label: 'Aspirasi AI', icon: TrendingUp },
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
            <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-primary w-4 h-4" />
            <Input placeholder="Cari data warga atau laporan..." className="pl-12 bg-secondary/30 border-none h-12 rounded-2xl" />
          </div>

          <div className="flex items-center gap-6">
            <div className="flex gap-2">
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50" onClick={handleImportDummyData} disabled={isSeeding}>
                <Database className={`w-5 h-5 text-primary ${isSeeding ? 'animate-spin' : ''}`} />
              </Button>
              <Button size="icon" variant="ghost" className="rounded-full bg-secondary/50">
                <Settings className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
            <div className="h-10 w-px bg-secondary/50" />
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-primary uppercase leading-none mb-1">{user.email?.split('@')[0]}</p>
                <Badge variant="secondary" className="text-[10px] font-bold uppercase tracking-widest bg-accent/20 text-accent-foreground">{adminRole?.role || 'Admin'}</Badge>
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
                <div className="flex gap-4">
                  <div className="text-primary font-black text-xs uppercase tracking-[0.3em] bg-white px-6 py-3 rounded-2xl shadow-sm border border-secondary/50">
                    {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { label: 'Total Warga', value: '1,240', sub: '+12 Bulan ini', icon: Users, color: 'bg-blue-500' },
                  { label: 'Laporan Baru', value: '12', sub: 'Perlu tindak lanjut', icon: MessageSquare, color: 'bg-orange-500' },
                  { label: 'Berita Aktif', value: '8', sub: '2 Draft belum rilis', icon: Newspaper, color: 'bg-primary' },
                  { label: 'Keamanan', value: '100%', sub: 'Sistem Terpantau', icon: ShieldCheck, color: 'bg-green-600' },
                ].map((stat, i) => (
                  <Card key={i} className="border-none shadow-xl rounded-[2rem] overflow-hidden group hover:-translate-y-2 transition-all duration-500 bg-white">
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
                      <Button onClick={() => setActiveTab('news')} className="w-full h-14 bg-accent text-accent-foreground font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-accent/90">Buat Pengumuman Baru</Button>
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
