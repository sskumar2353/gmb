import { Link, useLocation } from "react-router-dom";

export default function RoleSidebar({ items, collapsed = false }) {
  const { pathname } = useLocation();
  return (
    <aside className={`rounded-2xl border border-[#E5E7EB] bg-white p-3 shadow-sm transition-all ${collapsed ? "w-20" : "w-64"}`}>
      <div className="space-y-1">
        {items.map((item) => {
          const active = pathname === item.to;
          return (
            <Link
              key={`${item.to}-${item.label}`}
              to={item.to}
              className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                active ? "bg-gm-soft text-gm-green" : "text-[#374151] hover:bg-gm-soft"
              }`}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
