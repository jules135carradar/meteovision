import { Divergence } from "@/lib/types";

interface Props {
  divergences: Divergence[];
}

export default function DivergenceAlert({ divergences }: Props) {
  const significant = divergences.filter((d) => d.severity !== "faible");
  if (significant.length === 0) return null;

  return (
    <div className="space-y-3">
      {significant.map((d) => (
        <div
          key={d.metric}
          className={`rounded-2xl p-4 border flex gap-3 items-start ${
            d.severity === "élevée"
              ? "bg-red-900/30 border-red-500/40"
              : "bg-yellow-900/30 border-yellow-500/40"
          }`}
        >
          <span className="text-2xl flex-shrink-0">
            {d.severity === "élevée" ? "⚠️" : "ℹ️"}
          </span>
          <div>
            <p
              className={`font-semibold ${
                d.severity === "élevée" ? "text-red-300" : "text-yellow-300"
              }`}
            >
              Divergence {d.severity} — {d.metricLabel}
            </p>
            <p className="text-sky-100 text-sm mt-1">{d.message}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {d.values.map((v) => (
                <span
                  key={v.source}
                  className="bg-white/10 rounded-lg px-2 py-0.5 text-xs text-sky-200"
                >
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
