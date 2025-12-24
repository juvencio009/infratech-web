
  const qNumber = document.getElementById("qNumber");
const introEl = document.getElementById("intro");
const quizEl = document.getElementById("quiz");
const timer = document.querySelector(".timer");
const asideEl = document.getElementById("idQuestions");
const startBtn = document.getElementById("startBtn");
const backBtn = document.getElementById("backBtn");
const nextBtn = document.getElementById("nextBtn");
const SubmeterBtn = document.getElementById("SubmeterBtn");
const textDis = document.getElementById("subject");
const pergunta = document.getElementById("pergunta");
const containerOpcoes = document.getElementById("containerOpcoes");

const STORAGE_KEY = "infratech_quiz_state_v2";

const quizStatus = {
  disciplina: null,
  perguntas: [],
  atual: 0,
  respostas: [],
  finalizado: false,
  tempoRestante: 0,
  tempototal: 0,
  timerId: null
}

/* ====================== Funções do Timer ====================== */
function iniciarTimer() {
  console.log("Timer Iniciado!");

  pararTimer(); // Garante que não haja múltiplos timers

  quizStatus.timerId = setInterval(() => {
    if (quizStatus.finalizado) {
      console.log("Timer Parado!");
      pararTimer();
      return;
    }

    quizStatus.tempoRestante--;
    atualizarTimerUI();

    if (quizStatus.tempoRestante <= 0) {
      alert("Tempo esgotado!");
      tentarSubmeter(true);
    }
  }, 1000);
}

function pararTimer() {
  if (quizStatus.timerId) {
    clearInterval(quizStatus.timerId);
    quizStatus.timerId = null;
    console.log("Timer Limpo");
  }
}

function atualizarTimerUI() {
  const restante = quizStatus.tempoRestante;
  const minutos = String(Math.floor(restante / 60)).padStart(2, "0");
  const segundos = String(restante % 60).padStart(2, "0");
  timer.innerHTML = `${minutos}:${segundos}`;
}

/* ====================== Inicialização ====================== */
document.addEventListener("DOMContentLoaded", () => {
  introEl.style.display = "flex";
  quizEl.classList.add("hidden");
  asideEl.classList.add("hidden");
  const w = getDisciplinaFromURL();
  textDis.textContent = w;
});

startBtn.addEventListener("click", async () => {
  introEl.style.display = "none";
  quizEl.classList.remove("hidden");
  asideEl.classList.remove("hidden");
  await iniciarQuiz();
});

function getDisciplinaFromURL() {
  const params = new URLSearchParams(location.search);
  return params.get("disciplina");
}

async function iniciarQuiz() {
  try {
    const disciplina = getDisciplinaFromURL();
    if (!disciplina) {
      alert("Disciplina não informada.");
      return;
    }

    const data = await fetch(`../data/${disciplina}.json`)
    .then(r => r.json());

    quizStatus.disciplina = data.disciplina;
    quizStatus.perguntas = data.questoes;
    quizStatus.finalizado = false;
    quizStatus.atual = 0;
    quizStatus.tempoRestante = data.duracao;
    quizStatus.tempototal = data.duracao;
    quizStatus.respostas = new Array(data.questoes.length).fill(null);

    LoadStateLocal(); // Carrega estado anterior se houver
    renderQuiz();
    iniciarTimer();
    renderAside();

  } catch (error) {
    console.error("Erro ao iniciar quiz:", error);
    alert("Erro ao carregar o quiz.");
  }
}

/* ====================== Render Quiz ====================== */
function renderQuiz() {
  const q = quizStatus.perguntas[quizStatus.atual];

  pergunta.textContent = q.pergunta;
  qNumber.textContent = `Questão : ${quizStatus.atual+1} de ${quizStatus.perguntas.length}`;
  containerOpcoes.innerHTML = "";

  q.opcoes.forEach((o, i) => {
    const div = document.createElement("div");
    div.className = 'option';
    div.textContent = o;

    if (quizStatus.respostas[quizStatus.atual] === i) {
      div.classList.add("selected");
    }

    div.onclick = () => {
      selecionarOpcao(i);
    }

    containerOpcoes.appendChild(div);
  });

  backBtn.style.display = quizStatus.atual > 0 ? 'inline-block' : 'none';
  nextBtn.textContent = quizStatus.atual < quizStatus.perguntas.length - 1 ? 'Proximo' : 'Submeter';
}

