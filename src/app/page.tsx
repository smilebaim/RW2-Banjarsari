import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Newspaper, Users, MessageSquare, Phone, ArrowRight, Star, MapPin } from 'lucide-react';

const features = [
  { title: 'Berita & Pengumuman', desc: 'Dapatkan informasi terbaru mengenai kegiatan RW.', icon: Newspaper, href: '/news', color: 'bg-green-100' },
  { title: 'Daftar Pengurus', desc: 'Kenali sosok di balik pengelolaan lingkungan kita.', icon: Users, href: '/directory', color: 'bg-blue-100' },
  { title: 'Aspirasi Warga', desc: 'Sampaikan saran dan masukan untuk kemajuan bersama.', icon: MessageSquare, href: '/feedback', color: 'bg-yellow-100' },
  { title: 'Kontak Penting', desc: 'Akses cepat ke nomor darurat dan layanan publik.', icon: Phone, href: '/contacts', color: 'bg-red-100' },
];

const featuredNews = [
  { id: 1, title: 'Gotong Royong Kebersihan Lingkungan', date: '24 Mei 2024', summary: 'Warga RW 2 Banjarsari akan mengadakan kegiatan bersih-bersih rutin hari Minggu besok.', image: PlaceHolderImages[1].imageUrl },
  { id: 2, title: 'Sosialisasi Keamanan Lingkungan Baru', date: '20 Mei 2024', summary: 'Pertemuan bulanan akan membahas sistem keamanan lingkungan yang lebih modern.', image: PlaceHolderImages[2].imageUrl },
];

export default function Home() {
  const heroImg = PlaceHolderImages[0];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative h-[600px] flex items-center overflow-hidden">
          <Image
            src={heroImg.imageUrl}
            alt={heroImg.description}
            fill
            className="object-cover brightness-[0.4]"
            priority
            data-ai-hint="community gathering"
          />
          <div className="container mx-auto px-4 relative z-10 text-white">
            <div className="max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full text-accent-foreground text-xs font-bold mb-6">
                <Star className="w-3 h-3 fill-current" />
                <span>RW 2 BANJARSARI TERBAIK</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                Membangun Komunitas <span className="text-accent underline decoration-4 underline-offset-8">Lebih Dekat</span>
              </h1>
              <p className="text-xl mb-10 text-gray-200">
                Portal resmi warga Banjarsari untuk informasi terkini, layanan aspirasi, dan koneksi komunitas yang lebih kuat.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-white px-8" asChild>
                  <Link href="/news">Lihat Pengumuman</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20" asChild>
                  <Link href="/feedback">Kirim Aspirasi</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Access Grid */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4">Layanan Utama</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Akses cepat berbagai layanan dan informasi untuk seluruh warga RW 2 Banjarsari.</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((f, i) => (
                <Link key={i} href={f.href}>
                  <Card className="h-full hover:shadow-lg transition-all border-border hover:-translate-y-1 group">
                    <CardHeader>
                      <div className={`w-12 h-12 ${f.color} rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                        <f.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{f.title}</CardTitle>
                      <CardDescription>{f.desc}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="text-primary text-sm font-semibold inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                        Selengkapnya <ArrowRight className="w-4 h-4" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Featured News Preview */}
        <section className="py-24 bg-secondary/30">
          <div className="container mx-auto px-4">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-primary mb-2">Informasi Terkini</h2>
                <p className="text-muted-foreground">Berita dan kegiatan terbaru di lingkungan kita.</p>
              </div>
              <Button variant="link" className="text-primary font-semibold" asChild>
                <Link href="/news">Semua Berita <ArrowRight className="ml-2 w-4 h-4" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {featuredNews.map((news) => (
                <Card key={news.id} className="overflow-hidden border-none shadow-md group">
                  <div className="relative h-64 overflow-hidden">
                    <Image
                      src={news.image}
                      alt={news.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <CardHeader>
                    <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">{news.date}</div>
                    <CardTitle className="text-2xl hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/news/${news.id}`}>{news.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-2">{news.summary}</p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                      <Link href={`/news/${news.id}`}>Baca Selengkapnya</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-primary mb-4 flex items-center justify-center gap-3">
                <MapPin className="w-8 h-8 text-accent-foreground" />
                Lokasi Wilayah RW 2
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Terletak strategis di Banjarsari, Metro Utara. Klik peta di bawah untuk petunjuk arah yang lebih detail.
              </p>
            </div>
            <Card className="overflow-hidden border-none shadow-2xl h-[450px] relative group">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15893.606406325567!2d105.3023!3d-5.0931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40bf6c30e79603%3A0x4039147e0996840!2sBanjarsari%2C%20North%20Metro%2C%20Metro%20City%2C%20Lampung!5e0!3m2!1sen!2sid!4v1716550000000!5m2!1sen!2sid"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
              ></iframe>
              <div className="absolute bottom-4 right-4 flex gap-2">
                <Button size="sm" className="bg-white/90 backdrop-blur text-primary hover:bg-white shadow-lg border-none" asChild>
                  <a href="https://maps.app.goo.gl/toqRf3dxK6E3uawg8" target="_blank" rel="noopener noreferrer">
                    Buka di Google Maps
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
