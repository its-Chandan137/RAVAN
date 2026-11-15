import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const connectionString = process.env.DATABASE_URL || process.env.SUPABASE_DB_URL;
if (!connectionString) {
  console.error("Missing DATABASE_URL (or SUPABASE_DB_URL). Get it from Supabase → Settings → Database → Connection string (URI).");
  process.exit(1);
}

const migrationPath = resolve(root, "supabase/migrations/0001_init.sql");
const migrationSql = readFileSync(migrationPath, "utf8");

const client = new pg.Client({ connectionString, ssl: { rejectUnauthorized: false } });

try {
  await client.connect();
  console.log("Connected to database.");
  await client.query(migrationSql);
  console.log("Migration applied.");

  // seed default activities if empty
  const { rows } = await client.query("select count(*)::int as c from public.activities");
  if (rows[0].c === 0) {
    const defaults = [
      ["m1","Wake up, freshen up","Personal Growth","Morning","6:00–6:30",1,true,0],
      ["m2","Park: walk/jog/run","Health","Morning","6:30–7:30",1,true,1],
      ["m3","Return, cool down","Health","Morning","7:30–8:00",1,true,2],
      ["m4","Shower","Personal Growth","Morning","8:00–8:30",1,true,3],
      ["m5","Breakfast","Health","Morning","8:30–9:00",1,true,4],
      ["m6","Get ready","Personal Growth","Morning","9:00–9:30",1,true,5],
      ["m7","Travel to office","Office Work","Morning","9:30–10:00",1,true,6],
      ["m8","Buffer / settle in","Office Work","Morning","10:00–10:30",1,true,7],
      ["o1","Office work / study when available","Office Work","Office","10:30–1:30",1,true,0],
      ["o2","Lunch","Health","Office","1:30–2:30",1,true,1],
      ["o3","Office work + flexible study","Office Work","Office","2:30–7:30",1,true,2],
      ["e1","Hostel, freshen up, relax","Rest","Evening","8:00–8:20",1,true,0],
      ["e2","Dinner","Health","Evening","8:20–8:50",1,true,1],
      ["e3","Job applications + HR outreach","Career","Evening","8:50–9:35",1,true,2],
      ["e4","DSA / frontend practice","Study","Evening","9:35–10:20",1,true,3],
      ["e5","Prepare for gaming","Leisure","Evening","10:20–10:30",1,true,4],
      ["e6","Honour of Kings with friends ❤️","Leisure","Evening","10:30–12:00",1,true,5],
      ["e7","Wind down","Rest","Evening","12:00–12:20",1,true,6],
      ["e8","Sleep target","Rest","Evening","12:20",1,true,7],
    ];
    for (const [, name, category, group, time, points, active, order] of defaults) {
      await client.query(
        `insert into public.activities (name, category, group_name, time_label, points, is_active, sort_order, schedule_days)
         values ($1,$2,$3,$4,$5,$6,$7,'{0,1,2,3,4,5,6}')`,
        [name, category, group, time, points, active, order]
      );
    }
    console.log("Seeded default activities.");
  } else {
    console.log(`Activities already present (${rows[0].c}), skipping seed.`);
  }
  console.log("Done.");
} catch (err) {
  console.error("Seed failed:", err.message);
  process.exit(1);
} finally {
  await client.end();
}
