import { useEffect, useState } from "react";
import Button from "../ui/Button";

const KEY = "gm_cookie_pref";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(KEY);
    setVisible(!saved);
  }, []);

  const save = (value) => {
    localStorage.setItem(KEY, value);
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-xl md:left-auto md:max-w-md">
      <p className="text-sm font-semibold text-gm-navy">Cookie Preferences</p>
      <p className="mt-1 text-xs text-[#6B7280]">
        We use cookies to keep you signed in, improve route suggestions, and provide a smoother booking experience.
      </p>
      <div className="mt-3 flex gap-2">
        <Button className="!px-3 !py-1.5 text-sm" onClick={() => save("accepted")}>Accept all</Button>
        <Button variant="outline" className="!px-3 !py-1.5 text-sm" onClick={() => save("essential")}>Essential only</Button>
      </div>
    </div>
  );
}
