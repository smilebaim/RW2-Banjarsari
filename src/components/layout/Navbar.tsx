
import Link from 'next/link';
import { Home, Newspaper, Users, MessageSquare, Phone, ShieldCheck } from 'lucide-react';

const navItems = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Berita', href: '/news', icon: Newspaper },
  { label: 'Pengurus', href: '/directory', icon: Users },
  { label: 'Aspirasi', href: '/feedback', icon: MessageSquare },
  { label: 'Kontak', href: '/contacts', icon: Phone },
];

export function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-white/10 backdrop-blur-xl supports-[backdrop-filter]:bg-white/10 border-b border-white/20 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-10 h-10 bg-primary/80 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110">
            <ShieldCheck className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">Banjarsari <span className="text-accent-foreground">Connect</span></span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-accent/80 backdrop-blur-md text-accent-foreground rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Dashboard
          </Link>
        </div>
      </div>
    </nav>
  );
}
