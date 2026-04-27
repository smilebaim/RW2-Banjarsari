import { ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-secondary/50 border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-primary w-6 h-6" />
              <span className="font-bold text-xl text-primary">Banjarsari Connect</span>
            </div>
            <p className="text-muted-foreground max-w-sm mb-4">
              Portal informasi resmi RW 2 Banjarsari, Metro Utara. Berdedikasi untuk meningkatkan kualitas pelayanan dan keterbukaan informasi bagi seluruh warga.
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Tautan Penting</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/news" className="text-muted-foreground hover:text-primary transition-colors">Informasi & Pengumuman</Link></li>
              <li><Link href="/services" className="text-muted-foreground hover:text-primary transition-colors">Administrasi Kependudukan</Link></li>
              <li><Link href="/directory" className="text-muted-foreground hover:text-primary transition-colors">Struktur Pejabat Pamong</Link></li>
              <li><Link href="/contacts" className="text-muted-foreground hover:text-primary transition-colors">Kontak Penting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-primary mb-4">Alamat Kantor</h4>
            <p className="text-sm text-muted-foreground">
              Sekretariat RW 2 Banjarsari<br />
              Kec. Metro Utara, Kota Metro<br />
              Lampung, 34114
            </p>
          </div>
        </div>
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Banjarsari Connect. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
