const token = localStorage.getItem("token");
const selectTipoRelatorio = document.querySelector("#tipo-relatorio");
const containerFiltroProfessor = document.querySelector(
  "#filtro-professor-container",
);
const containerFiltroData = document.querySelector("#filtro-data-container");
const inputDataRelatorio = document.querySelector("#input-data-relatorio");
const btnBuscarData = document.querySelector("#btn-buscar-data");
const btnLimparData = document.querySelector("#btn-limpar-data");
const selectProfessor = document.querySelector("#select-professor");
const btnBuscarProfessor = document.querySelector("#btn-buscar-professor");
const areaResultado = document.querySelector("#area-resultado-relatorio");

const containerExportacao = document.querySelector("#container-exportacao");
const btnExportarPdf = document.querySelector("#btn-exportar-pdf");
const btnExportarCsv = document.querySelector("#btn-exportar-csv");

let dadosRelatorio = [];
let tipoRelatorioAtual = "";
let nomeRelatorioAtual = "";

selectTipoRelatorio.addEventListener("change", function () {
  const tipo = selectTipoRelatorio.value;
  nomeRelatorioAtual =
    selectTipoRelatorio.options[selectTipoRelatorio.selectedIndex].text;

  areaResultado.innerHTML = "<p>Carregando...</p>";
  containerExportacao.style.display = "none";
  dadosRelatorio = [];

  if (tipo === "reservas-professor") {
    containerFiltroProfessor.style.display = "block";
    containerFiltroData.style.display = "none";
    areaResultado.innerHTML =
      "<p>Selecione um professor e clique em Buscar.</p>";
    carregarProfessores();
  } else if (tipo === "reservas-todas") {
    containerFiltroProfessor.style.display = "none";
    containerFiltroData.style.display = "block";
    inputDataRelatorio.value = "";
    carregarReservas(API + "/reservas");
  } else {
    containerFiltroProfessor.style.display = "none";
    containerFiltroData.style.display = "none";

    if (tipo === "dispositivos-todos") {
      carregarDispositivos(
        API + "/dispositivos",
      );
    } else if (tipo === "dispositivos-manutencao") {
      carregarDispositivos(
        API + "/dispositivos?status=EM_MANUTENCAO",
      );
    }
  }
});

btnBuscarData.addEventListener("click", function () {
  const data = inputDataRelatorio.value;
  if (!data) {
    alert("Selecione uma data primeiro.");
    return;
  }

  nomeRelatorioAtual = "Reservas do dia " + data.split("-").reverse().join("/");
  areaResultado.innerHTML = "<p>Carregando reservas...</p>";
  carregarReservas(
    API + "/reservas?data=" + data,
  );
});

btnLimparData.addEventListener("click", function () {
  inputDataRelatorio.value = "";
  nomeRelatorioAtual = "Todas as Reservas";
  areaResultado.innerHTML = "<p>Carregando reservas...</p>";
  carregarReservas(API + "/reservas");
});

btnBuscarProfessor.addEventListener("click", function () {
  const professorId = selectProfessor.value;
  if (!professorId) {
    alert("Selecione um professor primeiro.");
    return;
  }

  const nomeProfessorSelecionado =
    selectProfessor.options[selectProfessor.selectedIndex].text.split(" (")[0];
  nomeRelatorioAtual = "Reservas - " + nomeProfessorSelecionado;

  areaResultado.innerHTML = "<p>Carregando reservas...</p>";
  carregarReservas(
    API + "/reservas/usuario/" + professorId,
  );
});

function carregarProfessores() {
  fetch(API + "/usuarios/professores", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (professores) {
      selectProfessor.innerHTML =
        '<option value="">Selecione o professor...</option>';
      professores.forEach(function (prof) {
        const option = document.createElement("option");
        option.value = prof.id;
        option.textContent = prof.nome + " (" + prof.email + ")";
        selectProfessor.appendChild(option);
      });
    });
}

function carregarReservas(url) {
  fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) {
        throw new Error(
          "Não foi possível carregar as reservas (erro " +
            response.status +
            ").",
        );
      }
      return response.json();
    })
    .then(function (pagina) {
      areaResultado.innerHTML = "";
      dadosRelatorio = pagina.content;
      tipoRelatorioAtual = "reservas";

      if (pagina.content.length === 0) {
        areaResultado.innerHTML =
          "<p>Nenhuma reserva encontrada para este filtro.</p>";
        containerExportacao.style.display = "none";
        return;
      }

      containerExportacao.style.display = "flex";

      pagina.content.forEach(function (reserva) {
        const card = document.createElement("div");
        card.className = "card-reserva";

        const itensTexto = reserva.itens
          .map(function (item) {
            return (
              item.nomeDispositivo + " (x" + item.quantidadeReservada + ")"
            );
          })
          .join("<br>");

        const dataFormatada = reserva.dataReserva
          .split("-")
          .reverse()
          .join("/");

        card.innerHTML =
          "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:12px;'>" +
          "<span><strong>Professor:</strong> " +
          reserva.nomeUsuario +
          "</span>" +
          '<span class="status status-' +
          reserva.status.toLowerCase() +
          '">' +
          reserva.status +
          "</span>" +
          "</div>" +
          "<strong>Sala:</strong> " +
          reserva.nomeSala +
          "<br>" +
          "<strong>Data:</strong> " +
          dataFormatada +
          "<br>" +
          "<strong>Horário:</strong> " +
          reserva.horarioInicio.substring(0, 5) +
          " às " +
          reserva.horarioFim.substring(0, 5) +
          "<br>" +
          "<strong>Itens:</strong><br>" +
          itensTexto;

        areaResultado.appendChild(card);
      });
    })
    .catch(function (erro) {
      areaResultado.innerHTML =
        "<p style='color:#d9534f;'>" + erro.message + "</p>";
      containerExportacao.style.display = "none";
      dadosRelatorio = [];
    });
}

