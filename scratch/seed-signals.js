const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const orgId = process.env.NEXT_PUBLIC_APEX_ORGANIZATION_ID || "00000000-0000-4000-8000-000000000001";

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const signals = [
  { signal_key: "prestige_index", signal_value: 96.8, confidence: 94.2, anomaly_score: 12.4, trend: "up" },
  { signal_key: "market_velocity", signal_value: 2.9, confidence: 88.5, anomaly_score: 34.1, trend: "up" },
  { signal_key: "revenue_projection", signal_value: 189.5, confidence: 91.8, anomaly_score: 15.2, trend: "stable" },
  { signal_key: "influence_yield", signal_value: 3.8, confidence: 82.4, anomaly_score: 45.7, trend: "up" },
  { signal_key: "lead_purity", signal_value: 91.2, confidence: 89.1, anomaly_score: 22.8, trend: "up" },
  { signal_key: "founder_gravity", signal_value: 94.5, confidence: 95.3, anomaly_score: 8.4, trend: "up" },
];

async function seed() {
  console.log(`Seeding signals for org: ${orgId}...`);
  
  for (const s of signals) {
    const { error } = await supabase
      .from('signal_snapshots')
      .insert({
        organization_id: orgId,
        signal_key: s.signal_key,
        signal_value: s.signal_value,
        confidence: s.confidence,
        anomaly_score: s.anomaly_score,
        trend: s.trend,
        captured_at: new Date().toISOString()
      });
      
    if (error) {
      console.error(`Error seeding ${s.signal_key}:`, error.message);
    } else {
      console.log(`Successfully seeded ${s.signal_key}`);
    }
  }
  
  console.log("Seeding complete.");
}

seed();
