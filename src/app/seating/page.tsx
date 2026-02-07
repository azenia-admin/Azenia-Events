'use client';

import { useEffect } from 'react';

const DESIGNER_URL = 'https://seatingplansoftware.azeniatechnology.com/';

export default function SeatingPage() {
  useEffect(() => {
    window.location.href = DESIGNER_URL;
  }, []);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
      <p className="text-sm text-muted-foreground">Redirecting to Seating Designer...</p>
    </div>
  );
}
