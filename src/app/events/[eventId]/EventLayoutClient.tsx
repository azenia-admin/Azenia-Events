'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { EventSidebar } from '@/components/EventSidebar';

// This is the Client Component that receives the eventId as a simple string prop.
// This avoids the warning about accessing `params` directly in a client component.
export default function EventLayoutClient({
  children,
  eventId,
}: {
  children: React.ReactNode;
  eventId: string;
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <EventSidebar eventId={eventId} />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
