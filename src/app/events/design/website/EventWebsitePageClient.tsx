'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowUpRight,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  GripVertical,
  Image as ImageIcon,
  Loader2,
  Save,
} from 'lucide-react';
import EventLayoutClient from '@/app/events/EventLayoutClient';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import {
  DEFAULT_WEBSITE_CONFIG,
  mergeWebsiteConfig,
  type NavTab,
  type RegistrationFlow,
  type WebsiteColors,
  type WebsiteConfig,
  type WebsiteTemplate,
} from '@/lib/event-website-config';
import WebsitePreview from '@/components/event-website/WebsitePreview';

interface EventRow {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  start_date: string | null;
  end_date: string | null;
  slug: string | null;
  website_config: Partial<WebsiteConfig> | null;
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

const TEMPLATES: { key: WebsiteTemplate; label: string; blurb: string }[] = [
  { key: 'theme-a', label: 'Theme A', blurb: 'Split hero, warm cream surfaces.' },
  { key: 'theme-b', label: 'Theme B', blurb: 'Full-width hero, center stage.' },
  { key: 'theme-c', label: 'Theme C', blurb: 'Overlay card on banner.' },
];

type SectionKey = 'general' | 'registration' | 'colors' | 'preferences';

export default function EventWebsitePageClient() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId') ?? '';
  const { toast } = useToast();

