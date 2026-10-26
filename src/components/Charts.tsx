import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { useLang } from "../lib/i18n";

const axis = { stroke: "var(--axis)", tick: { fill: "var(--text-muted)", fontSize: 12 }, tickLine: false };
const grid = <CartesianGrid stroke="var(--grid)" vertical={false} />;
const tooltipStyle = {
  contentStyle: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--text-primary)",
    fontSize: 13,
  },
  labelStyle: { color: "var(--text-primary)", fontWeight: 600 },
  itemStyle: { color: "var(--text-secondary)" },
  cursor: { fill: "var(--hover)" },
};

export interface Series {
  key: string;
  label: string;
  color: string;
}

export function Card({ title, subtitle, children, wide }: { title: string; subtitle?: string; children: ReactNode; wide?: boolean }) {
  return (
    <section className={`card${wide ? " wide" : ""}`}>
      <header>
        <h2>{title}</h2>
        {subtitle && <p className="subtitle">{subtitle}</p>}
      </header>
      {children}
    </section>
  );
}

type Datum = { [key: string]: string | number };

export function ColumnChart({
  data,
  xKey,
  series,
  stacked,
  unit,
  yMax,
  height = 280,
}: {
  data: Datum[];
  xKey: string;
  series: Series[];
  stacked?: boolean;
  unit?: string;
  yMax?: number;
  height?: number;
}) {
  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2}>
          {grid}
          <XAxis dataKey={xKey} {...axis} interval="preserveStartEnd" minTickGap={4} />
          <YAxis {...axis} axisLine={false} width={44} unit={unit} domain={[0, yMax ?? "auto"]} tickCount={yMax ? yMax + 1 : 5} />
          <Tooltip {...tooltipStyle} />
          {series.length > 1 && <Legend itemSorter={null} wrapperStyle={{ fontSize: 13, color: "var(--text-secondary)" }} />}
          {series.map((s, i) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              name={s.label}
              fill={s.color}
              stackId={stacked ? "a" : undefined}
              stroke="var(--surface)"
              strokeWidth={stacked ? 2 : 0}
              radius={!stacked || i === series.length - 1 ? [4, 4, 0, 0] : 0}
              maxBarSize={36}
              unit={unit}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Horizontal bars grow from the reading-start side: right in Arabic, left in English.
export function RowChart({ data, color, unit, height = 240 }: { data: { label: string; value: number }[]; color: string; unit?: string; height?: number }) {
  const { t, rtl } = useLang();
  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 8, bottom: 0, left: 8 }}>
          <CartesianGrid stroke="var(--grid)" horizontal={false} />
          <XAxis type="number" {...axis} reversed={rtl} />
          <YAxis type="category" dataKey="label" {...axis} axisLine={false} width={120} orientation={rtl ? "right" : "left"} />
          <Tooltip {...tooltipStyle} />
          <Bar dataKey="value" name={t.count} fill={color} radius={rtl ? [4, 0, 0, 4] : [0, 4, 4, 0]} maxBarSize={22} unit={unit} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TrendChart({ data, xKey, series, unit, height = 280 }: { data: Datum[]; xKey: string; series: Series[]; unit?: string; height?: number }) {
  return (
    <div className="chart" style={{ height }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          {grid}
          <XAxis dataKey={xKey} {...axis} />
          <YAxis {...axis} axisLine={false} width={44} unit={unit} domain={[0, "auto"]} />
          <Tooltip {...tooltipStyle} cursor={{ stroke: "var(--axis)" }} />
          {series.length > 1 && <Legend itemSorter={null} wrapperStyle={{ fontSize: 13 }} />}
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, stroke: "var(--surface)", strokeWidth: 2 }}
              unit={unit}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
