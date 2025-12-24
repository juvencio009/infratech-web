document.addEventListener("DOMContentLoaded", async () => {
  const STORAGE_HISTORICO = "ProgressoQuizInfraTech_v2";

  const totalQuizzesEl = document.getElementById("totalQuizzes");
  const maiorNotaEl = document.getElementById("maiorNota");
  const mediaNotasEl = document.getElementById("mediaNotas");
  const listaQuizzes = document.getElementById("listaQuizzes");
  const filterDisciplina = document.getElementById("filterDisciplina");

  let historico = JSON.parse(localStorage.getItem(STORAGE_HISTORICO) || "[]");
  if (!historico.length) {
    listaQuizzes.innerHTML = "<p>Nenhum quiz realizado ainda.</p>";
    totalQuizzesEl.textContent = 0;
    maiorNotaEl.textContent = 0;
    mediaNotasEl.textContent = 0;
    return;
  }

  historico.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const disciplinas = [...new Set(historico.map(h => h.disciplina))];
  disciplinas.forEach(d => {
    const opt = document.createElement("option");
    opt.value = d;
    opt.textContent = d;
    filterDisciplina.appendChild(opt);
  });

  const criarCard = async (quiz) => {
    if (!quiz.disciplina || !Array.isArray(quiz.respostas)) return null;

    const slug = quiz.disciplina.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\s+/g,"");
    let data;
    try {
      const res = await fetch(`../data/${slug}.json`);
      if (!res.ok) return null;
      data = await res.json();
      if (!Array.isArray(data.questoes)) return null;
    } catch { return null; }

    const perguntas = data.questoes;
    const respostas = quiz.respostas;
    const nota = calcularNota(perguntas, respostas);

    const card = document.createElement("div");
    card.className = "quizEspecifico";

    const dataFormatada = new Date(quiz.timestamp).toLocaleString("pt-PT");

    let notaClass = nota >= 70 ? "verde" : nota >= 50 ? "amarela" : "vermelha";

    const header = document.createElement("div");
    header.className = "quiz-header";
    header.innerHTML = `
      <span class="disciplina">${quiz.disciplina}</span>
      <span class="nota ${notaClass}">${nota}%</span>
      <span class="data">${dataFormatada}</span>
      ${quiz.finalizadoPorTempo ? `<span style="color:#c0392b;">⏱ Tempo esgotado</span>` : ""}
      <button class="btn-toggle-detalhes"><span class="chevron">&#9660;</span></button>
    `;
    card.appendChild(header);

    const tabela = document.createElement("div");
    tabela.className = "quiz-tabela";
    tabela.innerHTML = `
      <div class="linha cabecalho">
        <div>Questões</div>
        <div>Certas</div>
        <div>Erradas</div>
        <div>Não respondidas</div>
      </div>
      <div class="linha dados">
        <div>${perguntas.length}</div>
        <div>${contarCertas(perguntas,respostas)}</div>
        <div>${contarErradas(perguntas,respostas)}</div>
        <div>${contarNaoRespondidas(perguntas,respostas)}</div>
      </div>
    `;
    card.appendChild(tabela);

    const detalhes = document.createElement("div");
    detalhes.className = "quiz-detalhes";
    detalhes.style.display = "none";

    detalhes.appendChild(criarGrupo("Certas:", perguntas, respostas, "certa"));
    detalhes.appendChild(criarGrupo("Erradas:", perguntas, respostas, "errada"));
    detalhes.appendChild(criarGrupo("Não respondidas:", perguntas, respostas, "nao-respondida"));

    card.appendChild(detalhes);

    header.querySelector(".btn-toggle-detalhes").onclick = () => {
      const aberto = detalhes.style.display === "flex";
      detalhes.style.display = aberto ? "none" : "flex";
      header.querySelector(".chevron").style.transform = aberto ? "rotate(0deg)" : "rotate(180deg)";
    };

    card.dataset.disciplina = quiz.disciplina;

    return card;
  };

  const cards = await Promise.all(historico.map(criarCard));
  cards.filter(Boolean).forEach(card => listaQuizzes.appendChild(card));

  const notas = cards.filter(Boolean).map(card => {
    return parseInt(card.querySelector(".nota").textContent);
  });

  totalQuizzesEl.textContent = cards.filter(Boolean).length;
  maiorNotaEl.textContent = notas.length ? Math.max(...notas) : 0;
  mediaNotasEl.textContent = notas.length ? Math.round(notas.reduce((a,b)=>a+b,0)/notas.length) : 0;

  filterDisciplina.onchange = () => {
    const val = filterDisciplina.value;
    cards.filter(Boolean).forEach(card => {
      card.style.display = val === "all" || card.dataset.disciplina === val ? "flex" : "none";
    });
  };

});

/* ===== Funções auxiliares ===== */
function calcularNota(perguntas,respostas){
  let acertos = 0;
  perguntas.forEach((q,i)=>{if(respostas[i]===q.resposta) acertos++});
  return Math.round((acertos/perguntas.length)*100);
}
function contarCertas(p,r){ return p.filter((q,i)=>r[i]===q.resposta).length; }
function contarErradas(p,r){ return p.filter((q,i)=>r[i]!==null && r[i]!==q.resposta).length; }
function contarNaoRespondidas(p,r){ return p.filter((q,i)=>r[i]===null).length; }
function criarGrupo(titulo, perguntas, respostas, tipo){
  const div = document.createElement("div");
  div.innerHTML = `<strong>${titulo}</strong>`;
  perguntas.forEach((q,i)=>{
    const status = respostas[i]===null?"nao-respondida":respostas[i]===q.resposta?"certa":"errada";
    if(status!==tipo) return;
    const el = document.createElement("div");
    el.className = `pergunta-item ${status}`;
    el.textContent = `Q${i+1}: ${q.pergunta}`;
    div.appendChild(el);
  });
  return div;
}