import { Link } from "react-router-dom";
import Card from "../ui/Card";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import { currency } from "../../utils/format";
import { estimateDistanceKm, estimateTravelMinutes, formatDistance, formatDuration } from "../../utils/geo";

export default function RideCard({ ride }) {
  const availableSeats = ride.availableSeats ?? ride.seats;
  const distanceKm = ride.distanceKm || estimateDistanceKm(ride.from, ride.to);
  const travelMins = ride.travelMins || estimateTravelMinutes(ride.from, ride.to);
  return (
    <Card className="space-y-3 border-gm-border-accent transition hover:border-gm-border-accent hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-lg font-semibold text-[#1F2937]">{ride.driver}</h3>
          <p className="text-xs text-[#6B7280]">{ride.vehicle}</p>
        </div>
        <Badge type="success">{availableSeats} seats left</Badge>
      </div>
      <p className="text-sm text-gm-green-muted">
        {ride.from} → {ride.to} · Departs {ride.time}
      </p>
      <p className="text-xs text-[#6B7280]">
        {formatDistance(distanceKm)} · {formatDuration(travelMins)} · Pickup &amp; drop points available on next step
      </p>
      <div className="flex items-center justify-between border-t border-[#F3F4F6] pt-3">
        <p className="text-lg font-bold text-gm-green">
          {currency(ride.price)} <span className="text-xs font-normal text-[#6B7280]">onwards</span>
        </p>
        <Link to={`/ride/${ride.id}`}>
          <Button>Select seats</Button>
        </Link>
      </div>
    </Card>
  );
}
