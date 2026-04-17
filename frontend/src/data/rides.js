import { estimateDistanceKm, estimateTravelMinutes } from "../utils/geo";

const DRIVER_POOL = [
  "Aman Reddy",
  "Neha Rao",
  "Rahul Kumar",
  "Sandeep Nair",
  "Divya Sharma",
  "Mahesh Teja",
  "Priya Menon",
  "Kiran Varma",
  "Arjun Patil",
  "Nitya Iyer",
];

const VEHICLES = ["Kia Carens", "Maruti Ertiga", "Toyota Innova Crysta", "Hyundai Alcazar"];
const AMENITIES = [
  ["AC", "USB Charging", "Music"],
  ["AC", "Luggage Space", "Verified Driver"],
  ["AC", "FastTag", "Bottle Water"],
  ["AC", "Women Friendly", "On-time Pickup"],
];
const TIMES = ["06:30 AM", "08:15 AM", "11:45 AM", "02:30 PM", "06:20 PM", "09:15 PM", "11:10 PM"];

const hyderabadRoutes = [
  "Vijayawada",
  "Vizag",
  "Rajamundry",
  "Kakinada",
  "Gundur",
  "Nellore",
  "Kadapa",
  "Prakasam",
  "Macherla",
  "Vizianagaram",
];

const interstatePairs = [
  ["Hyderabad", "Bengaluru"],
  ["Hyderabad", "Chennai"],
  ["Hyderabad", "Mumbai"],
  ["Hyderabad", "Pune"],
  ["Hyderabad", "Kochi"],
  ["Hyderabad", "Mysore"],
  ["Vijayawada", "Chennai"],
  ["Vizag", "Chennai"],
  ["Vijayawada", "Bengaluru"],
  ["Vizag", "Bengaluru"],
  ["Rajamundry", "Chennai"],
  ["Kakinada", "Bengaluru"],
  ["Nellore", "Chennai"],
  ["Kadapa", "Bengaluru"],
  ["Prakasam", "Chennai"],
  ["Bengaluru", "Chennai"],
  ["Bengaluru", "Kochi"],
  ["Bengaluru", "Thiruvananthapuram"],
  ["Bengaluru", "Mangalore"],
  ["Bengaluru", "Coimbatore"],
  ["Chennai", "Coimbatore"],
  ["Chennai", "Madurai"],
  ["Chennai", "Kochi"],
  ["Coimbatore", "Kochi"],
  ["Madurai", "Kochi"],
  ["Mumbai", "Pune"],
  ["Mumbai", "Nashik"],
  ["Pune", "Nagpur"],
  ["Pune", "Aurangabad"],
  ["Nagpur", "Hyderabad"],
  ["Kochi", "Thiruvananthapuram"],
  ["Kozhikode", "Kochi"],
  ["Thrissur", "Bengaluru"],
  ["Mysore", "Chennai"],
  ["Hubballi", "Hyderabad"],
  ["Mangalore", "Hyderabad"],
];

function toBidirectional(pairs) {
  return pairs.flatMap(([a, b]) => [[a, b], [b, a]]);
}

const allPairs = [
  ...toBidirectional(hyderabadRoutes.map((city) => ["Hyderabad", city])),
  ...toBidirectional(interstatePairs),
];

function createRide([from, to], idx) {
  const distanceKm = estimateDistanceKm(from, to) || 180;
  const travelMins = estimateTravelMinutes(from, to) || 240;
  const seats = 2 + (idx % 4);
  const basePrice = Math.round(distanceKm * 1.8 + 120);
  const date = new Date();
  date.setDate(date.getDate() + (idx % 7));

  return {
    id: String(idx + 1),
    driver: DRIVER_POOL[idx % DRIVER_POOL.length],
    rating: Number((4.4 + (idx % 5) * 0.1).toFixed(1)),
    licenseNumber: `DL-${10 + (idx % 80)}-20${20 + (idx % 6)}-${1000 + idx}`,
    price: basePrice,
    totalSeats: 6,
    seats,
    vehicle: VEHICLES[idx % VEHICLES.length],
    vehicleRegistration: `TS${10 + (idx % 20)} AB ${1200 + idx}`,
    amenities: AMENITIES[idx % AMENITIES.length],
    approvalStatus: "approved",
    createdBy: "system@greenmiles.com",
    time: TIMES[idx % TIMES.length],
    date: date.toISOString().slice(0, 10),
    from,
    to,
    distanceKm,
    travelMins,
  };
}

export const rides = allPairs.map(createRide);
