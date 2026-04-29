'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check, Building2, Plus } from 'lucide-react';
import { useUser, useAuth } from '@/lib/supabase-auth';
import { useOrganization } from '@/lib/organization';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/dashboard', label: 'Events' },
  { href: '/seating', label: 'Seating Designer' },
  { href: '/organizer-profile', label: 'Organizer Profile' },
  { href: '/billing', label: 'Billing' },
  { href: '/team', label: 'Team' },
  { href: '/integrations', label: 'Integrations' },
];

export function AppHeader() {
  const { user } = useUser();
  const { signOut } = useAuth();
  const { organizations, currentOrganization, setCurrentOrganization } = useOrganization();
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find((p) => p.id === 'user-avatar');

  if (pathname === '/e' || pathname.startsWith('/e?')) return null;
  if (pathname === '/') return null;
  if (!user) return null;

  const isAnonymous = user?.is_anonymous ?? false;
  const displayName = user?.user_metadata?.display_name || user?.email?.split('@')[0] || 'User';

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  return (
    <header className="border-b border-[#E8DFD3] bg-[#FAF6F1]/90 backdrop-blur sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-[#1B1A17] flex items-center justify-center">
                <span className="text-[#E8A355] font-headline font-bold text-sm">S</span>
              </div>
              <span className="font-headline font-bold text-lg tracking-tight text-[#1B1A17]">
                SeatingSavvy
              </span>
            </Link>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="hidden md:flex items-center gap-2 text-sm text-[#1B1A17] hover:bg-[#F0E6D6] rounded-full pl-2 pr-3 h-9 border border-[#E8DFD3]"
                >
                  <div className="h-6 w-6 rounded-md bg-[#E8A355]/20 border border-[#E8A355]/30 flex items-center justify-center">
                    <Building2 className="h-3 w-3 text-[#D97757]" />
                  </div>
                  <span className="max-w-[160px] truncate font-medium">
                    {currentOrganization?.name || 'No organization'}
                  </span>
                  <ChevronDown className="h-4 w-4 text-[#8A8378]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-64">
                <DropdownMenuLabel className="text-xs text-[#8A8378] uppercase tracking-wider">
                  Your organizations
                </DropdownMenuLabel>
                {organizations.map((org) => (
                  <DropdownMenuItem
                    key={org.id}
                    onClick={() => setCurrentOrganization(org)}
                    className="flex items-center justify-between gap-2 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="h-7 w-7 rounded-md bg-[#F0E6D6] border border-[#E8DFD3] flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-3.5 w-3.5 text-[#D97757]" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium">{org.name}</p>
                        {org.is_primary && (
                          <p className="text-xs text-[#8A8378]">Primary</p>
                        )}
                      </div>
                    </div>
                    {currentOrganization?.id === org.id && (
                      <Check className="h-4 w-4 text-[#3F704D] flex-shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/organizer-profile" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Manage organizations
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    'text-sm font-medium rounded-full px-4 hover:bg-[#F0E6D6]',
                    isActive(link.href)
                      ? 'text-[#1B1A17] bg-[#F0E6D6]'
                      : 'text-[#55514B] hover:text-[#1B1A17]'
                  )}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-9 w-9 rounded-full ring-1 ring-[#E8DFD3] hover:ring-[#D97757]/40"
                >
                  <Avatar className="h-8 w-8">
                    {userAvatar && (
                      <AvatarImage src={userAvatar.imageUrl} alt={userAvatar.description} />
                    )}
                    <AvatarFallback className="bg-[#1B1A17] text-[#E8A355]">
                      {user?.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {isAnonymous ? 'Anonymous User' : displayName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isAnonymous ? 'anon@example.com' : user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
