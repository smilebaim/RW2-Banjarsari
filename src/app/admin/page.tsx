
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects legacy /admin path to the new /dashboard
 */
export default function AdminRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <p className="font-bold text-primary animate-pulse">Mengalihkan ke Dashboard...</p>
    </div>
  );
}
