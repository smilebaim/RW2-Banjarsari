
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking, useUser, useDoc } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { ShieldCheck, UserPlus, Search, Edit3, Trash2, Loader2, ShieldAlert, Lock, Info, CheckCircle2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const ROLE_OPTIONS = [
  { value: 'SuperAdmin', label: 'Super Admin', desc: 'Akses penuh ke seluruh sistem dan manajemen admin.' },
  { value: 'ContentManager', label: 'Pengelola Konten', desc: 'Hanya akses ke Warta, Layanan, dan Kontak.' },
  { value: 'InfrastructureEditor', label: 'Editor Infrastruktur', desc: 'Hanya akses ke Peta dan Inventaris Geospasial.' },
];

export function AdminUserManager() {
  const { user: currentUser } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adminUid, setAdminUid] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState('ContentManager');

  // Strict check for current user's role before fetching admin list
  const adminRoleRef = useMemoFirebase(() => currentUser ? doc(db, 'admin_roles', currentUser.uid) : null, [db, currentUser]);
  const { data: adminRole } = useDoc(adminRoleRef);

  const adminsQuery = useMemoFirebase(() => {
    if (!currentUser || !adminRole) return null;
    return query(collection(db, 'admin_roles'), orderBy('createdAt', 'desc'));
  }, [db, currentUser, adminRole]);

  const { data: admins, isLoading } = useCollection(adminsQuery);

  const filteredAdmins = admins?.filter(item => 
    item.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!adminUid || !email || !username) {
      toast({ variant: "destructive", title: "Data tidak lengkap", description: "UID, Email, dan Nama Pengguna wajib diisi." });
      return;
    }

    // Basic validation to prevent using email as UID
    if (adminUid.includes('@')) {
      toast({ 
        variant: "destructive", 
        title: "UID Tidak Valid", 
        description: "User ID (UID) biasanya berupa rangkaian karakter acak, bukan alamat email. Periksa Firebase Console." 
      });
      return;
    }

    setIsProcessing(true);
    const adminData = {
      id: adminUid,
      email,
      username,
      role,
      updatedAt: new Date().toISOString(),
    };

    const fullData = { 
      ...adminData, 
      createdAt: editingId ? (admins?.find(a => a.id === editingId)?.createdAt || new Date().toISOString()) : new Date().toISOString()
    };

    setDocumentNonBlocking(doc(db, 'admin_roles', adminUid), fullData, { merge: true });
    
    setTimeout(() => {
      setIsProcessing(false);
      setIsDialogOpen(false);
      resetForm();
      toast({ title: "Akses Berhasil Diatur", description: `Hak akses untuk ${username} telah diperbarui.` });
    }, 500);
  };

  const handleDelete = (id: string) => {
    if (id === currentUser?.uid) {
      toast({ variant: "destructive", title: "Gagal", description: "Anda tidak dapat menghapus akses diri sendiri." });
      return;
    }
    deleteDocumentNonBlocking(doc(db, 'admin_roles', id));
    toast({ title: "Akses Dihapus", description: "Pengguna tersebut tidak lagi memiliki akses admin." });
  };

  const resetForm = () => {
    setEditingId(null);
    setAdminUid('');
    setEmail('');
    setUsername('');
    setRole('ContentManager');
  };

  const openEdit = (admin: any) => {
    setEditingId(admin.id);
    setAdminUid(admin.id);
    setEmail(admin.email);
    setUsername(admin.username);
    setRole(admin.role);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Pengaturan Akses</h1>
          <p className="text-muted-foreground font-medium italic border-l-4 border-accent pl-6 text-sm">Kelola daftar pengelola dan tingkat izin akses sistem Banjarsari Connect.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-16 px-10 rounded-2xl bg-zinc-900 text-white shadow-2xl gap-4 font-black uppercase tracking-widest text-[10px] transition-all hover:scale-105">
              <UserPlus className="w-6 h-6" /> Tambah Admin Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[3rem] p-10 border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Izin Akses' : 'Daftarkan Admin'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User ID (Firebase UID)</label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <AlertCircle className="w-3 h-3 text-amber-500 cursor-help" />
                      </TooltipTrigger>
                      <TooltipContent className="bg-zinc-900 text-white p-4 rounded-xl text-[10px] max-w-[200px]">
                        UID adalah kode unik di Firebase Authentication. Jangan masukkan Email di sini.
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Input 
                  value={adminUid} 
                  onChange={e => setAdminUid(e.target.value)} 
                  disabled={!!editingId}
                  className="bg-secondary/50 border-none h-14 rounded-xl font-mono text-xs" 
                  placeholder="Contoh: aWH15p65P8h4ieyxnS..." 
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Email Resmi</label>
                <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary/50 border-none h-14 rounded-xl font-bold" placeholder="admin@banjarsari.id" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Pengguna / Panggilan</label>
                <Input value={username} onChange={e => setUsername(e.target.value)} className="bg-secondary/50 border-none h-14 rounded-xl font-bold" placeholder="Contoh: Budi Sekretaris" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Tingkat Izin (Role)</label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger className="bg-secondary/50 border-none h-14 rounded-xl font-bold">
                    <SelectValue placeholder="Pilih Role" />
                  </SelectTrigger>
                  <SelectContent className="rounded-2xl border-none shadow-2xl">
                    {ROLE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value} className="py-3">
                        <div className="flex flex-col">
                          <span className="font-black text-[10px] uppercase tracking-widest">{opt.label}</span>
                          <span className="text-[9px] text-muted-foreground italic font-medium">{opt.desc}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter className="gap-4">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest h-14">Batal</Button>
              <Button onClick={handleSave} disabled={isProcessing} className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary text-white h-14 px-10 shadow-xl shadow-primary/20">
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Simpan Hak Akses'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="Cari berdasarkan email atau nama..." 
              className="pl-16 h-18 bg-white border-none text-lg rounded-[2.5rem] shadow-2xl focus-visible:ring-primary font-black"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Card className="border-none shadow-2xl rounded-[3rem] overflow-hidden bg-white">
            <CardContent className="p-0">
              <div className="divide-y divide-secondary/30">
                {isLoading ? (
                  <div className="p-32 text-center"><Loader2 className="w-12 h-12 animate-spin mx-auto text-primary opacity-20" /></div>
                ) : filteredAdmins?.length === 0 ? (
                  <div className="p-32 text-center text-muted-foreground font-black uppercase tracking-widest text-xs italic">Tidak ada pengelola yang ditemukan.</div>
                ) : (
                  filteredAdmins?.map((admin) => (
                    <div key={admin.id} className="p-10 flex flex-col md:flex-row md:items-center justify-between hover:bg-secondary/10 transition-all duration-500 group">
                      <div className="flex items-center gap-8 mb-6 md:mb-0">
                        <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                          <ShieldCheck className="w-10 h-10" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-black text-xl mb-1 tracking-tighter uppercase text-gray-900 leading-none">{admin.username}</h4>
                          <p className="text-[11px] font-medium text-muted-foreground mb-1">{admin.email}</p>
                          <p className="text-[9px] font-mono text-muted-foreground/50 mb-3 truncate max-w-[200px]">UID: {admin.id}</p>
                          <Badge className="bg-accent/20 text-accent-foreground border-none font-black text-[9px] px-3 uppercase tracking-widest">
                            {admin.role}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right hidden sm:block mr-4">
                          <p className="text-[8px] font-black text-muted-foreground uppercase tracking-widest">Aktif Sejak</p>
                          <p className="text-[10px] font-bold">{new Date(admin.createdAt).toLocaleDateString('id-ID')}</p>
                        </div>
                        <div className="flex gap-3">
                          <Button onClick={() => openEdit(admin)} size="icon" variant="ghost" className="rounded-2xl w-12 h-12 hover:bg-primary/10 hover:text-primary transition-all shadow-sm"><Edit3 className="w-6 h-6" /></Button>
                          <Button 
                            onClick={() => handleDelete(admin.id)} 
                            disabled={admin.id === currentUser?.uid}
                            size="icon" 
                            variant="ghost" 
                            className="rounded-2xl w-12 h-12 hover:bg-red-50 hover:text-red-500 transition-all shadow-sm disabled:opacity-30"
                          >
                            <Trash2 className="w-6 h-6" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8">
          <Card className="border-none shadow-2xl rounded-[3rem] bg-zinc-900 text-white p-10 overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-3xl"></div>
            <div className="relative space-y-6">
              <div className="w-16 h-16 bg-accent rounded-2xl flex items-center justify-center text-black shadow-2xl">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black uppercase tracking-tighter text-accent leading-none">Keamanan & Peran</h3>
              <p className="text-xs text-white/70 leading-relaxed font-medium italic border-l-2 border-accent/30 pl-6">
                Pastikan Anda hanya memberikan akses kepada personil terpercaya. UID (User ID) dapat ditemukan di Firebase Authentication Console setelah pengguna melakukan login pertama kali.
              </p>
            </div>
          </Card>

          <Card className="border-none shadow-2xl rounded-[3rem] bg-white p-10">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-8 flex items-center gap-3">
              <Info className="w-4 h-4" /> Informasi Hak Akses
            </h3>
            <div className="space-y-8">
              {[
                { label: 'Super Admin', icon: CheckCircle2, color: 'text-green-500', desc: 'Akses tanpa batas ke seluruh fitur sistem.' },
                { label: 'Content Manager', icon: Lock, color: 'text-blue-500', desc: 'Hanya warta, layanan kependudukan, dan kontak.' },
                { label: 'Map Editor', icon: Lock, color: 'text-orange-500', desc: 'Hanya edit geospasial dan infrastruktur.' },
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <item.icon className={`w-5 h-5 shrink-0 ${item.color}`} />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-[10px] text-muted-foreground font-medium italic leading-none">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
