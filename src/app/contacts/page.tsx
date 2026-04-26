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
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Cari instansi atau layanan..." 
                  className="pl-14 h-16 bg-white border-none text-lg rounded-2xl shadow-lg focus-visible:ring-primary font-bold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-6 py-16 space-y-16">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="font-bold text-primary/30 uppercase tracking-[0.2em] text-[10px]">Sinkronisasi data...</p>
            </div>
          ) : (
            <>
              {/* Emergency */}
              {emergencyContacts.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-primary uppercase tracking-tighter">
                      Tanggap <span className="text-red-600">Darurat</span>
                    </h2>
                    <Badge className="bg-red-500 text-white font-bold text-[8px] tracking-widest px-3 py-1 border-none shadow-lg shadow-red-500/20">SIAGA 24 JAM</Badge>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {emergencyContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="border-none bg-red-50 rounded-[2rem] overflow-hidden group hover:shadow-xl transition-all duration-300">
                          <CardContent className="p-8 flex flex-col items-center text-center">
                            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-md mb-6 group-hover:scale-110 transition-transform">
                              <Icon className="w-8 h-8 text-red-600" />
                            </div>
                            <h3 className="font-bold text-gray-900 text-base mb-3 uppercase tracking-tight">{contact.name}</h3>
                            <p className="text-3xl font-black text-red-600 tracking-tighter mb-8">{contact.phoneNumber}</p>
                            <a 
                              href={`tel:${contact.phoneNumber}`}
                              className="w-full h-12 bg-red-600 text-white rounded-xl flex items-center justify-center gap-2 font-bold uppercase tracking-widest text-[9px] shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors"
                            >
                              Panggil Sekarang <Phone className="w-3.5 h-3.5" />
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
                  <h2 className="text-2xl font-black text-primary uppercase tracking-tighter mb-10">
                    Layanan <span className="text-gray-900">Publik</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {publicServiceContacts.map((contact, idx) => {
                      const Icon = getIcon(contact.category);
                      return (
                        <Card key={idx} className="rounded-[2rem] border-none shadow-lg hover:shadow-xl transition-all duration-300 group bg-white border border-secondary/20">
                          <CardContent className="p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
                            <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                              <Icon className="w-8 h-8" />
                            </div>
                            <div className="flex-1 text-center sm:text-left space-y-3">
                              <div>
                                <Badge variant="outline" className="mb-1 text-[8px] font-bold uppercase tracking-widest border-primary/20 text-primary px-3">{contact.category}</Badge>
                                <h3 className="text-xl font-black text-gray-900 tracking-tighter">{contact.name}</h3>
                              </div>
                              <div className="space-y-1">
                                <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-bold text-lg">
                                  <Phone className="w-4 h-4 opacity-40" /> {contact.phoneNumber}
                                </div>
                                {contact.address && (
                                  <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-[11px] font-medium">
                                    <MapPin className="w-3.5 h-3.5 opacity-40" /> {contact.address}
                                  </div>
                                )}
                              </div>
                              <div className="pt-4">
                                <a 
                                  href={`tel:${contact.phoneNumber}`}
                                  className="inline-flex h-10 px-8 bg-primary text-white rounded-xl items-center gap-2 text-[9px] font-bold uppercase tracking-widest shadow-md hover:scale-105 transition-all"
                                >
                                  Hubungi <ArrowRight className="w-3.5 h-3.5" />
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
