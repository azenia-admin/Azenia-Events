'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import EventLandingPage from '@/components/event-landing/EventLandingPage';

function PublicEventContent() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">No event ID provided</p>
        </div>
      </div>
    );
  }

  return <EventLandingPage eventId={eventId} />;
}

export default function PublicEventPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <PublicEventContent />
    </Suspense>
  );
}
