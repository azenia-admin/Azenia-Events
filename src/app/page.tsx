'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PlusCircle, Search, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PlaceHolderImages } from '@/lib/placeholder-images';

export default function DashboardPage() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const eventsQuery = useMemoFirebase(() => {
    if (!user) return null;
    return query(collection(firestore, 'events'), where('userId', '==', user.uid));
  }, [firestore, user]);

  const { data: events, isLoading: areEventsLoading } = useCollection(eventsQuery);

  const eventImage = PlaceHolderImages.find(p => p.id === 'event-1');

  const filteredEvents = events?.filter(event => 
    event.name.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const now = new Date();
  const activeAndUpcomingEvents = filteredEvents.filter(event => (event.date as any)?.toDate ? (event.date as any).toDate() >= now : new Date(event.date) >= now);
  const pastEvents = filteredEvents.filter(event => (event.date as any)?.toDate ? (event.date as any).toDate() < now : new Date(event.date) < now);


  const renderEventTable = (eventList: typeof filteredEvents) => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40%]">Name</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Revenue</TableHead>
          <TableHead>Registrations</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {eventList.length > 0 ? eventList.map((event) => {
          const eventDate = (event.date as any)?.toDate ? (event.date as any).toDate() : new Date(event.date);
          return (
            <TableRow key={event.id}>
              <TableCell>
                <div className="flex items-center gap-4">
                  {eventImage && (
                     <Image
                        src={eventImage.imageUrl}
                        alt={eventImage.description}
                        width={60}
                        height={40}
                        className="rounded-sm object-cover"
                        data-ai-hint={eventImage.imageHint}
                      />
                  )}
                  <Link href={`/events/${event.id}`} className="font-medium hover:text-primary transition-colors">
                    {event.name}
                  </Link>
                </div>
              </TableCell>
              <TableCell>{eventDate.toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</TableCell>
              <TableCell>$0.00</TableCell>
              <TableCell>1</TableCell>
              <TableCell>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/events/${event.id}`}>Preview</Link>
                </Button>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View</DropdownMenuItem>
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        }) : (
          <TableRow>
            <TableCell colSpan={6} className="h-24 text-center">
              No events found.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );

  return (
    <div className="flex-1 space-y-4 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Events</h1>
          <p className="text-muted-foreground">The table below shows all of the events owned by you.</p>
        </div>
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

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Active & Upcoming</TabsTrigger>
          <TabsTrigger value="past">Past</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>
        <div className="mt-4 border rounded-lg bg-card text-card-foreground shadow-sm">
          <div className="p-4 flex justify-between items-center border-b">
             <p className="font-semibold">{filteredEvents.length} Event{filteredEvents.length !== 1 && 's'}</p>
             <div className="relative w-full max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input 
                  type="search" 
                  placeholder="Search..." 
                  className="pl-8" 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
          </div>
          <TabsContent value="active" className="m-0">
             {(isUserLoading || areEventsLoading) ? (
                <div className="p-4">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : renderEventTable(activeAndUpcomingEvents)}
          </TabsContent>
          <TabsContent value="past" className="m-0">
            {(isUserLoading || areEventsLoading) ? (
                <div className="p-4">
                  <Skeleton className="h-40 w-full" />
                </div>
              ) : renderEventTable(pastEvents)}
          </TabsContent>
          <TabsContent value="templates" className="m-0">
            <div className="p-10 text-center text-muted-foreground">Template functionality is not yet implemented.</div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
