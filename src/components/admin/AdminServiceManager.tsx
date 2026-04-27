
"use client";

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, doc, query, orderBy } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { FileText, Plus, Search, Edit, Trash, Loader2, Users, CreditCard, ClipboardList, Baby, ShieldCheck, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const ICON_OPTIONS = [
  { value: 'Users', icon: Users },
  { value: 'CreditCard', icon: CreditCard },
  { value: 'ClipboardList', icon: ClipboardList },
  { value: 'Baby', icon: Baby },
  { value: 'FileText', icon: FileText },
  { value: 'ShieldCheck', icon: ShieldCheck },
  { value: 'Heart', icon: Heart },
];

const COLOR_OPTIONS = [
  { value: 'bg-blue-500/10 text-blue-600', label: 'Blue' },
  { value: 'bg-green-500/10 text-green-600', label: 'Green' },
  { value: 'bg-orange-500/10 text-orange-600', label: 'Orange' },
  { value: 'bg-purple-500/10 text-purple-600', label: 'Purple' },
  { value: 'bg-red-500/10 text-red-600', label: 'Red' },
];

export function AdminServiceManager() {
  const db = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('FileText');
  const [color, setColor] = useState('bg-blue-500/10 text-blue-600');

  const servicesQuery = useMemoFirebase(() => {
    return query(collection(db, 'admin_services'), orderBy('createdAt', 'asc'));
  }, [db]);

  const { data: services, isLoading } = useCollection(servicesQuery);

  const filteredServices = services?.filter(item => 
    item.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    const serviceData = {
      title,
      description,
      icon,
      color,
      updatedAt: new Date().toISOString(),
    };

    if (editingId) {
      setDocumentNonBlocking(doc(db, 'admin_services', editingId), serviceData, { merge: true });
    } else {
      const newId = doc(collection(db, 'admin_services')).id;
      setDocumentNonBlocking(doc(db, 'admin_services', newId), {
        ...serviceData,
        id: newId,
        createdAt: new Date().toISOString()
      }, { merge: true });
    }

    setIsDialogOpen(false);
    resetForm();
    toast({ title: "Berhasil", description: "Layanan kependudukan telah diperbarui." });
  };

  const handleDelete = (id: string) => {
    deleteDocumentNonBlocking(doc(db, 'admin_services', id));
    toast({ title: "Dihapus", description: "Layanan telah dihapus." });
  };

  const resetForm = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setIcon('FileText');
    setColor('bg-blue-500/10 text-blue-600');
  };

  const openEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title);
    setDescription(item.description);
    setIcon(item.icon || 'FileText');
    setColor(item.color || 'bg-blue-500/10 text-blue-600');
    setIsDialogOpen(true);
  };

  const getIconComponent = (iconName: string) => {
    const found = ICON_OPTIONS.find(o => o.value === iconName);
    return found ? found.icon : FileText;
  };

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Layanan Dokumen</h1>
          <p className="text-muted-foreground font-medium">Kelola informasi persyaratan administrasi kependudukan.</p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
              <Plus className="w-5 h-5" /> Layanan Baru
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md rounded-[2.5rem] p-8">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black uppercase tracking-tighter">{editingId ? 'Edit Layanan' : 'Tambah Layanan'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Judul Layanan</label>
                <Input value={title} onChange={e => setTitle(e.target.value)} className="bg-secondary/50 border-none h-12 rounded-xl" placeholder="Contoh: Kartu Keluarga (KK)" />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Ikon</label>
                <div className="grid grid-cols-7 gap-2">
                  {ICON_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setIcon(opt.value)}
                      className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2",
                        icon === opt.value ? "border-primary bg-primary/10 text-primary" : "border-transparent bg-secondary/50 text-muted-foreground hover:bg-secondary"
                      )}
                    >
                      <opt.icon className="w-5 h-5" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Warna Tema</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setColor(opt.value)}
                      className={cn(
                        "h-8 px-4 rounded-full text-[9px] font-black uppercase tracking-widest border-2 transition-all",
                        color === opt.value ? "border-primary" : "border-transparent"
                      )}
                      style={{ backgroundColor: opt.value.split(' ')[0].replace('/10', '/20') }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-muted-foreground px-1">Deskripsi / Persyaratan</label>
                <Textarea value={description} onChange={e => setDescription(e.target.value)} className="bg-secondary/50 border-none rounded-xl min-h-[100px]" placeholder="Informasi singkat atau persyaratan..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setIsDialogOpen(false)} className="rounded-xl font-bold">Batal</Button>
              <Button onClick={handleSave} className="rounded-xl font-bold bg-primary px-8">Simpan Data</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="max-w-2xl mb-12">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
          <Input 
            placeholder="Cari layanan..." 
            className="pl-14 h-16 bg-white border-none text-lg rounded-2xl shadow-xl font-bold" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {isLoading ? (
          <div className="col-span-full py-20 text-center"><Loader2 className="w-10 h-10 animate-spin mx-auto text-primary" /></div>
        ) : filteredServices?.length === 0 ? (
          <div className="col-span-full py-20 text-center text-muted-foreground font-bold italic">Belum ada layanan kependudukan.</div>
        ) : (
          filteredServices?.map((service) => {
            const IconComp = getIconComponent(service.icon);
            return (
              <Card key={service.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group">
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center transition-all shadow-inner", service.color)}>
                      <IconComp className="w-8 h-8" />
                    </div>
                    <div className="flex gap-2">
                       <Button onClick={() => openEdit(service)} size="icon" variant="ghost" className="rounded-xl hover:bg-secondary"><Edit className="w-4 h-4" /></Button>
                       <Button onClick={() => handleDelete(service.id)} size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-500"><Trash className="w-4 h-4" /></Button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-gray-900 tracking-tighter leading-none">{service.title}</h3>
                    <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">{service.description}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
