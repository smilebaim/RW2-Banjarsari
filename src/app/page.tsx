import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Image from 'next/image';
import Link from 'next/link';
import { Newspaper, Users, MessageSquare, Phone, ArrowRight, MapPin, Navigation } from 'lucide-react';

const features = [
  { title: 'Berita & Pengumuman', desc: 'Dapatkan informasi terbaru mengenai kegiatan RW.', icon: Newspaper, href: '/news', color: 'bg-green-100' },
  { title: 'Daftar Pengurus', desc: 'Kenali sosok di balik pengelolaan lingkungan kita.', icon: Users, href: '/directory', iconColor: 'text-blue-600', color: 'bg-blue-100' },
  { title: 'Aspirasi Warga', desc: 'Sampaikan saran dan masukan untuk kemajuan bersama.', icon: MessageSquare, href: '/feedback', color: 'bg-yellow-100' },
  { title: 'Kontak Penting', desc: 'Akses cepat ke nomor darurat dan layanan publik.', icon: Phone, href: '/contacts', color: 'bg-red-100' },
];

const featuredNews = [
  { id: 1, title: 'Gotong Royong Kebersihan Lingkungan', date: '24 Mei 2024', summary: 'Warga RW 2 Banjarsari akan mengadakan kegiatan bersih-bersih rutin hari Minggu besok.', image: PlaceHolderImages[1].imageUrl },
  { id: 2, title: 'Sosialisasi Keamanan Lingkungan Baru', date: '20 Mei 2024', summary: 'Pertemuan bulanan akan membahas sistem keamanan lingkungan yang lebih modern.', image: PlaceHolderImages[2].imageUrl },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      <main className="flex-1">
        {/* Map Hero Section */}
        <section className="relative h-[650px] w-full overflow-hidden border-b border-border shadow-inner">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15893.606406325567!2d105.3023!3d-5.0931!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e40bf6c30e79603%3A0x4039147e0996840!2sBanjarsari%2C%20North%20Metro%2C%20Metro%20City%2C%20Lampung!5e0!3m2!1sen!2sid!4v1716550000000!5m2!1sen!2sid"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full"
          ></iframe>
          
          <div className="absolute top-8 left-4 md:left-8 z-10 max-w-md pointer-events-none">
            <Card className="bg-white/95 backdrop-blur shadow-2xl border-primary/20 pointer-events-auto animate-in fade-in slide-in-from-left-8 duration-700">
              <CardHeader className="pb-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent rounded-full text-accent-foreground text-xs font-bold mb-3 w-fit">
                  <MapPin className="w-3 h-3" />
                  <span>WILAYAH RW 2</span>
                </div>
                <CardTitle className="text-3xl font-bold text-primary leading-tight">
                  Selamat Datang di <span className="text-accent-foreground">Banjarsari Connect</span>
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Portal warga untuk informasi, aspirasi, dan kolaborasi lingkungan RW 2 Banjarsari, Metro Utara.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                <Button className="bg-primary hover:bg-primary/90 text-white" asChild>
                  <Link href="/news">Lihat Kegiatan</Link>
                </Button>
                <Button variant="outline" className="border-primary text-primary" asChild>
                  <a href="https://maps.app.goo.gl/e96s6tRQxeCDnLdAA" target="_blank" rel="noopener noreferrer">
                    <Navigation className="w-4 h-4 mr-2" />
                    Buka Rute
                  </a>
                </Button>
              </CardContent>
            </Card>
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
                      data-ai-hint="news coverage"
                    />
                  </div>
                  <CardHeader>
                    <div className="text-xs font-semibold text-primary mb-2 uppercase tracking-wider">{news.date}</div>
                    <CardTitle className="text-2xl hover:text-primary transition-colors cursor-pointer">
                      <Link href={`/news`}>{news.title}</Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-6 line-clamp-2">{news.summary}</p>
                    <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white" asChild>
                      <Link href={`/news`}>Baca Selengkapnya</Link>
                    </Button>
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
