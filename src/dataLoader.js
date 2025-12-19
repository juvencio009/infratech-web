async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  if(!res.ok) throw new Error("Erro ao carregar dados")
  return await res.json();
}
