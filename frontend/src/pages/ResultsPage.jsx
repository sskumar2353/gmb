import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, SlidersHorizontal } from "lucide-react";
import Layout from "../components/layout/Layout";
import Sidebar from "../components/layout/Sidebar";
import RideCard from "../components/cards/RideCard";
import Loader from "../components/ui/Loader";
import EmptyState from "../components/common/EmptyState";
import { liveApi } from "../services/liveApi";
import { useAppStore } from "../store/useAppStore";

export default function ResultsPage() {
  const rides = useAppStore((s) => s.rides);
  const bookings = useAppStore((s) => s.bookings);
  const setRides = useAppStore((s) => s.setRides);
  const searchParams = useAppStore((s) => s.searchParams);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ time: "all", maxPrice: 700 });

  useEffect(() => {
    const fetchRides = async () => {
      try {
        const startCityId = liveApi.resolveCityId(searchParams.from);
        const endCityId = liveApi.resolveCityId(searchParams.to);
        if (!startCityId || !endCityId || !searchParams.date) {
          setLoading(false);
          return;
        }
        const apiRides = await liveApi.searchRides({
          startCityId,
          endCityId,
          date: searchParams.date,
        });
        setRides(apiRides);
      } finally {
        setLoading(false);
      }
    };
    fetchRides();
  }, [setRides, searchParams.from, searchParams.to, searchParams.date]);

  const hasRoute = searchParams.from && searchParams.to;
  const passengers = Number(searchParams.passengers || 1);

  const filteredRides = useMemo(() => {
    const activeSeatsByRide = bookings.reduce((acc, booking) => {
      const isActive = booking.status === "confirmed" || booking.status === "booking_confirmed";
      if (!isActive || !booking?.ride?.id) return acc;
      acc[booking.ride.id] = (acc[booking.ride.id] || 0) + (booking.seats?.length || 0);
      return acc;
    }, {});

    return rides
      .map((ride) => {
        const booked = activeSeatsByRide[ride.id] || 0;
        const capacity = ride.totalSeats || 6;
        const baselineAvailable = ride.seats ?? capacity;
        const availableSeats = Math.max(0, Math.min(capacity, baselineAvailable - booked));
        return { ...ride, availableSeats };
      })
      .filter((ride) => {
        const approved = (ride.approvalStatus || "approved") === "approved";
        const routeMatch =
          (!searchParams.from || ride.from.toLowerCase().includes(searchParams.from.toLowerCase())) &&
          (!searchParams.to || ride.to.toLowerCase().includes(searchParams.to.toLowerCase()));
        const seatMatch = ride.availableSeats >= passengers;
        const priceMatch = ride.price <= filters.maxPrice;
        const isMorning = ride.time.toLowerCase().includes("am");
        const isEvening = ride.time.toLowerCase().includes("pm");
        const timeMatch =
          filters.time === "all" ||
          (filters.time === "morning" && isMorning) ||
          (filters.time === "evening" && isEvening);
        return approved && routeMatch && seatMatch && priceMatch && timeMatch;
      });
  }, [rides, bookings, searchParams.from, searchParams.to, passengers, filters.maxPrice, filters.time]);

  return (
    <Layout>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link
          to="/search"
          className="inline-flex items-center gap-1 text-sm font-medium text-gm-green hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Edit search
        </Link>
      </div>

      {hasRoute && (
        <div className="mb-6 flex flex-col gap-2 rounded-2xl border border-gm-border-accent bg-gradient-to-r from-gm-soft to-white px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gm-green" />
            <div>
              <p className="font-semibold text-[#1F2937]">
                {searchParams.from} <span className="text-[#9CA3AF]">→</span> {searchParams.to}
              </p>
              <p className="text-sm text-[#6B7280]">
                {searchParams.date}
                {searchParams.passengers ? ` · ${searchParams.passengers} passenger(s)` : ""}
                {searchParams.womenOnly ? " · Women-friendly filters" : ""}
              </p>
            </div>
          </div>
          <p className="text-xs text-gm-green-muted sm:text-right">{filteredRides.length} rides found across South India routes</p>
        </div>
      )}

      <div className="flex gap-4">
        <Sidebar filters={filters} onChange={(patch) => setFilters((prev) => ({ ...prev, ...patch }))} />
        <div className="w-full">
          <div className="mb-4 flex items-center gap-2 text-sm text-[#6B7280] md:hidden">
            <SlidersHorizontal className="h-4 w-4" />
            Filters available on larger screens
          </div>
          {loading ? (
            <div className="grid place-items-center p-10">
              <Loader />
            </div>
          ) : filteredRides.length ? (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredRides.map((r) => (
                <RideCard key={r.id} ride={r} />
              ))}
            </div>
          ) : (
            <EmptyState title="No rides found for selected filters" />
          )}
        </div>
      </div>
    </Layout>
  );
}
