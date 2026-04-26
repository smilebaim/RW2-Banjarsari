
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, UserCheck, ShieldCheck, Plus, Edit2, Trash2, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

export function FeedbackAnalysisView() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Official Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [waNumber, setWaNumber] = useState('');

  // Fetch Officials
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: officials, isLoading } = useCollection(membersQuery);

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setWaNumber('');
  };

  const handleSaveOfficial = () => {
    if (!name || !waNumber) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama dan No. WA wajib diisi." });
      return;
    }

    const data = {
      name,
      role,
      contactNumber: waNumber,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'rw_management_members', editingId), data);
      toast({ title: "Diperbarui", description: "Data pengurus berhasil diubah." });
    } else {
      const newId = doc(collection(db, 'rw_management_members')).id;
      setDocumentNonBlocking(doc(db, 'rw_management_members', newId), {
        ...data,
        id: newId,
        createdAt: new Date().toISOString()
      }, { merge: true });
      toast({ title: "Ditambahkan", description: "Pengurus baru berhasil didaftarkan." });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const openEdit = (official: any) => {
    setEditingId(official.id);
    setName(official.name);
    setRole(official.role);
    setWaNumber(official.contactNumber);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'rw_management_members', id));
    toast({ title: "Dihapus", description: "Pengurus telah dihapus." });
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-primary flex items-center gap-2 uppercase tracking-tighter">
            <Zap className="w-6 h-6" />
            Kontrol Aspirasi Digital
          </h2>
          <p className="text-muted-foreground font-medium text-sm">Kelola daftar pengurus yang akan menerima pesan WhatsApp dari warga.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-12 px-6 rounded-2xl bg-primary text-white shadow-lg gap-3 font-black uppercase tracking-widest text-[10px]">
              <Plus className="w-4 h-4" /> Tambah Pengurus
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-[2.5rem] p-8 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl font-black uppercase tracking-tighter">
                {editingId ? 'Edit Pengurus' : 'Tambah Pengurus Baru'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Nama Lengkap Pejabat</label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: H. Ahmad Sutrisno" className="h-12 bg-secondary/50 border-none rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">Jabatan / Role</label>
                <Input value={role} onChange={e => setRole(e.target.value)} placeholder="Contoh: Ketua RW 02" className="h-12 bg-secondary/50 border-none rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground px-1">No. WhatsApp (Format 62...)</label>
                <Input value={waNumber} onChange={e => setWaNumber(e.target.value)} placeholder="628123456789" className="h-12 bg-secondary/50 border-none rounded-xl" />
                <p className="text-[9px] text-muted-foreground italic px-1">Gunakan format internasional (Contoh: 62812...)</p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleSaveOfficial} className="rounded-xl bg-primary px-8 font-bold text-white">Simpan Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Daftar Pengurus */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-white overflow-hidden">
          <div className="p-8 border-b border-secondary/50 bg-secondary/10">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <UserCheck className="w-4 h-4" /> Daftar Kontak Pengurus (WhatsApp)
            </h3>
          </div>
          <CardContent className="p-0">
            <div className="divide-y divide-secondary/50 max-h-[600px] overflow-y-auto">
              {isLoading ? (
                <div className="p-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary/20" /></div>
              ) : officials?.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground text-xs font-bold italic">Belum ada pengurus terdaftar.</div>
              ) : officials?.map((official) => (
                <div key={official.id} className="p-6 flex items-center justify-between hover:bg-secondary/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-black text-base leading-none mb-1 text-gray-900">{official.name}</p>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary">{official.role}</Badge>
                        {official.contactNumber && (
                          <span className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold">
                            <Phone className="w-3 h-3" /> {official.contactNumber}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button onClick={() => openEdit(official)} size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:text-primary">
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button onClick={() => handleDelete(official.id)} size="icon" variant="ghost" className="h-10 w-10 rounded-xl hover:bg-red-50 text-red-500">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Info Alur Kerja */}
        <Card className="border-none shadow-xl rounded-[2.5rem] bg-zinc-900 text-white p-8 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-primary/30 transition-all duration-1000"></div>
          <div className="relative flex flex-col md:flex-row items-center gap-8">
            <div className="w-20 h-20 bg-accent rounded-3xl flex items-center justify-center text-black shrink-0 shadow-2xl">
              <Zap className="w-10 h-10" />
            </div>
            <div className="space-y-2 flex-1">
              <h3 className="text-xl font-black uppercase tracking-tighter text-accent">Koneksi WhatsApp Langsung</h3>
              <p className="text-sm font-medium opacity-80 leading-relaxed max-w-2xl">
                Daftar pengurus di atas akan muncul sebagai pilihan di halaman Aspirasi warga. Pastikan nomor WhatsApp menggunakan format internasional (diawali 62) agar warga dapat langsung terhubung tanpa kendala.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
