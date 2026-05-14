const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase
    .from('organizations') // Try a simpler table
    .select('id, name')
    .limit(1);
    
  if (error) {
    console.error("Error checking organizations:", error.message);
  } else {
    console.log("Organizations table exists. Sample:", data);
  }
  
  const { data: tables, error: tableError } = await supabase
    .rpc('get_tables'); // This might not work if RPC isn't defined
    
  if (tableError) {
    console.log("Could not run get_tables RPC, trying raw query...");
    // Try to query postgres tables if permissions allow
    const { data: pgTables, error: pgError } = await supabase
      .from('pg_catalog.pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (pgError) {
      console.error("Error querying pg_tables:", pgError.message);
    } else {
      console.log("Available tables in public schema:", pgTables.map(t => t.tablename));
    }
  } else {
    console.log("Tables:", tables);
  }
}

check();
