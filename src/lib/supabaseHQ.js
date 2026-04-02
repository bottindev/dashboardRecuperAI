import { createClient } from "@supabase/supabase-js";
import { supabase } from "./supabaseClient";

const supabaseHQUrl = import.meta.env.VITE_SUPABASE_HQ_URL;
const supabaseHQKey = import.meta.env.VITE_SUPABASE_HQ_KEY;

// Fallback to Domains client if HQ env vars not set (graceful degradation)
export const supabaseHQ =
  supabaseHQUrl && supabaseHQKey
    ? createClient(supabaseHQUrl, supabaseHQKey)
    : supabase;
