import { Suspense } from 'react';
import VenueDesignerPageClient from './VenueDesignerPageClient';

export default function VenueDesignerPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}>
      <VenueDesignerPageClient />
    </Suspense>
  );
}
