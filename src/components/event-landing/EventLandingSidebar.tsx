'use client';

import { format } from 'date-fns';
import { Calendar, Clock, Ticket, Linkedin, Facebook, Mail } from 'lucide-react';

interface EventLandingSidebarProps {
  eventName: string;
  eventDate: Date | null;
  location?: string;
  priceRange: string | null;
}

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export default function EventLandingSidebar({
  eventName,
  eventDate,
  location,
  priceRange,
}: EventLandingSidebarProps) {
  const dateStr = eventDate ? format(eventDate, 'EEE, MMM d') : null;
  const fullDateStr = eventDate
    ? format(eventDate, "EEE, MMM d, yyyy 'from' h:mm a")
    : null;

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${eventName}`;
    const urls: Record<string, string> = {
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      x: `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
      email: `mailto:?subject=${encodeURIComponent(eventName)}&body=${encodeURIComponent(`${text}: ${url}`)}`,
    };
    if (platform === 'email') {
      window.location.href = urls[platform];
    } else {
      window.open(urls[platform], '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="lg:sticky lg:top-24 space-y-6">
      <div className="border rounded-lg p-6 space-y-5">
        <h2 className="text-xl font-semibold text-gray-900">{eventName}</h2>

        <div className="space-y-3">
          {dateStr && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{dateStr} - {dateStr}</span>
            </div>
          )}
          {dateStr && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>9:00 AM - 11:59 PM (CST)</span>
            </div>
          )}
          {priceRange && (
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <Ticket className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span>{priceRange}</span>
            </div>
          )}
        </div>

        <button className="w-full py-2.5 rounded-full bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors text-sm">
          Register Now
        </button>
        <p className="text-center text-xs text-gray-500">
          Already registered?{' '}
          <button className="text-blue-600 hover:underline font-medium">Sign In</button>
        </p>
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-red-600">Date & Time :</h3>
        {fullDateStr && (
          <div className="flex items-start gap-3">
            <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm text-blue-600">{fullDateStr}</p>
              <button className="text-xs text-blue-600 hover:underline mt-1">Add To Calendar</button>
            </div>
          </div>
        )}
        {location && (
          <p className="text-sm text-gray-600">{location}</p>
        )}
      </div>

      <div className="border rounded-lg p-6 space-y-4">
        <h3 className="text-sm font-semibold text-red-600">Share this event :</h3>
        <div className="flex gap-3">
          <button
            onClick={() => handleShare('linkedin')}
            className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-blue-700 hover:border-blue-700 transition-colors"
          >
            <Linkedin className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleShare('facebook')}
            className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
          >
            <Facebook className="h-4 w-4" />
          </button>
          <button
            onClick={() => handleShare('x')}
            className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-colors"
          >
            <XIcon className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => handleShare('email')}
            className="w-9 h-9 rounded-full border flex items-center justify-center text-gray-500 hover:text-blue-600 hover:border-blue-600 transition-colors"
          >
            <Mail className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
