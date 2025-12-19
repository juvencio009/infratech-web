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
