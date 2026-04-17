import { useEffect, useState } from "react";
import { Car, CircleDollarSign, ClipboardList, Package, Route, Users } from "lucide-react";
import { Link } from "react-router-dom";
import RoleDashboardLayout from "../../layouts/RoleDashboardLayout";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import { useAppStore } from "../../store/useAppStore";
import { liveApi } from "../../services/liveApi";

const items = [
  { to: "/driver", label: "Overview", icon: Route },
  { to: "/driver/portal", label: "KYC & Create Ride", icon: Car },
  { to: "/driver", label: "Passengers", icon: Users },
];

export default function DriverDashboardPage() {
  const user = useAppStore((s) => s.user);
  const notify = useAppStore((s) => s.notify);
  const [rides, setRides] = useState([]);
  const [courierOrders, setCourierOrders] = useState([]);
  useEffect(() => {
    const load = async () => {
      if (!user?.id) return;
      try {
        const apiRides = await liveApi.getDriverRides(user.id);
        setRides(
          apiRides.map((r) => ({
            id: String(r.rideId),
            from: "Hyderabad",
            to: "Macherla",
            date: r.startTime ? new Date(r.startTime).toISOString().slice(0, 10) : "",
            time: r.startTime ? new Date(r.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
            approvalStatus: String(r.status || "").toLowerCase() === "active" ? "approved" : "pending",
          }))
        );
      } catch {
        setRides([]);
      }
    };
    load();
  }, [user?.id]);

  useEffect(() => {
    const loadCourier = async () => {
      if (!user?.id) return;
      try {
        const orders = await liveApi.getDriverCourierOrders(user.id);
        setCourierOrders(orders);
      } catch {
        setCourierOrders([]);
      }
    };
    loadCourier();
  }, [user?.id]);

  const nextStatus = (current) => ({
    partner_assigned: "en_route_pickup",
    en_route_pickup: "picked_up",
    picked_up: "in_transit",
    in_transit: "out_for_delivery",
    out_for_delivery: "delivered",
  }[current]);

  const advanceCourier = async (order) => {
    const next = nextStatus(order.status);
    if (!next) return;
    try {
      await liveApi.updateDriverCourierOrderStatus(user.id, Number(order.id), next);
      const refreshed = await liveApi.getDriverCourierOrders(user.id);
      setCourierOrders(refreshed);
      notify(`Courier moved to ${next.replaceAll("_", " ")}`, "success");
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to update courier status", "alert");
    }
  };

  const sendGpsPing = async (order) => {
    try {
      const lat = 17.44 + (Math.random() - 0.5) * 0.04;
      const lng = 78.37 + (Math.random() - 0.5) * 0.04;
      await liveApi.postDriverTracking({
        driverId: user.id,
        courierOrderId: Number(order.id),
        latitude: lat,
        longitude: lng,
      });
      notify("GPS ping sent for courier tracking", "success");
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to send GPS ping", "alert");
    }
  };

  return (
    <RoleDashboardLayout title="Driver Dashboard" subtitle="Manage rides, passengers, and earnings." items={items}>
      <div className="grid gap-4 md:grid-cols-4">
        <Card><p className="text-xs text-[#6B7280]">Active rides</p><p className="text-2xl font-bold text-gm-navy">{rides.filter((r) => r.approvalStatus === "approved").length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Pending attestation</p><p className="text-2xl font-bold text-gm-green">{rides.filter((r) => r.approvalStatus === "pending").length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Courier jobs</p><p className="text-2xl font-bold text-gm-navy">{courierOrders.length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Today earnings</p><p className="text-2xl font-bold text-gm-green">Rs. 4,850</p></Card>
      </div>

      <Card className="border-violet-100 bg-violet-50/30">
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy">
          <Package className="h-4 w-4 text-violet-700" /> Assigned Courier Jobs
        </h2>
        <div className="space-y-2">
          {courierOrders.map((o) => (
            <div key={o.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-mono text-xs text-violet-700">{o.awbNumber || o.id}</p>
              <p className="font-semibold text-[#1F2937]">{o.pickup} → {o.drop}</p>
              <p className="text-[#6B7280]">{o.status.replaceAll("_", " ")} · Rs. {o.price}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {nextStatus(o.status) && <Button onClick={() => advanceCourier(o)}>Mark {nextStatus(o.status).replaceAll("_", " ")}</Button>}
                {!["pickup_pending", "delivered", "cancelled"].includes(o.status) && (
                  <Button variant="outline" onClick={() => sendGpsPing(o)}>Send GPS Ping</Button>
                )}
              </div>
            </div>
          ))}
          {!courierOrders.length && <p className="text-sm text-[#6B7280]">No courier jobs assigned yet.</p>}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><ClipboardList className="h-4 w-4" /> Active Rides</h2>
          <div className="space-y-2">
            {rides.slice(0, 5).map((r) => (
              <div key={r.id} className="rounded-xl border border-[#E5E7EB] p-3 text-sm">
                <p className="font-semibold text-[#1F2937]">{r.from} → {r.to}</p>
                <p className="text-[#6B7280]">{r.date} {r.time}</p>
                <Badge type={r.approvalStatus === "approved" ? "success" : r.approvalStatus === "rejected" ? "alert" : "warning"}>
                  {r.approvalStatus || "pending"}
                </Badge>
              </div>
            ))}
            {!rides.length && <p className="text-sm text-[#6B7280]">No driver rides yet.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><Users className="h-4 w-4" /> Passenger List (UI)</h2>
          {["Ravi Kumar · Seat B-L", "Ananya Das · Seat M-R", "Suresh Babu · Seat B-M", "Nisha Jain · Seat F-L"].map((p) => (
            <div key={p} className="mb-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">{p}</div>
          ))}
          <div className="mt-4">
            <Link to="/driver/portal"><Button><Car className="mr-1 h-4 w-4" /> Open KYC & Ride Creation</Button></Link>
          </div>
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><CircleDollarSign className="h-4 w-4" /> Earnings Trend (Static UI)</h2>
        <div className="grid h-32 grid-cols-7 items-end gap-2">
          {[38, 62, 44, 79, 58, 88, 71].map((v, i) => (
            <div key={i} className="rounded-t bg-gm-green/80 transition hover:bg-gm-green" style={{ height: `${v}%` }} />
          ))}
        </div>
      </Card>
    </RoleDashboardLayout>
  );
}
