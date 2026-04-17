const CITY_COORDS = {
  Hyderabad: [17.385, 78.4867],
  Vijayawada: [16.5062, 80.648],
  Vizag: [17.6868, 83.2185],
  Visakhapatnam: [17.6868, 83.2185],
  Rajamundry: [17.0005, 81.804],
  Rajahmundry: [17.0005, 81.804],
  Kakinada: [16.9891, 82.2475],
  Gundur: [16.3067, 80.4365],
  Guntur: [16.3067, 80.4365],
  Nellore: [14.4426, 79.9865],
  Kadapa: [14.4674, 78.8242],
  Prakasam: [15.5057, 80.0499],
  Ongole: [15.5057, 80.0499],
  Macherla: [16.4769, 79.4353],
  Vizianagaram: [18.1124, 83.3956],

  Chennai: [13.0827, 80.2707],
  Coimbatore: [11.0168, 76.9558],
  Madurai: [9.9252, 78.1198],
  Tiruchirappalli: [10.7905, 78.7047],
  Salem: [11.6643, 78.146],

  Bengaluru: [12.9716, 77.5946],
  Bangalore: [12.9716, 77.5946],
  Mysore: [12.2958, 76.6394],
  Hubballi: [15.3647, 75.124],
  Mangalore: [12.9141, 74.856],

  Kochi: [9.9312, 76.2673],
  Thiruvananthapuram: [8.5241, 76.9366],
  Kozhikode: [11.2588, 75.7804],
  Thrissur: [10.5276, 76.2144],

  Mumbai: [19.076, 72.8777],
  Pune: [18.5204, 73.8567],
  Nagpur: [21.1458, 79.0882],
  Nashik: [19.9975, 73.7898],
  Aurangabad: [19.8762, 75.3433],
};

const ALIASES = {
  "vizag": "Vizag",
  "visakhapatnam": "Vizag",
  "rajahmundry": "Rajamundry",
  "gundur": "Gundur",
  "guntur": "Gundur",
  "prakasam": "Prakasam",
  "ongole": "Prakasam",
  "macherla": "Macherla",
  "macharla": "Macherla",
  "bangalore": "Bengaluru",
  "bengaluru": "Bengaluru",
};

export const SERVICEABLE_CITIES = [
  "Hyderabad",
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
  "Chennai",
  "Coimbatore",
  "Madurai",
  "Tiruchirappalli",
  "Salem",
  "Bengaluru",
  "Mysore",
  "Hubballi",
  "Mangalore",
  "Kochi",
  "Thiruvananthapuram",
  "Kozhikode",
  "Thrissur",
  "Mumbai",
  "Pune",
  "Nagpur",
  "Nashik",
  "Aurangabad",
];

export function normalizeCityName(city) {
  const raw = String(city || "").trim();
  if (!raw) return "";
  const key = raw.toLowerCase();
  return ALIASES[key] || raw;
}

export function getCityCoordinates(city) {
  const normalized = normalizeCityName(city);
  return CITY_COORDS[normalized] || null;
}

export function isServiceableCity(city) {
  return !!getCityCoordinates(city);
}

export function haversineKm([lat1, lon1], [lat2, lon2]) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function estimateDistanceKm(fromCity, toCity) {
  const from = getCityCoordinates(fromCity);
  const to = getCityCoordinates(toCity);
  if (!from || !to) return null;
  // Road routes are typically longer than straight-line distance.
  return Math.round(haversineKm(from, to) * 1.24);
}

export function estimateTravelMinutes(fromCity, toCity, avgSpeedKmph = 58) {
  const km = estimateDistanceKm(fromCity, toCity);
  if (!km) return null;
  const mins = Math.round((km / avgSpeedKmph) * 60 + 20);
  return Math.max(30, mins);
}

export function formatDuration(minutes) {
  if (!minutes) return "N/A";
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (!hrs) return `${mins} mins`;
  return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
}

export function formatDistance(km) {
  if (!km) return "N/A";
  return `${km} km`;
}
