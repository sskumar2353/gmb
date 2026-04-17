import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import { useAppStore } from "../store/useAppStore";
import { currency } from "../utils/format";

export default function BookingPage() {
  const nav = useNavigate();
  const ride = useAppStore((s) => s.selectedRide);
  const seats = useAppStore((s) => s.selectedSeats);
  const setPassengerDetails = useAppStore((s) => s.setPassengerDetails);
  const notify = useAppStore((s) => s.notify);
  const total = (ride?.price || 0) * seats.length + 39;

  const initialPassengers = useMemo(
    () =>
      seats.reduce((acc, seat) => {
        acc[seat] = { name: "", age: "", gender: "" };
        return acc;
      }, {}),
    [seats]
  );

  const [passengers, setPassengers] = useState(initialPassengers);
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    setPassengers(initialPassengers);
    setErrors({});
  }, [initialPassengers]);

  const setPassengerField = (seat, field, value) => {
    setPassengers((prev) => ({
      ...prev,
      [seat]: { ...prev[seat], [field]: value },
    }));
  };

  const validate = () => {
    const nextErrors = {};

    seats.forEach((seat) => {
      const p = passengers[seat] || {};
      if (!p.name || p.name.trim().length < 2) nextErrors[`name-${seat}`] = "Enter valid name";
      if (!p.age || Number(p.age) < 1 || Number(p.age) > 100) nextErrors[`age-${seat}`] = "Age must be 1-100";
      if (!p.gender) nextErrors[`gender-${seat}`] = "Select gender";
    });

    if (!/^\d{10}$/.test(contact.phone)) nextErrors.phone = "Enter 10-digit phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) nextErrors.email = "Enter valid email";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const proceedToPayment = () => {
    if (!validate()) {
      notify("Please fix passenger details errors", "warning");
      return;
    }
    setPassengerDetails({ passengers, contact });
    notify("Passenger details saved", "success");
    nav("/payment");
  };

  return (
    <Layout>
      <Card className="space-y-4">
        <h1 className="text-2xl font-semibold">Booking Summary</h1>
        <p className="text-[#1F2937]">Seats: {seats.join(", ") || "None"}</p>
        <p className="font-bold text-gm-green">Total: {currency(total)}</p>

        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gm-green">Passenger Details</h2>
          {seats.length === 0 ? (
            <p className="text-sm text-gm-green-muted">Please select at least one seat first.</p>
          ) : (
            seats.map((seat) => (
              <div key={seat} className="rounded-xl border border-[#E5E7EB] bg-gm-soft p-3">
                <p className="mb-2 text-sm font-semibold text-gm-green">Seat {seat}</p>
                <div className="grid gap-3 md:grid-cols-3">
                  <div>
                    <Input
                      label="Full Name"
                      placeholder="Passenger name"
                      value={passengers[seat]?.name || ""}
                      onChange={(e) => setPassengerField(seat, "name", e.target.value)}
                    />
                    {errors[`name-${seat}`] && <p className="mt-1 text-xs text-red-600">{errors[`name-${seat}`]}</p>}
                  </div>
                  <div>
                    <Input
                      label="Age"
                      type="number"
                      min={1}
                      max={100}
                      value={passengers[seat]?.age || ""}
                      onChange={(e) => setPassengerField(seat, "age", e.target.value)}
                    />
                    {errors[`age-${seat}`] && <p className="mt-1 text-xs text-red-600">{errors[`age-${seat}`]}</p>}
                  </div>
                  <div>
                    <Select
                      label="Gender"
                      value={passengers[seat]?.gender || ""}
                      onChange={(e) => setPassengerField(seat, "gender", e.target.value)}
                    >
                      <option value="">Select</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                    {errors[`gender-${seat}`] && <p className="mt-1 text-xs text-red-600">{errors[`gender-${seat}`]}</p>}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="space-y-2 rounded-xl border border-[#E5E7EB] p-3">
          <h3 className="text-sm font-semibold text-gm-green">Contact Details</h3>
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Input
                label="Phone Number"
                placeholder="10-digit mobile"
                value={contact.phone}
                onChange={(e) => setContact((prev) => ({ ...prev, phone: e.target.value }))}
              />
              {errors.phone && <p className="mt-1 text-xs text-red-600">{errors.phone}</p>}
            </div>
            <div>
              <Input
                label="Email"
                type="email"
                placeholder="name@example.com"
                value={contact.email}
                onChange={(e) => setContact((prev) => ({ ...prev, email: e.target.value }))}
              />
              {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>
          </div>
        </div>

        <Button disabled={seats.length === 0} onClick={proceedToPayment}>
          Continue to Payment
        </Button>
      </Card>
    </Layout>
  );
}