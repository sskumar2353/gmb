import { useEffect, useState } from "react";
import { Heart, History, Route, Ticket } from "lucide-react";
import { Link } from "react-router-dom";
import RoleDashboardLayout from "../../layouts/RoleDashboardLayout";
import Card from "../../components/ui/Card";
import Skeleton from "../../components/ui/Skeleton";
import Button from "../../components/ui/Button";
import { useAppStore } from "../../store/useAppStore";

const items = [
  { to: "/user/dashboard", label: "Overview", icon: Route },
  { to: "/search", label: "Search Rides", icon: Route },
  { to: "/dashboard", label: "Bookings", icon: Ticket },
  { to: "/courier", label: "Courier", icon: History },
];

export default function UserDashboardPage() {
  const bookings = useAppStore((s) => s.bookings);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  return (
    <RoleDashboardLayout title="User Dashboard" subtitle="Manage trips, favorites, and profile in one place." items={items}>
      {loading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm text-[#6B7280]">Total Bookings</p><p className="text-3xl font-bold text-gm-navy">{bookings.length}</p></Card>
          <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm text-[#6B7280]">Favorite Routes</p><p className="text-3xl font-bold text-gm-green">4</p></Card>
          <Card className="transition hover:-translate-y-0.5 hover:shadow-md"><p className="text-sm text-[#6B7280]">Loyalty Points</p><p className="text-3xl font-bold text-gm-navy">1,240</p></Card>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><History className="h-4 w-4" /> Booking History (UI)</h2>
          <div className="space-y-2 text-sm">
            {(bookings.slice(0, 4)).map((b) => (
              <div key={b.id} className="rounded-xl border border-[#E5E7EB] bg-white p-3">
                <p className="font-semibold text-[#1F2937]">{b.ride?.from} → {b.ride?.to}</p>
                <p className="text-[#6B7280]">{b.id} · {b.status}</p>
              </div>
            ))}
            {!bookings.length && <p className="text-[#6B7280]">No bookings yet.</p>}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><Heart className="h-4 w-4" /> Favorite Routes (UI)</h2>
          <div className="space-y-2 text-sm">
            {["Hyderabad → Vijayawada", "Hyderabad → Macherla", "Bengaluru → Chennai", "Kochi → Trivandrum"].map((route) => (
              <div key={route} className="rounded-xl border border-[#E5E7EB] bg-white p-3">{route}</div>
            ))}
          </div>
          <div className="mt-4 flex gap-2">
            <Link to="/search"><Button>Find New Ride</Button></Link>
            <Link to="/dashboard"><Button variant="outline">Open Tickets</Button></Link>
          </div>
        </Card>
      </div>
    </RoleDashboardLayout>
  );
}