  const [event, setEvent] = useState<EventRow | null>(null);
  const [config, setConfig] = useState<WebsiteConfig>(DEFAULT_WEBSITE_CONFIG);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);
  const [openSection, setOpenSection] = useState<SectionKey>('general');
  const [tab, setTab] = useState<'basic' | 'settings'>('basic');
  const [uploadingKind, setUploadingKind] = useState<'banner' | 'card' | null>(null);

  async function handleUploadImage(kind: 'banner' | 'card', file: File) {
    try {
      const { data: authData } = await supabase.auth.getUser();
      const userId = authData.user?.id;
      if (!userId) {
        toast({
          variant: 'destructive',
          title: 'Sign in required',
          description: 'You must be signed in to upload images.',
        });
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast({
          variant: 'destructive',
          title: 'Unsupported file',
          description: 'Please choose an image file.',
        });
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        toast({
          variant: 'destructive',
          title: 'File too large',
          description: 'Image must be under 8 MB.',
        });
        return;
      }
      setUploadingKind(kind);
      const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
      const path = `${userId}/${eventId}/${kind}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('event-assets')
        .upload(path, file, { cacheControl: '3600', upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: pub } = supabase.storage.from('event-assets').getPublicUrl(path);
      const url = pub.publicUrl;
      setConfig((prev) => ({
        ...prev,
        bannerImageUrl: kind === 'banner' ? url : prev.bannerImageUrl,
        cardImageUrl: kind === 'card' ? url : prev.cardImageUrl,
      }));
      toast({ title: 'Image uploaded', description: 'Remember to save your changes.' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed.';
      toast({ variant: 'destructive', title: 'Upload failed', description: message });
    } finally {
      setUploadingKind(null);
    }
  }

  useEffect(() => {
    if (!eventId) return;
    (async () => {
      const { data } = await supabase
        .from('events')
        .select(
          'id, name, description, location, start_date, end_date, slug, website_config'
        )
        .eq('id', eventId)
        .maybeSingle();
      if (data) {
        setEvent(data as EventRow);
        setName(data.name ?? '');
        setSlug(data.slug ?? slugify(data.name ?? 'event'));
        const merged = mergeWebsiteConfig(data.website_config as Partial<WebsiteConfig>);
        if (!merged.organizerName && data.name) merged.organizerName = `${data.name} Organizer`;
        if (!merged.footerNote && data.name)
          merged.footerNote = `Organizer of ${data.name}`;
        if (!data.website_config || !Object.keys(data.website_config).length) {
          merged.description = data.description || merged.description;
        }
        setConfig(merged);
      }
      setLoading(false);
    })();
  }, [eventId]);

  const previewPath = slug ? `/preview/${slug}` : '';
  const previewUrl = useMemo(() => {
    if (typeof window === 'undefined' || !slug) return previewPath;
    return `${window.location.origin}${previewPath}`;
  }, [previewPath, slug]);

  function updateConfig<K extends keyof WebsiteConfig>(key: K, value: WebsiteConfig[K]) {
    setConfig((prev) => ({ ...prev, [key]: value }));
  }

  function updateColor<K extends keyof WebsiteColors>(key: K, value: string) {
    setConfig((prev) => ({ ...prev, colors: { ...prev.colors, [key]: value } }));
  }

  function toggleTab(key: string) {
    setConfig((prev) => ({
      ...prev,
      navTabs: prev.navTabs.map((t) =>
        t.key === key ? { ...t, enabled: !t.enabled } : t
      ),
    }));
  }

  function renameTab(key: string, label: string) {
    setConfig((prev) => ({
      ...prev,
      navTabs: prev.navTabs.map((t) => (t.key === key ? { ...t, label } : t)),
    }));
  }

  function moveTab(index: number, direction: -1 | 1) {
    setConfig((prev) => {
      const next = [...prev.navTabs];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return { ...prev, navTabs: next };
    });
  }

  async function handleSave() {
    if (!event) return;
    const cleanSlug = slugify(slug || name);
    if (!cleanSlug) {
      toast({
        variant: 'destructive',
        title: 'URL required',
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
          description: 'Try a slightly different URL.',
        });
        setSaving(false);
        return;
      }

      const { error } = await supabase
        .from('events')
        .update({
          name,
          slug: cleanSlug,
          description: config.description,
          website_config: config,
        })
        .eq('id', event.id);
      if (error) throw error;

      setSlug(cleanSlug);
      toast({ title: 'Website saved', description: 'Your changes are live.' });
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
      <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17] flex flex-col">
        <header className="border-b border-[#E8DFD3] bg-white/60 backdrop-blur">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-[#1B1A17] text-[#E8A355] flex items-center justify-center">
                <ImageIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-headline text-lg font-bold leading-none">
                  Event Website
                </p>
                <p className="text-xs text-[#8A8378] mt-0.5">
                  Design the page your attendees visit.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] px-5 h-10 text-sm font-medium transition-colors disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save
              </button>
              {previewPath && (
                <Link
                  href={previewPath}
                  target="_blank"
                  className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-white hover:bg-[#F0E6D6] px-5 h-10 text-sm font-medium text-[#1B1A17] transition-colors"
                >
                  View website
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>
          </div>
          <div className="px-4 sm:px-6 lg:px-8 flex gap-6 text-sm border-t border-[#E8DFD3]">
            <TabButton active={tab === 'basic'} onClick={() => setTab('basic')}>
              Basic Website
            </TabButton>
            <TabButton active={tab === 'settings'} onClick={() => setTab('settings')}>
              Settings
            </TabButton>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-[#55514B]" />
          </div>
        ) : (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-[360px,1fr] min-h-0">
            <aside className="border-r border-[#E8DFD3] bg-white/50 overflow-y-auto">
              {tab === 'basic' ? (
                <div className="p-4 space-y-3">
                  <Section
                    title="General"
                    open={openSection === 'general'}
                    onToggle={() =>
                      setOpenSection(openSection === 'general' ? 'preferences' : 'general')
                    }
                  >
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-[#8A8378] mb-2">Template</p>
                        <div className="grid gap-2">
                          {TEMPLATES.map((t) => (
                            <button
                              key={t.key}
                              onClick={() => updateConfig('template', t.key)}
                              className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                                config.template === t.key
                                  ? 'border-[#D97757] bg-[#F0E6D6]'
                                  : 'border-[#E8DFD3] bg-white hover:bg-[#F0E6D6]/60'
                              }`}
                            >
                              <div>
                                <p className="text-sm font-medium">{t.label}</p>
                                <p className="text-xs text-[#8A8378]">{t.blurb}</p>
                              </div>
                              {config.template === t.key && (
                                <Check className="h-4 w-4 text-[#D97757]" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      <Field label="Event name">
                        <input
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (!event?.slug) setSlug(slugify(e.target.value));
                          }}
                          className="input-field"
                        />
                      </Field>

                      <Field label="Tagline">
                        <input
                          value={config.tagline}
                          onChange={(e) => updateConfig('tagline', e.target.value)}
                          placeholder="Add a short tagline for your event"
                          className="input-field"
                        />
                      </Field>

                      <Field label="Banner image URL">
                        <input
                          value={config.bannerImageUrl}
                          onChange={(e) => updateConfig('bannerImageUrl', e.target.value)}
                          className="input-field"
                        />
                      </Field>

                      <Field label="Card image URL">
                        <input
                          value={config.cardImageUrl}
                          onChange={(e) => updateConfig('cardImageUrl', e.target.value)}
                          className="input-field"
                        />
                      </Field>

                      <div>
                        <p className="text-xs text-[#8A8378] mb-2">Navigation tabs</p>
                        <div className="space-y-1.5">
                          {config.navTabs.map((navTab, idx) => (
                            <TabRow
                              key={navTab.key}
                              tab={navTab}
                              onToggle={() => toggleTab(navTab.key)}
                              onRename={(label) => renameTab(navTab.key, label)}
                              onUp={() => moveTab(idx, -1)}
                              onDown={() => moveTab(idx, 1)}
                              canUp={idx > 0}
                              canDown={idx < config.navTabs.length - 1}
                            />
                          ))}
                        </div>
                      </div>

                      <Field label="Description">
                        <textarea
                          rows={5}
                          value={config.description}
                          onChange={(e) => updateConfig('description', e.target.value)}
                          className="input-field resize-none"
                        />
                      </Field>

                      <Field label="Custom HTML">
                        <textarea
                          rows={3}
                          value={config.customHtml}
                          onChange={(e) => updateConfig('customHtml', e.target.value)}
                          placeholder="Add custom HTML, embeds, or iframes."
                          className="input-field resize-none font-mono text-xs"
                        />
                      </Field>
                    </div>
                  </Section>

                  <Section
                    title="Registration Form"
                    open={openSection === 'registration'}
                    onToggle={() =>
                      setOpenSection(openSection === 'registration' ? 'general' : 'registration')
                    }
                  >
                    <div className="grid grid-cols-1 gap-2">
                      {(
                        [
                          {
                            key: 'new-page',
                            label: 'New Page (Default)',
                            blurb: "Registration opens on a new page when the user clicks 'Register Now'.",
                          },
                          {
                            key: 'embedded',
                            label: 'Embedded',
                            blurb: 'Show the registration form inline on the right side.',
                          },
                        ] as { key: RegistrationFlow; label: string; blurb: string }[]
                      ).map((opt) => (
                        <button
                          key={opt.key}
                          onClick={() => updateConfig('registrationFlow', opt.key)}
                          className={`rounded-xl border p-3 text-left transition-colors ${
                            config.registrationFlow === opt.key
                              ? 'border-[#D97757] bg-[#F0E6D6]'
                              : 'border-[#E8DFD3] bg-white hover:bg-[#F0E6D6]/60'
                          }`}
                        >
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-[#8A8378] mt-1">{opt.blurb}</p>
                        </button>
                      ))}
                    </div>
                  </Section>

                  <Section
                    title="Colors"
                    open={openSection === 'colors'}
                    onToggle={() =>
                      setOpenSection(openSection === 'colors' ? 'general' : 'colors')
                    }
                  >
                    <div className="space-y-3">
                      <ColorRow
                        label="Page background"
                        value={config.colors.pageBackground}
                        onChange={(v) => updateColor('pageBackground', v)}
                      />
                      <ColorRow
                        label="Event name"
                        value={config.colors.eventName}
                        onChange={(v) => updateColor('eventName', v)}
                      />
                      <ColorRow
                        label="Tabs text"
                        value={config.colors.tabsText}
                        onChange={(v) => updateColor('tabsText', v)}
                      />
                      <ColorRow
                        label="Selected tab text"
                        value={config.colors.selectedTab}
                        onChange={(v) => updateColor('selectedTab', v)}
                      />
                      <ColorRow
                        label="Accent / buttons"
                        value={config.colors.accent}
                        onChange={(v) => updateColor('accent', v)}
                      />
                      <ColorRow
                        label="Hero background"
                        value={config.colors.heroBackground}
                        onChange={(v) => updateColor('heroBackground', v)}
                      />
                      <ColorRow
                        label="Hero text"
                        value={config.colors.heroText}
                        onChange={(v) => updateColor('heroText', v)}
                      />
                    </div>
                  </Section>

                  <Section
                    title="Preferences"
                    open={openSection === 'preferences'}
                    onToggle={() =>
                      setOpenSection(openSection === 'preferences' ? 'general' : 'preferences')
                    }
                  >
                    <div className="space-y-4">
                      <Field label="Organizer name">
                        <input
                          value={config.organizerName}
                          onChange={(e) => updateConfig('organizerName', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                      <Field label="Footer note">
                        <input
                          value={config.footerNote}
                          onChange={(e) => updateConfig('footerNote', e.target.value)}
                          className="input-field"
                        />
                      </Field>
                    </div>
                  </Section>
                </div>
              ) : (
                <div className="p-4 space-y-4">
                  <Section title="URL" open onToggle={() => {}}>
                    <Field label="Page URL">
                      <div className="flex items-stretch rounded-xl border border-[#E8DFD3] bg-white overflow-hidden">
                        <span className="flex items-center px-3 text-xs text-[#8A8378] border-r border-[#E8DFD3]">
                          /preview/
                        </span>
                        <input
                          value={slug}
                          onChange={(e) => setSlug(slugify(e.target.value))}
                          className="flex-1 bg-transparent px-3 py-2 text-sm focus:outline-none"
                        />
                      </div>
                    </Field>
                    <div className="rounded-xl border border-[#E8DFD3] bg-white p-3 text-sm space-y-2">
                      <p className="text-xs text-[#8A8378] uppercase tracking-wider">
                        Live URL
                      </p>
                      <p className="break-all font-mono text-[13px]">{previewUrl || '—'}</p>
                      <button
                        onClick={copyLink}
                        disabled={!previewUrl}
                        className="inline-flex items-center gap-1.5 text-xs rounded-full border border-[#E8DFD3] bg-[#FAF6F1] hover:bg-[#F0E6D6] px-3 h-8 font-medium"
                      >
                        {copied ? (
                          <>
                            <Check className="h-3 w-3 text-[#2F6F4E]" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy link
                          </>
                        )}
                      </button>
                    </div>
                  </Section>
                </div>
              )}
            </aside>

            <main className="overflow-y-auto bg-[#F5EEE2]">
              <div className="px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-xs text-[#8A8378] uppercase tracking-wider">
                    Live preview
                  </p>
                  {previewPath && (
                    <Link
                      href={previewPath}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs text-[#1B1A17] hover:text-[#D97757]"
                    >
                      Open in new tab
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </Link>
                  )}
                </div>
                <div className="rounded-2xl overflow-hidden border border-[#E8DFD3] shadow-sm bg-white">
                  <WebsitePreview
                    eventName={name}
                    eventStart={event?.start_date ? new Date(event.start_date) : null}
                    eventEnd={event?.end_date ? new Date(event.end_date) : null}
                    location={event?.location ?? null}
                    config={config}
                    interactive={false}
                    editable
                    uploadingKind={uploadingKind}
                    onUploadImage={handleUploadImage}
                  />
                </div>
              </div>
            </main>
          </div>
        )}
      </div>

      <style jsx global>{`
        .input-field {
          width: 100%;
          border: 1px solid #e8dfd3;
          background: #ffffff;
          border-radius: 12px;
          padding: 8px 12px;
          font-size: 13px;
          color: #1b1a17;
          outline: none;
        }
        .input-field:focus {
          border-color: #d97757;
          box-shadow: 0 0 0 3px rgba(217, 119, 87, 0.15);
        }
      `}</style>
    </EventLayoutClient>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`relative py-3 font-medium transition-colors ${
        active ? 'text-[#D97757]' : 'text-[#55514B] hover:text-[#1B1A17]'
      }`}
    >
      {children}
      {active && (
        <span className="absolute -bottom-px left-0 right-0 h-0.5 bg-[#D97757] rounded-full" />
      )}
    </button>
  );
}

