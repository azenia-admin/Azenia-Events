'use client';

interface EventLandingHeroProps {
  eventName: string;
}

export default function EventLandingHero({ eventName }: EventLandingHeroProps) {
  return (
    <div className="relative w-full aspect-[16/7] rounded-lg overflow-hidden bg-gray-900">
      <img
        src="https://images.pexels.com/photos/2774556/pexels-photo-2774556.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750"
        alt="Event banner"
        className="absolute inset-0 w-full h-full object-cover opacity-60"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/40 to-transparent" />
      <div className="absolute inset-0 flex items-center justify-center p-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center leading-tight drop-shadow-lg">
          {eventName}
        </h1>
      </div>
    </div>
  );
}
