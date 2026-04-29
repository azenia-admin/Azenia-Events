import { Suspense } from 'react';
import EventWebsitePageClient from './EventWebsitePageClient';

export default function EventWebsitePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FAF6F1]">
          Loading...
        </div>
      }
    >
      <EventWebsitePageClient />
    </Suspense>
  );
}
