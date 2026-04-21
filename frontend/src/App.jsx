import AppRoutes from "./routes/AppRoutes";
import Toast from "./components/ui/Toast";
import { useAppStore } from "./store/useAppStore";
import { useToastTimeout } from "./hooks/useToastTimeout";

export default function App() {
  const toast = useAppStore((s) => s.toast);
  useToastTimeout();
  return (
    <div className="min-h-screen text-[#1F2937]">
      <AppRoutes />
      <Toast visible={toast.visible} message={toast.message} type={toast.type} />
    </div>
  );
}