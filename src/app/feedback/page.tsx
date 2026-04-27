'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FeedbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new directory page where the feedback form is now located
    router.replace('/directory');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="flex flex-col items-center gap-4 text-primary font-bold animate-pulse uppercase tracking-[0.2em] text-xs">
        <span className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin"></span>
        Mengalihkan ke Portal Pengurus...
      </div>
    </div>
  );
}
