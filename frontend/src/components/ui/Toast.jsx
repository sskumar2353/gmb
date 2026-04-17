export default function Toast({ visible, message, type = "info" }) {
  if (!visible) return null;
  const map = {
    success: "#16a34a",
    warning: "#D97706",
    alert: "#DC2626",
    info: "#1e3a5f",
  };
  return (
    <div
      className="fixed bottom-4 right-4 rounded-xl px-4 py-2 text-white shadow-lg"
      style={{ background: map[type] || map.info }}
    >
      {message}
    </div>
  );
}
