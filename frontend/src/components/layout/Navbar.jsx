import { Link } from "react-router-dom";
import { Bus, Ticket, User } from "lucide-react";
import Button from "../ui/Button";
import { useAppStore } from "../../store/useAppStore";

export default function Navbar() {
  const user = useAppStore((s) => s.user);
  const setUser = useAppStore((s) => s.setUser);
  const role = user?.role || "guest";

  return (
    <header className="sticky top-0 z-30 border-b border-[#E5E7EB] bg-white/95 backdrop-blur-sm">
      <div className="bg-gradient-to-r from-gm-navy-soft to-gm-soft px-4 py-2 text-center text-xs font-medium text-gm-navy md:text-sm">
        Get 10% discount — Use code <span className="font-bold text-gm-green">APP10</span> on the app ·{" "}
        <span className="hidden sm:inline">Install Green miles booking for exclusive deals</span>
      </div>
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3">
        <Link to="/" className="flex min-w-0 shrink-0 items-center gap-3 font-bold tracking-tight text-gm-navy">
          <img
            src="/logo.png"
            alt=""
            className="h-10 w-auto max-w-[140px] object-contain object-left"
            width={140}
            height={40}
          />
          <span className="hidden min-w-0 flex-col leading-tight sm:flex">
            <span className="text-lg font-extrabold">Green miles</span>
            <span className="text-sm font-semibold text-gm-green">booking</span>
          </span>
        </Link>
        <div className="hidden flex-1 items-center justify-center gap-1 text-sm text-[#1F2937] lg:flex">
          {(role === "guest" || role === "user") && (
            <Link
              to={role === "user" ? "/user/dashboard" : "/search"}
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium hover:bg-gm-soft"
            >
              <Bus className="h-4 w-4 text-gm-green" />
              {role === "user" ? "Ride" : "Ride"}
            </Link>
          )}
          {role === "user" && (
            <Link
              to="/dashboard"
              className="flex items-center gap-1.5 rounded-lg px-3 py-2 font-medium hover:bg-gm-soft"
            >
              <Ticket className="h-4 w-4 text-gm-green" />
              Bookings
            </Link>
          )}
        </div>
        <div className="flex items-center gap-2">
          {user?.role && (
            <span className="hidden rounded-full bg-gm-soft px-2 py-1 text-xs font-semibold text-gm-navy sm:inline">
              {user.role}
            </span>
          )}
          {(role === "guest" || role === "user") && (
            <Link to="/courier" className="hidden text-sm text-[#1F2937] hover:text-gm-green sm:inline">
              Courier
            </Link>
          )}
          {user ? (
            <Button
              variant="outline"
              className="flex items-center gap-1.5 !py-1.5 text-sm"
              onClick={() => {
                setUser(null);
              }}
            >
              <User className="h-4 w-4" />
              Logout
            </Button>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="outline" className="flex items-center gap-1.5 !py-1.5 text-sm">
                  <User className="h-4 w-4" />
                  Account
                </Button>
              </Link>
              <Link to="/login" className="sm:hidden">
                <Button variant="outline" className="!px-3 !py-1.5">
                  <User className="h-4 w-4" />
                </Button>
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
