import { Suspense } from 'react';
import SetupTicketsPageClient from './SetupTicketsPageClient';

export default function SetupTicketsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <SetupTicketsPageClient />
    </Suspense>
  );
}
