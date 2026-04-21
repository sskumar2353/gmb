import { useEffect } from "react";
import { useAppStore } from "../store/useAppStore";

export function useToastTimeout() {
  const visible = useAppStore((s) => s.toast.visible);
  const hide = useAppStore((s) => s.hideToast);
  useEffect(() => {
    if (!visible) return;
    const t = setTimeout(() => hide(), 5000);
    return () => clearTimeout(t);
  }, [visible, hide]);
}