interface GuestStatisticsProps {
  totalRegistered: number;
  going: number;
  checkedIn: number;
  waitlist: number;
}

export function GuestStatistics({
  totalRegistered = 0,
  going = 0,
  checkedIn = 0,
  waitlist = 0,
}: GuestStatisticsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <p className="font-urbanist text-white/60 text-xs md:text-sm mb-2">Total Registered</p>
        <p className="font-urbanist text-2xl md:text-4xl font-bold text-white">{totalRegistered}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <p className="font-urbanist text-white/60 text-xs md:text-sm mb-2">Going</p>
        <p className="font-urbanist text-2xl md:text-4xl font-bold text-white">{going}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <p className="font-urbanist text-white/60 text-xs md:text-sm mb-2">Checked In</p>
        <p className="font-urbanist text-2xl md:text-4xl font-bold text-white">{checkedIn}</p>
      </div>
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 md:p-6 border border-white/10">
        <p className="font-urbanist text-white/60 text-xs md:text-sm mb-2">Waitlist</p>
        <p className="font-urbanist text-2xl md:text-4xl font-bold text-white">{waitlist}</p>
      </div>
    </div>
  );
}
