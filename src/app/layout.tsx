import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AppHeader } from '@/components/AppHeader';

export const metadata: Metadata = {
  title: 'SeatingSavvy',
  description: 'Design seating for events, create ticket types and assign them to specific sections.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background">
        <FirebaseClientProvider>
          <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1">
              {children}
            </main>
          </div>
        </FirebaseClientProvider>
        <Toaster />
      </body>
    </html>
  );
}
