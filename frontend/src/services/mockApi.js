import { rides } from "../data/rides";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
let ridesDb = [...rides];

export const mockApi = {
  async getRides() { await wait(350); return { data: ridesDb }; },
  async submitDriverApplication(payload) {
    await wait(500);
    return { data: { id: `DRV-${Date.now()}`, ...payload, status: "pending", submittedAt: new Date().toISOString() } };
  },
  async createRide(payload) {
    await wait(450);
    const newRide = {
      id: `R-${Date.now()}`,
      approvalStatus: "pending",
      ...payload,
    };
    ridesDb = [newRide, ...ridesDb];
    return { data: newRide };
  },
  async postBooking(payload) { await wait(450); return { data: { id: `BK-${Date.now()}`, ...payload, status: "confirmed" } }; },
  async postPayment(payload) { await wait(500); return { data: { success: payload.method !== "fail", id: `TXN-${Date.now()}` } }; }
  ,
  async cancelBooking(_payload) {
    await wait(350);
    return { data: { success: true } };
  },
  async postCourierBooking(payload) {
    await wait(650);
    const basePrice = 99;
    const weight = Number(payload.weight || 1);
    const distanceKm = payload.distanceKm ?? 12;
    const price = Math.round(basePrice + weight * 38 + distanceKm * 18);
    return {
      data: {
        id: `CR-${Date.now()}`,
        pickup: payload.pickup,
        drop: payload.drop,
        weight: payload.weight,
        distanceKm,
        price,
        status: "pickup_pending",
        etaMins: 22,
        bookedAt: new Date().toISOString(),
        contact: payload.contact,
      },
    };
  }
};