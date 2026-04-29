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
  MapPin,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import EventLayoutClient from './EventLayoutClient';

interface EventData {
  name: string;
  description?: string | null;
  start_date: string | null;
  location?: string | null;
}

const shortcuts = [
  {
    label: 'Create tickets',
    description: 'Set up paid and free ticket types',
    icon: Ticket,
    path: '/events/registration/tickets',
  },
  {
    label: 'Customize landing page',
    description: 'Refine how attendees see your event',
    icon: Pencil,
    path: '/events/details',
  },
  {
    label: 'Add a session',
    description: 'Build out your schedule',
    icon: CalendarDays,
    path: '/events',
  },
  {
    label: 'Add speakers',
    description: 'Feature the people on stage',
    icon: Mic2,
    path: '/events',
  },
  {
    label: 'Invite team members',
    description: 'Collaborate with your team',
    icon: Users,
    path: '/events',
  },
  {
    label: 'Design the venue',
    description: 'Lay out seating and sections',
    icon: Sparkles,
    path: '/events/design/venue-designer',
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

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there';

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#FAF6F1]">
        <div className="text-center">
          <h1 className="font-headline text-3xl font-bold mb-2 text-[#1B1A17]">
            Event not found
          </h1>
          <p className="text-[#55514B]">No event ID provided.</p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 mt-6 rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] px-5 h-11"
          >
            Back to events
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const eventDate = event?.start_date ? new Date(event.start_date) : null;

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17]">
        <section className="border-b border-[#E8DFD3]">
          <div className="px-4 sm:px-6 lg:px-10 py-10 lg:py-14">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8 lg:gap-12 items-start">
              <div>
                <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-3">
                  Welcome back, {displayName}
                </p>
                <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                  Almost ready to{' '}
                  <span className="italic text-[#D97757]">publish.</span>
                </h1>
                <p className="mt-4 text-[#55514B] text-lg leading-relaxed max-w-xl">
                  Walk through the checklist to get your event ready for the world, or
                  preview how it looks right now.
                </p>

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button className="inline-flex items-center gap-2 rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] px-6 h-11 text-sm font-medium transition-colors">
                    Publish event
                    <Lock className="h-3.5 w-3.5" />
                  </button>
                  <Link
                    href={`/e?eventId=${eventId}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-white hover:bg-[#F0E6D6] px-6 h-11 text-sm font-medium text-[#1B1A17] transition-colors"
                  >
                    Preview event site
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>

                {(eventDate || event?.location) && (
                  <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-[#55514B]">
                    {eventDate && (
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        {eventDate.toLocaleString('en-US', {
                          dateStyle: 'medium',
                          timeStyle: 'short',
                        })}
                      </span>
                    )}
                    {event?.location && (
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {event.location}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-[#1B1A17] shadow-xl shadow-[#1B1A17]/10">
                <div className="absolute inset-0">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#2D2B26] via-[#1B1A17] to-[#0F0E0C]" />
                  <svg
                    className="absolute inset-0 w-full h-full opacity-40"
                    viewBox="0 0 400 300"
                    fill="none"
                  >
                    <path
                      d="M0 220 Q100 170 200 200 T400 180"
                      stroke="#D97757"
                      strokeOpacity="0.35"
                      strokeWidth="40"
                      fill="none"
                    />
                    <path
                      d="M0 170 Q100 120 200 150 T400 130"
                      stroke="#E8A355"
                      strokeOpacity="0.3"
                      strokeWidth="32"
                      fill="none"
                    />
                    <path
                      d="M0 120 Q100 70 200 100 T400 80"
                      stroke="#E8A355"
                      strokeOpacity="0.18"
                      strokeWidth="24"
                      fill="none"
                    />
                  </svg>
                </div>
                <div className="absolute inset-0 p-8 flex flex-col justify-between">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E8A355]/15 text-[#E8A355] border border-[#E8A355]/25 px-3 py-1 text-xs font-medium w-fit">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#E8A355]" />
                    Draft
                  </span>
                  <div>
                    <p className="text-[#E8A355] text-xs font-medium tracking-wider uppercase mb-2">
                      Your event
                    </p>
                    <h2 className="font-headline text-2xl sm:text-3xl font-bold text-[#FAF6F1] leading-tight">
                      {event?.name || 'Untitled event'}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-10 py-10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: 'Registrations', value: '0' },
              { label: 'Revenue', value: '$0' },
              { label: 'Tickets available', value: '0' },
              { label: 'Views', value: '0' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E8DFD3] bg-white/60 p-5"
              >
                <p className="text-xs text-[#8A8378] uppercase tracking-wider">
                  {stat.label}
                </p>
                <p className="font-headline text-3xl font-bold mt-1">{stat.value}</p>
              </div>
            ))}
          </div>

          <Collapsible open={setupOpen} onOpenChange={setSetupOpen}>
            <div className="rounded-3xl border border-[#E8DFD3] bg-white">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-6 lg:p-8 text-left group">
                <div>
                  <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-1">
                    Setup checklist
                  </p>
                  <h2 className="font-headline text-2xl font-bold text-[#1B1A17]">
                    Event setup, made easy
                  </h2>
                  <p className="text-sm text-[#55514B] mt-1.5">
                    Jump straight into the parts of your event that need attention.
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#F0E6D6] flex items-center justify-center ml-4 transition-transform group-hover:scale-105">
                  <ChevronUp
                    className={`h-4 w-4 text-[#1B1A17] transition-transform ${
                      setupOpen ? '' : 'rotate-180'
                    }`}
                  />
                </div>
              </CollapsibleTrigger>

              <CollapsibleContent>
                <div className="px-6 lg:px-8 pb-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {shortcuts.map((shortcut) => (
                      <Link
                        key={shortcut.label}
                        href={`${shortcut.path}?eventId=${eventId}`}
                        className="group flex items-start gap-4 p-5 rounded-2xl border border-[#E8DFD3] bg-[#FAF6F1]/60 hover:bg-white hover:border-[#D97757]/40 hover:shadow-sm transition-all"
                      >
                        <div className="h-10 w-10 rounded-xl bg-[#E8A355]/15 border border-[#E8A355]/20 flex items-center justify-center flex-shrink-0">
                          <shortcut.icon className="h-4.5 w-4.5 text-[#D97757]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-[#1B1A17] group-hover:text-[#D97757] transition-colors">
                            {shortcut.label}
                          </p>
                          <p className="text-sm text-[#55514B] mt-0.5">
                            {shortcut.description}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-[#8A8378] group-hover:text-[#D97757] group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-1" />
                      </Link>
                    ))}
                  </div>
                </div>
              </CollapsibleContent>
            </div>
          </Collapsible>
        </section>
      </div>
    </EventLayoutClient>
  );
}
