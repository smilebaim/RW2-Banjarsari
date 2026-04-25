"use client";

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Phone, Plus, Search, MapPin, Globe, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const mockContacts = [
  { id: 1, name: 'Puskesmas Metro Utara', category: 'Emergency', number: '0725-41234', address: 'Jl. Ahmad Yani No. 12' },
  { id: 2, name: 'Polsek Metro Utara', category: 'Keamanan', number: '0725-45678', address: 'Jl. Ki Hajar Dewantara' },
  { id: 3, name: 'Kantor Kelurahan', category: 'Public Service', number: '0725-49876', address: 'Jl. Banjarsari Raya' },
];

export function ContactManager() {
  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <h1 className="text-4xl font-black text-primary uppercase tracking-tighter mb-2">Kontak Penting</h1>
          <p className="text-muted-foreground font-medium">Daftar nomor darurat dan instansi publik untuk warga.</p>
        </div>
        <Button className="h-14 px-8 rounded-2xl bg-primary shadow-xl shadow-primary/20 gap-3 font-black uppercase tracking-widest text-xs">
          <Plus className="w-5 h-5" /> Tambah Kontak
        </Button>
      </div>

      <div className="max-w-3xl mb-12">
        <div className="relative group">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
          <Input placeholder="Cari kontak..." className="pl-16 h-16 bg-white border-none text-xl rounded-[2rem] shadow-xl font-bold" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {mockContacts.map((contact) => (
          <Card key={contact.id} className="border-none shadow-xl rounded-[2.5rem] overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 group">
            <CardContent className="p-8">
              <div className="flex justify-between items-start mb-6">
                <div className="w-16 h-16 bg-secondary rounded-3xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                  <Phone className="w-8 h-8" />
                </div>
                <div className="flex gap-2">
                   <Button size="icon" variant="ghost" className="rounded-xl hover:bg-secondary"><Edit className="w-4 h-4" /></Button>
                   <Button size="icon" variant="ghost" className="rounded-xl hover:bg-red-50 text-red-500"><Trash className="w-4 h-4" /></Button>
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
                    {contact.number}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
                    <MapPin className="w-5 h-5 opacity-50" />
                    {contact.address}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
