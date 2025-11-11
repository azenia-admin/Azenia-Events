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

const events = [
  {
    id: 'evt-1',
    name: 'AI in Tech Conference 2024',
    description: 'The premier conference for AI enthusiasts and professionals, exploring the latest trends and breakthroughs.',
    date: '2024-10-26',
    location: 'Metropolis Convention Center',
    image: PlaceHolderImages.find(p => p.id === 'event-1'),
    status: 'Upcoming',
  },
  {
    id: 'evt-2',
    name: 'Future of Web Development',
    description: 'A deep dive into the next generation of web technologies, from server components to edge computing.',
    date: '2024-11-15',
    location: 'Grand Tech Arena',
    image: PlaceHolderImages.find(p => p.id === 'event-2'),
    status: 'Upcoming',
  },
  {
    id: 'evt-3',
    name: 'Founder & Investor Mixer',
    description: 'An exclusive networking event for tech founders and investors to connect and build relationships.',
    date: '2024-09-30',
    location: 'The Skyline Club',
    image: PlaceHolderImages.find(p => p.id === 'event-3'),
    status: 'Past',
  },
];

export default function DashboardPage() {
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {events.map((event) => (
          <Card key={event.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="p-0">
              {event.image && (
                <div className="relative h-48 w-full">
                  <Image
                    src={event.image.imageUrl}
                    alt={event.image.description}
                    fill
                    className="object-cover"
                    data-ai-hint={event.image.imageHint}
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
                <Badge variant={event.status === 'Upcoming' ? 'default' : 'secondary'} className={event.status === 'Upcoming' ? `bg-accent text-accent-foreground` : ''}>{event.status}</Badge>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
            </CardContent>
            <CardFooter className="p-4 bg-muted/50 flex flex-col items-start gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    <span>{new Date(event.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{event.location}</span>
                </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
