const token = localStorage.getItem("token");
const listaUsuarios = document.querySelector("#lista-usuarios");

function carregarUsuarios() {
  fetch(API + "/usuarios", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaUsuarios.innerHTML = "";

      if (pagina.content.length === 0) {
        listaUsuarios.innerHTML = "<p>Nenhum usuário cadastrado.</p>";
        return;
      }

      pagina.content.forEach(function (usuario) {
        listaUsuarios.appendChild(criarCardUsuario(usuario));
      });
    });
}

function criarCardUsuario(usuario) {
  const card = document.createElement("div");
  card.className = "card-reserva";

  const perfilTexto = usuario.perfil === "PROFESSOR" ? "Professor" : "TI";

  card.innerHTML =
    "<strong>" +
    usuario.nome +
    "</strong> — " +
    usuario.email +
    "<br>Perfil: " +
    perfilTexto;

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.className = "btn-editar";
  btnEditar.style.width = "auto";
  btnEditar.style.padding = "6px 12px";
  btnEditar.addEventListener("click", function () {
    abrirEdicao(card, usuario);
  });

  const btnDeletar = document.createElement("button");
  btnDeletar.textContent = "Excluir";
  btnDeletar.className = "btn-remover-item";
  btnDeletar.style.width = "auto";
  btnDeletar.style.padding = "6px 12px";
  btnDeletar.addEventListener("click", function () {
    if (confirm("Tem certeza que deseja excluir esse usuário?")) {
      deletarUsuario(usuario.id);
    }
  });

  card.appendChild(document.createElement("br"));
  card.appendChild(btnEditar);
  card.appendChild(btnDeletar);

  return card;
}

function criarCampoUsuario(label, elemento) {
  const div = document.createElement("div");
  div.className = "coleta-dados";
  div.style.marginBottom = "10px";
  const lbl = document.createElement("label");
  lbl.textContent = label;
  div.appendChild(lbl);
  div.appendChild(elemento);
  return div;
}

function abrirEdicao(card, usuario) {
  card.innerHTML =
    "<strong style='font-size:15px;'>Editando: " +
    usuario.nome +
    "</strong><br><br>";

  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.value = usuario.nome;

  const inputEmail = document.createElement("input");
  inputEmail.type = "email";
  inputEmail.value = usuario.email;

  const selectPerfil = document.createElement("select");
  ["PROFESSOR", "TI"].forEach(function (perfil) {
    const opcao = document.createElement("option");
    opcao.value = perfil;
    opcao.textContent = perfil;
    if (perfil === usuario.perfil) opcao.selected = true;
    selectPerfil.appendChild(opcao);
  });

  card.appendChild(criarCampoUsuario("Nome", inputNome));
  card.appendChild(criarCampoUsuario("E-mail", inputEmail));
  card.appendChild(criarCampoUsuario("Perfil", selectPerfil));

  const divBotoes = document.createElement("div");
  divBotoes.style.cssText = "display:flex; gap:8px; margin-top:12px;";

  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Salvar";
  btnSalvar.className = "btn-submit";
  btnSalvar.style.cssText = "width:auto; padding:8px 20px;";
  btnSalvar.addEventListener("click", function () {
    salvarEdicao(usuario.id, {
      nome: inputNome.value,
      email: inputEmail.value,
      perfil: selectPerfil.value,
    });
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.className = "btn-cancelar";
  btnCancelar.addEventListener("click", carregarUsuarios);

  divBotoes.appendChild(btnSalvar);
  divBotoes.appendChild(btnCancelar);
  card.appendChild(divBotoes);

  [].forEach(function (el) {
    card.appendChild(el);
    card.appendChild(document.createElement("br"));
  });
}

function salvarEdicao(id, dados) {
  fetch(API + "/usuarios/" + id, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(dados),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem);
        });
      }
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert("Erro ao salvar: " + erro.message);
    });
}

function deletarUsuario(id) {
  fetch(API + "/usuarios/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) {
        if (response.status === 500 || response.status === 409) {
          throw new Error(
            "Este usuário não pode ser excluído porque já possui reservas vinculadas.",
          );
        }
        return response.json().then((erro) => {
          throw new Error(erro.mensagem || "Erro ao excluir usuário.");
        });
      }
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

carregarUsuarios();
