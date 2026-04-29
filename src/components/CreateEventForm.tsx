'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, Loader2, ArrowRight } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { useUser, useAuth } from '@/lib/supabase-auth';
import { useOrganization } from '@/lib/organization';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().optional(),
  date: z.date({ required_error: 'A date is required.' }),
  location: z.string().min(2, 'Location must be at least 2 characters.'),
});

const authSchema = z.object({
  email: z.string().email('Please enter a valid email.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

const inputClass =
  'bg-white border-[#E8DFD3] rounded-xl focus-visible:ring-[#D97757]/30 focus-visible:ring-offset-0';
const labelClass = 'text-[#1B1A17] font-medium';

function AuthForm({ onAuthenticated }: { onAuthenticated: () => void }) {
  const { signUp, signInWithPassword } = useAuth();
  const { toast } = useToast();
  const [isSignUp, setIsSignUp] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof authSchema>>({
    resolver: zodResolver(authSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(values: z.infer<typeof authSchema>) {
    setIsSubmitting(true);
    try {
      if (isSignUp) {
        await signUp(values.email, values.password);
      } else {
        await signInWithPassword(values.email, values.password);
      }
      onAuthenticated();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Authentication failed. Please try again.';
      toast({
        variant: 'destructive',
        title: isSignUp ? 'Sign up failed' : 'Sign in failed',
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-[#55514B] text-center">
        {isSignUp
          ? 'Create an account to start managing events.'
          : 'Sign in to your account.'}
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className={labelClass}>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Min 6 characters"
                    className={inputClass}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] h-11"
          >
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>
      </Form>
      <p className="text-center text-sm text-[#55514B]">
        {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
        <button
          type="button"
          className="font-semibold text-[#D97757] hover:underline"
          onClick={() => setIsSignUp(!isSignUp)}
        >
          {isSignUp ? 'Sign in' : 'Sign up'}
        </button>
      </p>
    </div>
  );
}

interface Props {
  onCreated?: (eventId: string) => void;
  onCancel?: () => void;
}

export function CreateEventForm({ onCreated, onCancel }: Props) {
  const { user } = useUser();
  const { currentOrganization } = useOrganization();
  const { toast } = useToast();
  const [showEventForm, setShowEventForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
      location: '',
    },
  });

  if (!user && !showEventForm) {
    return <AuthForm onAuthenticated={() => setShowEventForm(true)} />;
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!user) return;
    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from('events')
        .insert({
          name: values.name,
          description: values.description || '',
          start_date: values.date.toISOString(),
          location: values.location,
          user_id: user.id,
          organization_id: currentOrganization?.id ?? null,
        })
        .select('id')
        .maybeSingle();

      if (error) throw error;

      toast({
        title: 'Event created',
        description: `${values.name} is ready to configure.`,
      });

      form.reset();
      onCreated?.(data?.id ?? '');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'There was a problem with your request.';
      toast({
        variant: 'destructive',
        title: 'Could not create event',
        description: message,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Event name</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. AI in Tech Conference"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little about the event"
                  className={cn(inputClass, 'resize-none min-h-[80px]')}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel className={labelClass}>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full pl-3 text-left font-normal rounded-xl border-[#E8DFD3] bg-white hover:bg-[#F0E6D6]',
                        !field.value && 'text-[#8A8378]'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-60" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className={labelClass}>Location</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g. Metropolis Convention Center"
                  className={inputClass}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex items-center justify-end gap-2 pt-2">
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              className="rounded-full text-[#1B1A17] hover:bg-[#F0E6D6]"
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] h-11 px-6 group"
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Create event
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
        </div>
      </form>
    </Form>
  );
}
