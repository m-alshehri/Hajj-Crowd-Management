import { useEffect, useMemo, useState } from "react";
import { Card, ColumnChart, RowChart, TrendChart } from "./components/Charts";
import { LocationGrid } from "./components/LocationGrid";
import { LEVELS, avg, countBy, fmt, groupBy, loadRecords, pct, share, type Observation } from "./lib/data";
import { LangContext, applyLang, dateLocale, initialLang, months, strings, useLang, valueLabel, type Lang, type Strings } from "./lib/i18n";

type FilterKey = "activity" | "crowdDensity" | "transport" | "nationality" | "weather";

const FILTERS: { key: FilterKey; label: keyof Strings }[] = [
  { key: "activity", label: "fActivity" },
  { key: "crowdDensity", label: "fDensity" },
  { key: "transport", label: "fTransport" },
  { key: "nationality", label: "fNationality" },
  { key: "weather", label: "fWeather" },
];

const ALL = "__all";
const NO_FILTERS: { [K in FilterKey]: string } = { activity: ALL, crowdDensity: ALL, transport: ALL, nationality: ALL, weather: ALL };

export default function App() {
  const [lang, setLang] = useState<Lang>(initialLang);
  const [records, setRecords] = useState<Observation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [showTable, setShowTable] = useState(false);

  useEffect(() => applyLang(lang), [lang]);

  useEffect(() => {
    loadRecords().then(setRecords).catch((e: Error) => setError(e.message));
  }, []);

  const t = strings(lang);
  const label = (v: string) => valueLabel(v, lang);

  const options = useMemo(() => {
    const o = {} as { [K in FilterKey]: string[] };
    for (const f of FILTERS) {
      const values = [...new Set(records.map((r) => String(r[f.key])))];
      o[f.key] =
        f.key === "crowdDensity"
          ? LEVELS.filter((l) => values.includes(l))
          : values.sort((a, b) => valueLabel(a, lang).localeCompare(valueLabel(b, lang), lang));
    }
    return o;
  }, [records, lang]);

  const data = useMemo(
    () => records.filter((r) => FILTERS.every((f) => filters[f.key] === ALL || String(r[f.key]) === filters[f.key])),
    [records, filters],
  );

  const kpis = useMemo(
    () => [
      { label: t.kReadings, value: fmt(data.length, 0) },
      { label: t.kHigh, value: pct(share(data, (r) => r.crowdDensity === "High")) },
      { label: t.kQueue, value: t.minutes(fmt(avg(data.map((r) => r.queueMin)))) },
      { label: t.kTransport, value: t.minutes(fmt(avg(data.map((r) => r.transportWaitMin)))) },
      { label: t.kEmergency, value: pct(share(data, (r) => r.emergency)) },
      { label: t.kSafety, value: t.outOf5(fmt(avg(data.map((r) => r.safety)), 2)) },
    ],
    [data, lang],
  );

  const monthly = useMemo(() => {
    const byMonth = groupBy(data, (r) => r.month);
    return months(lang).map((name, m) => {
      const rows = byMonth.get(m) ?? [];
      const counts = countBy(rows, (r) => r.crowdDensity);
      return { name, Low: counts.get("Low") ?? 0, Medium: counts.get("Medium") ?? 0, High: counts.get("High") ?? 0 };
    });
  }, [data, lang]);

  const hourly = useMemo(() => {
    const byHour = groupBy(data, (r) => r.hour);
    return Array.from({ length: 24 }, (_, h) => {
      const rows = byHour.get(h) ?? [];
      return {
        hour: `${String(h).padStart(2, "0")}:00`,
        high: Number((share(rows, (r) => r.crowdDensity === "High") * 100).toFixed(1)),
      };
    });
  }, [data]);

  const waitsByActivity = useMemo(
    () =>
      [...groupBy(data, (r) => r.activity).entries()].map(([activity, rows]) => ({
        activity: valueLabel(String(activity), lang),
        queue: Number(avg(rows.map((r) => r.queueMin)).toFixed(1)),
        transport: Number(avg(rows.map((r) => r.transportWaitMin)).toFixed(1)),
        security: Number(avg(rows.map((r) => r.securityWaitMin)).toFixed(1)),
      })),
    [data, lang],
  );

  const health = useMemo(
    () =>
      [...countBy(data, (r) => r.health).entries()]
        .map(([k, v]) => ({ label: valueLabel(k, lang), value: v }))
        .sort((a, b) => b.value - a.value),
    [data, lang],
  );

  const incidents = useMemo(
    () =>
      [...countBy(data.filter((r) => r.emergency), (r) => r.incident).entries()]
        .map(([k, v]) => ({ label: valueLabel(k, lang), value: v }))
        .sort((a, b) => b.value - a.value),
    [data, lang],
  );

  const ratingsByNationality = useMemo(
    () =>
      [...groupBy(data, (r) => r.nationality).entries()].map(([n, rows]) => ({
        nationality: valueLabel(String(n), lang),
        satisfaction: Number(avg(rows.map((r) => r.satisfaction)).toFixed(2)),
        safety: Number(avg(rows.map((r) => r.safety)).toFixed(2)),
      })),
    [data, lang],
  );

  const activeFilters = FILTERS.filter((f) => filters[f.key] !== ALL).length;

  const langButton = (
    <button className="lang" onClick={() => setLang(lang === "ar" ? "en" : "ar")} lang={lang === "ar" ? "en" : "ar"}>
      {t.switchLang}
    </button>
  );

  if (error) return <div className="state">{t.loadError(error)}</div>;
  if (!records.length) return <div className="state">{t.loading}</div>;

  return (
    <LangContext.Provider value={lang}>
      <div className="page">
        <header className="top">
          <div>
            <h1>{t.title}</h1>
            <p className="subtitle">{t.subtitle(fmt(records.length, 0))}</p>
          </div>
          {langButton}
        </header>

        <div className="filters" role="search">
          {FILTERS.map((f) => (
            <label key={f.key}>
              <span>{t[f.label] as string}</span>
              <select value={filters[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}>
                <option value={ALL}>{t.all}</option>
                {options[f.key].map((v) => (
                  <option key={v} value={v}>
                    {label(v)}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <button className="reset" disabled={!activeFilters} onClick={() => setFilters(NO_FILTERS)}>
            {t.reset}
          </button>
        </div>

        <div className="kpis">
          {kpis.map((k) => (
            <div className="kpi" key={k.label}>
              <span className="kpi-label">{k.label}</span>
              <span className="kpi-value">{k.value}</span>
            </div>
          ))}
        </div>

        {!data.length ? (
          <div className="state">{t.noMatch}</div>
        ) : (
          <main className="cards">
            <Card title={t.cMonthly} subtitle={t.cMonthlySub} wide>
              <ColumnChart
                data={monthly}
                xKey="name"
                stacked
                series={[
                  { key: "Low", label: label("Low"), color: "var(--ord-1)" },
                  { key: "Medium", label: label("Medium"), color: "var(--ord-2)" },
                  { key: "High", label: label("High"), color: "var(--ord-3)" },
                ]}
              />
            </Card>

            <Card title={t.cHourly} subtitle={t.cHourlySub}>
              <TrendChart data={hourly} xKey="hour" unit="%" series={[{ key: "high", label: t.highDensity, color: "var(--series-1)" }]} />
            </Card>

            <Card title={t.cWaits} subtitle={t.cWaitsSub}>
              <ColumnChart
                data={waitsByActivity}
                xKey="activity"
                series={[
                  { key: "queue", label: t.sQueue, color: "var(--series-1)" },
                  { key: "transport", label: t.sTransport, color: "var(--series-2)" },
                  { key: "security", label: t.sSecurity, color: "var(--series-3)" },
                ]}
              />
            </Card>

            <Card title={t.cMap} subtitle={t.cMapSub}>
              <LocationGrid data={data} />
            </Card>

            <Card title={t.cHealth} subtitle={t.cHealthSub}>
              <RowChart data={health} color="var(--series-1)" />
            </Card>

            <Card title={t.cIncidents} subtitle={t.cIncidentsSub}>
              <RowChart data={incidents} color="var(--series-1)" />
            </Card>

            <Card title={t.cRatings} subtitle={t.cRatingsSub}>
              <ColumnChart
                data={ratingsByNationality}
                xKey="nationality"
                yMax={5}
                series={[
                  { key: "satisfaction", label: t.sSatisfaction, color: "var(--series-1)" },
                  { key: "safety", label: t.sSafety, color: "var(--series-2)" },
                ]}
              />
            </Card>

            <section className="card wide">
              <header className="table-head">
                <h2>{t.sample}</h2>
                <button className="reset" onClick={() => setShowTable(!showTable)}>
                  {showTable ? t.hideTable : t.showTable}
                </button>
              </header>
              {showTable && <DataTable rows={data.slice(0, 50)} />}
            </section>
          </main>
        )}

        <footer className="note">{t.note}</footer>
      </div>
    </LangContext.Provider>
  );
}

function DataTable({ rows }: { rows: Observation[] }) {
  const { lang, t, label } = useLang();
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t.tTime}</th>
            <th>{t.tActivity}</th>
            <th>{t.tDensity}</th>
            <th>{t.tSpeed}</th>
            <th>{t.tDistance}</th>
            <th>{t.tQueue}</th>
            <th>{t.tHealth}</th>
            <th>{t.tNationality}</th>
            <th>{t.tTransport}</th>
            <th>{t.tEmergency}</th>
            <th>{t.tSafety}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.timestamp.toLocaleString(dateLocale(lang), { dateStyle: "short", timeStyle: "short" })}</td>
              <td>{label(r.activity)}</td>
              <td>{label(r.crowdDensity)}</td>
              <td>{fmt(r.movementSpeed, 2)}</td>
              <td>{fmt(r.distanceM, 2)}</td>
              <td>{r.queueMin}</td>
              <td>{label(r.health)}</td>
              <td>{label(r.nationality)}</td>
              <td>{label(r.transport)}</td>
              <td>{r.emergency ? t.yes : t.no}</td>
              <td>{r.safety}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
