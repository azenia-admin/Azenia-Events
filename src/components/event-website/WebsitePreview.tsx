'use client';

import { useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Clock, Linkedin, Facebook, Mail, MapPin, Pencil, Loader2 } from 'lucide-react';
import type { WebsiteConfig } from '@/lib/event-website-config';

interface WebsitePreviewProps {
  eventName: string;
  eventStart: Date | null;
  eventEnd: Date | null;
  location: string | null;
  config: WebsiteConfig;
  interactive?: boolean;
  onRegister?: () => void;
  editable?: boolean;
  onUploadImage?: (kind: 'banner' | 'card', file: File) => Promise<void>;
  uploadingKind?: 'banner' | 'card' | null;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function WebsitePreview({
  eventName,
  eventStart,
  eventEnd,
  location,
  config,
  interactive = true,
  onRegister,
  editable = false,
  onUploadImage,
  uploadingKind = null,
}: WebsitePreviewProps) {
  const bannerInputRef = useRef<HTMLInputElement | null>(null);
  const cardInputRef = useRef<HTMLInputElement | null>(null);
  const tabs = useMemo(() => config.navTabs.filter((t) => t.enabled), [config.navTabs]);
  const [activeTab, setActiveTab] = useState<string>(tabs[0]?.key ?? 'about');
  const active = tabs.find((t) => t.key === activeTab) ? activeTab : tabs[0]?.key;

  const dateLine = eventStart
    ? eventEnd
      ? `${format(eventStart, 'EEE, MMM d')} – ${format(eventEnd, 'EEE, MMM d')}`
      : format(eventStart, 'EEE, MMM d')
    : '';

  const timeLine = eventStart
    ? `${format(eventStart, 'h:mm a')}${eventEnd ? ' – ' + format(eventEnd, 'h:mm a') : ''}`
    : '';

  const handleShare = (platform: string) => {
    if (!interactive || typeof window === 'undefined') return;
    const url = window.location.href;
    const text = `Check out ${eventName}`;
    const urls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(eventName)}&body=${encodeURIComponent(`${text}: ${url}`)}`,
    };
    if (platform === 'email') window.location.href = urls[platform];
    else window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  return (
    <div style={{ background: config.colors.pageBackground }} className="relative">
      <section
        className="relative w-full h-[240px] md:h-[320px] overflow-hidden"
        style={{ backgroundColor: config.colors.heroBackground }}
      >
        {config.bannerImageUrl && (
          <img
            src={config.bannerImageUrl}
            alt="Event banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {editable && (
          <>
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              disabled={uploadingKind === 'banner'}
              className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-white/95 hover:bg-white text-[#1B1A17] text-xs font-medium px-3 h-8 shadow-sm border border-black/5 disabled:opacity-70"
            >
              {uploadingKind === 'banner' ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Pencil className="h-3.5 w-3.5" />
              )}
              Change Image
            </button>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (file && onUploadImage) await onUploadImage('banner', file);
                e.target.value = '';
              }}
            />
          </>
        )}
      </section>

      <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-16 md:-mt-24 relative">
        <div className="grid grid-cols-1 md:grid-cols-[1fr,340px] gap-5">
          <div
            className="relative rounded-xl overflow-hidden aspect-[16/10] md:aspect-auto md:h-[260px]"
            style={{ backgroundColor: config.colors.heroBackground }}
          >
            {config.cardImageUrl && (
              <img
                src={config.cardImageUrl}
                alt="Event"
                className="absolute inset-0 w-full h-full object-cover"
              />
            )}
            {editable && (
              <>
                <button
                  type="button"
                  onClick={() => cardInputRef.current?.click()}
                  disabled={uploadingKind === 'card'}
                  className="absolute top-3 right-3 z-10 inline-flex items-center gap-1.5 rounded-md bg-white/95 hover:bg-white text-[#1B1A17] text-xs font-medium px-3 h-8 shadow-sm border border-black/5 disabled:opacity-70"
                >
                  {uploadingKind === 'card' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Pencil className="h-3.5 w-3.5" />
                  )}
                  Change Image
                </button>
                <input
                  ref={cardInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file && onUploadImage) await onUploadImage('card', file);
                    e.target.value = '';
                  }}
                />
              </>
            )}
          </div>

          <aside className="rounded-xl bg-white border border-black/5 shadow-sm p-5 flex flex-col">
            <h3
              className="font-semibold text-lg leading-snug"
              style={{ color: config.colors.eventName }}
            >
              {eventName || 'Your event'}
            </h3>
            {config.tagline && (
              <p className="text-sm mt-1" style={{ color: config.colors.tabsText }}>
                {config.tagline}
              </p>
            )}
            <div className="mt-4 space-y-2 text-sm" style={{ color: config.colors.tabsText }}>
              {dateLine && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 opacity-70" />
                  <span>{dateLine}</span>
                </div>
              )}
              {timeLine && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 opacity-70" />
                  <span>{timeLine}</span>
                </div>
              )}
              {location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 opacity-70" />
                  <span>{location}</span>
                </div>
              )}
            </div>
            <button
              onClick={() => interactive && onRegister?.()}
              className="mt-5 w-full rounded-full h-11 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: config.colors.accent }}
            >
              Register Now
            </button>
          </aside>
        </div>

        <nav className="mt-6 flex gap-6 border-b border-black/10 overflow-x-auto">
          {tabs.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                onClick={() => interactive && setActiveTab(t.key)}
                className="pb-3 text-sm font-medium whitespace-nowrap transition-colors"
                style={{
                  color: isActive ? config.colors.selectedTab : config.colors.tabsText,
                  borderBottom: isActive
                    ? `2px solid ${config.colors.selectedTab}`
                    : '2px solid transparent',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-[1fr,280px] gap-8 py-8">
          <div>
            {active === 'about' && (
              <div
                className="text-center mx-auto max-w-2xl leading-relaxed"
                style={{ color: config.colors.tabsText }}
              >
                <p className="whitespace-pre-wrap">{config.description}</p>
                {config.customHtml && (
                  <div
                    className="mt-6 text-left"
                    dangerouslySetInnerHTML={{ __html: config.customHtml }}
                  />
                )}
              </div>
            )}
            {active !== 'about' && (
              <p
                className="text-center py-12 text-sm"
                style={{ color: config.colors.tabsText }}
              >
                Content for this tab will appear here once you add it.
              </p>
            )}
          </div>

          <aside className="space-y-6">
            <div className="rounded-xl border border-black/10 p-4 space-y-2">
              <h3
                className="text-sm font-semibold"
                style={{ color: config.colors.accent }}
              >
                Date &amp; Time
              </h3>
              {dateLine && (
                <p className="text-sm" style={{ color: config.colors.tabsText }}>
                  {dateLine}
                </p>
              )}
              {timeLine && (
                <p className="text-sm" style={{ color: config.colors.tabsText }}>
                  {timeLine}
                </p>
              )}
              {location && (
                <p className="text-sm" style={{ color: config.colors.tabsText }}>
                  {location}
                </p>
              )}
            </div>

            <div className="rounded-xl border border-black/10 p-4">
              <h3
                className="text-sm font-semibold mb-3"
                style={{ color: config.colors.accent }}
              >
                Share this event
              </h3>
              <div className="flex gap-2">
                {[
                  { key: 'linkedin', Icon: Linkedin },
                  { key: 'facebook', Icon: Facebook },
                  { key: 'x', Icon: XIcon },
                  { key: 'email', Icon: Mail },
                ].map(({ key, Icon }) => (
                  <button
                    key={key}
                    onClick={() => handleShare(key)}
                    className="w-9 h-9 rounded-full border border-black/10 flex items-center justify-center hover:bg-black/5 transition-colors"
                    style={{ color: config.colors.tabsText }}
                  >
                    <Icon className="h-4 w-4" />
                  </button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <footer className="border-t border-black/10 py-8 text-center space-y-3">
          {config.organizerName && (
            <p className="text-sm font-semibold" style={{ color: config.colors.accent }}>
              {config.organizerName}
            </p>
          )}
          {config.footerNote && (
            <p className="text-sm" style={{ color: config.colors.tabsText }}>
              {config.footerNote}
            </p>
          )}
          <div className="flex items-center justify-center gap-3 pt-2">
            <button
              className="rounded-full h-9 px-4 text-sm font-medium text-white"
              style={{ backgroundColor: config.colors.accent }}
            >
              More Events
            </button>
            <button
              className="rounded-full h-9 px-4 text-sm font-medium text-white"
              style={{ backgroundColor: config.colors.accent }}
            >
              Contact
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}