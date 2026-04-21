import { create } from "zustand";
import { rides } from "../data/rides";

const AUTH_STORAGE_KEY = "gm_auth";

const readPersistedAuth = () => {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const persistedAuth = typeof window !== "undefined" ? readPersistedAuth() : null;

export const useAppStore = create((set) => ({
  user: persistedAuth?.user || null,
  authToken: persistedAuth?.token || null,
  refreshToken: persistedAuth?.refreshToken || null,
  searchParams: { from: "", to: "", date: "", passengers: 1, womenOnly: false },
  setSearchParams: (patch) =>
    set((s) => ({ searchParams: { ...s.searchParams, ...patch } })),
  rides,
  selectedRide: null,
  selectedSeats: [],
  passengerDetails: {},
  bookings: [],
  driverApplications: [],
  courierOrders: [],
  selectedCourierOrder: null,
  toast: { visible: false, message: "", type: "info" },
  setUser: (user) =>
    set(() => {
      const token = user?.token || null;
      const refreshToken = user?.refreshToken || null;
      if (user) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user, token, refreshToken }));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      return { user, authToken: token, refreshToken };
    }),
  updateAuthTokens: ({ token, refreshToken }) =>
    set((s) => {
      if (!s.user) return {};
      const nextUser = { ...s.user, token, refreshToken };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ user: nextUser, token, refreshToken }));
      return { user: nextUser, authToken: token, refreshToken };
    }),
  clearAuth: () =>
    set(() => {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return { user: null, authToken: null, refreshToken: null };
    }),
  setRides: (ridesData) => set({ rides: ridesData }),
  addRide: (ride) => set((s) => ({ rides: [ride, ...s.rides] })),
  updateRide: (rideId, patch) =>
    set((s) => ({
      rides: s.rides.map((r) => (r.id === rideId ? { ...r, ...patch } : r)),
    })),
  setSelectedRide: (ride) => set({ selectedRide: ride }),
  setSelectedSeats: (seats) => set({ selectedSeats: seats }),
  clearBookingDraft: () => set({ selectedRide: null, selectedSeats: [], passengerDetails: {} }),
  setPassengerDetails: (details) => set({ passengerDetails: details }),
  toggleSeat: (seat) => set((s) => ({ selectedSeats: s.selectedSeats.includes(seat) ? s.selectedSeats.filter((x) => x !== seat) : [...s.selectedSeats, seat] })),
  addBooking: (b) => set((s) => ({ bookings: [b, ...s.bookings] })),
  setBookings: (bookings) => set({ bookings }),
  submitDriverApplication: (application) =>
    set((s) => ({ driverApplications: [application, ...s.driverApplications] })),
  updateDriverApplication: (applicationId, patch) =>
    set((s) => ({
      driverApplications: s.driverApplications.map((a) => (a.id === applicationId ? { ...a, ...patch } : a)),
    })),
  addCourierOrder: (order) =>
    set((s) => ({
      courierOrders: [order, ...s.courierOrders],
      selectedCourierOrder: order,
    })),
  setSelectedCourierOrder: (order) => set({ selectedCourierOrder: order }),
  updateCourierOrder: (orderId, patch) =>
    set((s) => ({
      courierOrders: s.courierOrders.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
      selectedCourierOrder:
        s.selectedCourierOrder?.id === orderId ? { ...s.selectedCourierOrder, ...patch } : s.selectedCourierOrder,
    })),
  updateBooking: (bookingId, patch) =>
    set((s) => ({
      bookings: s.bookings.map((b) => (b.id === bookingId ? { ...b, ...patch } : b)),
    })),
  notify: (message, type = "info") => set({ toast: { visible: true, message, type } }),
  hideToast: () => set((s) => ({ toast: { ...s.toast, visible: false } })),
}));