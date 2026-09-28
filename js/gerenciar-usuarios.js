const token = localStorage.getItem("token");
const listaUsuarios = document.querySelector("#lista-usuarios");
const checkSelecionarTodos = document.querySelector("#check-selecionar-todos");
const btnDesativarSelecionados = document.querySelector(
  "#btn-desativar-selecionados",
);
const btnAtivarSelecionados = document.querySelector(
  "#btn-ativar-selecionados",
);

function carregarUsuarios() {
  fetch(API + "/usuarios?size=500&sort=nome", {
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      return response.json();
    })
    .then(function (pagina) {
      listaUsuarios.innerHTML = "";
      checkSelecionarTodos.checked = false;

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
  card.className =
    "card-reserva card-usuario" +
    (usuario.ativo ? "" : " card-usuario-inativo");

  const perfilTexto = usuario.perfil === "PROFESSOR" ? "Professor" : "TI";
  const statusTexto = usuario.ativo ? "Ativo" : "Desativado";

  const topo = document.createElement("div");
  topo.className = "card-usuario-topo";

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "check-usuario";
  checkbox.dataset.id = usuario.id;

  const infoTexto = document.createElement("span");
  infoTexto.innerHTML =
    "<strong>" +
    usuario.nome +
    "</strong> — " +
    usuario.email +
    "<br>Perfil: " +
    perfilTexto +
    " · Status: <strong>" +
    statusTexto +
    "</strong>";

  topo.appendChild(checkbox);
  topo.appendChild(infoTexto);
  card.appendChild(topo);

  const btnEditar = document.createElement("button");
  btnEditar.textContent = "Editar";
  btnEditar.className = "btn-editar";
  btnEditar.style.width = "auto";
  btnEditar.style.padding = "6px 12px";
  btnEditar.addEventListener("click", function () {
    abrirEdicao(card, usuario);
  });

  const btnStatus = document.createElement("button");
  btnStatus.style.width = "auto";
  btnStatus.style.padding = "6px 12px";
  if (usuario.ativo) {
    btnStatus.textContent = "Desativar";
    btnStatus.className = "btn-cancelar";
    btnStatus.addEventListener("click", function () {
      if (
        confirm(
          "Desativar " +
            usuario.nome +
            "? A pessoa não vai mais conseguir logar, mas o histórico dela é mantido.",
        )
      ) {
        alterarStatus(usuario.id, "desativar");
      }
    });
  } else {
    btnStatus.textContent = "Ativar";
    btnStatus.className = "btn-confirmar";
    btnStatus.addEventListener("click", function () {
      alterarStatus(usuario.id, "ativar");
    });
  }

  const btnRedefinirSenha = document.createElement("button");
  btnRedefinirSenha.textContent = "Redefinir senha";
  btnRedefinirSenha.className = "btn-neutro";
  btnRedefinirSenha.style.width = "auto";
  btnRedefinirSenha.style.padding = "6px 12px";
  btnRedefinirSenha.addEventListener("click", function () {
    abrirRedefinirSenha(card, usuario);
  });

  const btnExcluir = document.createElement("button");
  btnExcluir.textContent = "Excluir";
  btnExcluir.className = "btn-remover-item";
  btnExcluir.style.width = "auto";
  btnExcluir.style.padding = "6px 12px";
  btnExcluir.addEventListener("click", function () {
    if (
      confirm(
        "Excluir " +
          usuario.nome +
          " definitivamente? Isso só funciona se o usuário não tiver nenhuma reserva feita. Se ele já usou o sistema, use Desativar em vez disso.",
      )
    ) {
      excluirUsuario(usuario.id);
    }
  });

  card.appendChild(btnEditar);
  card.appendChild(btnStatus);
  card.appendChild(btnRedefinirSenha);
  card.appendChild(btnExcluir);

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
}

function abrirRedefinirSenha(card, usuario) {
  card.innerHTML =
    "<strong style='font-size:15px;'>Redefinir senha de: " +
    usuario.nome +
    "</strong><br><br>";

  const aviso = document.createElement("p");
  aviso.style.cssText = "font-size:13px; margin-bottom:10px;";
  aviso.textContent =
    "Defina uma senha temporária e repasse para " +
    usuario.nome +
    " por fora do sistema (WhatsApp, e-mail, etc.).";
  card.appendChild(aviso);

  const inputSenha = document.createElement("input");
  inputSenha.type = "text";
  inputSenha.placeholder = "Nova senha (mínimo 6 caracteres)";

  card.appendChild(criarCampoUsuario("Nova senha", inputSenha));

  const divBotoes = document.createElement("div");
  divBotoes.style.cssText = "display:flex; gap:8px; margin-top:12px;";

  const btnSalvar = document.createElement("button");
  btnSalvar.textContent = "Redefinir";
  btnSalvar.className = "btn-submit";
  btnSalvar.style.cssText = "width:auto; padding:8px 20px;";
  btnSalvar.addEventListener("click", function () {
    if (inputSenha.value.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    redefinirSenha(usuario.id, inputSenha.value);
  });

  const btnCancelar = document.createElement("button");
  btnCancelar.textContent = "Cancelar";
  btnCancelar.className = "btn-cancelar";
  btnCancelar.addEventListener("click", carregarUsuarios);

  divBotoes.appendChild(btnSalvar);
  divBotoes.appendChild(btnCancelar);
  card.appendChild(divBotoes);
}

function redefinirSenha(id, novaSenha) {
  fetch(API + "/usuarios/" + id + "/redefinir-senha", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify({ novaSenha: novaSenha }),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao redefinir senha.");
        });
      }
      alert(
        "Senha redefinida com sucesso. Repasse a nova senha para o usuário.",
      );
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert(erro.message);
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

function alterarStatus(id, acao) {
  fetch(API + "/usuarios/" + id + "/" + acao, {
    method: "PATCH",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(
            erro.mensagem || "Erro ao alterar status do usuário.",
          );
        });
      }
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

function excluirUsuario(id) {
  fetch(API + "/usuarios/" + id, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao excluir usuário.");
        });
      }
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

function idsSelecionados() {
  return Array.from(document.querySelectorAll(".check-usuario:checked")).map(
    function (c) {
      return Number(c.dataset.id);
    },
  );
}

function alterarStatusVarios(acao) {
  const ids = idsSelecionados();
  if (ids.length === 0) {
    alert("Selecione ao menos um usuário.");
    return;
  }
  const mensagemConfirmacao =
    acao === "desativar-varios"
      ? "Desativar " + ids.length + " usuário(s) selecionado(s)?"
      : "Ativar " + ids.length + " usuário(s) selecionado(s)?";
  if (acao === "desativar-varios" && !confirm(mensagemConfirmacao)) return;

  fetch(API + "/usuarios/" + acao, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(ids),
  })
    .then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(
            erro.mensagem || "Erro ao alterar os usuários selecionados.",
          );
        });
      }
      carregarUsuarios();
    })
    .catch(function (erro) {
      alert(erro.message);
    });
}

checkSelecionarTodos.addEventListener("change", function () {
  document.querySelectorAll(".check-usuario").forEach(function (c) {
    c.checked = checkSelecionarTodos.checked;
  });
});

btnDesativarSelecionados.addEventListener("click", function () {
  alterarStatusVarios("desativar-varios");
});

btnAtivarSelecionados.addEventListener("click", function () {
  alterarStatusVarios("ativar-varios");
});

carregarUsuarios();
