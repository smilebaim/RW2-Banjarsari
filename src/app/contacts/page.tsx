import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Phone, Shield, Ambulance, Flame, Landmark } from 'lucide-react';

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
    <div className="flex flex-col min-h-screen pb-32">
      <main className="flex-1 py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-black text-primary mb-6 uppercase tracking-tighter">Kontak Penting</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg font-medium">
              Akses cepat layanan darurat dan instansi publik untuk seluruh warga Banjarsari.
            </p>
          </div>

          <div className="max-w-4xl mx-auto mb-20">
            <div className="relative group">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground w-6 h-6 group-focus-within:text-primary transition-colors" />
              <Input placeholder="Cari layanan darurat..." className="pl-16 h-16 bg-secondary/30 border-none text-xl rounded-[2rem] shadow-inner font-bold" />
            </div>
          </div>

          <div className="space-y-20">
            <section>
              <h2 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 uppercase tracking-tight">
                <span className="w-10 h-10 bg-red-100 rounded-2xl flex items-center justify-center shadow-md">
                  <Flame className="w-6 h-6 text-red-600" />
                </span>
                Keadaan Darurat (24 Jam)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {emergencyContacts.map((contact, idx) => (
                  <Card key={idx} className="border-none bg-red-50/50 rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-red-200 transition-all duration-500">
                    <CardContent className="p-8 flex flex-col items-center text-center">
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-6">
                        <contact.icon className="w-10 h-10 text-red-600" />
                      </div>
                      <h3 className="font-black text-gray-900 text-lg mb-2">{contact.name}</h3>
                      <p className="text-3xl font-black text-red-600 tracking-tighter">{contact.number}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-black text-primary mb-10 flex items-center gap-3 uppercase tracking-tight">
                <span className="w-10 h-10 bg-blue-100 rounded-2xl flex items-center justify-center shadow-md">
                  <Landmark className="w-6 h-6 text-blue-600" />
                </span>
                Instansi & Layanan Publik
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {publicServiceContacts.map((contact, idx) => (
                  <Card key={idx} className="rounded-[2.5rem] border-none shadow-lg hover:shadow-xl transition-all group bg-secondary/20">
                    <CardContent className="p-8 flex items-center justify-between">
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-md group-hover:rotate-12 transition-transform">
                          <contact.icon className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-900 text-lg">{contact.name}</h3>
                          <p className="text-sm font-bold text-primary/60 uppercase tracking-widest">{contact.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                         <div className="p-4 bg-primary text-white rounded-full cursor-pointer hover:bg-primary/90 shadow-lg shadow-primary/30">
                           <Phone className="w-5 h-5" />
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
    </div>
  );
}
