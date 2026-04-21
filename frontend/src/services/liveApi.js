import { apiClient } from "./apiClient";

const unwrap = (res) => res?.data?.data;

const asCourierUiOrder = (row) => ({
  id: String(row.orderId),
  awbNumber: row.awbNumber,
  qrToken: row.qrToken,
  userId: row.userId,
  driverId: row.driverId,
  driverName: row.driverName,
  partnerVehicleHint: row.partnerVehicleHint,
  pickup: row.pickup,
  drop: row.drop,
  weight: row.weight,
  distanceKm: row.distanceKm,
  packageCategory: row.packageCategory,
  recipientName: row.recipientName,
  recipientPhone: row.recipientPhone,
  contentsNote: row.contentsNote,
  pickupSlotLabel: row.pickupSlotLabel,
  price: row.price,
  status: row.status,
  etaMins: row.etaMins ?? 15,
  contact: { phone: row.contactPhone || "", email: row.contactEmail || "" },
  bookedAt: row.bookedAt,
  cancelReason: row.cancelReason || null,
  lastLatitude: row.lastLatitude ?? null,
  lastLongitude: row.lastLongitude ?? null,
  lastGpsRecordedAt: row.lastGpsRecordedAt || null,
});
const CITY_ID_MAP = {
  hyderabad: 1,
  macherla: 2,
};

const asUiRide = (ride) => {
  const dt = ride.startTime ? new Date(ride.startTime) : null;
  return {
    id: String(ride.rideId),
    from: ride.startCity,
    to: ride.endCity,
    time: dt ? dt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "N/A",
    date: dt ? dt.toISOString().slice(0, 10) : "",
    availableSeats: ride.availableSeats ?? 0,
    seats: ride.availableSeats ?? 0,
    totalSeats: 6,
    driver: ride.driverName || `Driver #${ride.driverId ?? "N/A"}`,
    vehicle: "KIA Carens",
    price: 350,
    approvalStatus: "approved",
    rideStatus: ride.rideStatus,
  };
};

