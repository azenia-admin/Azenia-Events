'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Sparkles, ExternalLink, Armchair, Grid3X3, Move, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import EventLayoutClient from '../../EventLayoutClient';
import AiSuggestionsPanel from './AiSuggestionsPanel';

type SeatingStatus = 'not_started' | 'draft' | 'published';

export default function VenueDesignerPage() {
  const [activeTab, setActiveTab] = useState('designer');
  const [isOpening, setIsOpening] = useState(false);
  const [seatingStatus, setSeatingStatus] = useState<SeatingStatus>('not_started');
  const [layoutCount, setLayoutCount] = useState(0);
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');
  const { toast } = useToast();

  const fetchSeatingStatus = useCallback(async () => {
    if (!eventId) return;

    try {
      const { data: layouts, error: layoutsError } = await supabase
        .from('venue_layouts')
        .select('id, status')
        .eq('event_id', eventId);

      if (layoutsError) {
        console.error('Error fetching layouts:', layoutsError);
        setSeatingStatus('not_started');
        setLayoutCount(0);
        return;
      }

      if (!layouts || layouts.length === 0) {
        setSeatingStatus('not_started');
        setLayoutCount(0);
        return;
      }

      setLayoutCount(layouts.length);
      const hasPublished = layouts.some((l: { status: string }) => l.status === 'published');
      setSeatingStatus(hasPublished ? 'published' : 'draft');
    } catch (error) {
      console.error('Unexpected error fetching seating status:', error);
      setSeatingStatus('not_started');
      setLayoutCount(0);
    }
  }, [eventId]);

  useEffect(() => {
    fetchSeatingStatus();
  }, [fetchSeatingStatus]);

  const handleOpenDesigner = async () => {
    setIsOpening(true);

    try {
      if (!eventId) {
        throw new Error('Event ID is missing');
      }

      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        throw new Error('Supabase configuration is missing');
      }

      const returnUrl = encodeURIComponent(window.location.href);
      const supabaseUrl = encodeURIComponent(process.env.NEXT_PUBLIC_SUPABASE_URL);
      const supabaseKey = encodeURIComponent(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

      const designerUrl = `https://seatingplansoftware.azeniatechnology.com/?eventId=${eventId}&returnUrl=${returnUrl}&supabaseUrl=${supabaseUrl}&supabaseKey=${supabaseKey}`;

      window.location.href = designerUrl;
    } catch (err: unknown) {
      console.error('Error opening designer:', err);
      const message = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Could not open designer',
        description: message,
      });
      setIsOpening(false);
    }
  };

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

        <div className="flex-1 min-h-0 overflow-auto">
          {activeTab === 'designer' && (
            <div className="flex items-center justify-center h-full p-8">
              <Card className="max-w-lg w-full">
                <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-6">
                  <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <LayoutDashboard className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-xl font-semibold">Interactive Floor Plan Designer</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">
                      Open the full-featured seating plan tool to drag-and-drop tables, chairs, stages, and more onto your venue layout.
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-4 w-full max-w-xs text-center">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Move className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Drag & Drop</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Armchair className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Seat Layouts</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5">
                      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                        <Grid3X3 className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <span className="text-xs text-muted-foreground">Grid Snapping</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      size="lg"
                      className="gap-2"
                      disabled={isOpening}
                      onClick={handleOpenDesigner}
                    >
                      {isOpening ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                      {isOpening ? 'Preparing...' : 'Open Designer'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
          {activeTab === 'ai' && <AiSuggestionsPanel />}
        </div>
      </div>
    </EventLayoutClient>
  );
}
