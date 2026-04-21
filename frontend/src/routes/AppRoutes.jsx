import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAppStore } from "../store/useAppStore";
import Loader from "../components/ui/Loader";

const LandingPage = lazy(() => import("../pages/LandingPage"));
const AuthPage = lazy(() => import("../pages/AuthPage"));
const SearchPage = lazy(() => import("../pages/SearchPage"));
const ResultsPage = lazy(() => import("../pages/ResultsPage"));
const RideDetailPage = lazy(() => import("../pages/RideDetailPage"));
const BookingPage = lazy(() => import("../pages/BookingPage"));
const PaymentPage = lazy(() => import("../pages/PaymentPage"));
const ConfirmationPage = lazy(() => import("../pages/ConfirmationPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const CourierPage = lazy(() => import("../pages/CourierPage"));
const TrackingPage = lazy(() => import("../pages/TrackingPage"));
const CourierConfirmationPage = lazy(() => import("../pages/CourierConfirmationPage"));
const CourierTrackingPage = lazy(() => import("../pages/CourierTrackingPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const DriverPortalPage = lazy(() => import("../pages/DriverPortalPage"));
const AdminPage = lazy(() => import("../pages/AdminPage"));
const UserDashboardPage = lazy(() => import("../pages/user/UserDashboardPage"));
const DriverDashboardPage = lazy(() => import("../pages/driver/DriverDashboardPage"));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage"));

const byRole = { user: "/user/dashboard", driver: "/driver", admin: "/admin" };

function RequireRole({ role, children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return <Navigate to={byRole[user.role] || "/login"} replace />;
  }
  return children;
}

function UserOnlyRoute({ children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return children;
  if (user.role === "user") return children;
  return <Navigate to={byRole[user.role] || "/login"} replace />;
}

function HomeRoute() {
  const user = useAppStore((s) => s.user);
  if (!user) return <LandingPage />;
  return <Navigate to={byRole[user.role] || "/login"} replace />;
}

function PublicOnly({ children }) {
  const user = useAppStore((s) => s.user);
  if (!user) return children;
  return <Navigate to={byRole[user.role] || "/login"} replace />;
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<div className="flex min-h-[50vh] items-center justify-center"><Loader /></div>}>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<PublicOnly><AuthPage mode="login" /></PublicOnly>} />
        <Route path="/register" element={<PublicOnly><AuthPage mode="register" /></PublicOnly>} />
        <Route path="/search" element={<UserOnlyRoute><SearchPage /></UserOnlyRoute>} />
        <Route path="/results" element={<UserOnlyRoute><ResultsPage /></UserOnlyRoute>} />
        <Route path="/ride/:id" element={<UserOnlyRoute><RideDetailPage /></UserOnlyRoute>} />
        <Route path="/booking" element={<RequireRole role="user"><BookingPage /></RequireRole>} />
        <Route path="/payment" element={<RequireRole role="user"><PaymentPage /></RequireRole>} />
        <Route path="/confirmation" element={<RequireRole role="user"><ConfirmationPage /></RequireRole>} />
        <Route path="/tracking" element={<RequireRole role="user"><TrackingPage /></RequireRole>} />
        <Route path="/dashboard" element={<RequireRole role="user"><DashboardPage /></RequireRole>} />
        <Route path="/courier" element={<RequireRole role="user"><CourierPage /></RequireRole>} />
        <Route path="/courier/confirmation" element={<RequireRole role="user"><CourierConfirmationPage /></RequireRole>} />
        <Route path="/courier/tracking" element={<RequireRole role="user"><CourierTrackingPage /></RequireRole>} />
        <Route path="/user/dashboard" element={<RequireRole role="user"><UserDashboardPage /></RequireRole>} />
        <Route path="/driver" element={<RequireRole role="driver"><DriverDashboardPage /></RequireRole>} />
        <Route path="/driver/portal" element={<RequireRole role="driver"><DriverPortalPage /></RequireRole>} />
        <Route path="/admin" element={<RequireRole role="admin"><AdminDashboardPage /></RequireRole>} />
        <Route path="/admin/operations" element={<RequireRole role="admin"><AdminPage /></RequireRole>} />
        <Route path="/my-bookings" element={<RequireRole role="user"><DashboardPage /></RequireRole>} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}