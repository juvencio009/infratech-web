import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://supabase.com/dashboard/project/tvaaszufwpibbyobejbx",
  "SUA_PUBLIC_ANON_KEY"
);