/* ====================== Seleção de Opção ====================== */
const selecionarOpcao = (index) => {
  if (quizStatus.finalizado) return;

  quizStatus.respostas[quizStatus.atual] = index;
  renderQuiz();
  markAsideSolved(quizStatus.atual);
  salvarStateLocal();
}

/* ====================== Botões ====================== */
backBtn.onclick = () => {
  if (quizStatus.atual > 0) {
    quizStatus.atual--;
    renderQuiz();
    atualAside(quizStatus.atual);
  }
}

nextBtn.onclick = () => {
  if (quizStatus.atual < quizStatus.perguntas.length - 1) {
    quizStatus.atual++;
    renderQuiz();
    atualAside(quizStatus.atual);
  } else {
    tentarSubmeter();
  }
}

/* ====================== Questões não respondidas ====================== */
function getQuestoesNaoRespondidas() {
  return quizStatus.respostas.map((res, idx) => (res === null ? idx : null)).filter(i => i !== null);
}

/* ====================== Submissão ====================== */
function tentarSubmeter(forcado = false) {
  const pendentes = getQuestoesNaoRespondidas();
  if (pendentes.length > 0 && !forcado) {
    const confirmar = confirm(`Existem ${pendentes.length} questões não respondidas.\nDeseja submeter mesmo assim?`);
    if (!confirmar) return;
  }
  SubmeterQuiz(forcado);
}

const SubmeterQuiz = (forcado = false) => {
  if (quizStatus.finalizado) return;

  quizStatus.finalizado = true;
  pararTimer();

  const progresso = {
    disciplina: quizStatus.disciplina,
    respostas: [...quizStatus.respostas],
    timestamp: new Date().toISOString(),
    finalizadoPorTempo: forcado
  };

  localStorage.setItem("ProgressoQuizInfraTech_v2", JSON.stringify(progresso));
  bloquearInteracoes();
  recomeçarQuiz();
  alert("O Quiz foi finalizado e salvo com sucesso!");
  window.location.href='../index.html'
}

/* ====================== Bloquear interações após submissão ====================== */
function bloquearInteracoes() {
  document.querySelectorAll(".option").forEach(opt => opt.onclick = null);
}

/* ====================== Render Aside ====================== */
function renderAside() {
  asideEl.innerHTML = "";

  for (let i = 0; i < quizStatus.perguntas.length; i++) {
    const wrap = document.createElement("div");
    wrap.className = "alternativaFoq";
    wrap.textContent = `Questão ${i + 1}`;

    wrap.onclick = () => {
      quizStatus.atual = i;
      renderQuiz();
      atualAside(i);
    };

    asideEl.appendChild(wrap);
  }

  marcarAsideTodos();
}

const atualAside = (kl) => {
  const asideDivs = document.querySelectorAll(".alternativaFoq");
  asideDivs.forEach(el => el.classList.remove("atual"));
  if (asideDivs[kl]) asideDivs[kl].classList.add("atual");
}

const markAsideSolved = (indice) => {
  const asideDivs = document.querySelectorAll(".alternativaFoq");
  if (asideDivs[indice]) asideDivs[indice].classList.add("solved");
}

function marcarAsideTodos() {
  quizStatus.respostas.forEach((res, idx) => {
    if (res !== null) markAsideSolved(idx);
  });
}

/* ====================== Salvamento Local ====================== */
function salvarStateLocal() {
  const dados = {
    atual: quizStatus.atual,
    respostas: quizStatus.respostas,
    tempoRestante: quizStatus.tempoRestante
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));
}

function LoadStateLocal() {
  const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!dados) return;

  quizStatus.atual = dados.atual ?? 0;
  quizStatus.respostas = dados.respostas ?? new Array(quizStatus.perguntas.length).fill(null);
  quizStatus.tempoRestante = dados.tempoRestante ?? quizStatus.tempoRestante;
}

/* ====================== Função de recomeço manual ====================== */
function recomeçarQuiz() {
  pararTimer();
  introEl.style.display = "flex";
  quizEl.classList.add("hidden");
  asideEl.classList.add("hidden");

  quizStatus.finalizado = false;
  quizStatus.atual = 0;
  quizStatus.respostas = new Array(quizStatus.perguntas.length).fill(null);
  quizStatus.tempoRestante 