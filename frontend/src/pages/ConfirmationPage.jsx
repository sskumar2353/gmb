import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";

export default function ConfirmationPage() {
  const latestBooking = useAppStore((s) => s.bookings[0]);
  const passengers = latestBooking?.passengerDetails?.passengers || {};

  if (!latestBooking) {
    return (
      <Layout>
        <Card className="mx-auto max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gm-green">No booking found</h1>
          <p className="text-[#1F2937]">Complete a booking to generate your ticket.</p>
          <Link to="/search"><Button>Find Rides</Button></Link>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gm-green">E-Ticket Confirmed</h1>
            <p className="text-sm text-gm-green-muted">Booking ID: {latestBooking.id}</p>
          </div>
          <span className="rounded-full bg-gm-soft px-3 py-1 text-xs font-semibold text-gm-green">
            {latestBooking.status}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gm-green-muted">Route</p>
            <p className="text-lg font-semibold text-[#1F2937]">
              {latestBooking.ride?.from || "From"} {"->"} {latestBooking.ride?.to || "To"}
            </p>
            <p className="text-sm text-[#1F2937]">Driver: {latestBooking.ride?.driver || "N/A"}</p>
            <p className="text-sm text-[#1F2937]">Driver rating: {latestBooking.ride?.rating || "N/A"} / 5</p>
            <p className="text-sm text-[#1F2937]">License: {latestBooking.ride?.licenseNumber || "N/A"}</p>
            <p className="text-sm text-[#1F2937]">Vehicle: {latestBooking.ride?.vehicle || "Kia Carens"}</p>
            <p className="text-sm text-[#1F2937]">Registration: {latestBooking.ride?.vehicleRegistration || "N/A"}</p>
            <p className="text-sm text-[#1F2937]">Time: {latestBooking.ride?.time || "N/A"}</p>
            <p className="text-sm text-[#1F2937]">Seats: {(latestBooking.seats || []).join(", ") || "N/A"}</p>
            <p className="text-sm text-[#1F2937]">Payment: {(latestBooking.paymentMethod || "N/A").toUpperCase()}</p>
          </div>

          <div className="grid place-items-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="grid h-40 w-40 place-items-center rounded-lg border border-[#E5E7EB] bg-white text-center text-xs text-gm-green">
              QR CODE
              <br />
              PLACEHOLDER
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-gm-soft p-4">
          <p className="mb-2 text-xs uppercase tracking-wide text-gm-green-muted">Passenger Information</p>
          <div className="space-y-2">
            {Object.keys(passengers).length ? (
              Object.entries(passengers).map(([seat, detail]) => (
                <div key={seat} className="flex items-center justify-between rounded-lg bg-white px-3 py-2 text-sm">
                  <p className="font-medium text-[#1F2937]">{detail.name || "Passenger"} ({detail.gender || "-"})</p>
                  <p className="text-gm-green">Seat {seat}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-[#1F2937]">Passenger details unavailable.</p>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/tracking"><Button variant="secondary">Track Live</Button></Link>
          <Link to="/dashboard"><Button>Go Dashboard</Button></Link>
          <Link to="/search"><Button variant="outline">Book Another Ride</Button></Link>
        </div>
      </Card>
    </Layout>
  );
}