export const liveApi = {
  resolveCityId(name) {
    if (!name) return null;
    return CITY_ID_MAP[String(name).trim().toLowerCase()] || null;
  },
  async loginUser(payload) {
    const res = await apiClient.post("/api/v1/auth/login", payload);
    return unwrap(res);
  },
  async registerUser(payload) {
    const res = await apiClient.post("/api/v1/auth/register", payload);
    return unwrap(res);
  },
  async loginDriver(payload) {
    const res = await apiClient.post("/api/v1/auth/driver/login", payload);
    return unwrap(res);
  },
  async loginAdmin(payload) {
    const res = await apiClient.post("/api/v1/auth/admin/login", payload);
    return unwrap(res);
  },
  async searchRides({ startCityId, endCityId, date }) {
    const res = await apiClient.get("/api/v1/rides/search", { params: { startCityId, endCityId, date } });
    return (unwrap(res) || []).map(asUiRide);
  },
  async getCities() {
    const res = await apiClient.get("/api/v1/rides/cities");
    return unwrap(res) || [];
  },
  async createBooking(payload) {
    const res = await apiClient.post("/api/v1/bookings", payload);
    return unwrap(res);
  },
  async getBookings(userId) {
    const res = await apiClient.get("/api/v1/bookings", { params: { userId } });
    return unwrap(res) || [];
  },
  async cancelBooking(bookingId, reason) {
    const res = await apiClient.post(`/api/v1/bookings/${bookingId}/cancel`, { reason });
    return unwrap(res);
  },
  async getNotifications(userId) {
    const res = await apiClient.get("/api/v1/notifications", { params: { userId } });
    return unwrap(res) || [];
  },
  async getDriverRides(driverId) {
    const res = await apiClient.get(`/api/v1/drivers/${driverId}/rides`);
    return unwrap(res) || [];
  },
  async getAdminDashboard() {
    const res = await apiClient.get("/api/v1/admin/dashboard");
    return unwrap(res);
  },
  async submitDriverApplication(payload) {
    const res = await apiClient.post("/api/v1/drivers/applications", payload);
    return unwrap(res);
  },
  async getDriverApplications(status) {
    const res = await apiClient.get("/api/v1/drivers/applications", { params: status ? { status } : {} });
    return unwrap(res) || [];
  },
  async reviewDriverApplication(applicationId, status) {
    const res = await apiClient.patch(`/api/v1/drivers/applications/${applicationId}/status`, { status });
    return unwrap(res);
  },
  async submitRideApplication(driverId, payload) {
    const res = await apiClient.post(`/api/v1/drivers/${driverId}/ride-applications`, payload);
    return unwrap(res);
  },
  async getRideApplications(status) {
    const res = await apiClient.get("/api/v1/drivers/ride-applications", { params: status ? { status } : {} });
    return unwrap(res) || [];
  },
  async reviewRideApplication(applicationId, status) {
    const res = await apiClient.patch(`/api/v1/drivers/ride-applications/${applicationId}/status`, { status });
    return unwrap(res);
  },
  async getAdminAuditLogs({ page = 0, size = 10, entity } = {}) {
    const params = { page, size };
    if (entity) params.entity = entity;
    const res = await apiClient.get("/api/v1/admin/audit-logs", { params });
    return unwrap(res);
  },
  async getAdminDrivers() {
    const res = await apiClient.get("/api/v1/admin/drivers");
    return unwrap(res) || [];
  },
  async createAdminDriver(payload) {
    const res = await apiClient.post("/api/v1/admin/drivers", payload);
    return unwrap(res);
  },
  async getAdminRoutes() {
    const res = await apiClient.get("/api/v1/admin/routes");
    return unwrap(res) || [];
  },
  async createAdminRoute(payload) {
    const res = await apiClient.post("/api/v1/admin/routes", payload);
    return unwrap(res);
  },
  async createRideAssignment(payload) {
    const res = await apiClient.post("/api/v1/admin/ride-assignments", payload);
    return unwrap(res);
  },
  async getAdminPaymentLogs() {
    const res = await apiClient.get("/api/v1/admin/payments");
    return unwrap(res) || [];
  },
  async getAdminOpsMetrics() {
    const res = await apiClient.get("/api/v1/admin/ops-metrics");
    return unwrap(res);
  },
  async createCourierOrder(payload) {
    const res = await apiClient.post("/api/v1/courier/orders", {
      userId: payload.userId,
      pickup: payload.pickup,
      drop: payload.drop,
      weight: payload.weight,
      distanceKm: payload.distanceKm,
      contactPhone: payload.contactPhone,
      contactEmail: payload.contactEmail,
      price: payload.price,
      packageCategory: payload.packageCategory,
      recipientName: payload.recipientName,
      recipientPhone: payload.recipientPhone,
      contentsNote: payload.contentsNote,
      pickupSlotLabel: payload.pickupSlotLabel,
    });
    return asCourierUiOrder(unwrap(res));
  },
  async getCourierOrder(orderId) {
    const res = await apiClient.get(`/api/v1/courier/orders/${orderId}`);
    return asCourierUiOrder(unwrap(res));
  },
  async getCourierOrders(userId) {
    const params = {};
    if (userId != null && userId !== "") params.userId = userId;
    const res = await apiClient.get("/api/v1/courier/orders", { params });
    const rows = unwrap(res) || [];
    return rows.map(asCourierUiOrder);
  },
  async patchCourierOrderStatus(orderId, status) {
    const res = await apiClient.patch(`/api/v1/courier/orders/${orderId}/status`, { status });
    return asCourierUiOrder(unwrap(res));
  },
  async cancelCourierOrder(orderId, reason) {
    const res = await apiClient.post(`/api/v1/courier/orders/${orderId}/cancel`, { reason });
    return asCourierUiOrder(unwrap(res));
  },
  async assignCourierOrder(orderId, driverId) {
    const res = await apiClient.patch(`/api/v1/courier/orders/${orderId}/assign`, { driverId });
    return asCourierUiOrder(unwrap(res));
  },
  async getCourierTracking(orderId) {
    const res = await apiClient.get(`/api/v1/courier/orders/${orderId}/tracking`);
    return unwrap(res) || [];
  },
  async getDriverCourierOrders(driverId) {
    const res = await apiClient.get(`/api/v1/drivers/${driverId}/courier-orders`);
    return (unwrap(res) || []).map(asCourierUiOrder);
  },
  async updateDriverCourierOrderStatus(driverId, orderId, status) {
    const res = await apiClient.patch(`/api/v1/drivers/${driverId}/courier-orders/${orderId}/status`, { status });
    return asCourierUiOrder(unwrap(res));
  },
  async postDriverTracking(payload) {
    const res = await apiClient.post("/api/v1/drivers/tracking", payload);
    return unwrap(res);
  },
};
