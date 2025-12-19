const params = new URLSearchParams(window.location.search);
const disciplina = params.get('disciplina');

let questoes = [];
let atual = 0;
let score = 0;

const intro = document.getElementById("intro");
const quiz = document.getElementById("quiz");
const resultado = document.getElementById("resultado");

document.getElementById("disciplina").innerText =
  disciplina.toUpperCase();

carregarQuestoes(disciplina).then(data => {
  questoes = data;
});

document.getElementById("startBtn").onclick = () => {
  intro.classList.add("hidden");
  quiz.classList.remove("hidden");
  renderQuestao();
};

function renderQuestao() {
  const q = questoes[atual];
  document.getElementById("pergunta").innerText =
    `Questão ${atual + 1}: ${q.pergunta}`;

  const box = document.getElementById("respostas");
  box.innerHTML = "";

  q.respostas.forEach((r, i) => {
    box.innerHTML += `
      <label>
        <input type="radio" name="resp" value="${i}">
        ${r}
      </label>
    `;
  });
}

document.getElementById("submitBtn").onclick = () => {
  const marcada = document.querySelector('input[name="resp"]:checked');
  if (!marcada) {
    alert("Selecione uma resposta antes de submeter");
    return;
  }

  if (parseInt(marcada.value) === questoes[atual].correta) {
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

  resultado.innerHTML = `
    <h2>Resultado Final</h2>
    <p>${score} de ${questoes.length} questões corretas</p>
    <p>Status: ${score >= questoes.length / 2 ? "Aprovado" : "Reprovado"}</p>
  `;
}


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
  background:${state==='info'?'#dbb612ff':'#1d4ed8'};
  color:#233;
  box-shadow:0 13px 20px rgba(0,0,0,0.05);
  z-index:2;
  background-color:#fafafa;
  border:1px solid #fafaee;
  `;
  div.textContent=text;

  document.body.appendChild(div);
}

