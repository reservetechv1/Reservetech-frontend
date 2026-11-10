const token = localStorage.getItem("token");
const listaSalas = document.querySelector("#lista-salas");
const campoBusca = document.querySelector("#busca");
const contador = document.querySelector("#contador");
const semResultados = document.querySelector("#sem-resultados");

// Tira acentos e deixa minúsculo, para "sala 1" achar "Sala 1" e "ate" achar "Até"
function normalizar(texto) {
  return String(texto || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function aplicarFiltro() {
  const termo = normalizar(campoBusca.value.trim());
  const cards = listaSalas.querySelectorAll("[data-busca]");
  let visiveis = 0;

  cards.forEach(function (card) {
    const mostrar = !termo || card.dataset.busca.includes(termo);
    card.style.display = mostrar ? "" : "none";
    if (mostrar) visiveis++;
  });

  semResultados.hidden = !(cards.length > 0 && visiveis === 0);
  contador.textContent = termo
    ? visiveis + " de " + cards.length + " salas"
    : cards.length
      ? cards.length + " salas"
      : "";
}

campoBusca.addEventListener("input", aplicarFiltro);

function carregarSalas() {
  fetch(API + "/salas?size=500&sort=nome", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaSalas.innerHTML = "";

      if (pagina.content.length === 0) {
        listaSalas.innerHTML = "<p>Nenhuma sala cadastrada.</p>";
        contador.textContent = "";
        return;
      }

      pagina.content.forEach(function (sala) {
        listaSalas.appendChild(criarCardSala(sala));
      });
      aplicarFiltro(); // mantém a busca ativa depois de editar ou excluir
    });
}

function criarCardSala(sala) {
  const card = document.createElement("div");
  card.className = "card-reserva";
  card.dataset.busca = normalizar(sala.nome + " " + sala.andar);

  card.innerHTML = "<strong>" + sala.nome + "</strong> — " + sala.andar;

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.className = "btn-editar";
  btnEditar.addEventListener("click", function () {
    abrirEdicao(card, sala);
  });

  const btnDeletar = document.createElement("button");
  btnDeletar.textContent = "Excluir";
  btnDeletar.className = "btn-remover-item";
  btnDeletar.style.width = "auto";
  btnDeletar.style.padding = "6px 12px";
  btnDeletar.addEventListener("click", function () {
    if (confirm("Tem certeza que deseja excluir essa sala?")) {
      deletarSala(sala.id);
    }
  });

  card.appendChild(document.createElement("br"));
  card.appendChild(btnEditar);
  card.appendChild(btnDeletar);

  return card;
}

function criarCampoSala(label, elemento) {
  const div = document.createElement("div");
  div.className = "coleta-dados";
  div.style.marginBottom = "10px";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  div.appendChild(lbl);
  div.appendChild(elemento);
  return div;
}

function abrirEdicao(card, sala) {
  card.innerHTML =
    "<strong style='font-size:15px;'>Editando: " +
    sala.nome +
    "</strong><br><br>";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.value = sala.nome;

  const inputAndar = document.createElement("input");
  inputAndar.type = "text";
  inputAndar.value = sala.andar;

  card.appendChild(criarCampoSala("Nome", inputNome));
  card.appendChild(criarCampoSala("Andar", inputAndar));

  const divBotoes = document.createElement("div");
  divBotoes.style.cssText = "display:flex; gap:8px; margin-top:12px;";

  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Salvar";
  btnSalvar.className = "btn-submit";
  btnSalvar.style.cssText = "width:auto; padding:8px 20px;";
  btnSalvar.addEventListener("click", function () {
    salvarEdicao(sala.id, {
      nome: inputNome.value,
      andar: inputAndar.value,
    });
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.className = "btn-cancelar";
  btnCancelar.addEventListener("click", carregarSalas);

  divBotoes.appendChild(btnSalvar);
  divBotoes.appendChild(btnCancelar);
  card.appendChild(divBotoes);
}

function salvarEdicao(id, dados) {
  fetch(API + "/salas/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dados),
  }).then(function () {
    carregarSalas();
  });
}

function deletarSala(id) {
  fetch(API + "/salas/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) {
        if (response.status === 500 || response.status === 409) {
          throw new Error(
            "Esta sala não pode ser excluída porque já possui reservas vinculadas.",
          );
        }
        return response.json().then((erro) => {
          throw new Error(erro.mensagem || "Erro ao excluir sala.");
        });
      }
      carregarSalas();
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

carregarSalas();
