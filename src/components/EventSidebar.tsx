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
  ArrowLeft,
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
  SidebarFooter,
} from '@/components/ui/sidebar';
import { supabase } from '@/lib/supabase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from './ui/skeleton';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from './ui/collapsible';
import { cn } from '@/lib/utils';
import React, { useEffect, useState } from 'react';

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
        { href: '/design/website', label: 'Event Website' },
        { href: '/design/visuals', label: 'Visuals' },
        { href: '/design/layout', label: 'Layout' },
        { href: '/design/venue-designer', label: 'Venue Designer' },
    ]
  },
  {
    label: 'Registration',
    icon: Ticket,
    items: [
        { href: '/registration/tickets', label: 'Setup Tickets' },
        { href: '/registration/forms', label: 'Order Forms' },
        { href: '/registration/discounts', label: 'Discount & Access Codes' },
        { href: '/registration/confirmation', label: 'Confirmation & Reminders' },
        { href: '/registration/badges', label: 'Badges' },
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
  const pathname = usePathname();
  const [event, setEvent] = useState<{ name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const eventImage = PlaceHolderImages.find((p) => p.id === 'event-1');

  useEffect(() => {
    if (!eventId) return;
    supabase
      .from('events')
      .select('name')
      .eq('id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEvent(data);
        setIsLoading(false);
      });
  }, [eventId]);

  const getHref = (path: string) => {
    const basePath = path === '' ? '/events' : `/events${path}`;
    return `${basePath}?eventId=${eventId}`;
  };

  const isLinkActive = (path: string) => {
    const expectedPath = path === '' ? '/events' : `/events${path}`;
    return pathname === expectedPath;
  };

  const isSubLinkActive = (path: string) => {
    const expectedPath = `/events${path}`;
    return pathname === expectedPath;
  }

  return (
    <>
      <SidebarHeader>
        {isLoading ? (
          <div className="flex flex-col gap-2 p-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
          </div>
        ) : (
          event && (
            <div className="flex flex-col gap-3 p-2">
              {eventImage && (
                <div className="relative overflow-hidden rounded-xl ring-1 ring-[#E8DFD3]">
                  <Image
                    src={eventImage.imageUrl}
                    alt={eventImage.description}
                    width={260}
                    height={150}
                    className="object-cover w-full h-[140px]"
                    data-ai-hint={eventImage.imageHint}
                  />
                </div>
              )}
              <div className="px-1">
                <p className="text-[10px] font-medium tracking-wider uppercase text-[#D97757]">
                  Event
                </p>
                <h2 className="font-headline font-semibold text-base leading-snug text-[#1B1A17] mt-0.5">
                  {event.name}
                </h2>
              </div>
            </div>
          )
        )}
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <div className="mx-2 my-2 h-px bg-[#E8DFD3]" />
        <p className="px-3 pb-2 text-[10px] font-medium tracking-wider uppercase text-[#8A8378]">
          Overview
        </p>
        <SidebarMenu className="gap-0.5">
          {mainNav.map((item) => {
            const active = isLinkActive(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={active}
                  className={cn(
                    'rounded-xl h-9 px-3 text-sm font-medium text-[#55514B] hover:bg-[#F0E6D6] hover:text-[#1B1A17]',
                    active &&
                      'bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#1B1A17] hover:text-[#FAF6F1] data-[active=true]:bg-[#1B1A17] data-[active=true]:text-[#FAF6F1]'
                  )}
                >
                  <Link href={getHref(item.href)}>
                    <item.icon className={cn('h-4 w-4', active ? 'text-[#E8A355]' : 'text-[#8A8378]')} />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>

        <p className="px-3 pt-4 pb-2 text-[10px] font-medium tracking-wider uppercase text-[#8A8378]">
          Manage
        </p>
        <SidebarMenu className="gap-0.5">
          {subNavs.map((nav) => {
            const hasActive = nav.items.some((i) => isSubLinkActive(i.href));
            return (
              <Collapsible key={nav.label} defaultOpen={hasActive}>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    className={cn(
                      'justify-between w-full rounded-xl h-9 px-3 text-sm font-medium text-[#55514B] hover:bg-[#F0E6D6] hover:text-[#1B1A17]',
                      hasActive && 'text-[#1B1A17]'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <nav.icon className="h-4 w-4 text-[#8A8378]" />
                      <span>{nav.label}</span>
                    </div>
                    <ChevronDown className="h-4 w-4 transition-transform text-[#8A8378] [&[data-state=open]]:-rotate-180" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <SidebarMenuSub className="mx-3 my-1 border-[#E8DFD3] gap-0.5">
                    {nav.items.map((item) => {
                      const active = isSubLinkActive(item.href);
                      return (
                        <SidebarMenuSubItem key={item.href}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={active}
                            className={cn(
                              'rounded-lg h-8 text-sm text-[#55514B] hover:bg-[#F0E6D6] hover:text-[#1B1A17]',
                              active &&
                                'bg-[#E8A355]/15 text-[#1B1A17] font-medium data-[active=true]:bg-[#E8A355]/15 data-[active=true]:text-[#1B1A17]'
                            )}
                          >
                            <Link href={getHref(item.href)}>{item.label}</Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-[#E8DFD3] px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="rounded-xl h-9 px-3 text-sm text-[#55514B] hover:bg-[#F0E6D6] hover:text-[#1B1A17]"
            >
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4 text-[#8A8378]" />
                <span>Back to events</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
