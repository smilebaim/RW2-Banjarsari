
"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, Shield, Ambulance, Flame, Landmark, Loader2, Info } from 'lucide-react';
import { useState } from 'react';

export default function ContactsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const contactsQuery = useMemoFirebase(() => query(collection(db, 'important_contacts'), orderBy('createdAt', 'desc')), [db]);
  const { data: contacts, isLoading } = useCollection(contactsQuery);

  const filteredContacts = contacts?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emergencyContacts = filteredContacts?.filter(c => c.category.toLowerCase().includes('darurat') || c.category.toLowerCase().includes('emergency')) || [];
  const publicServiceContacts = filteredContacts?.filter(c => !emergencyContacts.includes(c)) || [];

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('kesehatan') || cat.includes('medis')) return Ambulance;
    if (cat.includes('keamanan') || cat.includes('polisi')) return Shield;
    if (cat.includes('kebakaran')) return Flame;
    return Landmark;
  };

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-primary mb-6 uppercase tracking-tighter">Kontak Penting</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium">
              Akses cepat layanan darurat dan instansi publik untuk seluruh warga Banjarsari.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
              <Input 
                placeholder="Cari layanan darurat..." 
                className="pl-16 h-16 bg-secondary/30 border-none text-xl rounded-[2rem] shadow-inner font-bold"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-bold text-primary/40 uppercase tracking-widest text-xs">Memuat kontak...</p>
            </div>
          ) : !contacts || contacts.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-[3rem] border-4 border-dashed border-secondary">
              <Info className="w-16 h-16 mx-auto text-secondary mb-4" />
              <h3 className="text-2xl font-black text-primary uppercase">Belum ada kontak terdaftar</h3>
              <p className="text-muted-foreground font-medium">Silakan hubungi admin untuk informasi lebih lanjut.</p>
            </div>
          ) : (
            <div className="space-y-20">
              {emergencyContacts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center shadow-md">
                      <Flame className="w-6 h-6 text-red-600" />
                    </span>
                    Keadaan Darurat (24 Jam)
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {emergencyContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="border-none bg-red-50/50 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-red-200 transition-all duration-500">
                          <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6">
                              <Icon className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="font-black text-gray-900 text-lg mb-2">{contact.name}</h3>
                            <p className="text-3xl font-black text-red-600 tracking-tighter">{contact.phoneNumber}</p>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}

              {publicServiceContacts.length > 0 && (
                <section>
                  <h2 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 uppercase tracking-tight">
                    <span className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                      <Landmark className="w-6 h-6 text-blue-600" />
                    </span>
                    Instansi & Layanan Publik
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {publicServiceContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="rounded-[2.5rem] border-none shadow-lg hover:shadow-xl transition-all group bg-secondary/20">
                          <CardContent className="p-8 flex items-center justify-between">
                            <div className="flex items-center gap-6">
                              <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                                <Icon className="w-8 h-8 text-primary" />
                              </div>
                              <div>
                                <h3 className="font-black text-gray-900 text-lg">{contact.name}</h3>
                                <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">{contact.category}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                               <div className="p-4 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/30">
                                 <Phone className="w-5 h-5" />
                               </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
