export default function EmptyState({ title = "No data found" }) {
  return (
    <div className="glass rounded-2xl p-8 text-center">
      <p className="text-gm-navy">{title}</p>
    </div>
  );
}
