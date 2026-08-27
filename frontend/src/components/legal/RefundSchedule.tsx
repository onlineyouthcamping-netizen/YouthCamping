export function RefundSchedule() {
  const rows = [
    ["Advance booking amount", "Non-refundable"],
    ["Before 45 days", "80% refund of total package cost"],
    ["Before 30 days", "50% refund of total package cost"],
    ["Before 15 days", "25% refund of total package cost"],
    ["Rescheduling dates (20–30 days prior)", "Extra 25% of total package cost"],
    ["Within 15 days", "No refund"],
    ["No show", "No refund"],
  ];
  return (
    <div className="overflow-x-auto rounded-2xl border border-zinc-200">
      <table className="w-full text-left text-[11px] sm:text-xs">
        <thead className="bg-[#0B1528] text-white">
          <tr>
            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wide">
              Timeline
            </th>
            <th className="px-3 py-2.5 font-extrabold uppercase tracking-wide">
              Refund
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map(([when, refund], i) => (
            <tr
              key={when}
              className={i % 2 === 0 ? "bg-zinc-50" : "bg-white"}
            >
              <td className="px-3 py-2.5 font-bold text-[#0B1528]">{when}</td>
              <td className="px-3 py-2.5 font-semibold text-zinc-600">
                {refund}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
