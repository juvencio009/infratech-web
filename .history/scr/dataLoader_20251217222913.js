async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  if(!)
  return await res.json();
}
