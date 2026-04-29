'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import EventLayoutClient from '../../EventLayoutClient';
import AiSuggestionsPanel from './AiSuggestionsPanel';
import VenueDesigner from '@/components/venue-designer/VenueDesigner';

type SeatingStatus = 'not_started' | 'draft' | 'published';

export default function VenueDesignerPage() {
  const [activeTab, setActiveTab] = useState('designer');
  const [seatingStatus, setSeatingStatus] = useState<SeatingStatus>('not_started');
  const [layoutCount, setLayoutCount] = useState(0);
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const fetchSeatingStatus = useCallback(async () => {
    if (!eventId) return;
    try {
      const { data: plans, error } = await supabase
        .from('floor_plans')
        .select('id')
        .eq('event_id', eventId);
      if (error) {
        setSeatingStatus('not_started');
        setLayoutCount(0);
        return;
      }
      if (!plans || plans.length === 0) {
        setSeatingStatus('not_started');
        setLayoutCount(0);
        return;
      }
      setLayoutCount(plans.length);
      setSeatingStatus('draft');
    } catch {
      setSeatingStatus('not_started');
      setLayoutCount(0);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSeatingStatus();
  }, [fetchSeatingStatus]);

  const statusLabel: Record<SeatingStatus, string> = {
    not_started: 'Not Started',
    draft: `Draft (${layoutCount})`,
    published: `Published (${layoutCount})`,
  };

  const statusVariant: Record<SeatingStatus, 'outline' | 'secondary' | 'default'> = {
    not_started: 'outline',
    draft: 'secondary',
    published: 'default',
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">No event ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="flex flex-col h-[calc(100vh-4rem)]">
        <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between border-b bg-background">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Venue Designer</h1>
              <p className="text-sm text-muted-foreground">
                Design your floor plan or get AI-powered layout suggestions.
              </p>
            </div>
            <Badge variant={statusVariant[seatingStatus]}>
              {statusLabel[seatingStatus]}
            </Badge>
          </div>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="designer" className="gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Floor Plan
              </TabsTrigger>
              <TabsTrigger value="ai" className="gap-2">
                <Sparkles className="h-4 w-4" />
                AI Suggestions
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === 'designer' && (
            <div className="h-full">
              <VenueDesigner eventId={eventId} />
            </div>
          )}
          {activeTab === 'ai' && <AiSuggestionsPanel />}
        </div>
      </div>
    </EventLayoutClient>
  );
}
