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
import { ChevronDown, Triangle } from 'lucide-react';
import { useUser } from '@/firebase';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navLinks = [
  { href: '/', label: 'Events' },
  { href: '/organizer-profile', label: 'Organizer Profile' },
  { href: '/billing', label: 'Billing' },
  { href: '/team', label: 'Team' },
  { href: '/integrations', label: 'Integrations' },
];

export function AppHeader() {
  const { user } = useUser();
  const pathname = usePathname();
  const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2">
              <Triangle className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Sherjil Baig Events</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 text-sm">
                  Switch organizer
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Organizations</DropdownMenuLabel>
                <DropdownMenuItem>Sherjil Baig Events</DropdownMenuItem>
                <DropdownMenuItem>My Other Org</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-4">
            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map(link => (
                <Button
                  key={link.href}
                  asChild
                  variant="ghost"
                  className={cn(
                    'text-sm font-medium',
                    pathname === link.href ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  <Link href={link.href}>{link.label}</Link>
                </Button>
              ))}
            </nav>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={userAvatar.description} />}
                    <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.isAnonymous ? 'Anonymous User' : user?.displayName || 'User'}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.isAnonymous ? 'anon@example.com' : user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Log out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
