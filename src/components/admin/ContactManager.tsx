"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Phone, Plus, Search, MapPin, Edit, Trash, Loader2, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export function ContactManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Emergency');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');

  const contactsQuery = useMemoFirebase(() => {
    return query(collection(db, 'important_contacts'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: contacts, isLoading } = useCollection(contactsQuery);

  const filteredContacts = contacts?.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const contactData = {
      name,
      category,
      phoneNumber,
      address,
      description,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      updateDocumentNonBlocking(doc(db, 'important_contacts', editingId), contactData);
    } else {
      const newId = doc(collection(db, 'important_contacts')).id;
      updateDocumentNonBlocking(doc(db, 'important_contacts', newId), {
        ...contactData,
        id: newId,
        createdAt: new Date().toISOString()
      });
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Kontak telah diperbarui." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'important_contacts', id));
    toast({ title: "Dihapus", description: "Kontak telah dihapus dari sistem." });
  };

  const resetForm = () => {
    setEditingId(null);
    setName('');
    setCategory('Emergency');
    setPhoneNumber('');
    setAddress('');
    setDescription('');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setName(item.name);
    setCategory(item.category);
    setPhoneNumber(item.phoneNumber);
    setAddress(item.address || '');
    setDescription(item.description || '');
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Kontak Penting</h1>
          <p className="text-muted-foreground font-medium">Daftar nomor darurat dan instansi publik untuk warga.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
              <Plus className="w-5 h-5" /> Tambah Kontak
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Kontak' : 'Tambah Kontak Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Nama Instansi</label>
                <Input value={name} onChange={e => setName(e.target.value)} className="bg-secondary/50 border-none h-12" placeholder="Contoh: Puskesmas" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Kategori</label>
                  <Input value={category} onChange={e => setCategory(e.target.value)} className="bg-secondary/50 border-none h-12" />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">No. Telepon</label>
                  <Input value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} className="bg-secondary/50 border-none h-12" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Alamat</label>
                <Input value={address} onChange={e => setAddress(e.target.value)} className="bg-secondary/50 border-none h-12" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground">Keterangan Singkat</label>
                <Input value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50 border-none h-12" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold bg-primary px-8">Simpan Kontak</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-3xl mb-12">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari kontak..." 
            className="pl-16 h-16 bg-white border-none text-xl rounded-[2rem] shadow-xl font-bold" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : filteredContacts?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground font-bold italic">Belum ada kontak yang terdaftar.</div>
        ) : (
          filteredContacts?.map((contact) => (
            <Card key={contact.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group">
              <CardContent className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-16 h-16 bg-secondary rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                    <Phone className="w-8 h-8" />
                  </div>
                  <div className="flex gap-2">
                     <Button onClick={() => openEdit(contact)} size="icon" variant="ghost" className="rounded-xl hover:bg-secondary"><Edit className="w-4 h-4" /></Button>
                     <Button onClick={() => handleDelete(contact.id)} size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-500"><Trash className="w-4 h-4" /></Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Badge variant="secondary" className="mb-2 uppercase tracking-widest text-[10px] font-black">{contact.category}</Badge>
                    <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{contact.name}</h3>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 text-primary text-xl font-black tracking-tighter">
                      <Phone className="w-5 h-5 opacity-50" />
                      {contact.phoneNumber}
                    </div>
                    {contact.address && (
                      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                        <MapPin className="w-5 h-5 opacity-50" />
                        {contact.address}
                      </div>
                    )}
                    {contact.description && (
                      <div className="flex items-start gap-3 text-[11px] text-muted-foreground mt-4 italic bg-secondary/50 p-3 rounded-xl">
                        <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        {contact.description}
                      </div>
                    )}
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