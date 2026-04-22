import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Mail, Phone } from 'lucide-react';

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
      <main className="flex-1 bg-background">
        <section className="bg-primary/5 py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mb-12">
              <h1 className="text-5xl font-black text-primary mb-6 uppercase tracking-tighter">Struktur Pengurus</h1>
              <p className="text-muted-foreground text-lg leading-relaxed font-medium">
                Tim yang berdedikasi melayani dan mengelola aspirasi warga RW 2 Banjarsari. Kami ada untuk kemajuan bersama.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {management.map((person, idx) => (
                <Card key={idx} className="overflow-hidden border-none shadow-xl group rounded-[2.5rem] bg-white">
                  <div className="relative h-72 w-full overflow-hidden">
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-end p-8">
                      <div className="flex gap-4">
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl text-white cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Mail className="w-5 h-5" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="text-center pt-8 pb-2">
                    <div className="text-[10px] font-black text-accent-foreground bg-accent rounded-full px-4 py-1 w-fit mx-auto mb-3 uppercase tracking-widest shadow-md">
                      {person.role}
                    </div>
                    <CardTitle className="text-2xl font-black text-primary">{person.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-8 px-8">
                    <p className="text-sm text-muted-foreground font-medium italic">"{person.bio}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
