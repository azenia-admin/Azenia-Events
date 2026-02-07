'use client';

import { EventDetailsForm } from '@/components/EventDetailsForm';
import { useSearchParams } from 'next/navigation';
import EventLayoutClient from '../EventLayoutClient';

export default function EventDetailsPage() {
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

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="p-4 sm:p-6 lg:p-8">
        <EventDetailsForm eventId={eventId} />
      </div>
    </EventLayoutClient>
  );
}
