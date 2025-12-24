
document.addEventListener("DOMContentLoaded", async () => {
  const historico = JSON.parse(
    localStorage.getItem("ProgressoQuizInfraTech_v2") || "[]"
  );

  const totalQuizzesEl = document.getElementById("totalQuizzes");
  const maiorNotaEl = document.getElementById("maiorNota");
  const mediaNotasEl = document.getElementById("mediaNotas");
  const listaQuizzes = document.getElementById("listaQuizzes");

  if (!historico.length) {
    listaQuizzes.innerHTML = "<p>Nenhum quiz realizado ainda.</p>";
    totalQuizzesEl.textContent = 0;
    maiorNotaEl.textContent = 0;
    mediaNotasEl.textContent = 0;
    return;
  }

  let notas = [];

  for (const quiz of historico) {
    const data = await fetch(`../data/${quiz.disciplina}.json`)
      .then(r => r.json())
      .catch(() => null);

    if (!data) continue;

    const perguntas = data.questoes;
    const respostas = quiz.respostas;

    const nota = calcularNota(perguntas, respostas);
    notas.push(nota);

    const certas = contarCertas(perguntas, respostas);
    const erradas = contarErradas(perguntas, respostas);
    const naoRespondidas = contarNaoRespondidas(perguntas, respostas);

    const card = document.createElement("div");
    card.className = "quizEspecifico";

    const header = document.createElement("div");
    header.className = "quiz-header";
    header.innerHTML = `
      <span class="disciplina">${quiz.disciplina}</span>
      <span class="nota">${nota}%</span>
      <button class="btn-toggle-detalhes">
        <span class="chevron">&#9660;</span>
      </button>
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
        <div>${certas}</div>
        <div>${erradas}</div>
        <div>${naoRespondidas}</div>
      </div>
    `;
    card.appendChild(tabela);

    const detalhes = document.createElement("div");
    detalhes.className = "quiz-detalhes";

    const certasDiv = document.createElement("div");
    certasDiv.innerHTML = "<strong>Certas:</strong>";
    const erradasDiv = document.createElement("div");
    erradasDiv.innerHTML = "<strong>Erradas:</strong>";
    const naoDiv = document.createElement("div");
    naoDiv.innerHTML = "<strong>Não respondidas:</strong>";

    perguntas.forEach((q, i) => {
      const status =
        respostas[i] === null
          ? "nao-respondida"
          : respostas[i] === q.resposta_certa
          ? "certa"
          : "errada";

      const el = document.createElement("div");
      el.textContent = `Q${i + 1}: ${q.pergunta}`;
      el.className = `pergunta-item ${status}`;

      if (status === "certa") certasDiv.appendChild(el);
      else if (status === "errada") erradasDiv.appendChild(el);
      else naoDiv.appendChild(el);
    });

    detalhes.appendChild(certasDiv);
    detalhes.appendChild(erradasDiv);
    detalhes.appendChild(naoDiv);
    detalhes.style.display = "none";
    card.appendChild(detalhes);

    header.querySelector(".btn-toggle-detalhes").addEventListener("click", () => {
      detalhes.style.display = detalhes.style.display === "none" ? "flex" : "none";
      header.querySelector(".chevron").style.transform =
        detalhes.style.display === "flex" ? "rotate(180deg)" : "rotate(0deg)";
    });

    listaQuizzes.appendChild(card);
  }

  totalQuizzesEl.textContent = historico.length;
  maiorNotaEl.textContent = Math.max(...notas);
  mediaNotasEl.textContent = Math.round(notas.reduce((a,b)=>a+b,0)/notas.length);
});

/* Funções auxiliares */
function calcularNota(perguntas, respostas) {
  let acertos = 0;
  perguntas.forEach((q,i) => {
    if (respostas[i] === q.resposta_certa) acertos++;
  });
  return Math.round((acertos/perguntas.length)*100);
}
function contarCertas(perguntas, respostas) { return perguntas.filter((q,i)=>respostas[i]===q.resposta_certa).length; }
function contarErradas(perguntas, respostas) { return perguntas.filter((q,i)=>respostas[i]!==null && respostas[i]!==q.resposta_certa).length; }
function contarNaoRespondidas(perguntas,respostas){ return perguntas.filter((q,i)=>respostas[i]===null).length; }