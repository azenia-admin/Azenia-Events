'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info, AlertCircle } from 'lucide-react';
import Script from 'next/script';

interface SeatsioDesignerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** IMPORTANT: Designer needs a CHART key, not an event key */
  chartKey?: string;
  /** Only expose on admin/internal pages */
  secretKey?: string;
  /** Seats.io workspace region, e.g. 'na', 'eu', 'sa', 'oc' */
  region?: string;
}

export function SeatsioDesignerModal({
  open,
  onOpenChange,
  chartKey = 'demo-chart',   // make sure this is a real CHART key
  secretKey = '',
  region = 'na',
}: SeatsioDesignerModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const designerRef = useRef<any>(null);

  useEffect(() => {
    // Guard: only run on client with script loaded and modal open
    if (!open) return;
    if (!scriptLoaded) return;
    if (typeof window === 'undefined') return;
    if (!(window as any).seatsio) return;

    // Container must already be in the DOM (modal content mounted)
    if (!containerRef.current) return;

    // Designer requires a secret key and a CHART key
    if (!secretKey) {
      setError('Please configure your Seats.io secret key to use the designer.');
      return;
    }
    if (!chartKey) {
      setError('Missing chartKey. The Designer edits charts, not events.');
      return;
    }

    // Avoid duplicate init
    if (designerRef.current) return;

    try {
      const seatsio = (window as any).seatsio;

      console.log('Init SeatingChartDesigner', {
        region,
        secretKeyLength: secretKey.length,
        chartKey,
        hasElement: !!containerRef.current,
      });

      // NOTE: do NOT pass divId. Pass the element directly to render(...)
      const designer = new seatsio.SeatingChartDesigner({
        secretKey,
        chartKey,   // MUST be a chart key
        region,
        language: 'en',
        features: {
          enabled: ['ROWS', 'TABLES', 'BOOTHS', 'GENERAL_ADMISSION', 'FOCAL_POINT'],
        },
      });

      designerRef.current = designer.render(containerRef.current);
      console.log('Designer rendered successfully');
      setError(null);
    } catch (e) {
      console.error('Failed to init Designer:', e);
      setError('Failed to render Designer');
    }

    // Cleanup on close/unmount
    return () => {
      try {
        designerRef.current?.destroy?.();
      } catch (e) {
        console.warn('Error destroying designer:', e);
      } finally {
        designerRef.current = null;
      }
    };
  }, [open, scriptLoaded, chartKey, region, secretKey]);

  const handleScriptLoad = () => {
    console.log('Seats.io chart.js loaded successfully from region:', region);
    setScriptLoaded(true);
  };

  const handleScriptError = (e: any) => {
    console.error('Failed to load seats.io chart.js from:', `https://cdn-${region}.seatsio.net/chart.js`, e);
    setError(`Could not load Seats.io from ${region}. Check CSP/network.`);
  };

  return (
    <>
      {/* Load once; alternatively move this <Script> to app/layout.tsx */}
      <Script
        src={`https://cdn-${region}.seatsio.net/chart.js`}
        strategy="afterInteractive"
        onLoad={handleScriptLoad}
        onError={handleScriptError}
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] h-[95vh] p-0 flex flex-col">
          <DialogHeader className="p-6 pb-2 flex-shrink-0">
            <DialogTitle>Venue Designer</DialogTitle>
            <DialogDescription>
              Design your venue layout with seats, tables, and sections
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6 pb-6 min-h-0">
            {!secretKey && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To use the venue designer, you need to configure your Seats.io secret key.
                  Please add your credentials to the environment variables.
                </AlertDescription>
              </Alert>
            )}

            {!scriptLoaded && !error && (
              <div className="flex items-center justify-center h-[600px]">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Loading Seats.io Designer...</p>
                </div>
              </div>
            )}

            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {scriptLoaded && secretKey && !error && (
              <>
                <Alert className="mb-4">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Use the tools to create your venue layout. Changes are saved automatically.
                  </AlertDescription>
                </Alert>

                {/* The container MUST exist in the DOM when init runs */}
                <div
                  ref={containerRef}
                  id="seatsio-designer-container"  // static id (helpful for debugging)
                  className="w-full h-full min-h-[600px] border rounded-lg overflow-hidden bg-white"
                  style={{ minHeight: 'calc(95vh - 200px)' }}
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}