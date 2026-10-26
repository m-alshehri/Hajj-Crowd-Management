import Papa from "papaparse";

export const DATA_URL = "/data/hajj_umrah_crowd_management_dataset.csv";

export type Level = "Low" | "Medium" | "High";

export interface Observation {
  timestamp: Date;
  month: number;
  hour: number;
  lat: number;
  long: number;
  crowdDensity: Level;
  movementSpeed: number;
  activity: string;
  weather: string;
  temperature: number;
  soundDb: number;
  arInteraction: string;
  fatigue: Level;
  stress: Level;
  queueMin: number;
  health: string;
  ageGroup: string;
  nationality: string;
  transport: string;
  transportWaitMin: number;
  securityWaitMin: number;
  emergency: boolean;
  incident: string;
  morale: string;
  experience: string;
  interactionFreq: number;
  distanceM: number;
  eventType: string;
  timeAtLocationMin: number;
  arNavSuccess: boolean;
  satisfaction: number;
  safety: number;
}

type Raw = { [column: string]: string };

const num = (v: string) => Number(v);

function toRecord(r: Raw): Observation | null {
  const timestamp = new Date(r.Timestamp?.replace(" ", "T"));
  if (Number.isNaN(timestamp.getTime())) return null;
  return {
    timestamp,
    month: timestamp.getMonth(),
    hour: timestamp.getHours(),
    lat: num(r.Location_Lat),
    long: num(r.Location_Long),
    crowdDensity: r.Crowd_Density as Level,
    movementSpeed: num(r.Movement_Speed),
    activity: r.Activity_Type,
    weather: r.Weather_Conditions,
    temperature: num(r.Temperature),
    soundDb: num(r.Sound_Level_dB),
    arInteraction: r.AR_System_Interaction,
    fatigue: r.Fatigue_Level as Level,
    stress: r.Stress_Level as Level,
    queueMin: num(r.Queue_Time_minutes),
    health: r.Health_Condition,
    ageGroup: r.Age_Group,
    nationality: r.Nationality,
    transport: r.Transport_Mode,
    transportWaitMin: num(r.Waiting_Time_for_Transport),
    securityWaitMin: num(r.Security_Checkpoint_Wait_Time),
    emergency: r.Emergency_Event === "Yes",
    incident: r.Incident_Type,
    morale: r.Crowd_Morale,
    experience: r.Pilgrim_Experience,
    interactionFreq: num(r.Interaction_Frequency),
    distanceM: num(r.Distance_Between_People_m),
    eventType: r.Event_Type,
    timeAtLocationMin: num(r.Time_Spent_at_Location_minutes),
    arNavSuccess: r.AR_Navigation_Success === "Yes",
    satisfaction: num(r.Satisfaction_Rating),
    safety: num(r.Perceived_Safety_Rating),
  };
}

export async function loadRecords(url = DATA_URL): Promise<Observation[]> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`تعذر تحميل البيانات (${res.status})`);
  const text = await res.text();
  const parsed = Papa.parse<Raw>(text, { header: true, skipEmptyLines: true });
  return parsed.data.map(toRecord).filter((r): r is Observation => r !== null);
}

// Arabic display labels for the dataset's English category values.
export const AR: { [value: string]: string } = {
  Low: "منخفضة",
  Medium: "متوسطة",
  High: "عالية",
  Walking: "مشي",
  Resting: "استراحة",
  "Sa’i": "السعي",
  Tawaf: "الطواف",
  Prayer: "الصلاة",
  Clear: "صافٍ",
  Cloudy: "غائم",
  Rainy: "ممطر",
  Heatstroke: "ضربة شمس",
  Injured: "إصابة",
  Normal: "طبيعي",
  Dehydration: "جفاف",
  Fainting: "إغماء",
  Other: "أخرى",
  Pakistani: "باكستاني",
  Saudi: "سعودي",
  Egyptian: "مصري",
  Indonesian: "إندونيسي",
  Indian: "هندي",
  Car: "سيارة",
  Train: "قطار",
  Bus: "حافلة",
  Theft: "سرقة",
  "Security Breach": "خرق أمني",
  "Unruly Behavior": "سلوك غير منضبط",
  "Lost Item": "مفقودات",
  "Medical Emergency": "حالة طبية طارئة",
  Positive: "إيجابية",
  Neutral: "محايدة",
  Negative: "سلبية",
  Experienced: "سبق له الحج",
  "First-Time": "أول مرة",
  "Religious Activity": "نشاط ديني",
  "Transport Delay": "تأخر النقل",
  "Crowd Congestion": "ازدحام",
  Started: "بدأ",
  "In Progress": "قيد التنفيذ",
  Completed: "اكتمل",
};

export const ar = (v: string) => AR[v] ?? v;

export const MONTHS_AR = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];

export const LEVELS: Level[] = ["Low", "Medium", "High"];

export const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : NaN);

export const share = <T,>(xs: T[], pred: (x: T) => boolean) => (xs.length ? xs.filter(pred).length / xs.length : NaN);

export function countBy<T>(xs: T[], key: (x: T) => string): Map<string, number> {
  const m = new Map<string, number>();
  for (const x of xs) m.set(key(x), (m.get(key(x)) ?? 0) + 1);
  return m;
}

export function groupBy<T>(xs: T[], key: (x: T) => string | number): Map<string | number, T[]> {
  const m = new Map<string | number, T[]>();
  for (const x of xs) {
    const k = key(x);
    const list = m.get(k);
    if (list) list.push(x);
    else m.set(k, [x]);
  }
  return m;
}

export const fmt = (n: number, digits = 1) =>
  Number.isNaN(n) ? "—" : n.toLocaleString("ar-SA-u-nu-latn", { maximumFractionDigits: digits, minimumFractionDigits: 0 });

export const pct = (n: number) => (Number.isNaN(n) ? "—" : `${fmt(n * 100, 1)}%`);
