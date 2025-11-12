'use client';

import React, { useRef, useEffect, useState } from 'react';
import { SeatsioSeatingChart } from '@seatsio/seatsio-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Info } from 'lucide-react';

interface SeatsioChartProps {
  eventKey: string;
  workspaceKey?: string;
  region?: string;
  onSelectionChange?: (selectedObjects: any[]) => void;
  mode?: 'select' | 'static';
  maxSelectedObjects?: number;
}

export function SeatsioChart({
  eventKey,
  workspaceKey = 'demo-workspace',
  region = 'eu',
  onSelectionChange,
  mode = 'select',
  maxSelectedObjects,
}: SeatsioChartProps) {
  const chartRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleChartRendered = (chart: any) => {
    chartRef.current = chart;
    setIsLoading(false);
  };

  const handleObjectSelected = async () => {
    if (chartRef.current && onSelectionChange) {
      try {
        const selectedObjects = await chartRef.current.listSelectedObjects();
        onSelectionChange(selectedObjects);
      } catch (err) {
        console.error('Error getting selected objects:', err);
      }
    }
  };

  const handleObjectDeselected = async () => {
    if (chartRef.current && onSelectionChange) {
      try {
        const selectedObjects = await chartRef.current.listSelectedObjects();
        onSelectionChange(selectedObjects);
      } catch (err) {
        console.error('Error getting selected objects:', err);
      }
    }
  };

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="relative w-full">
      {isLoading && (
        <div className="absolute inset-0 z-10 bg-background/80 flex items-center justify-center">
          <Skeleton className="h-[500px] w-full" />
        </div>
      )}

      <Alert className="mb-4">
        <Info className="h-4 w-4" />
        <AlertDescription>
          This is a demo seating chart. Configure your seats.io workspace key and event key to use your own seating charts.
        </AlertDescription>
      </Alert>

      <div className="border rounded-lg overflow-hidden bg-white">
        <SeatsioSeatingChart
          workspaceKey={workspaceKey}
          event={eventKey}
          region={region}
          onChartRendered={handleChartRendered}
          onObjectSelected={handleObjectSelected}
          onObjectDeselected={handleObjectDeselected}
          maxSelectedObjects={maxSelectedObjects}
          mode={mode}
          language="en"
          tooltipInfo={(object: any) => {
            return `${object.label} - ${object.category?.label || 'General'}`;
          }}
        />
      </div>
    </div>
  );
}
