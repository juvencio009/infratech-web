async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  if(!res.ok)
  return await res.json();
}
