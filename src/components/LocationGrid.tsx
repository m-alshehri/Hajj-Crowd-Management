import { useMemo, useState } from "react";
import { fmt, pct, type Observation } from "../lib/data";
import { useLang } from "../lib/i18n";

const N = 10;

interface Cell {
  row: number;
  col: number;
  count: number;
  high: number;
  latRange: [number, number];
  longRange: [number, number];
}

type Metric = "count" | "high";

const valueOf = (c: Cell, metric: Metric) => (metric === "count" ? c.count : c.count ? c.high / c.count : 0);

// Bins the readings' coordinates into an N×N grid (north at the top, east on the right).
export function LocationGrid({ data }: { data: Observation[] }) {
  const [metric, setMetric] = useState<Metric>("count");
  const [hover, setHover] = useState<Cell | null>(null);
  const { t } = useLang();

  const { cells, min, max } = useMemo(() => {
    if (!data.length) return { cells: [] as Cell[], min: 0, max: 0 };
    let minLat = Infinity, maxLat = -Infinity, minLong = Infinity, maxLong = -Infinity;
    for (const d of data) {
      minLat = Math.min(minLat, d.lat);
      maxLat = Math.max(maxLat, d.lat);
      minLong = Math.min(minLong, d.long);
      maxLong = Math.max(maxLong, d.long);
    }
    const dLat = (maxLat - minLat) / N || 1;
    const dLong = (maxLong - minLong) / N || 1;
    const cells: Cell[] = [];
    for (let row = 0; row < N; row++) {
      for (let col = 0; col < N; col++) {
        const latHi = maxLat - row * dLat;
        const longLo = minLong + col * dLong;
        cells.push({ row, col, count: 0, high: 0, latRange: [latHi - dLat, latHi], longRange: [longLo, longLo + dLong] });
      }
    }
    for (const d of data) {
      const row = Math.min(N - 1, Math.floor((maxLat - d.lat) / dLat));
      const col = Math.min(N - 1, Math.floor((d.long - minLong) / dLong));
      const c = cells[row * N + col];
      c.count++;
      if (d.crowdDensity === "High") c.high++;
    }
    const values = cells.map((c) => valueOf(c, metric));
    return { cells, min: Math.min(...values), max: Math.max(...values) };
  }, [data, metric]);

  return (
    <div className="location">
      <div className="segmented" role="group" aria-label={t.mapMetric}>
        <button aria-pressed={metric === "count"} onClick={() => setMetric("count")}>{t.mapCount}</button>
        <button aria-pressed={metric === "high"} onClick={() => setMetric("high")}>{t.mapHigh}</button>
      </div>
      <div className="grid-wrap">
        <span className="compass n">{t.north}</span>
        <div className="heat" style={{ gridTemplateColumns: `repeat(${N}, 1fr)` }} onMouseLeave={() => setHover(null)}>
          {cells.map((c) => {
            const shade = max > min ? (valueOf(c, metric) - min) / (max - min) : 0;
            return (
              <div
                key={`${c.row}-${c.col}`}
                className={`cell${hover === c ? " active" : ""}`}
                style={{ background: `color-mix(in oklab, var(--seq-hi) ${Math.round(shade * 100)}%, var(--seq-lo))` }}
                onMouseEnter={() => setHover(c)}
                title={t.mapCellTitle(fmt(c.count, 0), pct(c.count ? c.high / c.count : NaN))}
              />
            );
          })}
        </div>
        <span className="compass e">{t.east}</span>
      </div>
      <p className="hover-readout">
        {hover
          ? t.mapReadout(
              `${hover.latRange[0].toFixed(3)}–${hover.latRange[1].toFixed(3)}`,
              `${hover.longRange[0].toFixed(3)}–${hover.longRange[1].toFixed(3)}`,
              fmt(hover.count, 0),
              pct(hover.count ? hover.high / hover.count : NaN),
            )
          : t.mapHint}
      </p>
      <div className="ramp-legend">
        <span>{metric === "count" ? fmt(min, 0) : pct(min)}</span>
        <div className="ramp" />
        <span>{metric === "count" ? fmt(max, 0) : pct(max)}</span>
      </div>
    </div>
  );
}
