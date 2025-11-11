import EventLayoutClient from './EventLayoutClient';

// This is a server component by default.
// It can safely access params and then pass them down to client components.
export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  return (
    <EventLayoutClient eventId={params.eventId}>
      {children}
    </EventLayoutClient>
  );
}
