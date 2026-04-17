import { Link } from "react-router-dom";
import { SlidersHorizontal } from "lucide-react";

const items = [
  { to: "/dashboard", label: "My bookings" },
  { to: "/my-bookings", label: "Bookings" },
  { to: "/courier", label: "Courier" },
];

export default function Sidebar({ filters, onChange }) {
  const time = filters?.time || "all";
  const maxPrice = filters?.maxPrice || 1000;

  return (
    <aside className="glass hidden w-56 shrink-0 rounded-2xl p-4 md:block">
      <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-[#6B7280]">
        <SlidersHorizontal className="h-4 w-4" />
        Filters
      </p>
      <p className="mb-3 text-xs text-[#9CA3AF]">Refine by time and fare</p>
      <div className="space-y-1 border-b border-[#E5E7EB] pb-3">
        <button
          type="button"
          onClick={() => onChange?.({ time: "morning" })}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gm-soft ${time === "morning" ? "bg-gm-soft text-gm-green" : "text-[#1F2937]"}`}
        >
          Morning
        </button>
        <button
          type="button"
          onClick={() => onChange?.({ time: "evening" })}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gm-soft ${time === "evening" ? "bg-gm-soft text-gm-green" : "text-[#1F2937]"}`}
        >
          Evening
        </button>
        <button
          type="button"
          onClick={() => onChange?.({ time: "all" })}
          className={`w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-gm-soft ${time === "all" ? "bg-gm-soft text-gm-green" : "text-[#1F2937]"}`}
        >
          Any time
        </button>
        <div className="mt-2 px-2">
          <label className="text-xs text-[#6B7280]">Max fare: Rs. {maxPrice}</label>
          <input
            type="range"
            min={200}
            max={700}
            step={20}
            value={maxPrice}
            onChange={(e) => onChange?.({ maxPrice: Number(e.target.value) })}
            className="mt-2 w-full accent-[#22c55e]"
          />
        </div>
      </div>
      <p className="mb-2 mt-4 text-xs font-bold uppercase tracking-wide text-[#6B7280]">Quick links</p>
      {items.map(({ to, label }) => (
        <Link key={to} className="block rounded-lg px-3 py-2 text-sm text-[#1F2937] hover:bg-gm-soft" to={to}>
          {label}
        </Link>
      ))}
    </aside>
  );
}
