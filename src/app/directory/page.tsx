
'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Mail, Phone, ArrowUpRight, Loader2, Users, Linkedin, MessageCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function DirectoryPage() {
  const db = useFirestore();
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: management, isLoading } = useCollection(membersQuery);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="relative py-24 md:py-32 overflow-hidden">
          <div className="absolute top-0 left-0 w-[50vw] h-[50vh] bg-accent/10 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-4xl mb-24">
              <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                <span className="w-8 h-[2px] bg-primary"></span>
                <Users className="w-4 h-4" /> Manajemen Wilayah
              </div>
              <h1 className="text-6xl md:text-9xl font-black text-primary mb-10 uppercase tracking-tighter leading-[0.8] drop-shadow-sm">
                Struktur <br/><span className="text-gray-900">Pelayanan</span>
              </h1>
              <p className="text-muted-foreground text-xl md:text-3xl leading-relaxed font-medium max-w-2xl border-l-[6px] border-accent pl-10 italic">
                Berdedikasi melayani dengan transparansi dan inovasi digital untuk kemajuan warga RW 02 Banjarsari.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-32">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-6" />
                <p className="font-black text-primary/30 uppercase tracking-[0.3em] text-xs">Menyiapkan profil pengurus...</p>
              </div>
            ) : !management || management.length === 0 ? (
              <div className="text-center py-32 bg-secondary/5 rounded-[4rem] border-4 border-dashed border-secondary/30 max-w-4xl mx-auto">
                <Users className="w-20 h-20 mx-auto text-secondary mb-6" />
                <h3 className="text-3xl font-black text-primary uppercase tracking-tighter">Data belum tersedia</h3>
                <p className="text-muted-foreground font-medium mt-2">Data pengurus sedang dalam proses pembaruan oleh admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 lg:gap-16">
                {management.map((person, idx) => (
                  <div key={idx} className="group relative">
                    <div className="relative h-[550px] w-full overflow-hidden rounded-[3.5rem] shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-700 hover:shadow-2xl hover:-translate-y-4">
                      <Image
                        src={PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                        data-ai-hint="professional headshot"
                      />
                      {/* Gradient Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute inset-0 p-10 flex flex-col justify-end text-white">
                        <div className="mb-6 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                          <Badge className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-[0.3em] px-6 py-2 rounded-full shadow-2xl border-none">
                            {person.role}
                          </Badge>
                        </div>
                        
                        <h3 className="text-3xl md:text-4xl font-black mb-3 tracking-tighter leading-none group-hover:text-accent transition-colors">
                          {person.name}
                        </h3>
                        
                        <p className="text-sm text-white/60 font-medium mb-8 line-clamp-2 italic leading-relaxed transform translate-y-4 group-hover:translate-y-0 transition-transform duration-700 delay-100">
                          "{person.description || 'Siap melayani dan mendengar setiap aspirasi warga untuk lingkungan yang lebih baik.'}"
                        </p>
                        
                        <div className="flex items-center gap-4 transform translate-y-8 group-hover:translate-y-0 transition-all duration-700 delay-200">
                          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-xl group/icon">
                            <Phone className="w-5 h-5 group-hover/icon:scale-110" />
                          </div>
                          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-xl group/icon">
                            <MessageCircle className="w-5 h-5 group-hover/icon:scale-110" />
                          </div>
                          <div className="w-14 h-14 bg-white/10 backdrop-blur-xl rounded-[1.25rem] flex items-center justify-center cursor-pointer hover:bg-accent hover:text-accent-foreground transition-all shadow-xl group/icon">
                            <Mail className="w-5 h-5 group-hover/icon:scale-110" />
                          </div>
                          
                          <div className="ml-auto w-14 h-14 bg-white text-primary rounded-[1.25rem] flex items-center justify-center shadow-2xl group-hover:rotate-45 transition-transform duration-500">
                            <ArrowUpRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Vision Statement Section */}
        <section className="py-24 bg-secondary/5 border-t border-secondary/20">
          <div className="container mx-auto px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-4xl md:text-6xl font-black text-primary mb-12 uppercase tracking-tighter">Membangun Bersama</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                {[
                  { title: 'Inovasi', desc: 'Menerapkan teknologi untuk kemudahan layanan publik.' },
                  { title: 'Transparansi', desc: 'Keterbukaan dalam pengelolaan dan kebijakan wilayah.' },
                  { title: 'Harmoni', desc: 'Menjaga kerukunan dan gotong royong antar warga.' }
                ].map((item, i) => (
                  <div key={i} className="space-y-4">
                    <h3 className="text-xl font-black text-primary uppercase tracking-widest">{item.title}</h3>
                    <p className="text-muted-foreground font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
