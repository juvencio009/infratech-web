async function CarregarQuestoes(route) {
  try {
    const res = await fetch(route);
    if (!res.ok) {
        if(res.status===404){
          alert("Disciplina Indisponivel no momento")
        }
      throw new Error("Erro ao carregar os dados")};
    return await res.json();
  } catch (err) {
    console.error("Erro Detectado:", err);
    throw err;
  }
}


function TimeFormat(f){
  f = Math.max(0,Math.floor(f));

  const Max = 24*60*60;
  f = f%Max;

  const h = Math.floor((f/3600));
  const m = Math.floor((f%3600)/60);
  const s = f%60;

  return (`${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`)
}