function Section({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#E8DFD3] bg-white">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="text-sm font-semibold text-[#1B1A17]">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#8A8378] transition-transform ${
            open ? '' : '-rotate-90'
          }`}
        />
      </button>
      {open && <div className="px-4 pb-4 pt-1">{children}</div>}
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs text-[#8A8378]">{label}</span>
      {children}
    </label>
  );
}

function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-[#1B1A17]">{label}</span>
      <div className="flex items-center gap-2 rounded-lg border border-[#E8DFD3] bg-white pl-2 pr-1 h-8">
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-20 bg-transparent text-xs font-mono focus:outline-none"
        />
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-6 w-6 rounded border border-[#E8DFD3] cursor-pointer"
        />
      </div>
    </div>
  );
}

function TabRow({
  tab,
  onToggle,
  onRename,
  onUp,
  onDown,
  canUp,
  canDown,
}: {
  tab: NavTab;
  onToggle: () => void;
  onRename: (label: string) => void;
  onUp: () => void;
  onDown: () => void;
  canUp: boolean;
  canDown: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-[#E8DFD3] bg-white px-2 py-1.5">
      <div className="flex flex-col text-[#8A8378]">
        <button
          onClick={onUp}
          disabled={!canUp}
          className="disabled:opacity-30 hover:text-[#1B1A17] text-[10px] leading-none"
          aria-label="Move up"
        >
          ▲
        </button>
        <button
          onClick={onDown}
          disabled={!canDown}
          className="disabled:opacity-30 hover:text-[#1B1A17] text-[10px] leading-none"
          aria-label="Move down"
        >
          ▼
        </button>
      </div>
      <GripVertical className="h-3.5 w-3.5 text-[#C7BDAE]" />
      <input
        value={tab.label}
        onChange={(e) => onRename(e.target.value)}
        className="flex-1 bg-transparent text-sm focus:outline-none"
      />
      <button
        onClick={onToggle}
        className={`relative h-5 w-9 rounded-full transition-colors ${
          tab.enabled ? 'bg-[#D97757]' : 'bg-[#E8DFD3]'
        }`}
        aria-label="Toggle tab"
      >
        <span
          className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
            tab.enabled ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );
}
