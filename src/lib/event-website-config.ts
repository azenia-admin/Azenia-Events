export type NavTabKey =
  | 'about'
  | 'agenda'
  | 'sponsors'
  | 'speakers'
  | 'exhibitors'
  | 'auction'
  | 'donate'
  | 'venue';

export interface NavTab {
  key: NavTabKey;
  label: string;
  enabled: boolean;
}

export type WebsiteTemplate = 'theme-a' | 'theme-b' | 'theme-c';
export type RegistrationFlow = 'new-page' | 'embedded';

export interface WebsiteColors {
  pageBackground: string;
  eventName: string;
  tabsText: string;
  selectedTab: string;
  accent: string;
  heroBackground: string;
  heroText: string;
}

export interface WebsiteConfig {
  template: WebsiteTemplate;
  tagline: string;
  description: string;
  bannerImageUrl: string;
  cardImageUrl: string;
  organizerName: string;
  footerNote: string;
  customHtml: string;
  registrationFlow: RegistrationFlow;
  navTabs: NavTab[];
  colors: WebsiteColors;
}

export const DEFAULT_NAV_TABS: NavTab[] = [
  { key: 'about', label: 'About', enabled: true },
  { key: 'agenda', label: 'Agenda', enabled: true },
  { key: 'sponsors', label: 'Sponsors', enabled: true },
  { key: 'speakers', label: 'Speakers', enabled: true },
  { key: 'exhibitors', label: 'Exhibitors', enabled: true },
  { key: 'auction', label: 'Auction', enabled: false },
  { key: 'donate', label: 'Donate', enabled: false },
  { key: 'venue', label: 'Venue Map', enabled: false },
];

export const DEFAULT_WEBSITE_CONFIG: WebsiteConfig = {
  template: 'theme-c',
  tagline: '',
  description:
    "Hello! This is a free-text area where you can add your event's description. Feel free to play around with the settings to make sure the formatting fits your event's branding! It is possible to add images, embed videos, iframes and hyperlinks.",
  bannerImageUrl:
    'https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1600',
  cardImageUrl:
    'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=900',
  organizerName: '',
  footerNote: '',
  customHtml: '',
  registrationFlow: 'new-page',
  navTabs: DEFAULT_NAV_TABS,
  colors: {
    pageBackground: '#FAF6F1',
    eventName: '#1B1A17',
    tabsText: '#55514B',
    selectedTab: '#D97757',
    accent: '#D97757',
    heroBackground: '#1B1A17',
    heroText: '#FAF6F1',
  },
};

export function mergeWebsiteConfig(
  raw: Partial<WebsiteConfig> | null | undefined
): WebsiteConfig {
  if (!raw) return DEFAULT_WEBSITE_CONFIG;
  const tabsByKey = new Map(DEFAULT_NAV_TABS.map((t) => [t.key, t]));
  const navTabs = Array.isArray(raw.navTabs) && raw.navTabs.length
    ? raw.navTabs
        .filter((t): t is NavTab => !!t && typeof t === 'object' && 'key' in t)
        .map((t) => ({
          ...(tabsByKey.get(t.key as NavTabKey) ?? { key: t.key, label: t.label, enabled: true }),
          ...t,
        }))
    : DEFAULT_NAV_TABS;

  return {
    ...DEFAULT_WEBSITE_CONFIG,
    ...raw,
    colors: { ...DEFAULT_WEBSITE_CONFIG.colors, ...(raw.colors ?? {}) },
    navTabs,
  };
}
