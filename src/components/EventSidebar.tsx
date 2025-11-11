'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  BarChart2,
  CalendarCheck2,
  Brush,
  Ticket,
  Users,
  Folder,
  Smartphone,
  Building,
  Heart,
  Settings,
  ChevronDown,
} from 'lucide-react';
import {
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from './ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import React from 'react';

type EventSidebarProps = {
  eventId: string;
};

const mainNav = [
  { href: '', label: 'Overview', icon: LayoutDashboard },
  { href: '/analytics', label: 'Analytics', icon: BarChart2 },
  { href: '/details', label: 'Event Details', icon: CalendarCheck2 },
  { href: '/sponsors', label: 'Sponsors', icon: Building },
];

const subNavs = [
  {
    label: 'Event Design',
    icon: Brush,
    items: [
        { href: '/design/visuals', label: 'Visuals' },
        { href: '/design/layout', label: 'Layout' },
    ]
  },
  {
    label: 'Registration',
    icon: Ticket,
    items: [
        { href: '/registration/tickets', label: 'Ticket Types' },
        { href: '/registration/forms', label: 'Registration Forms' },
    ]
  },
    {
    label: 'Attendees',
    icon: Users,
    items: [
        { href: '/attendees/list', label: 'Attendee List' },
        { href: '/attendees/communication', label: 'Communication' },
    ]
  },
  {
    label: 'Event Content',
    icon: Folder,
    items: [
        { href: '/content/schedule', label: 'Schedule' },
        { href: '/content/speakers', label: 'Speakers' },
    ]
  },
  {
    label: 'Text to Give',
    icon: Smartphone,
    items: [
        { href: '/text-to-give/campaigns', label: 'Campaigns' },
        { href: '/text-to-give/donations', label: 'Donations' },
    ]
  },
  {
    label: 'Engage',
    icon: Heart,
    items: [
        { href: '/engage/polls', label: 'Polls' },
        { href: '/engage/q-a', label: 'Q&A' },
    ]
  },
  {
    label: 'Settings',
    icon: Settings,
    items: [
        { href: '/settings/general', label: 'General' },
        { href: '/settings/integrations', label: 'Integrations' },
    ]
  },
];

export function EventSidebar({ eventId }: EventSidebarProps) {
  const firestore = useFirestore();
  const pathname = usePathname();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<{ name: string }>(eventRef);
  const eventImage = PlaceHolderImages.find((p) => p.id === 'event-1');

  const basePath = `/events/${eventId}`;

  // Function to determine if a main nav link or any of its children is active
  const isLinkActive = (baseHref: string) => {
    // Exact match for overview page
    if (baseHref === basePath && pathname === basePath) {
      return true;
    }
    // Starts with for other main navigation items
    if (baseHref !== basePath && pathname.startsWith(baseHref)) {
        return true;
    }
    return false;
  };

  const isSubLinkActive = (href: string) => {
      return pathname === href;
  }

  return (
    <>
      <SidebarHeader>
        {isLoading ? (
            <div className="flex flex-col gap-2 p-2">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-6 w-3/4" />
            </div>
        ) : (
          event && (
            <div className="flex flex-col gap-2 p-2">
              {eventImage && (
                <Image
                  src={eventImage.imageUrl}
                  alt={eventImage.description}
                  width={250}
                  height={140}
                  className="rounded-md object-cover"
                  data-ai-hint={eventImage.imageHint}
                />
              )}
              <h2 className="font-semibold text-lg">{event.name}</h2>
            </div>
          )
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {mainNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={`${basePath}${item.href}`} passHref>
                <SidebarMenuButton
                  isActive={isLinkActive(`${basePath}${item.href}`)}
                  as="a"
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
          {subNavs.map((nav) => (
             <Collapsible key={nav.label} defaultOpen={nav.items.some(item => isSubLinkActive(`${basePath}${item.href}`))}>
                <CollapsibleTrigger asChild>
                   <SidebarMenuButton className="justify-between w-full">
                        <div className="flex items-center gap-2">
                            <nav.icon />
                            <span>{nav.label}</span>
                        </div>
                        <ChevronDown className="h-4 w-4 transition-transform [&[data-state=open]]:-rotate-180" />
                   </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                    <SidebarMenuSub>
                    {nav.items.map((item) => (
                        <SidebarMenuSubItem key={item.href}>
                            <Link href={`${basePath}${item.href}`} passHref>
                                <SidebarMenuSubButton as="a" isActive={isSubLinkActive(`${basePath}${item.href}`)}>
                                    {item.label}
                                </SidebarMenuSubButton>
                            </Link>
                        </SidebarMenuSubItem>
                    ))}
                    </SidebarMenuSub>
                </CollapsibleContent>
             </Collapsible>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
