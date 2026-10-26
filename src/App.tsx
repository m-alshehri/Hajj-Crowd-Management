import { useEffect, useMemo, useState } from "react";
import { Card, ColumnChart, RowChart, TrendChart } from "./components/Charts";
import { LocationGrid } from "./components/LocationGrid";
import {
  LEVELS,
  MONTHS_AR,
  ar,
  avg,
  countBy,
  fmt,
  groupBy,
  loadRecords,
  pct,
  share,
  type Observation,
} from "./lib/data";

type FilterKey = "activity" | "crowdDensity" | "transport" | "nationality" | "weather";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "activity", label: "النشاط" },
  { key: "crowdDensity", label: "كثافة الحشد" },
  { key: "transport", label: "وسيلة النقل" },
  { key: "nationality", label: "الجنسية" },
  { key: "weather", label: "الطقس" },
];

const ALL = "__all";

export default function App() {
  const [records, setRecords] = useState<Observation[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ [K in FilterKey]: string }>({
    activity: ALL,
    crowdDensity: ALL,
    transport: ALL,
    nationality: ALL,
    weather: ALL,
  });
  const [showTable, setShowTable] = useState(false);

  useEffect(() => {
    loadRecords().then(setRecords).catch((e: Error) => setError(e.message));
  }, []);

  const options = useMemo(() => {
    const o = {} as { [K in FilterKey]: string[] };
    for (const f of FILTERS) {
      const values = [...new Set(records.map((r) => String(r[f.key])))];
      o[f.key] = f.key === "crowdDensity" ? LEVELS.filter((l) => values.includes(l)) : values.sort((a, b) => ar(a).localeCompare(ar(b), "ar"));
    }
    return o;
  }, [records]);

  const data = useMemo(
    () => records.filter((r) => FILTERS.every((f) => filters[f.key] === ALL || String(r[f.key]) === filters[f.key])),
    [records, filters],
  );

  const kpis = useMemo(
    () => [
      { label: "عدد القراءات", value: fmt(data.length, 0) },
      { label: "نسبة الكثافة العالية", value: pct(share(data, (r) => r.crowdDensity === "High")) },
      { label: "متوسط وقت الطابور", value: `${fmt(avg(data.map((r) => r.queueMin)))} د` },
      { label: "متوسط انتظار النقل", value: `${fmt(avg(data.map((r) => r.transportWaitMin)))} د` },
      { label: "نسبة حالات الطوارئ", value: pct(share(data, (r) => r.emergency)) },
      { label: "متوسط الشعور بالأمان", value: `${fmt(avg(data.map((r) => r.safety)), 2)} من 5` },
    ],
    [data],
  );

  const monthly = useMemo(() => {
    const byMonth = groupBy(data, (r) => r.month);
    return MONTHS_AR.map((name, m) => {
      const rows = byMonth.get(m) ?? [];
      const counts = countBy(rows, (r) => r.crowdDensity);
      return { name, Low: counts.get("Low") ?? 0, Medium: counts.get("Medium") ?? 0, High: counts.get("High") ?? 0 };
    });
  }, [data]);

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
        activity: ar(String(activity)),
        queue: Number(avg(rows.map((r) => r.queueMin)).toFixed(1)),
        transport: Number(avg(rows.map((r) => r.transportWaitMin)).toFixed(1)),
        security: Number(avg(rows.map((r) => r.securityWaitMin)).toFixed(1)),
      })),
    [data],
  );

  const health = useMemo(
    () =>
      [...countBy(data, (r) => r.health).entries()]
        .map(([k, v]) => ({ label: ar(k), value: v }))
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const incidents = useMemo(
    () =>
      [...countBy(data.filter((r) => r.emergency), (r) => r.incident).entries()]
        .map(([k, v]) => ({ label: ar(k), value: v }))
        .sort((a, b) => b.value - a.value),
    [data],
  );

  const ratingsByNationality = useMemo(
    () =>
      [...groupBy(data, (r) => r.nationality).entries()].map(([n, rows]) => ({
        nationality: ar(String(n)),
        satisfaction: Number(avg(rows.map((r) => r.satisfaction)).toFixed(2)),
        safety: Number(avg(rows.map((r) => r.safety)).toFixed(2)),
      })),
    [data],
  );

  const activeFilters = FILTERS.filter((f) => filters[f.key] !== ALL).length;

  if (error) return <div className="state">{error}</div>;
  if (!records.length) return <div className="state">جارٍ تحميل البيانات…</div>;

  return (
    <div className="page">
      <header className="top">
        <div>
          <h1>لوحة إدارة حشود الحج والعمرة</h1>
          <p className="subtitle">
            {fmt(records.length, 0)} قراءة من مكة المكرمة خلال عام 2024 — كثافة الحشود، أوقات الانتظار، الحالات الصحية والحوادث
          </p>
        </div>
      </header>

      <div className="filters" role="search">
        {FILTERS.map((f) => (
          <label key={f.key}>
            <span>{f.label}</span>
            <select value={filters[f.key]} onChange={(e) => setFilters({ ...filters, [f.key]: e.target.value })}>
              <option value={ALL}>الكل</option>
              {options[f.key].map((v) => (
                <option key={v} value={v}>
                  {ar(v)}
                </option>
              ))}
            </select>
          </label>
        ))}
        <button
          className="reset"
          disabled={!activeFilters}
          onClick={() => setFilters({ activity: ALL, crowdDensity: ALL, transport: ALL, nationality: ALL, weather: ALL })}
        >
          إعادة الضبط
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
        <div className="state">لا توجد قراءات تطابق هذه المرشحات</div>
      ) : (
        <main className="cards">
          <Card title="القراءات الشهرية حسب كثافة الحشد" subtitle="عدد القراءات في كل شهر، مقسمة حسب مستوى الكثافة" wide>
            <ColumnChart
              data={monthly}
              xKey="name"
              stacked
              series={[
                { key: "Low", label: ar("Low"), color: "var(--ord-1)" },
                { key: "Medium", label: ar("Medium"), color: "var(--ord-2)" },
                { key: "High", label: ar("High"), color: "var(--ord-3)" },
              ]}
            />
          </Card>

          <Card title="نسبة الكثافة العالية حسب الساعة" subtitle="النسبة المئوية للقراءات ذات الكثافة العالية في كل ساعة من اليوم">
            <TrendChart data={hourly} xKey="hour" unit="%" series={[{ key: "high", label: "كثافة عالية", color: "var(--series-1)" }]} />
          </Card>

          <Card title="متوسط أوقات الانتظار حسب النشاط" subtitle="بالدقائق">
            <ColumnChart
              data={waitsByActivity}
              xKey="activity"
              series={[
                { key: "queue", label: "الطابور", color: "var(--series-1)" },
                { key: "transport", label: "انتظار النقل", color: "var(--series-2)" },
                { key: "security", label: "نقطة التفتيش", color: "var(--series-3)" },
              ]}
            />
          </Card>

          <Card title="توزيع القراءات جغرافياً" subtitle="شبكة 10×10 فوق نطاق الإحداثيات المسجلة">
            <LocationGrid data={data} />
          </Card>

          <Card title="الحالات الصحية" subtitle="عدد القراءات لكل حالة صحية">
            <RowChart data={health} color="var(--series-1)" />
          </Card>

          <Card title="أنواع الحوادث في حالات الطوارئ" subtitle="القراءات التي سُجل فيها حدث طارئ فقط">
            <RowChart data={incidents} color="var(--series-1)" />
          </Card>

          <Card title="الرضا والشعور بالأمان حسب الجنسية" subtitle="متوسط التقييم من 1 إلى 5">
            <ColumnChart
              data={ratingsByNationality}
              xKey="nationality"
              yMax={5}
              series={[
                { key: "satisfaction", label: "الرضا", color: "var(--series-1)" },
                { key: "safety", label: "الشعور بالأمان", color: "var(--series-2)" },
              ]}
            />
          </Card>

          <section className="card wide">
            <header className="table-head">
              <h2>عينة من البيانات</h2>
              <button className="reset" onClick={() => setShowTable(!showTable)}>
                {showTable ? "إخفاء الجدول" : "عرض أول 50 قراءة"}
              </button>
            </header>
            {showTable && <DataTable rows={data.slice(0, 50)} />}
          </section>
        </main>
      )}

      <footer className="note">
        المصدر: مجموعة بيانات Kaggle «Hajj and Umrah Crowd Management Dataset». تبدو البيانات اصطناعية، إذ تتوزع القيم بالتساوي تقريباً
        ولا ترتبط الأعمدة ببعضها، لذا فالفروق الصغيرة بين الفئات ليست دلالات حقيقية.
      </footer>
    </div>
  );
}

function DataTable({ rows }: { rows: Observation[] }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>الوقت</th>
            <th>النشاط</th>
            <th>الكثافة</th>
            <th>السرعة (م/ث)</th>
            <th>المسافة (م)</th>
            <th>الطابور (د)</th>
            <th>الحالة الصحية</th>
            <th>الجنسية</th>
            <th>النقل</th>
            <th>طارئ</th>
            <th>الأمان</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i}>
              <td>{r.timestamp.toLocaleString("ar-SA-u-nu-latn-ca-gregory", { dateStyle: "short", timeStyle: "short" })}</td>
              <td>{ar(r.activity)}</td>
              <td>{ar(r.crowdDensity)}</td>
              <td>{fmt(r.movementSpeed, 2)}</td>
              <td>{fmt(r.distanceM, 2)}</td>
              <td>{r.queueMin}</td>
              <td>{ar(r.health)}</td>
              <td>{ar(r.nationality)}</td>
              <td>{ar(r.transport)}</td>
              <td>{r.emergency ? "نعم" : "لا"}</td>
              <td>{r.safety}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
