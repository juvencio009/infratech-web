import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://tvaaszufwpibbyobejbx.supabase.co";
const supabaseKey = "sb_publishable_1zcOl7CAGzDIe0Mepbxqvw_iJuZTc8L";

const supabase = createClient(supabaseUrl, supabaseKey);

// ⚠️ TESTE MANUAL
const email = "teste123@gmail.com";
const password = "12345678";
const name = "Teste User";

async function testar() {
  console.log("🚀 INÍCIO DO TESTE");

  // 1️⃣ SIGN UP
  const { data: signUpData, error: signUpError } =
    await supabase.auth.signUp({
      email,
      password,
    });

  console.log("🔐 SIGNUP DATA:", signUpData);
  console.log("🔐 SIGNUP ERROR:", signUpError);

  if (signUpError) return;

  console.log("🆔 USER ID:", signUpData.user?.id);
  console.log("📦 SESSION:", signUpData.session);

  // 2️⃣ VER SE EXISTE USUÁRIO LOGADO
  const { data: sessionData } = await supabase.auth.getSession();
  console.log("📡 GET SESSION:", sessionData);

  // 3️⃣ INSERT NA TABELA
  const { error: insertError } = await supabase
    .from("studio001")
    .insert([
      {
        id: signUpData.user.id,
        name,
        email,
        user_role: "student",
      },
    ]);

  console.log("🧩 INSERT ERROR:", insertError);

  if (!insertError) {
    console.log("✅ INSERT FEITO COM SUCESSO");
  }
}

testar();
