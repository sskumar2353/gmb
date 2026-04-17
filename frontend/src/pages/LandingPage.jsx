import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Bus,
  ShieldCheck,
  MapPin,
  CreditCard,
  PackageSearch,
  ChevronRight,
} from "lucide-react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import { useAppStore } from "../store/useAppStore";
import CookieConsent from "../components/common/CookieConsent";

function formatISODate(d) {
  return d.toISOString().slice(0, 10);
}

const serviceTabs = [
  { id: "ride", label: "Ride", subtitle: "Book a shared intercity ride", cta: "Search rides" },
  { id: "courier", label: "Courier", subtitle: "Send parcels across cities", cta: "Book courier" },
];

const features = [
  { title: "Live route tracking", body: "Dynamic map, ETA, and trip lifecycle tracking in one place.", icon: MapPin },
  { title: "Secure payments", body: "Card and UPI payment UI with confirmation and ticketing.", icon: CreditCard },
  { title: "Courier network", body: "Serviceable cities, distance-based pricing and shipment tracking.", icon: PackageSearch },
  { title: "Reliable rides", body: "Consistent routes with availability and fast booking flow.", icon: Bus },
];

const steps = ["Enter pickup and destination", "Choose seats and traveler details", "Pay and get e-ticket", "Track your trip live"];

const popularRoutes = [
  ["Hyderabad", "Vijayawada"],
  ["Hyderabad", "Macherla"],
  ["Hyderabad", "Vizag"],
  ["Bengaluru", "Chennai"],
  ["Mumbai", "Pune"],
  ["Kochi", "Thiruvananthapuram"],
];

const faqs = [
  {
    q: "Can I track the location of my booked bus online?",
    a: 'Yes — use "Track My Bus" to follow live location on the map for supported operators.',
  },
  {
    q: "Do I need an account to book?",
    a: "You can book as a guest; an account speeds up repeat bookings and unlocks offers.",
  },
  {
    q: "Is online booking more expensive?",
    a: "Fares match operator counters; online booking helps you compare and save time.",
  },
];

const featureMedia = [
  {
    title: "Live trip intelligence",
    body: "Track moving routes and ETAs with dynamic maps and timeline states.",
    img: "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "One-tap booking flow",
    body: "Search, seat-select, pay, and get ticket confirmation with smooth transitions.",
    img: "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExb2NnMWo2dnVlazV2MTU4czhlcHNyN2Q4M3duMDN6eGQ4eWs3Ym44eSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o7TKtnuHOHHUjR38Y/giphy.gif",
  },
  {
    title: "Fleet and compliance cockpit",
    body: "Driver KYC checks and admin approvals in a clean operations interface.",
    img: "https://images.unsplash.com/photo-1556740749-887f6717d7e4?auto=format&fit=crop&w=1200&q=80",
  },
];

