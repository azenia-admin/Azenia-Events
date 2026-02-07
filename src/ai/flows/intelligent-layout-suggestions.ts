import { z } from 'zod';

const IntelligentLayoutSuggestionsInputSchema = z.object({
  venueData: z
    .string()
    .describe('Detailed information about the venue, including dimensions, stage location, and available facilities.'),
  audienceData: z
    .string()
    .describe(
      'Information about the expected audience, including size, demographics, and any specific needs or constraints (e.g., wheelchair access).'
    ),
  seatingType: z
    .enum(['conference', 'theater', 'classroom', 'banquet'])
    .describe('The type of seating arrangement desired for the event.'),
  seatConstraints: z
    .string()
    .describe(
      'Any constraints on seating, such as maximum row length, aisle width, or preferred distance from the stage.'
    ),
  safetyRequirements: z
    .string()
    .describe(
      'Safety requirements for the layout, including emergency exits, fire safety regulations, and evacuation plans.'
    ),
});

export type IntelligentLayoutSuggestionsInput = z.infer<
  typeof IntelligentLayoutSuggestionsInputSchema
>;

const IntelligentLayoutSuggestionsOutputSchema = z.object({
  layoutDescription: z
    .string()
    .describe('A detailed textual description of the suggested seating layout.'),
  layoutDiagram: z
    .string()
    .describe(
      'A data URI containing a diagram of the suggested seating layout. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.'
    ),
  optimizationRationale: z
    .string()
    .describe(
      'An explanation of why the suggested layout is optimal, considering factors like audience flow, sightlines, and safety.'
    ),
});

export type IntelligentLayoutSuggestionsOutput = z.infer<
  typeof IntelligentLayoutSuggestionsOutputSchema
>;

export async function intelligentLayoutSuggestions(
  input: IntelligentLayoutSuggestionsInput
): Promise<IntelligentLayoutSuggestionsOutput> {
  throw new Error('AI layout suggestions are not available in static export mode. Please deploy with a server runtime to enable this feature.');
}
