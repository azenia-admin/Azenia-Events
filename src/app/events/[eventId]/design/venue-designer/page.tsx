'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { doc } from 'firebase/firestore';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LayoutDashboard, Sparkles, ExternalLink, Armchair, Grid3X3, Move, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { ensureSupabaseEvent } from '@/lib/ensure-event';
import { supabase } from '@/lib/supabase';
import AiSuggestionsPanel from './AiSuggestionsPanel';

interface EventData {
  name: string;
}

type SeatingStatus = 'not_started' | 'draft' | 'published';

export default function VenueDesignerPage() {
  const [activeTab, setActiveTab] = useState('designer');
  const [isOpening, setIsOpening] = useState(false);
  const [seatingStatus, setSeatingStatus] = useState<SeatingStatus>('not_started');
  const [layoutCount, setLayoutCount] = useState(0);
  const params = useParams();
  const eventId = params.eventId as string;
  const { toast } = useToast();

  const firestore = useFirestore();
  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);

  const { data: event } = useDoc<EventData>(eventRef);

  const fetchSeatingStatus = useCallback(async () => {
    const { data: supaEvent } = await supabase
      .from('events')
      .select('id')
      .eq('firebase_event_id', eventId)
      .maybeSingle();

    if (!supaEvent) {
      setSeatingStatus('not_started');
      setLayoutCount(0);
      return;
    }

    const { data: layouts } = await supabase
      .from('venue_layouts')
      .select('id, status')
      .eq('event_id', supaEvent.id);

    if (!layouts || layouts.length === 0) {
      setSeatingStatus('not_started');
      setLayoutCount(0);
      return;
    }

    setLayoutCount(layouts.length);
    const hasPublished = layouts.some((l: { status: string }) => l.status === 'published');
    setSeatingStatus(hasPublished ? 'published' : 'draft');
  }, [eventId]);

  useEffect(() => {
    fetchSeatingStatus();
  }, [fetchSeatingStatus]);

  const handleOpenDesigner = async () => {
    setIsOpening(true);
    try {
      const supaEvent = await ensureSupabaseEvent(
        eventId,
        event?.name || 'Untitled Event'
      );
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `https://seatingplansoftware.azeniatechnology.com/?eventId=${supaEvent.id}&returnUrl=${returnUrl}`;
    } catch (err: unknown) {
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

  return (
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
  );
}
