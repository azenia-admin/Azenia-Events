'use client';

import Link from 'next/link';

interface EventLandingFooterProps {
  eventName: string;
}

export default function EventLandingFooter({ eventName }: EventLandingFooterProps) {
  return (
    <div className="text-center space-y-3 py-6">
      <p className="text-sm font-medium text-blue-600">SeatingSavvy Events</p>
      <p className="text-sm text-gray-600">
        Organizer of <span className="font-medium text-gray-900">{eventName}</span>
      </p>
      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          href="/"
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
        >
          More Events
        </Link>
        <button className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors">
          Contact
        </button>
      </div>
    </div>
  );
}
