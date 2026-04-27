'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, Shield, Ambulance, Flame, Landmark, Loader2, MapPin, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function ContactsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  
  const contactsQuery = useMemoFirebase(() => query(collection(db, 'important_contacts'), orderBy('createdAt', 'desc')), [db]);
  const { data: contacts, isLoading } = useCollection(contactsQuery);

  const filteredContacts = contacts?.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const emergencyContacts = filteredContacts?.filter(c => 
    c.category.toLowerCase().includes('darurat') || 
    c.category.toLowerCase().includes('emergency') ||
    c.category.toLowerCase().includes('keamanan') ||
    c.category.toLowerCase().includes('kesehatan')
  ) || [];
  
  const publicServiceContacts = filteredContacts?.filter(c => !emergencyContacts.includes(c)) || [];

  const getIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('kesehatan')) return Ambulance;
    if (cat.includes('keamanan') || cat.includes('polisi')) return Shield;
    if (cat.includes('kebakaran')) return Flame;
    return Landmark;
  };

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative pt-20 pb-10 overflow-hidden border-b border-secondary/50">
          <div className="absolute top-0 right-0 w-[40vw] h-[40vh] bg-primary/5 rounded-full blur-[80px] -mr-32 -mt-32"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                <span className="w-6 h-[2px] bg-primary"></span>
                <Phone className="w-4 h-4" /> Informasi Layanan
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                Kontak <span className="text-gray-900">Penting</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg font-medium leading-relaxed italic border-l-4 border-accent pl-6">
                Akses cepat layanan darurat dan instansi publik terdekat untuk seluruh warga RW 02 Banjarsari.
              </p>
            </div>

            <div className="max-w-2xl mb-8">
              <div className="relative group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Cari instansi atau layanan..." 
                  className="pl-16 h-18 bg-white border-none text-lg rounded-[2.5rem] shadow-2xl focus-visible:ring-primary font-black"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 space-y-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
              <p className="font-black text-primary/30 uppercase tracking-[0.4em] text-[10px]">Sinkronisasi Data Kontak...</p>
            </div>
          ) : (
            <>
              {/* Emergency */}
              {emergencyContacts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-12">
                    <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">
                      Tanggap <span className="text-red-600">Darurat</span>
                    </h2>
                    <Badge className="bg-red-500 text-white font-black text-[9px] tracking-[0.2em] px-4 py-1.5 border-none shadow-xl shadow-red-500/20 uppercase">Siaga 24 Jam</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {emergencyContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="border-none bg-red-50 rounded-[3rem] overflow-hidden group hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
                          <CardContent className="p-10 flex flex-col items-center text-center">
                            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-xl mb-8 group-hover:scale-110 transition-transform">
                              <Icon className="w-10 h-10 text-red-600" />
                            </div>
                            <h3 className="font-black text-gray-900 text-lg mb-3 uppercase tracking-tighter">{contact.name}</h3>
                            <p className="text-4xl font-black text-red-600 tracking-tighter mb-10">{contact.phoneNumber}</p>
                            <a 
                              href={`tel:${contact.phoneNumber}`}
                              className="w-full h-16 bg-red-600 text-white rounded-[1.5rem] flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-all"
                            >
                              Panggil Sekarang <Phone className="w-4 h-4" />
                            </a>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Public Services */}
              {publicServiceContacts.length > 0 && (
                <div>
                  <h2 className="text-3xl font-black text-primary uppercase tracking-tighter mb-12">
                    Layanan <span className="text-gray-900">Publik Terpadu</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    {publicServiceContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="rounded-[3rem] border-none shadow-xl hover:shadow-2xl transition-all duration-500 group bg-white border border-secondary/20 hover:-translate-y-2">
                          <CardContent className="p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                            <div className="w-20 h-20 bg-secondary rounded-3xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                              <Icon className="w-10 h-10" />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-4">
                              <div>
                                <Badge variant="outline" className="mb-2 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary px-4 py-1">{contact.category}</Badge>
                                <h3 className="text-2xl font-black text-gray-900 tracking-tighter leading-none">{contact.name}</h3>
                              </div>
                              <div className="space-y-2">
                                <div className="flex items-center justify-center sm:justify-start gap-3 text-primary font-black text-xl tracking-tighter">
                                  <Phone className="w-5 h-5 opacity-30" /> {contact.phoneNumber}
                                </div>
                                {contact.address && (
                                  <div className="flex items-center justify-center sm:justify-start gap-3 text-muted-foreground text-xs font-medium italic">
                                    <MapPin className="w-4 h-4 opacity-30" /> {contact.address}
                                  </div>
                                )}
                              </div>
                              <div className="pt-6">
                                <a 
                                  href={`tel:${contact.phoneNumber}`}
                                  className="inline-flex h-12 px-10 bg-primary text-white rounded-2xl items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                >
                                  Hubungi <ArrowRight className="w-4 h-4" />
                                </a>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  );
}
