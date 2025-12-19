async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  if(!res.ok) throw new Error("Erro ao carregar ")
  return await res.json();
}
