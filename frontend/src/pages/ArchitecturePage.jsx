import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";

const stack = [
  "Frontend: React + Tailwind + React Router + Zustand",
  "Backend (planned): Node.js / Spring Boot (REST APIs)",
  "Database (planned): MySQL/PostgreSQL + Redis cache",
  "Deployment (planned): Vercel (frontend), AWS (backend), RDS (DB)",
];

const actors = [
  "Primary: End User, Driver, Admin",
  "Secondary: Payment Gateway, Map Service, Notification Service",
  "Internal: Database, Redis Cache",
];

const tables = ["Users", "Drivers", "Vehicles", "Rides", "Seats", "Bookings", "Payments", "Refunds", "Courier"];

export default function ArchitecturePage() {
  return (
    <Layout>
      <h1 className="mb-4 text-2xl font-bold text-gm-navy">System Architecture</h1>
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <h2 className="mb-2 font-semibold text-gm-navy">Technical Stack</h2>
          <ul className="space-y-1 text-sm text-[#374151]">
            {stack.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold text-gm-navy">Actors & Services</h2>
          <ul className="space-y-1 text-sm text-[#374151]">
            {actors.map((item) => <li key={item}>- {item}</li>)}
          </ul>
        </Card>
        <Card className="md:col-span-2">
          <h2 className="mb-2 font-semibold text-gm-navy">Database Tables (planned)</h2>
          <div className="flex flex-wrap gap-2">
            {tables.map((t) => (
              <span key={t} className="rounded-full border border-[#E5E7EB] bg-white px-3 py-1 text-xs text-[#374151]">
                {t}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
