import { EventDetailsForm } from '@/components/EventDetailsForm';

// This is a server component by default.
// It can safely access params and then pass them down to client components.
export default function EventDetailsPage({
  params,
}: {
  params: { eventId: string };
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EventDetailsForm eventId={params.eventId} />
    </div>
  );
}
