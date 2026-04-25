import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Mail, Phone, ArrowUpRight } from 'lucide-react';

const management = [
  { name: 'H. Sutrisno, S.E.', role: 'Ketua RW 02', photo: PlaceHolderImages[4].imageUrl, bio: 'Menjabat sejak 2022, berkomitmen pada transparansi pengelolaan dana RW.' },
  { name: 'Budi Hartono', role: 'Sekretaris', photo: PlaceHolderImages[5].imageUrl, bio: 'Mengelola administrasi dan persuratan warga dengan tertib dan digital.' },
  { name: 'Siti Aminah', role: 'Bendahara', photo: PlaceHolderImages[6].imageUrl, bio: 'Bertanggung jawab atas laporan keuangan dan iuran rutin bulanan warga.' },
  { name: 'Anton Wijaya', role: 'Sie Keamanan', photo: PlaceHolderImages[1].imageUrl, bio: 'Mengoordinasikan tim Siskamling dan menjaga kondusifitas lingkungan.' },
  { name: 'Dewi Lestari', role: 'Sie Kebersihan', photo: PlaceHolderImages[2].imageUrl, bio: 'Mengatur jadwal pengangkutan sampah dan program bank sampah RW.' },
  { name: 'Reza Fahlevi', role: 'Sie Kepemudaan', photo: PlaceHolderImages[3].imageUrl, bio: 'Membina Karang Taruna untuk kegiatan positif anak muda Banjarsari.' },
];

export default function DirectoryPage() {
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {management.map((person, idx) => (
                <div key={idx} className="group relative">
                  <div className="relative h-[450px] w-full overflow-hidden rounded-[2.5rem] shadow-2xl">
                    <Image
                      src={person.photo}
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
                      <p className="text-sm text-white/70 font-medium mb-6 line-clamp-2 italic">"{person.bio}"</p>
                      
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
          </div>
        </section>
      </main>
    </div>
  );
}