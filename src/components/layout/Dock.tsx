
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Newspaper, Users, MessageSquare, Phone, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';

const navItems = [
  { label: 'Beranda', href: '/', icon: Home },
  { label: 'Berita', href: '/news', icon: Newspaper },
  { label: 'Pengurus', href: '/directory', icon: Users },
  { label: 'Aspirasi', href: '/feedback', icon: MessageSquare },
  { label: 'Kontak', href: '/contacts', icon: Phone },
  { label: 'Admin', href: '/admin', icon: ShieldCheck },
];

export function Dock() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-[92%] sm:w-fit">
      <TooltipProvider delayDuration={0}>
        <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 p-1.5 bg-white/10 backdrop-blur-3xl border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.3)] rounded-[2.5rem]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-500 ease-in-out group",
                      isActive 
                        ? "bg-primary text-white scale-110 shadow-xl shadow-primary/40" 
                        : "hover:bg-white/20 text-primary hover:text-primary hover:scale-105"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", isActive ? "stroke-[2.5px]" : "stroke-[2px]")} />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-sm"></span>
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden sm:block bg-primary text-white border-none font-black text-[10px] mb-4 px-4 py-2 rounded-2xl shadow-2xl uppercase tracking-widest">
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
