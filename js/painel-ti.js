const token = localStorage.getItem("token");
const saudacao = document.querySelector("#saudacao");
const listaReservas = document.querySelector("#lista-reservas");
const filtroStatus = document.querySelector("#filtro-status");

let salasDisponiveis = [];
let dispositivosDisponiveis = [];
let periodosDisponiveis = [];

fetch(API + "/usuarios/me", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (usuario) {
    saudacao.textContent = "Bem-vindo, " + usuario.nome + "!";
  });
fetch(API + "/salas", {
  headers: { Authorization: "Bearer " + token },
})
  .then((r) => r.json())
  .then((p) => {
    salasDisponiveis = p.content;
  });

fetch(API + "/dispositivos", {
  headers: { Authorization: "Bearer " + token },
})
  .then((r) => r.json())
  .then((p) => {
    dispositivosDisponiveis = p.content;
  });

fetch(API + "/periodos", {
  headers: { Authorization: "Bearer " + token },
})
  .then((r) => r.json())
  .then((p) => {
    periodosDisponiveis = p;
  });

function carregarReservas(status) {
  let url = API + "/reservas";
  if (status && status !== "todas") {
    url += "?status=" + status;
  }

  fetch(url, { headers: { Authorization: "Bearer " + token } })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaReservas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaReservas.innerHTML = "<p>Nenhuma reserva encontrada.</p>";
        return;
      }

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

        const br = document.createElement("br");
        card.appendChild(br);

        if (reserva.status === "PENDENTE" || reserva.status === "CONFIRMADA") {
          const btnEditar = document.createElement("button");
          btnEditar.textContent = "Editar";
          btnEditar.className = "btn-editar";
          btnEditar.addEventListener("click", function () {
            abrirFormularioEdicao(card, reserva, status);
          });
          card.appendChild(btnEditar);
        }

        if (reserva.status === "PENDENTE") {
          const btnConfirmar = document.createElement("button");
          btnConfirmar.textContent = "Confirmar";
          btnConfirmar.className = "btn-confirmar";
          btnConfirmar.addEventListener("click", function () {
            atualizarStatus(reserva.id, "CONFIRMADA", status);
          });

          const btnCancelar = document.createElement("button");
          btnCancelar.textContent = "Cancelar";
          btnCancelar.className = "btn-remover-item";
          btnCancelar.style.width = "auto";
          btnCancelar.style.padding = "6px 12px";
          btnCancelar.addEventListener("click", function () {
            atualizarStatus(reserva.id, "CANCELADA", status);
          });

          card.appendChild(btnConfirmar);
          card.appendChild(btnCancelar);
        }

        if (reserva.status === "CONFIRMADA") {
          const btnReverter = document.createElement("button");
          btnReverter.textContent = "Reverter para Pendente";
          btnReverter.className = "btn-reverter-para-pendente";
          btnReverter.addEventListener("click", function () {
            atualizarStatus(reserva.id, "PENDENTE", status);
          });
          card.appendChild(btnReverter);
        }

        listaReservas.appendChild(card);
      });
    });
}

