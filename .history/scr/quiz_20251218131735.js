// ===============================
// CONFIG INICIAL
// ===============================
const params = new URLSearchParams(window.location.search);
const disciplina = params.get("disciplina");

const intro = document.getElementById("intro");
const quiz = document.getElementById("quiz");
const resultado = document.getElementById("resultado");

document.getElementById("disciplina").innerText =
  disciplina ? disciplina.toUpperCase() : "Prova";

let questoes = [];
let atual = 0;
let score = 0;

const PROGRESS_KEY = `gteste_progresso_${disciplina}`;

// ===============================
// PROGRESSO (LOCALSTORAGE)
// ===============================
function salvarProgresso() {
  localStorage.setItem(
    PROGRESS_KEY,
    JSON.stringify({ atual, score })
  );
}

function carregarProgresso() {
  const salvo = localStorage.getItem(PROGRESS_KEY);
  if (!salvo) return false;

  try {
    const p = JSON.parse(salvo);
    atual = p.atual;
    score = p.score;
    return true;
  } catch {
    return false;
  }
}

// ===============================
// CARREGAR JSON
// ===============================
fetch(`data/${disciplina}.json`)
  .then(r => {
    if (!r.ok) throw new Error();
    return r.json();
  })
  .then(data => {
    questoes = data.questoes;
  })
  .catch(() => alertG("Erro ao carregar questões"));

// ===============================
// INICIAR QUIZ
// ===============================
document.getElementById("startBtn").onclick = () => {
  if (!questoes.length) {
    alertG("Questões ainda não carregaram");
    return;
  }

  const temProgresso = carregarProgresso();

  if (temProgresso) {
    if (!confirm("Existe uma prova em andamento. Deseja continuar?")) {
      atual = 0;
      score = 0;
      localStorage.removeItem(PROGRESS_KEY);
    }
  }

  intro.classList.add("hidden");
  quiz.classList.remove("hidden");
  renderQuestao();
};

// ===============================
// RENDERIZAR QUESTÃO
// ===============================
function renderQuestao() {
  const q = questoes[atual];

  document.getElementById("qNumber").innerText =
    `Questão ${atual + 1} de ${questoes.length}`;

  document.getElementById("pergunta").innerText = q.pergunta;

  const img = document.getElementById("imagem");
  if (q.imagem) {
    img.src = q.imagem;
    img.classList.remove("hidden");
  } else {
    img.classList.add("hidden");
  }

  const box = document.getElementById("respostas");
  box.innerHTML = "";

  if (q.tipo === "multipla") {
    q.opcoes.forEach((op, i) => {
      box.innerHTML += `
        <label class="option">
          <input type="radio" name="resp" value="${i}">
          ${op}
        </label>
      `;
    });
  }

  if (q.tipo === "vf") {
    box.innerHTML = `
      <label class="option">
        <input type="radio" name="resp" value="true"> Verdadeiro
      </label>
      <label class="option">
        <input type="radio" name="resp" value="false"> Falso
      </label>
    `;
  }

  if (q.tipo === "input") {
    box.innerHTML = `
      <input id="respInput" type="text" placeholder="Digite sua resposta">
    `;
  }
}

// ===============================
// SUBMETER RESPOSTA
// ===============================
document.getElementById("submitBtn").onclick = () => {
  const q = questoes[atual];
  let correto = false;

  if (q.tipo !== "input") {
    const marcada = document.querySelector('input[name="resp"]:checked');
    if (!marcada) {
      alertG("Selecione uma resposta");
      return;
    }

    if (q.tipo === "multipla") {
      correto = parseInt(marcada.value) === q.resposta;
    }

    if (q.tipo === "vf") {
      correto = (marcada.value === "true") === q.resposta;
    }
  }

  if (q.tipo === "input") {
    const valor = document.getElementById("respInput").value.trim().toLowerCase();
    if (!valor) {
      alertG("Digite uma resposta");
      return;
    }
    correto = q.resposta.map(r => r.toLowerCase()).includes(valor);
  }

  if (correto) score++;

  salvarProgresso();

  atual++;
  atual < questoes.length ? renderQuestao() : finalizar();
};

// ===============================
// FINALIZAR
// ===============================
function finalizar() {
  quiz.classList.add("hidden");
  resultado.classList.remove("hidden");

  const nota20 = Math.round((score / questoes.length) * 20);

  resultado.innerHTML = `
    <h2>Resultado Final</h2>
    <div class="score">${nota20} / 20</div>
    <div class="status">${nota20 >= 10 ? "APROVADO" : "REPROVADO"}</div>
  `;

  // histórico
  const historico = JSON.parse(localStorage.getItem("gteste_historico")) || [];
  historico.push({
    disciplina: disciplina.toUpperCase(),
    data: new Date().toLocaleString(),
    nota: nota20,
    status: nota20 >= 10 ? "Aprovado" : "Reprovado"
  });
  localStorage.setItem("gteste_historico", JSON.stringify(historico));

  // limpar progresso
  localStorage.removeItem(PROGRESS_KEY);
}

// ===============================
// ALERTA SIMPLES
// ===============================
function alertG(text) {
  const div = document.createElement("div");
  div.style.cssText = `
    position:fixed;
    top:90px;
    left:50%;
    transform:translateX(-50%);
    background:#1d4ed8;
    color:#fff;
    padding:10px 14px;
    border-radius:14px;
    z-index:999;
  `;
  div.textContent = text;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
