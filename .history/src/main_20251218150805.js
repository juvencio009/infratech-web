document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // 1️⃣ Criar usuário no Auth
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // 2️⃣ Inserir perfil (ID = auth.uid)
  const { error: insertError } = await supabaseClient
    .from("studio001")
    .insert({
      id: data.user.id,
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
