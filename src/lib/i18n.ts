import { createContext, useContext } from "react";

export type Lang = "ar" | "en";

const STRINGS = {
  title: { ar: "لوحة إدارة حشود الحج والعمرة", en: "Hajj & Umrah Crowd Management Dashboard" },
  subtitle: {
    ar: (n: string) => `${n} قراءة من مكة المكرمة خلال عام 2024 — كثافة الحشود، أوقات الانتظار، الحالات الصحية والحوادث`,
    en: (n: string) => `${n} readings from Makkah during 2024: crowd density, waiting times, health conditions and incidents`,
  },
  loading: { ar: "جارٍ تحميل البيانات…", en: "Loading data…" },
  loadError: { ar: (s: string) => `تعذر تحميل البيانات (${s})`, en: (s: string) => `Could not load the data (${s})` },
  noMatch: { ar: "لا توجد قراءات تطابق هذه المرشحات", en: "No readings match these filters" },
  all: { ar: "الكل", en: "All" },
  reset: { ar: "إعادة الضبط", en: "Reset" },
  switchLang: { ar: "English", en: "العربية" },

  fActivity: { ar: "النشاط", en: "Activity" },
  fDensity: { ar: "كثافة الحشد", en: "Crowd density" },
  fTransport: { ar: "وسيلة النقل", en: "Transport" },
  fNationality: { ar: "الجنسية", en: "Nationality" },
  fWeather: { ar: "الطقس", en: "Weather" },

  kReadings: { ar: "عدد القراءات", en: "Readings" },
  kHigh: { ar: "نسبة الكثافة العالية", en: "High-density share" },
  kQueue: { ar: "متوسط وقت الطابور", en: "Avg queue time" },
  kTransport: { ar: "متوسط انتظار النقل", en: "Avg transport wait" },
  kEmergency: { ar: "نسبة حالات الطوارئ", en: "Emergency share" },
  kSafety: { ar: "متوسط الشعور بالأمان", en: "Avg perceived safety" },
  minutes: { ar: (v: string) => `${v} د`, en: (v: string) => `${v} min` },
  outOf5: { ar: (v: string) => `${v} من 5`, en: (v: string) => `${v} / 5` },

  cMonthly: { ar: "القراءات الشهرية حسب كثافة الحشد", en: "Monthly readings by crowd density" },
  cMonthlySub: { ar: "عدد القراءات في كل شهر، مقسمة حسب مستوى الكثافة", en: "Readings per month, split by density level" },
  cHourly: { ar: "نسبة الكثافة العالية حسب الساعة", en: "High-density share by hour" },
  cHourlySub: { ar: "النسبة المئوية للقراءات ذات الكثافة العالية في كل ساعة من اليوم", en: "Percentage of readings with high density in each hour of the day" },
  highDensity: { ar: "كثافة عالية", en: "High density" },
  cWaits: { ar: "متوسط أوقات الانتظار حسب النشاط", en: "Average waiting times by activity" },
  cWaitsSub: { ar: "بالدقائق", en: "In minutes" },
  sQueue: { ar: "الطابور", en: "Queue" },
  sTransport: { ar: "انتظار النقل", en: "Transport wait" },
  sSecurity: { ar: "نقطة التفتيش", en: "Security checkpoint" },
  cMap: { ar: "توزيع القراءات جغرافياً", en: "Readings by location" },
  cMapSub: { ar: "شبكة 10×10 فوق نطاق الإحداثيات المسجلة", en: "10×10 grid over the recorded coordinate range" },
  cHealth: { ar: "الحالات الصحية", en: "Health conditions" },
  cHealthSub: { ar: "عدد القراءات لكل حالة صحية", en: "Readings per health condition" },
  cIncidents: { ar: "أنواع الحوادث في حالات الطوارئ", en: "Incident types during emergencies" },
  cIncidentsSub: { ar: "القراءات التي سُجل فيها حدث طارئ فقط", en: "Only readings with an emergency event" },
  cRatings: { ar: "الرضا والشعور بالأمان حسب الجنسية", en: "Satisfaction and perceived safety by nationality" },
  cRatingsSub: { ar: "متوسط التقييم من 1 إلى 5", en: "Average rating from 1 to 5" },
  sSatisfaction: { ar: "الرضا", en: "Satisfaction" },
  sSafety: { ar: "الشعور بالأمان", en: "Perceived safety" },
  count: { ar: "العدد", en: "Count" },

  mapMetric: { ar: "مؤشر الخريطة", en: "Map metric" },
  mapCount: { ar: "عدد القراءات", en: "Readings" },
  mapHigh: { ar: "نسبة الكثافة العالية", en: "High-density share" },
  north: { ar: "شمال", en: "N" },
  east: { ar: "شرق", en: "E" },
  mapHint: { ar: "مرّر المؤشر على خلية لعرض تفاصيلها", en: "Hover a cell to see its details" },
  mapCellTitle: {
    ar: (n: string, p: string) => `${n} قراءة · ${p} كثافة عالية`,
    en: (n: string, p: string) => `${n} readings · ${p} high density`,
  },
  mapReadout: {
    ar: (lat: string, long: string, n: string, p: string) => `خط العرض ${lat} · خط الطول ${long} — ${n} قراءة، ${p} منها بكثافة عالية`,
    en: (lat: string, long: string, n: string, p: string) => `Lat ${lat} · Long ${long}: ${n} readings, ${p} with high density`,
  },

  sample: { ar: "عينة من البيانات", en: "Data sample" },
  showTable: { ar: "عرض أول 50 قراءة", en: "Show first 50 readings" },
  hideTable: { ar: "إخفاء الجدول", en: "Hide table" },
  tTime: { ar: "الوقت", en: "Time" },
  tActivity: { ar: "النشاط", en: "Activity" },
  tDensity: { ar: "الكثافة", en: "Density" },
  tSpeed: { ar: "السرعة (م/ث)", en: "Speed (m/s)" },
  tDistance: { ar: "المسافة (م)", en: "Distance (m)" },
  tQueue: { ar: "الطابور (د)", en: "Queue (min)" },
  tHealth: { ar: "الحالة الصحية", en: "Health" },
  tNationality: { ar: "الجنسية", en: "Nationality" },
  tTransport: { ar: "النقل", en: "Transport" },
  tEmergency: { ar: "طارئ", en: "Emergency" },
  tSafety: { ar: "الأمان", en: "Safety" },
  yes: { ar: "نعم", en: "Yes" },
  no: { ar: "لا", en: "No" },

  note: {
    ar: "المصدر: مجموعة بيانات Kaggle «Hajj and Umrah Crowd Management Dataset». تبدو البيانات اصطناعية، إذ تتوزع القيم بالتساوي تقريباً ولا ترتبط الأعمدة ببعضها، لذا فالفروق الصغيرة بين الفئات ليست دلالات حقيقية.",
    en: "Source: Kaggle “Hajj and Umrah Crowd Management Dataset”. The data looks synthetic: values are spread almost evenly and the columns do not correlate, so small differences between groups are not real signals.",
  },
} as const;