export default function LandingPage() {
  const nav = useNavigate();
  const setSearchParams = useAppStore((s) => s.setSearchParams);

  const today = useMemo(() => formatISODate(new Date()), []);
  const [from, setFrom] = useState("Jaipur");
  const [to, setTo] = useState("Delhi");
  const [date, setDate] = useState(today);
  const [passengers, setPassengers] = useState(1);
  const [womenOnly, setWomenOnly] = useState(false);
  const [activeTab, setActiveTab] = useState("ride");
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("gm_first_open_seen");
    if (!seen) {
      setShowWelcome(true);
    }
  }, []);

  const setQuickDate = (d) => setDate(formatISODate(d));

  const onSearch = (e) => {
    e.preventDefault();
    setSearchParams({ from, to, date, passengers, womenOnly });
    if (activeTab === "courier") {
      nav("/courier");
      return;
    }
    nav("/results");
  };

  const closeWelcome = () => {
    localStorage.setItem("gm_first_open_seen", "1");
    setShowWelcome(false);
  };

  return (
    <Layout>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-gm-green focus:px-4 focus:py-2 focus:text-white"
      >
        Skip to main content
      </a>

      <div id="main" className="-mx-4 mb-12 bg-gradient-to-b from-gm-soft via-gm-soft-2 to-white px-4 py-8 md:px-6 md:py-10">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-gm-border-accent bg-white px-3 py-1 text-xs font-semibold text-gm-green">
              <ShieldCheck className="h-3.5 w-3.5" />
              One app for Ride and Courier
            </p>
            <h1 className="text-4xl font-black leading-tight text-gm-navy md:text-5xl">
              Go anywhere with
              <span className="block text-gm-green">Green Miles Booking</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-[#4B5563] md:text-lg">
              Ride-sharing and courier delivery in one premium platform with live maps and real-time updates.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/search"><Button className="inline-flex items-center gap-2">Book a ride <ArrowRight className="h-4 w-4" /></Button></Link>
              <Link to="/courier"><Button variant="outline">Send a package</Button></Link>
            </div>
            <div className="mt-8 grid max-w-lg grid-cols-3 gap-3">
              {[
                { k: "95K+", v: "Trips" },
                { k: "4.8/5", v: "Rating" },
                { k: "24/7", v: "Support" },
              ].map((s) => (
                <div key={s.k} className="rounded-2xl border border-gm-border-accent bg-white p-3 text-center">
                  <p className="text-lg font-black text-gm-navy">{s.k}</p>
                  <p className="text-xs text-[#6B7280]">{s.v}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-gm-border-accent bg-white shadow-lg shadow-gm-green/10">
              <div className="mb-4 grid grid-cols-3 gap-2 rounded-xl bg-[#F8FAFC] p-2">
                {serviceTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-2 py-2 text-xs font-semibold transition ${
                      activeTab === tab.id ? "bg-white text-gm-green shadow-sm" : "text-[#6B7280] hover:bg-white"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              <p className="mb-3 text-sm text-[#6B7280]">{serviceTabs.find((t) => t.id === activeTab)?.subtitle}</p>
              <form className="space-y-4" onSubmit={onSearch}>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input label="From" value={from} onChange={(e) => setFrom(e.target.value)} required />
                  <Input label="To" value={to} onChange={(e) => setTo(e.target.value)} required />
                </div>
                <Input label="Date" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
                <Input label="Passengers" type="number" min={1} max={6} value={passengers} onChange={(e) => setPassengers(Number(e.target.value))} required />
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:border-gm-green hover:text-gm-green" onClick={() => setQuickDate(new Date())}>Today</button>
                  <button
                    type="button"
                    className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F2937] hover:border-gm-green hover:text-gm-green"
                    onClick={() => {
                      const t = new Date();
                      t.setDate(t.getDate() + 1);
                      setQuickDate(t);
                    }}
                  >
                    Tomorrow
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-[#1F2937]">
                  <input type="checkbox" checked={womenOnly} onChange={(e) => setWomenOnly(e.target.checked)} className="h-4 w-4 rounded border-[#E5E7EB] text-gm-green focus:ring-gm-green" />
                  Booking for women
                </label>
                <Button type="submit" className="w-full">
                  {serviceTabs.find((t) => t.id === activeTab)?.cta}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      </div>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-bold text-gm-navy">How Green Miles helps you move</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map(({ title, body, icon: Icon }) => (
            <Card key={title} className="border-gm-border-accent transition hover:-translate-y-1 hover:shadow-md">
              <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gm-soft text-gm-green">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-gm-navy">{title}</h3>
              <p className="mt-1 text-sm text-[#6B7280]">{body}</p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-bold text-gm-navy">See the platform in action</h2>
        <div className="grid gap-4 lg:grid-cols-3">
          {featureMedia.map((m) => (
            <motion.div key={m.title} whileHover={{ y: -5, scale: 1.01 }} transition={{ type: "spring", stiffness: 280, damping: 20 }}>
              <Card className="h-full overflow-hidden border-gm-border-accent p-0">
                <div className="h-48 w-full overflow-hidden">
                  <img src={m.img} alt={m.title} className="h-full w-full object-cover transition duration-500 hover:scale-105" loading="lazy" />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gm-navy">{m.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{m.body}</p>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="mb-14">
        <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">Built for fast travel and delivery</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-gm-border-accent">
            <h3 className="font-semibold text-gm-navy">Ride</h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Search routes, choose seats, pay, get e-ticket, and track your trip live.
            </p>
          </Card>
          <Card className="border-gm-border-accent">
            <h3 className="font-semibold text-gm-navy">Courier</h3>
            <p className="mt-2 text-sm text-[#6B7280]">
              Schedule parcel pickup and delivery across supported cities with tracking updates.
            </p>
          </Card>
        </div>
      </section>

      <section className="mb-14 rounded-3xl border border-[#E5E7EB] bg-[#FAFAFA] p-6 md:p-10">
        <h2 className="mb-4 text-xl font-bold text-[#1F2937]">How it works</h2>
        <ol className="grid gap-3 md:grid-cols-2">
          {steps.map((s, i) => (
            <li key={s} className="flex gap-3 text-sm text-[#374151]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gm-green text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="pt-0.5">{s}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mb-14">
        <h2 className="mb-4 text-2xl font-bold text-[#1F2937]">Popular routes in your region</h2>
        <div className="flex flex-wrap gap-2">
          {popularRoutes.map(([a, b]) => (
            <Link
              key={`${a}-${b}`}
              to="/results"
              onClick={() => setSearchParams({ from: a, to: b, date: today, womenOnly: false })}
              className="inline-flex items-center gap-1 rounded-full border border-[#E5E7EB] bg-white px-3 py-1.5 text-sm text-[#1F2937] transition hover:border-gm-green hover:text-gm-green"
            >
              {a} to {b}
              <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            </Link>
          ))}
        </div>
      </section>

      <section id="faq" className="mb-8 scroll-mt-28">
        <h2 className="mb-6 text-2xl font-bold text-[#1F2937]">FAQs</h2>
        <div className="space-y-3">
          {faqs.map(({ q, a }) => (
            <Card key={q} className="border-[#E5E7EB]">
              <p className="font-semibold text-[#1F2937]">{q}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{a}</p>
            </Card>
          ))}
        </div>
      </section>

      <Modal open={showWelcome} title="Welcome to Green Miles Booking" onClose={closeWelcome}>
        <p className="text-sm text-[#374151]">
          Explore rides and courier services from one premium interface. Start with a route search or parcel booking.
        </p>
        <div className="mt-4 flex gap-2">
          <Button onClick={closeWelcome}>Start Exploring</Button>
          <Link to="/login">
            <Button variant="outline" onClick={closeWelcome}>Login</Button>
          </Link>
        </div>
      </Modal>
      <CookieConsent />
    </Layout>
  );
}
