"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Users, Plus, Edit, Trash, Loader2, UserCircle, Phone, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import Image from 'next/image';

export function ManagementMemberManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');

  const membersQuery = useMemoFirebase(() => {
    return query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: members, isLoading } = useCollection(membersQuery);

  const handleSave = () => {
    const memberData = {
      name,
      role,
      contactNumber,
      email,
      description,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'rw_management_members', editingId), memberData);
    } else {
      const newId = doc(collection(db, 'rw_management_members')).id;
      updateDocumentNonBlocking(doc(db, 'rw_management_members', newId), {
        ...memberData,
        id: newId,
        createdAt: new Date().toISOString()
      });
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Data pengurus telah diperbarui." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'rw_management_members', id));
    toast({ title: "Dihapus", description: "Anggota telah dihapus dari struktur." });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setRole('');
    setContactNumber('');
    setEmail('');
    setDescription('');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setRole(item.role);
    setContactNumber(item.contactNumber);
    setEmail(item.email || '');
    setDescription(item.description || '');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Struktur Pengurus</h1>
          <p className="text-muted-foreground font-medium">Kelola profil anggota tim manajemen RW 02.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
              <Plus className="w-5 h-5" /> Anggota Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Profil' : 'Tambah Pengurus'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Lengkap</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-none h-12" placeholder="Nama dengan gelar..." />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Jabatan</label>
                <Input value={role} onChange={e => setRole(e.target.value)} className="bg-secondary/50 border-none h-12" placeholder="Contoh: Ketua RW" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">No. WhatsApp</label>
                  <Input value={contactNumber} onChange={e => setContactNumber(e.target.value)} className="bg-secondary/50 border-none h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Email</label>
                  <Input value={email} onChange={e => setEmail(e.target.value)} className="bg-secondary/50 border-none h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Biografi Singkat</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50 border-none h-12" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold bg-primary px-8">Simpan Profil</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : members?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground font-bold italic">Belum ada anggota pengurus terdaftar.</div>
        ) : (
          members?.map((member) => (
            <Card key={member.id} className="border-none shadow-xl rounded-[3rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group relative">
              <div className="h-32 bg-primary/10 w-full" />
              <CardContent className="p-8 pt-0 -mt-16 text-center">
                <div className="relative w-32 h-32 mx-auto mb-6">
                  <div className="w-full h-full rounded-[2.5rem] bg-white border-4 border-white shadow-xl overflow-hidden flex items-center justify-center">
                    <UserCircle className="w-20 h-20 text-secondary" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 flex gap-1">
                     <Button onClick={() => openEdit(member)} size="icon" className="w-10 h-10 rounded-2xl bg-primary shadow-lg border-2 border-white"><Edit className="w-4 h-4 text-white" /></Button>
                     <Button onClick={() => handleDelete(member.id)} size="icon" className="w-10 h-10 rounded-2xl bg-red-500 shadow-lg border-2 border-white"><Trash className="w-4 h-4 text-white" /></Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h3 className="text-xl font-black text-primary tracking-tighter leading-none mb-2">{member.name}</h3>
                    <Badge className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-widest px-4">
                      {member.role}
                    </Badge>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground italic font-medium leading-relaxed px-4">
                    "{member.description || 'Dedikasi melayani warga RW 02 Banjarsari.'}"
                  </p>

                  <div className="pt-6 border-t border-secondary flex justify-center gap-6">
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-1">
                        <Phone className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground">HUBUNGI</span>
                    </div>
                    <div className="flex flex-col items-center">
                      <div className="w-10 h-10 bg-secondary rounded-xl flex items-center justify-center text-primary mb-1">
                        <Mail className="w-4 h-4" />
                      </div>
                      <span className="text-[9px] font-black text-muted-foreground">EMAIL</span>
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