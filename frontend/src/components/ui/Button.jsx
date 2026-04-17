const styles = {
  primary:
    "bg-gm-green text-white hover:bg-gm-green-dark shadow-sm hover:shadow-md",
  secondary:
    "bg-gm-soft text-gm-green-dark hover:bg-gm-soft-2 border border-[#E5E7EB]",
  outline: "border border-[#E5E7EB] text-gm-navy hover:bg-gm-soft",
};

export default function Button({ children, variant = "primary", className = "", ...props }) {
  return (
    <button
      className={`rounded-xl px-4 py-2 font-semibold transition ${styles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
