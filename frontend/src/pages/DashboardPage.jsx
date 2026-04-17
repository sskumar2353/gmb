import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Badge from "../components/ui/Badge";
import EmptyState from "../components/common/EmptyState";
import { useAppStore } from "../store/useAppStore";
import Modal from "../components/ui/Modal";
import { liveApi } from "../services/liveApi";

export default function DashboardPage() {
  const bookings = useAppStore((s) => s.bookings);
  const updateBooking = useAppStore((s) => s.updateBooking);
  const setBookings = useAppStore((s) => s.setBookings);
  const notify = useAppStore((s) => s.notify);
  const user = useAppStore((s) => s.user);

  useEffect(() => {
    const loadBookings = async () => {
      if (!user?.id) return;
      try {
        const apiBookings = await liveApi.getBookings(user.id);
        setBookings(
          apiBookings.map((b) => ({
            id: String(b.bookingId),
            ride: { id: String(b.rideId), from: "Hyderabad", to: "Macherla", price: 350, time: "09:30 AM" },
            seats: [`S-${b.seatNumber}`],
            status: String(b.status || "").toLowerCase(),
            bookedAt: b.bookingTime,
            paymentMethod: "upi",
          }))
        );
      } catch {
        // keep local state fallback
      }
    };
    loadBookings();
  }, [user?.id, setBookings]);

  const [cancelModal, setCancelModal] = useState({ open: false, bookingId: null });
  const cancelBooking = useMemo(() => bookings.find((b) => b.id === cancelModal.bookingId) || null, [
    bookings,
    cancelModal.bookingId,
  ]);

  const bookingTotal = (b) => (b?.ride?.price || 0) * ((b?.seats || []).length || 0);

  const getDepartureDate = (b) => {
    const date = b?.ride?.date;
    const time = b?.ride?.time;
    if (!date || !time) return null;
    const [timePart, meridiem] = time.split(" ");
    const [hh, mm] = timePart.split(":").map(Number);
    let hours = hh;
    if (meridiem?.toLowerCase() === "pm" && hh !== 12) hours += 12;
    if (meridiem?.toLowerCase() === "am" && hh === 12) hours = 0;
    const d = new Date(date);
    d.setHours(hours, mm || 0, 0, 0);
    return d;
  };

  const refundAmount = (b) => {
    const total = bookingTotal(b);
    const departure = getDepartureDate(b);
    if (!departure) return Math.round(total * 0.85);
    const hoursLeft = (departure.getTime() - Date.now()) / (1000 * 60 * 60);
    // Refund policy from doc: full refund before cutoff, partial near departure.
    return hoursLeft >= 6 ? total : Math.round(total * 0.6);
  };

  const getRefundBadge = (b) => {
    const status = b?.refundStatus || "";
    const s = b?.status || "";
    if (s === "refunded" || status === "completed") return { type: "success", label: "Refunded" };
    if (s === "cancelled" || status === "processing") return { type: "warning", label: "Refund processing" };
    if (s === "cancellation_requested" || status === "initiated") return { type: "info", label: "Cancellation requested" };
    return { type: "info", label: "Confirmed" };
  };

  const isCancelable = (b) => {
    const s = b?.status || "";
    return s === "confirmed" || s === "booking_confirmed";
  };

  const onConfirmCancel = async () => {
    if (!cancelBooking) return;
    const { id } = cancelBooking;
    setCancelModal({ open: false, bookingId: null });

    try {
      await liveApi.cancelBooking(id, "Cancelled by user");
    } catch {
      notify("Cancellation failed. Please try again.", "alert");
      return;
    }

    const amount = refundAmount(cancelBooking);
    updateBooking(id, {
      status: "cancellation_requested",
      refundStatus: "initiated",
      refundAmount: amount,
      cancelledAt: new Date().toISOString(),
    });

    notify("Cancellation requested. Refund will be processed shortly.", "warning");

    setTimeout(() => {
      updateBooking(id, { status: "cancelled", refundStatus: "processing" });
      notify("Booking cancelled. Refund is in progress.", "info");
    }, 1800);

    setTimeout(() => {
      updateBooking(id, { status: "refunded", refundStatus: "completed" });
      notify(`Refund completed (Rs. ${refundAmount(cancelBooking)})`, "success");
    }, 4200);
  };

  return (
    <Layout>
      <h1 className="mb-4 text-2xl">My Bookings</h1>

      {bookings.length ? (
        <div className="space-y-3">
          {bookings.map((b) => {
            const badge = getRefundBadge(b);
            const total = bookingTotal(b);
            const refund = b.refundAmount ?? refundAmount(b);

            const showTimeline = b.status !== "confirmed" && (b.status || "").length > 0;
            return (
              <Card key={b.id}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="font-semibold text-[#1F2937]">{b.id}</p>
                    <p className="text-sm text-gm-green-muted">Seats: {b.seats.join(", ")}</p>
                    {b.ride?.from && b.ride?.to && (
                      <p className="text-sm text-[#1F2937]">
                        Route: {b.ride.from} {"->"} {b.ride.to}
                      </p>
                    )}
                    {(b.status === "cancellation_requested" || b.status === "cancelled" || b.status === "refunded") && (
                      <p className="text-sm text-gm-green">
                        Est. Refund: Rs. {refund}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <Badge type={badge.type}>{badge.label}</Badge>
                    <div className="flex gap-2">
                      <Link to="/tracking">
                        <Button variant="secondary">Track</Button>
                      </Link>
                      <Button
                        variant="outline"
                        disabled={!isCancelable(b)}
                        onClick={() => setCancelModal({ open: true, bookingId: b.id })}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>

                {showTimeline && (
                  <div className="mt-4 rounded-xl border border-[#E5E7EB] bg-white p-3">
                    <p className="mb-2 text-sm font-semibold text-gm-green">Refund Status</p>

                    {[
                      { label: "Cancellation requested", done: b.status === "cancellation_requested" || b.status === "cancelled" || b.status === "refunded", time: b.cancelledAt ? "Just now" : "" },
                      { label: "Booking cancelled", done: b.status === "cancelled" || b.status === "refunded", time: b.cancelledAt ? new Date(b.cancelledAt).toLocaleTimeString() : "" },
                      { label: "Refund completed", done: b.status === "refunded", time: b.bookedAt ? "" : "" },
                    ].map((step) => (
                      <div key={step.label} className="flex items-start gap-3 py-1">
                        <span
                          className={`mt-1 h-3 w-3 rounded-full ${
                            step.done ? "bg-gm-green" : "bg-[#E5E7EB]"
                          }`}
                        />
                        <div className="flex-1">
                          <p className={`text-sm font-medium ${step.done ? "text-[#1F2937]" : "text-[#6B7280]"}`}>{step.label}</p>
                          {step.time && <p className="text-xs text-gm-green-muted">{step.time}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      ) : (
        <EmptyState title="No bookings yet" />
      )}

      <Modal
        open={cancelModal.open}
        title="Cancel booking and get refund"
        onClose={() => setCancelModal({ open: false, bookingId: null })}
      >
        {cancelBooking ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-[#E5E7EB] bg-gm-soft p-3">
              <p className="text-sm text-[#1F2937]">
                Booking: <span className="font-semibold">{cancelBooking.id}</span>
              </p>
              <p className="text-sm text-[#1F2937]">
                Estimated refund (mock): <span className="font-semibold">Rs. {refundAmount(cancelBooking)}</span>
              </p>
              <p className="mt-2 text-xs text-[#6B7280]">
                Full refund if cancelled 6+ hours before departure; otherwise partial refund (60%).
              </p>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setCancelModal({ open: false, bookingId: null })}>
                Keep Booking
              </Button>
              <Button onClick={onConfirmCancel}>Confirm Cancellation</Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#1F2937]">Select a booking to cancel.</p>
        )}
      </Modal>
    </Layout>
  );
}