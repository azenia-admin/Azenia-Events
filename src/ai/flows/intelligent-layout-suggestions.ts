'use server';

/**
 * @fileOverview This file defines a Genkit flow for generating intelligent seating layout suggestions based on venue and audience data.
 *
 * - intelligentLayoutSuggestions - A function that generates seating layout suggestions.
 * - IntelligentLayoutSuggestionsInput - The input type for the intelligentLayoutSuggestions function.
 * - IntelligentLayoutSuggestionsOutput - The return type for the intelligentLayoutSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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
      'A data URI containing a diagram of the suggested seating layout. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
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
  return intelligentLayoutSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'intelligentLayoutSuggestionsPrompt',
  input: {schema: IntelligentLayoutSuggestionsInputSchema},
  output: {schema: IntelligentLayoutSuggestionsOutputSchema},
  prompt: `You are an AI-powered event planning assistant specializing in generating seating layout suggestions for various venues and event types.

  Based on the provided venue data, audience data, seating type, seat constraints, and safety requirements, generate an optimized seating layout that maximizes audience flow, ensures clear sightlines, and adheres to all safety regulations.

  Venue Data: {{{venueData}}}
  Audience Data: {{{audienceData}}}
  Seating Type: {{{seatingType}}}
  Seat Constraints: {{{seatConstraints}}}
  Safety Requirements: {{{safetyRequirements}}}

  Consider the following:
  - Optimize seat allocation based on the seating type and constraints.
  - Ensure adequate aisle width for audience flow.
  - Maximize sightlines to the stage or presentation area.
  - Adhere to all safety requirements, including emergency exits and evacuation plans.

  Output a detailed textual description of the suggested seating layout, a data URI containing a diagram of the layout, and an explanation of why the suggested layout is optimal.

  Make sure the layoutDiagram field is in proper data URI format: data:<mimetype>;base64,<encoded_data>.
`,
});

const intelligentLayoutSuggestionsFlow = ai.defineFlow(
  {
    name: 'intelligentLayoutSuggestionsFlow',
    inputSchema: IntelligentLayoutSuggestionsInputSchema,
    outputSchema: IntelligentLayoutSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
