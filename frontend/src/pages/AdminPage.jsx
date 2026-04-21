import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAppStore } from "../store/useAppStore";
import { useEffect, useState } from "react";
import { liveApi } from "../services/liveApi";

const getApiErrorMessage = (err, fallback) => {
  const message = err?.response?.data?.message;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
};

const getFieldErrors = (err) => {
  const data = err?.response?.data?.data;
  if (!data) return {};
  if (data.fields && typeof data.fields === "object") return data.fields;
  if (typeof data === "object") return data;
  return {};
};

export default function AdminPage() {
  const rides = useAppStore((s) => s.rides);
  const notify = useAppStore((s) => s.notify);
  const [driverApplications, setDriverApplications] = useState([]);
  const [rideApplications, setRideApplications] = useState([]);
  const [stats, setStats] = useState(null);
  const [cities, setCities] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [payments, setPayments] = useState([]);
  const [opsMetrics, setOpsMetrics] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [driverModalOpen, setDriverModalOpen] = useState(false);
  const [routeModalOpen, setRouteModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [driverDetailsOpen, setDriverDetailsOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [driverFormErrors, setDriverFormErrors] = useState({});
  const [routeFormErrors, setRouteFormErrors] = useState({});
  const [assignmentFormErrors, setAssignmentFormErrors] = useState({});
  const [driverQuery, setDriverQuery] = useState("");
  const [driverStatusFilter, setDriverStatusFilter] = useState("ALL");
  const [driverPage, setDriverPage] = useState(1);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("ALL");
  const [paymentQuery, setPaymentQuery] = useState("");
  const [paymentPage, setPaymentPage] = useState(1);
  const DRIVER_PAGE_SIZE = 5;
  const PAYMENT_PAGE_SIZE = 6;
  const [newDriver, setNewDriver] = useState({
    fullName: "",
    phone: "",
    email: "",
    address: "",
    vidProofNumber: "",
    licenseNumber: "",
    status: "ACTIVE",
    rating: 4.8,
    vehicleNumber: "",
    rcNumber: "",
    vehicleType: "KIA_CARENS_7_SEATER",
    totalSeats: 7,
    carStatus: "ACTIVE",
  });
  const [newRoute, setNewRoute] = useState({
    startCityId: "",
    endCityId: "",
    baseFare: 350,
    defaultSeats: 6,
  });
  const [assignment, setAssignment] = useState({
    routePlanId: "",
    driverId: "",
    carId: "",
    startTime: "",
    availableSeats: 6,
  });

  const loadAll = async () => {
    try {
      const [dashboard, apps, routeApps, cityRows, driverRows, routeRows, paymentRows, opsMetricsRow] = await Promise.all([
        liveApi.getAdminDashboard(),
        liveApi.getDriverApplications(),
        liveApi.getRideApplications(),
        liveApi.getCities(),
        liveApi.getAdminDrivers(),
        liveApi.getAdminRoutes(),
        liveApi.getAdminPaymentLogs(),
        liveApi.getAdminOpsMetrics(),
      ]);
      setStats(dashboard);
      setDriverApplications(apps);
      setRideApplications(routeApps);
      setCities(cityRows);
      setDrivers(driverRows);
      setRoutes(routeRows);
      setPayments(paymentRows);
      setOpsMetrics(opsMetricsRow);
    } catch (err) {
      notify(getApiErrorMessage(err, "Unable to load admin operations data"), "alert");
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const pendingDrivers = driverApplications.filter((a) => String(a.status).toUpperCase() === "PENDING");
  const pendingRoutes = rideApplications.filter((r) => String(r.status).toUpperCase() === "PENDING");

  const setDriverStatus = async (id, status) => {
    try {
      await liveApi.reviewDriverApplication(id, status.toUpperCase());
      setDriverApplications((prev) =>
        prev.map((a) => (a.applicationId === id ? { ...a, status: status.toUpperCase() } : a))
      );
      notify(`Driver application ${status}`, status === "approved" ? "success" : "warning");
    } catch (err) {
      notify(getApiErrorMessage(err, "Unable to update driver application"), "alert");
    }
  };

  const setRouteStatus = async (id, status) => {
    try {
      await liveApi.reviewRideApplication(id, status.toUpperCase());
      setRideApplications((prev) =>
        prev.map((r) => (r.applicationId === id ? { ...r, status: status.toUpperCase() } : r))
      );
      notify(`Route ${status}`, status === "approved" ? "success" : "warning");
    } catch (err) {
      notify(getApiErrorMessage(err, "Unable to review route"), "alert");
    }
  };

  const createDriver = async () => {
    try {
      setDriverFormErrors({});
      const created = await liveApi.createAdminDriver({
        ...newDriver,
        rating: Number(newDriver.rating),
        totalSeats: Number(newDriver.totalSeats),
      });
      setDrivers((prev) => [created, ...prev]);
      setNewDriver({
        fullName: "",
        phone: "",
        email: "",
        address: "",
        vidProofNumber: "",
        licenseNumber: "",
        status: "ACTIVE",
        rating: 4.8,
        vehicleNumber: "",
        rcNumber: "",
        vehicleType: "KIA_CARENS_7_SEATER",
        totalSeats: 7,
        carStatus: "ACTIVE",
      });
      setDriverModalOpen(false);
      notify("Driver and car added successfully", "success");
    } catch (err) {
      setDriverFormErrors(getFieldErrors(err));
      notify(getApiErrorMessage(err, "Unable to add driver"), "alert");
    }
  };

  const createRoute = async () => {
    try {
      setRouteFormErrors({});
      if (!newRoute.startCityId || !newRoute.endCityId) {
        notify("Select route start/end cities", "warning");
        return;
      }
      const created = await liveApi.createAdminRoute({
        startCityId: Number(newRoute.startCityId),
        endCityId: Number(newRoute.endCityId),
        baseFare: Number(newRoute.baseFare),
        defaultSeats: Number(newRoute.defaultSeats),
      });
      setRoutes((prev) => [created, ...prev]);
      setNewRoute({ startCityId: "", endCityId: "", baseFare: 350, defaultSeats: 6 });
      setRouteModalOpen(false);
      notify("Route added successfully", "success");
    } catch (err) {
      setRouteFormErrors(getFieldErrors(err));
      notify(getApiErrorMessage(err, "Unable to add route"), "alert");
    }
  };

  const assignRide = async () => {
    try {
      setAssignmentFormErrors({});
      if (!assignment.routePlanId || !assignment.driverId || !assignment.carId || !assignment.startTime) {
        notify("Fill route, driver, car and start time", "warning");
        return;
      }
      const created = await liveApi.createRideAssignment({
        routePlanId: Number(assignment.routePlanId),
        driverId: Number(assignment.driverId),
        carId: Number(assignment.carId),
        startTime: new Date(assignment.startTime).toISOString().slice(0, 19),
        availableSeats: Number(assignment.availableSeats),
      });
      setAssignments((prev) => [created, ...prev]);
      setAssignment({ routePlanId: "", driverId: "", carId: "", startTime: "", availableSeats: 6 });
      setAssignModalOpen(false);
      notify("Ride assigned successfully", "success");
      await loadAll();
    } catch (err) {
      setAssignmentFormErrors(getFieldErrors(err));
      notify(getApiErrorMessage(err, "Unable to assign ride"), "alert");
    }
  };

  const selectedDriverCars = drivers.filter((d) => String(d.driverId) === String(assignment.driverId));
  const filteredDrivers = drivers.filter((d) => {
    const statusOk = driverStatusFilter === "ALL" || String(d.status).toUpperCase() === driverStatusFilter;
    const q = driverQuery.trim().toLowerCase();
    if (!q) return statusOk;
    return statusOk
      && (
        String(d.fullName || "").toLowerCase().includes(q)
        || String(d.phone || "").toLowerCase().includes(q)
        || String(d.licenseNumber || "").toLowerCase().includes(q)
        || String(d.driverId || "").includes(q)
      );
  });
  const driverPageCount = Math.max(1, Math.ceil(filteredDrivers.length / DRIVER_PAGE_SIZE));
  const safeDriverPage = Math.min(driverPage, driverPageCount);
  const pagedDrivers = filteredDrivers.slice((safeDriverPage - 1) * DRIVER_PAGE_SIZE, safeDriverPage * DRIVER_PAGE_SIZE);

  const filteredPayments = payments.filter((p) => {
    const statusOk = paymentStatusFilter === "ALL" || String(p.status).toUpperCase() === paymentStatusFilter;
    const q = paymentQuery.trim().toLowerCase();
    if (!q) return statusOk;
    return statusOk
      && (
        String(p.paymentLogId || "").includes(q)
        || String(p.bookingId || "").includes(q)
        || String(p.referenceCode || "").toLowerCase().includes(q)
        || String(p.method || "").toLowerCase().includes(q)
      );
  });
  const paymentPageCount = Math.max(1, Math.ceil(filteredPayments.length / PAYMENT_PAGE_SIZE));
  const safePaymentPage = Math.min(paymentPage, paymentPageCount);
  const pagedPayments = filteredPayments.slice((safePaymentPage - 1) * PAYMENT_PAGE_SIZE, safePaymentPage * PAYMENT_PAGE_SIZE);

  return (
    <Layout>
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <p className="text-sm text-[#6B7280]">Total rides (live)</p>
          <p className="text-3xl font-bold text-gm-navy">{stats?.totalRides ?? rides.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7280]">Route plans</p>
          <p className="text-3xl font-bold text-gm-green">{stats?.totalRoutePlans ?? routes.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7280]">Payments logged</p>
          <p className="text-3xl font-bold text-gm-navy">{stats?.totalPaymentLogs ?? payments.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-[#6B7280]">Paid amount</p>
          <p className="text-3xl font-bold text-gm-navy">Rs. {stats?.totalPaymentAmount ?? 0}</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gm-navy">Driver Registrations</h2>
          {pendingDrivers.length ? pendingDrivers.map((a) => (
            <div key={a.applicationId} className="mb-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">{a.fullName}</p>
              <p className="text-[#6B7280]">{a.mobile} · {a.email}</p>
              <p className="text-[#6B7280]">Vehicle: {a.vehicleModel} ({a.vehicleRegistration})</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setDriverStatus(a.applicationId, "approved")}>Approve</Button>
                <Button variant="outline" onClick={() => setDriverStatus(a.applicationId, "rejected")}>Reject</Button>
              </div>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No pending driver validations.</p>}
        </Card>
        <Card>
          <h2 className="mb-3 text-lg font-semibold text-gm-navy">Route Attestation</h2>
          {pendingRoutes.length ? pendingRoutes.map((r) => (
            <div key={r.applicationId} className="mb-3 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">{r.from} → {r.to}</p>
              <p className="text-[#6B7280]">{r.date} {r.time} · Rs. {r.price}</p>
              <p className="text-[#6B7280]">Driver ID: {r.driverId}</p>
              <div className="mt-2 flex gap-2">
                <Button onClick={() => setRouteStatus(r.applicationId, "approved")}>Attest Route</Button>
                <Button variant="outline" onClick={() => setRouteStatus(r.applicationId, "rejected")}>Reject</Button>
              </div>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No pending routes for attestation.</p>}
        </Card>
      </div>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-semibold text-gm-navy">Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDriverModalOpen(true)}>Add Driver</Button>
          <Button onClick={() => setRouteModalOpen(true)}>Add Route</Button>
          <Button variant="outline" onClick={() => setAssignModalOpen(true)}>Assign Driver to Route</Button>
        </div>
        <p className="mt-2 text-xs text-[#6B7280]">
          Route code is generated by the system automatically during route creation.
        </p>
      </Card>

      <Card className="mt-4">
        <h1 className="mb-3 text-2xl font-bold text-gm-navy">Admin Live Ops</h1>
        <div className="mb-4 flex gap-2">
          <Badge type="info">Pending Drivers: {pendingDrivers.length}</Badge>
          <Badge type="info">Pending Routes: {pendingRoutes.length}</Badge>
          <Badge type="success">Payments Success: {stats?.successfulPayments ?? 0}</Badge>
          <Badge type="warning">Payments Failed: {stats?.failedPayments ?? 0}</Badge>
        </div>
        <div className="mb-4 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
            <p className="text-[#6B7280]">Driver Create</p>
            <p className="font-semibold text-[#1F2937]">OK: {opsMetrics?.driverCreateSuccess ?? 0} · Fail: {opsMetrics?.driverCreateFailure ?? 0}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
            <p className="text-[#6B7280]">Route Create</p>
            <p className="font-semibold text-[#1F2937]">OK: {opsMetrics?.routeCreateSuccess ?? 0} · Fail: {opsMetrics?.routeCreateFailure ?? 0}</p>
          </div>
          <div className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
            <p className="text-[#6B7280]">Ride Assign</p>
            <p className="font-semibold text-[#1F2937]">OK: {opsMetrics?.rideAssignSuccess ?? 0} · Fail: {opsMetrics?.rideAssignFailure ?? 0}</p>
          </div>
        </div>
        <div className="space-y-2">
          {assignments.length ? assignments.map((a) => (
            <div key={`${a.rideId}-${a.routeCode}`} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">Ride #{a.rideId} · {a.routeCode}</p>
              <p className="text-[#6B7280]">{a.startCity} → {a.endCity} · {a.startTime}</p>
              <p className="text-[#6B7280]">Driver: {a.driverName} · Car: {a.vehicleNumber} · Seats: {a.availableSeats}</p>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No new assignments in this session.</p>}
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-semibold text-gm-navy">Registered Drivers</h2>
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Search by name, phone, license, ID"
            value={driverQuery}
            onChange={(e) => {
              setDriverQuery(e.target.value);
              setDriverPage(1);
            }}
          />
          <select
            className="rounded border px-3 py-2 text-sm"
            value={driverStatusFilter}
            onChange={(e) => {
              setDriverStatusFilter(e.target.value);
              setDriverPage(1);
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="INACTIVE">INACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
          </select>
          <p className="self-center text-xs text-[#6B7280]">Showing {pagedDrivers.length} of {filteredDrivers.length}</p>
        </div>
        <div className="space-y-2">
          {pagedDrivers.length ? pagedDrivers.map((d) => (
            <div key={d.driverId} className="flex items-center justify-between rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <div>
                <p className="font-semibold text-[#1F2937]">{d.fullName}</p>
                <p className="text-[#6B7280]">Driver #{d.driverId} · {d.phone} · {d.status}</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedDriver(d);
                  setDriverDetailsOpen(true);
                }}
              >
                View Details
              </Button>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No drivers match this filter.</p>}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setDriverPage((p) => Math.max(1, p - 1))} disabled={safeDriverPage <= 1}>Prev</Button>
          <p className="text-xs text-[#6B7280]">Page {safeDriverPage} / {driverPageCount}</p>
          <Button variant="outline" onClick={() => setDriverPage((p) => Math.min(driverPageCount, p + 1))} disabled={safeDriverPage >= driverPageCount}>Next</Button>
        </div>
      </Card>

      <Card className="mt-4">
        <h2 className="mb-3 text-lg font-semibold text-gm-navy">Payment Logs</h2>
        <div className="mb-3 grid gap-2 md:grid-cols-3">
          <input
            className="rounded border px-3 py-2 text-sm"
            placeholder="Search by payment/booking/ref/method"
            value={paymentQuery}
            onChange={(e) => {
              setPaymentQuery(e.target.value);
              setPaymentPage(1);
            }}
          />
          <select
            className="rounded border px-3 py-2 text-sm"
            value={paymentStatusFilter}
            onChange={(e) => {
              setPaymentStatusFilter(e.target.value);
              setPaymentPage(1);
            }}
          >
            <option value="ALL">All statuses</option>
            <option value="SUCCESS">SUCCESS</option>
            <option value="FAILED">FAILED</option>
            <option value="PENDING">PENDING</option>
          </select>
          <p className="self-center text-xs text-[#6B7280]">Showing {pagedPayments.length} of {filteredPayments.length}</p>
        </div>
        <div className="space-y-2">
          {pagedPayments.length ? pagedPayments.map((p) => (
            <div key={p.paymentLogId} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-semibold text-[#1F2937]">Payment #{p.paymentLogId} · Booking #{p.bookingId}</p>
              <p className="text-[#6B7280]">User {p.userId} · Ride {p.rideId} · {p.method}</p>
              <p className="text-[#6B7280]">Amount: Rs. {p.amount} · Status: {p.status} · Ref: {p.referenceCode}</p>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No payment logs match this filter.</p>}
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => setPaymentPage((p) => Math.max(1, p - 1))} disabled={safePaymentPage <= 1}>Prev</Button>
          <p className="text-xs text-[#6B7280]">Page {safePaymentPage} / {paymentPageCount}</p>
          <Button variant="outline" onClick={() => setPaymentPage((p) => Math.min(paymentPageCount, p + 1))} disabled={safePaymentPage >= paymentPageCount}>Next</Button>
        </div>
      </Card>

      <Modal open={driverModalOpen} title="Add Driver" onClose={() => setDriverModalOpen(false)}>
        <div className="grid gap-2">
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.fullName ? "border-red-400" : ""}`} placeholder="Driver full name" value={newDriver.fullName} onChange={(e) => { setNewDriver((s) => ({ ...s, fullName: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, fullName: undefined })); }} />
            {driverFormErrors.fullName ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.fullName}</p> : null}
          </div>
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.phone ? "border-red-400" : ""}`} placeholder="Phone number" value={newDriver.phone} onChange={(e) => { setNewDriver((s) => ({ ...s, phone: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, phone: undefined })); }} />
            {driverFormErrors.phone ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.phone}</p> : null}
          </div>
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.email ? "border-red-400" : ""}`} placeholder="Email" value={newDriver.email} onChange={(e) => { setNewDriver((s) => ({ ...s, email: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, email: undefined })); }} />
            {driverFormErrors.email ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.email}</p> : null}
          </div>
          <input className="rounded border px-3 py-2" placeholder="Address" value={newDriver.address} onChange={(e) => setNewDriver((s) => ({ ...s, address: e.target.value }))} />
          <input className="rounded border px-3 py-2" placeholder="VID proof number" value={newDriver.vidProofNumber} onChange={(e) => setNewDriver((s) => ({ ...s, vidProofNumber: e.target.value }))} />
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.licenseNumber ? "border-red-400" : ""}`} placeholder="License number" value={newDriver.licenseNumber} onChange={(e) => { setNewDriver((s) => ({ ...s, licenseNumber: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, licenseNumber: undefined })); }} />
            {driverFormErrors.licenseNumber ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.licenseNumber}</p> : null}
          </div>
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.vehicleNumber ? "border-red-400" : ""}`} placeholder="Vehicle number" value={newDriver.vehicleNumber} onChange={(e) => { setNewDriver((s) => ({ ...s, vehicleNumber: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, vehicleNumber: undefined })); }} />
            {driverFormErrors.vehicleNumber ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.vehicleNumber}</p> : null}
          </div>
          <div>
            <input className={`w-full rounded border px-3 py-2 ${driverFormErrors.rcNumber ? "border-red-400" : ""}`} placeholder="RC number" value={newDriver.rcNumber} onChange={(e) => { setNewDriver((s) => ({ ...s, rcNumber: e.target.value })); setDriverFormErrors((prev) => ({ ...prev, rcNumber: undefined })); }} />
            {driverFormErrors.rcNumber ? <p className="mt-1 text-xs text-red-600">{driverFormErrors.rcNumber}</p> : null}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDriverModalOpen(false)}>Cancel</Button>
            <Button onClick={createDriver}>Create Driver</Button>
          </div>
        </div>
      </Modal>

      <Modal open={routeModalOpen} title="Add Route" onClose={() => setRouteModalOpen(false)}>
        <div className="grid gap-2">
          <div>
          <select className={`w-full rounded border px-3 py-2 ${routeFormErrors.startCityId ? "border-red-400" : ""}`} value={newRoute.startCityId} onChange={(e) => { setNewRoute((s) => ({ ...s, startCityId: e.target.value })); setRouteFormErrors((prev) => ({ ...prev, startCityId: undefined })); }}>
            <option value="">Start city</option>
            {cities.map((c) => <option key={c.cityId} value={c.cityId}>{c.cityName}</option>)}
          </select>
          {routeFormErrors.startCityId ? <p className="mt-1 text-xs text-red-600">{routeFormErrors.startCityId}</p> : null}
          </div>
          <div>
          <select className={`w-full rounded border px-3 py-2 ${routeFormErrors.endCityId ? "border-red-400" : ""}`} value={newRoute.endCityId} onChange={(e) => { setNewRoute((s) => ({ ...s, endCityId: e.target.value })); setRouteFormErrors((prev) => ({ ...prev, endCityId: undefined })); }}>
            <option value="">End city</option>
            {cities.map((c) => <option key={c.cityId} value={c.cityId}>{c.cityName}</option>)}
          </select>
          {routeFormErrors.endCityId ? <p className="mt-1 text-xs text-red-600">{routeFormErrors.endCityId}</p> : null}
          </div>
          <div>
          <input className={`w-full rounded border px-3 py-2 ${routeFormErrors.baseFare ? "border-red-400" : ""}`} type="number" placeholder="Base fare" value={newRoute.baseFare} onChange={(e) => { setNewRoute((s) => ({ ...s, baseFare: e.target.value })); setRouteFormErrors((prev) => ({ ...prev, baseFare: undefined })); }} />
          {routeFormErrors.baseFare ? <p className="mt-1 text-xs text-red-600">{routeFormErrors.baseFare}</p> : null}
          </div>
          <div>
          <input className={`w-full rounded border px-3 py-2 ${routeFormErrors.defaultSeats ? "border-red-400" : ""}`} type="number" placeholder="Default seats" value={newRoute.defaultSeats} onChange={(e) => { setNewRoute((s) => ({ ...s, defaultSeats: e.target.value })); setRouteFormErrors((prev) => ({ ...prev, defaultSeats: undefined })); }} />
          {routeFormErrors.defaultSeats ? <p className="mt-1 text-xs text-red-600">{routeFormErrors.defaultSeats}</p> : null}
          </div>
          <p className="text-xs text-[#6B7280]">Route code will be generated automatically.</p>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRouteModalOpen(false)}>Cancel</Button>
            <Button onClick={createRoute}>Create Route</Button>
          </div>
        </div>
      </Modal>

      <Modal open={assignModalOpen} title="Assign Driver to Route" onClose={() => setAssignModalOpen(false)}>
        <div className="grid gap-2">
          <div>
          <select className={`w-full rounded border px-3 py-2 ${assignmentFormErrors.routePlanId ? "border-red-400" : ""}`} value={assignment.routePlanId} onChange={(e) => { setAssignment((s) => ({ ...s, routePlanId: e.target.value })); setAssignmentFormErrors((prev) => ({ ...prev, routePlanId: undefined })); }}>
            <option value="">Route</option>
            {routes.map((r) => <option key={r.routePlanId} value={r.routePlanId}>{r.routeCode} ({r.startCityName} → {r.endCityName})</option>)}
          </select>
          {assignmentFormErrors.routePlanId ? <p className="mt-1 text-xs text-red-600">{assignmentFormErrors.routePlanId}</p> : null}
          </div>
          <div>
          <select className={`w-full rounded border px-3 py-2 ${assignmentFormErrors.driverId ? "border-red-400" : ""}`} value={assignment.driverId} onChange={(e) => { setAssignment((s) => ({ ...s, driverId: e.target.value, carId: "" })); setAssignmentFormErrors((prev) => ({ ...prev, driverId: undefined })); }}>
            <option value="">Driver</option>
            {drivers.map((d) => <option key={d.driverId} value={d.driverId}>{d.fullName} (#{d.driverId})</option>)}
          </select>
          {assignmentFormErrors.driverId ? <p className="mt-1 text-xs text-red-600">{assignmentFormErrors.driverId}</p> : null}
          </div>
          <div>
          <select className={`w-full rounded border px-3 py-2 ${assignmentFormErrors.carId ? "border-red-400" : ""}`} value={assignment.carId} onChange={(e) => { setAssignment((s) => ({ ...s, carId: e.target.value })); setAssignmentFormErrors((prev) => ({ ...prev, carId: undefined })); }}>
            <option value="">Car</option>
            {selectedDriverCars.map((d) => <option key={d.carId} value={d.carId}>{d.vehicleNumber}</option>)}
          </select>
          {assignmentFormErrors.carId ? <p className="mt-1 text-xs text-red-600">{assignmentFormErrors.carId}</p> : null}
          </div>
          <div>
          <input className={`w-full rounded border px-3 py-2 ${assignmentFormErrors.startTime ? "border-red-400" : ""}`} type="datetime-local" value={assignment.startTime} onChange={(e) => { setAssignment((s) => ({ ...s, startTime: e.target.value })); setAssignmentFormErrors((prev) => ({ ...prev, startTime: undefined })); }} />
          {assignmentFormErrors.startTime ? <p className="mt-1 text-xs text-red-600">{assignmentFormErrors.startTime}</p> : null}
          </div>
          <div className="mt-2 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
            <Button onClick={assignRide}>Assign Ride</Button>
          </div>
        </div>
      </Modal>

      <Modal open={driverDetailsOpen} title="Driver Details" onClose={() => setDriverDetailsOpen(false)}>
        {selectedDriver ? (
          <div className="space-y-2 text-sm">
            <p><span className="font-semibold text-[#1F2937]">Name:</span> {selectedDriver.fullName}</p>
            <p><span className="font-semibold text-[#1F2937]">Phone:</span> {selectedDriver.phone}</p>
            <p><span className="font-semibold text-[#1F2937]">License:</span> {selectedDriver.licenseNumber}</p>
            <p><span className="font-semibold text-[#1F2937]">Email:</span> {selectedDriver.email || "-"}</p>
            <p><span className="font-semibold text-[#1F2937]">Address:</span> {selectedDriver.address || "-"}</p>
            <p><span className="font-semibold text-[#1F2937]">VID Proof:</span> {selectedDriver.vidProofNumber || "-"}</p>
            <p><span className="font-semibold text-[#1F2937]">Vehicle:</span> {selectedDriver.vehicleNumber || "-"} ({selectedDriver.vehicleType || "-"})</p>
            <p><span className="font-semibold text-[#1F2937]">RC:</span> {selectedDriver.rcNumber || "-"}</p>
            <p><span className="font-semibold text-[#1F2937]">Seats:</span> {selectedDriver.totalSeats || "-"}</p>
            <p><span className="font-semibold text-[#1F2937]">Driver Status:</span> {selectedDriver.status}</p>
            <p><span className="font-semibold text-[#1F2937]">Car Status:</span> {selectedDriver.carStatus || "-"}</p>
            <div className="pt-2 text-right">
              <Button variant="outline" onClick={() => setDriverDetailsOpen(false)}>Close</Button>
            </div>
          </div>
        ) : null}
      </Modal>
    </Layout>
  );
}
