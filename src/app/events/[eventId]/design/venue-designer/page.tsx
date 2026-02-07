'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { LayoutDashboard, Sparkles, ExternalLink, Armchair, Grid3X3, Move } from 'lucide-react';
import AiSuggestionsPanel from './AiSuggestionsPanel';

export default function VenueDesignerPage() {
  const [activeTab, setActiveTab] = useState('designer');

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2 flex items-center justify-between border-b bg-background">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Venue Designer</h1>
          <p className="text-sm text-muted-foreground">
            Design your floor plan or get AI-powered layout suggestions.
          </p>
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
                  <Button size="lg" className="gap-2" asChild>
                    <Link href="/seating">
                      Open Designer
                      <ExternalLink className="h-4 w-4" />
                    </Link>
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
