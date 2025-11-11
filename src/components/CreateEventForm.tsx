"use client";

import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import { useAuth, useUser, useFirestore, addDocumentNonBlocking } from '@/firebase';
import { collection } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { initiateAnonymousSignIn } from "@/firebase/non-blocking-login";
import { DialogClose } from "@/components/ui/dialog";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters."),
  description: z.string().optional(),
  date: z.date({
    required_error: "A date is required.",
  }),
  location: z.string().min(2, "Location must be at least 2 characters."),
});

export function CreateEventForm() {
  const auth = useAuth();
  const { user } = useUser();
  const firestore = useFirestore();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!firestore) return;

    let currentUserId = user?.uid;

    if (!currentUserId) {
      initiateAnonymousSignIn(auth);
      toast({
        title: "Signing in...",
        description: "Please try again in a moment.",
      });
      return;
    }

    try {
      const newEvent = {
        ...values,
        userId: currentUserId,
      };
      
      const eventsCollection = collection(firestore, 'events');
      await addDocumentNonBlocking(eventsCollection, newEvent);

      toast({
        title: "Event Created!",
        description: `${values.name} has been successfully created.`,
      });
      
      // Close the dialog by finding the close button and clicking it
      // This is a bit of a workaround, but necessary without controlling dialog state from here
      document.querySelector('[data-radix-dialog-close]')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "There was a problem with your request.",
      });
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
              <FormLabel>Event Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g. AI in Tech Conference" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about the event"
                  className="resize-none"
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
              <FormLabel>Date</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0,0,0,0))
                    }
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
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Metropolis Convention Center" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full">Create Event</Button>
      </form>
    </Form>
  );
}
