
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Redirects legacy /feedback path to home or directory
 */
export default function FeedbackRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary/10">
      <p className="font-bold text-primary animate-pulse">Mengalihkan...</p>
    </div>
  );
}
