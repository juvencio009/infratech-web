async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  
  return await res.json();
}
