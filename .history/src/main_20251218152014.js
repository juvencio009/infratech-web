document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // 1️⃣ Signup
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // 🔴 GARANTIR sessão ativa
  const {
    data: { session }
  } = await supabaseClient.auth.getSession();

  if (!session) {
    alert("Sessão não iniciada. Tente novamente.");
    return;
  }

  // 2️⃣ Insert com auth.uid válido
  const { error: insertError } = await supabaseClient
    .from("studio001")
    .insert({
      id: session.user.id,
      name: name,
      email: email
    });

  if (insertError) {
    console.error(insertError);
    alert(insertError.message);
    return;
  }

  alert("Usuário criado com sucesso!");
});