function carregarDispositivos(url) {
  fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      areaResultado.innerHTML = "";
      dadosRelatorio = pagina.content;
      tipoRelatorioAtual = "dispositivos";

      if (pagina.content.length === 0) {
        areaResultado.innerHTML =
          "<p>Nenhum dispositivo encontrado para este filtro.</p>";
        containerExportacao.style.display = "none";
        return;
      }

      containerExportacao.style.display = "flex";

      pagina.content.forEach(function (equipamento) {
        const card = document.createElement("div");
        card.className = "card-reserva";

        let classeStatus = "pendente";
        if (equipamento.status === "DISPONIVEL") classeStatus = "confirmada";
        if (equipamento.status === "EM_MANUTENCAO") classeStatus = "cancelada";

        card.innerHTML =
          "<strong>" +
          equipamento.nome +
          "</strong> — Qtd: " +
          equipamento.quantidadeDisponivel +
          "<br>" +
          (equipamento.descricao || "") +
          '<br><span class="status status-' +
          classeStatus +
          '">' +
          equipamento.status +
          "</span>";

        areaResultado.appendChild(card);
      });
    });
}

btnExportarCsv.addEventListener("click", function () {
  if (dadosRelatorio.length === 0) return;

  let csvContent = "data:text/csv;charset=utf-8,\uFEFF";

  if (tipoRelatorioAtual === "reservas") {
    csvContent += "Usuario;Sala;Data;Inicio;Fim;Status;Itens\n";
    dadosRelatorio.forEach((r) => {
      let itens = r.itens
        .map((i) => i.nomeDispositivo + " (x" + i.quantidadeReservada + ")")
        .join(" | ");
      csvContent += `"${r.nomeUsuario}";"${r.nomeSala}";"${r.dataReserva}";"${r.horarioInicio}";"${r.horarioFim}";"${r.status}";"${itens}"\n`;
    });
  } else {
    csvContent += "Nome;Quantidade;Status;Descricao\n";
    dadosRelatorio.forEach((d) => {
      csvContent += `"${d.nome}";"${d.quantidadeDisponivel}";"${d.status}";"${d.descricao || ""}"\n`;
    });
  }

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", nomeRelatorioAtual + ".csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

btnExportarPdf.addEventListener("click", function () {
  if (dadosRelatorio.length === 0) return;

  const elementoTemp = document.createElement("div");
  elementoTemp.style.padding = "20px";
  elementoTemp.style.fontFamily = "Arial, sans-serif";
  elementoTemp.innerHTML =
    "<h2 style='text-align:center; margin-bottom: 20px;'>" +
    nomeRelatorioAtual +
    "</h2>";

  let tabelaHTML =
    "<table border='1' style='width: 100%; border-collapse: collapse; text-align: left; font-size: 14px;'><thead><tr style='background-color: #f4f6f8;'>";

  if (tipoRelatorioAtual === "reservas") {
    tabelaHTML +=
      "<th style='padding:8px;'>Usuário</th><th style='padding:8px;'>Sala</th><th style='padding:8px;'>Data/Hora</th><th style='padding:8px;'>Status</th><th style='padding:8px;'>Itens</th></tr></thead><tbody>";
    dadosRelatorio.forEach((r) => {
      let itens = r.itens
        .map((i) => i.nomeDispositivo + " (x" + i.quantidadeReservada + ")")
        .join(", ");
      tabelaHTML += `<tr>
          <td style='padding:8px;'>${r.nomeUsuario}</td>
          <td style='padding:8px;'>${r.nomeSala}</td>
          <td style='padding:8px;'>${r.dataReserva} ${r.horarioInicio.substring(0, 5)} às ${r.horarioFim.substring(0, 5)}</td>
          <td style='padding:8px;'>${r.status}</td>
          <td style='padding:8px;'>${itens}</td>
      </tr>`;
    });
  } else {
    tabelaHTML +=
      "<th style='padding:8px;'>Nome</th><th style='padding:8px;'>Qtd</th><th style='padding:8px;'>Status</th><th style='padding:8px;'>Descrição</th></tr></thead><tbody>";
    dadosRelatorio.forEach((d) => {
      tabelaHTML += `<tr>
          <td style='padding:8px;'>${d.nome}</td>
          <td style='padding:8px;'>${d.quantidadeDisponivel}</td>
          <td style='padding:8px;'>${d.status}</td>
          <td style='padding:8px;'>${d.descricao || ""}</td>
      </tr>`;
    });
  }

  tabelaHTML += "</tbody></table>";
  elementoTemp.innerHTML += tabelaHTML;

  html2pdf()
    .from(elementoTemp)
    .set({
      margin: 10,
      filename: nomeRelatorioAtual + ".pdf",
      html2canvas: { scale: 2 },
      jsPDF: {
        unit: "mm",
        format: "a4",
        orientation:
          tipoRelatorioAtual === "reservas" ? "landscape" : "portrait",
      },
    })
    .save();
});
