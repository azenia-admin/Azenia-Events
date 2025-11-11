"use client";

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarTrigger,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarGroup,
  SidebarGroupLabel,
} from '@/components/ui/sidebar';
import { Home, BarChart2, Ticket, Settings, UserCircle, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const userAvatar = PlaceHolderImages.find(p => p.id === 'user-avatar');

const navItems = [
  { href: '/', icon: Home, label: 'Dashboard' },
  { href: '/analytics', icon: BarChart2, label: 'Analytics' },
  { href: '/tickets', icon: Ticket, label: 'Ticket Types' },
];

const settingsItem = { href: '/settings', icon: Settings, label: 'Settings' };
const logoutItem = { href: '/logout', icon: LogOut, label: 'Logout' };

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-headline">SeatingSavvy</h1>
            <SidebarTrigger />
          </div>
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={{ children: item.label, side: 'right', align: 'center' }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarGroup className="mt-auto">
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton 
                        asChild
                        isActive={pathname === settingsItem.href}
                        tooltip={{ children: settingsItem.label, side: 'right', align: 'center' }}
                    >
                        <Link href={settingsItem.href}>
                            <settingsItem.icon />
                            <span>{settingsItem.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                    <SidebarMenuButton
                        asChild
                        tooltip={{ children: logoutItem.label, side: 'right', align: 'center' }}
                    >
                        <Link href={logoutItem.href}>
                            <logoutItem.icon />
                            <span>{logoutItem.label}</span>
                        </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt={userAvatar.description} data-ai-hint={userAvatar.imageHint} />}
              <AvatarFallback>
                <UserCircle />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-semibold">Admin</span>
              <span className="text-sidebar-foreground/70">admin@seatingsavvy.com</span>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
