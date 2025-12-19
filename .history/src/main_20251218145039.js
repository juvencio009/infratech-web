const form = document.getElementById("registerForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  // 1️⃣ Criar usuário no AUTH
  const { data, error } = await supabaseClient.auth.signUp({
    email,
    password
  });

  if (error) {
    alert(error.message);
    return;
  }

  // 2️⃣ Inserir dados na sua tabela studio001
  const { error: insertError } = await supabaseClient
    .from("studio001")
    .insert({
      id: data.user.id,
      name: name,
      email: email
    });

  if (insertError) {
    alert(insertError.message);
    return;
  }

  alert("Conta criada com sucesso!");
});
