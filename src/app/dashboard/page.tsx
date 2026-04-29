'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  PlusCircle,
  Search,
  MoreHorizontal,
  Calendar as CalendarIcon,
  Ticket,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateEventForm } from '@/components/CreateEventForm';
import { useUser } from '@/lib/supabase-auth';
import { supabase } from '@/lib/supabase';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';

interface EventRow {
  id: string;
  name: string;
  start_date: string | null;
  end_date: string | null;
  description: string | null;
  location: string | null;
}

type TabKey = 'active' | 'past' | 'templates';

export default function DashboardPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [areEventsLoading, setAreEventsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [tab, setTab] = useState<TabKey>('active');
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.replace('/');
    }
  }, [user, isUserLoading, router]);

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from('events')
      .select('id, name, start_date, end_date, description, location')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setEvents(data || []);
    setAreEventsLoading(false);
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchEvents();
    } else if (!isUserLoading) {
      setAreEventsLoading(false);
    }
  }, [user, isUserLoading, fetchEvents]);

  const eventImage = PlaceHolderImages.find((p) => p.id === 'event-1');

  const filteredEvents = events.filter((event) =>
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const now = new Date();
  const activeAndUpcomingEvents = filteredEvents.filter((event) =>
    event.start_date ? new Date(event.start_date) >= now : true
  );
  const pastEvents = filteredEvents.filter((event) =>
    event.start_date ? new Date(event.start_date) < now : false
  );

  const visibleEvents =
    tab === 'active' ? activeAndUpcomingEvents : tab === 'past' ? pastEvents : [];

  if (isUserLoading || !user) {
    return (
      <div className="min-h-[60vh] bg-[#FAF6F1] px-6 py-12">
        <div className="container mx-auto">
          <Skeleton className="h-10 w-64 mb-6" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  const displayName =
    user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'there';

  const tabs: { key: TabKey; label: string; count?: number }[] = [
    { key: 'active', label: 'Active & Upcoming', count: activeAndUpcomingEvents.length },
    { key: 'past', label: 'Past', count: pastEvents.length },
    { key: 'templates', label: 'Templates' },
  ];

  const stats = [
    {
      label: 'Total events',
      value: events.length.toString(),
      icon: CalendarIcon,
    },
    {
      label: 'Upcoming',
      value: activeAndUpcomingEvents.length.toString(),
      icon: TrendingUp,
    },
    {
      label: 'Tickets sold',
      value: '0',
      icon: Ticket,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17]">
      <section className="border-b border-[#E8DFD3]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8">
            <div className="max-w-2xl">
              <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-3">
                Welcome back, {displayName}
              </p>
              <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
                Your <span className="italic text-[#D97757]">events.</span>
              </h1>
              <p className="mt-4 text-[#55514B] text-lg leading-relaxed">
                Design, publish, and manage every event you run from one calm workspace.
              </p>
            </div>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button
                  size="lg"
                  className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-7 h-12 group self-start"
                >
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create event
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle className="font-headline">Create New Event</DialogTitle>
                  <DialogDescription>
                    Fill in the details below to create a new event.
                  </DialogDescription>
                </DialogHeader>
                <CreateEventForm onCreated={fetchEvents} />
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-10">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-[#E8DFD3] bg-white/60 p-6 flex items-center gap-4"
              >
                <div className="h-11 w-11 rounded-xl bg-[#E8A355]/15 border border-[#E8A355]/20 flex items-center justify-center">
                  <stat.icon className="h-5 w-5 text-[#D97757]" />
                </div>
                <div>
                  <p className="text-sm text-[#55514B]">{stat.label}</p>
                  <p className="font-headline text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div className="flex items-center gap-1 p-1 rounded-full bg-[#F0E6D6] border border-[#E8DFD3] w-fit">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'px-5 py-2 text-sm font-medium rounded-full transition-colors',
                  tab === t.key
                    ? 'bg-[#1B1A17] text-[#FAF6F1]'
                    : 'text-[#55514B] hover:text-[#1B1A17]'
                )}
              >
                {t.label}
                {typeof t.count === 'number' && (
                  <span
                    className={cn(
                      'ml-2 text-xs',
                      tab === t.key ? 'text-[#E8A355]' : 'text-[#8A8378]'
                    )}
                  >
                    {t.count}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div className="relative w-full md:max-w-xs">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8A8378]" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-10 h-11 rounded-full bg-white border-[#E8DFD3] focus-visible:ring-[#D97757]/30"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {tab === 'templates' ? (
          <EmptyState
            title="Templates coming soon"
            description="Pre-built event templates will land here to help you launch faster."
            onCreate={() => setCreateOpen(true)}
          />
        ) : areEventsLoading ? (
          <div className="grid gap-4">
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
            <Skeleton className="h-28 w-full rounded-2xl" />
          </div>
        ) : visibleEvents.length === 0 ? (
          <EmptyState
            title={tab === 'active' ? 'No upcoming events yet' : 'No past events'}
            description={
              tab === 'active'
                ? 'Create your first event and start designing your venue, tickets, and registration flow.'
                : 'Events that have already happened will appear here.'
            }
            onCreate={() => setCreateOpen(true)}
            showCta={tab === 'active'}
          />
        ) : (
          <div className="grid gap-4">
            {visibleEvents.map((event) => (
              <EventCard key={event.id} event={event} image={eventImage?.imageUrl} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function EventCard({
  event,
  image,
}: {
  event: EventRow;
  image?: string;
}) {
  const eventDate = event.start_date ? new Date(event.start_date) : null;
  const isPast = eventDate ? eventDate < new Date() : false;

  return (
    <Link
      href={`/events?eventId=${event.id}`}
      className="group block rounded-2xl border border-[#E8DFD3] bg-white hover:border-[#D97757]/40 hover:shadow-lg hover:shadow-[#1B1A17]/5 transition-all overflow-hidden"
    >
      <div className="flex flex-col sm:flex-row">
        <div className="relative sm:w-48 h-32 sm:h-auto flex-shrink-0 bg-[#F0E6D6]">
          {image && (
            <Image
              src={image}
              alt={event.name}
              fill
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 192px"
            />
          )}
        </div>
        <div className="flex-1 p-6 flex flex-col sm:flex-row sm:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 rounded-full text-xs font-medium px-2.5 py-0.5',
                  isPast
                    ? 'bg-[#F0E6D6] text-[#55514B]'
                    : 'bg-[#3F704D]/10 text-[#3F704D]'
                )}
              >
                <span
                  className={cn(
                    'h-1.5 w-1.5 rounded-full',
                    isPast ? 'bg-[#8A8378]' : 'bg-[#3F704D]'
                  )}
                />
                {isPast ? 'Past' : 'Upcoming'}
              </span>
            </div>
            <h3 className="font-headline text-xl font-semibold truncate group-hover:text-[#D97757] transition-colors">
              {event.name}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-[#55514B]">
              <span className="inline-flex items-center gap-1.5">
                <CalendarIcon className="h-3.5 w-3.5" />
                {eventDate
                  ? eventDate.toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })
                  : 'Date not set'}
              </span>
              {event.location && (
                <span className="truncate max-w-xs">{event.location}</span>
              )}
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm">
            <Stat label="Revenue" value="$0" />
            <Stat label="Registrations" value="0" />
          </div>
          <div
            className="flex items-center gap-2"
            onClick={(e) => e.preventDefault()}
          >
            <Button
              variant="ghost"
              size="sm"
              className="rounded-full text-[#1B1A17] hover:bg-[#F0E6D6]"
              asChild
            >
              <Link href={`/events?eventId=${event.id}`}>
                Open
                <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full hover:bg-[#F0E6D6]"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/events?eventId=${event.id}`}>View</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href={`/events/details?eventId=${event.id}`}>Edit</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#8A8378] uppercase tracking-wider">{label}</p>
      <p className="font-headline font-semibold text-[#1B1A17]">{value}</p>
    </div>
  );
}

function EmptyState({
  title,
  description,
  onCreate,
  showCta = true,
}: {
  title: string;
  description: string;
  onCreate: () => void;
  showCta?: boolean;
}) {
  return (
    <div className="rounded-3xl border border-dashed border-[#E8DFD3] bg-white/50 px-8 py-16 text-center">
      <div className="mx-auto h-14 w-14 rounded-2xl bg-[#E8A355]/15 border border-[#E8A355]/20 flex items-center justify-center mb-5">
        <CalendarIcon className="h-6 w-6 text-[#D97757]" />
      </div>
      <h3 className="font-headline text-2xl font-semibold">{title}</h3>
      <p className="mt-2 text-[#55514B] max-w-md mx-auto">{description}</p>
      {showCta && (
        <Button
          onClick={onCreate}
          className="mt-6 bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-6 h-11"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create event
        </Button>
      )}
    </div>
  );
}
