import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, Shield, Ambulance, Flame, Landmark, Users } from 'lucide-react';

const emergencyContacts = [
  { name: 'Puskesmas Metro Utara', number: '0725-41234', category: 'Kesehatan', icon: Ambulance },
  { name: 'Polsek Metro Utara', number: '0725-45678', category: 'Keamanan', icon: Shield },
  { name: 'Pemadam Kebakaran', number: '0725-43210', category: 'Darurat', icon: Flame },
];

const publicServiceContacts = [
  { name: 'Kantor Kelurahan Banjarsari', number: '0725-49876', category: 'Layanan Publik', icon: Landmark },
  { name: 'Kantor Kecamatan Metro Utara', number: '0725-44556', category: 'Layanan Publik', icon: Landmark },
  { name: 'Hotline PLN Metro', number: '123 / 0725-55555', category: 'Layanan Publik', icon: Landmark },
  { name: 'PDAM Way Rarem', number: '0725-44332', category: 'Layanan Publik', icon: Landmark },
];

export default function ContactsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-primary mb-4">Kontak Penting</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simpan dan gunakan daftar kontak berikut untuk keperluan darurat maupun layanan publik di wilayah Metro Utara.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-16">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input placeholder="Cari layanan (misal: Polisi, Rumah Sakit, PLN)..." className="pl-12 h-14 bg-secondary/30 border-none text-lg rounded-2xl" />
            </div>
          </div>

          <div className="space-y-16">
            <section>
              <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
                <span className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <Flame className="w-5 h-5 text-red-600" />
                </span>
                Keadaan Darurat (24 Jam)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {emergencyContacts.map((contact, idx) => (
                  <Card key={idx} className="border-red-100 bg-red-50/30 overflow-hidden group hover:shadow-lg transition-all">
                    <CardContent className="p-6 flex items-center gap-5">
                      <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                        <contact.icon className="w-7 h-7 text-red-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{contact.name}</h3>
                        <p className="text-xl font-bold text-red-600">{contact.number}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-primary mb-8 flex items-center gap-2">
                <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-blue-600" />
                </span>
                Layanan Publik & Instansi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {publicServiceContacts.map((contact, idx) => (
                  <Card key={idx} className="hover:shadow-md transition-all border-border/50">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                          <contact.icon className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">{contact.name}</h3>
                          <p className="text-sm text-muted-foreground">{contact.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                         <p className="font-semibold text-primary hidden sm:block">{contact.number}</p>
                         <div className="p-3 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90">
                           <Phone className="w-4 h-4" />
                         </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
