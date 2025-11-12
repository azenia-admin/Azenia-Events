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
  chartKey?: string;
  secretKey?: string;
  region?: string;
}

export function SeatsioDesignerModal({
  open,
  onOpenChange,
  chartKey = 'demo-chart',
  secretKey = '',
  region = 'na',
}: SeatsioDesignerModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const designerRef = useRef<any>(null);
  const containerId = useRef<string>(`chart-designer-${Math.random().toString(36).substr(2, 9)}`);

  useEffect(() => {
    if (!open || !scriptLoaded || typeof window === 'undefined') return;
    if (!(window as any).seatsio || designerRef.current) return;

    const seatsio = (window as any).seatsio;

    if (!secretKey) {
      setError('Please configure your Seats.io secret key to use the designer.');
      return;
    }

    try {
      console.log('Creating SeatingChartDesigner with config:', {
        divId: containerId.current,
        chartKey,
        region,
        secretKeyLength: secretKey.length
      });

      designerRef.current = new seatsio.SeatingChartDesigner({
        divId: containerId.current,
        secretKey,
        chartKey,
        region,
        language: 'en',
        features: {
          enabled: ['ROWS', 'TABLES', 'BOOTHS', 'GENERAL_ADMISSION', 'FOCAL_POINT'],
        },
      }).render();

      console.log('Designer rendered successfully');
      setError(null);
    } catch (err) {
      console.error('Failed to init Designer:', err);
      setError('Failed to render Designer');
    }

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
              <Alert variant="destructive">
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
                <div
                  id={containerId.current}
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
