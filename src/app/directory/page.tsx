'use client';

import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowUpRight, Loader2, Users, MessageCircle, ShieldCheck, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

export default function DirectoryPage() {
  const db = useFirestore();
  const membersQuery = useMemoFirebase(() => query(collection(db, 'rw_management_members'), orderBy('createdAt', 'asc')), [db]);
  const { data: management, isLoading } = useCollection(membersQuery);

  const rwMembers = management?.filter(m => !m.category || m.category === 'RW') || [];
  const rtMembers = management?.filter(m => m.category === 'RT') || [];

  const MemberCard = ({ person, idx, variant = 'large' }: { person: any, idx: number, variant?: 'small' | 'large' }) => (
    <div className="group relative">
      <div className={cn(
        "relative overflow-hidden rounded-[2.5rem] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 bg-secondary/20 w-full",
        variant === 'small' 
          ? "h-[220px] sm:h-[260px] md:h-[280px]" 
          : "h-[350px] sm:h-[400px] md:h-[350px]"
      )}>
        <img
          src={person.profilePictureUrl || PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl}
          alt={person.name}
          referrerPolicy="no-referrer"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = PlaceHolderImages[idx % PlaceHolderImages.length].imageUrl;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-90 group-hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute inset-0 p-4 sm:p-6 flex flex-col justify-end text-white">
          <div className="mb-1.5">
            <Badge className="bg-accent text-accent-foreground text-[7px] sm:text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border-none">
              {person.role}
            </Badge>
          </div>
          
          <h3 className={cn(
            "font-black mb-1 tracking-tighter group-hover:text-accent transition-colors leading-tight",
            variant === 'small' ? "text-sm sm:text-lg" : "text-xl sm:text-2xl"
          )}>
            {person.name}
          </h3>
          
          <p className="text-[9px] sm:text-[11px] text-white/70 font-medium mb-3 sm:mb-4 line-clamp-1 italic">
            "{person.description || 'Siap melayani warga.'}"
          </p>
          
          <div className="flex items-center gap-2">
            <a 
              href={person.contactNumber ? `https://wa.me/${person.contactNumber.replace(/[^0-9]/g, '')}` : '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 h-9 sm:h-11 bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl flex items-center justify-center gap-2 hover:bg-accent hover:text-accent-foreground transition-all group/wa border border-white/10"
            >
              <MessageCircle className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-accent group-hover/wa:text-accent-foreground" />
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest">WhatsApp</span>
            </a>
            <div className="w-9 h-9 sm:w-11 sm:h-11 bg-white text-primary rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-45 transition-transform duration-500 shrink-0">
              <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 bg-white">
        {/* Header Section */}
        <section className="relative pt-24 md:pt-32 pb-12 overflow-hidden border-b border-secondary/50">
          <div className="absolute top-0 left-0 w-[60vw] h-[60vh] bg-accent/5 rounded-full -ml-32 -mt-32 blur-[120px]"></div>
          <div className="container mx-auto px-6 relative z-10">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-primary font-bold text-[10px] md:text-xs uppercase tracking-[0.3em] mb-4">
                <span className="w-8 h-[2px] bg-primary"></span>
                <Users className="w-4 h-4" /> Pengenalan Wilayah
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-primary mb-6 uppercase tracking-tighter leading-none">
                Struktur <span className="text-gray-900">Pejabat Pamong</span>
              </h1>
              <p className="text-muted-foreground text-base md:text-xl leading-relaxed font-medium italic border-l-4 border-accent pl-6 max-w-2xl">
                Kenali lebih dekat jajaran pejabat pamong RW 02 Banjarsari yang berdedikasi dalam melayani dan mengelola aspirasi warga.
              </p>
            </div>
          </div>
        </section>

        {/* Members Grid Section */}
        <section className="container mx-auto px-6 py-12 md:py-16 space-y-20 md:space-y-24">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-6" />
              <p className="font-black text-primary/30 uppercase tracking-[0.4em] text-[10px]">Menyiapkan profil pamong...</p>
            </div>
          ) : !management || management.length === 0 ? (
            <div className="text-center py-24 bg-secondary/10 rounded-[3rem] border-2 border-dashed border-secondary/30 max-w-2xl mx-auto px-10">
              <Users className="w-16 h-16 mx-auto text-secondary/50 mb-6" />
              <h3 className="text-2xl font-black text-primary uppercase tracking-tighter">Data belum tersedia</h3>
              <p className="text-muted-foreground text-sm mt-3 font-medium">Sedang dalam proses pembaruan informasi oleh admin wilayah.</p>
            </div>
          ) : (
            <>
              {/* RW Category */}
              <div>
                <div className="flex items-center gap-4 mb-8 md:mb-14">
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
                    <ShieldCheck className="w-6 h-6 md:w-7 md:h-7" />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-4xl font-black text-primary uppercase tracking-tighter leading-none mb-1 md:mb-2">Pejabat RW 02</h2>
                    <p className="text-muted-foreground font-black text-[8px] md:text-[10px] uppercase tracking-[0.2em] opacity-70">Pimpinan Tingkat Rukun Warga</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
                  {rwMembers.map((person, idx) => (
                    <MemberCard key={person.id} person={person} idx={idx} variant="large" />
                  ))}
                </div>
                {rwMembers.length === 0 && (
                  <p className="text-muted-foreground italic text-sm bg-secondary/20 p-6 rounded-2xl">Belum ada data pejabat RW yang terdaftar.</p>
                )}
              </div>

              {/* RT Category */}
              <div>
                <div className="flex items-center gap-4 mb-8 md:mb-14">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-accent/10 rounded-2xl flex items-center justify-center text-accent-foreground shadow-inner">
                    <MapPin className="w-5 h-5 md:w-6 md:h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-3xl font-black text-primary uppercase tracking-tighter leading-none mb-1 md:mb-2">Pejabat RT</h2>
                    <p className="text-muted-foreground font-black text-[8px] md:text-[9px] uppercase tracking-[0.2em] opacity-70">Pimpinan Tingkat Rukun Tetangga</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
                  {rtMembers.map((person, idx) => (
                    <MemberCard key={person.id} person={person} idx={idx + rwMembers.length} variant="small" />
                  ))}
                </div>
                {rtMembers.length === 0 && (
                  <p className="text-muted-foreground italic text-sm bg-secondary/20 p-6 rounded-2xl">Belum ada data pejabat RT yang terdaftar.</p>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
