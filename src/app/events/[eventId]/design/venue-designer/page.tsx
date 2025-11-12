'use client';

import { useState } from 'react';
import { useForm, zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';

import {
  intelligentLayoutSuggestions,
  type IntelligentLayoutSuggestionsInput,
  type IntelligentLayoutSuggestionsOutput,
} from '@/ai/flows/intelligent-layout-suggestions';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Loader } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const formSchema = z.object({
  venueData: z
    .string()
    .min(10, 'Please provide more details about the venue.'),
  audienceData: z
    .string()
    .min(10, 'Please provide more details about the audience.'),
  seatingType: z.enum(['conference', 'theater', 'classroom', 'banquet']),
  seatConstraints: z
    .string()
    .min(10, 'Please provide some seating constraints.'),
  safetyRequirements: z
    .string()
    .min(10, 'Please provide safety requirements.'),
});

export default function VenueDesignerPage() {
  const [suggestion, setSuggestion] =
    useState<IntelligentLayoutSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      venueData:
        'The main hall is 50m long and 30m wide. The stage is at the north end, 10m wide and 5m deep.',
      audienceData:
        'Expecting 200 attendees. Mostly tech professionals. Need 5 wheelchair accessible spots.',
      seatingType: 'theater',
      seatConstraints: 'Maximum 12 seats per row. Main aisle width of 2m.',
      safetyRequirements:
        'Two emergency exits on the east and west walls. Fire extinguishers every 15m.',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setSuggestion(null);
    try {
      const result = await intelligentLayoutSuggestions(values);
      setSuggestion(result);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Venue Designer</h1>
        <p className="text-muted-foreground">
          Describe your venue and event requirements, and our AI will generate
          an optimized seating layout for you.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Design Parameters</CardTitle>
            <CardDescription>
              Provide the details for your layout generation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="venueData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Venue Data</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="e.g., Dimensions, stage location, entrances, etc."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Describe the physical space of your venue.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="audienceData"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Audience Data</FormLabel>
                      <FormControl>
                        <Textarea
                          rows={4}
                          placeholder="e.g., Number of attendees, demographics, accessibility needs."
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Tell us about your audience.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seatingType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a seating style" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="theater">Theater</SelectItem>
                          <SelectItem value="classroom">Classroom</SelectItem>
                          <SelectItem value="banquet">Banquet</SelectItem>
                          <SelectItem value="conference">Conference</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="seatConstraints"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seating Constraints</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Max row length, aisle width"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="safetyRequirements"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Safety Requirements</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g., Emergency exits, fire lanes"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <Loader className="animate-spin mr-2" />
                  ) : null}
                  Generate Layout
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle>Generated Layout</CardTitle>
            <CardDescription>
              The AI-suggested layout will appear below.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col justify-center items-center">
            {isLoading && (
               <div className="w-full space-y-4">
                    <Skeleton className="h-[250px] w-full" />
                    <Skeleton className="h-8 w-3/4" />
                    <Skeleton className="h-24 w-full" />
               </div>
            )}
            {error && (
              <div className="text-destructive text-center">
                <p><strong>Generation Failed</strong></p>
                <p>{error}</p>
              </div>
            )}
            {!isLoading && !suggestion && !error && (
              <div className="text-center text-muted-foreground">
                <p>Your generated layout will be displayed here.</p>
              </div>
            )}
            {suggestion && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg">Layout Diagram</h3>
                  {suggestion.layoutDiagram ? (
                    <Image
                      src={suggestion.layoutDiagram}
                      alt="Generated Seating Layout"
                      width={600}
                      height={400}
                      className="rounded-md border object-contain"
                    />
                  ) : (
                    <p className='text-sm text-muted-foreground'>No diagram was generated.</p>
                  )}
                </div>
                 <div>
                  <h3 className="font-semibold text-lg">Layout Description</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.layoutDescription}</p>
                </div>
                 <div>
                  <h3 className="font-semibold text-lg">Optimization Rationale</h3>
                  <p className="text-sm text-muted-foreground">{suggestion.optimizationRationale}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
