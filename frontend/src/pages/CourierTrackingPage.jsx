import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import Badge from "../components/ui/Badge";
import RouteMap from "../components/maps/RouteMap";
import { estimateTravelMinutes } from "../utils/geo";
import { liveApi } from "../services/liveApi";

const isMockCourierId = (id) => id != null && String(id).startsWith("CR-");

const timeline = [
  { key: "pickup_pending", label: "Booking confirmed" },
  { key: "partner_assigned", label: "Partner assigned" },
  { key: "en_route_pickup", label: "Partner on the way to pickup" },
  { key: "picked_up", label: "Parcel picked up" },
  { key: "in_transit", label: "In transit" },
  { key: "out_for_delivery", label: "Out for delivery" },
  { key: "delivered", label: "Delivered" },
];

export default function CourierTrackingPage() {
  const order = useAppStore((s) => s.selectedCourierOrder);
  const updateCourierOrder = useAppStore((s) => s.updateCourierOrder);
  const notify = useAppStore((s) => s.notify);

  const [localEta, setLocalEta] = useState(22);
  const [stageKey, setStageKey] = useState(order?.status || "pickup_pending");
  const [trackingTrail, setTrackingTrail] = useState(null);

  useEffect(() => {
    if (!order) return;
    setStageKey(order.status || "pickup_pending");
    const dynamicEta =
      order.etaMins || Math.max(10, Math.round((estimateTravelMinutes(order.pickup, order.drop) || 120) * 0.35));
    setLocalEta(dynamicEta);
  }, [order?.id, order?.status, order?.pickup, order?.drop, order?.etaMins]);

  useEffect(() => {
    if (!order || !isMockCourierId(order.id)) return;
    const timer = setInterval(() => {
      setLocalEta((e) => (e > 1 ? e - 1 : e));
    }, 5000);
    return () => clearInterval(timer);
  }, [order?.id]);

  useEffect(() => {
    if (!order || !isMockCourierId(order.id)) return;
    const id1 = setTimeout(() => {
      setStageKey("picked_up");
      updateCourierOrder(order.id, { status: "picked_up", etaMins: Math.max(5, localEta - 6) });
    }, 2500);
    const id2 = setTimeout(() => {
      setStageKey("in_transit");
      updateCourierOrder(order.id, { status: "in_transit", etaMins: Math.max(5, localEta - 12) });
    }, 5500);
    const id3 = setTimeout(() => {
      setStageKey("out_for_delivery");
      updateCourierOrder(order.id, { status: "out_for_delivery", etaMins: Math.max(3, localEta - 18) });
    }, 9000);
    const id4 = setTimeout(() => {
      setStageKey("delivered");
      updateCourierOrder(order.id, { status: "delivered", etaMins: 0 });
      notify("Courier delivered!", "success");
    }, 12500);

    return () => {
      clearTimeout(id1);
      clearTimeout(id2);
      clearTimeout(id3);
      clearTimeout(id4);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.id]);

  useEffect(() => {
    if (!order || isMockCourierId(order.id)) return;
    let cancelled = false;
    const sync = async () => {
      try {
        const d = await liveApi.getCourierOrder(Number(order.id));
        if (cancelled) return;
        updateCourierOrder(order.id, {
          awbNumber: d.awbNumber,
          qrToken: d.qrToken,
          driverId: d.driverId,
          driverName: d.driverName,
          partnerVehicleHint: d.partnerVehicleHint,
          packageCategory: d.packageCategory,
          pickupSlotLabel: d.pickupSlotLabel,
          status: d.status,
          etaMins: d.etaMins,
          pickup: d.pickup,
          drop: d.drop,
          weight: d.weight,
          distanceKm: d.distanceKm,
          price: d.price,
          cancelReason: d.cancelReason,
          lastLatitude: d.lastLatitude,
          lastLongitude: d.lastLongitude,
        });
        setStageKey(d.status);
        setLocalEta(d.etaMins ?? 0);
        const gps = await liveApi.getCourierTracking(Number(order.id));
        const coords = (gps || [])
          .map((p) => [Number(p.latitude), Number(p.longitude)])
          .filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b));
        setTrackingTrail(coords.length >= 2 ? coords : null);
      } catch {
        /* ignore */
      }
    };
    sync();
    const interval = setInterval(sync, 4000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [order?.id, updateCourierOrder]);

  const steps = useMemo(() => {
    if (stageKey === "cancelled") {
      return [{ key: "cancelled", label: "Cancelled", done: true, time: "Shipment closed" }];
    }
    const idx = timeline.findIndex((t) => t.key === stageKey);
    const active = idx >= 0 ? idx : 0;
    return timeline.map((t, i) => ({
      ...t,
      done: i < active,
      time: i < active ? "Completed" : i === active ? "Current" : "Pending",
    }));
  }, [stageKey]);

  const canCancel = ["pickup_pending", "partner_assigned"].includes(stageKey);

  const cancelOrder = async () => {
    try {
      const updated = await liveApi.cancelCourierOrder(Number(order.id), "Cancelled by user from tracking page");
      updateCourierOrder(order.id, updated);
      setStageKey(updated.status);
      notify("Courier order cancelled", "success");
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to cancel this shipment now", "warning");
    }
  };

  if (!order) {
    return (
      <Layout>
        <Card className="mx-auto max-w-xl space-y-4 text-center">
          <h1 className="text-2xl font-bold text-gm-green">No courier order to track</h1>
          <p className="text-[#1F2937]">Book a courier first to view live tracking UI.</p>
          <Link to="/courier">
            <Button>Book Courier</Button>
          </Link>
        </Card>
      </Layout>
    );
  }

  return (
    <Layout>
      <Card className="mx-auto max-w-4xl space-y-5">
        <div className="flex items-start justify-between border-b border-[#E5E7EB] pb-4">
          <div>
            <h1 className="text-2xl font-bold text-gm-green">Live Courier Tracking</h1>
            <p className="text-sm text-gm-green-muted">
              AWB: <span className="font-mono">{order.awbNumber || order.id}</span>
            </p>
            {order.driverName && (
              <p className="text-xs text-[#6B7280]">
                Partner: {order.driverName}
                {order.partnerVehicleHint ? ` · ${order.partnerVehicleHint}` : ""}
              </p>
            )}
          </div>
          <div className="rounded-xl bg-gm-soft px-4 py-2 text-right">
            <p className="text-xs text-gm-green-muted">ETA</p>
            <p className="text-lg font-bold text-gm-green">{localEta > 0 ? `${localEta} mins` : "Arrived"}</p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] p-3">
            <p className="mb-2 text-sm font-semibold text-gm-green">
              {order.pickup || "Pickup"} {"->"} {order.drop || "Drop"}
            </p>
            <RouteMap from={order.pickup} to={order.drop} height={320} trailPositions={trackingTrail} />
          </div>

          <div className="rounded-xl border border-[#E5E7EB] bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gm-green">Courier Progress</p>
            <div className="space-y-3">
              {steps.map((s) => (
                <div key={s.key} className="flex items-start gap-3">
                  <span
                    className={`mt-1 h-3 w-3 rounded-full ${
                      s.done ? "bg-gm-green" : s.key === stageKey ? "bg-violet-600" : "bg-[#D1D5DB]"
                    }`}
                  />
                  <div>
                    <p className={`text-sm font-medium ${s.done || s.key === stageKey ? "text-[#1F2937]" : "text-[#6B7280]"}`}>{s.label}</p>
                    <p className="text-xs text-gm-green-muted">{s.time}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Badge type="info">{order.status.replaceAll("_", " ")}</Badge>
              {order.cancelReason && (
                <p className="mt-2 text-xs text-[#6B7280]">Reason: {order.cancelReason}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          {canCancel && <Button variant="outline" onClick={cancelOrder}>Cancel Shipment</Button>}
          <Link to="/courier/confirmation">
            <Button variant="outline">Back to Ticket</Button>
          </Link>
          <Link to="/courier">
            <Button>Book Another Courier</Button>
          </Link>
        </div>
      </Card>
    </Layout>
  );
}

