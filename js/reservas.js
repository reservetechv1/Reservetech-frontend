const token = localStorage.getItem("token");
const saudacao = document.querySelector("#saudacao");
const filtro = document.querySelector("#filtro");

fetch(API + "/usuarios/me", {
  headers: { Authorization: "Bearer " + token },
})
  .then(function (response) {
    return response.json();
  })
  .then(function (usuario) {
    const perfilTexto =
      usuario.perfil === "PROFESSOR" ? "Professor" : "Equipe TI";
    saudacao.textContent =
      "Bem-vindo, " + perfilTexto + " " + usuario.nome + "!";
  });

function carregarReservas(periodo) {
  let url = API + "/reservas/minhas";
  if (periodo && periodo !== "todas") {
    url += "?periodo=" + periodo;
  }

  fetch(url, {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      const listaPendentes = document.querySelector("#lista-pendentes");
      const listaConfirmadas = document.querySelector("#lista-confirmadas");
      listaPendentes.innerHTML = "";
      listaConfirmadas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaPendentes.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva pendente.</p>";
        listaConfirmadas.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva confirmada.</p>";
        return;
      }

      const pendentes = pagina.content
        .filter((r) => r.status === "PENDENTE")
        .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));

      const confirmadas = pagina.content
        .filter((r) => r.status === "CONFIRMADA")
        .sort((a, b) => new Date(a.dataReserva) - new Date(b.dataReserva));

      if (pendentes.length === 0) {
        listaPendentes.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva pendente.</p>";
      } else {
        pendentes.forEach((r) => listaPendentes.appendChild(criarCard(r)));
      }

      if (confirmadas.length === 0) {
        listaConfirmadas.innerHTML =
          "<p style='color:#999; font-size:14px;'>Nenhuma reserva confirmada.</p>";
      } else {
        confirmadas.forEach((r) => listaConfirmadas.appendChild(criarCard(r)));
      }
    });
}

function criarCard(reserva) {
  const card = document.createElement("div");
  card.className = "card-reserva";

  const itensTexto = reserva.itens
    .map(function (item) {
      return item.nomeDispositivo + " (x" + item.quantidadeReservada + ")";
    })
    .join("<br>");

  const dataFormatada = reserva.dataReserva.split("-").reverse().join("/");

  card.innerHTML =
    "<div style='display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; gap:12px;'>" +
    "<span><strong>Sala:</strong> " +
    reserva.nomeSala +
    "</span>" +
    '<span class="status status-' +
    reserva.status.toLowerCase() +
    '">' +
    reserva.status +
    "</span>" +
    "</div>" +
    "<strong>Data:</strong> " +
    dataFormatada +
    "<br>" +
    "<strong>Horário:</strong> " +
    reserva.horarioInicio.substring(0, 5) +
    " às " +
    reserva.horarioFim.substring(0, 5) +
    "<br>" +
    "<strong>Dispositivos:</strong><br>" +
    itensTexto;

  // Botão de cancelar: só aparece se a reserva não está cancelada
  // e o horário de início ainda não passou
  if (reserva.status !== "CANCELADA") {
    const inicioReserva = new Date(
      reserva.dataReserva + "T" + reserva.horarioInicio,
    );
    const agora = new Date();

    if (agora < inicioReserva) {
      const btnCancelar = document.createElement("button");
      btnCancelar.textContent = "Cancelar reserva";
      btnCancelar.className = "btn-cancelar";
      btnCancelar.style.marginTop = "12px";
      btnCancelar.addEventListener("click", function () {
        cancelarReserva(reserva.id);
      });
      card.appendChild(document.createElement("br"));
      card.appendChild(btnCancelar);
    }
  }

  return card;
}

function cancelarReserva(id) {
  if (!confirm("Tem certeza que deseja cancelar esta reserva?")) return;

  fetch(
    API + "/reservas/" + id + "/cancelar",
    {
      method: "PATCH",
      headers: { Authorization: "Bearer " + token },
    },
  )
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao cancelar reserva.");
        });
      }
      return response.json();
    })
    .then(function () {
      alert("Reserva cancelada com sucesso.");
      carregarReservas(filtro.value);
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

filtro.addEventListener("change", function () {
  carregarReservas(filtro.value);
});

carregarReservas("todas");
