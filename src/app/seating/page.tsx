'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowLeft,
  ExternalLink,
  GripVertical,
  Layers,
  Monitor,
  MousePointerClick,
  Save,
  Zap,
} from 'lucide-react';

const DESIGNER_URL = 'https://seatingplansoftware.pages.dev/';

const pills = [
  { label: 'No install', icon: Zap },
  { label: 'Drag & drop', icon: MousePointerClick },
  { label: 'Save layouts', icon: Save },
];

const features = [
  {
    title: 'Drag & Drop Editor',
    description:
      'Place tables, chairs, stages, and barriers anywhere on the canvas. Resize and rotate with precision using snap-to-grid.',
    icon: GripVertical,
  },
  {
    title: 'Multiple Layout Templates',
    description:
      'Start from pre-built templates for banquets, conferences, theater-style seating, and more. Customize to fit your venue.',
    icon: Layers,
  },
  {
    title: 'Real-Time Preview',
    description:
      'See your seating arrangement update live as you make changes. Share a read-only link with your team for instant feedback.',
    icon: Monitor,
  },
];

export default function SeatingPage() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden border-b bg-gradient-to-b from-muted/60 to-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground max-w-2xl mx-auto leading-[1.15]">
            Venue Seating Designer
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Design your floor plan and seating layout in your browser.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button size="lg" className="gap-2 text-base px-8" asChild>
              <a href={DESIGNER_URL}>
                Open Designer
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
            <Button size="lg" variant="outline" className="gap-2 text-base" asChild>
              <Link href="/">
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </Button>
          </div>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {pills.map((pill) => (
              <span
                key={pill.label}
                className="inline-flex items-center gap-1.5 rounded-full border bg-background px-4 py-1.5 text-sm font-medium text-muted-foreground shadow-sm"
              >
                <pill.icon className="h-3.5 w-3.5" />
                {pill.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Everything you need to plan your venue
          </h2>
          <p className="mt-3 text-muted-foreground max-w-md mx-auto">
            A powerful browser-based editor built for event organizers.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {features.map((feature) => (
            <Card key={feature.title} className="border bg-card shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-6 pb-6 space-y-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <feature.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-base">{feature.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 rounded-xl border bg-muted/40 p-6 sm:p-10 max-w-4xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-1">Screenshot preview</p>
          <div className="aspect-video rounded-lg border bg-background flex items-center justify-center">
            <span className="text-muted-foreground text-sm">
              Designer screenshot placeholder
            </span>
          </div>
        </div>
      </section>

      <footer className="border-t py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-muted-foreground">
          SeatingSavvy -- Design seating for events with ease.
        </div>
      </footer>
    </div>
  );
}
