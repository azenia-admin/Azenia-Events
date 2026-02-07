'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { EventSidebar } from '@/components/EventSidebar';

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
