export default function Modal({ open, title, onClose, children }) {
  if (!open) return null;
  return <div className="fixed inset-0 z-40 grid place-items-center bg-black/60 p-4"><div className="glass w-full max-w-md rounded-2xl p-4"><div className="mb-3 flex items-center justify-between"><h3>{title}</h3><button onClick={onClose}>X</button></div>{children}</div></div>;
}