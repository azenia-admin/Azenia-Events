'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import WebsitePreview from '@/components/event-website/WebsitePreview';
import { mergeWebsiteConfig, type WebsiteConfig } from '@/lib/event-website-config';

interface LoadedEvent {
  id: string;
  name: string;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  website_config: Partial<WebsiteConfig> | null;
}

export default function PreviewClient({ slug }: { slug: string }) {
  const [state, setState] = useState<
    { status: 'loading' } | { status: 'found'; event: LoadedEvent } | { status: 'missing' }
  >({ status: 'loading' });

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, name, location, start_date, end_date, website_config')
        .eq('slug', slug)
        .maybeSingle();
      if (data?.id) setState({ status: 'found', event: data as LoadedEvent });
      else setState({ status: 'missing' });
    })();
  }, [slug]);

  if (state.status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <Loader2 className="h-6 w-6 animate-spin text-[#55514B]" />
      </div>
    );
  }

  if (state.status === 'missing') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <div className="text-center space-y-3">
          <h1 className="font-headline text-3xl font-bold text-[#1B1A17]">
            Event not found
          </h1>
          <p className="text-[#55514B]">
            We couldn&apos;t find an event at <code>/preview/{slug}</code>.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] px-5 h-11 text-sm font-medium"
          >
            Back to events
          </Link>
        </div>
      </div>
    );
  }

  const { event } = state;
  const config = mergeWebsiteConfig(event.website_config);

  return (
    <div className="min-h-screen" style={{ background: config.colors.pageBackground }}>
      <WebsitePreview
        eventName={event.name}
        eventStart={event.start_date ? new Date(event.start_date) : null}
        eventEnd={event.end_date ? new Date(event.end_date) : null}
        location={event.location}
        config={config}
        interactive
        onRegister={() => {
          window.location.href = `/events/registration/tickets?eventId=${event.id}`;
        }}
      />
    </div>
  );
}
