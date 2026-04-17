import { useState } from "react";
import { Bell, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import Layout from "../components/layout/Layout";
import RoleSidebar from "../components/dashboard/RoleSidebar";
import Button from "../components/ui/Button";

export default function RoleDashboardLayout({ title, subtitle, items, children }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <Layout>
      <div className="mb-4 flex items-center justify-between rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gm-navy">{title}</h1>
          <p className="text-sm text-[#6B7280]">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="!px-3 !py-1.5" onClick={() => setCollapsed((v) => !v)}>
            {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
          <button className="relative rounded-xl border border-[#E5E7EB] p-2 text-[#4B5563] hover:bg-gm-soft">
            <Bell className="h-4 w-4" />
            <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-gm-green" />
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        <RoleSidebar items={items} collapsed={collapsed} />
        <div className="w-full space-y-4">{children}</div>
      </div>
    </Layout>
  );
}
