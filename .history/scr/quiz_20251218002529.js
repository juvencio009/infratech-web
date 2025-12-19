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
  // carregar JSON
  fetch(`data/${disciplina}.json`)
    .then(r => {
      if (!r.ok) throw new Error("JSON não encontrado");
      return r.json();
    })
    .then(data => {
      questoes = data;

      console.log(questoes);
    })
    .catch(() => {
      alertG("Erro ao carregar questões de "+disciplina);
    });

  document.getElementById("startBtn").onclick = () => {
    if (!questoes.length) {
      alertG("Questões ainda não carregaram.");
      return;
    }

    intro.classList.add("hidden");
    quiz.classList.remove("hidden");
    renderQuestao();
  };

  function renderQuestao() {
    const q = questoes[atual];

    document.getElementById("qNumber").innerText =
      `Questão ${atual + 1} de ${questoes.length}`;

    document.getElementById("pergunta").innerText = q.question;

    const box = document.getElementById("respostas");
    box.innerHTML = "";

    q.answers.forEach((r, i) => {
      box.innerHTML += `
        <label class="option">
          <input type="radio" name="resp" value="${i}">
          ${r}
        </label>
      `;
    });
  }

  document.getElementById("submitBtn").onclick = () => {
    const marcada = document.querySelector('input[name="resp"]:checked');
    if (!marcada) {
      alertG("Selecione uma alternativa.");
      return;
    }

    if (parseInt(marcada.value) === questoes[atual].correctIndex) {
      score++;
    }

    atual++;

    if (atual < questoes.length) {
      renderQuestao();
    } else {
      finalizar();
    }
  };

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
  }
const historico = JSON.parse(localStorage.getItem("gteste_historico")) || [];

historico.push({
  disciplina: disciplina.toUpperCase(),
  data: new Date().toLocaleString(),
  nota: nota20,
  status: nota20 >= 10 ? "Aprovado" : "Reprovado"
});

localStorage.setItem("gteste_historico", JSON.stringify(historico));

function alertG(text,state='info'){

  const div = document.createElement("div");
  div.style.cssText=`
  position:absolute;
  top:90px;
  left:50%;
  transform:translateX(-50%);
  max-width:200px;
  border-radius:20px;
  padding:10px 12px;
  background:${state==='info'?'#1d4ed8':'#1d4ed8'};
  color:#fafafa;
  text-align:center;
  box-shadow:0 13px 20px rgba(0,0,0,0.15);
  z-index:2;
  border:1px solid #fafaee;
  `;
  div.textContent=text;
  document.body.appendChild(div);

  setTimeout(()=>{
    div.style.cssText=`
    opacity:0;top:0; z-index:0`
  },3000)
}
