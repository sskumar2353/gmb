import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import { useAppStore } from "../store/useAppStore";
import { liveApi } from "../services/liveApi";
import Loader from "../components/ui/Loader";
import { estimateDistanceKm, isServiceableCity, normalizeCityName, SERVICEABLE_CITIES } from "../utils/geo";

export default function CourierPage() {
  const nav = useNavigate();
  const user = useAppStore((s) => s.user);
  const addCourierOrder = useAppStore((s) => s.addCourierOrder);
  const notify = useAppStore((s) => s.notify);

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [weight, setWeight] = useState(1);
  const [packageCategory, setPackageCategory] = useState("PARCEL");
  const [pickupSlotLabel, setPickupSlotLabel] = useState("Today · Anytime");
  const [recipient, setRecipient] = useState({ name: "", phone: "" });
  const [contentsNote, setContentsNote] = useState("");
  const [contact, setContact] = useState({ phone: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const mapServerFieldErrors = (err) => {
    const data = err?.response?.data?.data;
    const fields = data?.fields && typeof data.fields === "object" ? data.fields : (typeof data === "object" ? data : {});
    const mapped = {};
    if (fields.pickup) mapped.pickup = fields.pickup;
    if (fields.drop) mapped.drop = fields.drop;
    if (fields.weight) mapped.weight = fields.weight;
    if (fields.contactPhone) mapped.phone = fields.contactPhone;
    if (fields.contactEmail) mapped.email = fields.contactEmail;
    if (fields.recipientPhone) mapped.recipientPhone = fields.recipientPhone;
    return mapped;
  };

  const distanceKm = useMemo(() => {
    const geoDistance = estimateDistanceKm(pickup, drop);
    if (geoDistance) return geoDistance;
    const base = Math.abs((pickup || "").length - (drop || "").length) + 6;
    return Math.min(80, Math.max(3, base * 1.7));
  }, [pickup, drop]);

  const estimatePrice = useMemo(() => {
    const basePrice = 99;
    const w = Number(weight || 1);
    return Math.round(basePrice + w * 38 + distanceKm * 18);
  }, [weight, distanceKm]);

  const validate = () => {
    const next = {};
    if (!pickup.trim()) next.pickup = "Pickup is required";
    if (!drop.trim()) next.drop = "Drop is required";
    if (pickup.trim() && !isServiceableCity(pickup)) next.pickup = "Pickup city is not serviceable yet";
    if (drop.trim() && !isServiceableCity(drop)) next.drop = "Drop city is not serviceable yet";
    if (
      pickup.trim() &&
      drop.trim() &&
      normalizeCityName(pickup).toLowerCase() === normalizeCityName(drop).toLowerCase()
    ) {
      next.drop = "Pickup and drop cannot be the same city";
    }
    const w = Number(weight);
    if (!w || w < 1 || w > 80) next.weight = "Weight must be 1–80 kg";
    if (!/^\d{10}$/.test(contact.phone)) next.phone = "Enter 10-digit phone";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)) next.email = "Enter valid email";
    if (recipient.phone && !/^\d{10}$/.test(recipient.phone)) next.recipientPhone = "Recipient phone must be 10 digits";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onBook = async () => {
    if (!validate()) {
      notify("Please fix courier form errors", "warning");
      return;
    }
    if (!user?.id || user.role !== "user") {
      notify("Please log in as an end user to book courier", "warning");
      return;
    }
    setLoading(true);
    try {
      const order = await liveApi.createCourierOrder({
        userId: user.id,
        pickup: normalizeCityName(pickup),
        drop: normalizeCityName(drop),
        weight: Number(weight),
        distanceKm,
        contactPhone: contact.phone,
        contactEmail: contact.email,
        price: estimatePrice,
        packageCategory,
        recipientName: recipient.name,
        recipientPhone: recipient.phone,
        contentsNote,
        pickupSlotLabel,
      });
      addCourierOrder(order);
      notify("Courier booked successfully", "success");
      nav("/courier/confirmation");
    } catch (e) {
      const serverErrors = mapServerFieldErrors(e);
      if (Object.keys(serverErrors).length) {
        setErrors((prev) => ({ ...prev, ...serverErrors }));
      }
      notify(e?.response?.data?.message || "Courier booking failed", "alert");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <Card className="max-w-2xl space-y-4">
        <h1 className="text-2xl font-semibold">Courier</h1>
        <p className="text-sm text-[#6B7280]">
          Door-to-door courier with AWB ticketing, partner assignment, and live tracking.
        </p>

        <div className="grid gap-3 md:grid-cols-2">
          <div>
            <Input
              label="Pickup"
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                setErrors((prev) => ({ ...prev, pickup: undefined }));
              }}
              className={errors.pickup ? "border-red-400" : ""}
              placeholder="Enter pickup location"
              list="serviceable-cities"
            />
            {errors.pickup && <p className="mt-1 text-xs text-red-600">{errors.pickup}</p>}
          </div>

          <div>
            <Input
              label="Drop"
              value={drop}
              onChange={(e) => {
                setDrop(e.target.value);
                setErrors((prev) => ({ ...prev, drop: undefined }));
              }}
              className={errors.drop ? "border-red-400" : ""}
              placeholder="Enter drop location"
              list="serviceable-cities"
            />
            {errors.drop && <p className="mt-1 text-xs text-red-600">{errors.drop}</p>}
          </div>

          <div className="md:col-span-2">
            <Input
              label="Weight (kg)"
              type="number"
              min={1}
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value);
                setErrors((prev) => ({ ...prev, weight: undefined }));
              }}
              className={errors.weight ? "border-red-400" : ""}
            />
            {errors.weight && <p className="mt-1 text-xs text-red-600">{errors.weight}</p>}
          </div>
          <div>
            <Select label="Package category" value={packageCategory} onChange={(e) => setPackageCategory(e.target.value)}>
              <option value="DOCUMENT">Document</option>
              <option value="PARCEL">Parcel</option>
              <option value="MEDICAL">Medical</option>
              <option value="FOOD">Food</option>
              <option value="ELECTRONICS">Electronics</option>
              <option value="OTHER">Other</option>
            </Select>
          </div>
          <div>
            <Select label="Pickup slot" value={pickupSlotLabel} onChange={(e) => setPickupSlotLabel(e.target.value)}>
              <option value="Today · Anytime">Today · Anytime</option>
              <option value="Today · 10am-2pm">Today · 10am-2pm</option>
              <option value="Today · 2pm-6pm">Today · 2pm-6pm</option>
              <option value="Tomorrow · Morning">Tomorrow · Morning</option>
              <option value="Tomorrow · Evening">Tomorrow · Evening</option>
            </Select>
          </div>
        </div>

        <div className="rounded-xl border border-[#E5E7EB] bg-gm-soft p-3">
          <p className="text-sm font-semibold text-gm-green">Price Estimate</p>
          <p className="text-xs text-[#1F2937]">
            Distance: {distanceKm.toFixed(1)} km
          </p>
          <p className="mt-1 text-lg font-bold text-gm-green">Rs. {estimatePrice}</p>
        </div>
        <datalist id="serviceable-cities">
          {SERVICEABLE_CITIES.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>

        <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
          <p className="text-sm font-semibold text-gm-green">Contact</p>
          <Input
            label="Phone Number"
            value={contact.phone}
            onChange={(e) => {
              setContact((p) => ({ ...p, phone: e.target.value }));
              setErrors((prev) => ({ ...prev, phone: undefined }));
            }}
            className={errors.phone ? "border-red-400" : ""}
            placeholder="10-digit mobile"
          />
          {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}

          <Input
            label="Email"
            type="email"
            value={contact.email}
            onChange={(e) => {
              setContact((p) => ({ ...p, email: e.target.value }));
              setErrors((prev) => ({ ...prev, email: undefined }));
            }}
            className={errors.email ? "border-red-400" : ""}
            placeholder="name@example.com"
          />
          {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
        </div>

        <div className="space-y-3 rounded-xl border border-[#E5E7EB] bg-white p-3">
          <p className="text-sm font-semibold text-gm-green">Recipient (optional)</p>
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              label="Recipient Name"
              value={recipient.name}
              onChange={(e) => setRecipient((p) => ({ ...p, name: e.target.value }))}
              placeholder="Who receives at destination"
            />
            <div>
              <Input
                label="Recipient Phone"
                value={recipient.phone}
                onChange={(e) => {
                  setRecipient((p) => ({ ...p, phone: e.target.value }));
                  setErrors((prev) => ({ ...prev, recipientPhone: undefined }));
                }}
                className={errors.recipientPhone ? "border-red-400" : ""}
                placeholder="10-digit mobile"
              />
              {errors.recipientPhone && <p className="mt-1 text-xs text-red-600">{errors.recipientPhone}</p>}
            </div>
          </div>
          <label className="flex flex-col gap-1 text-sm text-gm-navy">
            <span>Package note</span>
            <textarea
              className="min-h-[70px] rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 outline-none focus:border-gm-green focus:ring-2 focus:ring-gm-ring"
              value={contentsNote}
              onChange={(e) => setContentsNote(e.target.value)}
              maxLength={500}
              placeholder="Fragile / gate pass / delivery note"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={onBook} disabled={loading}>
            {loading ? "Booking..." : "Book Courier"}
          </Button>
          {loading && <Loader />}
        </div>
      </Card>
    </Layout>
  );
}