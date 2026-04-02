import { createClient } from "@supabase/supabase-js";

const supabaseHQUrl = import.meta.env.VITE_SUPABASE_HQ_URL;
const supabaseHQKey = import.meta.env.VITE_SUPABASE_HQ_KEY;

if (!supabaseHQUrl || !supabaseHQKey) {
  throw new Error(
    "Missing Supabase HQ env vars. Set VITE_SUPABASE_HQ_URL and VITE_SUPABASE_HQ_KEY in .env"
  );
}

export const supabaseHQ = createClient(supabaseHQUrl, supabaseHQKey);
