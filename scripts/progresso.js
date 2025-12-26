document.addEventListener("DOMContentLoaded", async () => {
  const STORAGE_HISTORICO = "ProgressoQuizInfraTech_v2";

  const totalQuizzesEl = document.getElementById("totalQuizzes");
  const maiorNotaEl = document.getElementById("maiorNota");
  const mediaNotasEl = document.getElementById("mediaNotas");
  const listaQuizzes = document.getElementById("listaQuizzes");
  const filterDisciplina = document.getElementById("filterDisciplina");

  let historico = JSON.parse(localStorage.getItem(STORAGE_HISTORICO) || "[]");
  if (!historico.length) {
    listaQuizzes.innerHTML = "<p class='empty'>Nenhum quiz realizado ainda.</p>";
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
      data = await Loader(`../data/${slug}.json`);
  
      if (!Array.isArray(data.questoes)) return null;
    } catch { return null; }

    const perguntas = data.questoes;
    const respostas = quiz.respostas;
    const nota = calcularNota(perguntas, respostas);

    const card = document.createElement("div");
    card.className = "quizEspecifico";

    const dataFormatada = new Date(quiz.timestamp).toLocaleString("pt-PT");

    let notaClass = nota >= 15 ? "verde" : nota >= 10 ? "amarela" : "vermelha";

    const header = document.createElement("div");
    header.className = "quiz-header";
    header.innerHTML = `
      <span class="disciplina">Disciplina: ${quiz.disciplina}</span>
      <span >Nota: <span class='nota ${notaClass}'> ${nota}${nota!==1?" valores ":" valor "}</span></span>
      <span class="data" style='font-size:0.7em;color:#555'>${dataFormatada}</span>
      ${quiz.finalizadoPorTempo ? `<span style="color:#c0392b;">⏱ Tempo esgotado</span>` : ""}
      <button class="btn-toggle-detalhes"><span class="chevron"><i class='bi bi-chevron-down'></i></span></button>
    `;
    card.appendChild(header);

    const tabela = document.createElement("div");
    tabela.className = "quiz-tabela";
    tabela.innerHTML = `
      <div class="linha cabecalho">
        <div>Questões</div>
        <div>Certas</div>
        <div>Erradas</div>
        <div>Null</div>
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
function calcularNota(perguntas, respostas) {
  let acertos = 0;

  perguntas.forEach((q, i) => {
    if (respostas[i] === q.resposta) acertos++;
  });

  return Number(((acertos / perguntas.length) * 20).toFixed(1));
}



function contarCertas(p,r){ return p.filter((q,i)=>r[i]===q.resposta).length; }
function contarErradas(p,r){ return p.filter((q,i)=>r[i]!==null && r[i]!==q.resposta).length; }
function contarNaoRespondidas(p,r){ return p.filter((q,i)=>r[i]===null).length; }
function criarGrupo(titulo, perguntas, respostas, tipo) {
  const div = document.createElement("div");
  div.innerHTML = `<strong>${titulo}</strong>`;

  let encontrou = false; // controla se alguma pergunta foi adicionada

  perguntas.forEach((q, i) => {
    const status =
      respostas[i] === null
        ? "nao-respondida"
        : respostas[i] === q.resposta
        ? "certa"
        : "errada";

    if (status !== tipo) return;

    encontrou = true;

    const el = document.createElement("div");
    el.className = `pergunta-item ${status}`;

    /* Texto da pergunta */
    const perguntaTxt = document.createElement("div");
    perguntaTxt.textContent = `Q${i + 1}: ${q.pergunta}`;
    el.appendChild(perguntaTxt);

    /* Hashtags da resposta correta */
    if (Array.isArray(q.opcoes) && typeof q.resposta === "number") {
      const textoOpcao = q.opcoes[q.resposta];

      if (textoOpcao) {
        const tagsWrap = document.createElement("div");
        tagsWrap.className = "hashtags";

        textoOpcao.split(/\s+v\s+/i).forEach(r => {
          const tag = document.createElement("span");
          tag.className = "hashtag";
          tag.innerHTML = `Resposta Correta: <span style='font-weight:bold'> ${r}</span>`;
          tagsWrap.appendChild(tag);
        });

        el.appendChild(tagsWrap);
      }
    }

    div.appendChild(el);
  });


  if (!encontrou) {
    const msg = document.createElement("div");
    msg.className = "grupo-vazio";

    if (tipo === "errada") {
      msg.textContent = "Não houve nenhuma resposta errada neste quiz.";
    } else if (tipo === "nao-respondida") {
      msg.textContent = "Todas as perguntas foram respondidas.";
    } else if (tipo === "certa") {
      msg.textContent = "Nenhuma resposta correta registada.";
    }

    div.appendChild(msg);
  }

  return div;
}
