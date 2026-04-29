'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  Copy,
  Globe,
  Loader2,
  RefreshCw,
  Save,
} from 'lucide-react';
import EventLayoutClient from '@/app/events/EventLayoutClient';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface EventRow {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  slug: string | null;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

export default function EventWebsitePageClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') ?? '';
  const { toast } = useToast();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select('id, name, description, location, start_date, slug')
        .eq('id', eventId)
        .maybeSingle();
      if (data) {
        setEvent(data);
        setName(data.name ?? '');
        setDescription(data.description ?? '');
        setLocation(data.location ?? '');
        setSlug(data.slug ?? slugify(data.name ?? 'event'));
      }
      setLoading(false);
    })();
  }, [eventId]);

  const previewPath = slug ? `/preview/${slug}` : '';
  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined' || !slug) return previewPath;
    return `${window.location.origin}${previewPath}`;
  }, [previewPath, slug]);

  async function handleSave() {
    if (!event) return;
    const cleanSlug = slugify(slug || name);
    if (!cleanSlug) {
      toast({
        variant: 'destructive',
        title: 'Slug required',
        description: 'Please provide a valid URL for your event website.',
      });
      return;
    }
    setSaving(true);
    try {
      const { data: clash } = await supabase
        .from('events')
        .select('id')
        .eq('slug', cleanSlug)
        .neq('id', event.id)
        .maybeSingle();

      if (clash) {
        toast({
          variant: 'destructive',
          title: 'URL already taken',
          description: 'Try a slightly different name.',
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('events')
        .update({
          name,
          description,
          location,
          slug: cleanSlug,
        })
        .eq('id', event.id);

      if (error) throw error;

      setSlug(cleanSlug);
      toast({ title: 'Website updated', description: 'Your changes are live.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Could not save changes.';
      toast({ variant: 'destructive', title: 'Save failed', description: message });
    } finally {
      setSaving(false);
    }
  }

  async function copyLink() {
    if (!previewUrl) return;
    await navigator.clipboard.writeText(previewUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  if (!eventId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
        <p className="text-[#55514B]">No event ID provided.</p>
      </div>
    );
  }

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17]">
        <section className="border-b border-[#E8DFD3]">
          <div className="px-4 sm:px-6 lg:px-10 py-10">
            <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-3">
              Event website
            </p>
            <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.05]">
              Your event,{' '}
              <span className="italic text-[#D97757]">online.</span>
            </h1>
            <p className="mt-4 text-[#55514B] text-lg leading-relaxed max-w-2xl">
              Publish a beautiful landing page at a clean URL. Edit the essentials here &mdash;
              deeper customization lives in Visuals and Layout.
            </p>
          </div>
        </section>

        <section className="px-4 sm:px-6 lg:px-10 py-10">
          {loading ? (
            <div className="flex items-center gap-2 text-[#55514B]">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading event...
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr,380px] gap-8">
              <div className="space-y-6">
                <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6 lg:p-8">
                  <div className="flex items-center gap-2 mb-5">
                    <Globe className="h-4 w-4 text-[#D97757]" />
                    <h2 className="font-headline text-xl font-bold">Website details</h2>
                  </div>

                  <div className="space-y-5">
                    <div className="space-y-2">
                      <Label className="text-[#1B1A17] font-medium">Event name</Label>
                      <Input
                        value={name}
                        onChange={(e) => {
                          const next = e.target.value;
                          setName(next);
                          if (!event?.slug) setSlug(slugify(next));
                        }}
                        className="bg-white border-[#E8DFD3] rounded-xl focus-visible:ring-[#D97757]/30 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1B1A17] font-medium">Description</Label>
                      <Textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Tell attendees what to expect."
                        className="bg-white border-[#E8DFD3] rounded-xl min-h-[120px] resize-none focus-visible:ring-[#D97757]/30 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1B1A17] font-medium">Location</Label>
                      <Input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="bg-white border-[#E8DFD3] rounded-xl focus-visible:ring-[#D97757]/30 focus-visible:ring-offset-0"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[#1B1A17] font-medium">Page URL</Label>
                      <div className="flex items-stretch rounded-xl border border-[#E8DFD3] bg-[#FAF6F1] overflow-hidden focus-within:ring-2 focus-within:ring-[#D97757]/30">
                        <span className="flex items-center px-3 text-sm text-[#8A8378] border-r border-[#E8DFD3]">
                          /preview/
                        </span>
                        <input
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none text-[#1B1A17]"
                          placeholder="your-event"
                        />
                        <button
                          type="button"
                          onClick={() => setSlug(slugify(name))}
                          className="flex items-center gap-1 px-3 text-xs text-[#55514B] hover:text-[#1B1A17] border-l border-[#E8DFD3]"
                          title="Regenerate from name"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-[#8A8378]">
                        Lowercase letters, numbers, and dashes only.
                      </p>
                    </div>

                    <div className="pt-2 flex items-center gap-3">
                      <button
                        onClick={handleSave}
                        disabled={saving}
                        className="inline-flex items-center gap-2 rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] px-6 h-11 text-sm font-medium transition-colors disabled:opacity-60"
                      >
                        {saving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Save className="h-4 w-4" />
                        )}
                        Save changes
                      </button>
                      {previewPath && (
                        <Link
                          href={previewPath}
                          target="_blank"
                          className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-white hover:bg-[#F0E6D6] px-6 h-11 text-sm font-medium text-[#1B1A17] transition-colors"
                        >
                          Open preview
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <aside className="space-y-4">
                <div className="rounded-3xl border border-[#E8DFD3] bg-white p-6">
                  <p className="text-[#D97757] text-xs font-medium tracking-wider uppercase mb-2">
                    Live URL
                  </p>
                  <p className="font-headline text-lg font-semibold break-all">
                    {previewUrl || '—'}
                  </p>
                  <button
                    onClick={copyLink}
                    disabled={!previewUrl}
                    className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-[#FAF6F1] hover:bg-[#F0E6D6] px-4 h-9 text-sm font-medium text-[#1B1A17] transition-colors disabled:opacity-60"
                  >
                    {copied ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-[#2F6F4E]" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5" />
                        Copy link
                      </>
                    )}
                  </button>
                </div>

                <div className="rounded-3xl border border-[#E8DFD3] bg-[#F0E6D6]/60 p-6">
                  <p className="text-sm text-[#55514B] leading-relaxed">
                    Your website updates instantly when you save. Share the link anywhere &mdash;
                    email, social, or embed it on your main site.
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>
    </EventLayoutClient>
  );
}
