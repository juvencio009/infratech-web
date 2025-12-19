const tbody = document.querySelector("#tabelaHistorico tbody");
const historico = JSON.parse(localStorage.getItem("gteste_historico")) || [];

if (!historico.length) {
  tbody.innerHTML = `
    <tr>
      <td colspan="4" style="text-align:center; padding:20px;">
        Nenhuma prova realizada ainda.
      </td>
    </tr>
  `;
} else {
  historico.forEach(h => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${h.disciplina}</td>
      <td>${h.data}</td>
      <td>${h.nota} / 20</td>
      <td>${h.status}</td>
    `;
    tbody.appendChild(tr);
  });
}
// Função para mostrar o painel de progresso da disciplina
function showProgressPanel(disciplina) {
  const progressPanel = document.getElementById('progressPanel');
  
  // Alterar título dinamicamente
  const panelTitle = progressPanel.querySelector('h3');
  panelTitle.textContent = `Progresso - ${disciplina.charAt(0).toUpperCase() + disciplina.slice(1)}`;

  // Mostrar o painel
  progressPanel.classList.remove('hidden');

  // Carregar as questões para o painel (pode vir de uma base de dados ou API)
  // Exemplo simples de preenchimento (pode ser adaptado conforme necessidade)
  document.getElementById('todas').innerHTML = `<p>Lista de todas as questões realizadas na prova de ${disciplina.charAt(0).toUpperCase() + disciplina.slice(1)}.</p>`;
  document.getElementById('corretas').innerHTML = `<p>Lista de questões corretas da prova de ${disciplina.charAt(0).toUpperCase() + disciplina.slice(1)}.</p>`;
  document.getElementById('incorretas').innerHTML = `<p>Lista de questões incorretas da prova de ${disciplina.charAt(0).toUpperCase() + disciplina.slice(1)}.</p>`;

  // Resetar tabs
  showTab('todas');
}

// Função para alternar entre as tabs
function showTab(tabName) {
  const tabs = document.querySelectorAll('.tab-content');
  const tabButtons = document.querySelectorAll('.tab-button');

  tabs.forEach(tab => {
    if (tab.id === tabName) {
      tab.classList.remove('hidden');
    } else {
      tab.classList.add('hidden');
    }
  });

  tabButtons.forEach(button => {
    if (button.textContent.toLowerCase() === tabName) {
      button.classList.add('active');
    } else {
      button.classList.remove('active');
    }
  });
}
