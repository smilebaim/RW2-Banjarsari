
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Users, FileText, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const navItems = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Informasi & Pengumuman', href: '/news', icon: Newspaper },
  { label: 'Administrasi Kependudukan', href: '/services', icon: FileText },
  { label: 'Struktur Pejabat Pamong', href: '/directory', icon: Users },
  { label: 'Kontak Penting', href: '/contacts', icon: Phone },
];

export function Dock() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-fit">
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 p-1.5 bg-zinc-900/90 backdrop-blur-2xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-full transition-all duration-500 ease-in-out group",
                      isActive 
                        ? "bg-primary text-white scale-110 shadow-[0_0_15px_rgba(var(--primary),0.3)]" 
                        : "hover:bg-white/10 text-zinc-400 hover:text-white hover:scale-105"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 sm:w-5 sm:h-5 transition-all duration-500", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                    {isActive && (
                      <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden sm:block bg-zinc-900 text-white border border-white/10 font-black text-[9px] mb-6 px-4 py-2 rounded-xl shadow-2xl uppercase tracking-[0.2em]">
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    </div>
  );
}
