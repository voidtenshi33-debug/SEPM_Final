
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FinancePageRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirecting to the primary operational view per Blueprint flow
    router.replace('/financial/operational');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="animate-pulse text-slate-400 font-medium">Loading Financial Command Center...</div>
    </div>
  );
}
