'use client';

import { SidebarProvider, Sidebar, SidebarInset } from '@/components/ui/sidebar';
import { EventSidebar } from '@/components/EventSidebar';

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
