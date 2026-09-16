const listaUsuariosForm = document.querySelector("#lista-usuarios-form");
const btnAdicionarUsuario = document.querySelector("#btn-adicionar-usuario");
const form = document.querySelector("#form-usuario");
const mensagemErro = document.querySelector("#erro-usuario");

function criarLinhaUsuario() {
  const linha = document.createElement("div");
  linha.className = "linha-multipla";

  const campoNome = document.createElement("div");
  campoNome.className = "coleta-dados";
  campoNome.innerHTML = "<label>Nome</label>";
  const inputNome = document.createElement("input");
  inputNome.type = "text";
  inputNome.className = "input-nome-usuario";
  inputNome.placeholder = "Nome completo";
  inputNome.required = true;
  campoNome.appendChild(inputNome);

  const campoEmail = document.createElement("div");
  campoEmail.className = "coleta-dados";
  campoEmail.innerHTML = "<label>E-mail</label>";
  const inputEmail = document.createElement("input");
  inputEmail.type = "email";
  inputEmail.className = "input-email-usuario";
  inputEmail.placeholder = "email@exemplo.com";
  inputEmail.required = true;
  campoEmail.appendChild(inputEmail);

  const campoSenha = document.createElement("div");
  campoSenha.className = "coleta-dados";
  campoSenha.innerHTML = "<label>Senha</label>";
  const inputSenha = document.createElement("input");
  inputSenha.type = "password";
  inputSenha.className = "input-senha-usuario";
  inputSenha.placeholder = "********";
  inputSenha.required = true;
  campoSenha.appendChild(inputSenha);

  const campoPerfil = document.createElement("div");
  campoPerfil.className = "coleta-dados";
  campoPerfil.innerHTML = "<label>Perfil</label>";
  const selectPerfil = document.createElement("select");
  selectPerfil.className = "select-perfil-usuario";
  selectPerfil.innerHTML =
    '<option value="PROFESSOR">Professor</option>' +
    '<option value="TI">TI</option>';
  campoPerfil.appendChild(selectPerfil);

  const btnRemover = document.createElement("button");
  btnRemover.type = "button";
  btnRemover.className = "btn-remover-item";
  btnRemover.textContent = "×";
  btnRemover.addEventListener("click", function () {
    if (listaUsuariosForm.children.length > 1) {
      linha.remove();
    } else {
      alert("Mantenha ao menos um usuário no formulário.");
    }
  });

  linha.appendChild(campoNome);
  linha.appendChild(campoEmail);
  linha.appendChild(campoSenha);
  linha.appendChild(campoPerfil);
  linha.appendChild(btnRemover);
  listaUsuariosForm.appendChild(linha);
}

btnAdicionarUsuario.addEventListener("click", criarLinhaUsuario);
criarLinhaUsuario();

form.addEventListener("submit", function (evento) {
  evento.preventDefault();
  mensagemErro.textContent = "";

  const linhas = Array.from(
    listaUsuariosForm.querySelectorAll(".linha-multipla"),
  );
  const usuarios = linhas.map(function (linha) {
    return {
      nome: linha.querySelector(".input-nome-usuario").value,
      email: linha.querySelector(".input-email-usuario").value,
      senha: linha.querySelector(".input-senha-usuario").value,
      perfil: linha.querySelector(".select-perfil-usuario").value,
    };
  });

  const requisicoes = usuarios.map(function (usuario) {
    return fetch(API + "/auth/registrar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(usuario),
    }).then(function (response) {
      if (!response.ok) {
        return response.json().then(function (erro) {
          throw new Error(erro.mensagem || "Erro ao cadastrar usuário.");
        });
      }
      return response.json();
    });
  });

  Promise.allSettled(requisicoes).then(function (resultados) {
    let falhas = 0;

    resultados.forEach(function (resultado, i) {
      const linha = linhas[i];
      if (resultado.status === "fulfilled") {
        linha.remove();
      } else {
        falhas++;
        let erroLinha = linha.querySelector(".erro-linha");
        if (!erroLinha) {
          erroLinha = document.createElement("span");
          erroLinha.className = "erro-linha mensagem-erro";
          linha.appendChild(erroLinha);
        }
        erroLinha.textContent = resultado.reason.message;
      }
    });

    const sucesso = resultados.length - falhas;

    if (falhas === 0) {
      alert(sucesso + " usuário(s) cadastrado(s) com sucesso!");
      window.location.href = "painel-ti.html";
    } else {
      mensagemErro.textContent =
        sucesso +
        " usuário(s) cadastrado(s) com sucesso. " +
        falhas +
        " com erro — corrija abaixo e salve novamente.";
      if (listaUsuariosForm.children.length === 0) {
        criarLinhaUsuario();
      }
    }
  });
});
