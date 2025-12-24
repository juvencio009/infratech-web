async function CarregarQuestoes(route) {
  try {
    const res = await fetch(route);
    if (!res.ok) throw new Error("Erro ao carregar os dados");
    
    return await res.json();
  } catch (err) {
    console.error("Erro Detectado:", err);
    throw err;
  }
}


