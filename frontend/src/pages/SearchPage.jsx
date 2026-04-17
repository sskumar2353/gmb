import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bus } from "lucide-react";
import Layout from "../components/layout/Layout";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { useAppStore } from "../store/useAppStore";

function formatISODate(d) {
  return d.toISOString().slice(0, 10);
}

export default function SearchPage() {
  const nav = useNavigate();
  const searchParams = useAppStore((s) => s.searchParams);
  const setSearchParams = useAppStore((s) => s.setSearchParams);
  const today = useMemo(() => formatISODate(new Date()), []);

  const [from, setFrom] = useState(searchParams.from || "");
  const [to, setTo] = useState(searchParams.to || "");
  const [date, setDate] = useState(searchParams.date || today);
  const [passengers, setPassengers] = useState(searchParams.passengers || 1);
  const [womenOnly, setWomenOnly] = useState(searchParams.womenOnly || false);

  useEffect(() => {
    setFrom(searchParams.from || "");
    setTo(searchParams.to || "");
    setDate(searchParams.date || today);
    setPassengers(searchParams.passengers || 1);
    setWomenOnly(!!searchParams.womenOnly);
  }, [searchParams, today]);

  const submit = (e) => {
    e.preventDefault();
    setSearchParams({ from, to, date, passengers, womenOnly });
    nav("/results");
  };

  return (
    <Layout>
      <Card className="mx-auto max-w-3xl space-y-4 border-gm-border-accent shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-[#1F2937]">Search shared rides</h1>
          <p className="mt-1 text-sm text-[#6B7280]">Enter route, date, and passenger count to find carpool rides</p>
        </div>
        <form className="space-y-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-2">
            <Input label="From" value={from} onChange={(e) => setFrom(e.target.value)} required placeholder="Source city" />
            <Input label="To" value={to} onChange={(e) => setTo(e.target.value)} required placeholder="Destination city" />
            <Input label="Date of journey" type="date" value={date} min={today} onChange={(e) => setDate(e.target.value)} required />
            <Input
              label="Passengers"
              type="number"
              min={1}
              max={6}
              value={passengers}
              onChange={(e) => setPassengers(Number(e.target.value))}
              required
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-[#1F2937]">
            <input
              type="checkbox"
              checked={womenOnly}
              onChange={(e) => setWomenOnly(e.target.checked)}
              className="h-4 w-4 rounded border-[#E5E7EB] text-gm-green focus:ring-gm-green"
            />
            Booking for women
          </label>
          <Button type="submit" className="flex w-full items-center justify-center gap-2 md:w-auto">
            <Bus className="h-4 w-4" />
            Search rides
          </Button>
        </form>
      </Card>
    </Layout>
  );
}
