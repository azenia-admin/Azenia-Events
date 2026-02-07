'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import CreateTicketSidebar from '@/components/CreateTicketSidebar';
import { supabase } from '@/lib/supabase';
import { Info, PlusCircle, Settings, Pencil, GripVertical, LayoutGrid, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useSearchParams, useRouter } from 'next/navigation';
import React, { useCallback, useEffect, useState } from 'react';
import EventLayoutClient from '../../EventLayoutClient';

interface Ticket {
  id: string;
  name: string;
  ticket_type: string;
  price: number;
  quantity: number;
  sold_count: number;
  approval_required: boolean;
  sales_end_at: string | null;
}

export default function SetupTicketsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const eventId = searchParams.get('eventId');

  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = useCallback(async () => {
    if (!eventId) return;

    const { data, error } = await supabase
      .from('tickets')
      .select('id, name, ticket_type, price, quantity, sold_count, approval_required, sales_end_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  }, [eventId]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleOpenVenueDesigner = () => {
    router.push(`/events/design/venue-designer?eventId=${eventId}`);
  };

  if (!eventId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Event Not Found</h1>
          <p className="text-muted-foreground">No event ID provided</p>
        </div>
      </div>
    );
  }

  return (
    <EventLayoutClient eventId={eventId}>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Set Up Tickets</h1>
        <Tabs defaultValue="tickets">
          <TabsList>
            <TabsTrigger value="tickets">Tickets</TabsTrigger>
            <TabsTrigger value="add-ons">Add-ons</TabsTrigger>
          </TabsList>
          <TabsContent value="tickets" className="space-y-6">
            <Card>
              <CardHeader>
                <Button variant="outline" onClick={() => setCreateTicketOpen(true)}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Ticket
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead></TableHead>
                      <TableHead>Ticket name</TableHead>
                      <TableHead>Quantity available</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Approval</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8">
                          <Loader2 className="h-5 w-5 animate-spin mx-auto text-muted-foreground" />
                        </TableCell>
                      </TableRow>
                    ) : tickets.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                          No tickets yet. Create one to get started.
                        </TableCell>
                      </TableRow>
                    ) : (
                      tickets.map((ticket) => (
                        <TableRow key={ticket.id}>
                          <TableCell>
                            <GripVertical className="h-5 w-5 text-muted-foreground" />
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{ticket.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {ticket.sales_end_at
                                ? `Ends ${format(new Date(ticket.sales_end_at), 'MMM d, yyyy h:mm a')}`
                                : 'No end date'}
                            </div>
                          </TableCell>
                          <TableCell>{ticket.quantity}</TableCell>
                          <TableCell>
                            {ticket.ticket_type === 'free' ? 'Free' : `$${Number(ticket.price).toFixed(0)}`}
                          </TableCell>
                          <TableCell>{ticket.approval_required ? 'Yes' : 'No'}</TableCell>
                          <TableCell className="space-x-2">
                            <Button variant="ghost" size="icon">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card className="bg-muted/50">
              <CardContent className="p-6 flex items-center justify-between">
                <p className="text-sm">
                  Open the Venue Designer to set-up assigned seating for your event.
                </p>
                <Button onClick={handleOpenVenueDesigner}>
                  <LayoutGrid className="mr-2 h-4 w-4" />
                  Open Venue Designer
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6 grid gap-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-remaining-tickets">Show the number of remaining tickets and Add-ons</Label>
                  <Switch id="show-remaining-tickets" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="show-registration-button">Show the Registration Button</Label>
                  <Switch id="show-registration-button" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="show-ticket-prices">Show ticket prices above the Registration Button</Label>
                  <Switch id="show-ticket-prices" defaultChecked />
                </div>
                 <div className="flex items-center justify-between">
                  <Label htmlFor="limit-event-capacity">Limit Event Capacity</Label>
                  <Switch id="limit-event-capacity" defaultChecked/>
                </div>

                <div className="grid grid-cols-2 items-center gap-4 pl-4 border-l-2 ml-2">
                   <div className="space-y-1">
                      <Label htmlFor="registrants-allowed" className="flex items-center gap-1 text-sm">Number of Registrants Allowed per Event <Info className="size-3 text-muted-foreground" /></Label>
                      <Input id="registrants-allowed" type="number" defaultValue={100} className="w-24"/>
                   </div>
                   <div className="space-y-4 text-sm text-muted-foreground">
                      <div className="flex justify-between">
                          <span>Total Number of Event Tickets</span>
                          <span>200</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Current Registrations</span>
                          <span>0</span>
                      </div>
                       <div className="flex justify-between">
                          <span>Event Slots Remaining</span>
                          <span>100</span>
                      </div>
                   </div>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="allow-ticket-exchanges">Allow Ticket Exchanges</Label>
                  <Switch id="allow-ticket-exchanges" />
                </div>

              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle>Custom Invoice Text</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="border rounded-md">
                      <div className="p-2 border-b">
                          <span className="text-sm text-muted-foreground">B 𝐼 𝑈 <u>A</u> A▾ A A▾ ...</span>
                      </div>
                      <Textarea
                          placeholder="nbd"
                          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          rows={4}
                      />
                      <div className="p-2 border-t text-right text-sm text-muted-foreground">
                          Characters: 3/300
                      </div>
                  </div>
              </CardContent>
            </Card>

          </TabsContent>
          <TabsContent value="add-ons">
              <Card>
                  <CardHeader>
                      <CardTitle>Add-ons</CardTitle>
                      <CardDescription>Manage add-ons for your event here.</CardDescription>
                  </CardHeader>
                  <CardContent>
                      <p>Add-ons functionality is not yet implemented.</p>
                  </CardContent>
              </Card>
          </TabsContent>
        </Tabs>

        <CreateTicketSidebar
          open={createTicketOpen}
          onOpenChange={setCreateTicketOpen}
          eventId={eventId}
          onTicketCreated={fetchTickets}
        />
      </div>
    </EventLayoutClient>
  );
}
