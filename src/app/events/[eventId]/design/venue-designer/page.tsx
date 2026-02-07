
'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LayoutDashboard, Sparkles } from 'lucide-react';
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

      <div className="flex-1 min-h-0">
        {activeTab === 'designer' && (
          <iframe
            src="https://seatingplansoftware.pages.dev/"
            className="w-full h-full border-0"
            title="Interactive Floor Plan Designer"
            allow="clipboard-read; clipboard-write"
          />
        )}
        {activeTab === 'ai' && <AiSuggestionsPanel />}
      </div>
    </div>
  );
}
