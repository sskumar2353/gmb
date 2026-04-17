import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import RouteMap from "../components/maps/RouteMap";
import { estimateTravelMinutes, formatDuration } from "../utils/geo";

export default function TrackingPage() {
  const latestBooking = useAppStore((s) => s.bookings[0]);

  if (!latestBooking) {
    return (
      <Layout>
        <Card className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gm-green">No active trip to track</h1>
          <p className="text-[#1F2937]">Book a ride first to view live tracking details.</p>
          <Link to="/search"><Button>Find Rides</Button></Link>
        </Card>
      </Layout>
    );
  }

  const ride = latestBooking.ride || {};
  const totalMins = ride.travelMins || estimateTravelMinutes(ride.from, ride.to) || 180;
  const etaMins = Math.max(5, Math.round(totalMins * 0.22));
  const statuses = [
    { label: "Booking Confirmed", done: true, time: latestBooking.bookedAt ? new Date(latestBooking.bookedAt).toLocaleTimeString() : "Now" },
    { label: "Driver Assigned", done: true, time: "In 6 mins" },
    { label: "Ride En Route", done: true, time: `Total ${formatDuration(totalMins)}` },
    { label: "Pickup in Progress", done: false, time: `ETA ${etaMins} mins` },
    { label: "Trip Started", done: false, time: "--" },
  ];

  return (
    <Layout>
      <Card className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gm-green">Live Trip Tracking</h1>
            <p className="text-sm text-gm-green-muted">Booking ID: {latestBooking.id}</p>
          </div>
          <div className="rounded-xl bg-gm-soft px-4 py-2 text-right">
            <p className="text-xs text-gm-green-muted">ETA</p>
            <p className="text-lg font-bold text-gm-green">{etaMins} mins</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="mb-2 text-sm font-semibold text-gm-green">
              {ride.from || "Origin"} {"->"} {ride.to || "Destination"}
            </p>
            <RouteMap from={ride.from} to={ride.to} height={320} />
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gm-green">Trip Progress</p>
            <div className="space-y-3">
              {statuses.map((status, idx) => (
                <div key={status.label} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      status.done ? "bg-gm-green" : idx === 3 ? "bg-gm-navy" : "bg-[#D1D5DB]"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${status.done ? "text-[#1F2937]" : "text-[#6B7280]"}`}>
                      {status.label}
                    </p>
                    <p className="text-xs text-gm-green-muted">{status.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/dashboard"><Button variant="outline">Back to Dashboard</Button></Link>
          <Link to="/search"><Button>Book Another Ride</Button></Link>
        </div>
      </Card>
    </Layout>
  );
}
