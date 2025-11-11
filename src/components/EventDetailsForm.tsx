'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  CalendarIcon,
  Check,
  Computer,
  Info,
  Presentation,
  Users,
  Warehouse,
} from 'lucide-react';
import Image from 'next/image';
import { format } from 'date-fns';
import * as React from 'react';

import { Button } from '@/components/ui/button';
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
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Skeleton } from './ui/skeleton';
import { Card, CardContent } from './ui/card';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(1, 'Event name is required'),
  startDate: z.date(),
  startTime: z.string(),
  startAmPm: z.string(),
  endDate: z.date(),
  endTime: z.string(),
  endAmPm: z.string(),
  format: z.string().optional(),
  type: z.string().optional(),
  location: z.string().optional(),
  allowAccessAfterEnd: z.boolean(),
  isPrivate: z.boolean(),
  preEventAccessDate: z.date().optional(),
  preEventAccessTime: z.string().optional(),
  preEventAccessAmPm: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EventDetailsForm({ eventId }: { eventId: string }) {
  const firestore = useFirestore();
  const { toast } = useToast();

  const eventRef = useMemoFirebase(() => {
    if (!firestore || !eventId) return null;
    return doc(firestore, 'events', eventId);
  }, [firestore, eventId]);

  const { data: event, isLoading: isEventLoading } = useDoc(eventRef);
  const eventImage = PlaceHolderImages.find((p) => p.id === 'event-1');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      allowAccessAfterEnd: false,
      isPrivate: true,
    },
  });

  const { reset } = form;
  React.useEffect(() => {
    if (event) {
      const eventDate = (event.date as any)?.toDate
        ? (event.date as any).toDate()
        : new Date(event.date);

      reset({
        name: event.name,
        startDate: eventDate,
        endDate: eventDate,
        startTime: eventDate.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }).split(':')[0],
        startAmPm: eventDate.getHours() >= 12 ? 'PM' : 'AM',
        endTime: '11:59',
        endAmPm: 'PM',
        location: (event as any).location || 'To be announced',
        format: 'In Person',
        type: 'Please Select (optional)',
        allowAccessAfterEnd: false,
        isPrivate: true,
        preEventAccessDate: eventDate,
        preEventAccessTime: '08:30',
        preEventAccessAmPm: 'AM',
      });
    }
  }, [event, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!eventRef) return;

    try {
        const startHour = (parseInt(values.startTime.split(':')[0]) % 12) + (values.startAmPm === 'PM' ? 12 : 0);
        const startMinute = parseInt(values.startTime.split(':')[1]);
        const startDate = new Date(values.startDate);
        startDate.setHours(startHour, startMinute);

        await updateDoc(eventRef, {
            name: values.name,
            date: startDate,
            location: values.location,
        });

        toast({
            title: 'Success!',
            description: 'Event details have been updated.',
        });
    } catch (error) {
        console.error('Failed to update event:', error);
        toast({
            variant: 'destructive',
            title: 'Uh oh! Something went wrong.',
            description: 'Could not update event details.',
        });
    }
  };

  if (isEventLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-10 w-1/3" />
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="mt-8">
              <Skeleton className="h-48 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Event Details</h1>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-x-6 gap-y-8 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Name*</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="space-y-2">
                    <FormLabel className='flex items-center gap-1'>Organizer <Info className='size-3 text-muted-foreground' /></FormLabel>
                    <p className='text-sm text-muted-foreground'>Sherjil Baig Events</p>
                    <Button variant="link" className='p-0 h-auto text-sm'>Change organizer</Button>
                </div>
                
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Starts</FormLabel>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'MM/dd/yyyy')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>

                        {/* Time inputs would go here */}
                        <Input defaultValue="09:00" className='w-24' />
                        <Select defaultValue='AM'>
                            <SelectTrigger className='w-24'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                       <Button variant="link" className='p-0 h-auto text-sm justify-start w-fit'>Schedule multiple events</Button>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Event Ends</FormLabel>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'MM/dd/yyyy')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Input defaultValue="11:59" className='w-24' />
                        <Select defaultValue='PM'>
                            <SelectTrigger className='w-24'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                       <p className='text-sm text-muted-foreground'>Timezone & date settings (United States (Chicago) Time)</p>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Format</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select an event format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="In Person">In Person</SelectItem>
                          <SelectItem value="Online">Online</SelectItem>
                          <SelectItem value="Hybrid">Hybrid</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Please Select (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Conference">Conference</SelectItem>
                          <SelectItem value="Workshop">Workshop</SelectItem>
                          <SelectItem value="Networking">Networking</SelectItem>
                          <SelectItem value="Expo">Expo</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="To be announced" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="To be announced">To be announced</SelectItem>
                          <SelectItem value="Venue to be determined">Venue to be determined</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <div className='md:col-span-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4'>
                    <Button variant="secondary" className='h-20 flex-col gap-2 bg-primary/10 text-primary border border-primary'>
                        <div className='flex justify-between w-full items-start'>
                            <Computer className='size-5' />
                            <Check className='size-5 text-primary' />
                        </div>
                        <p className='w-full text-left'>Main Stage Sessions</p>
                    </Button>
                     <Button variant="outline" className='h-20 flex-col gap-2'>
                        <div className='flex justify-between w-full items-start'>
                            <Presentation className='size-5 text-muted-foreground' />
                        </div>
                        <p className='w-full text-left'>Sessions & Workshops</p>
                    </Button>
                     <Button variant="outline" className='h-20 flex-col gap-2'>
                        <div className='flex justify-between w-full items-start'>
                            <Users className='size-5 text-muted-foreground' />
                        </div>
                        <p className='w-full text-left'>Networking</p>
                    </Button>
                     <Button variant="outline" className='h-20 flex-col gap-2'>
                        <div className='flex justify-between w-full items-start'>
                            <Warehouse className='size-5 text-muted-foreground' />
                        </div>
                        <p className='w-full text-left'>Expo</p>
                    </Button>
                </div>
                
                 <FormField
                  control={form.control}
                  name="allowAccessAfterEnd"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Allow attendees to access the event app or event hub after the event ends
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className='md:col-span-2 space-y-2'>
                    <h3 className='font-medium'>Event Logo</h3>
                    <p className='text-sm text-muted-foreground'>This is the main image for your event. We recommend a 700 x 350px (2:1 ratio) image.</p>
                     {eventImage && (
                        <div className="relative">
                            <Image
                            src={eventImage.imageUrl}
                            alt={eventImage.description}
                            width={700}
                            height={350}
                            className="rounded-md object-cover w-full aspect-[2/1]"
                            data-ai-hint={eventImage.imageHint}
                            />
                            <Button variant="secondary" className='absolute top-4 right-4'>
                                Change Image
                            </Button>
                        </div>
                    )}
                </div>

                <FormField
                  control={form.control}
                  name="preEventAccessDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel className='flex items-center gap-1'>Pre-Event Access Starts <Info className='size-3 text-muted-foreground' /></FormLabel>
                      <div className="flex gap-2">
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={'outline'}
                                className={cn(
                                  'w-full justify-start text-left font-normal',
                                  !field.value && 'text-muted-foreground'
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {field.value ? (
                                  format(field.value, 'MM/dd/yyyy')
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        
                        <Input defaultValue="08:30" className='w-24' />
                        <Select defaultValue='AM'>
                            <SelectTrigger className='w-24'>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="AM">AM</SelectItem>
                                <SelectItem value="PM">PM</SelectItem>
                            </SelectContent>
                        </Select>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isPrivate"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2 flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          This is a Private Event
                        </FormLabel>
                        <FormDescription>
                          Your event URL will be unlisted and unsearchable.
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          aria-readonly
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

              </div>
              <div className='flex justify-end mt-6'>
                <Button type="submit">Save Changes</Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  );
}
