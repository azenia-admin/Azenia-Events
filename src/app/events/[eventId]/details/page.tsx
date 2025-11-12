import { EventDetailsForm } from '@/components/EventDetailsForm';

export default async function EventDetailsPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;
  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <EventDetailsForm eventId={eventId} />
    </div>
  );
}
