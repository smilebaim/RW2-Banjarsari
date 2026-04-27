'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { ArrowUpRight, Loader2, Users, MessageCircle, MessageSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FeedbackForm } from '@/components/feedback/FeedbackForm';

export default function DirectoryPage() {
  const db = useFirestore();
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: management, isLoading } = useCollection(membersQuery);

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="relative pt-20 pb-10 overflow-hidden border-b border-secondary/50">
          <div className="absolute top-0 left-0 w-[40vw] h-[40vh] bg-accent/5 rounded-full -ml-32 -mt-32 blur-[100px]"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl mb-12">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] uppercase tracking-[0.3em] mb-4">
                <span className="w-6 h-[2px] bg-primary"></span>
                <Users className="w-4 h-4" /> Manajemen & Aspirasi
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-primary mb-6 uppercase tracking-tighter leading-tight">
                Hubungi <span className="text-gray-900">Pengurus</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed font-medium italic border-l-4 border-accent pl-6">
                Sampaikan aspirasi Anda langsung kepada pengurus RW 02 Banjarsari melalui koneksi WhatsApp yang transparan.
              </p>
            </div>
          </div>
        </section>

        {/* Aspirasi Section */}
        <section className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto mb-24">
            <FeedbackForm />
          </div>

          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-primary uppercase tracking-tighter">Struktur Pengurus</h2>
              <p className="text-muted-foreground text-sm font-medium">Daftar pengurus RW 02 Banjarsari yang siap melayani warga.</p>
            </div>
          </div>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
              <p className="font-bold text-primary/30 uppercase tracking-[0.2em] text-[10px]">Menyiapkan profil...</p>
            </div>
          ) : !management || management.length === 0 ? (
            <div className="text-center py-20 bg-secondary/10 rounded-[2.5rem] border-2 border-dashed border-secondary/30 max-w-2xl mx-auto">
              <Users className="w-12 h-12 mx-auto text-secondary mb-4" />
              <h3 className="text-xl font-bold text-primary uppercase">Data belum tersedia</h3>
              <p className="text-muted-foreground text-sm mt-2">Sedang dalam proses pembaruan oleh admin.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {management.map((person, idx) => (
                <div key={idx} className="group relative">
                  <div className="relative h-[480px] w-full overflow-hidden rounded-[2.5rem] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    <Image
                      src={PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl}
                      alt={person.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      data-ai-hint="professional headshot"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute inset-0 p-8 flex flex-col justify-end text-white">
                      <div className="mb-4">
                        <Badge className="bg-accent text-accent-foreground text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border-none">
                          {person.role}
                        </Badge>
                      </div>
                      
                      <h3 className="text-2xl font-black mb-2 tracking-tighter group-hover:text-accent transition-colors">
                        {person.name}
                      </h3>
                      
                      <p className="text-[11px] text-white/60 font-medium mb-6 line-clamp-2 italic">
                        "{person.description || 'Siap melayani untuk lingkungan yang lebih baik.'}"
                      </p>
                      
                      <div className="flex items-center gap-3">
                        <a 
                          href={person.contactNumber ? `https://wa.me/${person.contactNumber.replace(/[^0-9]/g, '')}` : '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center gap-3 hover:bg-accent hover:text-accent-foreground transition-all group/wa"
                        >
                          <MessageCircle className="w-5 h-5 text-accent group-hover/wa:text-accent-foreground" />
                          <span className="text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
                        </a>
                        <div className="w-12 h-12 bg-white text-primary rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-500 shrink-0">
                          <ArrowUpRight className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
