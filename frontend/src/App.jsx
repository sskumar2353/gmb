import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/ui/Toast";
import { useAppStore } from "./store/useAppStore";

export default function App() {
  const toast = useAppStore((s) => s.toast);
  return (
    <div className="min-h-screen text-[#1F2937]">
      <AppRoutes />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </div>
  );
}