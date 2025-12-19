async function carregarQuestoes(disciplina) {
  const res = await fetch(`data/${disciplina}.json`);
  if(!res.ok) throw new Error 
  return await res.json();
}
