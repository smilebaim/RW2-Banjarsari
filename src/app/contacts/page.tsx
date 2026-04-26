
"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, Shield, Ambulance, Flame, Landmark, Loader2, Info, ArrowRight, Zap, MapPin } from 'lucide-react';
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
    c.category.toLowerCase().includes('kebakaran') ||
    c.category.toLowerCase().includes('kesehatan')
  ) || [];
  
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
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <section className="relative py-24 md:py-32 overflow-hidden bg-primary/[0.02]">
          <div className="absolute top-0 right-0 w-[50vw] h-[50vh] bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mx-auto text-center mb-24">
              <div className="flex items-center justify-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                <span className="w-8 h-[2px] bg-primary"></span>
                <Phone className="w-4 h-4" /> Kontak Penting
              </div>
              <h1 className="text-6xl md:text-9xl font-black text-primary mb-10 uppercase tracking-tighter leading-[0.85]">
                Layanan <br/><span className="text-gray-900">Publik</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed italic">
                Akses cepat layanan darurat dan instansi publik untuk kemudahan seluruh warga Banjarsari.
              </p>
            </div>

            <div className="max-w-4xl mx-auto mb-32">
              <div className="relative group">
                <Search className="absolute left-8 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
                <Input 
                  placeholder="Cari layanan, instansi, atau bantuan darurat..." 
                  className="pl-20 h-20 md:h-24 bg-white border-none text-xl md:text-2xl rounded-[2.5rem] shadow-[0_40px_80px_-15px_rgba(0,0,0,0.1)] focus-visible:ring-primary font-bold placeholder:text-muted-foreground/50 tracking-tight"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <p className="font-black text-primary/30 uppercase tracking-[0.3em] text-xs">Menyinkronkan kontak...</p>
              </div>
            ) : !contacts || contacts.length === 0 ? (
              <div className="text-center py-32 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/30 max-w-4xl mx-auto">
                <Zap className="w-20 h-20 mx-auto text-secondary mb-6" />
                <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Kontak belum dimuat</h3>
                <p className="text-muted-foreground font-medium mt-2">Daftar kontak sedang diperbarui oleh admin wilayah.</p>
              </div>
            ) : (
              <div className="space-y-32">
                {/* Emergency Section */}
                {emergencyContacts.length > 0 && (
                  <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
                      <div className="space-y-4">
                        <Badge className="bg-red-500 text-white font-black text-[10px] uppercase tracking-[0.3em] px-6 py-2 rounded-full border-none shadow-xl shadow-red-500/20">
                          DARURAT 24 JAM
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter leading-none">
                          Tanggap <span className="text-red-600">Cepat</span>
                        </h2>
                      </div>
                      <p className="text-muted-foreground font-bold text-sm uppercase tracking-widest flex items-center gap-2">
                        Siaga Melayani <Info className="w-4 h-4" />
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                      {emergencyContacts.map((contact, idx) => {
                        const Icon = getIcon(contact.category);
                        return (
                          <Card key={idx} className="border-none bg-red-50 rounded-[3rem] overflow-hidden group hover:shadow-[0_40px_80px_-15px_rgba(239,68,68,0.2)] transition-all duration-700 hover:-translate-y-4">
                            <CardContent className="p-10 flex flex-col items-center text-center">
                              <div className="w-24 h-24 bg-white rounded-[2rem] flex items-center justify-center shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 mb-8">
                                <Icon className="w-12 h-12 text-red-600" />
                              </div>
                              <h3 className="font-black text-gray-900 text-xl mb-4 uppercase tracking-tight">{contact.name}</h3>
                              <p className="text-4xl md:text-5xl font-black text-red-600 tracking-tighter mb-10">
                                {contact.phoneNumber}
                              </p>
                              <a 
                                href={`tel:${contact.phoneNumber}`}
                                className="w-full h-16 bg-red-600 text-white rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-red-600/30 hover:bg-red-700 transition-colors"
                              >
                                Panggil Sekarang <Phone className="w-4 h-4 fill-white" />
                              </a>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </section>
                )}

                {/* Public Services Section */}
                {publicServiceContacts.length > 0 && (
                  <section>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 px-4">
                      <div className="space-y-4">
                        <Badge className="bg-primary text-white font-black text-[10px] uppercase tracking-[0.3em] px-6 py-2 rounded-full border-none shadow-xl shadow-primary/20">
                          LAYANAN PUBLIK
                        </Badge>
                        <h2 className="text-4xl md:text-5xl font-black text-primary uppercase tracking-tighter leading-none">
                          Instansi & <span className="text-gray-900">Lembaga</span>
                        </h2>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      {publicServiceContacts.map((contact, idx) => {
                        const Icon = getIcon(contact.category);
                        return (
                          <Card key={idx} className="rounded-[3rem] border-none shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] hover:shadow-2xl transition-all duration-700 group bg-white border border-secondary/20">
                            <CardContent className="p-10 flex flex-col sm:flex-row items-center sm:items-start gap-8">
                              <div className="w-20 h-20 bg-secondary/50 rounded-[1.75rem] flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <Icon className="w-10 h-10" />
                              </div>
                              <div className="flex-1 text-center sm:text-left space-y-4">
                                <div>
                                  <Badge variant="outline" className="mb-2 text-[9px] font-black uppercase tracking-widest border-primary/20 text-primary px-3">
                                    {contact.category}
                                  </Badge>
                                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter">{contact.name}</h3>
                                </div>
                                
                                <div className="space-y-2">
                                  <div className="flex items-center justify-center sm:justify-start gap-2 text-primary font-black text-xl tracking-tighter">
                                    <Phone className="w-5 h-5 opacity-40" /> {contact.phoneNumber}
                                  </div>
                                  {contact.address && (
                                    <div className="flex items-center justify-center sm:justify-start gap-2 text-muted-foreground text-sm font-medium">
                                      <MapPin className="w-4 h-4 opacity-40" /> {contact.address}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="pt-4 flex flex-wrap justify-center sm:justify-start gap-4">
                                   <a 
                                    href={`tel:${contact.phoneNumber}`}
                                    className="h-12 px-8 bg-primary text-white rounded-xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-all"
                                   >
                                     Telepon <ArrowRight className="w-3 h-3" />
                                   </a>
                                   <Button variant="ghost" className="h-12 px-6 rounded-xl border border-secondary text-primary font-black uppercase tracking-widest text-[9px]">
                                     Detail Lokasi
                                   </Button>
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
        </section>

        {/* Footer Support Section */}
        <section className="py-24 bg-zinc-900 text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-8">Butuh Bantuan Lain?</h2>
            <p className="text-white/60 max-w-2xl mx-auto mb-12 font-medium text-lg leading-relaxed">
              Jika layanan yang Anda cari tidak tersedia di sini, silakan hubungi pengurus RT masing-masing atau datang langsung ke Balai RW 02 Banjarsari.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <div className="bg-white/5 backdrop-blur-md px-10 py-6 rounded-3xl border border-white/10">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-accent mb-2">Jam Pelayanan Balai</p>
                <p className="text-xl font-bold">Senin - Jumat | 08:00 - 16:00</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
