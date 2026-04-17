const c = {
  success: "bg-gm-soft text-gm-green-dark",
  warning: "bg-[#FEF3C7] text-[#D97706]",
  alert: "bg-[#FEE2E2] text-[#DC2626]",
  info: "bg-gm-navy-soft text-gm-navy",
};

export default function Badge({ children, type = "info" }) {
  return <span className={`rounded-full px-2 py-1 text-xs font-semibold ${c[type]}`}>{children}</span>;
}
