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
import { Button } from '@/components/ui/button';
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
  region = 'eu',
}: SeatsioDesignerModalProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentRegion, setCurrentRegion] = useState(region);
  const designerRef = useRef<any>(null);
  const containerRef = useRef<string>(`chart-designer-${Math.random().toString(36).substr(2, 9)}`);
  const scriptAttempts = useRef<string[]>([]);

  useEffect(() => {
    if (!open || !scriptLoaded) {
      return;
    }

    const timer = setTimeout(() => {
      try {
        console.log('Initializing SeatsIO Designer:', {
          scriptLoaded,
          secretKeyPresent: !!secretKey,
          region: currentRegion,
          chartKey
        });

        const seatsio = (window as any).seatsio;
        if (!seatsio) {
          console.error('Seats.io library not found on window object');
          setError('Seats.io library not loaded. Please check your internet connection.');
          return;
        }

        if (!secretKey) {
          console.error('Secret key missing');
          setError('Please configure your Seats.io secret key to use the designer.');
          return;
        }

        const container = document.getElementById(containerRef.current);
        if (!container) {
          console.error('Container not found');
          return;
        }

        if (designerRef.current) {
          try {
            designerRef.current.destroy();
          } catch (e) {
            console.warn('Error destroying previous designer:', e);
          }
        }

        console.log('Creating designer with config:', {
          divId: containerRef.current,
          chartKey,
          region: currentRegion,
          secretKeyLength: secretKey.length
        });

        designerRef.current = new seatsio.SeatingChartDesigner({
          divId: containerRef.current,
          secretKey: secretKey,
          chartKey: chartKey,
          region: currentRegion,
          language: 'en',
          features: {
            enabled: ['ROWS', 'TABLES', 'BOOTHS', 'GENERAL_ADMISSION', 'FOCAL_POINT'],
          },
        }).render();

        console.log('Designer rendered successfully');
        setError(null);
      } catch (err) {
        console.error('Error initializing designer:', err);
        setError(`Failed to initialize the seating chart designer: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    }, 100);

    return () => {
      clearTimeout(timer);
      if (designerRef.current) {
        try {
          designerRef.current.destroy();
        } catch (e) {
          console.warn('Error destroying designer on cleanup:', e);
        }
        designerRef.current = null;
      }
    };
  }, [open, scriptLoaded, chartKey, secretKey, currentRegion]);

  const handleScriptLoad = () => {
    console.log('Seats.io script loaded successfully from region:', currentRegion);
    setScriptLoaded(true);
  };

  const handleScriptError = () => {
    const regions = ['na', 'eu', 'sa', 'oc'];
    const currentIndex = regions.indexOf(currentRegion);
    const nextIndex = currentIndex + 1;

    if (nextIndex < regions.length && !scriptAttempts.current.includes(regions[nextIndex])) {
      scriptAttempts.current.push(currentRegion);
      setCurrentRegion(regions[nextIndex]);
      setError(`Trying alternative region: ${regions[nextIndex].toUpperCase()}...`);
    } else {
      setError('Failed to load Seats.io library from all regions. Please verify your account region or check your internet connection.');
    }
  };

  return (
    <>
      <Script
        key={currentRegion}
        src={`https://cdn-${currentRegion}.seatsio.net/designer.js`}
        onLoad={handleScriptLoad}
        onError={handleScriptError}
        strategy="lazyOnload"
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-[95vw] h-[95vh] p-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Venue Designer</DialogTitle>
            <DialogDescription>
              Design your venue layout with seats, tables, and sections
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden px-6 pb-6">
            {!secretKey && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  To use the venue designer, you need to configure your Seats.io secret key.
                  Please add your credentials to the environment variables or database configuration.
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
                  id={containerRef.current}
                  className="w-full h-[calc(95vh-200px)] border rounded-lg overflow-hidden bg-white"
                />
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
