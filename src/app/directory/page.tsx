import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import { Mail, Phone, MapPin } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 bg-background">
        <section className="bg-primary/5 py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl">
              <h1 className="text-4xl font-bold text-primary mb-6">Struktur Pengurus RW 2</h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Temui tim yang berdedikasi mengelola dan melayani kebutuhan warga di RW 2 Banjarsari, Metro Utara. Kami hadir untuk membantu setiap urusan warga.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
              {management.map((person, idx) => (
                <Card key={idx} className="overflow-hidden hover:shadow-lg transition-all group border-border/50">
                  <div className="relative h-64 w-full overflow-hidden">
                    <Image
                      src={person.photo}
                      alt={person.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                      <div className="flex gap-4">
                        <div className="p-2 bg-white/20 backdrop-blur rounded-full text-white cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Phone className="w-4 h-4" />
                        </div>
                        <div className="p-2 bg-white/20 backdrop-blur rounded-full text-white cursor-pointer hover:bg-accent hover:text-accent-foreground transition-colors">
                          <Mail className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <CardHeader className="text-center pb-2">
                    <div className="text-xs font-bold text-accent-foreground bg-accent/20 px-3 py-1 rounded-full w-fit mx-auto mb-2 uppercase tracking-widest">
                      {person.role}
                    </div>
                    <CardTitle className="text-xl text-primary">{person.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center pb-6">
                    <p className="text-sm text-muted-foreground italic">"{person.bio}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
