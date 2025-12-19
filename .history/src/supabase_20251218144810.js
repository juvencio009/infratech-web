const SUPABASE_URL = "https://tvaaszufwpibbyobejbx.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_1zcOl7CAGzDIe0Mepbxqvw_iJuZTc8L";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);
