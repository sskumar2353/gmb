import { useState } from "react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { liveApi } from "../services/liveApi";
import { useAppStore } from "../store/useAppStore";
import Badge from "../components/ui/Badge";
import { estimateDistanceKm, estimateTravelMinutes } from "../utils/geo";

export default function DriverPortalPage() {
  const user = useAppStore((s) => s.user);
  const driverApplications = useAppStore((s) => s.driverApplications);
  const rides = useAppStore((s) => s.rides);
  const submitDriverApplication = useAppStore((s) => s.submitDriverApplication);
  const [registration, setRegistration] = useState({
    fullName: "",
    mobile: "",
    email: user?.email || "",
    vehicleModel: "Kia Carens",
    vehicleRegistration: "",
    carRcNumber: "",
    driverLicenseNumber: "",
    pollutionCertificateNumber: "",
    roadTaxReceiptNumber: "",
    permitNumber: "",
    insurancePolicyNumber: "",
  });
  const [form, setForm] = useState({
    driver: "",
    rating: 4.7,
    licenseNumber: "",
    vehicle: "Kia Carens",
    vehicleRegistration: "",
    from: "",
    to: "",
    date: "",
    time: "",
    price: 350,
    seats: 4,
  });
  const myApplication = driverApplications.find((x) => x.email === user?.email);
  const canCreateRoutes = myApplication?.status === "approved";
  const myRoutes = rides.filter((r) => r.createdBy === user?.email);
  const [saving, setSaving] = useState(false);
  const [registering, setRegistering] = useState(false);
  const notify = useAppStore((s) => s.notify);
  const addRide = useAppStore((s) => s.addRide);

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
  const updateReg = (key, value) => setRegistration((prev) => ({ ...prev, [key]: value }));

  const submitRegistration = async (e) => {
    e.preventDefault();
    if (!/^\d{10}$/.test(registration.mobile)) {
      notify("Enter a valid 10-digit mobile number", "warning");
      return;
    }
    setRegistering(true);
    try {
      const res = await liveApi.submitDriverApplication({
        driverId: user?.id,
        fullName: registration.fullName,
        mobile: registration.mobile,
        email: registration.email,
        vehicleModel: registration.vehicleModel,
        vehicleRegistration: registration.vehicleRegistration,
        carRcNumber: registration.carRcNumber,
        driverLicenseNumber: registration.driverLicenseNumber,
        pollutionCertificateNumber: registration.pollutionCertificateNumber,
        roadTaxReceiptNumber: registration.roadTaxReceiptNumber,
        permitNumber: registration.permitNumber,
        insurancePolicyNumber: registration.insurancePolicyNumber,
      });
      submitDriverApplication({
        id: res.applicationId,
        fullName: res.fullName,
        email: res.email,
        vehicleModel: res.vehicleModel,
        vehicleRegistration: res.vehicleRegistration,
        status: String(res.status || "PENDING").toLowerCase(),
      });
      notify("Driver registration submitted to admin for validation", "success");
    } catch {
      notify("Unable to submit driver registration", "alert");
    } finally {
      setRegistering(false);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!canCreateRoutes) {
      notify("Driver profile is not approved by admin yet", "warning");
      return;
    }
    setSaving(true);
    try {
      const distanceKm = estimateDistanceKm(form.from, form.to) || 180;
      const travelMins = estimateTravelMinutes(form.from, form.to) || 240;
      const payload = {
        driverId: user?.id,
        from: form.from,
        to: form.to,
        date: form.date,
        time: form.time,
        price: Number(form.price),
        seats: Number(form.seats),
      };
      const res = await liveApi.submitRideApplication(user?.id, payload);
      addRide({
        id: `RA-${res.applicationId}`,
        approvalStatus: String(res.status || "pending").toLowerCase(),
        from: res.from,
        to: res.to,
        date: res.date,
        time: res.time,
        price: res.price,
        seats: res.seats,
        totalSeats: res.seats,
        distanceKm,
        travelMins,
        amenities: ["AC", "Music", "Luggage Space"],
        createdBy: user?.email || "driver@greenmiles.com",
      });
      notify("Route submitted. Waiting for admin attestation.", "success");
      setForm((p) => ({ ...p, from: "", to: "", date: "", time: "", price: 350, seats: 4 }));
    } catch {
      notify("Unable to create ride", "alert");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="space-y-4">
        <Card className="mx-auto max-w-4xl space-y-3">
          <h1 className="text-2xl font-bold text-gm-navy">Driver Portal</h1>
          <p className="text-sm text-[#6B7280]">
            Register your credentials and vehicle documents. Admin must validate your profile before route publishing.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-sm text-[#374151]">Verification status:</span>
            <Badge type={myApplication?.status === "approved" ? "success" : myApplication?.status === "rejected" ? "alert" : "warning"}>
              {myApplication?.status || "not submitted"}
            </Badge>
          </div>
        </Card>

        {(!myApplication || myApplication.status === "rejected") && (
          <Card className="mx-auto max-w-4xl space-y-4">
            <h2 className="text-xl font-semibold text-gm-navy">Driver Registration (KYC)</h2>
            <form className="grid gap-3 md:grid-cols-2" onSubmit={submitRegistration}>
              <Input label="Full name" value={registration.fullName} onChange={(e) => updateReg("fullName", e.target.value)} required />
              <Input label="Mobile number" value={registration.mobile} onChange={(e) => updateReg("mobile", e.target.value)} required />
              <Input label="Email" type="email" value={registration.email} onChange={(e) => updateReg("email", e.target.value)} required />
              <Input label="Vehicle model" value={registration.vehicleModel} onChange={(e) => updateReg("vehicleModel", e.target.value)} required />
              <Input label="Vehicle registration" value={registration.vehicleRegistration} onChange={(e) => updateReg("vehicleRegistration", e.target.value)} required />
              <Input label="Car RC number" value={registration.carRcNumber} onChange={(e) => updateReg("carRcNumber", e.target.value)} required />
              <Input label="Driver License number" value={registration.driverLicenseNumber} onChange={(e) => updateReg("driverLicenseNumber", e.target.value)} required />
              <Input label="Pollution certificate number" value={registration.pollutionCertificateNumber} onChange={(e) => updateReg("pollutionCertificateNumber", e.target.value)} required />
              <Input label="Road tax receipt number" value={registration.roadTaxReceiptNumber} onChange={(e) => updateReg("roadTaxReceiptNumber", e.target.value)} required />
              <Input label="Permit number" value={registration.permitNumber} onChange={(e) => updateReg("permitNumber", e.target.value)} required />
              <Input label="Insurance policy number" value={registration.insurancePolicyNumber} onChange={(e) => updateReg("insurancePolicyNumber", e.target.value)} required />
              <div className="md:col-span-2">
                <Button type="submit" disabled={registering}>{registering ? "Submitting..." : "Submit for Admin Validation"}</Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="mx-auto max-w-4xl space-y-4">
          <h2 className="text-xl font-semibold text-gm-navy">Create Travel Route</h2>
          <p className="text-sm text-[#6B7280]">Routes are attested by admin before becoming visible to end users.</p>
          <form className="grid gap-3 md:grid-cols-2" onSubmit={onSubmit}>
            <Input label="Driver name" value={form.driver} onChange={(e) => update("driver", e.target.value)} required />
            <Input label="Rating" type="number" step="0.1" min="1" max="5" value={form.rating} onChange={(e) => update("rating", Number(e.target.value))} required />
            <Input label="License number" value={form.licenseNumber} onChange={(e) => update("licenseNumber", e.target.value)} required />
            <Input label="Vehicle registration" value={form.vehicleRegistration} onChange={(e) => update("vehicleRegistration", e.target.value)} required />
            <Input label="From" value={form.from} onChange={(e) => update("from", e.target.value)} required />
            <Input label="To" value={form.to} onChange={(e) => update("to", e.target.value)} required />
            <Input label="Date" type="date" value={form.date} onChange={(e) => update("date", e.target.value)} required />
            <Input label="Time (e.g. 09:30 PM)" value={form.time} onChange={(e) => update("time", e.target.value)} required />
            <Input label="Price per seat (Rs.)" type="number" min="100" value={form.price} onChange={(e) => update("price", e.target.value)} required />
            <Input label="Available seats" type="number" min="1" max="6" value={form.seats} onChange={(e) => update("seats", e.target.value)} required />
            <div className="md:col-span-2">
              <Button type="submit" disabled={saving || !canCreateRoutes}>{saving ? "Submitting..." : "Submit Route for Attestation"}</Button>
            </div>
          </form>
        </Card>

        <Card className="mx-auto max-w-4xl space-y-2">
          <h3 className="text-lg font-semibold text-gm-navy">My Submitted Routes</h3>
          {myRoutes.length ? myRoutes.map((r) => (
            <div key={r.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm">
              <p className="font-medium text-[#1F2937]">{r.from} → {r.to} · {r.date} {r.time}</p>
              <p className="text-[#6B7280]">Status: <span className="font-semibold">{r.approvalStatus || "pending"}</span></p>
            </div>
          )) : <p className="text-sm text-[#6B7280]">No routes submitted yet.</p>}
        </Card>
      </div>
    </Layout>
  );
}
