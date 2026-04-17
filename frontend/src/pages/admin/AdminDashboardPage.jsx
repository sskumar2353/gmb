import { Activity, BadgeIndianRupee, Car, CircleUserRound, ReceiptText, ShieldCheck, Users } from "lucide-react";
import RoleDashboardLayout from "../../layouts/RoleDashboardLayout";
import Card from "../../components/ui/Card";
import PaginatedTable from "../../components/dashboard/PaginatedTable";
import Badge from "../../components/ui/Badge";
import Select from "../../components/ui/Select";
import { useAppStore } from "../../store/useAppStore";
import { useEffect, useState } from "react";
import { liveApi } from "../../services/liveApi";

const items = [
  { to: "/admin", label: "Overview", icon: Activity },
  { to: "/admin/operations", label: "Approvals", icon: ShieldCheck },
];

export default function AdminDashboardPage() {
  const rides = useAppStore((s) => s.rides);
  const bookings = useAppStore((s) => s.bookings);
  const driverApplications = useAppStore((s) => s.driverApplications);
  const [stats, setStats] = useState(null);
  const [auditPage, setAuditPage] = useState(0);
  const [auditEntity, setAuditEntity] = useState("");
  const [auditLogs, setAuditLogs] = useState({ items: [], page: 0, totalPages: 1, totalItems: 0 });

  useEffect(() => {
    const load = async () => {
      try {
        const data = await liveApi.getAdminDashboard();
        setStats(data);
      } catch {
        setStats(null);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadAuditLogs = async () => {
      try {
        const data = await liveApi.getAdminAuditLogs({
          page: auditPage,
          size: 5,
          entity: auditEntity || undefined,
        });
        setAuditLogs(data || { items: [], page: 0, totalPages: 1, totalItems: 0 });
      } catch {
        setAuditLogs({ items: [], page: 0, totalPages: 1, totalItems: 0 });
      }
    };
    loadAuditLogs();
  }, [auditPage, auditEntity]);

  const usersRows = Array.from({ length: 14 }).map((_, i) => ({
    name: `User ${i + 1}`,
    email: `user${i + 1}@mail.com`,
    status: i % 3 === 0 ? "Pending" : "Active",
  }));

  const driversRows = driverApplications.map((d) => ({
    name: d.fullName,
    email: d.email,
    vehicle: d.vehicleModel,
    status: d.status,
  }));

  const ridesRows = rides.slice(0, 20).map((r) => ({
    route: `${r.from} → ${r.to}`,
    driver: r.driver,
    status: r.approvalStatus || "approved",
    price: `Rs. ${r.price}`,
  }));

  const refundsRows = bookings.slice(0, 12).map((b) => ({
    booking: b.id,
    route: `${b.ride?.from || "-"} → ${b.ride?.to || "-"}`,
    status: b.status,
    amount: `Rs. ${b.refundAmount || 0}`,
  }));

  const auditRows = (auditLogs.items || []).map((log) => ({
    when: log.createdAt ? new Date(log.createdAt).toLocaleString() : "-",
    entity: log.entity,
    actor: log.userId ?? "system",
    details: log.details,
  }));

  const statusCell = (value) => (
    <Badge type={String(value).toLowerCase().includes("active") || String(value).toLowerCase().includes("approved") ? "success" : String(value).toLowerCase().includes("pending") ? "warning" : "alert"}>
      {value}
    </Badge>
  );

  return (
    <RoleDashboardLayout title="Admin Dashboard" subtitle="Monitor users, drivers, routes, and finance panels." items={items}>
      <div className="grid gap-4 md:grid-cols-5">
        <Card><p className="text-xs text-[#6B7280]">Total users</p><p className="text-2xl font-bold text-gm-navy">{stats?.totalUsers ?? usersRows.length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Drivers</p><p className="text-2xl font-bold text-gm-navy">{stats?.totalDrivers ?? driverApplications.length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Rides</p><p className="text-2xl font-bold text-gm-green">{stats?.totalRides ?? rides.length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Bookings</p><p className="text-2xl font-bold text-gm-navy">{stats?.totalBookings ?? bookings.length}</p></Card>
        <Card><p className="text-xs text-[#6B7280]">Revenue (UI)</p><p className="text-2xl font-bold text-gm-green">Rs. 1.8L</p></Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><BadgeIndianRupee className="h-4 w-4" /> Revenue Analytics (Static)</h2>
          <div className="grid h-36 grid-cols-10 items-end gap-2">
            {[22, 34, 41, 56, 48, 61, 68, 59, 74, 83].map((v, i) => (
              <div key={i} className="rounded-t bg-gm-green/80 transition hover:bg-gm-green" style={{ height: `${v}%` }} />
            ))}
          </div>
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><ReceiptText className="h-4 w-4" /> Notification Panel (UI)</h2>
          {[
            "3 driver applications are awaiting validation.",
            "5 routes need attestation by admin.",
            "2 refund requests moved to processing state.",
            "High demand detected on Hyderabad → Vijayawada.",
          ].map((n) => (
            <div key={n} className="mb-2 rounded-xl border border-[#E5E7EB] bg-white p-3 text-sm text-[#374151]">{n}</div>
          ))}
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><Users className="h-4 w-4" /> Users Table</h2>
        <PaginatedTable
          columns={[
            { key: "name", label: "Name" },
            { key: "email", label: "Email" },
            { key: "status", label: "Status", render: statusCell },
          ]}
          rows={usersRows}
        />
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><CircleUserRound className="h-4 w-4" /> Drivers Table</h2>
          <PaginatedTable
            columns={[
              { key: "name", label: "Name" },
              { key: "vehicle", label: "Vehicle" },
              { key: "status", label: "Status", render: statusCell },
            ]}
            rows={driversRows}
          />
        </Card>
        <Card>
          <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><Car className="h-4 w-4" /> Rides Monitoring</h2>
          <PaginatedTable
            columns={[
              { key: "route", label: "Route" },
              { key: "driver", label: "Driver" },
              { key: "status", label: "Status", render: statusCell },
              { key: "price", label: "Fare" },
            ]}
            rows={ridesRows}
          />
        </Card>
      </div>

      <Card>
        <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gm-navy"><ReceiptText className="h-4 w-4" /> Refund Management</h2>
        <PaginatedTable
          columns={[
            { key: "booking", label: "Booking ID" },
            { key: "route", label: "Route" },
            { key: "status", label: "Status", render: statusCell },
            { key: "amount", label: "Refund Amount" },
          ]}
          rows={refundsRows}
        />
      </Card>

      <Card>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gm-navy">
            <ShieldCheck className="h-4 w-4" />
            Security Audit Logs
          </h2>
          <div className="w-full sm:w-56">
            <Select
              label="Filter by entity"
              value={auditEntity}
              onChange={(e) => {
                setAuditEntity(e.target.value);
                setAuditPage(0);
              }}
            >
              <option value="">All</option>
              <option value="BOOKING">Booking</option>
              <option value="NOTIFICATION">Notification</option>
              <option value="DRIVER">Driver</option>
            </Select>
          </div>
        </div>
        <PaginatedTable
          columns={[
            { key: "when", label: "Time" },
            { key: "entity", label: "Entity", render: statusCell },
            { key: "actor", label: "Actor ID" },
            { key: "details", label: "Details" },
          ]}
          rows={auditRows}
          pageSize={5}
        />
        <div className="mt-3 flex items-center justify-between text-xs text-[#6B7280]">
          <p>
            Backend page {Number(auditLogs.page || 0) + 1} of {Math.max(1, auditLogs.totalPages || 1)} · {auditLogs.totalItems || 0} records
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded border border-[#E5E7EB] px-3 py-1 disabled:opacity-50"
              disabled={auditPage <= 0}
              onClick={() => setAuditPage((p) => Math.max(0, p - 1))}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded border border-[#E5E7EB] px-3 py-1 disabled:opacity-50"
              disabled={auditPage >= Math.max(0, (auditLogs.totalPages || 1) - 1)}
              onClick={() => setAuditPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      </Card>
    </RoleDashboardLayout>
  );
}
