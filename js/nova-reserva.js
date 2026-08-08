const token = localStorage.getItem("token");
const selectSala = document.querySelector("#sala");
const selectInicio = document.querySelector("#horario-inicio");
const selectFim = document.querySelector("#horario-fim");
const listaItens = document.querySelector("#lista-itens");
const btnAdicionarItem = document.querySelector("#btn-adicionar-item");
const form = document.querySelector("#form-reserva");
const mensagemErro = document.querySelector("#erro-reserva");

let dispositivosDisponiveis = [];

fetch(API + "/salas", { headers: { Authorization: "Bearer " + token } })
  .then((r) => r.json())
  .then(function (pagina) {
    selectSala.innerHTML =
      '<option value="" disabled selected>Selecione uma sala...</option>';
    pagina.content.forEach(function (sala) {
      const op = document.createElement("option");
      op.value = sala.id;
      op.textContent = sala.nome + " (" + sala.andar + ")";
      selectSala.appendChild(op);
    });
  });

fetch(API + "/periodos", { headers: { Authorization: "Bearer " + token } })
  .then((r) => r.json())
  .then(function (periodos) {
    selectInicio.innerHTML =
      '<option value="" disabled selected>Selecione o início...</option>';
    selectFim.innerHTML =
      '<option value="" disabled selected>Selecione o fim...</option>';

    periodos.forEach(function (periodo) {
      // Select de início — mostra horário de início de cada período
      const opInicio = document.createElement("option");
      opInicio.value = periodo.horarioInicio;
      opInicio.textContent =
        periodo.descricao + " — " + periodo.horarioInicio.substring(0, 5);
      selectInicio.appendChild(opInicio);

      // Select de fim — mostra horário de fim de cada período
      const opFim = document.createElement("option");
      opFim.value = periodo.horarioFim;
      opFim.textContent =
        periodo.descricao + " — " + periodo.horarioFim.substring(0, 5);
      selectFim.appendChild(opFim);
    });
  });

fetch(API + "/dispositivos", { headers: { Authorization: "Bearer " + token } })
  .then((r) => r.json())
  .then(function (pagina) {
    dispositivosDisponiveis = pagina.content;
    criarLinhaItem();
  });

function criarLinhaItem() {
  const linha = document.createElement("div");
  linha.className = "linha-item";

  const select = document.createElement("select");
  select.className = "select-dispositivo";
  select.innerHTML = '<option value="" disabled selected>Selecione...</option>';
  dispositivosDisponiveis.forEach(function (dispositivo) {
    const op = document.createElement("option");
    op.value = dispositivo.id;
    op.textContent = dispositivo.nome;
    select.appendChild(op);
  });

  const inputQuantidade = document.createElement("input");
  inputQuantidade.type = "number";
  inputQuantidade.className = "input-quantidade";
  inputQuantidade.min = "1";
  inputQuantidade.placeholder = "Qtd";
  inputQuantidade.value = "1";

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn-remover-item";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", function () {
    linha.remove();
  });

  linha.appendChild(select);
  linha.appendChild(inputQuantidade);
  linha.appendChild(btnRemover);
  listaItens.appendChild(linha);
}

btnAdicionarItem.addEventListener("click", criarLinhaItem);

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const salaId = selectSala.value;
  const data = document.querySelector("#data").value;
  const horarioInicio = selectInicio.value;
  const horarioFim = selectFim.value;

  if (!horarioInicio || !horarioFim) {
    mensagemErro.textContent = "Selecione o horário de início e fim.";
    return;
  }

  if (horarioInicio >= horarioFim) {
    mensagemErro.textContent = "O horário de fim deve ser depois do início.";
    return;
  }

  const dataAtual = new Date();
  dataAtual.setHours(0, 0, 0, 0);
  const dataEscolhida = new Date(data + "T00:00:00");

  if (dataEscolhida < dataAtual) {
    mensagemErro.textContent = "Não é possível selecionar uma data no passado.";
    return;
  }

  const linhas = document.querySelectorAll(".linha-item");
  const itens = Array.from(linhas).map(function (linha) {
    return {
      dispositivoId: Number(linha.querySelector(".select-dispositivo").value),
      quantidadeReservada: Number(
        linha.querySelector(".input-quantidade").value,
      ),
    };
  });

  const dadosReserva = {
    salaId: Number(salaId),
    dataReserva: data,
    horarioInicio: horarioInicio,
    horarioFim: horarioFim,
    itens: itens,
  };

  fetch(API + "/reservas", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dadosReserva),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem);
        });
      }
      return response.json();
    })
    .then(function () {
      alert("Reserva criada com sucesso!");
      window.location.href = "reservas.html";
    })
    .catch(function (erro) {
      mensagemErro.textContent = erro.message;
    });
});
