'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DESIGNER_URL = 'https://seatingplansoftware.azeniatechnology.com/';

export default function SeatingPage() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="relative w-full h-[calc(100vh-4rem)]">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background z-10">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading Seating Designer...</p>
          </div>
        </div>
      )}
      <iframe
        src={DESIGNER_URL}
        className="w-full h-full border-0"
        title="Venue Seating Designer"
        allow="clipboard-read; clipboard-write"
        onLoad={() => setIsLoading(false)}
      />
    </div>
  );
}
