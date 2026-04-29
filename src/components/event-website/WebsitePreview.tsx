'use client';

import { useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import {
  Calendar,
  Clock,
  Linkedin,
  Facebook,
  Mail,
  MapPin,
  Pencil,
  Loader2,
  Handshake,
  Mic2,
  Store,
  Gavel,
  Heart,
  Target,
  Users,
  Navigation,
} from 'lucide-react';
import type { WebsiteColors, WebsiteConfig } from '@/lib/event-website-config';
import RichTextEditor from '@/components/event-website/RichTextEditor';

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
  onDescriptionChange?: (html: string) => void;
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
  onDescriptionChange,
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
                onClick={() => setActiveTab(t.key)}
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
              <div className="mx-auto max-w-2xl">
                <p
                  className="text-xs uppercase tracking-wider mb-2"
                  style={{ color: config.colors.tabsText }}
                >
                  Description
                </p>
                {editable && onDescriptionChange ? (
                  <RichTextEditor
                    value={config.description}
                    onChange={onDescriptionChange}
                    color={config.colors.tabsText}
                  />
                ) : (
                  <div
                    className="leading-relaxed rte-body"
                    style={{ color: config.colors.tabsText }}
                    dangerouslySetInnerHTML={{
                      __html: /<\/?[a-z][\s\S]*?>/i.test(config.description)
                        ? config.description
                        : config.description
                            .split(/\n{2,}/)
                            .map((b) => `<p>${b.replace(/\n/g, '<br/>')}</p>`)
                            .join(''),
                    }}
                  />
                )}
                {config.customHtml && (
                  <div
                    className="mt-6 text-left"
                    dangerouslySetInnerHTML={{ __html: config.customHtml }}
                  />
                )}
              </div>
            )}
            {active === 'agenda' && (
              <AgendaTab colors={config.colors} />
            )}
            {active === 'sponsors' && (
              <SponsorsTab colors={config.colors} />
            )}
            {active === 'speakers' && (
              <SpeakersTab colors={config.colors} />
            )}
            {active === 'exhibitors' && (
              <ExhibitorsTab colors={config.colors} />
            )}
            {active === 'auction' && (
              <AuctionTab colors={config.colors} />
            )}
            {active === 'donate' && (
              <DonateTab colors={config.colors} />
            )}
            {active === 'venue' && (
              <VenueTab colors={config.colors} location={location} />
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

function TabCard({
  colors,
  title,
  children,
}: {
  colors: WebsiteColors;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-black/10 bg-white p-4 space-y-2">
      <h4 className="text-sm font-semibold" style={{ color: colors.accent }}>
        {title}
      </h4>
      <div className="text-sm" style={{ color: colors.tabsText }}>
        {children}
      </div>
    </div>
  );
}

function AgendaTab({ colors }: { colors: WebsiteColors }) {
  const items = [
    { time: '9:00 AM', title: 'Registration & Welcome Coffee' },
    { time: '10:00 AM', title: 'Opening Keynote' },
    { time: '12:00 PM', title: 'Networking Lunch' },
    { time: '2:00 PM', title: 'Breakout Sessions' },
    { time: '5:00 PM', title: 'Closing Remarks' },
  ];
  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
        Agenda
      </h3>
      <div className="divide-y divide-black/10 rounded-xl border border-black/10 bg-white">
        {items.map((it) => (
          <div key={it.time} className="flex items-center gap-4 px-4 py-3">
            <span className="w-20 text-sm font-medium" style={{ color: colors.accent }}>
              {it.time}
            </span>
            <span className="text-sm" style={{ color: colors.tabsText }}>
              {it.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function SponsorsTab({ colors }: { colors: WebsiteColors }) {
  const tiers = [
    { tier: 'Platinum', count: 2 },
    { tier: 'Gold', count: 4 },
    { tier: 'Silver', count: 6 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Handshake className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Our Sponsors
        </h3>
      </div>
      {tiers.map(({ tier, count }) => (
        <div key={tier} className="space-y-2">
          <p className="text-xs uppercase tracking-wider" style={{ color: colors.accent }}>
            {tier}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {Array.from({ length: count }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-lg border border-black/10 bg-white flex items-center justify-center text-xs"
                style={{ color: colors.tabsText }}
              >
                Logo
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function SpeakersTab({ colors }: { colors: WebsiteColors }) {
  const speakers = [
    { name: 'Alex Morgan', role: 'CEO, Northwind' },
    { name: 'Jordan Lee', role: 'Head of Design, Pixel Co.' },
    { name: 'Sam Patel', role: 'VP Engineering, Acme' },
    { name: 'Riley Chen', role: 'Founder, Studio Nine' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Mic2 className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Speakers
        </h3>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {speakers.map((s) => (
          <div key={s.name} className="text-center space-y-2">
            <div
              className="aspect-square rounded-full border border-black/10 bg-white flex items-center justify-center"
              style={{ color: colors.tabsText }}
            >
              <Users className="h-7 w-7 opacity-60" />
            </div>
            <p className="text-sm font-medium" style={{ color: colors.eventName }}>
              {s.name}
            </p>
            <p className="text-xs" style={{ color: colors.tabsText }}>
              {s.role}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExhibitorsTab({ colors }: { colors: WebsiteColors }) {
  const booths = Array.from({ length: 6 }).map((_, i) => ({
    booth: `Booth ${i + 1}`,
    name: ['Northwind', 'Pixel Co.', 'Acme', 'Studio Nine', 'Lumen', 'Vertex'][i],
  }));
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Store className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Exhibitors
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {booths.map((b) => (
          <div
            key={b.booth}
            className="rounded-xl border border-black/10 bg-white p-4 flex items-center justify-between"
          >
            <div>
              <p className="text-sm font-medium" style={{ color: colors.eventName }}>
                {b.name}
              </p>
              <p className="text-xs" style={{ color: colors.tabsText }}>
                {b.booth}
              </p>
            </div>
            <span
              className="text-xs rounded-full px-2.5 py-1"
              style={{ backgroundColor: `${colors.accent}1A`, color: colors.accent }}
            >
              Visit
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuctionTab({ colors }: { colors: WebsiteColors }) {
  const items = [
    { title: 'Signed Art Print', bid: '$220' },
    { title: 'Weekend Getaway', bid: '$1,450' },
    { title: 'Dinner For Two', bid: '$180' },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Gavel className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Silent Auction
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl border border-black/10 bg-white overflow-hidden">
            <div
              className="aspect-[4/3]"
              style={{ backgroundColor: `${colors.accent}14` }}
            />
            <div className="p-3 space-y-1">
              <p className="text-sm font-medium" style={{ color: colors.eventName }}>
                {it.title}
              </p>
              <p className="text-xs" style={{ color: colors.tabsText }}>
                Current bid: <span style={{ color: colors.accent }}>{it.bid}</span>
              </p>
              <button
                className="w-full mt-2 h-8 rounded-full text-xs font-semibold text-white"
                style={{ backgroundColor: colors.accent }}
              >
                Place Bid
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DonateTab({ colors }: { colors: WebsiteColors }) {
  const amounts = ['$5', '$15', '$30', '$50'];
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Heart className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Donate
        </h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <TabCard colors={colors} title="How To Donate">
          Submit your donation here or text your donation to [account activation required] with the word &apos;Donate&apos; + the amount. ex. Donate100
        </TabCard>
        <TabCard colors={colors} title="Donation Goal">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" style={{ color: colors.accent }} />
            <span className="font-semibold" style={{ color: colors.eventName }}>
              $0 Donated
            </span>
          </div>
          <p className="text-xs mt-1">Raised by 0 people</p>
        </TabCard>
        <TabCard colors={colors} title="0 Donors">
          <p className="text-xs">Be the first to contribute.</p>
        </TabCard>
      </div>

      <div className="rounded-xl border border-black/10 bg-white p-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {amounts.map((a, i) => (
            <button
              key={a}
              className="h-10 rounded-lg text-sm font-medium border"
              style={{
                backgroundColor: i === 0 ? colors.accent : 'white',
                color: i === 0 ? 'white' : colors.tabsText,
                borderColor: i === 0 ? colors.accent : 'rgba(0,0,0,0.1)',
              }}
            >
              {a}
            </button>
          ))}
        </div>
        <div
          className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 h-10"
          style={{ color: colors.tabsText }}
        >
          <span className="text-sm">$</span>
          <input
            defaultValue="5"
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
        </div>
        <p className="text-xs" style={{ color: colors.tabsText }}>
          You will be charged $5.00.
        </p>
        <button
          className="w-full h-11 rounded-full text-sm font-semibold text-white"
          style={{ backgroundColor: colors.accent }}
        >
          Donate
        </button>
      </div>
    </div>
  );
}

function VenueTab({
  colors,
  location,
}: {
  colors: WebsiteColors;
  location: string | null;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Navigation className="h-5 w-5" style={{ color: colors.accent }} />
        <h3 className="font-semibold text-lg" style={{ color: colors.eventName }}>
          Venue Map
        </h3>
      </div>
      <div
        className="aspect-[16/9] rounded-xl border border-black/10 flex items-center justify-center"
        style={{ backgroundColor: `${colors.accent}0F`, color: colors.tabsText }}
      >
        <div className="text-center space-y-1">
          <MapPin className="h-7 w-7 mx-auto opacity-60" />
          <p className="text-sm">{location || 'Venue location coming soon.'}</p>
        </div>
      </div>
    </div>
  );
}