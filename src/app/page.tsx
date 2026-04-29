'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowRight,
  Calendar,
  LayoutGrid,
  Ticket,
  Sparkles,
  Check,
  Users,
  BarChart3,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthDialog } from '@/components/AuthDialog';
import { useUser } from '@/lib/supabase-auth';

type AuthMode = 'signin' | 'signup';

export default function LandingPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  useEffect(() => {
    if (!isLoading && user) {
      router.replace('/dashboard');
    }
  }, [user, isLoading, router]);

  const openAuth = (mode: AuthMode) => {
    setAuthMode(mode);
    setAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F1] text-[#1B1A17]">
      <header className="sticky top-0 z-40 bg-[#FAF6F1]/85 backdrop-blur border-b border-[#E8DFD3]">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#1B1A17] flex items-center justify-center">
              <span className="text-[#E8A355] font-headline font-bold text-sm">S</span>
            </div>
            <span className="font-headline font-bold text-lg tracking-tight">SeatingSavvy</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <a href="#features" className="text-[#55514B] hover:text-[#1B1A17] transition-colors">
              Features
            </a>
            <a href="#solutions" className="text-[#55514B] hover:text-[#1B1A17] transition-colors">
              Solutions
            </a>
            <a href="#pricing" className="text-[#55514B] hover:text-[#1B1A17] transition-colors">
              Pricing
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={() => openAuth('signin')}
              className="text-[#1B1A17] hover:bg-[#F0E6D6]"
            >
              Sign in
            </Button>
            <Button
              onClick={() => openAuth('signup')}
              className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-5"
            >
              Get started
            </Button>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden">
        <div className="container mx-auto px-6 pt-20 pb-24 lg:pt-28 lg:pb-32">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#E8DFD3] bg-white/60 px-4 py-1.5 text-xs font-medium text-[#55514B] mb-8">
              <span className="h-1.5 w-1.5 rounded-full bg-[#D97757]" />
              The all-in-one event platform
            </div>
            <h1 className="font-headline text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.05]">
              Events worth
              <br />
              <span className="italic text-[#D97757]">remembering.</span>
            </h1>
            <p className="mt-8 text-lg md:text-xl text-[#55514B] max-w-2xl leading-relaxed">
              Design venues, sell tickets, and manage registrations in one beautifully simple
              platform. From intimate gatherings to sold-out arenas.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                onClick={() => openAuth('signup')}
                className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-7 h-12 text-base group"
              >
                Start for free
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Button>
              <Button
                size="lg"
                variant="ghost"
                onClick={() => openAuth('signin')}
                className="text-[#1B1A17] hover:bg-[#F0E6D6] rounded-full px-7 h-12 text-base"
              >
                Sign in to your account
              </Button>
            </div>
            <div className="mt-8 flex items-center gap-6 text-sm text-[#55514B]">
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#3F704D]" />
                No credit card required
              </div>
              <div className="flex items-center gap-2">
                <Check className="h-4 w-4 text-[#3F704D]" />
                Free forever plan
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-6 pb-24">
          <div className="relative rounded-3xl overflow-hidden border border-[#E8DFD3] shadow-2xl shadow-[#1B1A17]/10">
            <Image
              src="https://images.pexels.com/photos/976866/pexels-photo-976866.jpeg?auto=compress&cs=tinysrgb&w=1600"
              alt="Event venue"
              width={1600}
              height={900}
              className="w-full h-auto object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1A17]/40 via-transparent to-transparent" />
          </div>
        </div>
      </section>

      <section id="features" className="bg-[#1B1A17] text-[#FAF6F1] py-24">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mb-16">
            <p className="text-[#E8A355] text-sm font-medium tracking-wider uppercase mb-4">
              Everything you need
            </p>
            <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight">
              One platform. <span className="italic text-[#E8A355]">Every detail.</span>
            </h2>
            <p className="mt-6 text-lg text-[#C9C1B5] leading-relaxed">
              Built by event organizers, for event organizers. Every feature is crafted to save you
              time and delight your attendees.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: LayoutGrid,
                title: 'Visual venue designer',
                desc: 'Drag-and-drop seats, stages, and sections. See exactly what your attendees will see.',
              },
              {
                icon: Ticket,
                title: 'Flexible ticketing',
                desc: 'Multi-tier pricing, promo codes, early bird discounts, and waitlists built in.',
              },
              {
                icon: Calendar,
                title: 'Registration flows',
                desc: 'Custom forms, automated confirmations, and a branded attendee experience.',
              },
              {
                icon: BarChart3,
                title: 'Real-time analytics',
                desc: 'Track sales, revenue, and attendance as it happens. Export everything.',
              },
              {
                icon: Users,
                title: 'Team collaboration',
                desc: 'Invite your team with role-based access. Everyone sees the same source of truth.',
              },
              {
                icon: Sparkles,
                title: 'AI layout suggestions',
                desc: 'Let our AI optimize seating arrangements based on your venue and audience.',
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[#33302A] bg-[#201E1A] p-8 transition-all hover:border-[#E8A355]/40 hover:bg-[#26231F]"
              >
                <div className="h-11 w-11 rounded-xl bg-[#E8A355]/10 border border-[#E8A355]/20 flex items-center justify-center mb-6 transition-transform group-hover:scale-105">
                  <feature.icon className="h-5 w-5 text-[#E8A355]" />
                </div>
                <h3 className="font-headline text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-[#C9C1B5] leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="py-24 bg-[#FAF6F1]">
        <div className="container mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-[#D97757] text-sm font-medium tracking-wider uppercase mb-4">
                For every kind of event
              </p>
              <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                From conferences to concerts, weddings to workshops.
              </h2>
              <p className="mt-6 text-lg text-[#55514B] leading-relaxed">
                Whether you&apos;re hosting 20 or 20,000, SeatingSavvy adapts to your needs with
                powerful tools that stay out of your way.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  'Conferences & summits',
                  'Concerts & live music',
                  'Theater & performing arts',
                  'Corporate & private events',
                ].map((item) => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="h-6 w-6 rounded-full bg-[#3F704D]/10 flex items-center justify-center">
                      <Check className="h-3.5 w-3.5 text-[#3F704D]" />
                    </div>
                    <span className="text-[#1B1A17]">{item}</span>
                  </div>
                ))}
              </div>
              <Button
                onClick={() => openAuth('signup')}
                className="mt-10 bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-7 h-12"
              >
                Try it free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <div className="relative">
              <div className="rounded-3xl overflow-hidden border border-[#E8DFD3]">
                <Image
                  src="https://images.pexels.com/photos/2747449/pexels-photo-2747449.jpeg?auto=compress&cs=tinysrgb&w=1200"
                  alt="Event crowd"
                  width={1200}
                  height={1400}
                  className="w-full h-auto object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl border border-[#E8DFD3] p-6 shadow-xl hidden md:block">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-[#E8A355]/20 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-[#D97757]" />
                  </div>
                  <div>
                    <p className="text-2xl font-headline font-bold">12,438</p>
                    <p className="text-sm text-[#55514B]">Tickets sold this week</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 bg-[#F0E6D6]">
        <div className="container mx-auto px-6 text-center max-w-3xl">
          <p className="text-[#D97757] text-sm font-medium tracking-wider uppercase mb-4">
            Ready when you are
          </p>
          <h2 className="font-headline text-4xl md:text-5xl font-bold tracking-tight leading-[1.1]">
            Your next event <span className="italic text-[#D97757]">starts here.</span>
          </h2>
          <p className="mt-6 text-lg text-[#55514B] leading-relaxed">
            Join thousands of organizers using SeatingSavvy to create unforgettable experiences.
            Free to get started, scales as you grow.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              onClick={() => openAuth('signup')}
              className="bg-[#1B1A17] text-[#FAF6F1] hover:bg-[#2D2B26] rounded-full px-7 h-12 text-base"
            >
              Create your account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => openAuth('signin')}
              className="text-[#1B1A17] hover:bg-[#E8DFD3] rounded-full px-7 h-12 text-base"
            >
              Sign in
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#E8DFD3] bg-[#FAF6F1]">
        <div className="container mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-[#1B1A17] flex items-center justify-center">
              <span className="text-[#E8A355] font-headline font-bold text-xs">S</span>
            </div>
            <span className="font-headline font-bold">SeatingSavvy</span>
          </div>
          <p className="text-sm text-[#55514B]">
            &copy; {new Date().getFullYear()} SeatingSavvy. Crafted for organizers.
          </p>
        </div>
      </footer>

      <AuthDialog open={authOpen} onOpenChange={setAuthOpen} initialMode={authMode} />
    </div>
  );
}
