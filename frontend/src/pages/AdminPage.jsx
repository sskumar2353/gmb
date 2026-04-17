import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";
import { useEffect, useState } from "react";
import { liveApi } from "../services/liveApi";

export default function AdminPage() {
  const rides = useAppStore((s) => s.rides);
  const bookings = useAppStore((s) => s.bookings);
  const courierOrders = useAppStore((s) => s.courierOrders);
  const updateDriverApplication = useAppStore((s) => s.updateDriverApplication);
  const updateRide = useAppStore((s) => s.updateRide);
  const notify = useAppStore((s) => s.notify);
  const [driverApplications, setDriverApplications] = useState([]);
  const [rideApplications, setRideApplications] = useState([]);
  const [courierList, setCourierList] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const apps = await liveApi.getDriverApplications();
        setDriverApplications(
          apps.map((a) => ({
            id: a.applicationId,
            fullName: a.fullName,
            email: a.email,
            mobile: a.mobile,
            vehicleModel: a.vehicleModel,
            vehicleRegistration: a.vehicleRegistration,
            status: String(a.status || "PENDING").toLowerCase(),
          }))
        );
      } catch {
        setDriverApplications([]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadRides = async () => {
      try {
        const apps = await liveApi.getRideApplications();
        setRideApplications(
          apps.map((a) => ({
            id: a.applicationId,
            driverId: a.driverId,
            from: a.from,
            to: a.to,
            date: a.date,
            time: a.time,
            seats: a.seats,
            price: a.price,
            status: String(a.status || "PENDING").toLowerCase(),
          }))
        );
      } catch {
        setRideApplications([]);
      }
    };
    loadRides();
  }, []);

  useEffect(() => {
    const loadCourier = async () => {
      try {
        const list = await liveApi.getCourierOrders();
        setCourierList(list);
      } catch {
        setCourierList([]);
      }
    };
    loadCourier();
  }, []);

  const confirmed = bookings.filter((b) => b.status === "confirmed" || b.status === "booking_confirmed").length;
  const cancelled = bookings.filter((b) => b.status === "cancelled" || b.status === "refunded").length;
  const pendingDrivers = driverApplications.filter((a) => a.status === "pending");
  const pendingRoutes = rideApplications.filter((r) => r.status === "pending");

  const setDriverStatus = async (id, status) => {
    try {
      await liveApi.reviewDriverApplication(id, status.toUpperCase());
      setDriverApplications((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
      updateDriverApplication(id, { status, reviewedAt: new Date().toISOString() });
      notify(`Driver application ${status}`, status === "approved" ? "success" : "warning");
    } catch {
      notify("Unable to update driver application", "alert");
    }
  };

  const setRouteStatus = async (id, status) => {
    try {
      await liveApi.reviewRideApplication(id, status.toUpperCase());
      setRideApplications((prev) => prev.map((r) => (r.id === id ? { ...r, status } : r)));
      updateRide(id, { approvalStatus: status, attestedAt: new Date().toISOString() });
      notify(`Route ${status}`, status === "approved" ? "success" : "warning");
    } catch {
      notify("Unable to review route", "alert");
    }
  };

  const courierStatusOptions = [
    "pickup_pending",
    "partner_assigned",
    "en_route_pickup",
    "picked_up",
    "in_transit",
    "out_for_delivery",
    "delivered",
    "cancelled",
  ];

  const setCourierStatus = async (id, status) => {
    try {
      const updated = await liveApi.patchCourierOrderStatus(Number(id), status);
      setCourierList((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      notify(`Courier ${status.replaceAll("_", " ")}`, "success");
    } catch {
      notify("Unable to update courier order", "alert");
    }
  };

  const assignCourier = async (id) => {
    const raw = document.getElementById(`courier-driver-${id}`)?.value;
    const driverId = Number(raw);
    if (!driverId) {
      notify("Enter driver ID (seed demo: 1-4)", "warning");
      return;
    }
    try {
      const updated = await liveApi.assignCourierOrder(Number(id), driverId);
      setCourierList((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      notify("Courier partner assigned", "success");
    } catch (err) {
      notify(err?.response?.data?.message || "Unable to assign courier partner", "alert");
    }
  };

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <p className="text-sm text-[#6B7280]">Total rides</p>
          <p className="text-3xl font-bold text-gm-navy">{rides.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7280]">Confirmed bookings</p>
          <p className="text-3xl font-bold text-gm-green">{confirmed}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7280]">Courier orders (live)</p>
          <p className="text-3xl font-bold text-gm-navy">{courierList.length || courierOrders.length}</p>
        </Card>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gm-navy">Driver Registrations</h2>
          {pendingDrivers.length ? pendingDrivers.map((a) => (
            <div key={a.id} className="mb-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">{a.fullName}</p>
              <p className="text-[#6B7280]">{a.mobile} · {a.email}</p>
              <p className="text-[#6B7280]">Vehicle: {a.vehicleModel} ({a.vehicleRegistration})</p>
              <p className="text-[#6B7280]">RC: {a.carRcNumber} · DL: {a.driverLicenseNumber}</p>
              <p className="text-[#6B7280]">PUC: {a.pollutionCertificateNumber} · Tax: {a.roadTaxReceiptNumber}</p>
              <p className="text-[#6B7280]">Permit: {a.permitNumber} · Insurance: {a.insurancePolicyNumber}</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDriverStatus(a.id, "approved")}>Approve</Button>
                <Button variant="outline" onClick={() => setDriverStatus(a.id, "rejected")}>Reject</Button>
              </div>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No pending driver validations.</p>}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gm-navy">Route Attestation</h2>
          {pendingRoutes.length ? pendingRoutes.map((r) => (
            <div key={r.id} className="mb-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">{r.from} → {r.to}</p>
              <p className="text-[#6B7280]">{r.date} {r.time} · Rs. {r.price}</p>
              <p className="text-[#6B7280]">Driver ID: {r.driverId}</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setRouteStatus(r.id, "approved")}>Attest Route</Button>
                <Button variant="outline" onClick={() => setRouteStatus(r.id, "rejected")}>Reject</Button>
              </div>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No pending routes for attestation.</p>}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-semibold text-gm-navy">Courier orders</h2>
        {courierList.length ? (
          courierList.map((o) => (
            <div key={o.id} className="mb-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">
                AWB <span className="font-mono">{o.awbNumber || o.id}</span> · User {o.userId}
              </p>
              <p className="text-[#6B7280]">
                {o.pickup} → {o.drop} · {o.weight} kg · Rs. {o.price}
              </p>
              <p className="text-[#6B7280]">
                Status: {o.status}
                {o.driverName ? ` · Partner: ${o.driverName}` : ""}
              </p>
              <div className="mt-2 flex items-end gap-2">
                <label className="text-xs text-[#6B7280]">
                  Driver ID
                  <input
                    id={`courier-driver-${o.id}`}
                    className="ml-2 w-20 rounded-lg border border-[#E5E7EB] px-2 py-1 text-sm"
                    type="number"
                    min={1}
                    placeholder="1"
                  />
                </label>
                <Button variant="outline" onClick={() => assignCourier(o.id)}>Assign</Button>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <select
                  className="rounded-lg border border-[#E5E7EB] px-2 py-1 text-sm"
                  defaultValue=""
                  id={`courier-status-${o.id}`}
                  aria-label={`New status for courier ${o.id}`}
                >
                  <option value="" disabled>
                    Set status…
                  </option>
                  {courierStatusOptions.map((s) => (
                    <option key={s} value={s}>
                      {s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
                <Button
                  variant="outline"
                  onClick={() => {
                    const sel = document.getElementById(`courier-status-${o.id}`);
                    const v = sel?.value;
                    if (!v) {
                      notify("Choose a status first", "warning");
                      return;
                    }
                    setCourierStatus(o.id, v);
                  }}
                >
                  Update
                </Button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#6B7280]">No courier orders loaded from API.</p>
        )}
      </Card>

      <Card className="mt-4">
        <h1 className="mb-3 text-2xl font-bold text-gm-navy">Admin Panel</h1>
        <div className="mb-4 flex gap-2">
          <Badge type="success">Confirmed: {confirmed}</Badge>
          <Badge type="warning">Cancelled/Refunded: {cancelled}</Badge>
          <Badge type="info">Pending Drivers: {pendingDrivers.length}</Badge>
          <Badge type="info">Pending Routes: {pendingRoutes.length}</Badge>
        </div>
        <div className="space-y-2">
          {bookings.length ? bookings.map((b) => (
            <div key={b.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">{b.id}</p>
              <p className="text-[#6B7280]">{b.ride?.from} → {b.ride?.to} · {b.ride?.date || "N/A"} {b.ride?.time || ""}</p>
              <p className="text-[#6B7280]">Seats: {(b.seats || []).join(", ")} · Status: {b.status}</p>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No bookings yet.</p>}
        </div>
      </Card>
    </Layout>
  );
}
