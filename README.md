# Hajj Crowd Management Dashboard

لوحة تفاعلية باللغة العربية لاستكشاف بيانات إدارة حشود الحج والعمرة.

An Arabic (RTL) dashboard for the Kaggle dataset
[Hajj and Umrah Crowd Management Dataset](https://www.kaggle.com/datasets/ziya07/hajj-and-umrah-crowd-management-dataset)
(10,000 readings, 30 columns, Makkah area, 2024).

## What it shows

- KPIs: readings, share of high crowd density, average queue and transport wait, share of emergency events, perceived safety.
- Monthly readings by crowd density, and share of high density by hour of day.
- Average queue, transport and security-checkpoint waits by activity (Tawaf, Sa'i, prayer, ...).
- A 10×10 location grid of reading counts or high-density share.
- Health conditions, incident types during emergencies, and satisfaction / safety ratings by nationality.
- Filters for activity, crowd density, transport mode, nationality and weather, plus a raw-data preview.

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build in dist/
```

## Deploy on Vercel

Import this repository in Vercel. It detects Vite from `vercel.json`
(build command `npm run build`, output directory `dist`), so no settings need changing.

## Data

The CSV is served from `public/data/hajj_umrah_crowd_management_dataset.csv` and parsed in the browser.
To use a newer export, replace that file with one that has the same column names.

Note: the dataset looks synthetic. Every category is close to evenly split and no two numeric
columns correlate (largest |r| ≈ 0.03), so small differences between groups are noise rather than real patterns.
