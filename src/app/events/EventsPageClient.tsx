'use client';

import { useSearchParams } from 'next/navigation';
import { useUser } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Ticket,
  Pencil,
  CalendarDays,
  Mic2,
  Users,
  ChevronRight,
  ChevronUp,
  Lock,
} from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import EventLayoutClient from './EventLayoutClient';

interface EventData {
  name: string;
  description?: string;
  start_date: string | null;
  location?: string;
}

const shortcuts = [
  {
    label: 'Create Tickets',
    icon: Ticket,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    path: '/events/registration/tickets',
  },
  {
    label: 'Customize Landing Page',
    icon: Pencil,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    path: '/events/details',
  },
  {
    label: 'Add Session',
    icon: CalendarDays,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    path: '/events',
  },
  {
    label: 'Add Speakers',
    icon: Mic2,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    path: '/events',
  },
  {
    label: 'Add Team Members',
    icon: Users,
    color: 'text-red-500',
    bg: 'bg-red-50',
    path: '/events',
  },
];

export default function EventOverviewPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { user } = useUser();
  const [event, setEvent] = useState<EventData | null>(null);
  const [setupOpen, setSetupOpen] = useState(true);

  useEffect(() => {
    if (!eventId) return;
    supabase
      .from('events')
      .select('name, description, start_date, location')
      .eq('id', eventId)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setEvent(data);
      });
  }, [eventId]);

  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there';

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">No event ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-6 lg:p-8 space-y-4">
              <p className="text-sm text-blue-600 font-medium">Welcome, {displayName}</p>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                Your event is almost ready to publish
              </h1>
              <p className="text-sm text-gray-500 leading-relaxed">
                Follow the item below to make sure your event is ready to get published, or
                preview your event to see how it looks
              </p>
              <div className="flex items-center gap-3 pt-2">
                <button className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors">
                  Publish
                  <Lock className="h-3.5 w-3.5" />
                </button>
                <Link
                  href={`/e?eventId=${eventId}`}
                  target="_blank"
                  className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Preview Event Site
                </Link>
              </div>
            </div>

            <div className="lg:w-[300px] flex-shrink-0 p-4 lg:p-6 flex items-center justify-center">
              <div className="relative w-full aspect-[16/10] rounded-lg overflow-hidden bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900" />
                <div className="absolute inset-0 opacity-30">
                  <svg className="w-full h-full" viewBox="0 0 400 250" fill="none">
                    <path d="M0 200 Q100 150 200 180 T400 160" stroke="rgba(99,102,241,0.4)" strokeWidth="40" fill="none" />
                    <path d="M0 160 Q100 110 200 140 T400 120" stroke="rgba(99,102,241,0.3)" strokeWidth="30" fill="none" />
                    <path d="M0 120 Q100 70 200 100 T400 80" stroke="rgba(99,102,241,0.2)" strokeWidth="25" fill="none" />
                  </svg>
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-6">
                  <h2 className="text-white text-lg sm:text-xl font-bold text-center leading-snug">
                    {event?.name || 'Event Name'}
                  </h2>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
          <div className="bg-white border rounded-xl">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-6 lg:p-8 text-left">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Event Setup Made Easy</h2>
                <p className="text-sm text-gray-500 mt-1">
                  You can quickly navigate to the event&apos;s configuration pages by clicking any of the shortcuts below
                </p>
              </div>
              <ChevronUp
                className={`h-5 w-5 text-gray-400 flex-shrink-0 ml-4 transition-transform ${
                  setupOpen ? '' : 'rotate-180'
                }`}
              />
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="px-6 lg:px-8 pb-6 lg:pb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {shortcuts.map((shortcut) => (
                    <Link
                      key={shortcut.label}
                      href={`${shortcut.path}?eventId=${eventId}`}
                      className="flex items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <div className={`w-8 h-8 rounded-full ${shortcut.bg} flex items-center justify-center flex-shrink-0`}>
                        <shortcut.icon className={`h-4 w-4 ${shortcut.color}`} />
                      </div>
                      <span className="text-sm font-medium text-gray-700 flex-1">{shortcut.label}</span>
                      <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
                    </Link>
                  ))}
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      </div>
    </EventLayoutClient>
  );
}
