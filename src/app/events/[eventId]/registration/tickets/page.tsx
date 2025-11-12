
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
import { Separator } from '@/components/ui/separator';
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
import { Info, PlusCircle, Settings, Pencil, GripVertical, LayoutGrid } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react';
import { SeatsioDesignerModal } from '@/components/SeatsioDesignerModal';

const tickets = [
  {
    name: 'VIP',
    endDate: 'Ends Dec 11, 2025 11:59 PM',
    quantity: 100,
    price: 200,
    approval: 'No',
  },
  {
    name: 'General Admission',
    endDate: 'Ends Dec 11, 2025 11:59 PM',
    quantity: 100,
    price: 50,
    approval: 'No',
  },
];

export default function SetupTicketsPage() {
  const params = useParams();
  const eventId = params.eventId;
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);

  return (
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
              <Button variant="outline">
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
                  {tickets.map((ticket, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <GripVertical className="h-5 w-5 text-muted-foreground" />
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{ticket.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {ticket.endDate}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.quantity}</TableCell>
                      <TableCell>${ticket.price}</TableCell>
                      <TableCell>{ticket.approval}</TableCell>
                      <TableCell className="space-x-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg mb-1">Venue Designer</h3>
                <p className="text-sm text-muted-foreground">
                  Create and manage your venue floor plan with assigned seating
                </p>
              </div>
              <Button onClick={() => setIsDesignerOpen(true)}>
                <LayoutGrid className="mr-2 h-4 w-4" />
                Open Venue Designer
              </Button>
            </CardContent>
          </Card>

          <SeatsioDesignerModal
            open={isDesignerOpen}
            onOpenChange={setIsDesignerOpen}
            chartKey={`event-${eventId}`}
            secretKey={process.env.NEXT_PUBLIC_SEATSIO_SECRET_KEY || ''}
            region={process.env.NEXT_PUBLIC_SEATSIO_REGION || 'eu'}
          />
          
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
                {/* Placeholder for rich text editor */}
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
    </div>
  );
}
