
"use client";

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Mail, Phone, ArrowUpRight, Loader2, Users } from 'lucide-react';

export default function DirectoryPage() {
  const db = useFirestore();
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: management, isLoading } = useCollection(membersQuery);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        <section className="bg-primary/[0.02] py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mb-20">
              <h1 className="text-6xl font-black text-primary mb-6 uppercase tracking-tighter leading-[0.9]">
                Pilar Pelayanan <br/><span className="text-accent-foreground">RW 02 Banjarsari</span>
              </h1>
              <p className="text-muted-foreground text-xl leading-relaxed font-medium max-w-2xl border-l-4 border-accent pl-6">
                Tim yang berdedikasi melayani dan mengelola aspirasi warga. Kami mengedepankan transparansi dan inovasi digital untuk kemajuan bersama.
              </p>
            </div>
            
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                <p className="font-bold text-primary/40 uppercase tracking-widest text-xs">Memuat data pengurus...</p>
              </div>
            ) : !management || management.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[3rem] border-4 border-dashed border-secondary">
                <Users className="w-16 h-16 mx-auto text-secondary mb-4" />
                <h3 className="text-2xl font-black text-primary uppercase">Belum ada data pengurus</h3>
                <p className="text-muted-foreground font-medium">Data akan muncul setelah diinput oleh admin.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                {management.map((person, idx) => (
                  <div key={idx} className="group relative">
                    <div className="relative h-[450px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                      <Image
                        src={PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl}
                        alt={person.name}
                        fill
                        className="object-cover transition-transform duration-1000 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                      
                      <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                        <div className="mb-4">
                          <span className="bg-accent text-accent-foreground text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg">
                            {person.role}
                          </span>
                        </div>
                        <h3 className="text-3xl font-black mb-2 tracking-tighter">{person.name}</h3>
                        <p className="text-sm text-white/70 font-medium mb-6 line-clamp-2 italic">"{person.description || 'Dedikasi melayani warga RW 02 Banjarsari.'}"</p>
                        
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                            <Phone className="w-5 h-5" />
                          </div>
                          <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center cursor-pointer hover:bg-white/20 transition-all">
                            <Mail className="w-5 h-5" />
                          </div>
                          <div className="ml-auto w-12 h-12 bg-accent rounded-2xl flex items-center justify-center text-accent-foreground shadow-xl group-hover:rotate-45 transition-transform duration-500">
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
      </main>
    </div>
  );
}
