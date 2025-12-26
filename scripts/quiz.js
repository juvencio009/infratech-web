
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
const finalModal = document.getElementById("finalModal");
const retryQuizBtn = document.getElementById("retryQuiz");
const goProgressBtn = document.getElementById("goProgress");
const goHomeBtn = document.getElementById("goHome");


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
    pararTimer();
    return;
  }

  quizStatus.tempoRestante--;

  if (quizStatus.tempoRestante <= 0) {
    quizStatus.tempoRestante = 0;
    atualizarTimerUI();
    alert("Tempo esgotado!");
    tentarSubmeter(true);
    return;
  }

  atualizarTimerUI();
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
 
  const horas = String(Math.floor(restante / 3600)).padStart(2, "0");

  const minutos = String(Math.floor((restante % 3600)/60)).padStart(2, "0");

  const segundos = String(restante % 60).padStart(2, "0");
 timer.textContent=`${horas}:${minutos}:${segundos}`

}

/* ====================== Inicialização ====================== */
document.addEventListener("DOMContentLoaded", () => {
  introEl.style.display = "flex";
  quizEl.classList.add("hidden");
  asideEl.classList.add("hidden");
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

  const disciplina = getDisciplinaFromURL();
  if (!disciplina) {
    alert("Disciplina não informada.");
    return;
  }

  const data = await Loader(`../data/${disciplina}.json`)

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
    scrollAsidePara(quizStatus.atual);
  } else {
    tentarSubmeter();
  }
}
retryQuizBtn.onclick = () => {
  localStorage.removeItem(STORAGE_KEY);
  location.reload();
};

goProgressBtn.onclick = () => {
  window.location.href = "progresso.html";
};

goHomeBtn.onclick = () => {
  window.location.href = "../index.html";
};

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
  localStorage.removeItem(STORAGE_KEY);

  const progresso = {
    disciplina: quizStatus.disciplina,
    respostas: [...quizStatus.respostas],
    timestamp: new Date().toISOString(),
    finalizadoPorTempo: forcado
  };

  let historico = JSON.parse(
    localStorage.getItem("ProgressoQuizInfraTech_v2") || "[]"
  );

  historico.push(progresso);
  localStorage.setItem(
    "ProgressoQuizInfraTech_v2",
    JSON.stringify(historico)
  );

  bloquearInteracoes();
  abrirModalFinal();
};



/* ====================== Bloquear interações após submissão ====================== */
function bloquearInteracoes() {
  document.querySelectorAll(".option").forEach(opt => opt.onclick = null);
}

function abrirModalFinal() {
  finalModal.classList.remove("hidden");
}


/* ====================== Render Aside ====================== */
function renderAside() {
  asideEl.innerHTML = "";

  for (let i = 0; i < quizStatus.perguntas.length; i++) {
    const wrap = document.createElement("div");
    wrap.className = "alternativaFoq";
    wrap.textContent = `Questão ${i + 1}`;
    wrap.dataset.index = i;

    wrap.onclick = () => {
      quizStatus.atual = i;
      renderQuiz();
      atualAside(i);
    };

    asideEl.appendChild(wrap);
  }

  marcarAsideTodos();
}


function scrollAsidePara(index) {
  const item = asideEl.querySelector(
    `.alternativaFoq[data-index="${index}"]`
  );

  if (item) {
    item.scrollIntoView({
      behavior: "smooth", // animação suave
      block: "center"     // mantém o item visível no centro
    });
  }
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
  if (quizStatus.finalizado) return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      atual: quizStatus.atual,
      respostas: quizStatus.respostas,
      tempoRestante: quizStatus.tempoRestante
    })
  );
}


function LoadStateLocal() {
  const dados = JSON.parse(localStorage.getItem(STORAGE_KEY));
  if (!dados) return;

  quizStatus.atual = Number.isInteger(dados.atual) ? dados.atual : 0;

  if (
    Array.isArray(dados.respostas) &&
    dados.respostas.length === quizStatus.perguntas.length
  ) {
    quizStatus.respostas = dados.respostas;
  } else {
    quizStatus.respostas = new Array(quizStatus.perguntas.length).fill(null);
  }

  if (
    Number.isInteger(dados.tempoRestante) &&
    dados.tempoRestante > 0
  ) {
    quizStatus.tempoRestante = dados.tempoRestante;
  }
}

/* ====================== Função de recomeço manual ====================== */
function recomecarQuiz() {
  pararTimer();
  introEl.style.display = "flex";
  quizEl.classList.add("hidden");
  asideEl.classList.add("hidden");

  quizStatus.finalizado = false;
  quizStatus.atual = 0;
  quizStatus.respostas = new Array(quizStatus.perguntas.length).fill(null);
  quizStatus.tempoRestante = quizStatus.tempototal;
  timer.textContent = "00:00";
}

/*=============== INTRO ================*/
const text = document.getElementById("textIntrution");
const lista = document.getElementById("listIns");
const duracao = document.querySelector(".duracao");

const intros = async ()=>{
    const dsh = getDisciplinaFromURL();
  if (!dsh) {
    return;
  }
  const dataIntro = await Loader(`../data/${dsh}.json`);

  const horas = String(Math.floor(dataIntro.duracao / 3600));

  const minutos = String(Math.floor(dataIntro.duracao % 3600)/60);


  if(horas>0){
    horas === 1 ? 
    duracao.innerHTML = `${horas} horas e ${minutos} minutos`:duracao.innerHTML = `${horas} hora e ${minutos} minutos`;
  }else{
    duracao.innerHTML = `${minutos} Minutos`
  }

  textDis.textContent=dataIntro.disciplina;  

  const isInfo = await Loader(`../config/infra.json`);

  console.log(isInfo);
  text.textContent=isInfo.font;

  isInfo.method.forEach((el,i) => {
    const li = document.createElement("li");
    li.style.cssText=`border-left: 3px solid #212a30;padding: 10px; background: #1a77ce0a; border-radius: 10px;margin-bottom: 5px;font-size: 0.9em;box-shadow: 0 0 12px -4px #0966e010;cursor: pointer;`;
    li.textContent=`${i+1} - ${el}`;
    lista.appendChild(li)
  });
}

  intros();