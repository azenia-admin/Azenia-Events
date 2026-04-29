'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { CalendarIcon, ChevronDown, PlusCircle, Lock, Info } from 'lucide-react';
import { format } from 'date-fns';
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

type TicketType = 'paid' | 'free' | 'donation';

interface CreateTicketSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  onTicketCreated?: () => void;
}

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

function DateTimePicker({
  label,
  date,
  onDateChange,
  hour,
  onHourChange,
  minute,
  onMinuteChange,
  period,
  onPeriodChange,
}: {
  label: string;
  date: Date | undefined;
  onDateChange: (d: Date | undefined) => void;
  hour: string;
  onHourChange: (h: string) => void;
  minute: string;
  onMinuteChange: (m: string) => void;
  period: string;
  onPeriodChange: (p: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <div className="grid grid-cols-[1fr_auto_auto_auto] gap-2 items-center">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'justify-start text-left font-normal h-10 text-sm',
                !date && 'text-muted-foreground'
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, 'M/d/yyyy') : 'Pick a date'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar mode="single" selected={date} onSelect={onDateChange} initialFocus />
          </PopoverContent>
        </Popover>
        <div className="flex items-center gap-1">
          <Input
            className="w-14 h-10 text-center text-sm"
            value={hour}
            onChange={(e) => onHourChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="09"
          />
          <span className="text-muted-foreground">:</span>
          <Input
            className="w-14 h-10 text-center text-sm"
            value={minute}
            onChange={(e) => onMinuteChange(e.target.value.replace(/\D/g, '').slice(0, 2))}
            placeholder="00"
          />
        </div>
        <Select value={period} onValueChange={onPeriodChange}>
          <SelectTrigger className="w-[72px] h-10 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="AM">AM</SelectItem>
            <SelectItem value="PM">PM</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

function buildDateTime(date: Date | undefined, hour: string, minute: string, period: string): string | null {
  if (!date) return null;
  let h = parseInt(hour, 10);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  const d = new Date(date);
  d.setHours(h, parseInt(minute, 10), 0, 0);
  return d.toISOString();
}

export default function CreateTicketSidebar({ open, onOpenChange, eventId, onTicketCreated }: CreateTicketSidebarProps) {
  const [ticketType, setTicketType] = useState<TicketType>('paid');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('0');
  const [price, setPrice] = useState('0');
  const [approvalRequired, setApprovalRequired] = useState(false);
  const [minPerOrder, setMinPerOrder] = useState('0');
  const [maxPerOrder, setMaxPerOrder] = useState('10');
  const [feeOption, setFeeOption] = useState('pass');
  const [salesStartDate, setSalesStartDate] = useState<Date | undefined>(new Date());
  const [salesStartHour, setSalesStartHour] = useState('09');
  const [salesStartMinute, setSalesStartMinute] = useState('00');
  const [salesStartPeriod, setSalesStartPeriod] = useState('AM');
  const [salesEndDate, setSalesEndDate] = useState<Date | undefined>(new Date());
  const [salesEndHour, setSalesEndHour] = useState('11');
  const [salesEndMinute, setSalesEndMinute] = useState('59');
  const [salesEndPeriod, setSalesEndPeriod] = useState('PM');
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [assignedSeating, setAssignedSeating] = useState(false);
  const [ticketInvoicePdf, setTicketInvoicePdf] = useState('default');
  const [confirmationPage, setConfirmationPage] = useState('default');
  const [confirmationEmail, setConfirmationEmail] = useState('default');
  const [trackRestriction, setTrackRestriction] = useState('none');
  const [tagInput, setTagInput] = useState('');
  const [bundleType, setBundleType] = useState('block');
  const [ticketsPerBlock, setTicketsPerBlock] = useState('4');

  const buyerPrice = ticketType === 'free' ? 0 : Number(price) || 0;
  const revenuePerTicket = feeOption === 'pass' ? buyerPrice : buyerPrice;

  const resetForm = () => {
    setTicketType('paid');
    setName('');
    setQuantity('0');
    setPrice('0');
    setApprovalRequired(false);
    setMinPerOrder('0');
    setMaxPerOrder('10');
    setFeeOption('pass');
    setSalesStartDate(new Date());
    setSalesStartHour('09');
    setSalesStartMinute('00');
    setSalesStartPeriod('AM');
    setSalesEndDate(new Date());
    setSalesEndHour('11');
    setSalesEndMinute('59');
    setSalesEndPeriod('PM');
    setAdvancedOpen(false);
    setAssignedSeating(false);
    setTicketInvoicePdf('default');
    setConfirmationPage('default');
    setConfirmationEmail('default');
    setTrackRestriction('none');
    setTagInput('');
    setBundleType('block');
    setTicketsPerBlock('4');
  };

  const handleCancel = () => {
    resetForm();
    onOpenChange(false);
  };

  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);

    const { error } = await supabase.from('tickets').insert({
      event_id: eventId,
      name: name.trim(),
      ticket_type: ticketType,
      price: ticketType === 'free' ? 0 : parseFloat(price) || 0,
      quantity: parseInt(quantity, 10) || 0,
      approval_required: approvalRequired,
      min_per_order: parseInt(minPerOrder, 10) || 0,
      max_per_order: parseInt(maxPerOrder, 10) || 10,
      fee_option: feeOption,
      sales_start_at: buildDateTime(salesStartDate, salesStartHour, salesStartMinute, salesStartPeriod),
      sales_end_at: buildDateTime(salesEndDate, salesEndHour, salesEndMinute, salesEndPeriod),
      assigned_seating: assignedSeating,
      ticket_invoice_pdf: ticketInvoicePdf,
      confirmation_page: confirmationPage,
      confirmation_email: confirmationEmail,
      track_restriction: trackRestriction,
      tag_restrictions: tagInput,
      bundle_type: bundleType,
      tickets_per_bundle: parseInt(ticketsPerBlock, 10) || 4,
    });

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Could not save ticket',
        description: error.message,
      });
      return;
    }

    onOpenChange(false);
    resetForm();
    onTicketCreated?.();
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="sm:max-w-lg w-full p-0 flex flex-col">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle className="text-xl">Create Ticket</SheetTitle>
          <SheetDescription className="sr-only">
            Create a new ticket type for your event
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="flex-1">
          <div className="px-6 py-6 space-y-6">
            <div className="flex gap-2">
              <Button
                variant={ticketType === 'paid' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTicketType('paid')}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Paid Ticket
              </Button>
              <Button
                variant={ticketType === 'free' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTicketType('free')}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Free Ticket
              </Button>
              <Button
                variant={ticketType === 'donation' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTicketType('donation')}
                className="gap-1.5"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                Donation
              </Button>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ticket-name">
                Name<span className="text-destructive">*</span>
              </Label>
              <Input
                id="ticket-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="General Admission"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ticket-quantity">
                  Quantity<span className="text-destructive">*</span>
                </Label>
                <Input
                  id="ticket-quantity"
                  type="number"
                  min="0"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ticket-price">
                  Price<span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    $
                  </span>
                  <Input
                    id="ticket-price"
                    type="number"
                    min="0"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="pl-7"
                    disabled={ticketType === 'free'}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-right">
                  Buyer price: ${buyerPrice.toFixed(0)}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Label htmlFor="approval-required" className="text-sm">
                  Approval Required
                </Label>
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                  <Lock className="h-3 w-3" />
                  Upgrade
                </span>
              </div>
              <Switch
                id="approval-required"
                checked={approvalRequired}
                onCheckedChange={setApprovalRequired}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Tickets allowed per order</Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Input
                    type="number"
                    min="0"
                    value={minPerOrder}
                    onChange={(e) => setMinPerOrder(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Minimum</p>
                </div>
                <div className="space-y-1">
                  <Input
                    type="number"
                    min="0"
                    value={maxPerOrder}
                    onChange={(e) => setMaxPerOrder(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Maximum</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Fees</Label>
              <Select value={feeOption} onValueChange={setFeeOption}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pass">Pass fees on to ticket buyer</SelectItem>
                  <SelectItem value="absorb">Absorb fees</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Revenue per ticket: ${revenuePerTicket.toFixed(0)}
              </p>
            </div>

            <DateTimePicker
              label="Sales Start (CST)"
              date={salesStartDate}
              onDateChange={setSalesStartDate}
              hour={salesStartHour}
              onHourChange={setSalesStartHour}
              minute={salesStartMinute}
              onMinuteChange={setSalesStartMinute}
              period={salesStartPeriod}
              onPeriodChange={setSalesStartPeriod}
            />

            <DateTimePicker
              label="Sales End (CST)"
              date={salesEndDate}
              onDateChange={setSalesEndDate}
              hour={salesEndHour}
              onHourChange={setSalesEndHour}
              minute={salesEndMinute}
              onMinuteChange={setSalesEndMinute}
              period={salesEndPeriod}
              onPeriodChange={setSalesEndPeriod}
            />

            <Collapsible open={advancedOpen} onOpenChange={setAdvancedOpen}>
              <CollapsibleTrigger className="flex items-center gap-1 text-sm font-medium hover:underline">
                Advanced Settings
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform',
                    advancedOpen && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4 space-y-6">
                <div className="flex items-center justify-between">
                  <Label htmlFor="assigned-seating" className="text-sm">
                    Assigned Seating
                  </Label>
                  <Switch
                    id="assigned-seating"
                    checked={assignedSeating}
                    onCheckedChange={setAssignedSeating}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm flex items-center gap-1">
                    Ticket Invoice PDF Design<span className="text-destructive">*</span>
                    <Info className="h-3.5 w-3.5 text-muted-foreground" />
                  </Label>
                  <Select value={ticketInvoicePdf} onValueChange={setTicketInvoicePdf}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Ticket PDF Design</SelectItem>
                      <SelectItem value="custom">Custom PDF Design</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-semibold">Order Confirmation</h4>

                  <div className="space-y-2">
                    <Label className="text-sm flex items-center gap-1">
                      Confirmation Page<span className="text-destructive">*</span>
                      <Info className="h-3.5 w-3.5 text-muted-foreground" />
                    </Label>
                    <Select value={confirmationPage} onValueChange={setConfirmationPage}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Order Confirmation</SelectItem>
                        <SelectItem value="custom">Custom Confirmation Page</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm">
                      Confirmation Email<span className="text-destructive">*</span>
                    </Label>
                    <Select value={confirmationEmail} onValueChange={setConfirmationEmail}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="default">Default Email Template</SelectItem>
                        <SelectItem value="custom">Custom Email Template</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Track Restrictions</Label>
                  <p className="text-xs text-muted-foreground">
                    Ticket holders will not be able to join sessions with the following tracks.
                  </p>
                  <Select value={trackRestriction} onValueChange={setTrackRestriction}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No tracks selected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Tag Restrictions</Label>
                  <p className="text-xs text-muted-foreground">
                    Ticket holders will not be able to join sessions with the following tags.
                  </p>
                  <Textarea
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    placeholder="Type to search or create a new tag"
                    rows={2}
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Bundle Type</Label>
                  <Select value={bundleType} onValueChange={setBundleType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="block">Block</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Number of tickets per {bundleType.toUpperCase()}
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={ticketsPerBlock}
                    onChange={(e) => setTicketsPerBlock(e.target.value)}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </ScrollArea>

        <div className="flex gap-3 justify-start px-6 py-4 border-t">
          <Button onClick={handleSave} disabled={saving || !name.trim()}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
