import { Link } from "react-router-dom";
import { QRCodeSVG } from "react-qr-code";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";

export default function CourierConfirmationPage() {
  const order = useAppStore((s) => s.selectedCourierOrder);

  if (!order) {
    return (
      <Layout>
        <Card className="mx-auto max-w-md space-y-4 text-center">
          <h1 className="text-2xl font-semibold text-gm-green">No courier order found</h1>
          <Link to="/courier">
            <Button>Book Courier</Button>
          </Link>
        </Card>
      </Layout>
    );
  }

  const qrPayload = order.qrToken
    ? JSON.stringify({ kind: "courier", orderId: order.id, awb: order.awbNumber, token: order.qrToken })
    : `greenmiles:courier:${order.id}`;

  return (
    <Layout>
      <Card className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gm-green">Courier Ticket</h1>
            <p className="text-sm text-gm-green-muted">
              AWB: <span className="font-mono font-semibold text-[#1F2937]">{order.awbNumber || order.id}</span>
            </p>
          </div>
          <span className="rounded-full bg-gm-soft px-3 py-1 text-xs font-semibold text-gm-green">
            {order.status?.replaceAll("_", " ")}
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-gm-green-muted">Route</p>
            <p className="text-lg font-semibold text-[#1F2937]">
              {order.pickup || "Pickup"} {"->"} {order.drop || "Drop"}
            </p>
            <p className="text-sm text-[#1F2937]">Weight: {order.weight} kg</p>
            <p className="text-sm text-[#1F2937]">Distance: {order.distanceKm.toFixed(1)} km</p>
            {order.packageCategory && (
              <p className="text-sm text-[#1F2937]">Category: {order.packageCategory.replaceAll("_", " ")}</p>
            )}
            {order.pickupSlotLabel && <p className="text-sm text-[#6B7280]">Slot: {order.pickupSlotLabel}</p>}
            {order.driverName && (
              <p className="text-sm text-[#1F2937]">
                Partner: {order.driverName}
                {order.partnerVehicleHint ? ` · ${order.partnerVehicleHint}` : ""}
              </p>
            )}
            <p className="text-sm font-bold text-gm-green">Total: Rs. {order.price}</p>
          </div>

          <div className="grid place-items-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] p-4">
            <div className="rounded-lg border border-[#E5E7EB] bg-white p-2">
              <QRCodeSVG value={qrPayload} size={164} level="M" />
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <Link to="/courier/tracking">
            <Button variant="secondary">Track Courier</Button>
          </Link>
          <Link to="/courier">
            <Button variant="outline">Book Another</Button>
          </Link>
        </div>
      </Card>
    </Layout>
  );
}

