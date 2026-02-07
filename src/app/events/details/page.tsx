import { Suspense } from 'react';
import EventDetailsPageClient from './EventDetailsPageClient';

export default function EventDetailsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <EventDetailsPageClient />
    </Suspense>
  );
}
