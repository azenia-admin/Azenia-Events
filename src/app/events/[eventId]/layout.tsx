'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { EventSidebar } from '@/components/EventSidebar';

// Note: In Next.js App Router, for client components, 'params' is passed as a regular object.
// The warning you saw is more relevant for Server Components where 'params' can be a Promise.
// This implementation is correct for a client-side layout.

export default function EventLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { eventId: string };
}) {
  return (
    <SidebarProvider>
      <Sidebar>
        <EventSidebar eventId={params.eventId} />
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
