import { useMemo, useState } from "react";
import Button from "../ui/Button";

export default function PaginatedTable({ columns, rows, pageSize = 5 }) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(rows.length / pageSize));
  const data = useMemo(() => rows.slice((page - 1) * pageSize, page * pageSize), [rows, page, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white">
      <table className="w-full text-left text-sm">
        <thead className="bg-[#F9FAFB] text-[#6B7280]">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-3 font-semibold">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr key={idx} className="border-t border-[#F3F4F6]">
              {columns.map((c) => (
                <td key={c.key} className="px-4 py-3">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div className="flex items-center justify-between border-t border-[#F3F4F6] px-4 py-3">
        <p className="text-xs text-[#6B7280]">Page {page} of {totalPages}</p>
        <div className="flex gap-2">
          <Button variant="outline" className="!px-3 !py-1 text-xs" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
          <Button variant="outline" className="!px-3 !py-1 text-xs" onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