export type Strings = { [K in keyof typeof STRINGS]: (typeof STRINGS)[K]["ar"] };

export function strings(lang: Lang): Strings {
  const out = {} as { [k: string]: unknown };
  for (const [k, v] of Object.entries(STRINGS)) out[k] = v[lang];
  return out as Strings;
}

// Arabic labels for the dataset's English category values; English shows the raw value.
const VALUES_AR: { [value: string]: string } = {
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

export const valueLabel = (v: string, lang: Lang) => (lang === "ar" ? (VALUES_AR[v] ?? v) : v);

const MONTHS = {
  ar: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
};

export const months = (lang: Lang) => MONTHS[lang];

export const dateLocale = (lang: Lang) => (lang === "ar" ? "ar-SA-u-nu-latn-ca-gregory" : "en-GB");

const STORAGE_KEY = "lang";

export function initialLang(): Lang {
  const fromUrl = new URLSearchParams(window.location.search).get("lang");
  if (fromUrl === "ar" || fromUrl === "en") return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "ar" || saved === "en") return saved;
  } catch {
    // Storage can be unavailable (private mode); fall back to Arabic.
  }
  return "ar";
}

export function applyLang(lang: Lang) {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.title = STRINGS.title[lang];
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    // Not persisting the choice is fine.
  }
}

export const LangContext = createContext<Lang>("ar");

export function useLang() {
  const lang = useContext(LangContext);
  return { lang, t: strings(lang), rtl: lang === "ar", label: (v: string) => valueLabel(v, lang) };
}