function abrirFormularioEdicao(card, reserva, filtroAtual) {
  const selectSala = document.createElement("select");
  selectSala.style.cssText =
    "width:100%; padding:8px; margin:6px 0; border:1px solid #ccc; border-radius:6px;";
  salasDisponiveis.forEach(function (sala) {
    const op = document.createElement("option");
    op.value = sala.id;
    op.textContent = sala.nome + " (" + sala.andar + ")";
    if (sala.nome === reserva.nomeSala) op.selected = true;
    selectSala.appendChild(op);
  });

  // Data
  const inputData = document.createElement("input");
  inputData.type = "date";
  inputData.value = reserva.dataReserva;
  inputData.style.cssText =
    "width:100%; padding:8px; margin:6px 0; border:1px solid #ccc; border-radius:6px;";

  // Período de aula
  const selectPeriodo = document.createElement("select");
  selectPeriodo.style.cssText =
    "width:100%; padding:8px; margin:6px 0; border:1px solid #ccc; border-radius:6px;";
  const opDefault = document.createElement("option");
  opDefault.value = "";
  opDefault.textContent = "Selecione um período...";
  opDefault.disabled = true;
  selectPeriodo.appendChild(opDefault);
  periodosDisponiveis.forEach(function (p) {
    const op = document.createElement("option");
    op.value = JSON.stringify({ inicio: p.horarioInicio, fim: p.horarioFim });
    op.textContent =
      p.descricao +
      " (" +
      p.horarioInicio.substring(0, 5) +
      " às " +
      p.horarioFim.substring(0, 5) +
      ")";
    if (
      p.horarioInicio.substring(0, 5) === reserva.horarioInicio.substring(0, 5)
    )
      op.selected = true;
    selectPeriodo.appendChild(op);
  });

  // Container de itens
  const containerItens = document.createElement("div");
  containerItens.style.margin = "8px 0";

  reserva.itens.forEach(function (item) {
    containerItens.appendChild(
      criarLinhaItem(item.dispositivoId, item.quantidadeReservada),
    );
  });

  const btnAddItem = document.createElement("button");
  btnAddItem.type = "button";
  btnAddItem.textContent = "+ Dispositivo";
  btnAddItem.className = "btn-secundario";
  btnAddItem.style.marginBottom = "8px";
  btnAddItem.addEventListener("click", function () {
    containerItens.appendChild(criarLinhaItem(null, 1));
  });

  // Botões salvar/cancelar
  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Salvar";
  btnSalvar.className = "btn-submit";
  btnSalvar.style.cssText = "margin-top:8px; width:auto; padding:8px 20px;";
  btnSalvar.addEventListener("click", function () {
    const linhas = containerItens.querySelectorAll(".linha-item");
    const itens = Array.from(linhas).map(function (linha) {
      return {
        dispositivoId: Number(linha.querySelector(".select-dispositivo").value),
        quantidadeReservada: Number(
          linha.querySelector(".input-quantidade").value,
        ),
      };
    });

    fetch(API + "/reservas/" + reserva.id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({
        salaId: Number(selectSala.value),
        dataReserva: inputData.value,
        horarioInicio: JSON.parse(selectPeriodo.value).inicio,
        horarioFim: JSON.parse(selectPeriodo.value).fim,
        itens: itens,
      }),
    })
      .then(function (response) {
        if (!response.ok)
          return response.json().then((e) => {
            throw new Error(e.mensagem);
          });
        carregarReservas(filtroAtual);
      })
      .catch(function (e) {
        alert("Erro: " + e.message);
      });
  });

  const btnCancelarEdicao = document.createElement("button");
  btnCancelarEdicao.textContent = "Cancelar";
  btnCancelarEdicao.className = "btn-secundario";
  btnCancelarEdicao.style.marginLeft = "8px";
  btnCancelarEdicao.addEventListener("click", function () {
    carregarReservas(filtroAtual);
  });

  // Substitui o conteúdo do card pelo formulário
  card.innerHTML =
    "<strong>Editando reserva de " + reserva.nomeUsuario + "</strong><br>";
  card.appendChild(document.createTextNode("Sala:"));
  card.appendChild(selectSala);
  card.appendChild(document.createTextNode("Data:"));
  card.appendChild(inputData);
  card.appendChild(document.createTextNode("Período:"));
  card.appendChild(selectPeriodo);
  card.appendChild(document.createTextNode("Itens:"));
  card.appendChild(containerItens);
  card.appendChild(btnAddItem);
  card.appendChild(document.createElement("br"));
  card.appendChild(btnSalvar);
  card.appendChild(btnCancelarEdicao);
}

function criarSelectHorario() {
  const select = document.createElement("select");
  select.style.cssText =
    "width:100%; padding:8px; margin:6px 0; border:1px solid #ccc; border-radius:6px;";
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const hh = String(h).padStart(2, "0");
      const mm = String(m).padStart(2, "0");
      const op = document.createElement("option");
      op.value = hh + ":" + mm;
      op.textContent = hh + ":" + mm;
      select.appendChild(op);
    }
  }
  return select;
}

function criarLinhaItem(dispositivoId, quantidade) {
  const linha = document.createElement("div");
  linha.className = "linha-item";

  const select = document.createElement("select");
  select.className = "select-dispositivo";
  select.innerHTML = '<option value="" disabled>Selecione...</option>';
  dispositivosDisponiveis.forEach(function (d) {
    const op = document.createElement("option");
    op.value = d.id;
    op.textContent = d.nome;
    if (d.id === dispositivoId) op.selected = true;
    select.appendChild(op);
  });

  const inputQtd = document.createElement("input");
  inputQtd.type = "number";
  inputQtd.className = "input-quantidade";
  inputQtd.min = "1";
  inputQtd.value = quantidade || 1;

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.textContent = "×";
  btnRemover.className = "btn-remover-item";
  btnRemover.addEventListener("click", function () {
    linha.remove();
  });

  linha.appendChild(select);
  linha.appendChild(inputQtd);
  linha.appendChild(btnRemover);
  return linha;
}

function atualizarStatus(reservaId, novoStatus, filtroAtual) {
  fetch(API + "/reservas/" + reservaId, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ status: novoStatus }),
  }).then(function () {
    carregarReservas(filtroAtual);
  });
}

filtroStatus.addEventListener("change", function () {
  carregarReservas(filtroStatus.value);
});

carregarReservas("todas");
