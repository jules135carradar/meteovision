import { Divergence } from "@/lib/types";

export default function DivergenceAlert({ divergences }: { divergences: Divergence[] }) {
  const significant = divergences.filter((d) => d.severity !== "faible");
  if (significant.length === 0) return null;

  return (
    <div className="space-y-3">
      {significant.map((d) => (
        <div
          key={d.metric}
          className={`rounded-2xl p-4 border flex gap-3 items-start ${
            d.severity === "élevée"
              ? "bg-red-50 border-red-100"
              : "bg-amber-50 border-amber-100"
          }`}
        >
          <span className="text-xl flex-shrink-0">{d.severity === "élevée" ? "⚠️" : "ℹ️"}</span>
          <div>
            <p className={`font-medium text-sm ${d.severity === "élevée" ? "text-red-600" : "text-amber-600"}`}>
              Divergence {d.severity} — {d.metricLabel}
            </p>
            <p className="text-slate-500 text-sm mt-1 font-light">{d.message}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {d.values.map((v) => (
                <span key={v.source} className="bg-white rounded-lg px-2 py-0.5 text-xs text-slate-500 border border-slate-100">
                  {v.source} : {v.value.toFixed(1)}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
