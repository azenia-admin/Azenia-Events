'use client';

import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { doc } from 'firebase/firestore';
import { supabase } from '@/lib/supabase';
import { useEffect, useState } from 'react';
import { Triangle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import EventLandingHero from './EventLandingHero';
import EventLandingSidebar from './EventLandingSidebar';
import EventLandingFooter from './EventLandingFooter';

interface EventData {
  name: string;
  description?: string;
  date: { seconds: number; nanoseconds: number } | Date;
  location?: string;
}

interface TicketData {
  id: string;
  name: string;
  price: number;
  ticket_type: string;
}

export default function EventLandingPage({ eventId }: { eventId: string }) {
  const firestore = useFirestore();
  const [tickets, setTickets] = useState<TicketData[]>([]);
  const [activeTab, setActiveTab] = useState('about');

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading } = useDoc<EventData>(eventRef);

  useEffect(() => {
    async function fetchTickets() {
      const { data } = await supabase
        .from('tickets')
        .select('id, name, price, ticket_type')
        .eq('event_id', eventId);
      if (data) setTickets(data);
    }
    fetchTickets();
  }, [eventId]);

  const eventDate = event?.date
    ? event.date instanceof Date
      ? event.date
      : new Date((event.date as { seconds: number }).seconds * 1000)
    : null;

  const priceRange = tickets.length > 0
    ? tickets.every(t => t.ticket_type === 'free')
      ? 'Free'
      : (() => {
          const prices = tickets.filter(t => t.ticket_type !== 'free').map(t => t.price);
          const min = Math.min(...prices);
          const max = Math.max(...prices);
          return min === max ? `$${min}` : `$${min} - $${max}`;
        })()
    : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <h1 className="text-2xl font-semibold">Event not found</h1>
        <p className="text-muted-foreground">This event may have been removed or the link is incorrect.</p>
        <Link href="/" className="text-blue-600 hover:underline">Back to events</Link>
      </div>
    );
  }

  const tabs = ['About', 'Agenda', 'Sponsors', 'Speakers', 'Exhibitors', 'Donate'];

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b bg-white sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center">
          <Link href="/" className="flex items-center gap-2">
            <Triangle className="h-5 w-5 text-blue-600" />
            <span className="font-semibold text-sm text-gray-900">SeatingSavvy</span>
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1 min-w-0">
            <EventLandingHero eventName={event.name} />

            <nav className="flex gap-6 border-b mt-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab.toLowerCase())}
                  className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors ${
                    activeTab === tab.toLowerCase()
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>

            <div className="py-8">
              {activeTab === 'about' && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold text-center text-gray-900">
                    {event.description ? '' : 'Hello!'}
                  </h2>
                  <div className="text-center text-gray-600 leading-relaxed max-w-2xl mx-auto">
                    {event.description || (
                      <p>
                        This is a free-text area where you can add your event&apos;s description.
                        Feel free to play around with the settings to make sure the formatting
                        fits your event&apos;s branding! It is possible to add images, embed videos,
                        iframes and hyperlinks.
                      </p>
                    )}
                  </div>
                </div>
              )}
              {activeTab === 'agenda' && (
                <p className="text-center text-gray-500">Agenda coming soon.</p>
              )}
              {activeTab === 'sponsors' && (
                <p className="text-center text-gray-500">Sponsors coming soon.</p>
              )}
              {activeTab === 'speakers' && (
                <p className="text-center text-gray-500">Speakers coming soon.</p>
              )}
              {activeTab === 'exhibitors' && (
                <p className="text-center text-gray-500">Exhibitors coming soon.</p>
              )}
              {activeTab === 'donate' && (
                <p className="text-center text-gray-500">Donations coming soon.</p>
              )}
            </div>

            <div className="space-y-3 pb-8">
              <button className="w-full py-3 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm">
                Register Now
              </button>
              <p className="text-center text-sm text-gray-500">
                Already registered?{' '}
                <button className="text-blue-600 hover:underline font-medium">Sign In</button>
              </p>
            </div>

            <div className="border-t pt-8">
              <EventLandingFooter eventName={event.name} />
            </div>
          </div>

          <div className="lg:w-[340px] flex-shrink-0">
            <EventLandingSidebar
              eventName={event.name}
              eventDate={eventDate}
              location={event.location}
              priceRange={priceRange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
