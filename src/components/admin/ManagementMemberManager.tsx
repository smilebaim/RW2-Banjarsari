
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash, 
  Loader2, 
  UserCircle, 
  Phone, 
  Mail, 
  Link as LinkIcon, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function ManagementMemberManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [category, setCategory] = useState<'RW' | 'RT'>('RW');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [profilePictureUrl, setProfilePictureUrl] = useState('');

  const membersQuery = useMemoFirebase(() => {
    return query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: members, isLoading } = useCollection(membersQuery);

  const handleSave = () => {
    if (!name || !role || !contactNumber) {
      toast({ variant: "destructive", title: "Gagal", description: "Nama, Jabatan, dan No. WA wajib diisi." });
      return;
    }

    const memberData = {
      name,
      role,
      category,
      contactNumber,
      email,
      description,
      profilePictureUrl,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setDocumentNonBlocking(doc(db, 'rw_management_members', editingId), memberData, { merge: true });
    } else {
      const newId = doc(collection(db, 'rw_management_members')).id;
      setDocumentNonBlocking(doc(db, 'rw_management_members', newId), {
        ...memberData,
        id: newId,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Data pejabat pamong telah diperbarui." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'rw_management_members', id));
    toast({ title: "Dihapus", description: "Pejabat pamong telah dihapus dari struktur." });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setCategory('RW');
    setContactNumber('');
    setEmail('');
    setDescription('');
    setProfilePictureUrl('');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setRole(item.role);
    setCategory(item.category || 'RW');
    setContactNumber(item.contactNumber);
    setEmail(item.email || '');
    setDescription(item.description || '');
    setProfilePictureUrl(item.profilePictureUrl || '');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Struktur Pejabat Pamong</h1>
          <p className="text-muted-foreground font-medium">Kelola profil anggota tim pejabat pamong RW 02 Banjarsari.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
              <Plus className="w-5 h-5" /> Pejabat Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-8 max-h-[90vh] overflow-y-auto border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Profil' : 'Tambah Pejabat Pamong'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Kategori Pejabat</label>
                <Select value={category} onValueChange={(val: 'RW' | 'RT') => setCategory(val)}>
                  <SelectTrigger className="bg-secondary/50 border-none h-12 rounded-xl font-bold">
                    <SelectValue placeholder="Pilih Kategori" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    <SelectItem value="RW" className="font-bold">Pejabat RW (Rukun Warga)</SelectItem>
                    <SelectItem value="RT" className="font-bold">Pejabat RT (Rukun Tetangga)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl font-bold" placeholder="Nama dengan gelar..." />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Jabatan</label>
                <Input value={role} onChange={e => setRole(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl font-bold" placeholder="Contoh: Ketua RW / Ketua RT 01" />
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">URL Foto Profil (HTTPS)</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
                    <Input 
                      value={profilePictureUrl} 
                      onChange={e => setProfilePictureUrl(e.target.value)} 
                      className="pl-12 bg-secondary/50 border-none h-12 rounded-xl font-medium" 
                      placeholder="https://..." 
                    />
                  </div>
                </div>

                <div className="bg-red-50 border border-red-100 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Peringatan Tautan</span>
                  </div>
                  <p className="text-[10px] text-red-800 leading-relaxed font-medium">
                    Pastikan tautan berakhiran <span className="font-bold">.jpg / .png</span> agar foto dapat muncul. Gunakan layanan hosting gambar yang mendukung hotlinking.
                  </p>
                </div>

                {profilePictureUrl && (
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground block text-center">Pratinjau Foto</label>
                    <div className="relative h-44 w-44 mx-auto rounded-[2rem] overflow-hidden border-4 border-white shadow-2xl bg-secondary/20">
                      <img 
                        src={profilePictureUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Tautan+Gambar+Salah';
                        }} 
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">No. WhatsApp</label>
                  <Input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl font-bold" placeholder="628..." />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Email</label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl font-bold" placeholder="email@domain.com" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Biografi Singkat</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl font-medium" placeholder="Siap melayani warga..." />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-black uppercase text-[10px] tracking-widest">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-black uppercase text-[10px] tracking-widest bg-primary px-8 text-white h-12 shadow-xl shadow-primary/20">Simpan Profil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : members?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground font-black uppercase tracking-widest text-xs italic">Belum ada pejabat pamong terdaftar.</div>
        ) : (
          members?.map((member) => (
            <Card key={member.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group relative">
              <div className="h-32 bg-primary/10 w-full flex items-center justify-end px-6">
                <Badge className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border-none">
                  {member.category || 'RW'}
                </Badge>
              </div>
              <CardContent className="p-8 pt-0 -mt-16 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full rounded-[2.5rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center relative">
                    {member.profilePictureUrl ? (
                      <img 
                        src={member.profilePictureUrl} 
                        alt={member.name} 
                        className="w-full h-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://placehold.co/400?text=Error';
                        }}
                      />
                    ) : (
                      <UserCircle className="w-20 h-20 text-secondary" />
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex gap-1 z-10">
                     <Button onClick={() => openEdit(member)} size="icon" className="w-10 h-10 rounded-2xl bg-primary shadow-lg border-2 border-white hover:scale-110 transition-transform"><Edit className="w-4 h-4 text-white" /></Button>
                     <Button onClick={() => handleDelete(member.id)} size="icon" className="w-10 h-10 rounded-2xl bg-red-500 shadow-lg border-2 border-white hover:scale-110 transition-transform"><Trash className="w-4 h-4 text-white" /></Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-primary tracking-tighter leading-none mb-2">{member.name}</h3>
                    <Badge className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest px-4">
                      {member.role}
                    </Badge>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground italic font-medium leading-relaxed px-4 line-clamp-2">
                    "{member.description || 'Dedikasi melayani warga RW 02 Banjarsari.'}"
                  </p>

                  <div className="pt-6 border-t border-secondary flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-1">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground uppercase">WA</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-1">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground uppercase">Email</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
