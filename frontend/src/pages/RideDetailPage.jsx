import { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import RouteMap from "../components/maps/RouteMap";
import { estimateDistanceKm, estimateTravelMinutes, formatDistance, formatDuration } from "../utils/geo";

const seatLayout = [
  // Requested pattern: F-L driver, M-L M-M M-R, B-L B-R.
  [{ id: "P0", label: "F-L", kind: "seat" }, { id: "D", label: "Driver", kind: "driver" }],
  [
    { id: "P1", label: "M-L", kind: "seat" },
    { id: "P2", label: "M-M", kind: "seat" },
    { id: "P3", label: "M-R", kind: "seat" },
  ],
  [{ id: "P4", label: "B-L", kind: "seat" }, { id: "P5", label: "B-R", kind: "seat" }],
];

export default function RideDetailPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const rides = useAppStore((s) => s.rides);
  const ride = useMemo(() => rides.find((x) => x.id === id) || rides[0], [rides, id]);
  const seats = useAppStore((s) => s.selectedSeats);
  const setSelectedSeats = useAppStore((s) => s.setSelectedSeats);
  const toggleSeat = useAppStore((s) => s.toggleSeat);
  const setSelectedRide = useAppStore((s) => s.setSelectedRide);
  const bookings = useAppStore((s) => s.bookings);
  const notify = useAppStore((s) => s.notify);

  useEffect(() => {
    setSelectedSeats([]);
  }, [id, setSelectedSeats]);

  const bookedSeats = useMemo(() => {
    return bookings
      .filter((b) => (b.status === "confirmed" || b.status === "booking_confirmed") && b?.ride?.id === ride?.id)
      .flatMap((b) => b.seats || []);
  }, [bookings, ride?.id]);
  const distanceKm = ride.distanceKm || estimateDistanceKm(ride.from, ride.to);
  const travelMins = ride.travelMins || estimateTravelMinutes(ride.from, ride.to);

  return (
    <Layout>
      <Card className="space-y-4">
        <h1 className="text-2xl text-[#1F2937]">{ride.driver}</h1>
        <p className="text-sm text-[#6B7280]">{ride.vehicle} ({ride.vehicleRegistration || "N/A"}) · {ride.from} → {ride.to}</p>
        <div className="grid gap-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm text-[#374151] md:grid-cols-2">
          <p><span className="font-semibold">Driver rating:</span> {ride.rating || "N/A"} / 5</p>
          <p><span className="font-semibold">License no:</span> {ride.licenseNumber || "N/A"}</p>
          <p><span className="font-semibold">Distance:</span> {formatDistance(distanceKm)}</p>
          <p><span className="font-semibold">Travel time:</span> {formatDuration(travelMins)}</p>
          <p className="md:col-span-2"><span className="font-semibold">Amenities:</span> {(ride.amenities || []).join(", ") || "N/A"}</p>
        </div>
        <RouteMap from={ride.from} to={ride.to} height={260} />

        <div className="space-y-3 rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gm-green">Seat map (simplified preview)</p>
            <div className="flex gap-3 text-xs text-[#6B7280]">
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-[#E5E7EB] bg-white" /> Available</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-gm-green bg-gm-soft" /> Selected</span>
              <span className="flex items-center gap-1"><span className="h-3 w-3 rounded border border-[#E5E7EB] bg-[#E5E7EB]" /> Booked/Blocked</span>
            </div>
          </div>

          <div className="mx-auto w-full max-w-md space-y-3">
            {seatLayout.map((row, rowIndex) => (
              <div
                key={rowIndex}
                className={`grid gap-3 ${row.length === 2 ? "grid-cols-2" : "grid-cols-3"}`}
              >
                {row.map((seat) => {
                  const isDriver = seat.kind === "driver";
                  const isBooked = bookedSeats.includes(seat.id);
                  const isSelected = seats.includes(seat.id);
                  const isDisabled = isDriver || isBooked;

                  return (
                    <button
                      key={seat.id}
                      disabled={isDisabled}
                      onClick={() => toggleSeat(seat.id)}
                      className={`rounded-xl border px-3 py-3 text-sm font-medium transition ${
                        isDriver
                          ? "cursor-not-allowed border-[#D1D5DB] bg-[#F3F4F6] text-[#6B7280]"
                          : isBooked
                            ? "cursor-not-allowed border-[#E5E7EB] bg-[#E5E7EB] text-[#6B7280]"
                            : isSelected
                              ? "border-gm-green bg-gm-soft text-gm-green"
                              : "border-[#E5E7EB] bg-white text-[#1F2937] hover:border-gm-green-dark"
                      }`}
                    >
                      {seat.label}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={() => {
            if (!seats.length) {
              notify("Select at least one seat to continue", "warning");
              return;
            }
            setSelectedRide(ride);
            nav("/booking");
          }}
        >
          Continue
        </Button>
        <Button variant="outline" onClick={() => setSelectedSeats([])}>
          Clear seat selection
        </Button>
      </Card>
    </Layout>
  );
}