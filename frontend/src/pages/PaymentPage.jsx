import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import { liveApi } from "../services/liveApi";
import { useAppStore } from "../store/useAppStore";
import { currency } from "../utils/format";

export default function PaymentPage() {
  const [method, setMethod] = useState("upi");
  const [card, setCard] = useState({ number: "", holder: "", expiry: "", cvv: "" });
  const nav = useNavigate();
  const addBooking = useAppStore((s) => s.addBooking);
  const ride = useAppStore((s) => s.selectedRide);
  const seats = useAppStore((s) => s.selectedSeats);
  const passengerDetails = useAppStore((s) => s.passengerDetails);
  const user = useAppStore((s) => s.user);
  const clearBookingDraft = useAppStore((s) => s.clearBookingDraft);
  const notify = useAppStore((s) => s.notify);
  const total = (ride?.price || 0) * seats.length + 39;

  const pay = async () => {
    if (!ride || seats.length === 0) {
      notify("Select ride and seats before payment", "warning");
      nav("/search");
      return;
    }
    if (method === "fail") {
      notify("Payment failed", "alert");
      return;
    }

    try {
      for (const seatLabel of seats) {
        const seatNo = Number(String(seatLabel).replace(/\D/g, "")) + 1 || 1;
        const booking = await liveApi.createBooking({
          userId: user?.id,
          rideId: Number(ride.id),
          pickupPointId: 1,
          dropPointId: 7,
          seatNumber: seatNo,
        });
        addBooking({
          id: String(booking.bookingId),
          ride,
          seats: [seatLabel],
          passengerDetails,
          status: String(booking.status || "CONFIRMED").toLowerCase(),
          paymentMethod: method,
          paymentId: `TXN-${Date.now()}`,
          amountPaid: ride?.price || 0,
          bookedAt: booking.bookingTime || new Date().toISOString(),
        });
      }
      clearBookingDraft();
      notify("Booking confirmed with live backend", "success");
      nav("/confirmation");
    } catch (err) {
      notify(err?.response?.data?.message || "Booking failed", "alert");
    }
  };

  return (
    <Layout>
      <Card className="mx-auto max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Payment</h1>
        <div className="rounded-xl border border-[#E5E7EB] bg-gm-soft p-3 text-sm">
          <p className="font-medium text-[#1F2937]">
            {ride?.from} → {ride?.to} · Seats: {seats.join(", ")}
          </p>
          <p className="text-gm-green">Total payable: {currency(total)}</p>
        </div>

        <Select label="Payment method" value={method} onChange={(e) => setMethod(e.target.value)}>
          <option value="upi">UPI (QR placeholder)</option>
          <option value="card">Card payment</option>
          <option value="fail">Fail (demo)</option>
        </Select>

        {method === "upi" && (
          <div className="grid place-items-center rounded-xl border border-dashed border-[#D1D5DB] bg-white p-5">
            <div className="grid h-36 w-36 place-items-center rounded-lg border border-[#E5E7EB] text-center text-xs text-gm-navy">
              UPI QR
              <br />
              PLACEHOLDER
            </div>
          </div>
        )}

        {method === "card" && (
          <div className="grid gap-3 rounded-xl border border-[#E5E7EB] p-3 md:grid-cols-2">
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2"
              placeholder="Card number"
              value={card.number}
              onChange={(e) => setCard((c) => ({ ...c, number: e.target.value }))}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2"
              placeholder="Card holder"
              value={card.holder}
              onChange={(e) => setCard((c) => ({ ...c, holder: e.target.value }))}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2"
              placeholder="MM/YY"
              value={card.expiry}
              onChange={(e) => setCard((c) => ({ ...c, expiry: e.target.value }))}
            />
            <input
              className="rounded-xl border border-[#E5E7EB] px-3 py-2"
              placeholder="CVV"
              value={card.cvv}
              onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))}
            />
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={pay}>Pay Now</Button>
          <Button variant="outline" onClick={() => nav("/booking")}>
            Back
          </Button>
        </div>
      </Card>
    </Layout>
  );
}