// components/ServerUserFetcher.js
import { createBrowserClient } from "@supabase/ssr";

// Function to create a Supabase client
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

// Server Component
export default async function ServerRowsFetcher({ selectedid }) {
  console.log(selectedid);
  const supabase = await createClient();

  const { data, error } = supabase
    .from("production_activities")
    .select("*")
    .eq("linked_eqp", selectedid);

  console.log(data);

  return (
    <div>
      <h1>Details for ID: {selectedid}</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
