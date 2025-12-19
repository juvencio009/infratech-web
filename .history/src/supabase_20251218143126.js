import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  "https://SEU_PROJETO.supabase.co",
  "SUA_PUBLIC_ANON_KEY"
);
