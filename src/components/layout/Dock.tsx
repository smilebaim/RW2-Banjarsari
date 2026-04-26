
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
  { label: 'Dashboard', href: '/dashboard', icon: ShieldCheck },
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
        <div className="flex items-center justify-around sm:justify-start gap-1 sm:gap-2 p-1.5 bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] rounded-[2rem]">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={cn(
                      "relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-all duration-700 ease-in-out group",
                      isActive 
                        ? "bg-primary text-white scale-110 shadow-[0_0_20px_rgba(var(--primary),0.4)]" 
                        : "hover:bg-white/10 text-white/50 hover:text-white hover:scale-105"
                    )}
                  >
                    <item.icon className={cn("w-5 h-5 sm:w-6 sm:h-6 transition-all duration-500", isActive ? "stroke-[2.5px] scale-110" : "stroke-[2px]")} />
                    {isActive && (
                      <span className="absolute -top-1 -right-1 flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-accent shadow-[0_0_10px_rgba(255,255,255,0.5)]"></span>
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="top" className="hidden sm:block bg-black/90 backdrop-blur-md text-white border border-white/10 font-black text-[10px] mb-8 px-5 py-2.5 rounded-2xl shadow-2xl uppercase tracking-[0.2em]">
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
