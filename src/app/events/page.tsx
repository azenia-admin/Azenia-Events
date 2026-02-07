import { Suspense } from 'react';
import EventsPageClient from './EventsPageClient';

export default function EventsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <EventsPageClient />
    </Suspense>
  );
}
