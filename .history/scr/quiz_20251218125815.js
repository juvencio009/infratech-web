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

// ===============================
// CARREGAR JSON
// ===============================
fetch(`data/${disciplina}.json`)
  .then(r => {
    if (!r.ok) throw new Error("JSON não encontrado");
    return r.json();
  })
  .then(data => {
    questoes = data.questoes;
    console.log("Questões carregadas:", questoes);
  })
  .catch(() => {
    alertG("Erro ao carregar questões de " + disciplina, "error");
  });

// ===============================
// INICIAR QUIZ
// ===============================
document.getElementById("startBtn").onclick = () => {
  if (!questoes.length) {
    alertG("Questões ainda não carregaram.");
    return;
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

  const imgBox = document.getElementById("imagem");
  if (q.imagem) {
    imgBox.src = q.imagem;
    imgBox.classList.remove("hidden");
  } else {
    imgBox.classList.add("hidden");
  }

  const box = document.getElementById("respostas");
  box.innerHTML = "";

  // ===== TIPO MULTIPLA =====
  if (q.tipo === "multipla") {
    q.opcoes.forEach((r, i) => {
      box.innerHTML += `
        <label class="option">
          <input type="radio" name="resp" value="${i}">
          ${r}
        </label>
      `;
    });
  }

  // ===== TIPO VERDADEIRO/FALSO =====
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

  // ===== TIPO INPUT =====
  if (q.tipo === "input") {
    box.innerHTML = `
      <input type="text" id="respInput" placeholder="Digite sua resposta">
    `;
  }
}

// ===============================
// SUBMETER RESPOSTA
// ===============================
document.getElementById("submitBtn").onclick = () => {
  const q = questoes[atual];
  let correto = false;

  // MULTIPLA
  if (q.tipo === "multipla") {
    const marcada = document.querySelector('input[name="resp"]:checked');
    if (!marcada) {
      alertG("Selecione uma alternativa.");
      return;
    }
    correto = parseInt(marcada.value) === q.resposta;
  }

  // VERDADEIRO / FALSO
  if (q.tipo === "vf") {
    const marcada = document.querySelector('input[name="resp"]:checked');
    if (!marcada) {
      alertG("Selecione Verdadeiro ou Falso.");
      return;
    }
    correto = (marcada.value === "true") === q.resposta;
  }

  // INPUT
  if (q.tipo === "input") {
    const valor = document.getElementById("respInput").value.trim().toLowerCase();
    if (!valor) {
      alertG("Digite uma resposta.");
      return;
    }
    correto = q.resposta.map(r => r.toLowerCase()).includes(valor);
  }

  if (correto) score++;

  atual++;
  atual < questoes.length ? renderQuestao() : finalizar();
};

// ===============================
// FINALIZAR QUIZ
// ===============================
function finalizar() {
  quiz.classList.add("hidden");
  resultado.classList.remove("hidden");

  const nota20 = Math.round((score / questoes.length) * 20);

  resultado.innerHTML = `
    <h2>Resultado final</h2>
    <div class="score">${nota20} / 20</div>
    <div class="status">
      ${nota20 >= 10 ? "APROVADO" : "REPROVADO"}
    </div>
  `;

  // SALVAR HISTÓRICO
  const historico = JSON.parse(localStorage.getItem("gteste_historico")) || [];
  historico.push({
    disciplina: disciplina.toUpperCase(),
    data: new Date().toLocaleString(),
    nota: nota20,
    status: nota20 >= 10 ? "Aprovado" : "Reprovado"
  });
  localStorage.setItem("gteste_historico", JSON.stringify(historico));
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
    padding:10px 14px;
    background:#1d4ed8;
    color:#fff;
    border-radius:12px;
    z-index:999;
  `;
  div.textContent = text;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3000);
}
