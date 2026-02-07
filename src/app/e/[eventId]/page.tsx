import EventLandingPage from '@/components/event-landing/EventLandingPage';

interface PageProps {
  params: Promise<{ eventId: string }>;
}

export default async function PublicEventPage({ params }: PageProps) {
  const { eventId } = await params;
  return <EventLandingPage eventId={eventId} />;
}
