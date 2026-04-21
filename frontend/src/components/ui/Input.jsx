export default function Input({ label, className = "", ...props }) {
  return (
    <label className="flex flex-col gap-1 text-sm text-gm-navy">
      {label && <span>{label}</span>}
      <input
        className={`rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 outline-none focus:border-gm-green focus:ring-2 focus:ring-gm-ring ${className}`}
        {...props}
      />
    </label>
  );
}
