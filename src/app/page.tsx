'use client';

import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { CreateEventForm } from '@/components/CreateEventForm';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();

  const eventsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'events'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: events, isLoading: areEventsLoading } = useCollection(eventsQuery);

  const eventImages = [
    PlaceHolderImages.find(p => p.id === 'event-1'),
    PlaceHolderImages.find(p => p.id === 'event-2'),
    PlaceHolderImages.find(p => p.id === 'event-3'),
  ];

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold font-headline tracking-tight">Events Dashboard</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="font-headline">Create New Event</DialogTitle>
              <DialogDescription>
                Fill in the details below to create a new event.
              </DialogDescription>
            </DialogHeader>
            <CreateEventForm />
          </DialogContent>
        </Dialog>
      </div>

      {(isUserLoading || areEventsLoading) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="p-0">
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="p-4">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6 mt-1" />
              </CardContent>
              <CardFooter className="p-4 bg-muted/50 flex flex-col items-start gap-2">
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-2/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {!isUserLoading && !areEventsLoading && events && events.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
          <h2 className="text-xl font-semibold">No Events Found</h2>
          <p className="text-muted-foreground mt-2">Get started by creating your first event.</p>
        </div>
      )}

      {!isUserLoading && !areEventsLoading && events && events.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event, index) => {
            const image = eventImages[index % eventImages.length];
            const eventDate = (event.date as any)?.toDate ? (event.date as any).toDate() : new Date(event.date);
            const status = eventDate > new Date() ? 'Upcoming' : 'Past';

            return (
              <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardHeader className="p-0">
                  {image && (
                    <div className="relative h-48 w-full">
                      <Image
                        src={image.imageUrl}
                        alt={image.description}
                        fill
                        className="object-cover"
                        data-ai-hint={image.imageHint}
                      />
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4 flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <CardTitle className="text-lg font-headline font-bold leading-tight">
                      <Link href={`/events/${event.id}`} className="hover:text-primary transition-colors">
                        {event.name}
                      </Link>
                    </CardTitle>
                    <Badge variant={status === 'Upcoming' ? 'default' : 'secondary'} className={status === 'Upcoming' ? `bg-accent text-accent-foreground` : ''}>{status}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                </CardContent>
                <CardFooter className="p-4 bg-muted/50 flex flex-col items-start gap-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" />
                        <span>{eventDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{event.location}</span>
                    </div>
                </CardFooter>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  );
}
